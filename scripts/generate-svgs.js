// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const { deployer } = await hre.getNamedAccounts();

  const NColor = await hre.ethers.getContractFactory("NColor");
  // localhost contract address.
  const contractAddress = "0x0503d4c2DebC86c87C751e0e00CC29E9a6Fb37f4";
  const nColor = NColor.attach(contractAddress);

  let tokenUri, metadata;

  for (var tokenId = 1; tokenId <= 9999; tokenId++) {
    console.log(tokenId);

    tokenUri = await nColor.tokenURI(tokenId);
    metadata = Buffer.from(tokenUri.split(",")[tokenUri.split(",").length - 1], "base64");
    json = JSON.parse(metadata.toString());
    svgBase64 = json.image.split(",")[json.image.split(",").length - 1];
    svg = Buffer.from(svgBase64, "base64").toString();
    fs.writeFileSync(`svgs/${tokenId}.svg`, svg);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
