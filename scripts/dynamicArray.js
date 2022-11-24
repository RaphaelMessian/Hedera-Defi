console.clear();
const { AccountId, PrivateKey} = require("@hashgraph/sdk");
require('dotenv').config({path: __dirname + '../.env'});
const { hethers } = require("@hashgraph/hethers");
const fs = require('fs');

const signerId = AccountId.fromString("0.0.48697651");
const signerKey = PrivateKey.fromString("4b52502ff5616890aff47091dde45e169968555f14c94bd6594182904852a04f");

async function dynamicArray() {

    const provider = hethers.providers.getDefaultProvider("testnet");

    const eoaAccount = {
      account: signerId,
      privateKey: `0x${signerKey.toStringRaw()}`
    };
    const wallet = new hethers.Wallet(eoaAccount, provider);

    const rawdataTest = fs.readFileSync(`${__dirname}/../artifacts/contracts/test.sol/Abc.json`);
    const rawdataTestJSon = JSON.parse(rawdataTest);
    const testByteCode = rawdataTestJSon.bytecode;
    const testAbi = rawdataTestJSon.abi
    // Create a ContractFactory object
    const factory = new hethers.ContractFactory(testAbi, testByteCode, wallet);

    // Deploy the contract
    const contract = await factory.deploy({ gasLimit: 300000 });

    // Wait until the transaction reaches consensus (i.e. contract is deployed)
    //  - returns the receipt
    //  - throws on failure (the reciept is on the error)
    const contractDeployWait = await contract.deployTransaction.wait();
    console.log(
    `\n- Contract deployment status: ${contractDeployWait.status.toString()}`
    );

    // Get the address of the deployed contract
    contractAddress = contract.address;
    console.log(`\n- Contract address: ${contractAddress}`);

    const add = await contract.add(signerId.toSolidityAddress(), signerId.toSolidityAddress(), { gasLimit: 300000 });
    console.log(`\n- add : ${add}`);

    // const add2 = await contract.add(signerId.toSolidityAddress(), { gasLimit: 300000 });
    // console.log(`\n- add : ${add2}`);

    const getSt = await contract.getSt({ gasLimit: 300000 });
    console.log(`\n- add : ${getSt}`);
};

dynamicArray();