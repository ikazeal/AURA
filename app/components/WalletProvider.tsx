"use client";

import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";

export type Eip1193Provider={request:(args:{method:string;params?:unknown[]|Record<string,unknown>})=>Promise<unknown>;on?:(event:string,handler:(value:unknown)=>void)=>void;removeListener?:(event:string,handler:(value:unknown)=>void)=>void};
type WalletInfo={uuid:string;name:string;icon:string;rdns:string};
type WalletOption={info:WalletInfo;provider:Eip1193Provider};

const CHAIN={chainId:"0x1237",chainName:"Robinhood Chain",nativeCurrency:{name:"Ether",symbol:"ETH",decimals:18},rpcUrls:["https://rpc.mainnet.chain.robinhood.com"],blockExplorerUrls:["https://robinhoodchain.blockscout.com"]};

type WalletContextValue={wallet:string;rememberedWallet:string;walletName:string;walletIcon:string;chainId:string;connected:boolean;provider:Eip1193Provider|null;openWallets:()=>void;disconnect:()=>Promise<void>;ensureRobinhood:()=>Promise<boolean>};
const WalletContext=createContext<WalletContextValue|null>(null);

const fallbackWallets=[
  {name:"MetaMask",url:"https://metamask.io/download/"},
  {name:"Coinbase Wallet",url:"https://www.coinbase.com/wallet/downloads"},
  {name:"Rabby Wallet",url:"https://rabby.io/"},
  {name:"Robinhood Wallet",url:"https://robinhood.com/us/en/about/crypto/"},
] as const;

function WalletBrandIcon({name}:{name:string}){
  if(name==="Robinhood Wallet")return <img className="wallet-brand-logo" src="/brand/robinhood.ico" alt=""/>;
  if(name==="Coinbase Wallet")return <svg className="wallet-brand-logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#0052ff"/><circle cx="16" cy="16" r="9" fill="#fff"/><rect x="12" y="12" width="8" height="8" rx="2" fill="#0052ff"/></svg>;
  if(name==="Rabby Wallet")return <svg className="wallet-brand-logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#7084ff"/><path d="M10 8c0-3 2-5 4-5v8m8-3c0-3-2-5-4-5v8" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M8 17c0-5 3-8 8-8s8 3 8 8-3 9-8 9-8-4-8-9Z" fill="#fff"/><circle cx="13" cy="17" r="1.3" fill="#7084ff"/><circle cx="19" cy="17" r="1.3" fill="#7084ff"/><path d="M14 21h4" stroke="#7084ff" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  return <svg className="wallet-brand-logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#fff4ea"/><path d="m5 8 7-4 4 4 4-4 7 4-3 15-8 5-8-5Z" fill="#f6851b"/><path d="m12 4 4 4-3 8-8-8m15-4-4 4 3 8 8-8M8 23l5-7 3 3 3-3 5 7-8 5Z" fill="#e2761b"/><path d="m13 16 3-8 3 8-3 3Z" fill="#763d16"/></svg>;
}

export function WalletProvider({children}:{children:React.ReactNode}){
  const [options,setOptions]=useState<WalletOption[]>([]);const [active,setActive]=useState<WalletOption|null>(null);const [wallet,setWallet]=useState("");const [rememberedWallet,setRememberedWallet]=useState("");const [chainId,setChainId]=useState("");const [open,setOpen]=useState(false);const [busy,setBusy]=useState("");const [message,setMessage]=useState("");
  const clear=useCallback(()=>{setActive(null);setWallet("");setRememberedWallet("");setChainId("");setMessage("");localStorage.removeItem("aura-wallet-session")},[]);

  useEffect(()=>{const timer=window.setTimeout(()=>{try{const saved=JSON.parse(localStorage.getItem("aura-wallet-session")||"{}") as {address?:string};if(saved.address)setRememberedWallet(saved.address)}catch{localStorage.removeItem("aura-wallet-session")}},0);return()=>window.clearTimeout(timer)},[]);

  useEffect(()=>{
    const announced=new Map<string,WalletOption>();
    const announce=(event:Event)=>{const detail=(event as CustomEvent<WalletOption>).detail;if(!detail?.info?.uuid||!detail.provider)return;announced.set(detail.info.uuid,detail);setOptions([...announced.values()])};
    window.addEventListener("eip6963:announceProvider",announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    const legacy=(window as typeof window&{ethereum?:Eip1193Provider}).ethereum;
    const timer=window.setTimeout(()=>{if(!announced.size&&legacy){const option={info:{uuid:"legacy-injected",name:"Browser Wallet",icon:"",rdns:"injected"},provider:legacy};announced.set(option.info.uuid,option);setOptions([option])}},250);
    return()=>{window.clearTimeout(timer);window.removeEventListener("eip6963:announceProvider",announce)};
  },[]);

  useEffect(()=>{const saved=localStorage.getItem("aura-wallet-session");if(!saved||!options.length||active)return;try{const session=JSON.parse(saved) as {uuid:string;rdns?:string;name?:string;address?:string};const found=options.find(x=>x.info.uuid===session.uuid)||options.find(x=>session.rdns&&x.info.rdns===session.rdns)||options.find(x=>session.name&&x.info.name===session.name);if(!found)return;(async()=>{const accounts=await found.provider.request({method:"eth_accounts"}) as string[];if(!accounts[0])return;const current=await found.provider.request({method:"eth_chainId"}) as string;setActive(found);setWallet(accounts[0]);setRememberedWallet(accounts[0]);setChainId(current)})().catch(()=>setWallet(""))}catch{localStorage.removeItem("aura-wallet-session")}},[options,active]);

  useEffect(()=>{if(!active?.provider.on)return;const accounts=(value:unknown)=>{const list=value as string[];if(list[0])setWallet(list[0]);else clear()};const chain=(value:unknown)=>setChainId(String(value));active.provider.on("accountsChanged",accounts);active.provider.on("chainChanged",chain);return()=>{active.provider.removeListener?.("accountsChanged",accounts);active.provider.removeListener?.("chainChanged",chain)}},[active,clear]);

  const switchChain=useCallback(async(provider:Eip1193Provider)=>{try{await provider.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN.chainId}]})}catch(error){const code=(error as {code?:number}).code;if(code!==4902&&code!==-32603)throw error;await provider.request({method:"wallet_addEthereumChain",params:[CHAIN]})}const current=await provider.request({method:"eth_chainId"}) as string;if(current.toLowerCase()!==CHAIN.chainId)throw new Error("WRONG_CHAIN");setChainId(current);return true},[]);

  const connect=async(option:WalletOption)=>{setBusy(option.info.uuid);setMessage("");try{const accounts=await option.provider.request({method:"eth_requestAccounts"}) as string[];if(!accounts[0])throw new Error("NO_ACCOUNT");await switchChain(option.provider);setActive(option);setWallet(accounts[0]);setRememberedWallet(accounts[0]);localStorage.setItem("aura-wallet-session",JSON.stringify({uuid:option.info.uuid,rdns:option.info.rdns,name:option.info.name,address:accounts[0]}));setOpen(false)}catch(error){setMessage((error as Error).message.includes("WRONG_CHAIN")?"Only Robinhood Mainnet is supported (Chain ID 4663)":"Connection incomplete. Approve the request and network switch in your wallet.")}finally{setBusy("")}};
  const disconnect=useCallback(async()=>{if(active)try{await active.provider.request({method:"wallet_revokePermissions",params:[{eth_accounts:{}}]})}catch{setMessage("")}clear();setOpen(false)},[active,clear]);
  const ensureRobinhood=useCallback(async()=>active?switchChain(active.provider):false,[active,switchChain]);
  const value=useMemo(()=>({wallet,rememberedWallet,walletName:active?.info.name||"",walletIcon:active?.info.icon||"",chainId,connected:Boolean(wallet&&active),provider:active?.provider||null,openWallets:()=>setOpen(true),disconnect,ensureRobinhood}),[wallet,rememberedWallet,active,chainId,disconnect,ensureRobinhood]);

  return <WalletContext.Provider value={value}>
    {children}
    {open&&<div className="wallet-modal" role="dialog" aria-modal="true" aria-label="Connect wallet">
      <section>
        <button className="wallet-close" onClick={()=>setOpen(false)} aria-label="Close wallet dialog">×</button>
        <header><span>ROBINHOOD MAINNET</span><h2>{wallet?"Wallet connected":"Choose a wallet"}</h2><p>{wallet?"Manage this connection or safely end the local session.":"Connect an EIP-6963 compatible EVM wallet and switch to Robinhood Chain automatically."}</p></header>
        {wallet?<div className="wallet-connected">
          <div>{active?.info.icon?<img src={active.info.icon} alt=""/>:<i className="wallet-fallback-logo">{active?.info.name.slice(0,1)}</i>}<span><b>{active?.info.name}</b><small>{wallet.slice(0,6)}…{wallet.slice(-4)}</small></span><em>Connected</em></div>
          <dl><div><dt>Network</dt><dd>Robinhood Mainnet</dd></div><div><dt>Chain ID</dt><dd>4663</dd></div><div><dt>Gas Token</dt><dd>ETH</dd></div></dl>
          <a className="wallet-history-link" href="/history" onClick={()=>setOpen(false)}>View creations and onchain activity <span>→</span></a>
          <button className="wallet-disconnect" onClick={disconnect}>Disconnect wallet</button>
        </div>:<>
          <div className="detected-wallets">{options.length?options.map(option=><button key={option.info.uuid} onClick={()=>connect(option)} disabled={Boolean(busy)}>{option.info.icon?<img src={option.info.icon} alt=""/>:<i className="wallet-fallback-logo">{option.info.name.slice(0,1)}</i>}<span><b>{option.info.name}</b><small>{busy===option.info.uuid?"Waiting for wallet approval…":"Detected · Connect"}</small></span><em>→</em></button>):<div className="no-wallet"><b>No browser wallet detected</b><p>Install a compatible wallet below, then refresh the page.</p></div>}</div>
          <div className="supported-wallets"><small>Compatible wallets</small><div>{fallbackWallets.map(item=><a href={item.url} target="_blank" rel="noreferrer" key={item.name}><WalletBrandIcon name={item.name}/><span>{item.name}</span></a>)}</div></div>
          {message&&<p className="wallet-error">{message}</p>}
          <footer><img src="/brand/robinhood.ico" alt="Robinhood"/><span><b>Robinhood Chain only</b><small>Chain ID 4663 · Gas ETH</small></span></footer>
        </>}
      </section>
    </div>}
  </WalletContext.Provider>;
}

export function useWallet(){const value=useContext(WalletContext);if(!value)throw new Error("useWallet must be used inside WalletProvider");return value}
