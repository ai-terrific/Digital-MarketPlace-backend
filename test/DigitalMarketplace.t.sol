// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Test} from "forge-std/Test.sol";
import {DigitalMarketplace} from "../contracts/DigitalMarket.sol";

contract MarketplaceTestToken is ERC20 {
    constructor() ERC20("Test PHX", "TPHX") {}

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}

contract DigitalMarketplaceTest is Test {
    MarketplaceTestToken private token;
    DigitalMarketplace private marketplace;
    address private seller = address(0xA11CE);
    address private buyer = address(0xB0B);
    uint256 private constant LISTING_FEE = 7;
    uint256 private constant PRICE = 1_000;

    function setUp() public {
        token = new MarketplaceTestToken();
        marketplace = new DigitalMarketplace(address(token));
        token.mint(seller, 100);
        token.mint(
            buyer,
            PRICE + (PRICE * marketplace.platformFeeBps()) / 10_000
        );
    }

    function testListingFeeIsFixedAndBuyerPaysPercentageFee() public {
        marketplace.setListingFee(LISTING_FEE);

        vm.prank(seller);
        token.approve(address(marketplace), LISTING_FEE);
        vm.prank(seller);
        marketplace.createProduct(
            seller,
            "Product",
            "Description",
            PRICE,
            "ipfs://image"
        );

        assertEq(token.balanceOf(seller), 100 - LISTING_FEE);
        assertEq(marketplace.pendingPlatformFees(), LISTING_FEE);

        uint256 buyerFee = (PRICE * marketplace.platformFeeBps()) / 10_000;
        vm.prank(buyer);
        token.approve(address(marketplace), PRICE + buyerFee);
        vm.prank(buyer);
        marketplace.buyProduct(1);

        assertEq(token.balanceOf(buyer), 0);
        assertEq(token.balanceOf(seller), 100 - LISTING_FEE + PRICE);
        assertEq(marketplace.pendingPlatformFees(), LISTING_FEE + buyerFee);
    }

    function testOnlyOwnerCanSetListingFee() public {
        vm.prank(seller);
        vm.expectRevert("Not marketplace owner");
        marketplace.setListingFee(LISTING_FEE);
    }
}
