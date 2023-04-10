/*
      This script is used for Creation Of Five New Account

 */

// Import Dependencies
const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountBalanceQuery,
    Hbar
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require("dotenv").config({ path: '../.env' });

// This Function Created Five New Account
async function createAccounts() {

    // Fetch the Test_Account_Id and Test_Private_Key from environment file
    const myAccountId = process.env.OPERATOR_ACCOUNT_ID;
    const myPrivateKey = process.env.OPERATOR_PRIVATE_KEY;

    // condition to check if AccountID and PrivateKey is present or not
    if (myAccountId == null || myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Creating connection to the Hedera network
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    // Created a Array For storing Five Account Id
    const AccountList = [];

    //By Using  Loop ,Five Account has been created
    for (i = 0; i < 5; i++) {

        //Creating new keys with the help of Private Key
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        //Create a new account with 500 Hbar starting balance
        const newAccount = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(new Hbar(500))
            .execute(client);

        // Get the new account ID
        const getReceipt = await newAccount.getReceipt(client);
        const newAccountId = getReceipt.accountId;

        // Printing The New_Account_Id And Private_Key And Public_Key
        console.log(`The  account ID of ${i + 1} is:   ${newAccountId}`);
        console.log(`The Public key of new account ${i + 1} is:  ${newAccountPublicKey}`);
        console.log(`The Private key of new account ${i + 1} is:  ${newAccountPrivateKey}`);

        // Storing New_Account_Id's Into an Array
        AccountList.push(newAccountId);
    }

    // Check the Balance of Five New Account
    for (const newAccountId of AccountList) {
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        console.log("Account " + newAccountId + " balance: " + accountBalance.hbars + "Hbar");

    }
    client.close();
}

// Calling  createAccounts Function
createAccounts();