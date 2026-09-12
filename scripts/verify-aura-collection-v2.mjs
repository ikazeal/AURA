import fs from "node:fs";
import {AbiCoder,Contract,JsonRpcProvider,Wallet,isAddress,keccak256} from "ethers";

const env={};
for(const raw of fs.readFileSync(".env.local","utf8").split(/\r?\n/)){
  const at=raw.indexOf("=");if(at>0)env[raw.slice(0,at).trim()]=raw.slice(at+1).trim();
}
const address=env.NEXT_PUBLIC_AURA_NFT_CONTRACT;
if(env.NEXT_PUBLIC_AURA_NFT_CONTRACT_VERSION!=="2")throw new Error("Website is not configured for contract version 2");
if(!isAddress(address))throw new Error("V2 contract address is missing or invalid");
if(!env.AURA_MINT_AUTHORIZER_PRIVATE_KEY)throw new Error("Mint authorizer key is missing");
const provider=new JsonRpcProvider(env.AURA_RPC_URL||"https://rpc.mainnet.chain.robinhood.com",4663,{staticNetwork:true});
const abi=["function name() view returns(string)","function symbol() view returns(string)","function owner() view returns(address)","function authorizedSigner() view returns(address)","function maxSupply() view returns(uint256)","function totalMinted() view returns(uint256)","function mintPrice() view returns(uint256)","function paused() view returns(bool)","function nonces(address) view returns(uint256)","function quoteMint(uint256) view returns(uint256)","function mintBatchAuthorized(address,string[],uint256,bytes) payable returns(uint256)"];
const contract=new Contract(address,abi,provider);
const code=await provider.getCode(address);
if(code==="0x")throw new Error("No contract code exists at the configured V2 address");
const [name,symbol,owner,authorizedSigner,maxSupply,totalMinted,mintPrice,paused]=await Promise.all([contract.name(),contract.symbol(),contract.owner(),contract.authorizedSigner(),contract.maxSupply(),contract.totalMinted(),contract.mintPrice(),contract.paused()]);
const authorizer=new Wallet(env.AURA_MINT_AUTHORIZER_PRIVATE_KEY);
if(authorizer.address.toLowerCase()!==String(authorizedSigner).toLowerCase())throw new Error("Configured authorizer does not match the contract");
const payer=owner;
const payerNonce=await contract.nonces(payer);
const tokenURIs=["ipfs://aura-v2-verification/metadata.json"];
const totalPrice=await contract.quoteMint(tokenURIs.length);
const deadline=Math.floor(Date.now()/1000)+600;
const tokenURIsHash=keccak256(AbiCoder.defaultAbiCoder().encode(["string[]"],[tokenURIs]));
const types={MintAuthorization:[{name:"payer",type:"address"},{name:"recipient",type:"address"},{name:"tokenURIsHash",type:"bytes32"},{name:"quantity",type:"uint256"},{name:"totalPrice",type:"uint256"},{name:"nonce",type:"uint256"},{name:"deadline",type:"uint256"}]};
const signature=await authorizer.signTypedData({name,version:"2",chainId:4663,verifyingContract:address},types,{payer,recipient:payer,tokenURIsHash,quantity:tokenURIs.length,totalPrice,nonce:payerNonce,deadline});
const simulatedFirstTokenId=await contract.mintBatchAuthorized.staticCall(payer,tokenURIs,deadline,signature,{from:payer,value:totalPrice});
console.log(JSON.stringify({verified:true,chainId:4663,address,codeBytes:(code.length-2)/2,name,symbol,owner,authorizedSigner,maxSupply:maxSupply.toString(),totalMinted:totalMinted.toString(),mintPriceWei:mintPrice.toString(),paused,authorizationSimulation:true,simulatedFirstTokenId:simulatedFirstTokenId.toString()},null,2));
