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
            await initialize(contractId, stakingToken);
        });
    })
})

