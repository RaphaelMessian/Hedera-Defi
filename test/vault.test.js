const { expect } = require("chai");
const chai = require('chai');
const BN = require('bn.js');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

const { 
    initializeVault,
    claimAllReward,
    claimSpecificsReward,
    addToken,
    withdraw,
    unlock
} = require('../scripts/vault.js');

const {
    createAccount,
    createFungibleToken,
    getClient,
    createSmartContract,
    TokenTransfer,
    tokenBalance
} = require('../scripts/utils.js');


const { 
    Client,
    AccountId, 
    PrivateKey,
    FileId,
    ContractId,
    TokenAssociateTransaction,
    AccountBalanceQuery
} = require("@hashgraph/sdk");

const fileId = FileId.fromString("0.0.48912519");
const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);
const delay = ms => new Promise(res => setTimeout(res, ms));
let client;

describe('All Tests', async function () {
    let aliceAccountId;
    let aliceKey;
    let bobAccountId;
    let bobKey;
    let stakingToken;
    let createRewardToken1;
    let createRewardToken2;
    let contractId;
    let tokenArray = [];
    before(async function () {
        client = getClient();
        aliceKey = PrivateKey.generateED25519();
        aliceAccountId = await createAccount(client, aliceKey, 20);
        bobKey = PrivateKey.generateED25519();
        bobAccountId = await createAccount(client, bobKey, 20);
        stakingToken = await createFungibleToken("Stacking Token", "ST", aliceAccountId, aliceKey.publicKey, client, aliceKey);
        createRewardToken1 = await createFungibleToken("Reward Token 1", "RT1", operatorAccountId, operatorPuKey, client, operatorPrKey);
        createRewardToken2 = await createFungibleToken("Reward Token 2", "RT2", operatorAccountId, operatorPuKey, client, operatorPrKey);
        client.setOperator(bobAccountId, bobKey)
        const tokenAssociate = await new TokenAssociateTransaction()
            .setAccountId(bobAccountId)
            .setTokenIds([stakingToken])
            .execute(client);

        await tokenAssociate.getReceipt(client);

        client.setOperator(aliceAccountId, aliceKey);
        await TokenTransfer(stakingToken, aliceAccountId, bobAccountId, 50, client);
    }); 
    context('withdraw', async function () {
        beforeEach(async () => {
            client = getClient();
            //contractId = await createSmartContract(client, fileId, 150000);
            contractId = ContractId.fromString('0.0.49089788');
            await initializeVault(contractId, stakingToken);
        });
        // it('two people, two type of reward, one withdraw, add reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId,stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward2 = aliceBalance.tokens.get(createRewardToken2).toString();
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward2 = bobBalance.tokens.get(createRewardToken1).toString();
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance2 = await tokenBalance(aliceAccountId, client);
        //     const bobBalance2 = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward3 = aliceBalance2.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward3 = bobBalance2.tokens.get(createRewardToken1).toString();
        //     expect(balanceAliceReward1).equals('500000000');
        //     expect(balanceBobReward1).equals('500000000');
        //     expect(balanceAliceReward2).equals('500000000');
        //     expect(balanceBobReward2).equals('500000000');
        //     expect(balanceAliceReward3).equals('833333333');
        //     expect(balanceBobReward3).equals('1166666667');
        // });
        // it('two people, two type of reward, one withdraw, add two reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId,stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward2 = aliceBalance.tokens.get(createRewardToken2).toString();
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward2 = bobBalance.tokens.get(createRewardToken2).toString();
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance2 = await tokenBalance(aliceAccountId, client);
        //     const bobBalance2 = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward3 = aliceBalance2.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward4 = aliceBalance2.tokens.get(createRewardToken2).toString();
        //     const balanceBobReward3 = bobBalance2.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward4 = bobBalance2.tokens.get(createRewardToken2).toString();
        //     expect(balanceAliceReward1).equals('500000000');
        //     expect(balanceBobReward1).equals('500000000');
        //     expect(balanceAliceReward2).equals('500000000');
        //     expect(balanceBobReward2).equals('500000000');
        //     expect(balanceAliceReward3).equals('833333333');
        //     expect(balanceBobReward3).equals('1166666667');
        //     expect(balanceAliceReward4).equals('833333333');
        //     expect(balanceBobReward4).equals('1166666667');
        // });
        // it('two people, two type of reward, two withdraw, add two reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId,stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward2 = aliceBalance.tokens.get(createRewardToken2).toString();
        //     client.setOperator(bobAccountId, bobKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward2 = bobBalance.tokens.get(createRewardToken2).toString();
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance2 = await tokenBalance(aliceAccountId, client);
        //     const bobBalance2 = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward3 = aliceBalance2.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward4 = aliceBalance2.tokens.get(createRewardToken2).toString();
        //     const balanceBobReward3 = bobBalance2.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward4 = bobBalance2.tokens.get(createRewardToken2).toString();
        //     expect(balanceAliceReward1).equals('500000000');
        //     expect(balanceBobReward1).equals('500000000');
        //     expect(balanceAliceReward2).equals('500000000');
        //     expect(balanceBobReward2).equals('500000000');
        //     expect(balanceAliceReward3).equals('500000000');
        //     expect(balanceBobReward3).equals('500000000');
        //     expect(balanceAliceReward4).equals('1000000000');
        //     expect(balanceBobReward4).equals('1000000000');
        // });
        // it('two people, two type of reward, two withdraw, add two reward, both add stake, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId,stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward2 = aliceBalance.tokens.get(createRewardToken2).toString();
        //     client.setOperator(bobAccountId, bobKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward2 = bobBalance.tokens.get(createRewardToken2).toString();
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance2 = await tokenBalance(aliceAccountId, client);
        //     const bobBalance2 = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward3 = aliceBalance2.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward4 = aliceBalance2.tokens.get(createRewardToken2).toString();
        //     const balanceBobReward3 = bobBalance2.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward4 = bobBalance2.tokens.get(createRewardToken2).toString();
        //     expect(balanceAliceReward1).equals('500000000');
        //     expect(balanceBobReward1).equals('500000000');
        //     expect(balanceAliceReward2).equals('500000000');
        //     expect(balanceBobReward2).equals('500000000');
        //     expect(balanceAliceReward3).equals('1000000000');
        //     expect(balanceBobReward3).equals('1000000000');
        //     expect(balanceAliceReward4).equals('1000000000');
        //     expect(balanceBobReward4).equals('1000000000');
        // });
        // it('two persons, P1 staked, 2 rewards, P2 staked, claim', async function(){
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward2 = aliceBalance.tokens.get(createRewardToken2).toString();
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward2 = bobBalance.tokens.get(createRewardToken2).toString();
        //     expect(balanceAliceReward1).equals('1500000000');
        //     expect(balanceAliceReward2).equals('1500000000');
        //     expect(balanceBobReward1).equals('500000000');
        //     expect(balanceBobReward2).equals('500000000');
        // })
        // it('two persons, P1 staked, 2 rewards, P1 withdraw, P2 staked, 2 rewards, claim', async function(){
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const aliceBalanceAfterWithdraw = await tokenBalance(aliceAccountId, client);
        //     const balanceAliceAfterwithdrawReward1 = aliceBalanceAfterWithdraw.tokens.get(createRewardToken1).toString();
        //     const balanceAliceAfterwithdrawReward2 = aliceBalanceAfterWithdraw.tokens.get(createRewardToken2).toString();
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward2 = aliceBalance.tokens.get(createRewardToken2).toString();
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward2 = bobBalance.tokens.get(createRewardToken2).toString();
        //     expect(balanceAliceAfterwithdrawReward1).equals('1000000000');
        //     expect(balanceAliceAfterwithdrawReward2).equals('1000000000');
        //     expect(balanceAliceReward1).equals('1333333333');
        //     expect(balanceAliceReward2).equals('1333333333');
        //     expect(balanceBobReward1).equals('666666667');
        //     expect(balanceBobReward2).equals('666666667');
        // })
        // it('two persons, P1 staked, 1 rewards, P2 staked, 2 rewards, P1 withdraw, 2 rewards, all claim', async function(){
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await withdraw(contractId, 0, 5, client);
        //     const aliceBalanceAfterWithdraw = await tokenBalance(aliceAccountId, client);
        //     const balanceAliceAfterwithdrawReward1 = aliceBalanceAfterWithdraw.tokens.get(createRewardToken1).toString();
        //     const balanceAliceAfterwithdrawReward2 = aliceBalanceAfterWithdraw.tokens.get(createRewardToken2).toString();
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     await addToken(contractId, createRewardToken2, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceAliceReward2 = aliceBalance.tokens.get(createRewardToken2).toString();
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward2 = bobBalance.tokens.get(createRewardToken2).toString();
        //     expect(balanceAliceAfterwithdrawReward1).equals('1500000000');
        //     expect(balanceAliceAfterwithdrawReward2).equals('500000000');
        //     expect(balanceAliceReward1).equals('1833333333');
        //     expect(balanceAliceReward2).equals('833333333');
        //     expect(balanceBobReward1).equals('1166666667');
        //     expect(balanceBobReward2).equals('1166666667');
        // })
        // it('two persons, 1 reward, alice stake again, add reward again, all claim', async function(){
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);//0
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId, stakingToken, 10, client);//0
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client); //Alice and Bob 5 rewards
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);// Alice should claim 5 + 2/3*10 and bob should claim 5 + 1/3*10
        //     client.setOperator(bobAccountId, bobKey);
        //     await claimAllReward(contractId, 0, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await claimAllReward(contractId, 0, client);
        //     const aliceBalance = await tokenBalance(aliceAccountId, client);
        //     const bobBalance = await tokenBalance(bobAccountId, client);
        //     const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
        //     const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
        //     expect(balanceAliceReward1).equals('1166666667');
        //     expect(balanceBobReward1).equals('833333333');
        // })
        it('Alice stake, 1 reward, bob stake, add reward, alice withdraw, bob stake again, add reward, all claim', async function(){
            client.setOperator(aliceAccountId, aliceKey);
            await addToken(contractId, stakingToken, 10, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addToken(contractId, createRewardToken1, 10, client);
            client.setOperator(bobAccountId, bobKey);
            await addToken(contractId, stakingToken, 10, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addToken(contractId, createRewardToken1, 10, client);
            client.setOperator(aliceAccountId, aliceKey);
            await withdraw(contractId, 0, 5, client);
            client.setOperator(bobAccountId, bobKey);
            await addToken(contractId, stakingToken, 10, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addToken(contractId, createRewardToken1, 10, client);
            client.setOperator(bobAccountId, bobKey); 
            await claimAllReward(contractId, 0, client);
            client.setOperator(aliceAccountId, aliceKey);
            await claimAllReward(contractId, 0, client);
            const aliceBalance = await tokenBalance(aliceAccountId, client);
            const bobBalance = await tokenBalance(bobAccountId, client);
            const balanceAliceReward1 = aliceBalance.tokens.get(createRewardToken1).toString();
            const balanceBobReward1 = bobBalance.tokens.get(createRewardToken1).toString();
            expect(balanceAliceReward1).equals('1700000000');
            expect(balanceBobReward1).equals('1300000000');
        })
    })
    // context('unlock', async function () {
    //     beforeEach(async () => {
    //         client = getClient();
    //         //contractId = await createSmartContract(client, fileId, 150000);
    //         contractId = ContractId.fromString('0.0.49052983');
    //         await initialize(contractId, stakingToken);
    //     });
        // it('1 person, 1 reward, unlock tokens without delay', async function(){
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await unlock(contractId, 0, 1, client);
        // })
        // it('1 person, 1 reward, unlock tokens with delay', async function(){
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await delay(35000);
        //     await unlock(contractId, 0, 1, client);
        //     const aliceBalanceAfterUnlock = await tokenBalance(aliceAccountId, client);
        //     const balanceAliceAfterUnlockStacking = aliceBalanceAfterUnlock.tokens.get(stakingToken).toString();
        //     const balanceAliceAfterUnlockReward1 = aliceBalanceAfterUnlock.tokens.get(createRewardToken1).toString();
        //     expect(balanceAliceAfterUnlockStacking).equals('100000000');
        //     expect(balanceAliceAfterUnlockReward1).equals('41000000000');
        // })
        // it('2 persons, first unlock, second unlock after delay', async function(){
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addToken(contractId, stakingToken, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addToken(contractId, createRewardToken1, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await unlock(contractId, 0, 1, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await delay(650000);
        //     await unlock(contractId, 0, 1, client);
        //     // const aliceBalanceAfterUnlock = await tokenBalance(aliceAccountId, client);
        //     // const balanceAliceAfterUnlockStacking = aliceBalanceAfterUnlock.tokens.get(stakingToken).toString();
        //     // const balanceAliceAfterUnlockReward1 = aliceBalanceAfterUnlock.tokens.get(createRewardToken1).toString();
        //     client.setOperator(bobAccountId, bobKey);
        //     const bobBalanceAfterUnlock = await tokenBalance(bobAccountId, client);
        //     const balanceBobAfterUnlockStacking = bobBalanceAfterUnlock.tokens.get(stakingToken).toString();
        //     const balanceBobAfterUnlockReward1 = bobBalanceAfterUnlock.tokens.get(createRewardToken1).toString();
        //     // expect(balanceAliceAfterUnlockStacking).equals('100000000');
        //     // expect(balanceAliceAfterUnlockReward1).equals('41000000000');
        //     expect(balanceBobAfterUnlockStacking).equals('410000000000');
        //     expect(balanceBobAfterUnlockReward1).equals('1000000000');
        // })
    // })
})

