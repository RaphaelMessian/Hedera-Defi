console.clear();
const  {getClient, createAccount, deployContract, createFungibleToken, mintToken, TokenBalance, TokenTransfer} = require("./utils");
const  {initialize, addToken, initializeVault} = require("./vault");
const {Client, AccountId, PrivateKey,TokenId, ContractFunctionParameters, ContractExecuteTransaction, TokenAssociateTransaction, ContractId} = require("@hashgraph/sdk");
require('dotenv').config({path: __dirname + '../.env'});

let client = getClient();

const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);
const SplitterContract = ContractId.fromString('0.0.49099013');
const Vault1Contract = ContractId.fromString('0.0.49098604');
const Vault2Contract = ContractId.fromString('0.0.49098615');

async function main() {
    const aliceKey = PrivateKey.generateED25519();
    const aliceAccountId = await createAccount(client, aliceKey, 20);
    console.log(`- Alice account id created: ${aliceAccountId.toString()}`);
    console.log(`- Alice account id created: ${aliceKey.toString()}`);

    const createStackingToken = TokenId.fromString("0.0.49098624"); //await createFungibleToken("Stacking Token", "ST", aliceAccountId, aliceKey.publicKey, client, aliceKey);
    const createRewardToken1 = TokenId.fromString("0.0.49098627"); //await createFungibleToken("Reward Token 1", "RT1", operatorAccountId, operatorPuKey, client, operatorPrKey);
    console.log(`- Stacking Token ${createStackingToken}, Stacking Token Address ${createStackingToken.toSolidityAddress()}`);
    console.log(`- Reward Token 1 created ${createRewardToken1}, Reward Token 1 Address ${createRewardToken1.toSolidityAddress()}`);

    //Initialize Splitter
    await initializeSplitter(SplitterContract, Vault1Contract, 3, createStackingToken);
    //Add 2nd Vault
    await addNewVault(SplitterContract, Vault2Contract, 14);

    await getVaultMultiplier(SplitterContract, Vault1Contract);
    await getTvl(SplitterContract, Vault1Contract);
    await getVaultMultiplier(SplitterContract, Vault2Contract);
    await getTvl(SplitterContract, Vault2Contract);
    await getTvlAllVault(SplitterContract);
    // Initialize 1st vault
    // await initializeVault(Vault1Contract, createStackingToken);
    // Initialize 2nd vault
    // await initializeVault(Vault2Contract, createStackingToken);
    // change operator
    // client.setOperator(aliceAccountId, aliceKey);
    // Stake token to the first vault
    // await addToken(Vault1Contract, createStackingToken, 10, client);
    // Stake token to the second vault
    // await addToken(Vault2Contract, createStackingToken, 20, client);
    //deposit reward to the splitter
    // client.setOperator(operatorAccountId, operatorPrKey);
    // await deposit(SplitterContract, 10);
 }

 async function initializeSplitter(splitterContract, vaultAddress, multiplier, stakingToken) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(vaultAddress.toSolidityAddress())
        .addUint256(multiplier)
        .addAddress(stakingToken.toSolidityAddress());


    const initializeTx = await new ContractExecuteTransaction()
        .setContractId(splitterContract)
        .setFunction("initialize", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const initializeReceipt = await initializeTx.getReceipt(client);
    console.log(`- initialize transaction ${initializeReceipt.status.toString()}.`);
 }

 async function addNewVault(splitterContract, vaultAddress, multiplier) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(vaultAddress.toSolidityAddress())
        .addUint256(multiplier);


    const addNewVaultTx = await new ContractExecuteTransaction()
        .setContractId(splitterContract)
        .setFunction("addNewVault", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const addNewVaultReceipt = await addNewVaultTx.getReceipt(client);
    console.log(`- add new vault transaction ${addNewVaultReceipt.status.toString()}.`);
 }

 async function deposit(splitterContract, amount) {
    // let contractFunctionParameters = new ContractFunctionParameters()
    //     .addUint256(amount);

    const depositTx = await new ContractExecuteTransaction()
        .setContractId(splitterContract)
        .setFunction("deposit")
        .setGas(3500000)
        .execute(client);
    
    const addNewVaultReceipt = await depositTx.getReceipt(client);
    const depositRecord = await depositTx.getRecord(client);
    const weightVault1 = depositRecord.contractFunctionResult.getInt256(0);
    const weightVault2 = depositRecord.contractFunctionResult.getInt256(1);
    console.log(`-  weightVault1 ${weightVault1}.`);
    console.log(`-  weightVault2 ${weightVault2}.`);
    console.log(`- deposit transaction ${addNewVaultReceipt.status.toString()}.`);
 }

 async function getTvl(splitterContract, vault) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(vault.toSolidityAddress());

    const getTvlTx = await new ContractExecuteTransaction()
        .setContractId(splitterContract)
        .setFunction("getTvlPerVault", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const getTvlReceipt = await getTvlTx.getReceipt(client);
    const getTvlRecord = await getTvlTx.getRecord(client);
    const tvlVault = getTvlRecord.contractFunctionResult.getInt256(0);
    console.log(`-  getTvlPerVault ${tvlVault}.`);
    console.log(`- getTvlPerVault transaction ${getTvlReceipt.status.toString()}.`);
 }

 async function getVaultMultiplier(splitterContract, vault) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(vault.toSolidityAddress());

    const getVaultMultiplierTx = await new ContractExecuteTransaction()
        .setContractId(splitterContract)
        .setFunction("getVaultMultiplier", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const getVaultMultiplierReceipt = await getVaultMultiplierTx.getReceipt(client);
    const getVaultMultiplierRecord = await getVaultMultiplierTx.getRecord(client);
    const multiplierVault = getVaultMultiplierRecord.contractFunctionResult.getInt256(0);
    console.log(`-  getVaultMultiplier ${multiplierVault}.`);
    console.log(`- multiplierVault transaction ${getVaultMultiplierReceipt.status.toString()}.`);
 }

 async function getTvlAllVault(splitterContract) {
    // let contractFunctionParameters = new ContractFunctionParameters()
    //     .addAddress(vault.toSolidityAddress());

    const depositTx = await new ContractExecuteTransaction()
        .setContractId(splitterContract)
        .setFunction("getTvlAllVault")
        .setGas(1500000)
        .execute(client);
    
    const addNewVaultReceipt = await depositTx.getReceipt(client);
    const depositRecord = await depositTx.getRecord(client);
    const getTvlAllVault = depositRecord.contractFunctionResult.getInt256(0);
    console.log(`-  getTvlAllVault ${getTvlAllVault}.`);
    console.log(`- getTvlAllVault transaction ${addNewVaultReceipt.status.toString()}.`);
 }
 module.exports = {
    initializeSplitter,
    addNewVault,
    deposit,
    getTvl,
    getVaultMultiplier,
    getTvlAllVault
}

 main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
