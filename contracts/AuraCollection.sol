// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice AURA collection contract for Robinhood Chain with no platform fee.
contract AuraCollection is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 public constant MAX_BATCH_SIZE = 50;

    uint256 public immutable maxSupply;
    uint256 public mintPrice;
    uint256 public totalMinted;

    event MintPriceUpdated(uint256 previousPrice, uint256 newPrice);
    event BatchMinted(address indexed payer, address indexed recipient, uint256 firstTokenId, uint256 quantity, uint256 totalPaid);
    event ProceedsWithdrawn(address indexed recipient, uint256 amount);

    constructor(string memory name_, string memory symbol_, uint256 maxSupply_, uint256 mintPrice_, address initialOwner_)
        ERC721(name_, symbol_) Ownable(initialOwner_)
    {
        require(maxSupply_ > 0, "AURA: max supply is zero");
        require(initialOwner_ != address(0), "AURA: owner is zero");
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
    }

    function quoteMint(uint256 quantity) public view returns (uint256 total) {
        total = mintPrice * quantity;
    }

    function mintBatch(address to, string[] calldata tokenURIs) external payable nonReentrant returns (uint256 firstTokenId) {
        uint256 quantity = tokenURIs.length;
        require(to != address(0), "AURA: recipient is zero");
        require(quantity > 0 && quantity <= MAX_BATCH_SIZE, "AURA: invalid batch size");
        require(totalMinted + quantity <= maxSupply, "AURA: max supply exceeded");
        uint256 total = quoteMint(quantity);
        require(msg.value == total, "AURA: incorrect payment");

        firstTokenId = totalMinted + 1;
        for (uint256 i; i < quantity; ++i) {
            uint256 tokenId = firstTokenId + i;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
        }
        totalMinted += quantity;

        emit BatchMinted(msg.sender, to, firstTokenId, quantity, total);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        emit MintPriceUpdated(mintPrice, newPrice);
        mintPrice = newPrice;
    }

    function withdrawProceeds(address payable recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "AURA: recipient is zero");
        uint256 amount = address(this).balance;
        require(amount > 0, "AURA: no proceeds");
        (bool sent,) = recipient.call{value: amount}("");
        require(sent, "AURA: withdrawal failed");
        emit ProceedsWithdrawn(recipient, amount);
    }
}
