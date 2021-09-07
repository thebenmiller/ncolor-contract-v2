// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");
const { parseEther, formatEther } = require("@ethersproject/units");

async function main() {
  const { deployer } = await hre.getNamedAccounts();
  const self = await hre.ethers.getSigner(deployer);
  const provider = hre.ethers.getDefaultProvider("http://localhost:8545");

  const NColor = await hre.ethers.getContractFactory("NColor");
  // localhost contract address.
  const contractAddress = "0x0503d4c2DebC86c87C751e0e00CC29E9a6Fb37f4";
  const nColor = NColor.attach(contractAddress);

  let tokenUri, metadata, json, svgBase64, svg;

  // 1 - 8888 are reserved for n holders.
  for (var tokenId = 1; tokenId <= 8888; tokenId++) {
    console.log(tokenId);

    const N = await hre.ethers.getContractFactory("N");
    const n = N.attach("0x05a46f1E545526FB803FF974C790aCeA34D1f2D6");
    const owner = await n.ownerOf(tokenId);
    await provider.request({
      method: "hardhat_impersonateAccount",
      params: [owner],
    });
    const signer = await hre.ethers.getSigner(owner);
    try {
      await nColor.connect(signer).mintWithN(tokenId, { value: parseEther("0.01") });
    } catch (ex) {
      if (ex.message.match(/sender doesn't have enough funds to send tx/)) {
        await self.sendTransaction({
          to: owner,
          value: parseEther("0.02"),
        });

        await nColor.connect(signer).mintWithN(tokenId, { value: parseEther("0.01") });
      }
    }

    tokenUri = await nColor.tokenURI(tokenId);
    metadata = Buffer.from(tokenUri.split(",")[tokenUri.split(",").length - 1], "base64");
    json = JSON.parse(metadata.toString());
    svgBase64 = json.image.split(",")[json.image.split(",").length - 1];
    svg = Buffer.from(svgBase64, "base64").toString();
    fs.writeFileSync(`svgs/${tokenId}.svg`, svg);
  }

  for (var tokenId = 8889; tokenId <= 9999; tokenId++) {
    console.log(tokenId);

    await nColor.mint(tokenId, { value: parseEther("0.02") });
    tokenUri = await nColor.tokenURI(tokenId);
    metadata = Buffer.from(tokenUri.split(",")[tokenUri.split(",").length - 1], "base64");
    json = JSON.parse(metadata.toString());
    svgBase64 = json.image.split(",")[json.image.split(",").length - 1];
    svg = Buffer.from(svgBase64, "base64").toString();
    fs.writeFileSync(`svgs/${tokenId}.svg`, svg);
  }

  await nColor.withdrawAll();

  const nColorBalance = await provider.getBalance("0x0503d4c2debc86c87c751e0e00cc29e9a6fb37f4");
  console.log(formatEther(nColorBalance));

  const dunksBalance = await provider.getBalance("0x069e85D4F1010DD961897dC8C095FBB5FF297434");
  console.log(formatEther(dunksBalance));

  let kowloonBalance = await provider.getBalance("0x4Ee34BA6c5707f37C8367fd8AEF43F754435F588");
  console.log(formatEther(kowloonBalance));

  const journeyapeBalance = await provider.getBalance("0xbCA2eE79aBdDF13B7f51015f183a5758D718FC86");
  console.log(formatEther(journeyapeBalance));

  const daoBalance = await provider.getBalance("0x0000000000000000000000000000000000000000");
  console.log(formatEther(daoBalance));

  console.log(dunksBalance === kowloonBalance);
  console.log(kowloonBalance === journeyapeBalance);
  console.log(journeyapeBalance === daoBalance);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
