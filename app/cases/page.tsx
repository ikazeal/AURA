import SiteHeader from "../components/SiteHeader";
import {industryProjects} from "../data/ecosystem";

const cases=[
  ["极地漫游者","CHARACTER IP","1,024","/brand/aura-nft-01.jpg","固定角色比例，以环境、服装和材质建立探险系列。"],
  ["霓虹城市","COMMUNITY PFP","3,333","/brand/aura-nft-03.jpg","通过灯光、街区与配饰形成高识别度社区头像。"],
  ["自然之灵","BRAND COLLECTIBLE","1,000","/brand/aura-nft-08.jpg","将品牌绿色视觉扩展至自然主题与会员收藏场景。"],
  ["水晶边界","GAME ASSET","10,000","/brand/aura-nft-09.jpg","以装备、区域和能量属性构建可扩展角色资产。"],
] as const;
export default function Cases(){return <main><SiteHeader/><section className="sub-hero cases-hero"><span>COLLECTION STUDIES</span><h1>一个主体，建立不同的<br/><em>视觉系列。</em></h1><p>以下为 AURA 概念案例，展示同一角色如何在保持识别一致的同时，进入不同主题与应用场景。</p><a href="/studio">创建我的系列 →</a></section><section className="case-showcase"><header><div><span>SELECTED DIRECTIONS</span><h2>AURA 生成案例</h2></div><p>统一主体 · 可控属性 · 批量输出</p></header><div className="case-page-grid">{cases.map((x,i)=><article key={x[0]}><div className="case-visual"><img src={x[3]} alt={x[0]}/><span>0{i+1}</span><b>{x[1]}</b></div><div className="case-copy"><small>{x[2]} ITEMS</small><h2>{x[0]}</h2><p>{x[4]}</p><a href="/studio">使用此方向 <b>↗</b></a></div></article>)}</div><footer><b>这些案例说明什么？</b><p>AURA 先锁定主体身份，再将背景、材质、服装和稀有属性作为可组合变量，因此系列可以扩展而不失去核心识别。</p><a href="/how-it-works">查看生成方法 →</a></footer></section><section className="reference-projects"><header><div><span>INDUSTRY REFERENCES</span><h2>值得研究的 NFT 系列</h2></div><p>以下为公开行业参考项目，并非 AURA 客户或合作伙伴。</p></header><div>{industryProjects.map(item=><a href={item.url} target="_blank" rel="noreferrer" key={item.name}><figure><img src={item.image} alt={`${item.name} 项目视觉`}/><i>↗</i></figure><small>{item.category} · {item.count}</small><h3>{item.name}</h3><p>查看项目官方网站与公开资料</p></a>)}</div></section></main>}
