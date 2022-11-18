console.clear();
const  {getClient, createAccount, deployContract, createFungibleToken, mintToken, TokenBalance, TokenTransfer} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, TokenAssociateTransaction} = require("@hashgraph/sdk");
const fs = require('fs');
require('dotenv').config({path: __dirname + '../.env'});

let client = getClient();

const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);


async function main() {
    await LockRewards();
 }


 async function initialize(createLockRewardsContract) {
    const initializeTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("initialize")
        .setGas(1500000)
        .execute(client);
    
    const initializeReceipt = await initializeTx.getReceipt(client);
    console.log(`- initialize transaction ${initializeReceipt.status.toString()}.`);
 }

 async function addReward(createLockRewardsContract) {
    let contractFunctionParameters = new ContractFunctionParameters()
            .addUint256(10)
            .addUint256(10);

    const setDurationTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("setRewardsDuration", contractFunctionParameters)
        .setGas(1500000);

    const addRewardExec = await setDurationTx.execute(client);    
    const addRewardReceipt = await addRewardExec.getReceipt(client);
    console.log(`- Add Reward to the contract transaction status ${addRewardReceipt.status.toString()}.`);
 }

 async function stakeToken(createLockRewardsContract, client, key) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(10);
        // .addAddress(createStackingToken.toSolidityAddress());

    const stakeTokenTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("stake", contractFunctionParameters)
        .setGas(900000)
        .freezeWith(client)
        .sign(key);
     
    const stakeTokenExec = await stakeTokenTx.execute(client); 
    const stakeTokenRx = await stakeTokenExec.getReceipt(client);

    console.log(`- Stake token to the contract transaction status ${stakeTokenRx.status.toString()}.`);
 }

 async function notifyReward(createLockRewardsContract) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(10);

    const notifyRewardTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("notifyRewardAmount", contractFunctionParameters)
        .setGas(900000)
        .execute(client);
        
    const notifyRewardRx = await notifyRewardTx.getReceipt(client);
    console.log(`- notify Reward to the contract transaction status ${notifyRewardRx.status.toString()}.`);
 }

 async function getReward(createLockRewardsContract, client) {
    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("getReward")
        .setGas(900000)
        .execute(client);
        
    const getRewardRx = await getRewardTx.getReceipt(aliceClient);

    console.log(`- Get reward transaction status ${getRewardRx.status.toString()}.`);
 }

async function withdrawToken(createLockRewardsContract, client, key) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(10);
        // .addAddress(createStackingToken.toSolidityAddress());

    const withdrawTokenTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("withdraw", contractFunctionParameters)
        .setGas(900000)
        .freezeWith(client)
        .sign(key);
     
    const withdrawTokenExec = await withdrawTokenTx.execute(client); 
    const withdrawTokenRx = await withdrawTokenExec.getReceipt(client);

    console.log(`- Withdraw token transaction status ${withdrawTokenRx.status.toString()}.`);
}



async function LockRewards() {

    console.log(`\nSTEP 1 - Create Alice Account and Admin Account`);
    const aliceKey = PrivateKey.generateED25519();
    const aliceAccountId = await createAccount(client, aliceKey, 50);
    console.log(`- Alice account id created: ${aliceAccountId.toString()}`);

    // const adminKey = PrivateKey.generateED25519();
    // const adminAccountId = await createAccount(client, adminKey, 50);
    // console.log(`- Alice account id created: ${adminAccountId.toString()}`);

    console.log(`\nSTEP 2 - Create Stacking Token and Reward Token`);
    const createStackingToken = await createFungibleToken("Stacking Token", "ST", aliceAccountId, aliceKey.publicKey, client, aliceKey);
    const createRewardToken = await createFungibleToken("Reward Token", "RT", operatorAccountId, operatorPuKey, client, operatorPrKey);
    console.log(`- Stacking Token ${createStackingToken}, Stacking Token Address ${createStackingToken.toSolidityAddress()}`);
    console.log(`- Reward Token created ${createRewardToken}, Reward Token Address ${createRewardToken.toSolidityAddress()}`);
    const mintStackingToken = await mintToken(createStackingToken, client, 10, aliceKey);
    console.log(`- New 10 Stacking Token minted transaction status: ${mintStackingToken.status.toString()}`);
    const mintRewardToken = await mintToken(createRewardToken, client, 10, operatorPrKey);
    console.log(`- New 10 Reward Token minted transaction status: ${mintRewardToken.status.toString()}`);

    console.log(`\nSTEP 3 - Create and deploy Lock Reward Contract`);
    const rawdataLockRewards = fs.readFileSync("../artifacts/contracts/Rewards/LockRewards.sol/LockRewards.json");
    const rawdataLockRewardsContractJSon = JSON.parse(rawdataLockRewards);
    const lockRewardsContractByteCode = rawdataLockRewardsContractJSon.bytecode;
    const constructorParameters = new ContractFunctionParameters()
        .addAddress(createStackingToken.toSolidityAddress())
        .addAddress(createRewardToken.toSolidityAddress());
    const createLockRewardsContract = await deployContract(client, lockRewardsContractByteCode, 150000, operatorPrKey, constructorParameters);
    
    console.log(`- Contract created ${createLockRewardsContract.toString()} ,Contract Address ${createLockRewardsContract.toSolidityAddress()} -`);

    const initializeTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("initialize")
        .setGas(1500000)
        // .setPayableAmount(new Hbar(100))
        .execute(client);
    
    const initializeReceipt = await initializeTx.getReceipt(client);
    console.log(`- initialize transaction ${initializeReceipt.status.toString()}.`);

    // const rewardTokenTransfert = await TokenTransfer(createRewardToken, operatorAccountId,createLockRewardsContract, 10, client);
    // console.log(`- Token Transfert to contract: ${rewardTokenTransfert.status.toString()}`)

    console.log(`\nSTEP 4 - Set the duration of the reward ditribution`);
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(10)
        .addUint256(10);
        // .addAddress(createRewardToken.toSolidityAddress());

    const setDurationTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("setRewardsDuration", contractFunctionParameters)
        .setGas(1500000);

    const addRewardExec = await setDurationTx.execute(client);    
    const addRewardReceipt = await addRewardExec.getReceipt(client);
    console.log(`- Add Reward to the contract transaction status ${addRewardReceipt.status.toString()}.`);

    // const getBalanceTx1 = await new ContractExecuteTransaction()
    // .setContractId(createLockRewardsContract)
    // .setFunction("totalSupply")
    // .setGas(200000)
    // .execute(client);

    // const balanceRecord1 = await getBalanceTx1.getRecord(client);
    // const tokenBalance1 = balanceRecord1.contractFunctionResult.getUint256();

    // console.log(`They are ${tokenBalance1} Staked Token to the contract.`);

    const aliceClient = client.setOperator(aliceAccountId, aliceKey)

    console.log(`\nSTEP 5 - Stack Token`);
    let contractFunctionParameters1 = new ContractFunctionParameters()
        .addUint256(10);
        // .addAddress(createStackingToken.toSolidityAddress());

    const stakeTokenTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("stake", contractFunctionParameters1)
        .setGas(900000)
        .freezeWith(aliceClient)
        .sign(aliceKey);
     
    const stakeTokenExec = await stakeTokenTx.execute(aliceClient); 
    const stakeTokenRx = await stakeTokenExec.getReceipt(aliceClient);

    console.log(`- Stake token to the contract transaction status ${stakeTokenRx.status.toString()}.`);

    const getBalanceTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("totalSupply")
        .setGas(200000)
        .execute(client);
    
    const balanceRecord = await getBalanceTx.getRecord(client);
    const tokenBalance = balanceRecord.contractFunctionResult.getUint256();

    console.log(`- They are ${tokenBalance} Staked Token to the contract.`);

    console.log(`\nSTEP 6 - Notify reward contract`);
    let contractFunctionParameters2 = new ContractFunctionParameters()
        .addUint256(10);

    const notifyRewardTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("notifyRewardAmount", contractFunctionParameters2)
        .setGas(900000)
        .execute(client);
        
    const notifyRewardRx = await notifyRewardTx.getReceipt(client);
    console.log(`- notify Reward to the contract transaction status ${notifyRewardRx.status.toString()}.`);

    console.log(`\nSTEP 7 - Get Reward`);

    const tokenAssociate = await new TokenAssociateTransaction()
        .setAccountId(aliceAccountId)
        .setTokenIds([createRewardToken])
        .execute(aliceClient);

    const tokenAssociateReceipt = await tokenAssociate.getReceipt(client);
    console.log(`- tokenAssociateReceipt ${tokenAssociateReceipt.status.toString()}`);

    const getRewardTx = await new ContractExecuteTransaction()
        .setContractId(createLockRewardsContract)
        .setFunction("getReward")
        .setGas(900000)
        .execute(aliceClient);
        
    const getRewardRx = await getRewardTx.getReceipt(aliceClient);

    console.log(`- Get reward transaction status ${getRewardRx.status.toString()}.`);

    const tokenBalanceReward = await TokenBalance(aliceAccountId, client);
    console.log(`- tokenBalance of Alice ${tokenBalanceReward.toString()}`)

    // const setDurationTx2 = await new ContractExecuteTransaction()
    //     .setContractId(createLockRewardsContract)
    //     .setFunction("getRewardTokenCount")
    //     .setGas(900000)
    //     // .setPayableAmount(new Hbar(100))
    //     .execute(client);
    
    // const addRewardReceipt2 = await setDurationTx2.getReceipt(client);
    // const record2 = await setDurationTx2.getRecord(client);
    // console.log(`Add Reward to the contract transaction status ${record2.contractFunctionResult.getUint32()}.`);
    // console.log(`Add Reward to the contract transaction status ${addRewardReceipt2.status.toString()}.`);

};

module.exports = {
    initialize,
    addReward,
    stakeToken,
    withdrawToken,
    notifyReward,
    getReward
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });