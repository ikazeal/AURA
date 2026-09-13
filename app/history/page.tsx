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
    }catch{setError("暂时无法读取 Robinhood Mainnet 记录，请稍后刷新。")}
    finally{setLoading(false)}
  },[recordWallet]);

  useEffect(()=>{if(!recordWallet)return;const timer=window.setTimeout(()=>void loadMints(),0);return()=>window.clearTimeout(timer)},[recordWallet,loadMints]);
  const visibleCreations=useMemo(()=>creations.filter(item=>!item.wallet||!wallet||item.wallet.toLowerCase()===wallet.toLowerCase()),[creations,wallet]);
  const mintedCount=mints.reduce((sum,item)=>sum+item.quantity,0);

  return <main className="history-page"><SiteHeader/>
    <section className="history-hero"><div><span>MY AURA / ROBINHOOD MAINNET</span><h1>创作与链上记录</h1><p>本机创作过程与钱包在 AURA Collection 中完成的 Mint 记录，分别保存、相互校验。</p></div>{recordWallet?<button onClick={loadMints} disabled={loading}>{loading?"正在同步链上…":"刷新链上记录 ↻"}</button>:<button onClick={openWallets}>连接钱包查看记录 →</button>}</section>
    <section className="history-shell">
      <div className="history-stats"><article><small>LOCAL CREATIONS</small><b>{visibleCreations.length}</b><span>本机保存的创作项目</span></article><article><small>ONCHAIN NFTS</small><b>{recordWallet?mintedCount:"—"}</b><span>该钱包 Mint 的 NFT</span></article><article><small>MINT TRANSACTIONS</small><b>{recordWallet?mints.length:"—"}</b><span>Robinhood 主网交易</span></article><article><small>NETWORK</small><b className="network-value"><i/>4663</b><span>Robinhood Mainnet</span></article></div>
      <div className="history-columns">
        <section><header><div><span>CREATION HISTORY</span><h2>我的创作</h2></div><a href="/studio">创建新系列 →</a></header>{visibleCreations.length?<div className="creation-list">{visibleCreations.map(item=><article className={item.status==="minted"?"minted-record":""} key={item.id}>{item.cover?<img src={item.cover} alt=""/>:<div className="history-placeholder">A</div>}<div><small>{new Date(item.createdAt).toLocaleString("zh-CN")}</small><h3>{item.collection}</h3><p>{item.prompt}</p><span>{item.style} · 目标 {item.targetAmount.toLocaleString()} 件 · {item.previewCount} 个预览</span></div><div className="creation-record-state"><b className={item.status}>{item.status==="minted"?"✓ 已上链":"已生成"}</b>{item.status==="minted"?<span className="creation-locked">发行已完成 · 不可重复 Mint</span>:<a className="creation-reopen" href={`/studio?restore=${encodeURIComponent(item.id)}`}>继续上传 / Mint →</a>}{item.txHash&&<a href={`${ROBINHOOD_EXPLORER}/tx/${item.txHash}`} target="_blank" rel="noreferrer">查看记录 ↗</a>}</div></article>)}</div>:<div className="history-empty"><i>✦</i><b>还没有本机创作记录</b><p>从创作引擎生成第一个系列后，项目会自动出现在这里。</p><a href="/studio">开始创作 →</a></div>}</section>
        <section><header><div><span>ONCHAIN ACTIVITY</span><h2>Mint 记录</h2></div>{recordWallet&&<small>{loading&&mints.length?"后台更新中 · ":""}{recordWallet.slice(0,6)}…{recordWallet.slice(-4)}{!connected?" · 上次连接":""}</small>}</header>{!recordWallet?<div className="history-empty"><i>⌁</i><b>连接钱包读取链上历史</b><p>记录直接来自 AURA Collection 的 BatchMinted 事件。</p><button onClick={openWallets}>连接 Robinhood 主网钱包</button></div>:loading&&!mints.length?<div className="history-loading"><i/><b>正在同步 Robinhood Mainnet</b><span>读取合约事件与区块时间</span></div>:error&&!mints.length?<div className="history-empty"><b>{error}</b><button onClick={loadMints}>重新加载</button></div>:mints.length?<div className="mint-history-list">{mints.map(item=><a href={`${ROBINHOOD_EXPLORER}/tx/${item.txHash}`} target="_blank" rel="noreferrer" key={item.key}><div className="mint-token-stack"><i>#{item.firstTokenId}</i><i>+{item.quantity}</i></div><div><small>{item.timestamp?new Date(item.timestamp).toLocaleString("zh-CN"):`区块 ${item.blockNumber}`}</small><h3>{item.version} · Mint {item.quantity} 件 NFT</h3><p>Token #{item.firstTokenId}{item.quantity>1?`–#${item.firstTokenId+item.quantity-1}`:""} · {item.totalPaid} ETH</p></div><span>查看交易 ↗</span></a>)}</div>:<div className="history-empty"><i>◇</i><b>该钱包还没有 Mint 记录</b><p>完成首次 Mint 后，链上交易会自动同步到这里。</p></div>}</section>
      </div>
      <section className="onchain-gallery-section"><header><div><span>ONCHAIN COLLECTION</span><h2>已经上链的作品</h2><p>同时保留 AURA V1 与 V2 作品，交易记录会优先显示，图片和 Metadata 在后台继续加载。</p></div><div className="market-status"><i/> OpenSea · Robinhood Chain 已支持</div></header>{tokens.length?<div className="onchain-token-grid">{tokens.map(token=><button key={`${token.contract}-${token.tokenId}`} onClick={()=>setSelectedToken(token)}><div>{token.image?<img src={token.image} alt={token.name}/>:<span>IPFS<br/>SYNCING</span>}<i>#{token.tokenId}</i></div><b>{token.name}</b><small>查看 NFT 详情 →</small></button>)}</div>:tokensLoading?<div className="token-gallery-loading"><i/><div><b>交易记录已同步</b><span>正在加载 {mintedCount} 个 NFT 的 IPFS 图片与属性…</span></div></div>:recordWallet&&!loading&&!error?<div className="history-empty compact"><i>◇</i><b>尚未读取到作品</b><p>请刷新链上记录，IPFS 图片可能需要短暂同步。</p></div>:null}</section>
    </section>
    {selectedToken&&<div className="token-modal" role="dialog" aria-modal="true" aria-label={`${selectedToken.name} NFT 详情`}><article><button className="token-modal-close" onClick={()=>setSelectedToken(null)} aria-label="关闭">×</button><div className="token-modal-visual">{selectedToken.image?<img src={selectedToken.image} alt={selectedToken.name}/>:<span>IPFS METADATA</span>}</div><div className="token-modal-info"><small>AURA OFFICIAL COLLECTION · TOKEN #{selectedToken.tokenId}</small><h2>{selectedToken.name}</h2><p>{selectedToken.description}</p><div className="token-traits">{selectedToken.attributes.map((trait,index)=><span key={`${trait.trait_type}-${index}`}><small>{trait.trait_type||"TRAIT"}</small><b>{String(trait.value??"")}</b></span>)}</div><div className="token-market-actions"><a className="opensea-action" href={`https://opensea.io/item/robinhood/${selectedToken.contract}/${selectedToken.tokenId}`} target="_blank" rel="noreferrer"><b>OpenSea</b><span>展示或出售此 NFT ↗</span></a><a href={`${ROBINHOOD_EXPLORER}/token/${selectedToken.contract}/instance/${selectedToken.tokenId}`} target="_blank" rel="noreferrer"><b>Robinhood Explorer</b><span>查看链上所有权 ↗</span></a><a href={selectedToken.metadataUrl} target="_blank" rel="noreferrer"><b>IPFS Metadata</b><span>查看原始元数据 ↗</span></a></div><em>出售价格、版税与成交由第三方市场规则及钱包签名决定，AURA 不托管资产。</em></div></article></div>}
  </main>
}
