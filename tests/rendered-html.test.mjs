import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
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

test("saved creations can be restored for another IPFS publish and mint", async () => {
  const [history, studio, storage] = await Promise.all([
    readFile(new URL("../app/history/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/studio/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/creation-history.ts", import.meta.url), "utf8"),
  ]);
  assert.match(history, /\/studio\?restore=/);
  assert.match(history, /继续上传 \/ Mint/);
  assert.match(studio, /URLSearchParams\(window\.location\.search\)/);
  assert.match(studio, /record\.assets/);
  assert.match(studio, /setStep\(2\)/);
  assert.match(storage, /assets\?:CreationHistoryAsset\[\]/);
});

test("homepage communicates the Robinhood-native product and OpenSea handoff", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /首个基于 Robinhood Chain 的 NFT 图片 AI 产品/);
  assert.match(html, /OpenSea Ready/);
  assert.match(html, /展示、挂牌与二级交易/);
  assert.match(html, /opensea\.io\/collections\/chain\/robinhood/);
});

test("audit page discloses deployment proof without claiming third-party certification", async () => {
  const response = await render("/audit");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65/);
  assert.match(html, /0xd90eecdfc6f7071109c6731b8b8fa744cbc3d39adad9ac287f9657f33290e41e/);
  assert.match(html, /第三方独立审计待完成/);
  assert.doesNotMatch(html, /第三方(?:独立)?审计(?:已经|已)?通过/);
});

test("how-it-works page presents the production and onchain architecture", async () => {
  const response = await render("/how-it-works");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /创造性输出/);
  assert.match(html, /EIP-712/);
  assert.match(html, /Robinhood Mainnet/);
  assert.match(html, /0x7632893B0624F7E35df9EEDF67ABec0C4c2c4D65/);
  assert.match(html, /质量与数据验证/);
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
  assert.match(studio, /NFT 已成功 Mint/);
  assert.match(studio, /https:\/\/opensea\.io\/account/);
  assert.match(studio, /前往 OpenSea 上架/);
  assert.match(studio, /AURA 不自动替你挂牌/);
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
  const editRequest = route.slice(route.indexOf('if(mode==="collection"'), route.indexOf('}else{', route.indexOf('if(mode==="collection"')));
  assert.doesNotMatch(editRequest, /form\.append\("format"/);
  assert.match(editRequest, /form\.append\("response_format","url"\)/);
  assert.match(publish, /videos\.tpkcur\.xyz/);
  assert.match(publish, /data\.get\("imageUrls"\)/);
  assert.match(publish, /fetchRemoteImage/);
  assert.match(studio, /mode:"subject"/);
  assert.match(studio, /mode:"collection"/);
  assert.match(studio, /appendPublishImages/);
  assert.match(studio, /form\.append\("imageUrls"/);
  assert.match(studio, /图像引擎已连接/);
  assert.match(studio, /requestSingleAiImage/);
  assert.match(studio, /生成 1 个主体/);
  assert.match(studio, /生成数量（最多 4 张）/);
  assert.match(studio, /Math\.min\(4,Number\(amount\)/);
});
