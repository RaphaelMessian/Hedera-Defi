console.clear();
const  {getClient, createAccount, deployContract, createFungibleToken, mintToken, TokenBalance, TokenTransfer} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, TokenAssociateTransaction, ContractId} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '../.env'});

let client = getClient();

const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);
const scRewardsContract = ContractId.fromString('0.0.48790893');

async function main() {
    const aliceKey = PrivateKey.generateED25519();
    const aliceAccountId = await createAccount(client, aliceKey, 50);
    console.log(`- Alice account id created: ${aliceAccountId.toString()}`);
    const BobKey = PrivateKey.generateED25519();
    const BobAccountId = await createAccount(client, BobKey, 50);
    console.log(`- Bob account id created: ${BobAccountId.toString()}`);

    const BobClient = client.setOperator(BobAccountId, BobKey);

    const createStackingToken = await createFungibleToken("Stacking Token", "ST", aliceAccountId, aliceKey.publicKey, client, aliceKey);
    const createRewardToken = await createFungibleToken("Reward Token", "RT", operatorAccountId, operatorPuKey, client, operatorPrKey);
    console.log(`- Stacking Token ${createStackingToken}, Stacking Token Address ${createStackingToken.toSolidityAddress()}`);
    console.log(`- Reward Token created ${createRewardToken}, Reward Token Address ${createRewardToken.toSolidityAddress()}`);
    const mintStackingToken = await mintToken(createStackingToken, client, 10, aliceKey);
    console.log(`- New 10 Stacking Token minted transaction status: ${mintStackingToken.status.toString()}`);
    const tokenAssociate = await new TokenAssociateTransaction()
        .setAccountId(BobAccountId)
        .setTokenIds([createStackingToken])
        .execute(BobClient);

    const tokenAssociateReceipt = await tokenAssociate.getReceipt(BobClient);
    console.log(`- tokenAssociateReceipt ${tokenAssociateReceipt.status.toString()}`);

    const aliceClient = client.setOperator(aliceAccountId, aliceKey);
    const stackingTokenTransfert = await TokenTransfer(createStackingToken, aliceAccountId, BobAccountId, 5, aliceClient);
    console.log(`- Token Transfert to Bob : ${stackingTokenTransfert.status.toString()}`)

    const mintRewardToken = await mintToken(createRewardToken, client, 10, operatorPrKey);
    console.log(`- New 10 Reward Token minted transaction status: ${mintRewardToken.status.toString()}`);

    client.setOperator(operatorAccountId, operatorPrKey);
    await initialize(scRewardsContract, createStackingToken, createRewardToken);
    client.setOperator(aliceAccountId, aliceKey);
    await addStakeAccount(scRewardsContract, aliceAccountId, 5);
    client.setOperator(BobAccountId, BobKey);
    await addStakeAccount(scRewardsContract, BobAccountId, 5);
    client.setOperator(operatorAccountId, operatorPrKey);
    await addReward(scRewardsContract, 10);
    // client.setOperator(aliceAccountId, aliceKey);
    // await transfer(scRewardsContract, aliceAccountId, BobAccountId, 3);
    client.setOperator(BobAccountId, BobKey);
    await claimReward(scRewardsContract, BobAccountId, client);
 }

 async function initialize(scRewardsContract, stakingToken, rewardToken) {

    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(stakingToken.toSolidityAddress())
        .addAddress(rewardToken.toSolidityAddress());

    const initializeTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("initialize", contractFunctionParameters)
        .setGas(1500000)
        // .setPayableAmount(new Hbar(100))
        .execute(client);
    
    const initializeReceipt = await initializeTx.getReceipt(client);
    console.log(`- initialize transaction ${initializeReceipt.status.toString()}.`);
 }

 async function addStakeAccount(scRewardsContract, accountId, amount) {
    let contractFunctionParameters = new ContractFunctionParameters()
            .addAddress(accountId.toSolidityAddress())
            .addUint256(amount);

    const setDurationTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("addStakeAccount", contractFunctionParameters)
        .setGas(1500000);

    const addRewardExec = await setDurationTx.execute(client);    
    const addRewardReceipt = await addRewardExec.getReceipt(client);
    console.log(`- Add Stake Account to the contract transaction status ${addRewardReceipt.status.toString()}.`);
 }

 async function addReward(scRewardsContract, amount) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(amount);

    const notifyRewardTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("addReward", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
        
    const notifyRewardRx = await notifyRewardTx.getReceipt(client);
    console.log(`- Add Reward to the contract transaction status ${notifyRewardRx.status.toString()}.`);
 }

 async function claimReward(scRewardsContract, claimer, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(claimer.toSolidityAddress());

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("claimReward", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
        
    const getRewardRx = await getRewardTx.getReceipt(client);
    const rewardRecord = await getRewardTx.getRecord(client);
    console.log(`- Reward Claimed ${rewardRecord.contractFunctionResult.getInt256(0)}.`);
    console.log(`- Get reward transaction status ${getRewardRx.status.toString()}.`);
 }

async function transfer(scRewardsContract, sender, receiver, amount) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(sender.toSolidityAddress())
        .addAddress(receiver.toSolidityAddress())
        .addUint256(amount);
        // .addAddress(createStackingToken.toSolidityAddress());

    const transferTokenTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("transfer", contractFunctionParameters)
        .setGas(1500000);
     
    const transferTokenExec = await transferTokenTx.execute(client); 
    const transferTokenRx = await transferTokenExec.getReceipt(client);

    console.log(`- Transfer token transaction status ${transferTokenRx.status.toString()}.`);
}

 main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });