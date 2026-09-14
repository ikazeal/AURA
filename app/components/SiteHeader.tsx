"use client";

import Link from "next/link";
import {useState} from "react";
import {useWallet} from "./WalletProvider";
import {useLanguage} from "./LanguageProvider";

const links=[
  ["/features","产品功能"],
  ["/studio","创作引擎"],
  ["/cases","生成案例"],
  ["/how-it-works","工作原理"],
  ["/whitepaper","白皮书"],
  ["/audit","合约审计"],
] as const;

export default function SiteHeader(){
  const {wallet,walletIcon,walletName,connected,chainId,openWallets}=useWallet();
  const {language,toggleLanguage}=useLanguage();
  const [menuOpen,setMenuOpen]=useState(false);
  const short=wallet?`${wallet.slice(0,6)}…${wallet.slice(-4)}`:"";
  return <header className={`aura-nav site-header ${menuOpen?"menu-open":""}`}>
    <Link className="aura-brand" href="/"><img src="/brand/aura-logo.png" alt="AURA"/><span><b>AURA</b><small>COLLECTION ENGINE</small></span></Link>
    <nav>{links.map(([href,label])=><Link className={href==="/audit"?"audit-nav-link":undefined} href={href} key={href}>{href==="/audit"&&<i aria-hidden="true">✓</i>}{label}</Link>)}</nav>
    <div className="nav-actions"><span className={`mainnet-dot ${connected&&chainId.toLowerCase()!=="0x1237"?"wrong":""}`}><i/>{connected&&chainId.toLowerCase()!=="0x1237"?"切换 Robinhood 主网":"Robinhood Mainnet"}</span><button className="language-toggle" onClick={toggleLanguage} aria-label="Switch language">{language==="en"?"中文":"EN"}</button><Link className="history-link" href="/history">我的创作</Link><button className={`wallet-link ${connected?"connected":""}`} onClick={openWallets} aria-label={connected?"钱包详情":"连接钱包"}>{connected?(walletIcon?<img src={walletIcon} alt=""/>:<i>{walletName.slice(0,1)}</i>):<svg className="wallet-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h13.5A2.5 2.5 0 0 1 20 9v8.5H6A3 3 0 0 1 3 14.5v-7A2.5 2.5 0 0 1 5.5 5H16"/><path d="M15 11h5v4h-5a2 2 0 1 1 0-4Z"/><circle cx="16" cy="13" r=".8"/></svg>}<span>{connected?short:"连接钱包"}</span>{connected&&<b>⌄</b>}</button><Link className="nav-cta" href="/studio">开始创作 <b>→</b></Link><button className="mobile-menu-toggle" onClick={()=>setMenuOpen(v=>!v)} aria-expanded={menuOpen} aria-label="Open navigation"><i/><i/></button></div>
    <div className="mobile-nav">{links.map(([href,label])=><Link href={href} key={href} onClick={()=>setMenuOpen(false)}>{label}<b>→</b></Link>)}<Link href="/history" onClick={()=>setMenuOpen(false)}>我的创作<b>→</b></Link><button onClick={()=>{toggleLanguage();setMenuOpen(false)}}>{language==="en"?"切换至中文":"Switch to English"}<b>↗</b></button></div>
  </header>;
}
