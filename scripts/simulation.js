// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");
const { parseEther } = require("@ethersproject/units");

async function main() {
  const NColor = await hre.ethers.getContractFactory("NColor");
  // KOVAN for now.
  // const contractAddress = "0x887195b92Be5CBf35C9D83deB651eAf90646603D";
  const contractAddress = "0x0503d4c2DebC86c87C751e0e00CC29E9a6Fb37f4";
  const nColor = NColor.attach(contractAddress);

  let tokenUri, hexCode, metadata, json, svgBase64, svg;

  // 1 - 8888 are reserved for n holders.
  for (var tokenId = 1; tokenId <= 8888; tokenId++) {
    const N = await hre.ethers.getContractFactory("N");
    const n = N.attach("0x05a46f1E545526FB803FF974C790aCeA34D1f2D6");
    const owner = await n.ownerOf(tokenId);
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [owner],
    });
    const signer = await hre.ethers.getSigner("0x364d6D0333432C3Ac016Ca832fb8594A8cE43Ca6")
    await nColor.connect(signer).mintWithN(tokenId, { value: parseEther("0.01") });

    tokenUri = await nColor.tokenURI(tokenId);
    metadata = Buffer.from(tokenUri.split(",")[tokenUri.split(",").length - 1], "base64");
    json = JSON.parse(metadata.toString());
    svgBase64 = json.image.split(",")[json.image.split(",").length - 1];
    svg = Buffer.from(svgBase64, "base64").toString();
    fs.writeFileSync(`svgs/${tokenId}.svg`, svg);
  }

  for (var tokenId = 8889; tokenId <= 9999; tokenId++) {
    await nColor.mint(tokenId, { value: parseEther("0.02") });
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
