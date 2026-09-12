// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @notice AURA Collection V2. Minting requires a short-lived authorization
/// signed by the AURA publisher after the assets have been accepted and pinned.
contract AuraCollectionV2 is ERC721URIStorage, Ownable, Pausable, ReentrancyGuard, EIP712 {
    uint256 public constant MAX_BATCH_SIZE = 50;
    bytes32 public constant MINT_AUTHORIZATION_TYPEHASH = keccak256(
        "MintAuthorization(address payer,address recipient,bytes32 tokenURIsHash,uint256 quantity,uint256 totalPrice,uint256 nonce,uint256 deadline)"
    );

    uint256 public immutable maxSupply;
    uint256 public mintPrice;
    uint256 public totalMinted;
    address public authorizedSigner;
    mapping(address => uint256) public nonces;

    event AuthorizedSignerUpdated(address indexed previousSigner, address indexed newSigner);
    event MintPriceUpdated(uint256 previousPrice, uint256 newPrice);
    event BatchMinted(address indexed payer, address indexed recipient, uint256 firstTokenId, uint256 quantity, uint256 totalPaid);
    event ProceedsWithdrawn(address indexed recipient, uint256 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address initialOwner_,
        address authorizedSigner_
    ) ERC721(name_, symbol_) Ownable(initialOwner_) EIP712(name_, "2") {
        require(maxSupply_ > 0, "AURA: max supply is zero");
        require(initialOwner_ != address(0), "AURA: owner is zero");
        require(authorizedSigner_ != address(0), "AURA: signer is zero");
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        authorizedSigner = authorizedSigner_;
    }

    function quoteMint(uint256 quantity) public view returns (uint256 total) {
        total = mintPrice * quantity;
    }

    function mintBatchAuthorized(
        address to,
        string[] calldata tokenURIs,
        uint256 deadline,
        bytes calldata signature
    ) external payable nonReentrant whenNotPaused returns (uint256 firstTokenId) {
        uint256 quantity = tokenURIs.length;
        require(to != address(0), "AURA: recipient is zero");
        require(block.timestamp <= deadline, "AURA: authorization expired");
        require(quantity > 0 && quantity <= MAX_BATCH_SIZE, "AURA: invalid batch size");
        require(totalMinted + quantity <= maxSupply, "AURA: max supply exceeded");

        uint256 total = quoteMint(quantity);
        require(msg.value == total, "AURA: incorrect payment");
        bytes32 tokenURIsHash = keccak256(abi.encode(tokenURIs));
        bytes32 structHash = keccak256(
            abi.encode(
                MINT_AUTHORIZATION_TYPEHASH,
                msg.sender,
                to,
                tokenURIsHash,
                quantity,
                total,
                nonces[msg.sender],
                deadline
            )
        );
        address recovered = ECDSA.recover(_hashTypedDataV4(structHash), signature);
        require(recovered == authorizedSigner, "AURA: invalid authorization");
        nonces[msg.sender] += 1;

        firstTokenId = totalMinted + 1;
        for (uint256 i; i < quantity; ++i) {
            uint256 tokenId = firstTokenId + i;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
        }
        totalMinted += quantity;
        emit BatchMinted(msg.sender, to, firstTokenId, quantity, total);
    }

    function setAuthorizedSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "AURA: signer is zero");
        emit AuthorizedSignerUpdated(authorizedSigner, newSigner);
        authorizedSigner = newSigner;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        emit MintPriceUpdated(mintPrice, newPrice);
        mintPrice = newPrice;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function withdrawProceeds(address payable recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "AURA: recipient is zero");
        uint256 amount = address(this).balance;
        require(amount > 0, "AURA: no proceeds");
        (bool sent,) = recipient.call{value: amount}("");
        require(sent, "AURA: withdrawal failed");
        emit ProceedsWithdrawn(recipient, amount);
    }
}
