console.clear();
const  {getClient, createAccount, deployContract, createFungibleToken, mintToken, TokenBalance, TokenTransfer} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, TokenAssociateTransaction, ContractId, TokenId} = require("@hashgraph/sdk");
require('dotenv').config({path: __dirname + '../.env'});
const Web3 = require('web3');
const fs = require('fs');

const web3 = new Web3;

const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const operatorPuKey = operatorPrKey.publicKey;
const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);
const testEventContract = ContractId.fromString('0.0.49260465');

const rawdataTest = fs.readFileSync(`${__dirname}/../artifacts/contracts/common/IERC20.sol/IERC20.json`);
const rawdataTestJSon = JSON.parse(rawdataTest);
const abi = rawdataTestJSon.abi

let client = getClient();

async function main() {
    console.clear();
    // const aliceKey = PrivateKey.generateED25519();
    // const aliceAccountId = await createAccount(client, aliceKey, 40);
    // console.log(`- Alice account id created: ${aliceAccountId.toString()}`);
    // console.log(`- Alice account id created: ${aliceKey.toString()}`);
    //const testToken = await createFungibleToken("Stacking Token", "ST", aliceAccountId, aliceKey.publicKey, client, aliceKey);
    //const testToken = await createFungibleToken("Test Event Token", "TVT", operatorAccountId, operatorPuKey, client, operatorPrKey);
    const testToken = TokenId.fromString("0.0.49260448");
    //client.setOperator(AccountId.fromString("0.0.49253649"), PrivateKey.fromString("302e020100300506032b657004220420081b764b94f974102647ecd3575e077054414c9cf4b4ac35deb0c07b613e47d1"));
    //await initialize(testEventContract, testToken);
    //client.setOperator(aliceAccountId, aliceKey);
    client.setOperator(AccountId.fromString("0.0.49260447"), PrivateKey.fromString("302e020100300506032b6570042204200eba43bbe7dac6773d19ddbf4d7454c6cfdfcad97781f3f36ccacfe1b0d75618"));
    //await transferFromSafeHTS(testEventContract, 1);
    //client.setOperator(AccountId.fromString("0.0.49253649"), PrivateKey.fromString("302e020100300506032b657004220420081b764b94f974102647ecd3575e077054414c9cf4b4ac35deb0c07b613e47d1"));
    await transferFromERC(testEventContract, 1, client);
    //await allowanceFromSafeHTS(testEventContract, 1, client);
    //await allowanceFromERC20(testEventContract, 1, client);
    //await approveFromSafeHTS(testEventContract, 1, client);
    //await approveFromERC(testEventContract, 1, client);
 }

 async function initialize(testEventContract, testToken) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addAddress(testToken.toSolidityAddress());

    const initializeTx = await new ContractExecuteTransaction()
        .setContractId(testEventContract)
        .setFunction("initialize", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const initializeReceipt = await initializeTx.getReceipt(client);
    console.log(`- initialize transaction ${initializeReceipt.status.toString()}.`);
 }

 async function transferFromSafeHTS(testEventContract, amount) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(amount);

    const transferFromSafeHTSTx = await new ContractExecuteTransaction()
        .setContractId(testEventContract)
        .setFunction("transferFromSafeHTS", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const transferFromSafeHTSReceipt = await transferFromSafeHTSTx.getReceipt(client);
    const transferFromSafeHTSRecord = await transferFromSafeHTSTx.getRecord(client);
    console.log(`- transferFromSafeHTSRecord.contractFunctionResult.logs ${transferFromSafeHTSRecord.contractFunctionResult.logs}.`);
    transferFromSafeHTSRecord.contractFunctionResult.logs.forEach((log) => {
		// convert the log.data (uint8Array) to a string
		let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));
        console.log(`- logStringHex ${logStringHex}.`);

		// get topics from log
		let logTopics = [];
		log.topics.forEach((topic) => {
			logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
		});
        const results = decodeEvent('Transfer', logStringHex, logTopics.slice(1));
        console.log(`- Event from ${results.from}, Event to ${results.to}, Event value ${results.value}`);
    });
    console.log(`- transferFromERC transaction ${transferFromSafeHTSReceipt.status.toString()}.`);
 }

 async function transferFromERC(testEventContract, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(amount);

    const transferFromERCTx = await new ContractExecuteTransaction()
        .setContractId(testEventContract)
        .setFunction("transferFromERC", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const transferFromERCReceipt = await transferFromERCTx.getReceipt(client);
    const transferFromERCRecord = await transferFromERCTx.getRecord(client);
    console.log(`- transferFromSafeHTSRecord.contractFunctionResult.logs ${transferFromERCRecord.contractFunctionResult.logs}.`);
    transferFromERCRecord.contractFunctionResult.logs.forEach((log) => {
		// convert the log.data (uint8Array) to a string
		let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

		// get topics from log
		let logTopics = [];
		log.topics.forEach((topic) => {
			logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
		});
        const results = decodeEvent('Transfer', logStringHex, logTopics.slice(1));
        console.log(`- Event from ${results.from}, Event to ${results.to}, Event value ${results.value}`);
    });
    console.log(`- transferFromERC transaction ${transferFromERCReceipt.status.toString()}.`);
 }

 async function approveFromSafeHTS(testEventContract, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(amount);

    const approveFromSafeHTSTx = await new ContractExecuteTransaction()
        .setContractId(testEventContract)
        .setFunction("approveFromSafeHTS", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const approveFromSafeHTSReceipt = await approveFromSafeHTSTx.getReceipt(client);
    const approveFromSafeHTSTxRecord = await approveFromSafeHTSTx.getRecord(client);
    approveFromSafeHTSTxRecord.contractFunctionResult.logs.forEach((log) => {
		// convert the log.data (uint8Array) to a string
		let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

		// get topics from log
		let logTopics = [];
		log.topics.forEach((topic) => {
			logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
		});
    const results = decodeEvent('Approval', logStringHex, logTopics.slice(1));
    console.log(`- Event from ${results.owner}, Event to ${results.spender}, Event value ${results.value}`);
    });
    console.log(`- approveFromSafeHTS transaction ${approveFromSafeHTSReceipt.status.toString()}.`);
 }

 async function approveFromERC(testEventContract, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(amount);

    const approveFromERCTx = await new ContractExecuteTransaction()
        .setContractId(testEventContract)
        .setFunction("approveFromERC", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const approveFromERCReceipt = await approveFromERCTx.getReceipt(client);
    const approveFromERCRecord = await approveFromERCTx.getRecord(client);
    approveFromERCRecord.contractFunctionResult.logs.forEach((log) => {
		// convert the log.data (uint8Array) to a string
		let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

		// get topics from log
		let logTopics = [];
		log.topics.forEach((topic) => {
			logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
		});
    const results = decodeEvent('Approval', logStringHex, logTopics.slice(1));
    console.log(`- Event from ${results.owner}, Event to ${results.spender}, Event value ${results.value}`);
    });
    console.log(`- approveFromERC transaction ${approveFromERCReceipt.status.toString()}.`);
 }

 async function allowanceFromSafeHTS(testEventContract, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(amount);

    const allowanceFromSafeHTSTx = await new ContractExecuteTransaction()
        .setContractId(testEventContract)
        .setFunction("allowanceFromSafeHTS", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const allowanceFromSafeHTSReceipt = await allowanceFromSafeHTSTx.getReceipt(client);
    const allowanceFromSafeHTSRecord = await allowanceFromSafeHTSTx.getRecord(client);
    allowanceFromSafeHTSRecord.contractFunctionResult.logs.forEach((log) => {
		// convert the log.data (uint8Array) to a string
		let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

		// get topics from log
		let logTopics = [];
		log.topics.forEach((topic) => {
			logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
		});
    const results = decodeEvent('Approval', logStringHex, logTopics.slice(1));
    console.log(`- Event from ${results.owner}, Event to ${results.spender}, Event value ${results.value}`);
    });
    console.log(`- allowanceFromSafeHTS transaction ${allowanceFromSafeHTSReceipt.status.toString()}.`);

 }

 async function allowanceFromERC20(testEventContract, amount, client) {
    let contractFunctionParameters = new ContractFunctionParameters()
        .addUint256(amount);

    const allowanceFromERC20Tx = await new ContractExecuteTransaction()
        .setContractId(testEventContract)
        .setFunction("allowanceFromERC20", contractFunctionParameters)
        .setGas(1500000)
        .execute(client);
    
    const allowanceFromERC20Receipt = await allowanceFromERC20Tx.getReceipt(client);
    const allowanceFromERC20Record = await allowanceFromERC20Tx.getRecord(client);
    allowanceFromERC20Record.contractFunctionResult.logs.forEach((log) => {
		// convert the log.data (uint8Array) to a string
		let logStringHex = "0x".concat(Buffer.from(log.data).toString("hex"));

		// get topics from log
		let logTopics = [];
		log.topics.forEach((topic) => {
			logTopics.push("0x".concat(Buffer.from(topic).toString("hex")));
		});
    const results = decodeEvent('Approval', logStringHex, logTopics.slice(1));
    console.log(`- Event from ${results.owner}, Event to ${results.spender}, Event value ${results.value}`);
    });
    console.log(`- allowanceFromERC20 transaction logs ${allowanceFromERC20Receipt.contractFunctionResult}.`);
 }

 function decodeFunctionResult(functionName, resultAsBytes) {
    const functionAbi = abi.find(func => func.name === functionName);
    const functionParameters = functionAbi.outputs;
    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));
    const result = web3.eth.abi.decodeParameters(functionParameters, resultHex);
    return result;
}

function decodeEvent(eventName, log, topics) {
    const eventAbi = abi.find(event => (event.name === eventName && event.type === "event"));
    console.log("eventAbi", eventAbi);
    const decodedLog = web3.eth.abi.decodeLog(eventAbi.inputs, log, topics);
    return decodedLog;
}

main();

