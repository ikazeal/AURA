const DEFAULT_API_BASE_URL="https://api.openai.com/v1";
const DEFAULT_MODEL="gpt-image-2.5-sunburst";
const MAX_IMAGES=4;
// QuickRouter returns image payloads as large base64 strings. Keep each worker
// response to one image and let the browser coordinate the batch, otherwise a
// 4-8 image JSON response can exceed the local/edge runtime response budget.
const UPSTREAM_BATCH_SIZE=1;
const MAX_REFERENCE_BYTES=12*1024*1024;
const WINDOW_MS=10*60*1000;
const MAX_WEIGHT_PER_WINDOW=24;

export const runtime="nodejs";
export const maxDuration=300;
export const dynamic="force-dynamic";

type GenerateRequest={
  mode?:"subject"|"collection";
  prompt?:string;
  style?:string;
  count?:number;
  referenceImage?:string;
};

type OpenAIImageResponse={
  data?:Array<{b64_json?:string;url?:string}>;
  error?:{message?:string;code?:string};
};

const requestWindows=new Map<string,{startedAt:number;weight:number}>();

function clientId(request:Request){
  return request.headers.get("cf-connecting-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"local";
}

function consumeQuota(request:Request,weight:number){
  const id=clientId(request);
  const now=Date.now();
  const current=requestWindows.get(id);
  if(!current||now-current.startedAt>WINDOW_MS){requestWindows.set(id,{startedAt:now,weight});return true}
  if(current.weight+weight>MAX_WEIGHT_PER_WINDOW)return false;
  current.weight+=weight;
  return true;
}

function apiKey(){return process.env.QUICKROUTER_API_KEY||process.env.OPENAI_API_KEY||""}
function apiBaseUrl(){return (process.env.AURA_AI_BASE_URL||DEFAULT_API_BASE_URL).replace(/\/$/,"")}
function providerName(){return process.env.AURA_AI_PROVIDER||(/quickrouter/i.test(apiBaseUrl())?"QuickRouter":"OpenAI")}
function imageApiUrl(path:"generations"|"edits"){return `${apiBaseUrl()}/images/${path}`}

async function imageProviderFetch(path:"generations"|"edits",init:RequestInit){
  // The helper proxy only exists on the Windows development machine. Vercel
  // Functions must call the configured image provider directly.
  const proxy=process.env.VERCEL?"":process.env.AURA_AI_PROXY_URL?.replace(/\/$/,"");
  if(!proxy)return fetch(imageApiUrl(path),init);
  const headers=new Headers(init.headers);headers.delete("Authorization");
  return fetch(`${proxy}/v1/images/${path}`,{...init,headers});
}

function openAIHeaders(){
  const headers:Record<string,string>={Authorization:`Bearer ${apiKey()}`,Accept:"application/json"};
  if(process.env.OPENAI_ORG_ID)headers["OpenAI-Organization"]=process.env.OPENAI_ORG_ID;
  if(process.env.OPENAI_PROJECT_ID)headers["OpenAI-Project"]=process.env.OPENAI_PROJECT_ID;
  return headers;
}

async function normalizeImage(item:{b64_json?:string;url?:string}){
  if(item.b64_json)return `data:image/webp;base64,${item.b64_json}`;
  return item.url||null;
}

function productionPrompt(mode:"subject"|"collection",prompt:string,style:string){
  const common="Create a premium square NFT artwork. No words, letters, logos, signatures, frames, UI, or watermarks. Keep the composition clear at thumbnail size.";
  if(mode==="subject")return `${common} Design one distinctive, original, non-human collectible character from this brief: ${prompt}. Show exactly one complete centered subject, front three-quarter view, clean background, strong silhouette, coherent materials, professional ${style||"digital collectible"} art direction. This image will become the locked identity reference for a consistent NFT collection.`;
  return `${common} Use the supplied image as the locked identity reference. Preserve the subject's face, silhouette, proportions, signature colors and core brand marks exactly. Produce one new collectible variant in ${style||"digital collectible"} style. Creative direction: ${prompt}. Change only traits such as outfit, accessory, material, lighting and environment. Exactly one subject, consistent camera, production-ready collection quality.`;
}

async function getReferenceImage(value:string,request:Request){
  const url=value.startsWith("data:")?value:new URL(value,request.url).toString();
  const response=await fetch(url);
  if(!response.ok)throw new Error("REFERENCE_FETCH_FAILED");
  const blob=await response.blob();
  if(!blob.type.startsWith("image/")||blob.size>MAX_REFERENCE_BYTES)throw new Error("INVALID_REFERENCE_IMAGE");
  const extension=blob.type.includes("webp")?"webp":blob.type.includes("jpeg")||blob.type.includes("jpg")?"jpg":"png";
  return {blob,filename:`aura-reference.${extension}`};
}

export async function GET(){
  const configured=process.env.AURA_AI_IMAGE_ENABLED!=="false"&&Boolean(apiKey());
  return Response.json({configured,provider:providerName(),model:process.env.OPENAI_IMAGE_MODEL||DEFAULT_MODEL,maxImages:MAX_IMAGES,batchSize:UPSTREAM_BATCH_SIZE});
}

export async function POST(request:Request){
  if(process.env.AURA_AI_IMAGE_ENABLED==="false"||!apiKey())return Response.json({error:"AI_NOT_CONFIGURED"},{status:503});
  try{
    const body=await request.json() as GenerateRequest;
    const mode=body.mode==="collection"?"collection":"subject";
    const prompt=String(body.prompt||"").trim().slice(0,1200);
    const style=String(body.style||"").trim().slice(0,120);
    const count=Math.max(1,Math.min(UPSTREAM_BATCH_SIZE,Math.floor(Number(body.count)||1)));
    if(prompt.length<3)return Response.json({error:"PROMPT_REQUIRED"},{status:400});
    if(!consumeQuota(request,count))return Response.json({error:"AI_RATE_LIMITED"},{status:429});

    const model=process.env.OPENAI_IMAGE_MODEL||DEFAULT_MODEL;
    const finalPrompt=productionPrompt(mode,prompt,style);
    let response:Response;
    if(mode==="collection"&&body.referenceImage){
      const form=new FormData();
      form.append("model",model);
      form.append("prompt",finalPrompt);
      form.append("n",String(count));
      form.append("size","1024x1024");
      form.append("quality",process.env.OPENAI_IMAGE_QUALITY||"medium");
      // QuickRouter accepts `response_format` for image edits, but rejects the
      // generations-only `format` field in multipart edit requests.
      if(providerName()==="QuickRouter")form.append("response_format","url");
      else{form.append("output_format","webp");form.append("output_compression","82")}
      const reference=await getReferenceImage(body.referenceImage,request);
      form.append("image",reference.blob,reference.filename);
      response=await imageProviderFetch("edits",{method:"POST",headers:openAIHeaders(),body:form});
    }else{
      const outputOptions=providerName()==="QuickRouter"?{format:"webp",response_format:"url"}:{output_format:"webp",output_compression:82};
      response=await imageProviderFetch("generations",{method:"POST",headers:{...openAIHeaders(),"Content-Type":"application/json"},body:JSON.stringify({model,prompt:finalPrompt,n:count,size:"1024x1024",quality:process.env.OPENAI_IMAGE_QUALITY||"medium",...outputOptions})});
    }

    const contentType=response.headers.get("content-type")||"";
    if(!contentType.includes("application/json")){
      console.error("AI image provider returned a non-JSON response",response.status,contentType);
      return Response.json({error:"AI_PROVIDER_INVALID_RESPONSE"},{status:502});
    }
    const result=await response.json() as OpenAIImageResponse;
    if(!response.ok){
      console.error("OpenAI image generation failed",response.status,result.error?.code||"UNKNOWN");
      return Response.json({error:result.error?.code||"OPENAI_IMAGE_FAILED",message:result.error?.message?.slice(0,240)},{status:response.status});
    }
    const images=(await Promise.all((result.data||[]).map(normalizeImage))).filter((image):image is string=>Boolean(image));
    if(!images.length)return Response.json({error:"OPENAI_EMPTY_RESULT"},{status:502});
    return Response.json({provider:providerName(),model,images,count:images.length});
  }catch(error){
    const message=error instanceof Error?error.message:"UNKNOWN";
    const status=message.includes("REFERENCE")?400:500;
    console.error("AURA AI generation failed",message);
    return Response.json({error:message==="INVALID_REFERENCE_IMAGE"?message:"AI_GENERATION_FAILED"},{status});
  }
}
