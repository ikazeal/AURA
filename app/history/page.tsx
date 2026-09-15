"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import SiteHeader from "../components/SiteHeader";
import {useWallet} from "../components/WalletProvider";
import {ROBINHOOD_EXPLORER} from "../lib/aura-contract";
import {CreationHistoryRecord,readCreationHistory} from "../lib/creation-history";

type ChainMint={key:string;contract:string;version:string;txHash:string;blockNumber:number;timestamp:number;payer:string;recipient:string;firstTokenId:number;quantity:number;totalPaid:string};
type ChainToken={contract:string;tokenId:number;tokenUri:string;metadataUrl:string;name:string;description:string;image:string;attributes:Array<{trait_type?:string;value?:string|number}>};

export default function HistoryPage(){
  const {wallet,rememberedWallet,connected,openWallets}=useWallet();
  const recordWallet=wallet||rememberedWallet;
  const [creations,setCreations]=useState<CreationHistoryRecord[]>([]);
  const [mints,setMints]=useState<ChainMint[]>([]);
  const [tokens,setTokens]=useState<ChainToken[]>([]);
  const [tokensLoading,setTokensLoading]=useState(false);
  const [selectedToken,setSelectedToken]=useState<ChainToken|null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{const timer=window.setTimeout(()=>setCreations(readCreationHistory()),0);return()=>window.clearTimeout(timer)},[]);
  const loadMints=useCallback(async()=>{
    if(!recordWallet)return;
    const cacheKey=`aura-chain-history-${recordWallet.toLowerCase()}`;
    let hasCachedRecords=false;
    try{const cached=JSON.parse(localStorage.getItem(cacheKey)||"{}") as {mints?:ChainMint[];tokens?:ChainToken[]};if(cached.mints?.length){setMints(cached.mints);hasCachedRecords=true}if(cached.tokens?.length)setTokens(cached.tokens)}catch{localStorage.removeItem(cacheKey)}
    setLoading(!hasCachedRecords);setError("");
    try{
      const response=await fetch(`/api/history?wallet=${encodeURIComponent(recordWallet)}`,{cache:"no-store"});
      const result=await response.json() as {mints?:ChainMint[];tokenRefs?:Array<{contract:string;tokenId:number}>};
      if(!response.ok||!result.mints)throw new Error("HISTORY_UNAVAILABLE");
      setMints(result.mints);
      try{const previous=JSON.parse(localStorage.getItem(cacheKey)||"{}") as {tokens?:ChainToken[]};localStorage.setItem(cacheKey,JSON.stringify({mints:result.mints,tokens:previous.tokens||[]}))}catch(error){console.debug("AURA history cache unavailable",error)}
      setLoading(false);
      if(result.tokenRefs?.length){
        setTokensLoading(true);
        try{const groups=new Map<string,number[]>();for(const ref of result.tokenRefs){groups.set(ref.contract,[...(groups.get(ref.contract)||[]),ref.tokenId])}const batches=await Promise.all([...groups].map(async([contract,ids])=>{const tokenResponse=await fetch(`/api/tokens?contract=${encodeURIComponent(contract)}&ids=${ids.join(",")}`);if(!tokenResponse.ok)return [];const tokenResult=await tokenResponse.json() as {tokens?:ChainToken[]};return tokenResult.tokens||[]}));const nextTokens=batches.flat();setTokens(nextTokens);try{localStorage.setItem(cacheKey,JSON.stringify({mints:result.mints,tokens:nextTokens}))}catch(error){console.debug("AURA token cache unavailable",error)}}catch{if(!hasCachedRecords)setTokens([])}finally{setTokensLoading(false)}
      }else setTokens([]);
    }catch{setError("Robinhood Mainnet activity is temporarily unavailable. Please refresh shortly.")}
    finally{setLoading(false)}
  },[recordWallet]);

  useEffect(()=>{if(!recordWallet)return;const timer=window.setTimeout(()=>void loadMints(),0);return()=>window.clearTimeout(timer)},[recordWallet,loadMints]);
  const visibleCreations=useMemo(()=>creations.filter(item=>!item.wallet||!wallet||item.wallet.toLowerCase()===wallet.toLowerCase()),[creations,wallet]);
  const mintedCount=mints.reduce((sum,item)=>sum+item.quantity,0);

  return <main className="history-page"><SiteHeader/>
    <section className="history-hero"><div><span>MY AURA / ROBINHOOD MAINNET</span><h1>Creations & onchain activity</h1><p>Local creation history and wallet mint activity are kept separately and cross-checked.</p></div>{recordWallet?<button onClick={loadMints} disabled={loading}>{loading?"Syncing onchain activity…":"Refresh onchain activity ↻"}</button>:<button onClick={openWallets}>Connect wallet to view history →</button>}</section>
    <section className="history-shell">
      <div className="history-stats"><article><small>LOCAL CREATIONS</small><b>{visibleCreations.length}</b><span>Creation projects saved on this device</span></article><article><small>ONCHAIN NFTS</small><b>{recordWallet?mintedCount:"—"}</b><span>NFTs minted by this wallet</span></article><article><small>MINT TRANSACTIONS</small><b>{recordWallet?mints.length:"—"}</b><span>Robinhood Mainnet transactions</span></article><article><small>NETWORK</small><b className="network-value"><i/>4663</b><span>Robinhood Mainnet</span></article></div>
      <div className="history-columns">
        <section><header><div><span>CREATION HISTORY</span><h2>My creations</h2></div><a href="/studio">Create a new collection →</a></header>{visibleCreations.length?<div className="creation-list">{visibleCreations.map(item=><article className={item.status==="minted"?"minted-record":""} key={item.id}>{item.cover?<img src={item.cover} alt=""/>:<div className="history-placeholder">A</div>}<div><small>{new Date(item.createdAt).toLocaleString("en-US")}</small><h3>{item.collection}</h3><p>{item.prompt}</p><span>{item.style}  · target {item.targetAmount.toLocaleString()}  items ·  {item.previewCount}  previews</span></div><div className="creation-record-state"><b className={item.status}>{item.status==="minted"?"✓ Onchain":"Generated"}</b>{item.status==="minted"?<span className="creation-locked">Published · cannot be minted again</span>:<a className="creation-reopen" href={`/studio?restore=${encodeURIComponent(item.id)}`}>Continue upload / Mint →</a>}{item.txHash&&<a href={`${ROBINHOOD_EXPLORER}/tx/${item.txHash}`} target="_blank" rel="noreferrer">View record ↗</a>}</div></article>)}</div>:<div className="history-empty"><i>✦</i><b>No local creations yet</b><p>Create your first collection in Studio and it will appear here automatically.</p><a href="/studio">Launch studio →</a></div>}</section>
        <section><header><div><span>ONCHAIN ACTIVITY</span><h2>Mint records</h2></div>{recordWallet&&<small>{loading&&mints.length?"Updating in background · ":""}{recordWallet.slice(0,6)}…{recordWallet.slice(-4)}{!connected?"  · last connected":""}</small>}</header>{!recordWallet?<div className="history-empty"><i>⌁</i><b>Connect your wallet to read onchain history</b><p>Records come directly from AURA Collection BatchMinted events.</p><button onClick={openWallets}>Connect a Robinhood Mainnet wallet</button></div>:loading&&!mints.length?<div className="history-loading"><i/><b>Syncing Robinhood Mainnet</b><span>Reading contract events and block timestamps</span></div>:error&&!mints.length?<div className="history-empty"><b>{error}</b><button onClick={loadMints}>Reload</button></div>:mints.length?<div className="mint-history-list">{mints.map(item=><a href={`${ROBINHOOD_EXPLORER}/tx/${item.txHash}`} target="_blank" rel="noreferrer" key={item.key}><div className="mint-token-stack"><i>#{item.firstTokenId}</i><i>+{item.quantity}</i></div><div><small>{item.timestamp?new Date(item.timestamp).toLocaleString("en-US"):`Block ${item.blockNumber}`}</small><h3>{item.version} · Mint {item.quantity}  NFTs</h3><p>Token #{item.firstTokenId}{item.quantity>1?`–#${item.firstTokenId+item.quantity-1}`:""} · {item.totalPaid} ETH</p></div><span>View transaction ↗</span></a>)}</div>:<div className="history-empty"><i>◇</i><b>No mint records for this wallet</b><p>After your first mint, the transaction will appear here automatically.</p></div>}</section>
      </div>
      <section className="onchain-gallery-section"><header><div><span>ONCHAIN COLLECTION</span><h2>Onchain works</h2><p>AURA V1 and V2 works are preserved. Transactions appear first while images and metadata resolve in the background.</p></div><div className="market-status"><i/> OpenSea · Robinhood Chain supported</div></header>{tokens.length?<div className="onchain-token-grid">{tokens.map(token=><button key={`${token.contract}-${token.tokenId}`} onClick={()=>setSelectedToken(token)}><div>{token.image?<img src={token.image} alt={token.name}/>:<span>IPFS<br/>SYNCING</span>}<i>#{token.tokenId}</i></div><b>{token.name}</b><small>View NFT details →</small></button>)}</div>:tokensLoading?<div className="token-gallery-loading"><i/><div><b>Transactions synced</b><span>Loading {mintedCount}  NFT images and traits from IPFS…</span></div></div>:recordWallet&&!loading&&!error?<div className="history-empty compact"><i>◇</i><b>No works found yet</b><p>Refresh onchain activity; IPFS images may take a moment to resolve.</p></div>:null}</section>
    </section>
    {selectedToken&&<div className="token-modal" role="dialog" aria-modal="true" aria-label={`${selectedToken.name} NFT details`}><article><button className="token-modal-close" onClick={()=>setSelectedToken(null)} aria-label="Close">×</button><div className="token-modal-visual">{selectedToken.image?<img src={selectedToken.image} alt={selectedToken.name}/>:<span>IPFS METADATA</span>}</div><div className="token-modal-info"><small>AURA OFFICIAL COLLECTION · TOKEN #{selectedToken.tokenId}</small><h2>{selectedToken.name}</h2><p>{selectedToken.description}</p><div className="token-traits">{selectedToken.attributes.map((trait,index)=><span key={`${trait.trait_type}-${index}`}><small>{trait.trait_type||"TRAIT"}</small><b>{String(trait.value??"")}</b></span>)}</div><div className="token-market-actions"><a className="opensea-action" href={`https://opensea.io/item/robinhood/${selectedToken.contract}/${selectedToken.tokenId}`} target="_blank" rel="noreferrer"><b>OpenSea</b><span>Display or list this NFT ↗</span></a><a href={`${ROBINHOOD_EXPLORER}/token/${selectedToken.contract}/instance/${selectedToken.tokenId}`} target="_blank" rel="noreferrer"><b>Robinhood Explorer</b><span>View onchain ownership ↗</span></a><a href={selectedToken.metadataUrl} target="_blank" rel="noreferrer"><b>IPFS Metadata</b><span>View source metadata ↗</span></a></div><em>Pricing, royalties and sales are governed by third-party marketplaces and wallet signatures. AURA never takes custody of assets.</em></div></article></div>}
  </main>
}
