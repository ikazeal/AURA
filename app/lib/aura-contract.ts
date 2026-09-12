export const ROBINHOOD_CHAIN_ID = 4663;
export const ROBINHOOD_EXPLORER = "https://robinhoodchain.blockscout.com";

export const AURA_COLLECTION_ABI = [
  "function quoteMint(uint256 quantity) view returns (uint256 total)",
  "function mintBatch(address to,string[] tokenURIs) payable returns (uint256 firstTokenId)",
  "function mintBatchAuthorized(address to,string[] tokenURIs,uint256 deadline,bytes signature) payable returns (uint256 firstTokenId)",
  "function authorizedSigner() view returns (address)",
  "function nonces(address payer) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event BatchMinted(address indexed payer,address indexed recipient,uint256 firstTokenId,uint256 quantity,uint256 totalPaid)",
] as const;
