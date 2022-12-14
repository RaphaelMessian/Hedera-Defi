console.clear();
const  {storeContractFile} = require("../scripts/utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '/'});

async function scRewardsFile() {

  let client = Client.forTestnet();
  const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

  client.setOperator(
    operatorAccountId,
    operatorPrKey
  );

  const rawdataSCRewards = fs.readFileSync(`${__dirname}/../artifacts/contracts/Rewards/SCRewards.sol/SCRewards.json`);
  const rawdataSCRewardsContractJSon = JSON.parse(rawdataSCRewards);
  const SCRewardsContractByteCode = rawdataSCRewardsContractJSon.bytecode;
  const createSCRewardsFile = await storeContractFile(client, SCRewardsContractByteCode, operatorPrKey)
  console.log(`- File created ${createSCRewardsFile.toString()} -`);
  
  return createSCRewardsFile;
}

module.exports = {
    scRewardsFile
};

scRewardsFile().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
