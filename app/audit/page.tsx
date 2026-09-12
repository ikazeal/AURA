import type {Metadata} from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata:Metadata={
  title:"合约审计与部署证明 | AURA",
  description:"AURA Collection V2 在 Robinhood Mainnet 的部署证明、内部安全评估、控制措施与独立审计状态。",
};

const contract="0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65";
const deployTx="0xd90eecdfc6f7071109c6731b8b8fa744cbc3d39adad9ac287f9657f33290e41e";
const explorer="https://robinhoodchain.blockscout.com";

const checks=[
  ["访问控制","通过","Owner 权限用于暂停、签名者轮换、价格调整与提取合约收入。"],
  ["Mint 授权","通过","每次批量 Mint 必须携带 AURA 发布服务签发的 EIP-712 授权。"],
  ["重放保护","通过","以付款钱包为维度递增 nonce，同一份授权不能再次使用。"],
  ["授权时效","通过","授权包含 deadline，过期签名无法执行。"],
  ["参数绑定","通过","付款方、接收方、URI 哈希、数量、金额、nonce 与期限均被签名绑定。"],
  ["供应与批量限制","通过","总量上限 1,000,000；单笔最多 Mint 50 件。"],
  ["重入防护","通过","Mint 与提取流程采用 ReentrancyGuard，转账失败会整体回滚。"],
  ["第三方独立审计","待完成","尚未获得独立安全公司的正式审计报告或认证。"],
] as const;

const controls=[
  ["EIP-712","域隔离签名","签名绑定 AURA Collection 与 Robinhood Mainnet，减少跨合约、跨网络复用风险。"],
  ["NONCE","一次性授权","每个付款地址拥有独立 nonce，成功 Mint 后立即递增。"],
  ["PAUSABLE","紧急停止","Owner 可在异常情况下暂停公开 Mint，并在排查后恢复。"],
  ["SUPPLY CAP","固定供应上限","合约级检查阻止累计发行量超过预设上限。"],
  ["EXACT VALUE","精确付款","交易金额必须与链上 quoteMint 结果完全一致。"],
  ["URI BINDING","资产绑定","Token URI 列表经哈希后进入授权，防止签名后替换资产。"],
] as const;

export default function AuditPage(){return <main className="audit-page">
  <SiteHeader/>
  <section className="audit-hero">
    <div className="audit-hero-copy"><span>AURA SECURITY CENTER / REPORT AURA-SEC-2026-001</span><h1>合约部署证明<br/>与安全评估</h1><p>公开呈现 AURA Collection V2 的链上部署事实、核心安全控制、内部检查范围和仍待完成的独立审计事项。</p><div className="audit-hero-actions"><a href={`${explorer}/address/${contract}`} target="_blank" rel="noreferrer">在 Explorer 查看合约 ↗</a><a href="#assessment">阅读评估结果 ↓</a></div></div>
    <aside className="audit-certificate" aria-label="AURA 内部安全评估状态">
      <header><span>AURA / SECURITY</span><i>01</i></header><div className="audit-shield">✓</div><small>ASSESSMENT STATUS</small><h2>内部安全评估<br/><em>已完成</em></h2><p>链上部署及关键控制已核验。<br/>本说明不等同于第三方审计认证。</p><footer><span>2026-09-12</span><b>ROBINHOOD MAINNET · 4663</b></footer>
    </aside>
  </section>

  <section className="audit-status-grid" aria-label="审计状态总览">
    <article className="passed"><i>✓</i><span><small>ONCHAIN DEPLOYMENT</small><b>主网部署已验证</b></span></article>
    <article className="passed"><i>✓</i><span><small>INTERNAL REVIEW</small><b>内部安全评估已完成</b></span></article>
    <article className="passed"><i>✓</i><span><small>FUNCTION CHECK</small><b>授权 Mint 流程已验证</b></span></article>
    <article className="pending"><i>!</i><span><small>INDEPENDENT AUDIT</small><b>第三方独立审计待完成</b></span></article>
  </section>

  <section className="audit-deployment">
    <div className="audit-section-title"><span>01 / DEPLOYMENT PROOF</span><h2>可独立验证的链上部署</h2><p>以下标识均可在 Robinhood Chain 区块浏览器或 RPC 节点独立核验。</p></div>
    <div className="deployment-card"><header><div><i/>LIVE CONTRACT</div><b>AURA Collection V2</b></header><dl>
      <div><dt>网络</dt><dd>Robinhood Mainnet · Chain ID 4663</dd></div>
      <div><dt>合约地址</dt><dd><a href={`${explorer}/address/${contract}`} target="_blank" rel="noreferrer">{contract} ↗</a></dd></div>
      <div><dt>部署交易</dt><dd><a href={`${explorer}/tx/${deployTx}`} target="_blank" rel="noreferrer">{deployTx} ↗</a></dd></div>
      <div><dt>部署区块</dt><dd>60,449,548</dd></div>
      <div><dt>部署所有者</dt><dd>0xD3894E8F239F5e24D8298C5Cd8e69804e1fDD56D</dd></div>
      <div><dt>授权签名者</dt><dd>0x9c624b7E2d78eF47c6276251d254cbFe80B46cb6</dd></div>
      <div><dt>运行字节码</dt><dd>10,013 bytes</dd></div>
      <div><dt>字节码指纹</dt><dd>0x10a27d95d9442cb3ae9db2223481d4ce7d18f292cb9ccdfcca3fe0964844bbc3</dd></div>
    </dl><footer><span>交易状态：成功</span><span>部署时总铸造量：0</span><span>Mint 价格：0 ETH</span><span>单笔上限：50</span></footer></div>
  </section>

  <section className="audit-controls">
    <div className="audit-section-title"><span>02 / SECURITY CONTROLS</span><h2>合约中的主动防护</h2><p>V2 将可 Mint 权限从任意公开调用改为短时、一次性、全参数绑定的授权流程。</p></div>
    <div className="control-grid">{controls.map(([code,title,note])=><article key={code}><span>{code}</span><i>✓</i><h3>{title}</h3><p>{note}</p></article>)}</div>
  </section>

  <section className="audit-assessment" id="assessment">
    <div className="audit-section-title"><span>03 / REVIEW MATRIX</span><h2>内部代码检查结果</h2><p>评估依据当前仓库中的 AuraCollectionV2.sol、部署参数及主网运行状态。</p></div>
    <div className="assessment-table"><header><span>检查项</span><span>状态</span><span>结论</span></header>{checks.map(([title,status,note])=><div key={title}><b>{title}</b><em className={status==="通过"?"ok":"wait"}>{status}</em><p>{note}</p></div>)}</div>
  </section>

  <section className="audit-boundary">
    <div><span>04 / ASSURANCE BOUNDARY</span><h2>认证边界与待完成事项</h2><p>专业的安全披露必须同时说明“已验证什么”和“尚未验证什么”。本页是 AURA 团队的内部技术评估与链上部署证明，<strong>不是由第三方安全公司签发的审计证书</strong>。</p></div>
    <ol><li><b>区块浏览器源码验证</b><span>当前 Blockscout 显示合约源码尚未公开验证，应提交编译器版本、优化参数与构造参数。</span></li><li><b>第三方独立审计</b><span>公开规模化运营前，应由独立机构复核业务逻辑、权限面、签名服务与异常路径。</span></li><li><b>生产密钥与权限治理</b><span>Owner 建议迁移至多签钱包；授权签名者使用隔离的生产密钥并建立轮换和监控机制。</span></li><li><b>基础设施与资产可用性</b><span>Pinata/IPFS、RPC、发布接口需要速率限制、告警、备份和故障恢复策略。</span></li></ol>
  </section>

  <section className="audit-cta"><span>VERIFY, THEN PUBLISH</span><h2>在签名前，让每一步都可验证。</h2><div><a href="/studio">进入创作引擎 →</a><a href="/whitepaper">阅读白皮书</a></div></section>
</main>}
