import SiteHeader from "../components/SiteHeader";

const features=[
  ["01","Subject consistency engine","Lock silhouette, face, logo and key structures while varying outfits, materials, accessories, poses and scenes."],
  ["02","Fast batch variations","Generate up to four candidates per request, then run additional batches to grow the collection without one-by-one waiting."],
  ["03","Trait and rarity orchestration","Define trait categories, combination rules and probabilities to prevent conflicts and create explainable rarity."],
  ["04","Standard metadata output","Create names, IDs, descriptions, traits and standard JSON with a one-to-one asset mapping."],
  ["05","Human review and regeneration","Preview, select, lock and regenerate before publishing so creators keep final control."],
  ["06","Robinhood Mainnet publishing","Connect a compatible wallet to configure, mint and display generated assets onchain."],
] as const;

export default function Features(){return <main><SiteHeader/><section className="sub-hero"><span>PRODUCT CAPABILITIES</span><h1>Turn one image into a<br/><em>publish-ready NFT collection.</em></h1><p>AURA unifies subject control, batch variations, optimized assets, trait orchestration, metadata and onchain preparation in one workflow.</p><a href="/studio">Launch Studio →</a></section><section className="feature-page-grid">{features.map(x=><article key={x[0]}><i>{x[0]}</i><h2>{x[1]}</h2><p>{x[2]}</p></article>)}</section><section className="page-cta"><span>ONE SUBJECT · THOUSANDS OF POSSIBILITIES</span><h2>Scale generation without losing brand consistency.</h2><a href="/how-it-works">See how it works →</a></section></main>}
