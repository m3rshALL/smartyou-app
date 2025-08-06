// Тестовый скрипт для развертывания ERC20 токена из шаблона
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Тестирование развертывания ERC20 токена из шаблона...\n");

  try {
    // Получаем сигнер
    const [deployer] = await ethers.getSigners();
    console.log("👤 Развертывание с аккаунта:", deployer.address);
    console.log("💰 Баланс аккаунта:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Создаем простой ERC20 контракт для тестирования
    const tokenCode = `
      // SPDX-License-Identifier: MIT
      pragma solidity ^0.8.20;

      import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
      import "@openzeppelin/contracts/access/Ownable.sol";

      contract TestToken is ERC20, Ownable {
          constructor(
              string memory name,
              string memory symbol,
              uint256 initialSupply,
              address initialOwner
          ) ERC20(name, symbol) Ownable(initialOwner) {
              _mint(initialOwner, initialSupply);
          }

          function mint(address to, uint256 amount) external onlyOwner {
              _mint(to, amount);
          }
      }
    `;

    // Временно создаем файл контракта
    const fs = require('fs');
    const path = require('path');
    
    const contractsDir = path.join(__dirname, '../contracts');
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    
    const contractPath = path.join(contractsDir, 'TestToken.sol');
    fs.writeFileSync(contractPath, tokenCode.trim());

    console.log("📝 Создан временный файл контракта: TestToken.sol");
    console.log("🔨 Компилируем контракт...");

    // Компилируем
    await hre.run("compile");
    console.log("✅ Компиляция завершена успешно\n");

    // Развертываем
    console.log("🚀 Развертывание TestToken...");
    const TestToken = await ethers.getContractFactory("TestToken");
    
    const tokenName = "SmartYou Test Token";
    const tokenSymbol = "STT";
    const initialSupply = ethers.parseEther("1000000"); // 1 миллион токенов
    
    const token = await TestToken.deploy(
      tokenName,
      tokenSymbol, 
      initialSupply,
      deployer.address
    );

    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    console.log("✅ TestToken развернут по адресу:", tokenAddress);
    console.log("📊 Параметры токена:");
    console.log("   - Название:", tokenName);
    console.log("   - Символ:", tokenSymbol);
    console.log("   - Начальный выпуск:", ethers.formatEther(initialSupply));
    console.log("   - Владелец:", deployer.address);

    // Тестируем функции токена
    console.log("\n🧪 Тестируем функции токена...");
    
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const totalSupply = await token.totalSupply();
    const ownerBalance = await token.balanceOf(deployer.address);

    console.log("✅ Чтение данных токена:");
    console.log("   - name():", name);
    console.log("   - symbol():", symbol);
    console.log("   - decimals():", decimals);
    console.log("   - totalSupply():", ethers.formatEther(totalSupply));
    console.log("   - Баланс владельца:", ethers.formatEther(ownerBalance));

    // Тестируем трансфер
    console.log("\n💸 Тестируем трансфер токенов...");
    const [, recipient] = await ethers.getSigners();
    const transferAmount = ethers.parseEther("1000");

    const transferTx = await token.transfer(recipient.address, transferAmount);
    await transferTx.wait();

    const recipientBalance = await token.balanceOf(recipient.address);
    const newOwnerBalance = await token.balanceOf(deployer.address);

    console.log("✅ Трансфер выполнен:");
    console.log("   - Отправлено:", ethers.formatEther(transferAmount), "STT");
    console.log("   - Баланс получателя:", ethers.formatEther(recipientBalance), "STT");
    console.log("   - Новый баланс владельца:", ethers.formatEther(newOwnerBalance), "STT");

    // Тестируем минтинг
    console.log("\n🏭 Тестируем минтинг новых токенов...");
    const mintAmount = ethers.parseEther("5000");
    
    const mintTx = await token.mint(deployer.address, mintAmount);
    await mintTx.wait();

    const newTotalSupply = await token.totalSupply();
    const finalOwnerBalance = await token.balanceOf(deployer.address);

    console.log("✅ Минтинг выполнен:");
    console.log("   - Создано новых токенов:", ethers.formatEther(mintAmount), "STT");
    console.log("   - Новый общий выпуск:", ethers.formatEther(newTotalSupply), "STT");
    console.log("   - Итоговый баланс владельца:", ethers.formatEther(finalOwnerBalance), "STT");

    // Сохраняем информацию о развертывании
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      contract: "TestToken (ERC20)",
      address: tokenAddress,
      deployer: deployer.address,
      network: "localhost",
      name: tokenName,
      symbol: tokenSymbol,
      initialSupply: ethers.formatEther(initialSupply),
      transactionHash: token.deploymentTransaction()?.hash
    };

    fs.writeFileSync(
      path.join(__dirname, '../deployments/test-token-deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Информация о развертывании сохранена в deployments/test-token-deployment.json");

    // Удаляем временный файл
    fs.unlinkSync(contractPath);
    console.log("🗑️  Временный файл контракта удален");

    console.log("\n🎉 ТЕСТ РАЗВЕРТЫВАНИЯ ЗАВЕРШЕН УСПЕШНО!");
    console.log("📋 Адрес контракта:", tokenAddress);
    console.log("🌐 Сеть: localhost:8545");
    console.log("🔗 Transaction hash:", token.deploymentTransaction()?.hash);

  } catch (error) {
    console.error("❌ Ошибка при тестировании:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
