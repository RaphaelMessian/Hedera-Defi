console.clear();
const  {deployContract,} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '/'});

async function main() {

  let client = Client.forTestnet();
  const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

  client.setOperator(
    operatorAccountId,
    operatorPrKey
  );

  const rawdataStackingReward = fs.readFileSync("../artifacts/contracts/StackingRewards/StakingRewards.sol/StakingRewards.json");
  const rawdataStackingRewardContractJSon = JSON.parse(rawdataStackingReward);
  const StackingRewardContractByteCode = rawdataStackingRewardContractJSon.bytecode;
  const constructorParameters = new ContractFunctionParameters()
      .addAddress(createStackingToken.toSolidityAddress())
      .addAddress(createRewardToken.toSolidityAddress());
  const createStackingRewardContract = await deployContract(client, StackingRewardContractByteCode, 150000, operatorPrKey, constructorParameters);
  
  console.log(`- Contract created ${createStackingRewardContract.toString()} ,Contract Address ${createStackingRewardContract.toSolidityAddress()} -`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
