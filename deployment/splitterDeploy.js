console.clear();
const  {deployContract,} = require("../scripts/utils");
const {Client, AccountId, PrivateKey} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '/'});

async function splitterDeploy() {

  let client = Client.forTestnet();
  const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

  client.setOperator(
    operatorAccountId,
    operatorPrKey
  );

  const rawdataSplitter = fs.readFileSync(`${__dirname}/../artifacts/contracts/Rewards/Splitter.sol/Splitter.json`);
  const rawdataSplitterContractJSon = JSON.parse(rawdataSplitter);
  const SplitterContractByteCode = rawdataSplitterContractJSon.bytecode;
  const createSplitterContract = await deployContract(client, SplitterContractByteCode, 150000, operatorPrKey);

  console.log(`- Splitter Contract created ${createSplitterContract.toString()} ,Contract Address ${createSplitterContract.toSolidityAddress()} -`);

}

module.exports = {
    splitterDeploy
};

splitterDeploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
