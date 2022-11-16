require('dotenv').config({ path: '../.env' });

const { Client, AccountId, PrivateKey, AccountCreateTransaction, TokenCreateTransaction, ContractCreateFlow,
     TokenType, TokenSupplyType,TokenInfoQuery, AccountBalanceQuery, TokenMintTransaction, TransferTransaction,
     FileCreateTransaction, FileAppendTransaction, ContractCreateTransaction} = require("@hashgraph/sdk");

function getClient() {
    // const client = Client.forName(process.env.HEDERA_NETWORK);
    const client = Client.forTestnet();
    client.setOperator(
        AccountId.fromString(process.env.OPERATOR_ID),
        PrivateKey.fromString(process.env.OPERATOR_KEY)
    );
    return client;
}

async function createAccount(client, key, initialBalance) {
    const createAccountTx = await new AccountCreateTransaction()
        .setKey(key)
        .setInitialBalance(initialBalance)
        .execute(client);

    const createAccountRx = await createAccountTx.getReceipt(client);
    return createAccountRx.accountId;
}

async function deployContract(client, bytecode, gas, contractAdminKey, constructorParameters) {
    const createContract = new ContractCreateFlow()
        .setGas(gas) // Increase if revert
        .setBytecode(bytecode); // Contract bytecode
    if (constructorParameters) {
        createContract.setConstructorParameters(constructorParameters);
    }
    if (contractAdminKey) {
        createContract.setAdminKey(contractAdminKey);
        await createContract.sign(contractAdminKey);
    }
    const createContractTx = await createContract.execute(client);
    const createContractRx = await createContractTx.getReceipt(client);
    const contractId = createContractRx.contractId;

    return contractId;

}

async function storeContractFile(client, bytecode, treasuryKey) {
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([treasuryKey])
      .freezeWith(client);
    const fileCreateSign = await fileCreateTx.sign(treasuryKey);
    const fileSubmit = await fileCreateSign.execute(client);
    const fileCreateRx = await fileSubmit.getReceipt(client);
    const bytecodeFileId = fileCreateRx.fileId;
    console.log(`- The smart contract bytecode file ID is: ${bytecodeFileId}`);

    const fileAppendTx = new FileAppendTransaction()
        .setFileId(bytecodeFileId)
        .setContents(bytecode)
        .setMaxChunks(10)
        .freezeWith(client);
    const fileAppendSign = await fileAppendTx.sign(treasuryKey);
    const fileAppendSubmit = await fileAppendSign.execute(client);
    const fileAppendRx = await fileAppendSubmit.getReceipt(client);
    console.log(`- Content added: ${fileAppendRx.status} \n`);

    return bytecodeFileId;
}

async function createSmartContract(client, bytecodeFileId, gas) {
    const contractTx = new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(gas)

    const contractResponse = await contractTx.execute(client);
    const contractReceipt = await contractResponse.getReceipt(client);
    const newContractId = contractReceipt.contractId;
    console.log(`- The contract ID is: ${newContractId}`);
    return newContractId;
}

async function createFungibleToken(tokenName, tokenSymbol, treasuryAccountId, supplyPublicKey, client, privateKey) {
    // Create the transaction and freeze for manual signing
    const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setDecimals(8)
        .setInitialSupply(100*1e8)
        .setTreasuryAccountId(treasuryAccountId)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(supplyPublicKey)
        .freezeWith(client);
        
    
    const tokenCreateSign = await tokenCreateTx.sign(privateKey);
    const tokenCreateExec = await tokenCreateTx.execute(client);

    // Sign the transaction with the token adminKey and the token treasury account private key
    const tokenCreateRx = await tokenCreateExec.getReceipt(client);
    const tokenId = tokenCreateRx.tokenId

    return tokenId;
}    

async function mintToken(tokenId, client, amount, privatekey) {
    const tokenMintTx = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount*1e8)
        .freezeWith(client)
        .sign(privatekey);

    const tokenMintExec = await tokenMintTx.execute(client);
    const tokenMintRx = await tokenMintExec.getReceipt(client);

    return tokenMintRx;
}

async function tokenQuery(tokenId, client) {
    const info = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
    return info;
}

async function TokenBalance(accountId, client) {
    const AccountBalanceQueryTx = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);
    return AccountBalanceQueryTx;
}

async function TokenTransfer(tokenId, sender, receiver, amount, client) {

    const transferToken = await new TransferTransaction()
        .addTokenTransfer(tokenId, sender, -(amount*1e8))
        .addTokenTransfer(tokenId, receiver, amount*1e8)
        .freezeWith(client)
    
    const transferTokenSubmit = await transferToken.execute(client);
    const transferTokenRx = await transferTokenSubmit.getReceipt(client);

    return transferTokenRx;
}

module.exports = {
    createAccount,
    deployContract,
    createFungibleToken,
    mintToken,
    tokenQuery,
    TokenBalance,
    getClient,
    TokenTransfer,
    storeContractFile,
    createSmartContract
}
