"use client";

import Link from "next/link";
import {useState} from "react";
import {useWallet} from "./WalletProvider";

const links=[
  ["/features","Product"],
  ["/studio","Studio"],
  ["/cases","Collections"],
  ["/how-it-works","How it works"],
  ["/whitepaper","Whitepaper"],
  ["/audit","Contract audit"],
] as const;

export default function SiteHeader(){
  const {wallet,walletIcon,walletName,connected,chainId,openWallets}=useWallet();
  const [menuOpen,setMenuOpen]=useState(false);
  const short=wallet?`${wallet.slice(0,6)}…${wallet.slice(-4)}`:"";
  return <header className={`aura-nav site-header ${menuOpen?"menu-open":""}`}>
    <Link className="aura-brand" href="/"><img src="/brand/aura-logo.png" alt="AURA"/><span><b>AURA</b><small>COLLECTION ENGINE</small></span></Link>
    <nav>{links.map(([href,label])=><Link className={href==="/audit"?"audit-nav-link":undefined} href={href} key={href}>{href==="/audit"&&<i aria-hidden="true">✓</i>}{label}</Link>)}</nav>
    <div className="nav-actions"><span className={`mainnet-dot ${connected&&chainId.toLowerCase()!=="0x1237"?"wrong":""}`}><i/>{connected&&chainId.toLowerCase()!=="0x1237"?"Switch to Robinhood Mainnet":"Robinhood Mainnet"}</span><Link className="history-link" href="/history">My creations</Link><button className={`wallet-link ${connected?"connected":""}`} onClick={openWallets} aria-label={connected?"Wallet details":"Connect wallet"}>{connected?(walletIcon?<img src={walletIcon} alt=""/>:<i>{walletName.slice(0,1)}</i>):<svg className="wallet-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h13.5A2.5 2.5 0 0 1 20 9v8.5H6A3 3 0 0 1 3 14.5v-7A2.5 2.5 0 0 1 5.5 5H16"/><path d="M15 11h5v4h-5a2 2 0 1 1 0-4Z"/><circle cx="16" cy="13" r=".8"/></svg>}<span>{connected?short:"Connect wallet"}</span>{connected&&<b>⌄</b>}</button><Link className="nav-cta" href="/studio">Launch studio <b>→</b></Link><button className="mobile-menu-toggle" onClick={()=>setMenuOpen(v=>!v)} aria-expanded={menuOpen} aria-label="Open navigation"><i/><i/></button></div>
    <div className="mobile-nav">{links.map(([href,label])=><Link href={href} key={href} onClick={()=>setMenuOpen(false)}>{label}<b>→</b></Link>)}<Link href="/history" onClick={()=>setMenuOpen(false)}>My creations<b>→</b></Link></div>
  </header>;
}
