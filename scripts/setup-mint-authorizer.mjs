import fs from "node:fs";
import path from "node:path";
import {Wallet} from "ethers";

const envPath=path.join(process.cwd(),".env.local");
let current=fs.existsSync(envPath)?fs.readFileSync(envPath,"utf8"):"";
const existing=current.match(/^AURA_MINT_AUTHORIZER_PRIVATE_KEY=(.+)$/m)?.[1]?.trim();
const wallet=existing?new Wallet(existing):Wallet.createRandom();

function setValue(key,value){
  const line=`${key}=${value}`;
  const pattern=new RegExp(`^${key}=.*$`,`m`);
  current=pattern.test(current)?current.replace(pattern,line):`${current.trimEnd()}${current.trim()?"\n":""}${line}\n`;
}

setValue("AURA_MINT_AUTHORIZER_PRIVATE_KEY",wallet.privateKey);
setValue("AURA_MINT_AUTHORIZER_ADDRESS",wallet.address);
fs.writeFileSync(envPath,current,"utf8");
console.log(JSON.stringify({created:!existing,address:wallet.address,purpose:"AURA V2 server-side mint authorizer",holdsFunds:false},null,2));
