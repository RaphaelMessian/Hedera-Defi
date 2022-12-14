console.clear();
const  {createAccount, deployContract, createFungibleToken, mintToken, TokenBalance} = require("./utils");
const {Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, TokenId, ContractId } = require("@hashgraph/sdk");
const dotenv = require("dotenv");
const fs = require('fs');
dotenv.config({ path: '../.env' });

async function main() {
    await DexToken();
 }

async function DexToken() {
    let client = Client.forTestnet();
    const operatorPrKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
    const operatorPuKey = operatorPrKey.publicKey;
    const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ID);

    //const lpTokenContractId = ContractId.fromString("0.0.48194509");

    client.setOperator(
        operatorAccountId,
        operatorPrKey
    );

    // const rawdataHTS = fs.readFileSync("../build/contracts/BaseHTS.json");
    // //console.log(`Raw data ${rawdata}`);
    // const rawdataHTSJSon = JSON.parse(rawdataHTS);
    // const HTSContractByteCode = rawdataHTSJSon.bytecode;
    // const createHTSContract = await deployContract(client, HTSContractByteCode);
    // console.log(`- Contract created ${createHTSContract.toString()} ,Contract Address ${createHTSContract.toSolidityAddress()} -`);
    const htsServiceAddress = "0000000000000000000000000000000002df878a";
    //console.log(`\nSTEP 1 - Create 3 different account that will represent the Liquid`);


    console.log(`\nSTEP 1 - Create and deploy LP Token Contract`);
    const rawdataLPToken = fs.readFileSync("../build/contracts/LPToken.json");
    //console.log(`Raw data ${rawdata}`);
    const rawdataLPTokenJSon = JSON.parse(rawdataLPToken);
    const LPTokenContractByteCode = rawdataLPTokenJSon.bytecode;
    const createLPTokenContract = await deployContract(client, LPTokenContractByteCode);
    console.log(`- Contract created ${createLPTokenContract.toString()} ,Contract Address ${createLPTokenContract.toSolidityAddress()} -`);

    console.log(`\nSTEP 2 - Create AB token that represents the fees`);
    const createTokenAB = await createFungibleToken("Token AB", "TAB", operatorAccountId, operatorPuKey, client);
    console.log(`- Token AB created ${createTokenAB}, Token AB Address ${createTokenAB.toSolidityAddress()}`);

    // const createTokenAB = TokenId.fromString("0.0.48203661");

    let contractFunctionParameters = new ContractFunctionParameters()
          .addAddress(createTokenAB.toSolidityAddress())
          .addAddress(htsServiceAddress);

    const contractTokenTx = await new ContractExecuteTransaction()
        .setContractId("0.0.48203660" ?? "")
        .setFunction("initializeParams", contractFunctionParameters)
        .setGas(500000)
        .execute(client);
    const contractTokenRx = await contractTokenTx.getReceipt(client);
    console.log(`- InitializeParamas ${contractTokenRx.status}`); 

    console.log(`\nSTEP 3 - Create and deploy SWAP Contract`);
    const rawdataSwap = fs.readFileSync("../build/contracts/Swap.json");
    //console.log(`Raw data ${rawdata}`);
    const rawdataSwapJson = JSON.parse(rawdataSwap);
    const swapContractByteCode = rawdataSwapJson.bytecode;
    const createSwapContract = await deployContract(client, swapContractByteCode);
    console.log(`- Swap Contract created ${createSwapContract.toString()} , Swap Contract Address ${createSwapContract.toSolidityAddress()} -`);

    const createTokenA = await createFungibleToken("Token A", "A", operatorAccountId, operatorPuKey, client);
    console.log(`- Token A created ${createTokenA}, Token A Address ${createTokenA.toSolidityAddress()}`);
    const createTokenB = await createFungibleToken("Token B", "B", operatorAccountId, operatorPuKey, client);
    console.log(`- Token B created ${createTokenB}, Token B Address ${createTokenB.toSolidityAddress()}`);
    const mintTokenA = await mintToken(createTokenA, client, 10);
    console.log(`- New 10 tokens A minted transaction status: ${mintTokenA.status.toString()}`);
    const mintTokenB = await mintToken(createTokenB, client, 10);
    console.log(`- New 10 tokens B minted transaction status: ${mintTokenB.status.toString()}`);

    // const createTokenA =  TokenId.fromString("0.0.48203664");
    // console.log("createTokenA",createTokenA)
    // const createTokenB = TokenId.fromString("0.0.48203665");
    // console.log("createTokenB",createTokenB)
    const queryTokenBalance = await TokenBalance(operatorAccountId, client);
    console.log(`\nToken Balance`);
    console.log(`- Token Balance A: ${queryTokenBalance.tokens._map.get(createTokenA.toString())}`)
    console.log(`- Token Balance B : ${queryTokenBalance.tokens._map.get(createTokenB.toString())}`);

    // const createSwapContract = ContractId.fromString("0.0.48194535")
    console.log("operatorAccountId.toSolidityAddress()",operatorAccountId.toSolidityAddress())
    console.log("createTokenA",createTokenA.toSolidityAddress())
    console.log("createTokenB",createTokenB.toSolidityAddress())

    // let contractFunctionParametersSwap = new ContractFunctionParameters()
    //         .addAddress(operatorAccountId.toSolidityAddress())
    //         .addAddress(createTokenA.toSolidityAddress())
    //         .addAddress(createTokenB.toSolidityAddress())
    //         .addInt64(10)
    //         .addInt64(10)
    // const solidityAccount = operatorAccountId.toSolidityAddress();
    // const acctest = AccountId.fromString("0.0.48196130");
    // const pritest = PrivateKey.fromString("3030020100300706052b8104000a042204203caacfb3bcee2dbd9ec121f411ed25a7f597f640667519f0358779a4620249c3");
    const liquidityPool = await new ContractExecuteTransaction()
        .setContractId(createSwapContract)
        .setGas(9000000)
        .setFunction("initializeContract", 
        new ContractFunctionParameters()
            .addAddress(operatorAccountId.toSolidityAddress())
            .addAddress(createTokenA.toSolidityAddress())
            .addAddress(createTokenB.toSolidityAddress())
            .addInt64(10)
            .addInt64(10))
            .freezeWith(client)
            .sign(operatorPrKey);
            //.execute(client)
    const liquidityPoolTx = await liquidityPool.execute(client);
    const transferTokenRx = await liquidityPoolTx.getReceipt(client);
    console.log(`Liquidity pool created: ${transferTokenRx.status}`);
    //await pairCurrentPosition();

    // console.log(`\nSTEP 3 - Mint 3 different token from each token created`);
    // const mintTokenAB = await mintToken(createTokenAB, client, 10);
    // console.log(`- New 10 tokens AB minted transaction status: ${mintTokenAB.status.toString()}`);
    // const mintTokenBC = await mintToken(createTokenBC, client, 10);
    // console.log(`- New 10 tokens BC minted transaction status: ${mintTokenBC.status.toString()}`);
    // const mintTokenAC = await mintToken(createTokenAC, client, 10);
    // console.log(`- New 10 tokens AC minted transaction status: ${mintTokenAC.status.toString()}`);

    // const queryTokenBalance = await TokenBalance(operatorAccountId, client);
    // console.log(`\nToken Balance`);
    // console.log(`- Token Balance AB: ${queryTokenBalance.tokens._map.get(createTokenAB.toString())}`)
    // console.log(`- Token Balance AC : ${queryTokenBalance.tokens._map.get(createTokenBC.toString())}`);
    // console.log(`- Token Balance BC: ${queryTokenBalance.tokens._map.get(createTokenAC.toString())}`);

    // console.log(`\nSTEP 4 - Swap AB, AC, BC token to Dex Token`);
    
    
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });