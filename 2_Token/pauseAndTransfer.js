/* 

  * In this script Firstly,Pause the token and Then make another transfer of 1.35 to Account3. The transfer fails

*/

// Import Dependencies
const {
    TransferTransaction,
    Client,
    TokenPauseTransaction,
    Wallet,
    PrivateKey
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require('dotenv').config({ path: '../.env' });

//  Fetch All Id's And Key's From Environmental File
const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

const thirdAccountId = process.env.THIRD_ACCOUNT_ID;
const thirdPrivateKey = PrivateKey.fromString(process.env.THIRD_PRIVATE_KEY);

const tokenId = process.env.TOKEN_ID;
const pauseKey = PrivateKey.fromString(process.env.FOURTH_PRIVATE_KEY);


// Check All  ID's And KEY's are available or Not
if (firstAccountId == null ||
    firstPrivateKey == null ||
    thirdAccountId == null ||
    thirdPrivateKey == null ||
    tokenId == null ||
    pauseKey == null
) {
    throw new Error("Environment variables ID's and KEY's must be present");
}


// Create our connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(firstAccountId, firstPrivateKey);

// Created a Wallet
const thirdAccountWallet = new Wallet(
    thirdAccountId,
    thirdPrivateKey
);

// Created a Function for pause the Token
async function pauseToken() {

    const transaction = new TokenPauseTransaction()
        .setTokenId(tokenId).freezeWith(client);

    //Sign with the pause key 
    const signTx = await transaction.sign(pauseKey);

    //Submit the transaction to a Hedera network    
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;
    console.log(`The pause transaction consensus status :  ${transactionStatus.toString()}\n`);


}

// created a function to Transfer
async function transfer() {

    //Create the transfer transaction
    const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, client.operatorAccountId, -135)
        .addTokenTransfer(tokenId, thirdAccountWallet.accountId, 135)
        .freezeWith(client);

    //Sign with the sender account private key
    const signTx = await transaction.sign(firstPrivateKey);

    //Sign with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Obtain the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(`The transaction consensus status for Account3  ${transactionStatus.toString()}`);

}

async function main() {

    // call pauseToken func
    pauseToken();

    // This CallBack is used to Wait For 2sec and give a time to execute  above function
    await new Promise(r => setTimeout(r, 2000));

    //call transfer func
    transfer();


}
main();