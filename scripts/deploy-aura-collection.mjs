import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import {ContractFactory,JsonRpcProvider,Wallet,formatEther,isAddress,parseEther} from "ethers";

const root=process.cwd();
const envPath=path.join(root,".env.local");

function loadEnv(){
  if(!fs.existsSync(envPath))return;
  for(const raw of fs.readFileSync(envPath,"utf8").split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#"))continue;
    const at=line.indexOf("=");
    if(at<1)continue;
    const key=line.slice(0,at).trim();
    let value=line.slice(at+1).trim();
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
    if(!process.env[key])process.env[key]=value;
  }
}

function compile(){
  const sourcePath=path.join(root,"contracts","AuraCollection.sol");
  const input={language:"Solidity",sources:{"contracts/AuraCollection.sol":{content:fs.readFileSync(sourcePath,"utf8")}},settings:{optimizer:{enabled:true,runs:200},outputSelection:{"*":{"*":["abi","evm.bytecode.object"]}}}};
  const output=JSON.parse(solc.compile(JSON.stringify(input),{import:(name)=>{
    const candidates=[path.join(root,name),path.join(root,"node_modules",name)];
    const found=candidates.find(file=>fs.existsSync(file));
    return found?{contents:fs.readFileSync(found,"utf8")}:{error:`Import not found: ${name}`};
  }}));
  const errors=(output.errors||[]).filter(item=>item.severity==="error");
  if(errors.length)throw new Error(errors.map(item=>item.formattedMessage).join("\n"));
  const artifact=output.contracts["contracts/AuraCollection.sol"].AuraCollection;
  return {abi:artifact.abi,bytecode:`0x${artifact.evm.bytecode.object}`};
}

function updateContractAddress(address){
  const line=`NEXT_PUBLIC_AURA_NFT_CONTRACT=${address}`;
  const current=fs.existsSync(envPath)?fs.readFileSync(envPath,"utf8"):"";
  const next=/^NEXT_PUBLIC_AURA_NFT_CONTRACT=.*$/m.test(current)?current.replace(/^NEXT_PUBLIC_AURA_NFT_CONTRACT=.*$/m,line):`${current.trimEnd()}${current.trim()?"\n":""}${line}\n`;
  fs.writeFileSync(envPath,next,"utf8");
}

loadEnv();
const artifact=compile();
console.log(`AuraCollection compiled (${(artifact.bytecode.length-2)/2} deployment bytes).`);
if(process.argv.includes("--compile-only"))process.exit(0);

const network=(process.env.AURA_DEPLOY_NETWORK||"testnet").toLowerCase();
const mainnet=network==="mainnet";
if(!mainnet&&network!=="testnet")throw new Error("AURA_DEPLOY_NETWORK must be testnet or mainnet");
const expectedChainId=mainnet?4663:46630;
const rpcUrl=process.env.AURA_RPC_URL||(mainnet?"https://rpc.mainnet.chain.robinhood.com":"https://rpc.testnet.chain.robinhood.com");
const privateKey=process.env.AURA_DEPLOYER_PRIVATE_KEY;
if(!privateKey)throw new Error("Missing AURA_DEPLOYER_PRIVATE_KEY in .env.local");
if(mainnet&&process.env.AURA_DEPLOY_CONFIRM!=="DEPLOY_MAINNET")throw new Error("Mainnet deployment locked. Set AURA_DEPLOY_CONFIRM=DEPLOY_MAINNET after reviewing all parameters.");

const provider=new JsonRpcProvider(rpcUrl,expectedChainId,{staticNetwork:true});
const detected=await provider.getNetwork();
if(Number(detected.chainId)!==expectedChainId)throw new Error(`Wrong RPC network: expected ${expectedChainId}, received ${detected.chainId}`);
const deployer=new Wallet(privateKey,provider);
const owner=process.env.AURA_COLLECTION_OWNER||deployer.address;
if(!isAddress(owner))throw new Error("AURA_COLLECTION_OWNER is not a valid address");
const name=process.env.AURA_COLLECTION_NAME||"AURA Collection";
const symbol=process.env.AURA_COLLECTION_SYMBOL||"AURA";
const maxSupply=BigInt(process.env.AURA_COLLECTION_MAX_SUPPLY||"1000000");
const mintPrice=parseEther(process.env.AURA_COLLECTION_MINT_PRICE_ETH||"0");
const balance=await provider.getBalance(deployer.address);
const factory=new ContractFactory(artifact.abi,artifact.bytecode,deployer);
const deploymentTx=await factory.getDeployTransaction(name,symbol,maxSupply,mintPrice,owner);
const estimatedGas=await provider.estimateGas({...deploymentTx,from:deployer.address});
const feeData=await provider.getFeeData();
const estimatedCost=estimatedGas*(feeData.maxFeePerGas||feeData.gasPrice||0n);

console.log(JSON.stringify({network,chainId:expectedChainId,deployer:deployer.address,owner,name,symbol,maxSupply:maxSupply.toString(),mintPriceEth:formatEther(mintPrice),balanceEth:formatEther(balance),estimatedGas:estimatedGas.toString(),estimatedMaxGasEth:formatEther(estimatedCost)},null,2));
if(balance<=estimatedCost)throw new Error("Deployer balance is not enough for the estimated deployment gas");

const contract=await factory.deploy(name,symbol,maxSupply,mintPrice,owner);
console.log(`Deployment transaction: ${contract.deploymentTransaction().hash}`);
await contract.waitForDeployment();
const address=await contract.getAddress();
const code=await provider.getCode(address);
if(code==="0x")throw new Error("Deployment receipt completed but no contract code was found");
updateContractAddress(address);
console.log(`AURA Collection deployed: ${address}`);
console.log(`Updated .env.local: NEXT_PUBLIC_AURA_NFT_CONTRACT=${address}`);
console.log(`Explorer: ${mainnet?"https://robinhoodchain.blockscout.com":"https://explorer.testnet.chain.robinhood.com"}/address/${address}`);
