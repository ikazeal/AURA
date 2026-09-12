# AURA Collection Engine

AURA 是面向 Robinhood Chain 的 AI NFT Collection 创作与发行平台。用户可以通过文字描述或上传参考素材生成主体，扩展系列视觉，配置属性与 Metadata，并通过钱包在 Robinhood Mainnet 完成 Mint。

## 核心功能

- 文字描述生成并确认一个原创主体
- 上传 PNG、JPG、WebP 作为系列参考素材
- 使用 QuickRouter `gpt-image-2.5-sunburst` 生成最多 4 张系列图片
- 批量下载图片与 Metadata 发行包
- 图片和 Metadata 上传至 IPFS（Pinata）
- 连接多种 EVM 钱包，仅允许切换至 Robinhood Mainnet
- 通过 AURA Collection 合约批量 Mint NFT
- 查看本地创作历史、链上 Mint 记录和区块浏览器详情
- Mint 成功后引导用户前往 OpenSea 查看或上架资产

## 技术栈

- React 19 / Vinext / Vite
- Cloudflare Workers compatible API routes
- ethers.js
- Solidity / OpenZeppelin
- Pinata IPFS
- QuickRouter Image API
- Robinhood Chain Mainnet（Chain ID `4663`）

## 本地运行

要求 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

`npm run dev` 会同时启动网站和本地 AURA AI 网关。Windows 本地代理可通过 `AURA_OUTBOUND_PROXY` 配置；公网部署不应填写本机代理地址。

## 服务端环境变量

在项目根目录创建 `.env.local`。该文件已被 Git 忽略，禁止提交任何真实 Token 或钱包私钥。

```ini
AURA_AI_IMAGE_ENABLED=true
AURA_AI_PROVIDER=QuickRouter
AURA_AI_BASE_URL=https://api.quickrouter.ai/v1
OPENAI_API_KEY=YOUR_QUICKROUTER_TOKEN
OPENAI_IMAGE_MODEL=gpt-image-2.5-sunburst
OPENAI_IMAGE_QUALITY=low

AURA_UPLOAD_ENABLED=true
PINATA_JWT=YOUR_PINATA_JWT

NEXT_PUBLIC_AURA_NFT_CONTRACT=YOUR_DEPLOYED_COLLECTION_CONTRACT
NEXT_PUBLIC_AURA_NFT_CONTRACT_VERSION=2
NEXT_PUBLIC_AURA_DEPLOYMENT_BLOCK=YOUR_DEPLOYMENT_BLOCK
```

合约部署钱包私钥只用于管理员部署脚本，不应配置到浏览器可见变量中。

## 验证

```bash
npm test
npm run contract:compile
```

当前自动化测试覆盖页面渲染、Robinhood 网络锁定、零平台服务费、授权 Mint、OpenSea 引导和服务端 AI 生成调用。

## 安全说明

- AI、Pinata 和 Mint 授权密钥仅在服务端读取。
- AURA 不托管用户钱包或 NFT。
- 当前平台服务费为 `0 ETH`，用户仅承担合约 Mint 金额与 Robinhood 网络 Gas。
- 仓库内审计页面属于项目自检与部署证明，不代表第三方安全机构认证。

## License

Copyright © AURA. All rights reserved.
