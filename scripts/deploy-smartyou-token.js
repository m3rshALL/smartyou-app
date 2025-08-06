// scripts/deploy-smartyou-token.js
async function main() {
  console.log("\n🚀 Развертывание SmartYou Token...\n");

  // Get the contract factory
  const SmartYouToken = await ethers.getContractFactory("SmartYouToken");
  
  console.log("📦 Компилируем контракт...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  // Deploy the contract with proper constructor arguments
  const initialSupply = ethers.parseEther("100000"); // 100,000 tokens initial supply
  const smartYouToken = await SmartYouToken.deploy(
    "SmartYou Token",    // name
    "SYT",               // symbol
    initialSupply,       // initialSupply
    deployerAddress      // initialOwner
  );
  await smartYouToken.waitForDeployment();
  
  const contractAddress = await smartYouToken.getAddress();
  console.log("✅ SmartYou Token развернут по адресу:", contractAddress);
  
  // Get deployment details
  const balance = await ethers.provider.getBalance(deployerAddress);
  
  console.log("\n📊 Информация о развертывании:");
  console.log("├─ Адрес развертывателя:", deployerAddress);
  console.log("├─ Баланс развертывателя:", ethers.formatEther(balance), "ETH");
  console.log("├─ Адрес контракта:", contractAddress);
  
  // Test basic functionality
  console.log("\n🧪 Тестирование основных функций...");
  
  // Check token details
  const name = await smartYouToken.name();
  const symbol = await smartYouToken.symbol();
  const decimals = await smartYouToken.decimals();
  const totalSupply = await smartYouToken.totalSupply();
  const ownerBalance = await smartYouToken.balanceOf(deployerAddress);
  
  console.log("├─ Название токена:", name);
  console.log("├─ Символ:", symbol);
  console.log("├─ Десятичных знаков:", decimals.toString());
  console.log("├─ Общий объем выпуска:", ethers.formatEther(totalSupply), symbol);
  console.log("├─ Баланс владельца:", ethers.formatEther(ownerBalance), symbol);
  
  // Test educational rewards
  console.log("\n🎓 Тестирование образовательных наград...");
  
  try {
    // Test rewardForLevel function
    const rewardTx = await smartYouToken.rewardForLevel(deployerAddress, 1);
    await rewardTx.wait();
    
    const newBalance = await smartYouToken.balanceOf(deployerAddress);
    const levelsCompleted = await smartYouToken.levelsCompleted(deployerAddress);
    
    console.log("├─ Награда за уровень 1:", ethers.formatEther(await smartYouToken.REWARD_PER_LEVEL()), symbol);
    console.log("├─ Новый баланс:", ethers.formatEther(newBalance), symbol);
    console.log("├─ Уровней завершено:", levelsCompleted.toString());
    
    // Get student progress
    const [levels, balance] = await smartYouToken.getStudentProgress(deployerAddress);
    console.log("├─ Прогресс студента:", levels.toString(), "уровней,", ethers.formatEther(balance), symbol);
    
  } catch (error) {
    console.log("❌ Ошибка при тестировании наград:", error.message);
  }
  
  // Test pause functionality (security feature)
  console.log("\n🔒 Тестирование функций безопасности...");
  
  try {
    // Pause the contract
    const pauseTx = await smartYouToken.pause();
    await pauseTx.wait();
    console.log("├─ Контракт приостановлен: ✅");
    
    // Check if paused
    const isPaused = await smartYouToken.paused();
    console.log("├─ Статус паузы:", isPaused ? "Приостановлен" : "Активен");
    
    // Unpause
    const unpauseTx = await smartYouToken.unpause();
    await unpauseTx.wait();
    console.log("├─ Контракт возобновлен: ✅");
    
  } catch (error) {
    console.log("❌ Ошибка при тестировании безопасности:", error.message);
  }
  
  console.log("\n🎉 Все тесты завершены!");
  console.log("\n📋 Сводка развертывания:");
  console.log("┌─────────────────────────────────────────────────────────────┐");
  console.log("│                    SmartYou Token                           │");
  console.log("├─────────────────────────────────────────────────────────────┤");
  console.log("│ Адрес контракта:", contractAddress.padEnd(32), "│");
  console.log("│ Название:       ", name.padEnd(32), "│");
  console.log("│ Символ:         ", symbol.padEnd(32), "│");
  console.log("│ Владелец:       ", deployerAddress.slice(0, 32).padEnd(32), "│");
  console.log("│ Начальный баланс:", ethers.formatEther(ownerBalance).padEnd(30), "│");
  console.log("└─────────────────────────────────────────────────────────────┘");
  
  // Save deployment info to file
  const fs = await import('fs');
  const deploymentInfo = {
    contractAddress,
    contractName: "SmartYouToken",
    deployer: deployerAddress,
    deploymentTime: new Date().toISOString(),
    network: "localhost",
    tokenDetails: {
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.formatEther(totalSupply)
    }
  };
  
  fs.default.writeFileSync(
    'deployment-smartyou-token.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Информация о развертывании сохранена в deployment-smartyou-token.json");
  
  return {
    contractAddress,
    contractName: "SmartYouToken",
    deployer: deployerAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Ошибка развертывания:", error);
    process.exit(1);
  });
