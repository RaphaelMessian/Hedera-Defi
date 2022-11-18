console.clear();
const  {deployContract,} = require("../scripts/utils");
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

  const rawdataLockRewards = fs.readFileSync(`${__dirname}/../artifacts/contracts/Rewards/LockRewards.sol/LockRewards.json`);
  const rawdataLockRewardsContractJSon = JSON.parse(rawdataLockRewards);
  const lockRewardsContractByteCode = rawdataLockRewardsContractJSon.bytecode;
  const constructorParameters = new ContractFunctionParameters()
      .addAddress(createStackingToken.toSolidityAddress())
      .addAddress(createRewardToken.toSolidityAddress());
  const createLockRewardsContract = await deployContract(client, lockRewardsContractByteCode, 150000, operatorPrKey, constructorParameters);
  
  console.log(`- Contract created ${createLockRewardsContract.toString()} ,Contract Address ${createLockRewardsContract.toSolidityAddress()} -`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
