
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DigitalMarketplace {
    using SafeERC20 for IERC20;

    address public immutable owner;
    IERC20 public immutable paymentToken;

    uint256 public platformFeeBps = 500; // 5%
    uint256 public constant MAX_FEE_BPS = 1000; // 10%

    uint256 public nextProductId = 1;

    struct Product {
        string name;
        string description;
        string imageURI; 
        address currentOwner;
        uint256 price;   
        bool listed;
    }

    struct ProductDetails {
        uint256 productId;
        string name;
        string description;
        string imageURI;
        address currentOwner;
        uint256 price;
        bool listed;
    }

    mapping(uint256 => Product) public products;
    uint256[] private productIds;

    mapping(address => uint256) public pendingWithdrawals;
    uint256 public pendingPlatformFees;

    bool private locked;

    event ProductCreated(
        uint256 indexed productId,
        address indexed productOwner,
        uint256 price,
        string name,
        string imageURI
    );

    event ProductDetailsUpdated(uint256 indexed productId);
    event ProductListed(uint256 indexed productId, uint256 price);

    event ProductSold(
        uint256 indexed productId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 fee
    );

    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed previousOwner,
        address indexed newOwner
    );

    event Withdrawal(address indexed recipient, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not marketplace owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    constructor(address phxTokenAddress) {
        require(phxTokenAddress != address(0), "Invalid token address");
        require(
            phxTokenAddress.code.length > 0,
            "Token is not a contract"
        );

        owner = msg.sender;
        paymentToken = IERC20(phxTokenAddress);
    }

    // Marketplace owner creates a product for its initial owner.
    function createProduct(
        address productOwner,
        string calldata name,
        string calldata description,
        uint256 price,
        string calldata imageURI
    ) external returns (uint256 productId) {
        require(productOwner != address(0), "Invalid product owner");
        require(bytes(name).length > 0, "Name required");
        require(price > 0, "Price must be positive");
        require(bytes(imageURI).length > 0, "Image URI required");

        productId = nextProductId++;

        products[productId] = Product({
            name: name,
            description: description,
            imageURI: imageURI,
            currentOwner: productOwner,
            price: price,
            listed: true
        });

        productIds.push(productId);

        emit ProductCreated(
            productId,
            productOwner,
            price,
            name,
            imageURI
        );
    }

    // Current product owner can update metadata.
    function updateProductDetails(
        uint256 productId,
        string calldata name,
        string calldata description,
        string calldata imageURI
    ) external {
        Product storage p = products[productId];

        require(p.currentOwner == msg.sender, "Not product owner");
        require(bytes(name).length > 0, "Name required");
        require(bytes(imageURI).length > 0, "Image URI required");

        p.name = name;
        p.description = description;
        p.imageURI = imageURI;

        emit ProductDetailsUpdated(productId);
    }

    // Current owner can list or relist their product at a new price.
    function listProduct(
        uint256 productId,
        uint256 price
    ) external {
        Product storage p = products[productId];

        require(p.currentOwner == msg.sender, "Not product owner");
        require(!p.listed, "Already listed");
        require(price > 0, "Price must be positive");

        p.price = price;
        p.listed = true;

        emit ProductListed(productId, price);
    }

    function buyProduct(uint256 productId) external nonReentrant {
        Product storage p = products[productId];

        require(p.currentOwner != address(0), "Product not found");
        require(p.listed, "Not for sale");
        require(msg.sender != p.currentOwner, "Cannot buy own product");

        address seller = p.currentOwner;
        uint256 price = p.price;
        uint256 fee = (price * platformFeeBps) / 10000;
        uint256 sellerAmount = price - fee;

        // Effects first; failed token transfers revert all changes.
        p.currentOwner = msg.sender;
        p.listed = false;

        pendingWithdrawals[seller] += sellerAmount;
        pendingPlatformFees += fee;

        paymentToken.safeTransferFrom(
            msg.sender,
            address(this),
            price
        );

        emit ProductSold(productId, msg.sender, seller, price, fee);
        emit OwnershipTransferred(productId, seller, msg.sender);
    }

    // Transfers product ownership without a product payment.
    function transferOwnership(
        uint256 productId,
        address newOwner
    ) external {
        Product storage p = products[productId];

        require(p.currentOwner == msg.sender, "Not product owner");
        require(newOwner != address(0), "Invalid recipient");
        require(newOwner != msg.sender, "Already owner");

        address previousOwner = p.currentOwner;

        p.currentOwner = newOwner;
        p.listed = false;

        emit OwnershipTransferred(productId, previousOwner, newOwner);
    }

    function getProductCount() external view returns (uint256) {
        return productIds.length;
    }

    // Fetch one product, including all display fields.
    function getProduct(
        uint256 productId
    ) external view returns (ProductDetails memory) {
        Product storage p = products[productId];
        require(p.currentOwner != address(0), "Product not found");

        return ProductDetails({
            productId: productId,
            name: p.name,
            description: p.description,
            imageURI: p.imageURI,
            currentOwner: p.currentOwner,
            price: p.price,
            listed: p.listed
        });
    }

    // Fetch a page of products. start is zero-based.
    function getProducts(
        uint256 start,
        uint256 limit
    ) external view returns (ProductDetails[] memory result) {
        uint256 total = productIds.length;

        if (start >= total || limit == 0) {
            return new ProductDetails[](0);
        }

        uint256 end = start + limit;
        if (end > total) {
            end = total;
        }

        result = new ProductDetails[](end - start);

        for (uint256 i = start; i < end; i++) {
            uint256 id = productIds[i];
            Product storage p = products[id];

            result[i - start] = ProductDetails({
                productId: id,
                name: p.name,
                description: p.description,
                imageURI: p.imageURI,
                currentOwner: p.currentOwner,
                price: p.price,
                listed: p.listed
            });
        }
    }

    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        paymentToken.safeTransfer(msg.sender, amount);

        emit Withdrawal(msg.sender, amount);
    }

    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 amount = pendingPlatformFees;
        require(amount > 0, "No platform fees");

        pendingPlatformFees = 0;
        paymentToken.safeTransfer(owner, amount);

        emit Withdrawal(owner, amount);
    }

    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= MAX_FEE_BPS, "Fee too high");

        uint256 oldFeeBps = platformFeeBps;
        platformFeeBps = newFeeBps;

        emit PlatformFeeUpdated(oldFeeBps, newFeeBps);
    }
}
