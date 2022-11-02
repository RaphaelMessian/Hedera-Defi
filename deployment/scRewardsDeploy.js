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

  const rawdataSCRewards = fs.readFileSync("../artifacts/contracts/Rewards/SCRewards.sol/SCRewards.json");
  const rawdataSCRewardsContractJSon = JSON.parse(rawdataSCRewards);
  const SCRewardsContractByteCode = rawdataSCRewardsContractJSon.bytecode;
  const createSCRewardsContract = await deployContract(client, SCRewardsContractByteCode, 150000, operatorPrKey);
  
  console.log(`- Contract created ${createSCRewardsContract.toString()} ,Contract Address ${createSCRewardsContract.toSolidityAddress()} -`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
