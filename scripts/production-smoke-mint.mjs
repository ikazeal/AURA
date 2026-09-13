import {existsSync,readFileSync} from "node:fs";
import {spawn} from "node:child_process";
import {mkdir,mkdtemp,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {Contract,JsonRpcProvider,Wallet,formatEther} from "ethers";
import undici from "undici";

const {FormData,ProxyAgent,fetch:nodeFetch}=undici;

for(const line of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/)){
  const match=line.match(/^([A-Z0-9_]+)=(.*)$/);
  if(match&&!process.env[match[1]])process.env[match[1]]=match[2].trim();
}

if(process.env.AURA_PRODUCTION_MINT_CONFIRM!=="MINT_ONE_ON_MAINNET"){
  throw new Error("Mainnet mint locked. Set AURA_PRODUCTION_MINT_CONFIRM=MINT_ONE_ON_MAINNET after explicit approval.");
}

const site=(process.env.AURA_PRODUCTION_SITE||"https://aura-ikazeal.vercel.app").replace(/\/$/,"");
const publishSite=(process.env.AURA_PUBLISH_SITE||site).replace(/\/$/,"");
const rpc=process.env.AURA_RPC_URL||"https://rpc.mainnet.chain.robinhood.com";
const contractAddress=process.env.NEXT_PUBLIC_AURA_NFT_CONTRACT;
const privateKey=process.env.AURA_DEPLOYER_PRIVATE_KEY;
if(!contractAddress||!privateKey)throw new Error("Missing collection contract or deployer key");
const dispatcher=process.env.AURA_OUTBOUND_PROXY?new ProxyAgent(process.env.AURA_OUTBOUND_PROXY):undefined;
const networkFetch=(url,init={})=>{
  const hostname=new URL(url).hostname;
  const isLocal=hostname==="127.0.0.1"||hostname==="localhost";
  return nodeFetch(url,{...init,...(dispatcher&&!isLocal?{dispatcher}:{})});
};

async function systemVercelFetch(url,init={}){
  const directory=await mkdtemp(join(tmpdir(),"aura-vercel-"));
  const bodyPath=join(directory,"request.json");
  const body=typeof init.body==="string"?init.body:"";
  await writeFile(bodyPath,body);
  try{return await new Promise((resolveRequest,rejectRequest)=>{
    const method=String(init.method||"GET").toUpperCase();
    const contentType=new Headers(init.headers).get("content-type")||"application/json";
    const child=spawn("powershell.exe",["-NoProfile","-ExecutionPolicy","Bypass","-File",resolve("scripts/vercel-request.ps1"),"-Url",url,"-Method",method,"-BodyPath",bodyPath,"-ContentType",contentType],{windowsHide:true,stdio:["ignore","pipe","pipe"]});
    const stdout=[];const stderr=[];
    child.stdout.on("data",chunk=>stdout.push(chunk));child.stderr.on("data",chunk=>stderr.push(chunk));
    child.on("error",rejectRequest);child.on("close",code=>{
      if(code!==0){rejectRequest(new Error(`VERCEL_TRANSPORT_${code}: ${Buffer.concat(stderr).toString("utf8").slice(0,160)}`));return}
      const output=Buffer.concat(stdout);const marker=Buffer.from("\n__AURA_STATUS__");const divider=output.lastIndexOf(marker);
      if(divider<0){rejectRequest(new Error("VERCEL_TRANSPORT_INVALID_RESPONSE"));return}
      const status=Number(output.subarray(divider+marker.length).toString("ascii"));
      resolveRequest(new Response(output.subarray(0,divider),{status:Number.isInteger(status)&&status>=100?status:502,headers:{"Content-Type":"application/json"}}));
    });
  })}finally{await rm(directory,{recursive:true,force:true})}
}

const provider=new JsonRpcProvider(rpc,4663,{staticNetwork:true});
const signer=new Wallet(privateKey,provider);
const contract=new Contract(contractAddress,[
  "function quoteMint(uint256 quantity) view returns(uint256)",
  "function mintBatchAuthorized(address recipient,string[] tokenURIs,uint256 deadline,bytes authorization) payable returns(uint256)",
],signer);

async function jsonRequest(path,init,base=site){
  const url=`${base}${path}`;
  const useSystemTransport=base.includes("vercel.app")&&!(init?.body instanceof FormData);
  const response=useSystemTransport?await systemVercelFetch(url,init):await networkFetch(url,init);
  const result=await response.json();
  if(!response.ok)throw new Error(`${path} failed (${response.status}): ${result.message||result.error||"UNKNOWN"}`);
  return result;
}

const checkpointPath=resolve("build/production-mint-checkpoint.json");
const reuseCheckpoint=process.env.AURA_USE_IMAGE_CHECKPOINT==="true"&&existsSync(checkpointPath);
console.log("[1/6] Checking production AI service");
const status=reuseCheckpoint
  ? {configured:true,provider:"QuickRouter",model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-2.5-sunburst"}
  : await jsonRequest("/api/generate");
if(!status.configured)throw new Error("Production AI service is not configured");
console.log(`      ${status.provider} / ${status.model}${reuseCheckpoint?" (saved checkpoint)":""}`);

let imageUrl="";
if(reuseCheckpoint){
  const checkpoint=JSON.parse(readFileSync(checkpointPath,"utf8"));
  if(typeof checkpoint.imageUrl!=="string"||!checkpoint.imageUrl.startsWith("http")){
    throw new Error("Saved image checkpoint is invalid");
  }
  imageUrl=checkpoint.imageUrl;
  console.log("[2/6] Reusing the saved paid-AI image checkpoint");
  console.log("[3/6] Collection-ready NFT artwork restored");
}else{
  console.log("[2/6] Generating one AURA identity subject");
  const subject=await jsonRequest("/api/generate",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      mode:"subject",
      count:1,
      style:"premium 3D digital collectible",
      prompt:"An original non-human AURA energy guardian, elegant fox-like spirit silhouette, deep obsidian face visor, luminous mint-green eyes, a radiant four-point star energy core on the chest, pearl white and translucent jade materials, calm heroic personality",
    }),
  });
  const subjectUrl=subject.images?.[0];
  if(!subjectUrl)throw new Error("Subject generation returned no image");

  console.log("[3/6] Generating one collection-ready NFT variant");
  imageUrl=subjectUrl;
  if(process.env.AURA_SKIP_COLLECTION_VARIANT!=="true"){
    const collectionImage=await jsonRequest("/api/generate",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        mode:"collection",
        count:1,
        style:"premium 3D digital collectible",
        referenceImage:subjectUrl,
        prompt:"Genesis edition. Preserve the exact identity, face, silhouette, mint eyes and chest star core. Add refined crystalline armor, subtle aurora lighting and a clean cosmic sanctuary environment. Centered square NFT composition, rare founding-edition quality.",
      }),
    });
    imageUrl=collectionImage.images?.[0];
  }else{
    console.log("      Using the generated identity subject as the Genesis NFT artwork");
  }
}
if(!imageUrl)throw new Error("Collection generation returned no image");
const imageResponse=await networkFetch(imageUrl);
if(!imageResponse.ok)throw new Error(`Unable to download generated image (${imageResponse.status})`);
const imageBlob=await imageResponse.blob();
if(!imageBlob.type.startsWith("image/"))throw new Error("Generated output is not an image");
await mkdir(resolve("build"),{recursive:true});
await writeFile(checkpointPath,JSON.stringify({imageUrl,createdAt:new Date().toISOString()},null,2));

console.log("[4/6] Publishing image and metadata to Pinata IPFS");
const timestamp=Date.now();
const collectionName="AURA Production Genesis";
const message=`AURA IPFS Publish\nWallet:${signer.address}\nCollection:${collectionName}\nTimestamp:${timestamp}`;
const signature=await signer.signMessage(message);
const metadata=[{
  name:"AURA Production Genesis #001",
  description:"The first production verification collectible generated by the AURA AI Collection Engine and minted on Robinhood Mainnet.",
  attributes:[
    {trait_type:"Edition",value:"Production Genesis"},
    {trait_type:"Engine",value:status.model},
    {trait_type:"Network",value:"Robinhood Mainnet"},
    {trait_type:"Rarity",value:"Genesis"},
  ],
}];
const form=new FormData();
form.append("wallet",signer.address);
form.append("collection",collectionName);
form.append("timestamp",String(timestamp));
form.append("signature",signature);
form.append("metadata",JSON.stringify(metadata));
form.append("images",imageBlob,"aura-production-genesis.webp");
const published=await jsonRequest("/api/publish",{method:"POST",body:form},publishSite);
if(published.count!==1||!published.tokenUris?.[0]||!published.authorization)throw new Error("IPFS publisher returned incomplete mint data");
console.log(`      Metadata: ${published.tokenUris[0]}`);

console.log("[5/6] Estimating and submitting Robinhood Mainnet mint");
const total=await contract.quoteMint(1);
const balance=await provider.getBalance(signer.address);
const args=[signer.address,published.tokenUris,published.authorization.deadline,published.authorization.signature];
const gas=await contract.mintBatchAuthorized.estimateGas(...args,{value:total});
const feeData=await provider.getFeeData();
const estimatedGasCost=gas*(feeData.maxFeePerGas||feeData.gasPrice||0n);
if(balance<total+estimatedGasCost)throw new Error(`Insufficient balance. Need about ${formatEther(total+estimatedGasCost)} ETH, have ${formatEther(balance)} ETH`);
console.log(`      Mint: ${formatEther(total)} ETH; estimated gas ceiling: ${formatEther(estimatedGasCost)} ETH`);
const transaction=await contract.mintBatchAuthorized(...args,{value:total,gasLimit:gas*12n/10n});
console.log(`      Transaction: ${transaction.hash}`);

console.log("[6/6] Waiting for onchain confirmation");
const receipt=await transaction.wait(1);
if(!receipt||receipt.status!==1)throw new Error("Mint transaction was not successful");
const result={
  success:true,
  wallet:signer.address,
  contract:contractAddress,
  transactionHash:transaction.hash,
  blockNumber:receipt.blockNumber,
  tokenURI:published.tokenUris[0],
  imageURI:published.imageUris?.[0],
  explorer:`https://explorer.mainnet.chain.robinhood.com/tx/${transaction.hash}`,
};
await writeFile(resolve("build/production-mint-result.json"),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
