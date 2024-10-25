import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const [signer1, signer2, signer3, signer4] = await hre.ethers.getSigners();

  // Starting scripting
  console.log(
    "###### Deploying ERC20 token contract(FACTORY_CONTRACT) that will be used in the vesting schedule. ######"
  );

  const DTHToken = await hre.ethers.getContractFactory("Delthereum");

  const dthToken = await DTHToken.deploy(signer1);

  console.log("Token deployed:", dthToken);
  console.log("Token deployed:", dthToken.owner);

  const tokenContractAdrress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  console.log(
    "######  Deploying the `TokenVesting` contract using the deployed ERC20 token's address ######"
  );

  const TokenVesting = await hre.ethers.getContractFactory("TokenVesting");

  const tokenVesting = await TokenVesting.deploy(tokenContractAdrress);

  console.log("tokenvesting deployed:", tokenVesting);

  const DEPLOYED_FACTORY_CONTRACT =
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const tokenVestingContractInstance = await hre.ethers.getContractAt(
    "TokenVesting",
    DEPLOYED_FACTORY_CONTRACT
  );

  console.log(
    "######  Adding a beneficiary to the `TokenVesting` contract with a vesting schedule ######"
  );

  const startTime = await time.latest(); // Assume `startTime` is a timestamp
  const duration = await time.increaseTo(startTime + 60 * 60 * 24 * 30);
  const totalAmount = hre.ethers.parseUnits("100000", 18);

  const addBeneficiary = await tokenVestingContractInstance
    .connect(signer1)
    .addBeneficiary(signer2, duration, totalAmount);

  addBeneficiary.wait();
  console.log(addBeneficiary);

  console.log(
    "##### Claim vested tokens for the beneficiary after advancing time #####"
  );

  const claimVestedToken = await tokenVestingContractInstance
    .connect(signer2)
    .claimTokens();

  claimVestedToken.wait();
  console.log(claimVestedToken);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
