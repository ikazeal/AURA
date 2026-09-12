import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {setDefaultResultOrder} from "node:dns";
import {fetch as nodeFetch} from "undici";
import {spawn} from "node:child_process";
import {mkdtemp,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";

setDefaultResultOrder("ipv4first");

function loadLocalEnv(){
  try{for(const line of readFileSync(resolve(process.cwd(),".env.local"),"utf8").split(/\r?\n/)){const match=line.match(/^([A-Z0-9_]+)=(.*)$/);if(match&&!process.env[match[1]])process.env[match[1]]=match[2].trim()}}catch{}
}

loadLocalEnv();
const host=process.env.AURA_AI_PROXY_HOST||"127.0.0.1";
const port=Number(process.env.AURA_AI_PROXY_PORT||3011);
const apiBase=(process.env.AURA_AI_BASE_URL||"https://api.quickrouter.ai/v1").replace(/\/$/,"");
const token=process.env.QUICKROUTER_API_KEY||process.env.OPENAI_API_KEY||"";
const outboundProxy=process.env.AURA_OUTBOUND_PROXY||"";
const powershellScript=resolve("scripts/quickrouter-request.ps1");

async function systemProxyFetch(url,body,contentType){
  const directory=await mkdtemp(join(tmpdir(),"aura-ai-"));
  const bodyPath=join(directory,"request.json");
  await writeFile(bodyPath,body);
  try{return await new Promise((resolveRequest,rejectRequest)=>{
    const child=spawn("powershell.exe",["-NoProfile","-ExecutionPolicy","Bypass","-File",powershellScript,"-Url",url,"-BodyPath",bodyPath,"-ContentType",contentType],{windowsHide:true,stdio:["ignore","pipe","pipe"]});
    const stdout=[];const stderr=[];
    child.stdout.on("data",chunk=>stdout.push(chunk));child.stderr.on("data",chunk=>stderr.push(chunk));
    child.on("error",rejectRequest);child.on("close",code=>{if(code!==0){rejectRequest(new Error(`SYSTEM_PROXY_${code}: ${Buffer.concat(stderr).toString("utf8").slice(0,160)}`));return}const output=Buffer.concat(stdout);const marker=Buffer.from("\n__AURA_STATUS__");const divider=output.lastIndexOf(marker);const status=Number(output.subarray(divider+marker.length).toString("ascii"));resolveRequest(new Response(output.subarray(0,divider),{status:Number.isInteger(status)&&status>=100?status:502,headers:{"Content-Type":"application/json"}}))});
  })}finally{await rm(directory,{recursive:true,force:true})}
}

const server=createServer(async(request,response)=>{
  response.setHeader("Content-Type","application/json; charset=utf-8");
  if(request.method==="GET"&&request.url==="/health"){response.end(JSON.stringify({ok:Boolean(token),provider:"QuickRouter"}));return}
  const match=request.url?.match(/^\/v1\/images\/(generations|edits)$/);
  if(request.method!=="POST"||!match){response.statusCode=404;response.end(JSON.stringify({error:"NOT_FOUND"}));return}
  if(!token){response.statusCode=503;response.end(JSON.stringify({error:"AI_NOT_CONFIGURED"}));return}
  try{
    const chunks=[];let size=0;
    for await(const chunk of request){size+=chunk.length;if(size>18*1024*1024)throw new Error("REQUEST_TOO_LARGE");chunks.push(chunk)}
    const requestBody=Buffer.concat(chunks);const contentType=request.headers["content-type"]||"application/json";
    const upstream=outboundProxy?await systemProxyFetch(`${apiBase}/images/${match[1]}`,requestBody,contentType):await nodeFetch(`${apiBase}/images/${match[1]}`,{method:"POST",headers:{Accept:"application/json",Authorization:`Bearer ${token}`,"Content-Type":contentType},body:requestBody,signal:AbortSignal.timeout(180_000)});
    response.statusCode=upstream.status;
    response.end(Buffer.from(await upstream.arrayBuffer()));
  }catch(error){
    const message=error instanceof Error?error.message:"AI_PROXY_FAILED";
    const cause=error instanceof Error&&error.cause&&typeof error.cause==="object"?error.cause:null;
    console.error("[AURA AI gateway]",message,cause&&"code" in cause?String(cause.code):"");
    response.statusCode=message==="REQUEST_TOO_LARGE"?413:502;
    response.end(JSON.stringify({error:"AI_PROXY_FAILED",message:message.slice(0,160)}));
  }
});

server.listen(port,host,()=>console.log(`[AURA AI gateway] ready at http://${host}:${port}`));
for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>server.close(()=>process.exit(0)));
