console.clear();
const  {deployContract} = require("../scripts/utils");
const {Client, AccountId, PrivateKey} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '/'});

async function testEventDeploy() {

  let client = Client.forTestnet();
  const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

  client.setOperator(
    operatorAccountId,
    operatorPrKey
  );

  const rawdataSplitter = fs.readFileSync(`${__dirname}/../artifacts/contracts/test/testEventHTS.sol/testEventHTS.json`);
  const rawdataSplitterContractJSon = JSON.parse(rawdataSplitter);
  const SplitterContractByteCode = rawdataSplitterContractJSon.bytecode;
  const createSplitterContract = await deployContract(client, SplitterContractByteCode, 150000, operatorPrKey);

  console.log(`- test Event Contract created ${createSplitterContract.toString()} ,Contract Address ${createSplitterContract.toSolidityAddress()} -`);

}

module.exports = {
    testEventDeploy
};

testEventDeploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
