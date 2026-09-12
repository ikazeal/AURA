import {NextRequest,NextResponse} from "next/server";
import {Contract,EventLog,JsonRpcProvider,formatEther,isAddress} from "ethers";
import {AURA_COLLECTION_ABI} from "../../lib/aura-contract";

const CONTRACT=process.env.NEXT_PUBLIC_AURA_NFT_CONTRACT||"";
const LEGACY_CONTRACT=process.env.NEXT_PUBLIC_AURA_LEGACY_NFT_CONTRACT||"";
const RPC="https://rpc.mainnet.chain.robinhood.com";
const DEPLOYMENT_BLOCK=Number(process.env.NEXT_PUBLIC_AURA_DEPLOYMENT_BLOCK||60267053);
const LEGACY_DEPLOYMENT_BLOCK=Number(process.env.NEXT_PUBLIC_AURA_LEGACY_DEPLOYMENT_BLOCK||60267053);

export const dynamic="force-dynamic";

async function readContractHistory(provider:JsonRpcProvider,wallet:string,address:string,fromBlock:number,version:string){
  const contract=new Contract(address,AURA_COLLECTION_ABI,provider);
  const latest=await provider.getBlockNumber();
  const events:EventLog[]=[];
  for(let from=fromBlock;from<=latest;from+=50000){
    const to=Math.min(latest,from+49999);
    const [paid,received]=await Promise.all([contract.queryFilter(contract.filters.BatchMinted(wallet,null),from,to),contract.queryFilter(contract.filters.BatchMinted(null,wallet),from,to)]);
    events.push(...paid.filter((item):item is EventLog=>item instanceof EventLog),...received.filter((item):item is EventLog=>item instanceof EventLog));
  }
  return [...new Map(events.map(event=>[`${event.transactionHash}-${event.index}`,event])).values()].map(event=>({event,address,version}));
}

async function readHistory(wallet:string){
  const provider=new JsonRpcProvider(RPC,4663,{staticNetwork:true});
  const refs=[{address:CONTRACT,fromBlock:DEPLOYMENT_BLOCK,version:"V2"},...(isAddress(LEGACY_CONTRACT)&&LEGACY_CONTRACT.toLowerCase()!==CONTRACT.toLowerCase()?[{address:LEGACY_CONTRACT,fromBlock:LEGACY_DEPLOYMENT_BLOCK,version:"V1"}]:[])];
  const unique=(await Promise.all(refs.map(ref=>readContractHistory(provider,wallet,ref.address,ref.fromBlock,ref.version)))).flat();
  const timestamps=new Map<number,number>();
  await Promise.all([...new Set(unique.map(item=>item.event.blockNumber))].map(async blockNumber=>{const block=await provider.getBlock(blockNumber);timestamps.set(blockNumber,Number(block?.timestamp||0)*1000)}));
  const mints=unique.map(({event,address,version})=>({key:`${address}-${event.transactionHash}-${event.index}`,contract:address,version,txHash:event.transactionHash,blockNumber:event.blockNumber,timestamp:timestamps.get(event.blockNumber)||0,payer:String(event.args[0]),recipient:String(event.args[1]),firstTokenId:Number(event.args[2]),quantity:Number(event.args[3]),totalPaid:formatEther(event.args[4])})).sort((a,b)=>b.blockNumber-a.blockNumber);
  const tokenRefs=mints.flatMap(mint=>Array.from({length:mint.quantity},(_,index)=>({contract:mint.contract,tokenId:mint.firstTokenId+index})));
  return {wallet,contract:CONTRACT,contracts:refs,mints,tokenRefs};
}

export async function GET(request:NextRequest){
  const wallet=request.nextUrl.searchParams.get("wallet")||"";
  if(!isAddress(wallet))return NextResponse.json({error:"INVALID_WALLET"},{status:400});
  if(!isAddress(CONTRACT))return NextResponse.json({error:"CONTRACT_NOT_CONFIGURED"},{status:503});
  for(let attempt=1;attempt<=3;attempt++)try{return NextResponse.json(await readHistory(wallet))}catch(error){if(attempt===3){console.error("AURA history sync failed",error);return NextResponse.json({error:"RPC_HISTORY_UNAVAILABLE"},{status:502})}}
  return NextResponse.json({error:"RPC_HISTORY_UNAVAILABLE"},{status:502});
}
