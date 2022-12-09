console.clear();
const  {deployContract,} = require("../scripts/utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '/'});

async function VaultDeploy() {

  let client = Client.forTestnet();
  const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

  client.setOperator(
    operatorAccountId,
    operatorPrKey
  );

  const lockPeriod = 30;

  const rawdataVault = fs.readFileSync(`${__dirname}/../artifacts/contracts/Rewards/Vault.sol/Vault.json`);
  const rawdataVaultContractJSon = JSON.parse(rawdataVault);
  const VaultContractByteCode = rawdataVaultContractJSon.bytecode;
  const constructorParameters = new ContractFunctionParameters()
    .addUint256(lockPeriod);
  const createVaultContract = await deployContract(client, VaultContractByteCode, 150000, operatorPrKey, constructorParameters);

  console.log(`- Contract created ${createVaultContract.toString()} ,Contract Address ${createVaultContract.toSolidityAddress()} -`);
  return createVaultContract;
}

module.exports = {
  VaultDeploy
};

VaultDeploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
