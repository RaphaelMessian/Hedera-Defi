const { expect } = require("chai");

const { 
    initialize,
    addStakeAccount,
    addReward,
    claimSpecificReward,
    claimAllReward
} = require('../scripts/scRewards.js');

const {
    createAccount,
    createFungibleToken,
    getClient,
    createSmartContract
} = require('../scripts/utils.js');


const { 
    Client,
    AccountId, 
    PrivateKey,
    FileId
} = require("@hashgraph/sdk");

const fileId = FileId.fromString("0.0.48899909");
const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);
let client = getClient();

describe('All Tests', async function () {
    const aliceKey = PrivateKey.generateED25519();
    const aliceAccountId = await createAccount(client, aliceKey, 50);
    const BobKey = PrivateKey.generateED25519();
    const BobAccountId = await createAccount(client, BobKey, 50);
    const createStackingToken = await createFungibleToken("Stacking Token", "ST", aliceAccountId, aliceKey.publicKey, client, aliceKey);
    const createRewardToken1 = await createFungibleToken("Reward Token 1", "RT1", operatorAccountId, operatorPuKey, client, operatorPrKey);
    const createRewardToken2 = await createFungibleToken("Reward Token 2", "RT2", operatorAccountId, operatorPuKey, client, operatorPrKey);
    
    context('rewards and claim', async function () {
        afterEach(async () => {
            const contractId = await createSmartContract(client, fileId, 150000);
            await initialize(contractId, createStackingToken);
        });
        it('no tokens, all claim', async function () {
            const claim = await claimAllReward(contractId, client);
            expect(claim).equals(0);
        });
        it('one person, one type of reward, claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const claim = await claimAllReward(contractId, client);
            expect(claim).equals(10);
        });
        it('one person, two type of reward, claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const claim = await claimAllReward(contractId, client);
            expect(claim).equals(20);
        });
        it('two people, one type of reward, all claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(BobAccountId, BobKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const claimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const claimBob = await claimAllReward(contractId, client);
            expect(claimAlice).equals(5);
            expect(claimBob).equals(5);
        });
        it('two people, two type of reward, all claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(BobAccountId, BobKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const claimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const claimBob = await claimAllReward(contractId, client);
            expect(claimAlice).equals(10);
            expect(claimBob).equals(10);
        });
        it('two people, two type of reward, one claim all, other claim specific token', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(BobAccountId, BobKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(BobAccountId, BobKey);
            const claimBob = await claimSpecificReward(contractId, createRewardToken1, client);
            client.setOperator(aliceAccountId, aliceKey);
            const claimAlice = await claimAllReward(contractId, client);
            expect(claimAlice).equals(10);
            expect(claimBob).equals(5);
        });
        it('two people, two type of reward, one claim specific, other claim all', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(BobAccountId, BobKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const claimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const claimBob = await claimSpecificReward(contractId, createRewardToken1, client);
            expect(claimAlice).equals(10);
            expect(claimBob).equals(5);
        });
    })
    describe('add reward after claims', async function () {
        afterEach(async () => {
            contractId = await main();
            await initialize(contractId, createStackingToken);
        });
        it('one persons, one rewards, claim, add rewards, claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const firstClaim = await claimAllReward(contractId, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const secondClaim = await claimAllReward(contractId, client);
            expect(firstClaim).equals(5);
            expect(secondClaim).equals(5);
        });
        it('two peoples, two rewards, all claim, add one type of reward, all claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(BobAccountId, BobKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const firstClaimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const firstClaimBob = await claimAllReward(contractId, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const secondClaimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const secondClaimBob = await claimAllReward(contractId, client);
            expect(firstClaimAlice).equals(10);
            expect(firstClaimBob).equals(10);
            expect(secondClaimAlice).equals(5);
            expect(secondClaimBob).equals(5);
        });
        it('two people, two rewards, all claim, add two types of reward, all claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(BobAccountId, BobKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const firstClaimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const firstClaimBob = await claimAllReward(contractId, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const secondClaimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const secondClaimBob = await claimAllReward(contractId, client);
            expect(firstClaimAlice).equals(10);
            expect(firstClaimBob).equals(10);
            expect(secondClaimAlice).equals(10);
            expect(secondClaimBob).equals(10);
        });
        it('two people, one reward, all claim, add another type of reward + already existing reward, all claim', async function () {
            client.setOperator(aliceAccountId, aliceKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(BobAccountId, BobKey);
            await addStakeAccount(contractId, 10);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const firstClaimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const firstClaimBob = await claimAllReward(contractId, client);
            client.setOperator(operatorAccountId, operatorPrKey);
            await addReward(contractId, createRewardToken1, 10);
            await addReward(contractId, createRewardToken2, 10);
            client.setOperator(aliceAccountId, aliceKey);
            const secondClaimAlice = await claimAllReward(contractId, client);
            client.setOperator(BobAccountId, BobKey);
            const secondClaimBob = await claimAllReward(contractId, client);
            expect(firstClaimAlice).equals(5);
            expect(firstClaimBob).equals(5);
            expect(secondClaimAlice).equals(10);
            expect(secondClaimBob).equals(10);
        });
    });
})

