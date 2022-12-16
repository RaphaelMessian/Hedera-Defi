console.clear();
const  {getClient, createAccount, deployContract, createFungibleToken, mintToken, TokenBalance, TokenTransfer} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, TokenAssociateTransaction, ContractId} = require("@hashgraph/sdk");
require('dotenv').config({path: __dirname + '../.env'});

let client = getClient();

const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);
const VaultContract = ContractId.fromString('0.0.49047443');

async function main() {
    const aliceKey = PrivateKey.generateED25519();
    const aliceAccountId = await createAccount(client, aliceKey, 40);
    console.log(`- Alice account id created: ${aliceAccountId.toString()}`);
    console.log(`- Alice account id created: ${aliceKey.toString()}`);
    // // const BobKey = PrivateKey.generateED25519();
    // // const BobAccountId = await createAccount(client, BobKey, 10);
    // // console.log(`- Bob account id created: ${BobAccountId.toString()}`);

    const createStackingToken = await createFungibleToken("Stacking Token", "ST", aliceAccountId, aliceKey.publicKey, client, aliceKey);
    const createRewardToken1 = await createFungibleToken("Reward Token 1", "RT1", operatorAccountId, operatorPuKey, client, operatorPrKey);
    // const createRewardToken2 = await createFungibleToken("Reward Token 2", "RT2", operatorAccountId, operatorPuKey, client, operatorPrKey);
    console.log(`- Stacking Token ${createStackingToken}, Stacking Token Address ${createStackingToken.toSolidityAddress()}`);
    console.log(`- Reward Token 1 created ${createRewardToken1}, Reward Token 1 Address ${createRewardToken1.toSolidityAddress()}`);
    // console.log(`- Reward Token 2 created ${createRewardToken2}, Reward Token 2 Address ${createRewardToken2.toSolidityAddress()}`);
    // const mintStackingToken = await mintToken(createStackingToken, client, 10, aliceKey);
    // console.log(`- New 10 Stacking Token minted transaction status: ${mintStackingToken.status.toString()}`);
    // const BobClient = client.setOperator(BobAccountId, BobKey);
    // const tokenAssociate = await new TokenAssociateTransaction()
    //     .setAccountId(BobAccountId)
    //     .setTokenIds([createStackingToken])
    //     .execute(BobClient);

    // const tokenAssociateReceipt = await tokenAssociate.getReceipt(BobClient);
    // console.log(`- tokenAssociateReceipt ${tokenAssociateReceipt.status.toString()}`);

    // const aliceClient = client.setOperator(aliceAccountId, aliceKey);
    // const stackingTokenTransfert = await TokenTransfer(createStackingToken, aliceAccountId, BobAccountId, 50, aliceClient);
    // console.log(`- Token Transfert to Bob : ${stackingTokenTransfert.status.toString()}`)

    // const mintRewardToken = await mintToken(createRewardToken1, client, 10, operatorPrKey);
    // console.log(`- New 10 Reward Token minted transaction status: ${mintRewardToken.status.toString()}`);

    // client.setOperator(operatorAccountId, operatorPrKey);
    // await initialize(VaultContract, createStackingToken);
    // client.setOperator(aliceAccountId, aliceKey);
    // await addToken(VaultContract, createStackingToken, 10, client);
    // client.setOperator(operatorAccountId, operatorPrKey);
    // await addToken(VaultContract, createRewardToken1, 10, client);
    // client.setOperator(aliceAccountId, aliceKey);
    client.setOperator(AccountId.fromString("0.0.49047456"),PrivateKey.fromString("302e020100300506032b657004220420f9387e4f81a58095f3bb0fc63a0c97af5738144dbfc291cdbfbb54a801b38dc9"));
    await unlock(VaultContract, 0, 10, client);
    // client.setOperator(aliceAccountId, aliceKey);
    // await addStakeAccount(VaultContract, 50);
    // // client.setOperator(BobAccountId, BobKey);
    // // await addStakeAccount(VaultContract, 50);
    // client.setOperator(operatorAccountId, operatorPrKey);
    // await addReward(VaultContract, createRewardToken1, 100);
    // // await addReward(VaultContract, createRewardToken2, 100);
    // client.setOperator(BobAccountId, BobKey);
    // await claimAllReward(VaultContract, client);
    // await claimAllReward(VaultContract, client);
    // client.setOperator(aliceAccountId, aliceKey);
    // await claimSpecificReward(VaultContract, createRewardToken1, client);
    // client.setOperator(BobAccountId, BobKey);
    // await claimSpecificReward(VaultContract, createRewardToken1, client);
    // client.setOperator(aliceAccountId, aliceKey);
    // await claimSpecificReward(VaultContract, createRewardToken1, client);
    // client.setOperator(aliceAccountId, aliceKey);
    // await claimReward(VaultContract, aliceAccountId, client);
 }

 async function initializeVault(VaultContract, stakingToken) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(stakingToken.toSolidityAddress());

    const initializeTx = await new ContractExecuteTransaction()
        .setContractId(VaultContract)
        .setFunction("initialize", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const initializeReceipt = await initializeTx.getReceipt(client);
    console.log(`- initialize transaction ${initializeReceipt.status.toString()}.`);
 }


 async function addToken(VaultContract, tokenId, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(tokenId.toSolidityAddress())
        .addUint256(amount*1e8);

    const notifyRewardTx = await new ContractExecuteTransaction()
        .setContractId(VaultContract)
        .setFunction("addToken", contractFunctionParameters)
        .setGas(2500000)
        .execute(client);   

    const notifyRewardRx = await notifyRewardTx.getReceipt(client);
    // const rewardRecord = await notifyRewardTx.getRecord(client);
    // const totalReward = rewardRecord.contractFunctionResult.getInt256(0);
    // console.log(`- Reward Claimed ${totalReward}.`);
    console.log(`- Add Token to the contract transaction status ${notifyRewardRx.status.toString()}.`);
 }


 async function claimSpecificsReward(VaultContract, rewardToken, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddressArray(rewardToken)

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(VaultContract)
        .setFunction("claimSpecificsReward", contractFunctionParameters)
        .setGas(3500000)
        .execute(client);
        
    const getRewardRx = await getRewardTx.getReceipt(client);
    const rewardRecord = await getRewardTx.getRecord(client);
    const totalReward = rewardRecord.contractFunctionResult.getInt256(0);
    console.log(`- Reward Claimed ${totalReward}.`);
    console.log(`- Get reward transaction status ${getRewardRx.status.toString()}.`);
    return totalReward
 }

 async function claimAllReward(VaultContract, startPosition, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(startPosition)

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(VaultContract)
        .setFunction("claimAllReward", contractFunctionParameters)
        .setGas(3500000)
        .execute(client);
        
    const getRewardRx = await getRewardTx.getReceipt(client);
    const rewardRecord = await getRewardTx.getRecord(client);
    const totalReward = rewardRecord.contractFunctionResult.getInt256(0);
    console.log(`- Get reward transaction status ${getRewardRx.status.toString()}.`);
    return totalReward.toString();
 }

 async function withdraw(VaultContract, startPosition, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(startPosition)
        .addUint256(amount*1e8);

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(VaultContract)
        .setFunction("withdraw", contractFunctionParameters)
        .setGas(3500000)
        .execute(client);
        
    const getRewardRx = await getRewardTx.getReceipt(client);
    const rewardRecord = await getRewardTx.getRecord(client);
    const totalReward = rewardRecord.contractFunctionResult.getInt256(0);
    console.log(`- withdraw transaction status ${getRewardRx.status.toString()}.`);
    return totalReward.toString();
 }

 async function unlock(VaultContract, startPosition, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(startPosition)
        .addUint256(amount*1e8);

    const unlockTx = await new ContractExecuteTransaction()
        .setContractId(VaultContract)
        .setFunction("unlock", contractFunctionParameters)
        .setGas(3500000)
        .execute(client);
        
    const unlockRx = await unlockTx.getReceipt(client);
    const unlockRecord = await unlockTx.getRecord(client);
    const timeStamp = unlockRecord.contractFunctionResult.getInt256(0);
    const userTimeStamp = unlockRecord.contractFunctionResult.getInt256(1);
    const lockPeriod = unlockRecord.contractFunctionResult.getInt256(2);
    console.log(`-  TimeStamp ${timeStamp}.`);
    console.log(`- user TimeStamp ${userTimeStamp}.`);
    console.log(`-  lockPeriod ${lockPeriod}.`);
    console.log(`- unlock transaction status ${unlockRx.status.toString()}.`);
    // return unlock.toString();
 }

 module.exports = {
    initializeVault,
    // addStakeAccount,
    // addReward,
    addToken,
    withdraw,
    claimAllReward,
    claimSpecificsReward,
    unlock
}

//  main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
