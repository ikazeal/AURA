import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import test, { after } from "node:test";

const port = 3400 + (process.pid % 500);
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  cwd: new URL("..", import.meta.url),
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Next.js test server did not start");
}

await waitForServer();
after(() => server.kill());

async function render(path = "/") {
  return fetch(`${origin}${path}`, { headers: { accept: "text/html" } });
}

test("server-renders the AURA product and studio", async () => {
  for (const path of ["/", "/studio", "/audit"]) {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, /AURA/);
    assert.match(html, /Robinhood Mainnet/i);
  }
});

test("only unminted creations can be restored for IPFS publish and mint", async () => {
  const [history, studio, storage] = await Promise.all([
    readFile(new URL("../app/history/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/creation-history.ts", import.meta.url), "utf8"),
  ]);
  assert.match(history, /\/studio\?restore=/);
  assert.match(history, /Continue upload \/ Mint/);
  assert.match(history, /Published · cannot be minted again/);
  assert.match(studio, /URLSearchParams\(window\.location\.search\)/);
  assert.match(studio, /if\(record\.status==="minted"\)\{window\.location\.replace\("\/history"\)/);
  assert.match(studio, /record\.assets/);
  assert.match(studio, /setStep\(2\)/);
  assert.match(storage, /assets\?:CreationHistoryAsset\[\]/);
});

test("homepage communicates the Robinhood-native product and OpenSea handoff", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /first AI image platform[\s\S]*built on Robinhood Chain/i);
  assert.match(html, /ROBINHOOD CHAIN-NATIVE · GENERATIVE NFT AI/);
  assert.match(html, /OpenSea Ready/);
  assert.match(html, /Display \/ list \/ trade/);
  assert.match(html, /opensea\.io\/collections\/chain\/robinhood/);
});

test("audit page presents contract security controls without pending audit messaging", async () => {
  const response = await render("/audit");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65/);
  assert.match(html, /0xd90eecdfc6f7071109c6731b8b8fa744cbc3d39adad9ac287f9657f33290e41e/);
  assert.match(html, /Internal security assessment/);
  assert.doesNotMatch(html, /Independent audit/i);
  assert.doesNotMatch(html, /Independently verifiable deployment/i);
});

test("how-it-works page presents the production and onchain architecture", async () => {
  const response = await render("/how-it-works");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Creative output/);
  assert.match(html, /EIP-712/);
  assert.match(html, /Robinhood Mainnet/);
  assert.match(html, /0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65/);
  assert.match(html, /Quality and data validation/);
});

test("wallet integration is locked to Robinhood Mainnet", async () => {
  const wallet = await readFile(new URL("../app/components/WalletProvider.tsx", import.meta.url), "utf8");
  assert.match(wallet, /chainId:\s*"0x1237"/);
  assert.match(wallet, /rpc\.mainnet\.chain\.robinhood\.com/);
  assert.match(wallet, /wallet_switchEthereumChain/);
  assert.match(wallet, /wallet_addEthereumChain/);
});

test("AURA collection uses quote-first batch minting without a platform fee", async () => {
  const [contract, studio] = await Promise.all([
    readFile(new URL("../contracts/AuraCollection.sol", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(contract, /platformFeeBps|feeRecipient/);
  assert.match(contract, /MAX_BATCH_SIZE\s*=\s*50/);
  assert.match(contract, /function quoteMint/);
  assert.match(contract, /function mintBatch/);
  assert.match(studio, /nft\.quoteMint\(selected\.length\)/);
  assert.match(studio, /nft\.mintBatch\(wallet,tokenUris\(\)/);
  assert.match(studio, /ROBINHOOD_CHAIN_ID/);
});

test("AURA Collection V2 requires expiring, replay-protected publisher authorization", async () => {
  const [contract, publish, studio] = await Promise.all([
    readFile(new URL("../contracts/AuraCollectionV2.sol", import.meta.url), "utf8"),
    readFile(new URL("../app/api/publish/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(contract, /EIP712\(name_, "2"\)/);
  assert.match(contract, /mapping\(address => uint256\) public nonces/);
  assert.match(contract, /block\.timestamp <= deadline/);
  assert.match(contract, /recovered == authorizedSigner/);
  assert.match(contract, /nonces\[msg\.sender\] \+= 1/);
  assert.doesNotMatch(contract, /function mintBatch\(/);
  assert.match(publish, /signTypedData/);
  assert.match(publish, /tokenURIsHash/);
  assert.match(studio, /mintBatchAuthorized/);
});

test("confirmed mints open the OpenSea listing guide", async () => {
  const studio = await readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8");
  assert.match(studio, /if\(mintConfirmed\)setShowMarketGuide\(true\)/);
  assert.match(studio, /showMarketGuide&&mintConfirmed/);
  assert.match(studio, /NFTs minted successfully/);
  assert.match(studio, /https:\/\/opensea\.io\/account/);
  assert.match(studio, /List on OpenSea/);
  assert.match(studio, /AURA never lists automatically/);
});

test("AI image generation stays server-side and powers both creation modes", async () => {
  const [route, studio, publish] = await Promise.all([
    readFile(new URL("../app/api/generate/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/publish/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(route, /process\.env\.OPENAI_API_KEY/);
  assert.match(route, /process\.env\.QUICKROUTER_API_KEY/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_OPENAI/);
  assert.match(route, /gpt-image-2\.5-sunburst/);
  assert.match(route, /AURA_AI_BASE_URL/);
  assert.match(route, /images\/\$\{path\}/);
  assert.match(route, /providerName\(\)==="QuickRouter"/);
  assert.match(route, /const UPSTREAM_BATCH_SIZE=4/);
  assert.match(route, /outputSize:"512x512"/);
  assert.match(route, /imageQuality\(\)/);
  assert.match(route, /provider:"AURA"/);
  assert.match(route, /Never create a collage, contact sheet, grid, split screen/);
  assert.match(route, /Render only one collectible variant in this output/);
  assert.doesNotMatch(route, /Produce \$\{count/);
  assert.match(route, /body pose, gesture, camera angle, background environment, lighting, headwear or head accessory/);
  const editRequest = route.slice(route.indexOf('if(mode==="collection"'), route.indexOf('}else{', route.indexOf('if(mode==="collection"')));
  assert.doesNotMatch(editRequest, /form\.append\("format"/);
  assert.match(editRequest, /form\.append\("response_format","url"\)/);
  assert.match(publish, /videos\.tpkcur\.xyz/);
  assert.match(publish, /data\.get\("imageUrls"\)/);
  assert.match(publish, /fetchRemoteImage/);
  assert.match(publish, /import sharp from "sharp"/);
  assert.match(publish, /const NFT_IMAGE_SIZE=512/);
  assert.match(publish, /Promise\.all\(images\.map/);
  assert.match(studio, /mode:"subject"/);
  assert.match(studio, /mode:"collection"/);
  assert.match(studio, /appendPublishImages/);
  assert.match(studio, /form\.append\("imageUrls"/);
  assert.match(studio, /AURA image engine connected/);
  assert.doesNotMatch(studio, /QuickRouter/);
  assert.doesNotMatch(studio, /gpt-image-2\.5-sunburst/);
  assert.match(studio, /Lock the subject identity, then expand outfits, accessories, materials, scenes and rarity traits/);
  assert.doesNotMatch(studio, /createVariants/);
  assert.doesNotMatch(studio, /requestSingleAiImage/);
  assert.match(studio, /body:JSON\.stringify\(payload\)/);
  assert.match(studio, /Generate subject/);
  assert.match(studio, /Output count/);
  assert.match(studio, /Math\.min\(4,Number\(amount\)/);
  assert.match(studio, /const \[source,setSource\]=useState\(""\)/);
  assert.match(studio, /useState<"text"\|"upload">\("text"\)/);
  assert.match(studio, /const \[subjectDescription,setSubjectDescription\]=useState\(""\)/);
  assert.match(studio, /const \[prompt,setPrompt\]=useState\(""\)/);
  assert.match(studio, /placeholder="Example: a rounded non-human AURA Wisp/);
  assert.match(studio, /placeholder="Example: preserve the Wisp silhouette/);
  assert.match(studio, /inputMode==="upload"&&!source/);
  assert.match(studio, /source\?"has-image":"empty"/);
  assert.match(studio, /Choose subject image/);
  assert.match(studio, /!prompt\.trim\(\)/);
  assert.match(studio, /useState\(""\);const \[symbol,setSymbol\]=useState\(""\)/);
  assert.match(studio, /placeholder="Example: AURA Genesis"/);
  assert.match(studio, /Examples are not written onchain/);
  assert.match(studio, /disabled=\{!issuanceReady\}/);
  assert.doesNotMatch(studio, /generated onchain collectible series/i);
});

test("the interface is English-only and keeps the studio layout in normal flow", async () => {
  const [layout, header, css] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /<html lang="en">/);
  assert.doesNotMatch(layout, /LanguageProvider/);
  assert.doesNotMatch(header, /language-toggle|Switch language/);
  assert.match(header, /className="mobile-menu-toggle"/);
  assert.match(css, /\.studio-steps\{top:auto!important;z-index:2\}/);
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /\.stage-input,.metadata-stage,.mint-stage\{display:block/);
});

test("application source and rendered pages contain no Chinese UI copy", async () => {
  async function sourceFiles(url) {
    const entries = await readdir(url, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => {
      const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, url);
      return entry.isDirectory() ? sourceFiles(child) : /\.(?:ts|tsx)$/.test(entry.name) ? [child] : [];
    }));
    return nested.flat();
  }
  for (const file of await sourceFiles(new URL("../app/", import.meta.url))) {
    assert.doesNotMatch(await readFile(file, "utf8"), /[\u3400-\u9fff]/, file.pathname);
  }
  for (const path of ["/", "/features", "/cases", "/how-it-works", "/whitepaper", "/audit", "/studio", "/history"]) {
    const html = await (await render(path)).text();
    assert.doesNotMatch(html, /[\u3400-\u9fff]/, path);
  }
});
