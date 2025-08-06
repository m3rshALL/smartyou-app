const hre = require("hardhat");

async function main() {
  try {
    console.log("Deploying SimpleStorage contract...");
    
    // Get the contract factory
    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
    
    // Deploy the contract with initial value of 42
    console.log("📦 Deploying with initial value: 42");
    const simpleStorage = await SimpleStorage.deploy(42);
    
    // Wait for deployment to complete
    await simpleStorage.waitForDeployment();
    
    const address = await simpleStorage.getAddress();
    console.log(`✅ SimpleStorage deployed to: ${address}`);
    
    // Test the contract
    console.log("🧪 Testing contract...");
    const initialValue = await simpleStorage.get();
    console.log(`Initial stored value: ${initialValue}`);
    
    // Set a new value
    const tx = await simpleStorage.set(123);
    await tx.wait();
    
    const newValue = await simpleStorage.get();
    console.log(`New stored value: ${newValue}`);
    
    console.log("🎉 Deployment and testing completed successfully!");
    
    return {
      contractAddress: address,
      contractName: "SimpleStorage"
    };
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
