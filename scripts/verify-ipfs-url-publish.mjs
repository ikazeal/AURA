import {readFileSync} from "node:fs";
import {Wallet} from "ethers";
import undici from "undici";

for(const line of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split(/\r?\n/)){
  const match=line.match(/^([A-Z0-9_]+)=(.*)$/);
  if(match&&!process.env[match[1]])process.env[match[1]]=match[2].trim();
}

const checkpoint=JSON.parse(readFileSync(new URL("../build/production-mint-checkpoint.json",import.meta.url),"utf8"));
const wallet=new Wallet(process.env.AURA_DEPLOYER_PRIVATE_KEY);
const timestamp=Date.now();
const collection="AURA IPFS Pipeline Verification";
const message=`AURA IPFS Publish\nWallet:${wallet.address}\nCollection:${collection}\nTimestamp:${timestamp}`;
const form=new undici.FormData();
form.append("wallet",wallet.address);
form.append("collection",collection);
form.append("timestamp",String(timestamp));
form.append("signature",await wallet.signMessage(message));
form.append("metadata",JSON.stringify([{name:collection,description:"Server-side remote image publishing verification.",attributes:[]}]));
form.append("imageUrls",JSON.stringify([checkpoint.imageUrl]));

const dispatcher=process.env.AURA_OUTBOUND_PROXY?new undici.ProxyAgent(process.env.AURA_OUTBOUND_PROXY):undefined;
const site=(process.env.AURA_PRODUCTION_SITE||"https://aura-tau-azure.vercel.app").replace(/\/$/,"");
const response=await undici.fetch(`${site}/api/publish`,{method:"POST",body:form,...(dispatcher?{dispatcher}:{})});
const result=await response.json();
console.log(JSON.stringify({status:response.status,provider:result.provider,count:result.count,imageURI:result.imageUris?.[0],tokenURI:result.tokenUris?.[0],error:result.error},null,2));
if(!response.ok)process.exit(1);
