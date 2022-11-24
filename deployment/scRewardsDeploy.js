console.clear();
const  {deployContract,} = require("../scripts/utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '/'});

async function scRewardsDeploy() {

  let client = Client.forTestnet();
  const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

  client.setOperator(
    operatorAccountId,
    operatorPrKey
  );

  const lockPeriod = 1;

  const rawdataSCRewards = fs.readFileSync(`${__dirname}/../artifacts/contracts/Rewards/SCRewards.sol/SCRewards.json`);
  const rawdataSCRewardsContractJSon = JSON.parse(rawdataSCRewards);
  const SCRewardsContractByteCode = rawdataSCRewardsContractJSon.bytecode;
  const constructorParameters = new ContractFunctionParameters()
    .addUint256(lockPeriod);
  const createSCRewardsContract = await deployContract(client, SCRewardsContractByteCode, 150000, operatorPrKey, constructorParameters);

  console.log(`- Contract created ${createSCRewardsContract.toString()} ,Contract Address ${createSCRewardsContract.toSolidityAddress()} -`);
  return createSCRewardsContract;
}

module.exports = {
  scRewardsDeploy
};

scRewardsDeploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
