const { expect } = require("chai");
const chai = require('chai');
const BN = require('bn.js');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

const { 
    initialize,
    claimAllReward,
    claimSpecificsReward,
    addToken,
    withdraw,
    unlock
} = require('../scripts/scRewards.js');

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
    context('rewards and claim', async function () {
        // beforeEach(async () => {
        //     client = getClient();
        //     //contractId = await createSmartContract(client, fileId, 150000);
        //     contractId = ContractId.fromString('0.0.48955310');
        //     await initialize(contractId, stakingToken);
        // });
                // it('no tokens, all claim', async function () {
        //     const claim = await claimAllReward(contractId, client);
        //     expect(claim).to.be.equals('0');
        // });
        // it('one person, one type of reward, claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claim = await claimAllReward(contractId, client);
        //     expect(claim).equals('1000000000');
        // });
        // it('one person, two type of reward, claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claim = await claimAllReward(contractId, client);
        //     expect(claim).equals('1000000000');
        // });
        // it('two people, one type of reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimAllReward(contractId, client);
        //     expect(claimAlice).equals('500000000');
        //     expect(claimBob).equals('500000000');
        // });
        // it('two people, two type of reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimAllReward(contractId, client);
        //     expect(claimAlice).equals('500000000');
        //     expect(claimBob).equals('50000000');
        // });
        // it('two people, two type of reward, one claim all, other claim specific token', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimSpecificReward(contractId, createRewardToken1, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     expect(claimAlice).equals('1000000000');
        //     expect(claimBob).equals('50000000');
        // });
        // it('two people, two type of reward, one claim specific, other claim all', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimSpecificReward(contractId, createRewardToken1, client);
        //     expect(claimAlice).equals('1000000000');
        //     expect(claimBob).equals('50000000');
        // });
        // it('one persons, one rewards, claim, add rewards, claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const firstClaim = await claimAllReward(contractId, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const secondClaim = await claimAllReward(contractId, client);
        //     expect(firstClaim).equals('1000000000');
        //     expect(secondClaim).equals('50000000');
        // });
        // it('two peoples, two rewards, all claim, add one type of reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const firstClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const firstClaimBob = await claimAllReward(contractId, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const secondClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const secondClaimBob = await claimAllReward(contractId, client);
        //     expect(firstClaim).equals('1000000000');
        //     expect(secondClaim).equals('50000000');
        //     expect(secondClaimAlice).equals('1000000000');
        //     expect(secondClaimBob).equals('50000000');
        // });
        // it('two people, two rewards, all claim, add two types of reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const firstClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const firstClaimBob = await claimAllReward(contractId, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const secondClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const secondClaimBob = await claimAllReward(contractId, client);
        //     expect(firstClaim).equals('1000000000');
        //     expect(secondClaim).equals('1000000000');
        //     expect(secondClaimAlice).equals('1000000000');
        //     expect(secondClaimBob).equals('1000000000');
        // });
        // it('two people, one reward, all claim, add another type of reward + already existing reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const firstClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const firstClaimBob = await claimAllReward(contractId, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const secondClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const secondClaimBob = await claimAllReward(contractId, client);
        //     expect(firstClaim).equals('50000000');
        //     expect(secondClaim).equals('50000000');
        //     expect(secondClaimAlice).equals('1000000000');
        //     expect(secondClaimBob).equals('1000000000');
        // });
        // it('two people, one reward, add stake, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimAllReward(contractId, client);
        //     expect(claimAlice).equals('50000000');
        //     expect(claimBob).equals('50000000');
        // });
        // it('two people, one reward, all claim, add stake, add reward, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimAllReward(contractId, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const secondClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const secondClaimBob = await claimAllReward(contractId, client);
        //     expect(claimAlice).equals('50000000');
        //     expect(claimBob).equals('50000000');
        //     expect(secondClaimAlice).equals('1000000000');
        //     expect(secondClaimBob).equals('1000000000');
        // });
        // it('two people, two rewards, all claim, add stake, add two rewards, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimAllReward(contractId, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const secondClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const secondClaimBob = await claimAllReward(contractId, client);
        //     expect(claimAlice).equals('50000000');
        //     expect(claimBob).equals('50000000');
        //     expect(secondClaimAlice).equals('1000000000');
        //     expect(secondClaimBob).equals('1000000000');
        // })
        // it('two people, two rewards, all claim, add stake, add two rewards, all claim', async function () {
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const claimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const claimBob = await claimAllReward(contractId, client);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     await addStakeAccount(contractId, 10, client);
        //     client.setOperator(operatorAccountId, operatorPrKey);
        //     await addReward(contractId, createRewardToken1, 10);
        //     await addReward(contractId, createRewardToken2, 10);
        //     client.setOperator(aliceAccountId, aliceKey);
        //     const secondClaimAlice = await claimAllReward(contractId, client);
        //     client.setOperator(bobAccountId, bobKey);
        //     const secondClaimBob = await claimAllReward(contractId, client);
        //     expect(claimAlice).equals('50000000');
        //     expect(claimBob).equals('50000000');
        //     expect(claimAlice).equals('50000000');
        //     expect(claimBob).equals('50000000');
        // });
    });
    context('withdraw', async function () {
        beforeEach(async () => {
            client = getClient();
            //contractId = await createSmartContract(client, fileId, 150000);
            contractId = ContractId.fromString('0.0.49034383');
            await initialize(contractId, stakingToken);
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
        it('two persons, P1 staked, 1 rewards, P2 staked, 2 rewards, P1 withdraw, 2 rewards, all claim', async function(){
            client.setOperator(aliceAccountId, aliceKey);
            await addToken(contractId, stakingToken, 10, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addToken(contractId, createRewardToken1, 10, client);
            client.setOperator(aliceAccountId, aliceKey);
            await delay(30000);
            await unlock(contractId, 0, 10, client);
        })
    });
})

