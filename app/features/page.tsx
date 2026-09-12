import SiteHeader from "../components/SiteHeader";

const features=[
  ["01","主体一致性引擎","锁定角色轮廓、面部、Logo 与关键结构，只让服装、材质、配件、动作和场景发生可控变化。"],
  ["02","批量变体生成","从少量方向验证扩展至 100、1,000 或 10,000 件系列，减少手工拼装图层与重复出图。"],
  ["03","属性与稀有度编排","建立 Trait 分类、组合限制和出现概率，避免冲突属性，并形成可解释的稀有度体系。"],
  ["04","标准元数据输出","为每件作品生成名称、编号、描述、属性与标准 JSON，图片和元数据一一对应。"],
  ["05","人工筛选与重生成","在正式发行前完成预览、筛选、锁定和局部重生成，让创作者保留最终决定权。"],
  ["06","Robinhood 主网发布","连接兼容钱包，完成系列配置、Mint 与链上展示，把生成资产衔接到发行流程。"],
] as const;

export default function Features(){return <main><SiteHeader/><section className="sub-hero"><span>PRODUCT CAPABILITIES</span><h1>从一个创意，完成一个<br/><em>可发行的 NFT 系列。</em></h1><p>AURA 不止生成图片，而是把主体控制、系列扩展、属性编排、元数据和上链准备整合为一套工作流。</p><a href="/studio">进入创作引擎 →</a></section><section className="feature-page-grid">{features.map(x=><article key={x[0]}><i>{x[0]}</i><h2>{x[1]}</h2><p>{x[2]}</p></article>)}</section><section className="page-cta"><span>ONE SUBJECT · THOUSANDS OF POSSIBILITIES</span><h2>让规模化生成，仍然保持品牌一致。</h2><a href="/how-it-works">查看工作原理 →</a></section></main>}
