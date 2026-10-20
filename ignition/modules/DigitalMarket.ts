import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DigitalMarketplaceModule = buildModule("DigitalMarketplace", (m) => {
  const phxTokenAddress = m.getParameter("phxTokenAddress");

  const marketPlace = m.contract("DigitalMarketplace", [phxTokenAddress]);

  return { marketPlace };
});

export default DigitalMarketplaceModule;
