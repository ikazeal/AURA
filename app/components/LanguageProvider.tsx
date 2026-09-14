"use client";

import {createContext,useContext,useLayoutEffect,useMemo,useRef,useState} from "react";

export type AuraLanguage="en"|"zh";

const exact:Record<string,string>={
  "产品功能":"Product",
  "创作引擎":"Studio",
  "生成案例":"Collections",
  "工作原理":"How it works",
  "白皮书":"Whitepaper",
  "合约审计":"Contract audit",
  "我的创作":"My creations",
  "连接钱包":"Connect wallet",
  "钱包详情":"Wallet details",
  "开始创作":"Launch studio",
  "切换 Robinhood 主网":"Switch to Robinhood Mainnet",
  "AURA 创作引擎":"AURA Creation Engine",
  "创建你的 NFT Collection":"Create your NFT Collection",
  "生成、配置、上链，全部在一个工作区完成。":"Generate, configure and publish from one workspace.",
  "输入主体":"Define subject",
  "生成与下载":"Generate & download",
  "属性与 Metadata":"Traits & Metadata",
  "Robinhood 上链":"Publish on Robinhood",
  "上传照片或描述主体":"Describe or upload a subject",
  "文字描述":"Text prompt",
  "上传照片":"Upload image",
  "主体描述":"Subject description",
  "生成主体":"Generate subject",
  "主体预览":"Subject preview",
  "选择主体":"Select subject",
  "确认主体":"Confirm subject",
  "已确认":"Confirmed",
  "选择主体图片":"Choose subject image",
  "更换照片":"Replace image",
  "主体清晰、背景简洁的图片效果更佳。":"A clear subject on a simple background works best.",
  "先生成并确认一个主体，再以它扩展完整系列。":"Generate and approve one subject before expanding the collection.",
  "生成系列变体":"Generate collection variants",
  "AURA 图像引擎已连接":"AURA image engine connected",
  "正在连接 AURA 图像引擎":"Connecting to AURA image engine",
  "AURA 图像引擎暂不可用":"AURA image engine unavailable",
  "创作要求":"Creative direction",
  "视觉方向":"Visual style",
  "生成数量":"Output count",
  "3D 收藏品":"3D collectible",
  "PFP 头像":"PFP portrait",
  "像素艺术":"Pixel art",
  "品牌插画":"Brand illustration",
  "请先上传照片":"Upload a subject image first",
  "请先确认主体":"Approve the subject first",
  "请填写创作要求":"Add a creative direction",
  "锁定主体身份并快速扩展服装、配件、材质、场景与稀有属性。":"Lock the subject identity, then expand outfits, accessories, materials, scenes and rarity traits.",
  "选择要进入系列的图片":"Select collection images",
  "批量下载图片 ZIP":"Download image ZIP",
  "返回修改":"Back to edit",
  "命名与发行信息":"Collection identity",
  "系列名称":"Collection name",
  "代号":"Symbol",
  "作品名称前缀":"Item name prefix",
  "系列描述":"Collection description",
  "稀有度模型":"Rarity model",
  "均衡分布":"Balanced distribution",
  "下载发行包":"Download release package",
  "填写发行信息后预览 Metadata":"Complete the collection details to preview Metadata",
  "图片与编号对应":"Images mapped to token IDs",
  "属性与稀有度完整":"Traits and rarity validated",
  "标准 JSON 输出":"Standard JSON output",
  "返回筛选":"Back to selection",
  "请先填写发行信息":"Complete collection details first",
  "发布到 Robinhood Mainnet":"Publish to Robinhood Mainnet",
  "由你的钱包授权并完成链上发行。":"Authorize and publish directly from your wallet.",
  "发行钱包":"Publishing wallet",
  "尚未连接":"Not connected",
  "管理钱包":"Manage wallet",
  "平台费用":"Platform fee",
  "当前状态":"Current status",
  "查看已经上链的作品":"View published collection",
  "上传一张主体照片":"Upload one subject image",
  "AI 生成系列资产":"Generate collection assets",
  "Mint 并进入市场":"Mint and enter the market",
  "锁定主体与品牌识别":"Preserve subject identity",
  "编排 Trait 与稀有属性":"Compose traits and rarity",
  "生成标准 Metadata":"Generate standard Metadata",
  "快速批量生成":"Fast batch generation",
  "OpenSea 市场":"OpenSea marketplace",
  "目前已使用 AURA 的 NFT 品牌":"NFT brands using AURA",
  "一个主体，上千种可能。":"One subject. Thousands of possibilities.",
  "真实 NFT 项目，如何建立系列价值":"How real NFT projects build collection value",
  "把视觉变成 NFT，能带来什么价值？":"What value can an NFT collection create?",
  "可验证的数字所有权":"Verifiable digital ownership",
  "社区身份与访问权限":"Community identity and access",
  "IP 与实体产品延伸":"IP and physical extensions",
  "可编程的长期关系":"Programmable long-term utility",
  "从生成到交易，连接完整 NFT 生命周期。":"From generation to market, one complete NFT lifecycle.",
  "连接钱包开始创作":"Connect wallet to create",
  "浏览 OpenSea 上的 Robinhood NFT":"Explore Robinhood NFTs on OpenSea",
  "产品":"Product",
  "生态与工具":"Ecosystem & tools",
  "官方文档":"Official docs",
  "主网浏览器":"Mainnet explorer",
  "NFT 展示与交易":"NFT display & trading",
  "IPFS 存储":"IPFS storage",
  "去中心化存储协议":"Decentralized storage protocol",
  "智能合约标准":"Smart contract standards",
  "查看审计与部署证明":"View audit & deployment proof",
  "钱包已连接":"Wallet connected",
  "选择钱包":"Choose a wallet",
  "管理当前连接，或安全断开本地会话。":"Manage this connection or safely end the local session.",
  "连接支持 EIP‑6963 的 EVM 钱包，并自动切换至 Robinhood Chain。":"Connect an EIP-6963 compatible EVM wallet and switch to Robinhood Chain automatically.",
  "已连接":"Connected",
  "网络":"Network",
  "查看我的创作与链上记录":"View creations and onchain activity",
  "断开钱包连接":"Disconnect wallet",
  "未检测到浏览器钱包":"No browser wallet detected",
  "请安装下方任一兼容钱包，然后刷新页面。":"Install a compatible wallet below, then refresh the page.",
  "兼容钱包":"Compatible wallets",
  "仅限 Robinhood Chain":"Robinhood Chain only",
  "创作与链上记录":"Creations & onchain activity",
  "本机创作过程与钱包在 AURA Collection 中完成的 Mint 记录，分别保存、相互校验。":"Local creation history and wallet mint activity are kept separately and cross-checked.",
  "刷新链上记录":"Refresh onchain activity",
  "本机创作":"Local creations",
  "链上 NFT":"Onchain NFTs",
  "Mint 交易":"Mint transactions",
  "我的创作记录":"My creation history",
  "已上链的作品":"Published works",
  "继续上传 / Mint":"Continue upload / Mint",
  "发行已完成 · 不可重复 Mint":"Published · cannot be minted again",
  "查看交易":"View transaction",
  "查看链上所有权":"View onchain ownership",
  "展示或出售此 NFT":"Display or list this NFT",
  "查看原始元数据":"View source metadata",
  "摘要":"Abstract",
  "问题与机会":"Problem & opportunity",
  "AURA 解决方案":"The AURA solution",
  "系统架构":"System architecture",
  "NFT 数据模型":"NFT data model",
  "Robinhood Chain 集成":"Robinhood Chain integration",
  "安全与责任边界":"Security & responsibility",
  "路线图":"Roadmap",
  "目录":"Contents",
  "体验创作引擎":"Launch the creation engine",
};

const phrases:Array<[string,string]>=[
  ["AURA Collection V2 已部署至 Robinhood Mainnet","AURA Collection V2 is deployed on Robinhood Mainnet"],
  ["链上部署已验证 · 内部安全评估已完成 · 第三方独立审计待完成","Deployment verified · Internal review complete · Independent audit pending"],
  ["为 Robinhood Chain 而生的","Built for Robinhood Chain"],
  ["生成式 NFT AI 引擎。","Generative NFT infrastructure."],
  ["AURA 致力于打造","AURA is building "],
  ["首个基于 Robinhood Chain 的 NFT 图片 AI 产品","a Robinhood Chain-native AI image platform for NFT collections"],
  ["上传一张主体照片，即可快速批量生成多张","Describe or upload one subject to rapidly generate "],
  ["身份一致、视觉各异","identity-consistent, visually distinct"],
  ["的 NFT 图片，并完成 Trait、IPFS Metadata 与"," NFT assets, complete traits and IPFS Metadata, then publish with "],
  ["上链后可在","Once onchain, display and list on "],
  ["展示、挂牌与交易。","."],
  ["创建 NFT Collection","Create NFT Collection"],
  ["查看技术架构","View architecture"],
  ["早期使用者","early users"],
  ["生态集成","ecosystem integrations"],
  ["Robinhood 原生","Robinhood native"],
  ["锁定人物、角色、产品或 IP 的核心外观，作为整套 NFT 系列的一致身份基准。","Lock the defining appearance of a person, character, product or IP as the identity baseline for the collection."],
  ["单次输出多张相似但不重复的变体","Generate multiple related, non-duplicate variants per batch"],
  ["轻量图片、IPFS Metadata 与钱包签名","Optimized images, IPFS Metadata and wallet signature"],
  ["展示、挂牌与二级交易","Display, list and trade on the secondary market"],
  ["不只生成一张图片，而是快速完成一个","Go beyond a single image. Build a "],
  ["可发行的系列。","publish-ready collection."],
  ["主体保持一致，背景、服装、材质与稀有属性持续变化。","Keep the subject consistent while backgrounds, outfits, materials and rarity traits evolve."],
  ["以下为行业公开案例，并非 AURA 客户案例。","Public industry references; not AURA customer case studies."],
  ["AURA 是独立产品，非 Robinhood 官方产品或合作方。","AURA is an independent product and is not affiliated with Robinhood."],
  ["例如：","Example: "],
  ["正在连接…","Connecting…"],
  ["引擎暂不可用","Engine unavailable"],
  ["生成未完成","Generation incomplete"],
  ["关闭","Close"],
  ["等待钱包确认…","Waiting for wallet approval…"],
  ["已检测到 · 点击连接","Detected · Connect"],
  ["本机保存的创作项目","Creation projects saved on this device"],
  ["该钱包 Mint 的 NFT","NFTs minted by this wallet"],
  ["Robinhood 主网交易","Robinhood Mainnet transactions"],
  ["暂时无法读取 Robinhood Mainnet 记录，请稍后刷新。","Robinhood Mainnet activity is temporarily unavailable. Please refresh shortly."],
  ["出售价格、版税与成交由第三方市场规则及钱包签名决定，AURA 不托管资产。","Pricing, royalties and sales are governed by third-party marketplaces and wallet signatures. AURA never takes custody of assets."],
  ["件 NFT"," NFTs"],
  ["张系列图片"," collection images"],
  ["张"," images"],
];

function toEnglish(value:string){
  const leading=value.match(/^\s*/)?.[0]||"";
  const trailing=value.match(/\s*$/)?.[0]||"";
  let core=value.trim();
  if(!core)return value;
  if(exact[core])return leading+exact[core]+trailing;
  for(const [zh,en] of phrases)core=core.split(zh).join(en);
  return leading+core+trailing;
}

type LanguageContextValue={language:AuraLanguage;setLanguage:(language:AuraLanguage)=>void;toggleLanguage:()=>void};
const LanguageContext=createContext<LanguageContextValue>({language:"en",setLanguage:()=>{},toggleLanguage:()=>{}});

export function LanguageProvider({children}:{children:React.ReactNode}){
  const [language,setLanguageState]=useState<AuraLanguage>("en");
  const originalsRef=useRef(new Map<Node,string>());
  const attrsRef=useRef(new Map<Element,Map<string,string>>());
  useLayoutEffect(()=>{
    const saved=window.localStorage.getItem("aura-language");
    if(saved==="zh"||saved==="en")setLanguageState(saved);
  },[]);
  useLayoutEffect(()=>{
    document.documentElement.lang=language==="en"?"en":"zh-CN";
    document.documentElement.dataset.language=language;
    const originals=originalsRef.current;
    const attrs=attrsRef.current;
    let translating=false;
    const translateRoot=(root:Node)=>{
      if(translating)return;
      translating=true;
      const nodes:Node[]=[];
      if(root.nodeType===Node.TEXT_NODE)nodes.push(root);
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      while(walker.nextNode())nodes.push(walker.currentNode);
      for(const node of nodes){
        const parent=node.parentElement;
        if(!parent||parent.closest("script,style,pre,code"))continue;
        if(!originals.has(node))originals.set(node,node.nodeValue||"");
        const original=originals.get(node)||"";
        node.nodeValue=language==="en"?toEnglish(original):original;
      }
      const elements=root.nodeType===Node.ELEMENT_NODE?[root as Element,...Array.from((root as Element).querySelectorAll("[placeholder],[aria-label],[title]"))]:[];
      for(const el of elements){
        let stored=attrs.get(el);if(!stored){stored=new Map();attrs.set(el,stored)}
        for(const name of ["placeholder","aria-label","title"]){const value=el.getAttribute(name);if(value!==null&&!stored.has(name))stored.set(name,value);const original=stored.get(name);if(original!==undefined)el.setAttribute(name,language==="en"?toEnglish(original):original)}
      }
      translating=false;
    };
    translateRoot(document.body);
    const observer=new MutationObserver(records=>{for(const record of records){if(record.type==="characterData")translateRoot(record.target);else record.addedNodes.forEach(translateRoot)}});
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    return()=>observer.disconnect();
  },[language]);
  const setLanguage=(next:AuraLanguage)=>{window.localStorage.setItem("aura-language",next);setLanguageState(next)};
  const value=useMemo(()=>({language,setLanguage,toggleLanguage:()=>setLanguage(language==="en"?"zh":"en")}),[language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage=()=>useContext(LanguageContext);
