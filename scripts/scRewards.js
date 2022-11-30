console.clear();
const  {getClient, createAccount, deployContract, createFungibleToken, mintToken, TokenBalance, TokenTransfer} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, TokenAssociateTransaction, ContractId} = require("@hashgraph/sdk");
require('dotenv').config({path: __dirname + '../.env'});

let client = getClient();

const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);
const scRewardsContract = ContractId.fromString('0.0.48908703');

async function main() {
    const aliceKey = PrivateKey.generateED25519();
    const aliceAccountId = await createAccount(client, aliceKey, 10);
    console.log(`- Alice account id created: ${aliceAccountId.toString()}`);
    // const BobKey = PrivateKey.generateED25519();
    // const BobAccountId = await createAccount(client, BobKey, 10);
    // console.log(`- Bob account id created: ${BobAccountId.toString()}`);

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

    client.setOperator(operatorAccountId, operatorPrKey);
    await initialize(scRewardsContract, createStackingToken);
    // client.setOperator(aliceAccountId, aliceKey);
    // await addStakeAccount(scRewardsContract, 50);
    // // client.setOperator(BobAccountId, BobKey);
    // // await addStakeAccount(scRewardsContract, 50);
    // client.setOperator(operatorAccountId, operatorPrKey);
    // await addReward(scRewardsContract, createRewardToken1, 100);
    // // await addReward(scRewardsContract, createRewardToken2, 100);
    // client.setOperator(BobAccountId, BobKey);
    // await claimAllReward(scRewardsContract, client);
    // await claimAllReward(scRewardsContract, client);
    // client.setOperator(aliceAccountId, aliceKey);
    // await claimSpecificReward(scRewardsContract, createRewardToken1, client);
    // client.setOperator(BobAccountId, BobKey);
    // await claimSpecificReward(scRewardsContract, createRewardToken1, client);
    // client.setOperator(aliceAccountId, aliceKey);
    // await claimSpecificReward(scRewardsContract, createRewardToken1, client);
    // client.setOperator(aliceAccountId, aliceKey);
    // await claimReward(scRewardsContract, aliceAccountId, client);
 }

 async function initialize(scRewardsContract, stakingToken) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(stakingToken.toSolidityAddress());

    const initializeTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("initialize", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const initializeReceipt = await initializeTx.getReceipt(client);
    console.log(`- initialize transaction ${initializeReceipt.status.toString()}.`);
 }

//  async function addStakeAccount(scRewardsContract, amount, client) {
//     let contractFunctionParameters = new ContractFunctionParameters()
//             .addUint256(amount*1e8);

//     const setDurationTx = await new ContractExecuteTransaction()
//         .setContractId(scRewardsContract)
//         .setFunction("addStakeAccount", contractFunctionParameters)
//         .setGas(1500000);

//     const addRewardExec = await setDurationTx.execute(client);    
//     const addRewardReceipt = await addRewardExec.getReceipt(client);
//     console.log(`- Add Stake Account to the contract transaction status ${addRewardReceipt.status.toString()}.`);
//  }

//  async function addReward(scRewardsContract, rewardToken, amount) {
//     let contractFunctionParameters = new ContractFunctionParameters()
//         .addAddress(rewardToken.toSolidityAddress())
//         .addUint256(amount*1e8);

//     const notifyRewardTx = await new ContractExecuteTransaction()
//         .setContractId(scRewardsContract)
//         .setFunction("addReward", contractFunctionParameters)
//         .setGas(1500000)
//         .execute(client);
        
//     const notifyRewardRx = await notifyRewardTx.getReceipt(client);
//     console.log(`- Add Reward to the contract transaction status ${notifyRewardRx.status.toString()}.`);
//  }

 async function addToken(scRewardsContract, tokenId, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(tokenId.toSolidityAddress())
        .addUint256(amount*1e8);

    const notifyRewardTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("addToken", contractFunctionParameters)
        .setGas(2500000)
        .execute(client);
        
    const notifyRewardRx = await notifyRewardTx.getReceipt(client);
    console.log(`- Add Token to the contract transaction status ${notifyRewardRx.status.toString()}.`);
 }


 async function claimSpecificsReward(scRewardsContract, rewardToken, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddressArray(rewardToken)

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
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

 async function claimAllReward(scRewardsContract, startPosition, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(startPosition)

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("claimAllReward", contractFunctionParameters)
        .setGas(3500000)
        .execute(client);
        
    const getRewardRx = await getRewardTx.getReceipt(client);
    const rewardRecord = await getRewardTx.getRecord(client);
    const totalReward = rewardRecord.contractFunctionResult.getInt256(0);
    console.log(`- Get reward transaction status ${getRewardRx.status.toString()}.`);
    return totalReward.toString();
 }

 async function withdraw(scRewardsContract, startPosition, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(startPosition)
        .addUint256(amount*1e8);

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(scRewardsContract)
        .setFunction("withdraw", contractFunctionParameters)
        .setGas(3500000)
        .execute(client);
        
    const getRewardRx = await getRewardTx.getReceipt(client);
    const rewardRecord = await getRewardTx.getRecord(client);
    const totalReward = rewardRecord.contractFunctionResult.getInt256(0);
    console.log(`- withdraw transaction status ${getRewardRx.status.toString()}.`);
    return totalReward.toString();
 }

 module.exports = {
    initialize,
    // addStakeAccount,
    // addReward,
    addToken,
    withdraw,
    claimAllReward,
    claimSpecificsReward
}

//  main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
