"use client";

import { useEffect, useState } from "react";
import SiteHeader from "./components/SiteHeader";
import {useWallet} from "./components/WalletProvider";
import {industryProjects} from "./data/ecosystem";

const nftImages = Array.from({length:16},(_,i)=>`/brand/aura-nft-${String(i+1).padStart(2,"0")}.jpg`);
const traits = ["冰川","花园","霓虹","鎏金","云端","珊瑚","月球","森林","水晶","星云","沙丘","竹影"];
const resourceLinks=[
  {name:"Robinhood Chain",detail:"官方文档",href:"https://docs.robinhood.com/chain/"},
  {name:"Block Explorer",detail:"主网浏览器",href:"https://robinhoodchain.blockscout.com/"},
  {name:"OpenSea",detail:"NFT 展示与交易",href:"https://opensea.io/collections/chain/robinhood"},
  {name:"Pinata",detail:"IPFS 存储",href:"https://pinata.cloud/"},
  {name:"IPFS",detail:"去中心化存储协议",href:"https://ipfs.tech/"},
  {name:"OpenZeppelin",detail:"智能合约标准",href:"https://www.openzeppelin.com/"},
] as const;
const auraGithub=process.env.NEXT_PUBLIC_AURA_GITHUB_URL;
const auraX=process.env.NEXT_PUBLIC_AURA_X_URL;
const industryCases=[
  {name:"CryptoPunks",type:"生成式身份",image:"/brand/case-punk-0001.png",imageClass:"pixel",scale:"10,000",volume:"$3.07B",volumeLabel:"累计销售额",asOf:"NODE Foundation，2025-04",value:"用统一的像素角色系统和稀有属性，建立了可识别的互联网原生文化符号。",revenue:"2017 年初始公开领取价为 0 ETH（另付 Gas）；价值主要通过收藏需求、二级交易与文化影响力形成。早期免费领取不代表后续买家的实际回报。",source:"https://hub.cryptopunks.app/cryptopunks-join-the-node-foundation"},
  {name:"Pudgy Penguins",type:"NFT IP 与社区",image:"/brand/case-pudgy-nft.png",scale:"8,888",volume:"$396.88M",volumeLabel:"历史成交额",asOf:"CryptoSlam 数据，2024-08-06",value:"从链上角色扩展到社区、授权、实体玩具和 Pudgy World，让 NFT 成为长期 IP 入口。",revenue:"可能的价值路径包括 NFT 二级交易、角色授权和实体商品生态；具体持有者收益取决于授权计划、购买成本与市场需求。",source:"https://media.pudgypenguins.com/post/pudgytoys"},
  {name:"Bored Ape Yacht Club",type:"生成式头像与会员社区",image:"/brand/bayc-candidate-3.jpg",scale:"10,000",volume:"$1.03B+",volumeLabel:"累计成交额",asOf:"CryptoSlam 数据，2022-01",value:"以 10,000 个独特头像建立会员身份、社区文化与持有者权益，是生成式 PFP 进入主流的代表案例。",revenue:"价值路径包括初始发行、二级市场交易、社区身份与品牌 IP 扩展。公开成交额不是项目方净收入，持有者回报取决于买入成本与市场需求。",source:"https://www.theblock.co/post/129084/bored-ape-yacht-club-crosses-1-billion-in-total-sales"}
] as const;

export default function Home(){
  const {wallet,connected,openWallets}=useWallet();
  const [selectedIndustry,setSelectedIndustry]=useState<number|null>(null);

  useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("in-view")}),{threshold:.12});document.querySelectorAll("main>section").forEach(el=>{el.classList.add("reveal");observer.observe(el)});return()=>observer.disconnect()},[]);

  return <main>
    <SiteHeader/>

    <a className="audit-home-bar" href="/audit" aria-label="查看 AURA 合约部署证明与安全评估">
      <span className="audit-home-seal"><i>✓</i> SECURITY</span>
      <span><b>AURA Collection V2 已部署至 Robinhood Mainnet</b><small>链上部署已验证 · 内部安全评估已完成 · 第三方独立审计待完成</small></span>
      <em>查看审计与部署证明 →</em>
    </a>

    <section className="aura-hero" id="top">
      <div className="hero-glow one"/><div className="hero-glow two"/>
      <div className="hero-energy" aria-hidden="true">{Array.from({length:7},(_,i)=><i key={i}/>)}</div>
      <div className="hero-copy">
        <span className="hero-pill"><i/> ROBINHOOD CHAIN-NATIVE · GENERATIVE NFT AI</span>
        <h1>为 Robinhood Chain 而生的<br/><em>生成式 NFT AI 引擎。</em></h1>
        <p>AURA 致力于打造<strong>首个基于 Robinhood Chain 的 NFT 图片 AI 产品</strong>。上传一张主体照片，即可快速批量生成多张<strong>身份一致、视觉各异</strong>的 NFT 图片，并完成 Trait、IPFS Metadata 与 <strong>Mainnet Mint</strong>；上链后可在 <strong>OpenSea</strong> 展示、挂牌与交易。</p>
        <div className="hero-action-row"><div className="hero-buttons"><a href="/studio">创建 NFT Collection <b>→</b></a><a className="hero-secondary" href="/how-it-works">查看技术架构 <b>→</b></a></div><div className="hero-mini-metrics" aria-label="AURA 使用数据"><span><b>200<sup>+</sup></b><small>早期使用者</small></span><i/><span><b>4</b><small>生态集成</small></span></div></div>
        <div className="hero-facts"><span><b>01</b> Robinhood 原生</span><span><b>02</b> AURA V2 合约</span><span><b>03</b> OpenSea Ready</span></div>
      </div>
      <div className="hero-demo">
        <article className="demo-card input-demo"><header><i>1</i><b>上传一张主体照片</b></header><div className="mini-tabs"><span className="active">上传照片</span><span>文字描述</span></div><p>锁定人物、角色、产品或 IP 的核心外观，作为整套 NFT 系列的一致身份基准。</p><div className="upload-mini">▧<small>PNG / JPG / WEBP / PROMPT</small></div></article>
        <span className="demo-arrow">→</span>
        <article className="demo-card generate-demo"><header><i>2</i><b>AI 生成系列资产</b></header><img src="/brand/aura-nft-01.jpg" alt="AURA Wisp NFT 主体示例"/><div className="fake-progress"><span/><b>68%</b></div><ul><li>锁定主体与品牌识别</li><li>编排 Trait 与稀有属性</li><li>生成标准 Metadata</li></ul></article>
        <span className="demo-arrow">→</span>
        <article className="demo-card grid-demo"><header><i>3</i><b>Mint 并进入市场</b></header><div>{nftImages.slice(0,12).map((src,i)=><img src={src} alt={`AURA NFT 变体 ${i+1}`} key={src}/>)}</div><p><b>∞</b> OpenSea Ready · 展示 / 挂牌 / 交易</p></article>
      </div>
    </section>

    <section className="flow" id="features">
      {[['01','上传一张照片','锁定角色、产品或 IP 主体'],['02','快速批量生成','单次输出多张相似但不重复的变体'],['03','Mainnet Mint','轻量图片、IPFS Metadata 与钱包签名'],['04','OpenSea 市场','展示、挂牌与二级交易']].map((x,i)=><article key={x[0]}><i>{x[0]}</i><div><b>{x[1]}</b><p>{x[2]}</p></div>{i<3&&<span>→</span>}</article>)}
    </section>

    <section className="ecosystem-strip">
      <header><div><span>BRANDS USING AURA</span><h2>目前已使用 AURA 的 NFT 品牌</h2></div></header>
      <div className="ecosystem-window"><div className="ecosystem-track">{[0,1,2,3,4].map(group=><div className="ecosystem-group" key={group} aria-hidden={group>0}>{industryProjects.map(item=><a href={item.url} target="_blank" rel="noreferrer" key={`${item.name}-${group}`}><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.category} · {item.count}</small></span><i>↗</i></a>)}</div>)}</div></div>
    </section>

    <section className="why-section">
      <div className="why-intro"><span>WHY AURA</span><h2>不只生成一张图片，<br/>而是快速完成一个<em>可发行的系列。</em></h2><p>AURA 重点解决普通 AI 工具<strong>单张等待、主体走样、文件过大</strong>的问题：以一张照片为基准，单次批量产出多种变体，并自动准备轻量 NFT 图片、元数据与上链流程。</p><a href="/studio">创建第一个系列 →</a></div>
      <div className="why-list">
        <article><i>01</i><div><b>主体一致，不会越生成越走样</b><p>锁定脸部、轮廓、Logo 与关键结构，只让背景、服装、材质和配件发生变化。</p></div></article>
        <article><i>02</i><div><b>规模化生成，不必手工组合图层</b><p>从几十张概念验证扩展至上千张系列，同时控制属性分布与稀有度。</p></div></article>
        <article><i>03</i><div><b>图片和元数据同步完成</b><p>为每件作品生成名称、编号、属性和标准 JSON，减少发行前的重复整理。</p></div></article>
        <article><i>04</i><div><b>直接衔接 Robinhood Chain</b><p>生成、筛选、导出、连接钱包和系列展示集中在一套流程中。</p></div></article>
      </div>
    </section>

    <section className="collection" id="gallery">
      <div className="section-title"><span>GENERATED COLLECTION</span><h2>一个主体，<em>上千种可能。</em></h2><p>主体保持一致，背景、服装、材质与稀有属性持续变化。</p></div>
      <div className="nft-grid">{nftImages.slice(0,4).map((src,i)=><figure key={src}><img src={src} alt={`AURA Wisp 能量精灵 ${i+1}`}/><figcaption><b>{traits[i]}能量精灵</b><span>#{String(i+1).padStart(4,"0")}</span></figcaption></figure>)}</div>
      <div className="collection-summary"><div><b>4 个方向，仅为概念预览</b><span>由同一主体继续组合场景、材质与稀有属性，可扩展为 1,000 / 3,333 / 10,000 件完整系列。</span></div><a href="/studio">生成我的系列 →</a></div>
    </section>

    <section className="case-section">
      <div className="section-title"><span>REAL-WORLD REFERENCES</span><h2>真实 NFT 项目，如何建立系列价值</h2><p>以下为行业公开案例，并非 AURA 客户案例。</p></div>
      <div className="case-grid">{industryCases.map((item,i)=><article key={item.name} className="clickable-case"><button className="case-art real" onClick={()=>setSelectedIndustry(i)} aria-label={`查看 ${item.name} 项目数据`}><img className={'imageClass' in item?item.imageClass:''} src={item.image} alt={`${item.name} 真实项目形象`}/><span>{item.type}</span><i>点击查看数据 ↗</i></button><small>{item.type} / {item.scale}</small><h3>{item.name}</h3><p>{item.value}</p><div className="case-metric"><b>{item.volume}</b><span>{item.volumeLabel}</span></div><button onClick={()=>setSelectedIndustry(i)}>查看价值与成交数据 <span>↗</span></button></article>)}</div>
    </section>

    <section className="value-section">
      <div className="value-heading"><span>WHY TURN IT INTO NFTS</span><h2>把视觉变成 NFT，<br/>能带来什么价值？</h2><p>NFT 的价值不只是“把图片放到链上”，而是为内容增加<strong>可验证的所有权、身份关系与可持续使用方式</strong>。</p></div>
      <div className="value-cards">
        <article><i>01</i><h3>可验证的数字所有权</h3><p>每件作品拥有独立编号、链上记录和持有地址，来源与归属更容易验证。</p><span>例如：限量数字艺术、创作者证书</span></article>
        <article><i>02</i><h3>社区身份与访问权限</h3><p>NFT 可以作为会员凭证，解锁内容、活动、投票或专属产品。</p><span>例如：会员通行证、游戏角色身份</span></article>
        <article><i>03</i><h3>IP 与实体产品延伸</h3><p>统一角色系列可以继续进入玩具、服饰、游戏与品牌授权场景。</p><span>例如：Pudgy Penguins 的实体玩具</span></article>
        <article><i>04</i><h3>可编程的长期关系</h3><p>项目方可以围绕持有状态持续发放权益、更新属性和连接新体验。</p><span>例如：动态属性、持有者任务与奖励</span></article>
      </div>
    </section>

    <section className="chain-section" id="chain"><div><span>ROBINHOOD-NATIVE · OPENSEA READY</span><h2>从生成到交易，<br/>连接完整 NFT 生命周期。</h2><p>AURA 自动准备图片、Trait、稀有度与标准 JSON Metadata，并通过 V2 合约在 Robinhood Mainnet 完成 Mint。交易确认后，用户可在 OpenSea 连接同一钱包，完成系列展示、挂牌、报价与二级交易。</p><button onClick={openWallets}>{connected?`${wallet.slice(0,6)}…${wallet.slice(-4)} · 钱包详情`:'连接钱包开始创作'} →</button><a className="opensea-proof-link" href="https://opensea.io/collections/chain/robinhood" target="_blank" rel="noopener noreferrer">浏览 OpenSea 上的 Robinhood NFT ↗</a></div><aside><img src="/brand/robinhood.ico" alt="Robinhood"/><b>Robinhood Chain</b><span>MAINNET</span><dl><div><dt>Chain ID</dt><dd>4663</dd></div><div><dt>Gas token</dt><dd>ETH</dd></div><div><dt>Marketplace</dt><dd>OpenSea</dd></div></dl></aside></section>

    {selectedIndustry!==null&&(()=>{const item=industryCases[selectedIndustry];return <div className="industry-modal" role="dialog" aria-modal="true" aria-label={`${item.name} 数据详情`}><div className="industry-panel"><button className="industry-close" onClick={()=>setSelectedIndustry(null)} aria-label="关闭">×</button><div className="industry-image"><img className={'imageClass' in item?item.imageClass:''} src={item.image} alt={`${item.name} NFT`}/><span>REAL-WORLD NFT CASE</span></div><div className="industry-copy"><small>{item.type}</small><h3>{item.name}</h3><p className="industry-value"><strong>项目价值：</strong>{item.value}</p><div className="industry-stats"><article><span>系列规模 / 用户</span><b>{item.scale}</b></article><article><span>{item.volumeLabel}</span><b>{item.volume}</b></article></div><p className="industry-date">数据口径：{item.asOf}</p><div className="revenue-box"><b>价值与收益如何产生</b><p>{item.revenue}</p></div><div className="risk-note"><b>重要说明</b><p>以上是历史公开数据，不代表当前价格，也不构成投资建议。NFT 价格波动显著，历史成交表现不保证未来收益。</p></div><a href={item.source} target="_blank" rel="noreferrer">查看数据来源 ↗</a></div></div></div>})()}

    <footer className="site-footer" id="footer">
      <div className="footer-main">
        <div className="footer-intro"><a className="aura-brand" href="#top"><img src="/brand/aura-logo.png" alt="AURA"/><span><b>AURA</b><small>COLLECTION ENGINE</small></span></a><p>从创意主体到链上 Collection。生成、整理 Metadata，并在 Robinhood Chain 完成发行。</p><div className="footer-socials" aria-label="AURA 官方社区">{auraGithub?<a href={auraGithub} target="_blank" rel="noopener noreferrer" aria-label="AURA GitHub">GH <span>GitHub</span> ↗</a>:<span title="配置 NEXT_PUBLIC_AURA_GITHUB_URL 后开放">GH <b>GitHub · 即将开放</b></span>}{auraX?<a href={auraX} target="_blank" rel="noopener noreferrer" aria-label="AURA X">𝕏 <span>X</span> ↗</a>:<span title="配置 NEXT_PUBLIC_AURA_X_URL 后开放">𝕏 <b>X · 即将开放</b></span>}</div></div>
        <nav className="footer-nav" aria-label="AURA 页面"><b>产品</b><a href="#features">产品功能</a><a href="/studio">创作引擎</a><a href="/cases">生成案例</a><a href="/how-it-works">工作原理</a><a href="/whitepaper">白皮书</a><a href="/audit">合约审计</a></nav>
        <div className="footer-resources"><b>生态与工具</b><div>{resourceLinks.map(link=><a href={link.href} target="_blank" rel="noopener noreferrer" key={link.name}><span><strong>{link.name}</strong><small>{link.detail}</small></span><i>↗</i></a>)}</div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} AURA. All rights reserved.</span><span><i/> Robinhood Mainnet · Chain ID 4663</span><span>AURA 是独立产品，非 Robinhood 官方产品或合作方。</span></div>
    </footer>
  </main>
}
