import type {Metadata} from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata:Metadata={
  title:"Contract audit and deployment proof | AURA",
  description:"Deployment proof, internal security assessment, controls and independent audit status for AURA Collection V2 on Robinhood Mainnet.",
};

const contract="0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65";
const deployTx="0xd90eecdfc6f7071109c6731b8b8fa744cbc3d39adad9ac287f9657f33290e41e";
const explorer="https://robinhoodchain.blockscout.com";

const checks=[
  ["Access control","Passed","Owner permissions cover pausing, signer rotation, price changes and contract revenue withdrawal."],
  ["Mint authorization","Passed","Every batch mint requires EIP-712 authorization issued by AURA's publishing service."],
  ["Replay protection","Passed","A per-payer nonce increments after minting so authorization cannot be reused."],
  ["Authorization expiry","Passed","Authorization includes a deadline and expired signatures cannot execute."],
  ["Parameter binding","Passed","Payer, recipient, URI hash, quantity, value, nonce and deadline are signature-bound."],
  ["Supply and batch limits","Passed","Maximum supply is 1,000,000; each transaction may mint up to 50 tokens."],
  ["Reentrancy protection","Passed","Mint and withdrawal flows use ReentrancyGuard and failed transfers revert atomically."],
  ["Independent audit","Pending","No formal report or certification has yet been issued by an independent security firm."],
] as const;

const controls=[
  ["EIP-712","Domain-separated signatures","Signatures bind AURA Collection and Robinhood Mainnet to reduce cross-contract and cross-network replay risk."],
  ["NONCE","Single-use authorization","Each payer has an independent nonce that increments immediately after minting."],
  ["PAUSABLE","Emergency pause","The owner may pause public minting during an incident and resume after review."],
  ["SUPPLY CAP","Fixed supply cap","Contract checks prevent cumulative supply from exceeding the configured cap."],
  ["EXACT VALUE","Exact payment","Transaction value must exactly match the onchain quoteMint result."],
  ["URI BINDING","Asset binding","The token URI list is hashed into the authorization to prevent post-signature substitution."],
] as const;

export default function AuditPage(){return <main className="audit-page">
  <SiteHeader/>
  <section className="audit-hero">
    <div className="audit-hero-copy"><span>AURA SECURITY CENTER / REPORT AURA-SEC-2026-001</span><h1>Contract deployment proof<br/>and security assessment</h1><p>Public evidence of the AURA Collection V2 deployment, core security controls, internal review scope and outstanding independent audit work.</p><div className="audit-hero-actions"><a href={`${explorer}/address/${contract}`} target="_blank" rel="noreferrer">View contract on Explorer ↗</a><a href="#assessment">Read assessment ↓</a></div></div>
    <aside className="audit-certificate" aria-label="AURA internal security assessment status">
      <header><span>AURA / SECURITY</span><i>01</i></header><div className="audit-shield">✓</div><small>ASSESSMENT STATUS</small><h2>Internal security assessment<br/><em>Complete</em></h2><p>Deployment and critical controls verified.<br/>This statement is not a third-party audit certification.</p><footer><span>2026-09-12</span><b>ROBINHOOD MAINNET · 4663</b></footer>
    </aside>
  </section>

  <section className="audit-status-grid" aria-label="Audit status overview">
    <article className="passed"><i>✓</i><span><small>ONCHAIN DEPLOYMENT</small><b>Mainnet deployment verified</b></span></article>
    <article className="passed"><i>✓</i><span><small>INTERNAL REVIEW</small><b>Internal security assessment complete</b></span></article>
    <article className="passed"><i>✓</i><span><small>FUNCTION CHECK</small><b>Authorized mint flow verified</b></span></article>
    <article className="pending"><i>!</i><span><small>INDEPENDENT AUDIT</small><b>Independent audit pending</b></span></article>
  </section>

  <section className="audit-deployment">
    <div className="audit-section-title"><span>01 / DEPLOYMENT PROOF</span><h2>Independently verifiable deployment</h2><p>The following identifiers can be verified independently through the Robinhood Chain explorer or RPC.</p></div>
    <div className="deployment-card"><header><div><i/>LIVE CONTRACT</div><b>AURA Collection V2</b></header><dl>
      <div><dt>Network</dt><dd>Robinhood Mainnet · Chain ID 4663</dd></div>
      <div><dt>Contract address</dt><dd><a href={`${explorer}/address/${contract}`} target="_blank" rel="noreferrer">{contract} ↗</a></dd></div>
      <div><dt>Deployment transaction</dt><dd><a href={`${explorer}/tx/${deployTx}`} target="_blank" rel="noreferrer">{deployTx} ↗</a></dd></div>
      <div><dt>Deployment block</dt><dd>60,449,548</dd></div>
      <div><dt>Deployment owner</dt><dd>0xD3894E8F239F5e24D8298C5Cd8e69804e1fDD56D</dd></div>
      <div><dt>Authorized signer</dt><dd>0x9c624b7E2d78eF47c6276251d254cbFe80B46cb6</dd></div>
      <div><dt>Runtime bytecode</dt><dd>10,013 bytes</dd></div>
      <div><dt>Bytecode fingerprint</dt><dd>0x10a27d95d9442cb3ae9db2223481d4ce7d18f292cb9ccdfcca3fe0964844bbc3</dd></div>
    </dl><footer><span>Transaction status: successful</span><span>Total supply at deployment: 0</span><span>Mint price: 0 ETH</span><span>Per-transaction limit: 50</span></footer></div>
  </section>

  <section className="audit-controls">
    <div className="audit-section-title"><span>02 / SECURITY CONTROLS</span><h2>Active contract protections</h2><p>V2 replaces unrestricted public minting with short-lived, single-use authorization bound to all transaction parameters.</p></div>
    <div className="control-grid">{controls.map(([code,title,note])=><article key={code}><span>{code}</span><i>✓</i><h3>{title}</h3><p>{note}</p></article>)}</div>
  </section>

  <section className="audit-assessment" id="assessment">
    <div className="audit-section-title"><span>03 / REVIEW MATRIX</span><h2>Internal code review results</h2><p>Assessment based on AuraCollectionV2.sol, deployment parameters and observed mainnet state.</p></div>
    <div className="assessment-table"><header><span>Check</span><span>Status</span><span>Conclusion</span></header>{checks.map(([title,status,note])=><div key={title}><b>{title}</b><em className={status==="Passed"?"ok":"wait"}>{status}</em><p>{note}</p></div>)}</div>
  </section>

  <section className="audit-boundary">
    <div><span>04 / ASSURANCE BOUNDARY</span><h2>Assurance boundary and outstanding work</h2><p>Professional security disclosure must state both what has and has not been verified. This page documents AURA's internal technical assessment and onchain deployment evidence; it is <strong>not an audit certificate issued by an independent security firm.</strong></p></div>
    <ol><li><b>Explorer source verification</b><span>Blockscout currently shows unverified source. Compiler version, optimizer settings and constructor arguments should be submitted.</span></li><li><b>Independent audit</b><span>Before operating at scale, an independent firm should review business logic, permissions, signing services and failure paths.</span></li><li><b>Production key and permission governance</b><span>The owner should migrate to a multisig wallet; the authorized signer should use an isolated production key with rotation and monitoring.</span></li><li><b>Infrastructure and asset availability</b><span>Pinata/IPFS, RPC and publishing endpoints require rate limits, alerts, backups and recovery procedures.</span></li></ol>
  </section>

  <section className="audit-cta"><span>VERIFY, THEN PUBLISH</span><h2>Verify every step before signing.</h2><div><a href="/studio">Launch Studio →</a><a href="/whitepaper">Read the whitepaper</a></div></section>
</main>}
