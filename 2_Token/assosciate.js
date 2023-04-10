/* 

   * This Script is used to transfer Hbar From FIRST_ACCOUNT TO THIRD_ACCOUNT AND FOURTH_ACCOUNT

*/

// Import Dependencies
const {
    TransferTransaction,
    Client,
    TokenAssociateTransaction,
    Wallet,
    PrivateKey
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require('dotenv').config({ path: '../.env' });

// Fetch The Account_Id's And Private_Key's From Environmental File
const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

const thirdAccountId = process.env.THIRD_ACCOUNT_ID;
const thirdPrivateKey = PrivateKey.fromString(process.env.THIRD_PRIVATE_KEY);

const fourthAccountId = process.env.FOURTH_ACCOUNT_ID;
const fourthPrivateKey = PrivateKey.fromString(process.env.FOURTH_PRIVATE_KEY);

// Fetch The Token_Id From Environmetal File
const tokenId = process.env.TOKEN_ID;

// Check All  ID's And KEY's are available or Not
if (firstAccountId == null ||
    firstPrivateKey == null ||
    thirdAccountId == null ||
    thirdPrivateKey == null ||
    fourthAccountId == null ||
    fourthPrivateKey == null ||
    tokenId == null) {
    throw new Error(" Environment variables ID's and KEY's must be present");
}

// Create our connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(firstAccountId, firstPrivateKey);

// Created a Wallet For THIRD_ACCOUNT
const wallet1 = new Wallet(
    thirdAccountId,
    thirdPrivateKey
);

// Created a Wallet For Fourth_Account
const wallet2 = new Wallet(
    fourthAccountId,
    fourthPrivateKey
);

async function main() {

    /* 
       Before an account that is not the treasury for a token can receive or send this specific token ID 
       But ,Firstly the account must become “associated” with the token.
    */
    let thirdAssociateOtherWalletTx = await new TokenAssociateTransaction()
        .setAccountId(wallet1.accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(thirdPrivateKey);

    let fourthAssociateOtherWalletTx = await new TokenAssociateTransaction()
        .setAccountId(wallet2.accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(fourthPrivateKey);
        
    //SUBMIT THE TRANSACTION
    let thirdAssociateOtherWalletTxSubmit = await thirdAssociateOtherWalletTx.execute(client);
    let fourthAssociateOtherWalletTxSubmit = await fourthAssociateOtherWalletTx .execute(client);
    

    //GET THE RECEIPT OF THE TRANSACTION
    let thirdAssociateOtherWalletRx = await thirdAssociateOtherWalletTxSubmit.getReceipt(client);
    let fourthAssociateOtherWalletRx = await fourthAssociateOtherWalletTxSubmit.getReceipt(client);
    

    //LOG THE TRANSACTION STATUS
    console.log(`- Token association with the users account3: ${thirdAssociateOtherWalletRx.status} \n`);
    console.log(`- Token association with the users account4: ${fourthAssociateOtherWalletRx.status} \n`);
    
    //Create the transfer transaction for Third_Account
    const thirdAccountTransaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, client.operatorAccountId, -2525)
        .addTokenTransfer(tokenId, wallet1.accountId, 2525)
        .freezeWith(client);

    //Create the transfer transaction for Fourth_Account
    const fourthAccountTransaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, client.operatorAccountId, -2525)
        .addTokenTransfer(tokenId, wallet2.accountId, 2525)
        .freezeWith(client);

    //Sign with the sender account private key
    const thirdAccountSignTx = await thirdAccountTransaction.sign(firstPrivateKey);
    const fourthAccountSgnTx = await fourthAccountTransaction.sign(firstPrivateKey);
 
    //Sign with the client operator private key and submit to a Hedera network
    const thirdTxResponse = await thirdAccountSignTx.execute(client);
    const fourthTxResponse = await fourthAccountSgnTx.execute(client);
    
    //Request the receipt of the transaction
    const thirdTxReceipt = await thirdTxResponse.getReceipt(client);
    const fourthTxReceipt = await fourthTxResponse.getReceipt(client);
    
    //Obtain the transaction consensus status
    const thirdTransactionStatus = thirdTxReceipt.status;
    const fouthTransactionStatus = fourthTxReceipt.status;
    
    console.log("The transaction consensus status for Third Account " + thirdTransactionStatus.toString());
    console.log("The transaction consensus status for Fourth Account " + fouthTransactionStatus.toString());
    

    process.exit();
}

main();

