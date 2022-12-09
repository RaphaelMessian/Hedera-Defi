console.clear();
const  {storeContractFile} = require("../scripts/utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '/'});

async function VaultFile() {

  let client = Client.forTestnet();
  const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

  client.setOperator(
    operatorAccountId,
    operatorPrKey
  );

  const rawdataVault = fs.readFileSync(`${__dirname}/../artifacts/contracts/Rewards/Vault.sol/Vault.json`);
  const rawdataVaultContractJSon = JSON.parse(rawdataVault);
  const VaultContractByteCode = rawdataVaultContractJSon.bytecode;
  const createVaultFile = await storeContractFile(client, VaultContractByteCode, operatorPrKey)
  console.log(`- File created ${createVaultFile.toString()} -`);
  
  return createVaultFile;
}

module.exports = {
    VaultFile
};

VaultFile().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
