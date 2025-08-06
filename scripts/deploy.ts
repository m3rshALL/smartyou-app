import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SmartYou contracts...");

  // Deploy SimpleStorage
  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy(42); // Initial value: 42
  await simpleStorage.deployed();
  console.log("✅ SimpleStorage deployed to:", simpleStorage.address);

  // Deploy SmartYouToken
  const SmartYouToken = await ethers.getContractFactory("SmartYouToken");
  const [deployer] = await ethers.getSigners();
  
  const smartYouToken = await SmartYouToken.deploy(
    "SmartYou Token",           // name
    "SYU",                      // symbol
    1000 * 10**18,             // initial supply (1000 tokens)
    deployer.address           // initial owner
  );
  await smartYouToken.deployed();
  console.log("✅ SmartYouToken deployed to:", smartYouToken.address);

  // Verify deployments
  console.log("\n📋 Contract Summary:");
  console.log("====================");
  console.log(`SimpleStorage: ${simpleStorage.address}`);
  console.log(`SmartYouToken: ${smartYouToken.address}`);
  console.log(`Deployer: ${deployer.address}`);
  
  // Initial setup
  console.log("\n⚙️  Performing initial setup...");
  
  // Test SimpleStorage
  const currentValue = await simpleStorage.get();
  console.log(`SimpleStorage initial value: ${currentValue}`);
  
  // Test SmartYouToken
  const tokenBalance = await smartYouToken.balanceOf(deployer.address);
  console.log(`Token balance of deployer: ${ethers.utils.formatEther(tokenBalance)} SYU`);
  
  // Add deployer as educator
  await smartYouToken.addEducator(deployer.address);
  console.log(`Added ${deployer.address} as educator`);
  
  console.log("\n🎉 Deployment completed successfully!");
  
  return {
    simpleStorage: simpleStorage.address,
    smartYouToken: smartYouToken.address
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
