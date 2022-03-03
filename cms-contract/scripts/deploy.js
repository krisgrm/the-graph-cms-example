require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const CMS = await ethers.getContractFactory("CMS");
  const cms = await CMS.deploy();

  console.log("Token address:", cms.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });