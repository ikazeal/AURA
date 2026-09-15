import type {Metadata} from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata:Metadata={
  title:"How it works | AURA Collection Engine",
  description:"See how AURA handles subject lock, trait orchestration, batch generation, quality validation, IPFS metadata and Robinhood Mainnet minting.",
};

const stages=[
  {no:"01",code:"SUBJECT SPEC",title:"Define subject specification",text:"Extract stable silhouette, proportions, colors and brand marks from text or references to form shared subject constraints.",input:"Prompt / Assets",output:"Subject Profile",tags:["Silhouette lock","Color constraints","Brand elements"]},
  {no:"02",code:"MASTER DIRECTION",title:"Approve visual master",text:"Generate a small direction batch first. Scale only after the creator approves style, composition and visual language.",input:"Subject Profile",output:"Approved Master",tags:["Human approval","Direction version","Reversible"]},
  {no:"03",code:"TRAIT GRAPH",title:"Orchestrate traits",text:"Organize backgrounds, outfits, materials, accessories and effects into a trait graph with weights, exclusions and rarity rules.",input:"Approved Master",output:"Trait Manifest",tags:["Weight allocation","Conflict exclusion","Rarity"]},
  {no:"04",code:"GENERATION",title:"Expand collection variants",text:"Generate candidates in batches around one subject while preserving generation parameters and trait provenance for every asset.",input:"Trait Manifest",output:"Candidate Assets",tags:["Batch queue","Consistency","Traceable"]},
  {no:"05",code:"VALIDATION",title:"Quality and data validation",text:"Check identity drift, duplicate assets, trait conflicts, missing fields and ID mappings. Only validated assets enter the release package.",input:"Candidate Assets",output:"Verified Package",tags:["Duplicate detection","Schema validation","Human review"]},
  {no:"06",code:"ONCHAIN PUBLISH",title:"Authorize and mint",text:"Write images and JSON to IPFS, issue short-lived EIP-712 authorization, then mint on Robinhood Mainnet with the user's wallet signature.",input:"Verified Package",output:"Onchain Collection",tags:["IPFS","EIP-712","Wallet Sign"]},
] as const;

const layers=[
  ["01","CREATIVE INPUT","Creative input","Prompts, logos, IP characters and references enter one project context."],
  ["02","GENERATION CORE","Generation and orchestration","Subject constraints, the visual master and trait graph drive collection output."],
  ["03","ASSET DATA","Asset data","Deterministically bind images, IDs, traits and rarity to ERC-721 metadata."],
  ["04","CHAIN SETTLEMENT","Onchain settlement","IPFS preserves assets, the wallet authorizes transactions and Robinhood Mainnet records ownership."],
] as const;

const checks=[
  ["IDENTITY","Subject consistency","Confirm that silhouette, proportions and identity elements remain within tolerance."],
  ["DUPLICATION","Duplicate control","Detect identical or near-identical candidates to prevent duplicates."],
  ["TRAIT RULES","Trait rules","Validate exclusions, probability distribution and rare traits against project settings."],
  ["METADATA","Data integrity","Validate token IDs, image URIs, attributes and JSON schema mappings."],
] as const;

export default function HowItWorks(){return <main className="hiw-page">
  <SiteHeader/>

  <section className="hiw-hero">
    <div className="hiw-orbit" aria-hidden="true"><i/><i/><i/></div>
    <div className="hiw-hero-copy">
      <span className="hiw-kicker"><i/> AURA SYSTEM ARCHITECTURE</span>
      <h1>Creative output with<br/><em>production-grade delivery.</em></h1>
      <p>AURA turns generative NFT creation into<strong>Controlled, verifiable and recoverable</strong>a collection production pipeline with explicit inputs, outputs and approval gates.</p>
      <div className="hiw-actions"><a href="/studio">Launch Studio <b>→</b></a><a href="/audit">View contract audit <b>↗</b></a></div>
      <div className="hiw-proof"><span><i>✓</i><b>V2 CONTRACT LIVE</b><small>Robinhood Mainnet</small></span><span><i>✓</i><b>AUTHORIZED MINT</b><small>EIP-712 + Nonce</small></span><span><i>✓</i><b>ASSET STORAGE</b><small>IPFS Metadata</small></span></div>
    </div>

    <div className="hiw-console" aria-label="AURA Collection execution graph">
      <header><div><i/><i/><i/></div><span>COLLECTION_PIPELINE / LIVE GRAPH</span><b>CONNECTED</b></header>
      <div className="hiw-graph">
        <article className="graph-node source"><small>INPUT_01</small><b>Subject</b><span>Prompt + Assets</span></article>
        <i className="graph-line one"/><i className="graph-pulse one"/>
        <article className="graph-node engine"><small>CORE_02</small><b>Identity Engine</b><span>Lock · Direct · Compose</span><em>ACTIVE</em></article>
        <i className="graph-line two"/><i className="graph-pulse two"/>
        <article className="graph-node validate"><small>GATE_03</small><b>Validation</b><span>Identity · Traits · Schema</span></article>
        <i className="graph-line three"/><i className="graph-pulse three"/>
        <article className="graph-node publish"><small>CHAIN_04</small><b>Robinhood Mainnet</b><span>IPFS → Sign → Mint</span><em>4663</em></article>
      </div>
      <footer><span><i/> SYSTEM READY</span><code>contract: 0x7632...4D65</code></footer>
    </div>
  </section>

  <section className="hiw-signal-bar">
    <span><small>NETWORK</small><b><i/> Robinhood Mainnet</b></span><span><small>CHAIN ID</small><b>4663</b></span><span><small>TOKEN STANDARD</small><b>ERC-721</b></span><span><small>AUTHORIZATION</small><b>EIP-712</b></span><span><small>MAX BATCH / TX</small><b>50</b></span><span><small>PLATFORM MINT FEE</small><b>0</b></span>
  </section>

  <section className="hiw-architecture">
    <header className="hiw-section-head"><div><span>01 / SYSTEM LAYERS</span><h2>One complete collection<br/>Production infrastructure</h2></div><p>AURA is not a loose chain of tools. One project context carries subject constraints, trait rules, generated assets and onchain metadata through a single data path.</p></header>
    <div className="layer-stack">{layers.map(([no,code,title,text],i)=><article key={no}><div className="layer-id"><i>{no}</i><span>{code}</span></div><h3>{title}</h3><p>{text}</p><b>{i<layers.length-1?"↓":"✓"}</b></article>)}</div>
  </section>

  <section className="hiw-pipeline">
    <header className="hiw-section-head"><div><span>02 / EXECUTION PIPELINE</span><h2>Six stages.<br/>Every step is explicit.</h2></div><p>Lock the subject before scaling. Validate quality before irreversible transactions. The user retains creative direction and final signing authority.</p></header>
    <div className="hiw-stage-grid">{stages.map((stage,i)=><article key={stage.no}>
      <header><i>{stage.no}</i><span>{stage.code}</span><b>{i<stages.length-1?"→":"✓"}</b></header><h3>{stage.title}</h3><p>{stage.text}</p><div className="stage-tags">{stage.tags.map(tag=><span key={tag}>{tag}</span>)}</div><footer><span><small>INPUT</small>{stage.input}</span><i>→</i><span><small>OUTPUT</small>{stage.output}</span></footer>
    </article>)}</div>
  </section>

  <section className="hiw-validation">
    <div className="validation-copy"><span>03 / QUALITY GATE</span><h2>Generation is not the finish line.<br/>Validation makes it publishable.</h2><p>The hard part of scale is keeping every asset identity-consistent, trait-valid and correctly mapped to metadata. AURA applies four quality gates before packaging.</p><div>{checks.map(([code,title,text])=><article key={code}><i>✓</i><span><small>{code}</small><b>{title}</b><p>{text}</p></span></article>)}</div></div>
    <aside className="validation-terminal">
      <header><span>validation.report</span><b>PASS</b></header>
      <div className="terminal-body"><code><em>01</em> load collection_manifest.json</code><code><em>02</em> verify subject identity constraints</code><code><em>03</em> scan perceptual duplicate distance</code><code><em>04</em> resolve trait conflict graph</code><code><em>05</em> validate ERC-721 metadata schema</code><code><em>06</em> bind asset CID to token records</code><code className="terminal-success"><em>✓</em> package verified — ready to publish</code></div>
      <footer><span>ASSETS</span><b>Selected batch</b><span>OUTPUT</span><b>Metadata Ready</b></footer>
    </aside>
  </section>

  <section className="hiw-chain">
    <header className="hiw-section-head"><div><span>04 / ONCHAIN SETTLEMENT</span><h2>One wallet signature.<br/>A verifiable release.</h2></div><p>AURA prepares contract addresses, asset URIs and mint parameters. The wallet asks for approval only at the final step, then records the confirmed transaction.</p></header>
    <div className="chain-lifecycle">
      <article><i>1</i><span><small>PIN ASSETS</small><b>Write assets and metadata to IPFS</b><p>Create content-addressed asset URIs for selected works.</p></span></article><b>→</b>
      <article><i>2</i><span><small>AUTHORIZE</small><b>Issue short-lived EIP-712 authorization</b><p>Bind wallet, token URIs, quantity, price, nonce and deadline.</p></span></article><b>→</b>
      <article><i>3</i><span><small>WALLET SIGN</small><b>Approve the Robinhood transaction</b><p>The wallet displays transaction parameters for final user approval.</p></span></article><b>→</b>
      <article><i>4</i><span><small>FINALITY</small><b>Record tokens and transaction results</b><p>Sync images, token IDs and Explorer links on the history page.</p></span></article>
    </div>
    <div className="chain-contract"><span><i/> LIVE ON ROBINHOOD MAINNET</span><code>0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65</code><a href="https://robinhoodchain.blockscout.com/address/0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65" target="_blank" rel="noreferrer">Verify contract ↗</a></div>
  </section>

  <section className="hiw-principles"><div><span>ENGINEERING PRINCIPLES</span><h2>A complex system with<br/>clear boundaries.</h2></div><article><i>01</i><b>Human approval</b><p>Visual direction, final assets and onchain transactions require explicit user approval.</p></article><article><i>02</i><b>Deterministic data</b><p>Images, traits, IDs and token URIs maintain a deterministic mapping.</p></article><article><i>03</i><b>Verifiable execution</b><p>IPFS assets, signed authorizations and transactions are independently verifiable.</p></article></section>

  <section className="hiw-cta"><span>BUILD THE COLLECTION</span><h2>Turn one creative subject<br/>into a complete onchain collection.</h2><p>Validate direction first. Keep every step reviewable and replaceable before minting.</p><div><a href="/studio">Launch Studio →</a><a href="/audit">Security and contract audit</a></div></section>
</main>}
