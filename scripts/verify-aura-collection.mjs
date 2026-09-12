import fs from "node:fs";
import {Contract,JsonRpcProvider,isAddress} from "ethers";

function readEnv(){
  const values={};
  for(const raw of fs.readFileSync(".env.local","utf8").split(/\r?\n/)){
    const at=raw.indexOf("=");
    if(at>0)values[raw.slice(0,at).trim()]=raw.slice(at+1).trim();
  }
  return values;
}

const env=readEnv();
const address=env.NEXT_PUBLIC_AURA_NFT_CONTRACT;
if(!isAddress(address))throw new Error("NEXT_PUBLIC_AURA_NFT_CONTRACT is missing or invalid");
const rpc=env.AURA_RPC_URL||"https://rpc.mainnet.chain.robinhood.com";
const provider=new JsonRpcProvider(rpc,4663,{staticNetwork:true});
const network=await provider.getNetwork();
if(Number(network.chainId)!==4663)throw new Error(`Expected Robinhood Mainnet 4663, received ${network.chainId}`);
const code=await provider.getCode(address);
if(code==="0x")throw new Error("No contract code exists at the configured address");
const abi=["function name() view returns(string)","function symbol() view returns(string)","function owner() view returns(address)","function maxSupply() view returns(uint256)","function totalMinted() view returns(uint256)","function mintPrice() view returns(uint256)","function quoteMint(uint256) view returns(uint256)","function mintBatch(address,string[]) payable returns(uint256)"];
const contract=new Contract(address,abi,provider);
const [name,symbol,owner,maxSupply,totalMinted,mintPrice,quote]=await Promise.all([contract.name(),contract.symbol(),contract.owner(),contract.maxSupply(),contract.totalMinted(),contract.mintPrice(),contract.quoteMint(8)]);
const simulatedFirstId=await contract.mintBatch.staticCall(owner,["ipfs://aura-verification/metadata.json"],{value:mintPrice,from:owner});
console.log(JSON.stringify({verified:true,chainId:Number(network.chainId),address,codeBytes:(code.length-2)/2,name,symbol,owner,maxSupply:maxSupply.toString(),totalMinted:totalMinted.toString(),mintPriceWei:mintPrice.toString(),quoteFor8Wei:quote.toString(),mintBatchSimulation:true,simulatedFirstTokenId:simulatedFirstId.toString()},null,2));
