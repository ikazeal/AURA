import type {Metadata} from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata:Metadata={
  title:"工作原理 | AURA Collection Engine",
  description:"了解 AURA 如何完成主体锁定、Trait 编排、批量生成、质量验证、IPFS Metadata 与 Robinhood Mainnet Mint。",
};

const stages=[
  {no:"01",code:"SUBJECT SPEC",title:"定义主体规范",text:"从文字或参考素材提取不可漂移的轮廓、比例、色彩和品牌标识，形成后续生成共同遵循的主体约束。",input:"Prompt / Assets",output:"Subject Profile",tags:["轮廓锁定","颜色约束","品牌元素"]},
  {no:"02",code:"MASTER DIRECTION",title:"确认视觉母版",text:"先生成小批量方向稿。创作者确认风格、构图和表现语言后，再进入规模化生产，避免错误方向被批量放大。",input:"Subject Profile",output:"Approved Master",tags:["人工确认","方向版本","可回退"]},
  {no:"03",code:"TRAIT GRAPH",title:"编排属性系统",text:"将背景、服装、材质、配件与特效组织为 Trait Graph，并设置权重、互斥关系与稀有度规则。",input:"Approved Master",output:"Trait Manifest",tags:["权重分配","冲突排除","稀有度"]},
  {no:"04",code:"GENERATION",title:"扩展系列变体",text:"围绕同一主体组合场景与属性，按批次生成候选作品，同时保留每张资产对应的生成参数和 Trait 来源。",input:"Trait Manifest",output:"Candidate Assets",tags:["批量队列","一致性","可追踪"]},
  {no:"05",code:"VALIDATION",title:"质量与数据验证",text:"检查主体漂移、重复资产、属性冲突、缺失字段与编号映射。只有通过关卡的作品才进入发布包。",input:"Candidate Assets",output:"Verified Package",tags:["重复检测","Schema 检查","人工筛选"]},
  {no:"06",code:"ONCHAIN PUBLISH",title:"授权签名并上链",text:"图片与 JSON 写入 IPFS，平台签发短时 EIP-712 授权，用户钱包完成最终签名并在 Robinhood Mainnet Mint。",input:"Verified Package",output:"Onchain Collection",tags:["IPFS","EIP-712","Wallet Sign"]},
] as const;

const layers=[
  ["01","CREATIVE INPUT","创作输入层","自然语言、Logo、IP 形象与参考素材进入统一项目上下文。"],
  ["02","GENERATION CORE","生成与编排层","主体约束、视觉母版和 Trait Graph 共同驱动系列化输出。"],
  ["03","ASSET DATA","资产数据层","图像、编号、属性、稀有度与 ERC-721 Metadata 确定性绑定。"],
  ["04","CHAIN SETTLEMENT","链上结算层","IPFS 固化资产，钱包授权交易，Robinhood Mainnet 记录所有权。"],
] as const;

const checks=[
  ["IDENTITY","主体一致性","确认核心轮廓、比例和识别元素没有发生不可接受的漂移。"],
  ["DUPLICATION","重复度","识别完全相同或高度相似的候选资产，避免系列内部重复。"],
  ["TRAIT RULES","属性规则","校验互斥属性、概率分布和稀有 Trait 是否满足项目配置。"],
  ["METADATA","数据完整性","验证 Token 编号、图片 URI、属性数组与 JSON Schema 的映射。"],
] as const;

export default function HowItWorks(){return <main className="hiw-page">
  <SiteHeader/>

  <section className="hiw-hero">
    <div className="hiw-orbit" aria-hidden="true"><i/><i/><i/></div>
    <div className="hiw-hero-copy">
      <span className="hiw-kicker"><i/> AURA SYSTEM ARCHITECTURE</span>
      <h1>创造性输出，<br/><em>工程化交付。</em></h1>
      <p>AURA 把生成式 NFT 从一次性的图片创作，变成一条<strong>可控制、可验证、可恢复</strong>的 Collection 生产管线。每个阶段都有明确输入、输出和确认边界。</p>
      <div className="hiw-actions"><a href="/studio">运行创作引擎 <b>→</b></a><a href="/audit">查看合约审计 <b>↗</b></a></div>
      <div className="hiw-proof"><span><i>✓</i><b>V2 CONTRACT LIVE</b><small>Robinhood Mainnet</small></span><span><i>✓</i><b>AUTHORIZED MINT</b><small>EIP-712 + Nonce</small></span><span><i>✓</i><b>ASSET STORAGE</b><small>IPFS Metadata</small></span></div>
    </div>

    <div className="hiw-console" aria-label="AURA Collection 执行图">
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
    <header className="hiw-section-head"><div><span>01 / SYSTEM LAYERS</span><h2>一套完整的 Collection<br/>生产基础设施</h2></div><p>不是把多个工具简单串联。AURA 使用统一项目上下文，让主体约束、属性规则、生成资产和链上 Metadata 在同一条数据链路中持续传递。</p></header>
    <div className="layer-stack">{layers.map(([no,code,title,text],i)=><article key={no}><div className="layer-id"><i>{no}</i><span>{code}</span></div><h3>{title}</h3><p>{text}</p><b>{i<layers.length-1?"↓":"✓"}</b></article>)}</div>
  </section>

  <section className="hiw-pipeline">
    <header className="hiw-section-head"><div><span>02 / EXECUTION PIPELINE</span><h2>六个阶段，<br/>每一步都可确认。</h2></div><p>先锁定主体，再扩大生成；先完成质量验证，再发起不可逆的链上交易。用户始终拥有方向选择权和最终签名权。</p></header>
    <div className="hiw-stage-grid">{stages.map((stage,i)=><article key={stage.no}>
      <header><i>{stage.no}</i><span>{stage.code}</span><b>{i<stages.length-1?"→":"✓"}</b></header><h3>{stage.title}</h3><p>{stage.text}</p><div className="stage-tags">{stage.tags.map(tag=><span key={tag}>{tag}</span>)}</div><footer><span><small>INPUT</small>{stage.input}</span><i>→</i><span><small>OUTPUT</small>{stage.output}</span></footer>
    </article>)}</div>
  </section>

  <section className="hiw-validation">
    <div className="validation-copy"><span>03 / QUALITY GATE</span><h2>生成不是终点，<br/>通过验证才是。</h2><p>大规模系列最难的不是“多”，而是每件作品都能保持主体一致、属性合法并拥有正确的 Metadata。AURA 在封装前设置四类质量关卡。</p><div>{checks.map(([code,title,text])=><article key={code}><i>✓</i><span><small>{code}</small><b>{title}</b><p>{text}</p></span></article>)}</div></div>
    <aside className="validation-terminal">
      <header><span>validation.report</span><b>PASS</b></header>
      <div className="terminal-body"><code><em>01</em> load collection_manifest.json</code><code><em>02</em> verify subject identity constraints</code><code><em>03</em> scan perceptual duplicate distance</code><code><em>04</em> resolve trait conflict graph</code><code><em>05</em> validate ERC-721 metadata schema</code><code><em>06</em> bind asset CID to token records</code><code className="terminal-success"><em>✓</em> package verified — ready to publish</code></div>
      <footer><span>ASSETS</span><b>Selected batch</b><span>OUTPUT</span><b>Metadata Ready</b></footer>
    </aside>
  </section>

  <section className="hiw-chain">
    <header className="hiw-section-head"><div><span>04 / ONCHAIN SETTLEMENT</span><h2>一次钱包签名，<br/>完成可验证发布。</h2></div><p>合约地址、资源 URI 和 Mint 参数由 AURA 自动编排。钱包只在最后一步请求用户确认，交易成功后写入创作记录和链上记录。</p></header>
    <div className="chain-lifecycle">
      <article><i>1</i><span><small>PIN ASSETS</small><b>图片与 Metadata 写入 IPFS</b><p>为选中作品创建内容寻址的资产 URI。</p></span></article><b>→</b>
      <article><i>2</i><span><small>AUTHORIZE</small><b>签发短时 EIP-712 授权</b><p>绑定钱包、Token URI、数量、价格、Nonce 与期限。</p></span></article><b>→</b>
      <article><i>3</i><span><small>WALLET SIGN</small><b>用户确认 Robinhood 交易</b><p>钱包展示交易参数并由用户发起最终签名。</p></span></article><b>→</b>
      <article><i>4</i><span><small>FINALITY</small><b>记录 Token 与交易结果</b><p>在历史页面同步图像、Token ID 和 Explorer 链接。</p></span></article>
    </div>
    <div className="chain-contract"><span><i/> LIVE ON ROBINHOOD MAINNET</span><code>0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65</code><a href="https://robinhoodchain.blockscout.com/address/0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65" target="_blank" rel="noreferrer">验证合约 ↗</a></div>
  </section>

  <section className="hiw-principles"><div><span>ENGINEERING PRINCIPLES</span><h2>复杂系统，<br/>保持清晰边界。</h2></div><article><i>01</i><b>Human approval</b><p>视觉方向、最终资产和链上交易都由用户明确确认。</p></article><article><i>02</i><b>Deterministic data</b><p>图片、属性、编号与 Token URI 保持确定性映射。</p></article><article><i>03</i><b>Verifiable execution</b><p>IPFS 资产、签名授权和交易结果均可独立验证。</p></article></section>

  <section className="hiw-cta"><span>BUILD THE COLLECTION</span><h2>把一个创意主体，<br/>变成完整的链上系列。</h2><p>从方向验证开始，在真正 Mint 前保持每一步可审查、可替换。</p><div><a href="/studio">进入创作引擎 →</a><a href="/audit">安全与合约审计</a></div></section>
</main>}
