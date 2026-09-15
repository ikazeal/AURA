"use client";

import { useEffect, useState } from "react";
import SiteHeader from "./components/SiteHeader";
import {useWallet} from "./components/WalletProvider";
import {industryProjects} from "./data/ecosystem";

const nftImages = Array.from({length:16},(_,i)=>`/brand/aura-nft-${String(i+1).padStart(2,"0")}.jpg`);
const traits = ["Glacier ","Garden ","Neon ","Gilded ","Cloud","Coral","Moon","Forest","Crystal","Nebula","Dunes","Bamboo"];
const resourceLinks=[
  {name:"Robinhood Chain",detail:"Official docs",href:"https://docs.robinhood.com/chain/"},
  {name:"Block Explorer",detail:"Mainnet explorer",href:"https://robinhoodchain.blockscout.com/"},
  {name:"OpenSea",detail:"NFT display & trading",href:"https://opensea.io/collections/chain/robinhood"},
  {name:"Pinata",detail:"IPFS storage",href:"https://pinata.cloud/"},
  {name:"IPFS",detail:"Decentralized storage protocol",href:"https://ipfs.tech/"},
  {name:"OpenZeppelin",detail:"Smart contract standards",href:"https://www.openzeppelin.com/"},
] as const;
const auraX=process.env.NEXT_PUBLIC_AURA_X_URL||"https://x.com/RbAuramint";
const industryCases=[
  {name:"CryptoPunks",type:"Generative identity",image:"/brand/case-punk-0001.png",imageClass:"pixel",scale:"10,000",volume:"$3.07B",volumeLabel:"Lifetime sales",asOf:"NODE Foundation · 2025-04",value:"A consistent pixel-character system and rarity model created a recognizable internet-native cultural icon.",revenue:"The initial 2017 public claim cost 0 ETH plus gas. Later value came from collector demand, secondary trading and cultural reach; a free early claim does not represent later buyer outcomes.",source:"https://hub.cryptopunks.app/cryptopunks-join-the-node-foundation"},
  {name:"Pudgy Penguins",type:"NFT IP & community",image:"/brand/case-pudgy-nft.png",scale:"8,888",volume:"$396.88M",volumeLabel:"Historical volume",asOf:"CryptoSlam data · 2024-08-06",value:"Expanded from onchain characters into community, licensing, physical toys and Pudgy World.",revenue:"Potential value paths include secondary trading, character licensing and physical products. Holder outcomes depend on licensing terms, purchase cost and market demand.",source:"https://media.pudgypenguins.com/post/pudgytoys"},
  {name:"Bored Ape Yacht Club",type:"Generative PFP & membership",image:"/brand/bayc-candidate-3.jpg",scale:"10,000",volume:"$1.03B+",volumeLabel:"Lifetime volume",asOf:"CryptoSlam data · 2022-01",value:"Built membership, culture and holder utility around 10,000 distinct avatars.",revenue:"Value paths include primary releases, secondary trading, community identity and brand IP expansion. Public volume is not project revenue, and holder outcomes depend on cost basis and market demand.",source:"https://www.theblock.co/post/129084/bored-ape-yacht-club-crosses-1-billion-in-total-sales"}
] as const;

export default function Home(){
  const {wallet,connected,openWallets}=useWallet();
  const [selectedIndustry,setSelectedIndustry]=useState<number|null>(null);

  useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add("in-view")}),{threshold:.12});document.querySelectorAll("main>section").forEach(el=>{el.classList.add("reveal");observer.observe(el)});return()=>observer.disconnect()},[]);

  return <main>
    <SiteHeader/>

    <a className="audit-home-bar" href="/audit" aria-label="View AURA contract security assessment">
      <span className="audit-home-seal"><i>✓</i> SECURITY</span>
      <span><b>AURA Collection V2 is deployed on Robinhood Mainnet</b><small>Contract live · Internal review complete · Authorized mint verified</small></span>
      <em>View contract security assessment →</em>
    </a>

    <section className="aura-hero" id="top">
      <div className="hero-glow one"/><div className="hero-glow two"/>
      <div className="hero-energy" aria-hidden="true">{Array.from({length:7},(_,i)=><i key={i}/>)}</div>
      <div className="hero-copy">
        <span className="hero-pill"><i/> ROBINHOOD CHAIN-NATIVE · GENERATIVE NFT AI</span>
        <h1>The first AI image platform<br/><em>built on Robinhood Chain.</em></h1>
        <p>Describe or upload one subject to generate <strong>identity-consistent, visually distinct</strong> NFT visuals. Complete Metadata, IPFS and Mainnet Mint, then display or trade on OpenSea.</p>
        <div className="hero-action-row"><div className="hero-buttons"><a href="/studio">Create NFT Collection <b>→</b></a><a className="hero-secondary" href="/how-it-works">View architecture <b>→</b></a></div><div className="hero-mini-metrics" aria-label="AURA usage data"><span><b>100<sup>+</sup></b><small>early users</small></span><i/><span><b>4</b><small>ecosystem integrations</small></span></div></div>
        <div className="hero-facts"><span><b>01</b> Robinhood native</span><span><b>02</b> AURA V2 contract</span><span><b>03</b> OpenSea Ready</span></div>
      </div>
      <div className="hero-demo">
        <article className="demo-card input-demo"><header><i>1</i><b>Upload one subject image</b></header><div className="mini-tabs"><span className="active">Upload image</span><span>Text prompt</span></div><p>Lock one subject as the collection identity.</p><div className="upload-mini">▧<small>PNG / JPG / WEBP / PROMPT</small></div></article>
        <span className="demo-arrow">→</span>
        <article className="demo-card generate-demo"><header><i>2</i><b>Generate collection assets</b></header><img src="/brand/aura-nft-01.jpg" alt="AURA Wisp NFT subject example"/><div className="fake-progress"><span/><b>68%</b></div><ul><li><i aria-hidden="true">✓</i>Preserve subject identity</li><li><i aria-hidden="true">✓</i>Compose traits and rarity</li><li><i aria-hidden="true">✓</i>Generate standard Metadata</li></ul></article>
        <span className="demo-arrow">→</span>
        <article className="demo-card grid-demo"><header><i>3</i><b>Mint and enter the market</b></header><div>{nftImages.slice(0,12).map((src,i)=><img src={src} alt={`AURA NFT variant ${i+1}`} key={src}/>)}</div><p><b>∞</b> OpenSea Ready · Display / list / trade</p></article>
      </div>
    </section>

    <section className="flow" id="features">
      {[['01','Upload one image','Lock a character, product or IP'],['02','Fast batch generation','Generate multiple distinct variants per batch'],['03','Mainnet Mint','Optimized images, IPFS Metadata and wallet signature'],['04','OpenSea marketplace','Display, list and trade']].map((x,i)=><article key={x[0]}><i>{x[0]}</i><div><b>{x[1]}</b><p>{x[2]}</p></div>{i<3&&<span>→</span>}</article>)}
    </section>

    <section className="ecosystem-strip">
      <header><div><span>RECENT ON ROBINHOOD CHAIN</span><h2>NFT brands using AURA</h2></div></header>
      <div className="ecosystem-window"><div className="ecosystem-track">{[0,1,2,3,4].map(group=><div className="ecosystem-group" key={group} aria-hidden={group>0}>{industryProjects.map(item=><a href={item.url} target="_blank" rel="noreferrer" key={`${item.name}-${group}`}><img src={item.image} alt=""/><span><b>{item.name}</b><small>{item.category} · {item.count}</small></span><i>↗</i></a>)}</div>)}</div></div>
    </section>

    <section className="why-section">
      <div className="why-intro"><span>WHY AURA</span><h2>Go beyond one image.<br/>Build a <em>publish-ready collection.</em></h2><p>AURA solves the limitations of ordinary AI tools: <strong>slow one-by-one output, subject drift and oversized files.</strong> Use one image as a baseline, generate multiple variants per batch, and automatically prepare optimized NFT assets, metadata and publishing.</p><a href="/studio">Create your first collection →</a></div>
      <div className="why-list">
        <article><i>01</i><div><b>Consistent identity across every output</b><p>Preserve facial features, silhouette, logos and defining structure while varying backgrounds, outfits, materials and accessories.</p></div></article>
        <article><i>02</i><div><b>Scale without manual layer assembly</b><p>Move from early concepts to large collections while controlling trait distribution and rarity.</p></div></article>
        <article><i>03</i><div><b>Images and Metadata stay in sync</b><p>Generate names, token numbers, traits and standard JSON for every item.</p></div></article>
        <article><i>04</i><div><b>Native Robinhood Chain publishing</b><p>Generate, review, export, connect a wallet and publish from one workflow.</p></div></article>
      </div>
    </section>

    <section className="collection" id="gallery">
      <div className="section-title"><span>GENERATED COLLECTION</span><h2>One subject. <em>Thousands of possibilities.</em></h2><p>Keep the subject consistent while backgrounds, outfits, materials and rarity traits evolve.</p></div>
      <div className="nft-grid">{nftImages.slice(0,4).map((src,i)=><figure key={src}><img src={src} alt={`AURA Wisp Wisp ${i+1}`}/><figcaption><b>{traits[i]}Wisp</b><span>#{String(i+1).padStart(4,"0")}</span></figcaption></figure>)}</div>
      <div className="collection-summary"><div><b>Four directions shown as a concept preview</b><span>Combine scenes, materials and rarity traits around one subject to expand into a complete 1,000, 3,333 or 10,000 item collection.</span></div><a href="/studio">Generate my collection →</a></div>
    </section>

    <section className="case-section">
      <div className="section-title"><span>REAL-WORLD REFERENCES</span><h2>How real NFT projects build collection value</h2><p>Public industry references; not AURA customer case studies.</p></div>
      <div className="case-grid">{industryCases.map((item,i)=><article key={item.name} className="clickable-case"><button className="case-art real" onClick={()=>setSelectedIndustry(i)} aria-label={`View ${item.name} Project data`}><img className={'imageClass' in item?item.imageClass:''} src={item.image} alt={`${item.name} Authentic project artwork`}/><span>{item.type}</span><i>View data ↗</i></button><small>{item.type} / {item.scale}</small><h3>{item.name}</h3><p>{item.value}</p><div className="case-metric"><b>{item.volume}</b><span>{item.volumeLabel}</span></div><button onClick={()=>setSelectedIndustry(i)}>View value and volume data <span>↗</span></button></article>)}</div>
    </section>

    <section className="value-section">
      <div className="value-heading"><span>WHY TURN IT INTO NFTS</span><h2>Turn visuals into NFTs.<br/>What value can they create?</h2><p>NFTs do more than put images onchain. They add <strong>verifiable ownership, identity and durable utility.</strong></p></div>
      <div className="value-cards">
        <article><i>01</i><h3>Verifiable digital ownership</h3><p>Every work has a unique token ID, onchain record and owner address.</p><span>Example: limited digital art and creator certificates</span></article>
        <article><i>02</i><h3>Community identity and access</h3><p>NFTs can act as membership credentials for content, events, voting and exclusive products.</p><span>Example: membership passes and game identities</span></article>
        <article><i>03</i><h3>IP and physical extensions</h3><p>A coherent character system can extend into toys, apparel, games and brand licensing.</p><span>Example: Pudgy Penguins physical toys</span></article>
        <article><i>04</i><h3>Programmable long-term utility</h3><p>Projects can deliver ongoing utility, evolve traits and connect new experiences to ownership.</p><span>Example: dynamic traits, holder quests and rewards</span></article>
      </div>
    </section>

    <section className="chain-section" id="chain"><div><span>ROBINHOOD-NATIVE · OPENSEA READY</span><h2>From generation to market.<br/>Connect the complete NFT lifecycle.</h2><p>AURA prepares images, traits, rarity and standard JSON Metadata, then mints through the V2 contract on Robinhood Mainnet. After confirmation, use the same wallet on OpenSea to display, list and trade the collection.</p><button onClick={openWallets}>{connected?`${wallet.slice(0,6)}…${wallet.slice(-4)} · Wallet details`:'Connect wallet to create'} →</button><a className="opensea-proof-link" href="https://opensea.io/collections/chain/robinhood" target="_blank" rel="noopener noreferrer">Explore Robinhood NFTs on OpenSea ↗</a></div><aside><img src="/brand/robinhood.ico" alt="Robinhood"/><b>Robinhood Chain</b><span>MAINNET</span><dl><div><dt>Chain ID</dt><dd>4663</dd></div><div><dt>Gas token</dt><dd>ETH</dd></div><div><dt>Marketplace</dt><dd>OpenSea</dd></div></dl></aside></section>

    {selectedIndustry!==null&&(()=>{const item=industryCases[selectedIndustry];return <div className="industry-modal" role="dialog" aria-modal="true" aria-label={`${item.name} Data details`}><div className="industry-panel"><button className="industry-close" onClick={()=>setSelectedIndustry(null)} aria-label="Close">×</button><div className="industry-image"><img className={'imageClass' in item?item.imageClass:''} src={item.image} alt={`${item.name} NFT`}/><span>REAL-WORLD NFT CASE</span></div><div className="industry-copy"><small>{item.type}</small><h3>{item.name}</h3><p className="industry-value"><strong>Project value: </strong>{item.value}</p><div className="industry-stats"><article><span>Collection size / users</span><b>{item.scale}</b></article><article><span>{item.volumeLabel}</span><b>{item.volume}</b></article></div><p className="industry-date">Data basis: {item.asOf}</p><div className="revenue-box"><b>How value may be created</b><p>{item.revenue}</p></div><div className="risk-note"><b>Important notice</b><p>Historical public data does not represent current prices or financial advice. NFT prices are volatile and past activity does not guarantee future results.</p></div><a href={item.source} target="_blank" rel="noreferrer">View source ↗</a></div></div></div>})()}

    <footer className="site-footer" id="footer">
      <div className="footer-main">
        <div className="footer-intro"><a className="aura-brand" href="#top"><img src="/brand/aura-logo.png" alt="AURA"/><span><b>AURA</b><small>COLLECTION ENGINE</small></span></a><p>From a creative subject to an onchain collection—generate, structure Metadata and publish on Robinhood Chain.</p><div className="footer-socials" aria-label="Official AURA community"><a href={auraX} target="_blank" rel="noopener noreferrer" aria-label="AURA on X">𝕏 <span>@RbAuramint</span> ↗</a></div></div>
        <nav className="footer-nav" aria-label="AURA page"><b>Product</b><a href="#features">Product</a><a href="/studio">Studio</a><a href="/cases">Collections</a><a href="/how-it-works">How it works</a><a href="/whitepaper">Whitepaper</a><a href="/audit">Contract audit</a></nav>
        <div className="footer-resources"><b>Ecosystem & tools</b><div>{resourceLinks.map(link=><a href={link.href} target="_blank" rel="noopener noreferrer" key={link.name}><span><strong>{link.name}</strong><small>{link.detail}</small></span><i>↗</i></a>)}</div></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} AURA. All rights reserved.</span><span><i/> Robinhood Mainnet · Chain ID 4663</span><span>AURA is an independent product and is not affiliated with Robinhood.</span></div>
    </footer>
  </main>
}
