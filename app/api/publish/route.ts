import {AbiCoder,Contract,JsonRpcProvider,Wallet,isAddress,keccak256,verifyMessage} from "ethers";

export const runtime="nodejs";
export const maxDuration=300;
export const dynamic="force-dynamic";

const MAX_FILES=50;
const MAX_FILE_BYTES=30*1024*1024;
const SIGNATURE_TTL_MS=5*60*1000;
const AUTHORIZATION_TTL_SECONDS=10*60;
const CONTRACT=process.env.NEXT_PUBLIC_AURA_NFT_CONTRACT||"";
const CONTRACT_VERSION=process.env.NEXT_PUBLIC_AURA_NFT_CONTRACT_VERSION||"1";
const RPC=process.env.AURA_RPC_URL||"https://rpc.mainnet.chain.robinhood.com";

type PinataResponse={data?:{cid?:string};error?:string};

async function issueMintAuthorization(wallet:string,tokenUris:string[]){
  const privateKey=process.env.AURA_MINT_AUTHORIZER_PRIVATE_KEY;
  if(CONTRACT_VERSION!=="2")return undefined;
  if(!privateKey||!isAddress(CONTRACT))throw new Error("MINT_AUTHORIZER_NOT_CONFIGURED");
  const signer=new Wallet(privateKey);
  const provider=new JsonRpcProvider(RPC,4663,{staticNetwork:true});
  const contract=new Contract(CONTRACT,["function name() view returns(string)","function authorizedSigner() view returns(address)","function nonces(address) view returns(uint256)","function quoteMint(uint256) view returns(uint256)"],provider);
  const [name,onchainSigner,nonce,totalPrice]=await Promise.all([contract.name(),contract.authorizedSigner(),contract.nonces(wallet),contract.quoteMint(tokenUris.length)]);
  if(String(onchainSigner).toLowerCase()!==signer.address.toLowerCase())throw new Error("MINT_AUTHORIZER_MISMATCH");
  const deadline=Math.floor(Date.now()/1000)+AUTHORIZATION_TTL_SECONDS;
  const tokenURIsHash=keccak256(AbiCoder.defaultAbiCoder().encode(["string[]"],[tokenUris]));
  const domain={name:String(name),version:"2",chainId:4663,verifyingContract:CONTRACT};
  const types={MintAuthorization:[{name:"payer",type:"address"},{name:"recipient",type:"address"},{name:"tokenURIsHash",type:"bytes32"},{name:"quantity",type:"uint256"},{name:"totalPrice",type:"uint256"},{name:"nonce",type:"uint256"},{name:"deadline",type:"uint256"}]};
  const signature=await signer.signTypedData(domain,types,{payer:wallet,recipient:wallet,tokenURIsHash,quantity:tokenUris.length,totalPrice,nonce,deadline});
  return {deadline,signature,nonce:nonce.toString(),totalPrice:totalPrice.toString()};
}

async function pinFile(file:File,name:string,jwt:string){
  const body=new FormData();
  body.append("network","public");
  body.append("name",name);
  body.append("file",file,name);
  const response=await fetch("https://uploads.pinata.cloud/v3/files",{method:"POST",headers:{Authorization:`Bearer ${jwt}`},body});
  const result=await response.json() as PinataResponse;
  if(!response.ok||!result.data?.cid)throw new Error(result.error||"PINATA_UPLOAD_FAILED");
  return result.data.cid;
}

export async function POST(request:Request){
  if(process.env.AURA_UPLOAD_ENABLED!=="true")return Response.json({error:"UPLOAD_NOT_CONFIGURED"},{status:503});
  const jwt=process.env.PINATA_JWT;
  if(!jwt)return Response.json({error:"STORAGE_NOT_CONFIGURED"},{status:503});
  if(CONTRACT_VERSION==="2"&&(!process.env.AURA_MINT_AUTHORIZER_PRIVATE_KEY||!isAddress(CONTRACT)))return Response.json({error:"MINT_AUTHORIZER_NOT_CONFIGURED"},{status:503});
  try{
    const data=await request.formData();
    const wallet=String(data.get("wallet")||"");
    const collection=String(data.get("collection")||"").slice(0,120);
    const timestamp=Number(data.get("timestamp"));
    const signature=String(data.get("signature")||"");
    const rawMetadata=String(data.get("metadata")||"");
    const images=data.getAll("images").filter((entry):entry is File=>entry instanceof File);
    if(!isAddress(wallet)||!collection||!Number.isFinite(timestamp)||Math.abs(Date.now()-timestamp)>SIGNATURE_TTL_MS)return Response.json({error:"INVALID_REQUEST"},{status:400});
    const message=`AURA IPFS Publish\nWallet:${wallet}\nCollection:${collection}\nTimestamp:${timestamp}`;
    if(verifyMessage(message,signature).toLowerCase()!==wallet.toLowerCase())return Response.json({error:"INVALID_SIGNATURE"},{status:401});
    if(!images.length||images.length>MAX_FILES||images.some(file=>file.size>MAX_FILE_BYTES||!file.type.startsWith("image/")))return Response.json({error:"INVALID_FILES"},{status:400});
    const metadata=JSON.parse(rawMetadata) as Array<Record<string,unknown>>;
    if(!Array.isArray(metadata)||metadata.length!==images.length)return Response.json({error:"INVALID_METADATA"},{status:400});

    const imageUris:string[]=[];
    const tokenUris:string[]=[];
    for(let i=0;i<images.length;i++){
      const number=String(i+1).padStart(4,"0");
      const imageCid=await pinFile(images[i],`${collection}-${number}.${images[i].type.split("/")[1]||"jpg"}`,jwt);
      const imageUri=`ipfs://${imageCid}`;
      imageUris.push(imageUri);
      const jsonFile=new File([JSON.stringify({...metadata[i],image:imageUri},null,2)],`${number}.json`,{type:"application/json"});
      const metadataCid=await pinFile(jsonFile,`${collection}-metadata-${number}.json`,jwt);
      tokenUris.push(`ipfs://${metadataCid}`);
    }
    const authorization=await issueMintAuthorization(wallet,tokenUris);
    return Response.json({provider:"Pinata IPFS",imageUris,tokenUris,count:tokenUris.length,authorization});
  }catch(error){
    console.error("AURA publish failed",error instanceof Error?error.message:error);
    return Response.json({error:"PUBLISH_FAILED"},{status:500});
  }
}
