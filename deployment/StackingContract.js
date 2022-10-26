console.clear();
const  {getClient, createAccount, deployContract, createFungibleToken, mintToken, TokenBalance} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, TokenId, ContractId, Hbar } = require("@hashgraph/sdk");
const dotenv = require("dotenv");
const fs = require('fs');
dotenv.config({ path: '../.env' });

async function main() {
    await StackingReward();
 }
 async function StackingReward() {
    console.log(`\n- Create and deploy Stacking Reward Contract`);
    const rawdataStackingReward = fs.readFileSync("../artifacts/contracts/StackingRewards/StakingRewards.sol/StakingRewards.json");
    const rawdataStackingRewardContractJSon = JSON.parse(rawdataStackingReward);
    const StackingRewardContractByteCode = rawdataStackingRewardContractJSon.bytecode;
    const constructorParameters = new ContractFunctionParameters()
        .addAddress(createStackingToken.toSolidityAddress())
        .addAddress(createRewardToken.toSolidityAddress());
    const createStackingRewardContract = await deployContract(client, StackingRewardContractByteCode, 90000, operatorPrKey, constructorParameters);
    
    console.log(`- Contract created ${createStackingRewardContract.toString()} ,Contract Address ${createStackingRewardContract.toSolidityAddress()} -`);
 }

 main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });