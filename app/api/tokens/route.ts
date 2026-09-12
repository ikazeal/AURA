import {NextRequest,NextResponse} from "next/server";
import {Contract,JsonRpcProvider,isAddress} from "ethers";
import {AURA_COLLECTION_ABI} from "../../lib/aura-contract";

const CONTRACT=process.env.NEXT_PUBLIC_AURA_NFT_CONTRACT||"";
const LEGACY_CONTRACT=process.env.NEXT_PUBLIC_AURA_LEGACY_NFT_CONTRACT||"";
const RPC=process.env.AURA_RPC_URL||"https://rpc.mainnet.chain.robinhood.com";
const IPFS_GATEWAY="https://gateway.pinata.cloud/ipfs/";

export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=60;

function gatewayUrl(uri:string){return uri.startsWith("ipfs://")?`${IPFS_GATEWAY}${uri.slice(7)}`:uri}

export async function GET(request:NextRequest){
  const requested=request.nextUrl.searchParams.get("contract")||CONTRACT;
  const allowed=[CONTRACT,LEGACY_CONTRACT].filter(isAddress).map(address=>address.toLowerCase());
  if(!isAddress(requested)||!allowed.includes(requested.toLowerCase()))return NextResponse.json({error:"CONTRACT_NOT_CONFIGURED"},{status:503});
  const tokenIds=[...new Set((request.nextUrl.searchParams.get("ids")||"").split(",").map(Number).filter(id=>Number.isInteger(id)&&id>0&&id<=1_000_000))].slice(0,100);
  if(!tokenIds.length)return NextResponse.json({tokens:[]});
  try{
    const provider=new JsonRpcProvider(RPC,4663,{staticNetwork:true});
    const contract=new Contract(requested,AURA_COLLECTION_ABI,provider);
    const tokens=await Promise.all(tokenIds.map(async tokenId=>{
      const tokenUri=String(await contract.tokenURI(tokenId));
      try{
        const response=await fetch(gatewayUrl(tokenUri),{signal:AbortSignal.timeout(10000)});
        if(!response.ok)throw new Error("METADATA_UNAVAILABLE");
        const metadata=await response.json() as {name?:string;description?:string;image?:string;attributes?:Array<{trait_type?:string;value?:string|number}>};
        return {contract:requested,tokenId,tokenUri,metadataUrl:gatewayUrl(tokenUri),name:metadata.name||`AURA #${tokenId}`,description:metadata.description||"",image:metadata.image?gatewayUrl(metadata.image):"",attributes:Array.isArray(metadata.attributes)?metadata.attributes:[]};
      }catch{return {contract:requested,tokenId,tokenUri,metadataUrl:gatewayUrl(tokenUri),name:`AURA #${tokenId}`,description:"Metadata 已上链，公共网关正在同步。",image:"",attributes:[]}}
    }));
    return NextResponse.json({tokens},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=600"}});
  }catch(error){
    console.error("AURA token metadata sync failed",error);
    return NextResponse.json({error:"TOKEN_METADATA_UNAVAILABLE"},{status:502});
  }
}
