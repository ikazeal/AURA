import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const root=process.cwd();
const sourcePath=path.join(root,"contracts","AuraCollectionV2.sol");
const input={language:"Solidity",sources:{"contracts/AuraCollectionV2.sol":{content:fs.readFileSync(sourcePath,"utf8")}},settings:{optimizer:{enabled:true,runs:200},outputSelection:{"*":{"*":["abi","evm.bytecode.object","evm.deployedBytecode.object"]}}}};
const output=JSON.parse(solc.compile(JSON.stringify(input),{import:(name)=>{
  const candidates=[path.join(root,name),path.join(root,"node_modules",name)];
  const found=candidates.find(file=>fs.existsSync(file));
  return found?{contents:fs.readFileSync(found,"utf8")}:{error:`Import not found: ${name}`};
}}));
for(const item of output.errors||[])console[item.severity==="error"?"error":"warn"](item.formattedMessage);
const errors=(output.errors||[]).filter(item=>item.severity==="error");
if(errors.length)process.exit(1);
const artifact=output.contracts["contracts/AuraCollectionV2.sol"].AuraCollectionV2;
const deploymentBytes=artifact.evm.bytecode.object.length/2;
const runtimeBytes=artifact.evm.deployedBytecode.object.length/2;
if(runtimeBytes>24576)throw new Error(`Runtime bytecode exceeds EIP-170: ${runtimeBytes} bytes`);
console.log(JSON.stringify({contract:"AuraCollectionV2",deploymentBytes,runtimeBytes,maxBatchSize:50,authorization:"EIP-712",replayProtection:"per-payer nonce",emergencyPause:true},null,2));
