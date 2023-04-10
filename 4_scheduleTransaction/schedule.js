/* 
   * Create a script that creates a scheduled transaction to transfer 10 Hbar from Account1 to Account2
   * Serialize and export the transaction to a base64 format and use this as the input to the next step. 
   
*/

// Import Dependencies
const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Hbar, 
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require('dotenv').config({ path: '../.env'});

// Fetch The Account_Id's And Private_Key's From Environmental File
const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);
const secondAccountId = process.env.SECOND_ACCOUNT_ID;
// const secondPrivateKey = PrivateKey.fromString(process.env.Account2_PVKEY);

// Condition To Check Account_Id and Private_key is present or not
if (firstAccountId == null ||
    firstPrivateKey == null ||
    secondAccountId == null ) {
    throw new Error("Environment variables AccountId's and PrivateKey's must be present");
}

// Create our connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(firstAccountId, firstPrivateKey);


async function main() {

    //Create a transaction to schedule
    const transaction = new TransferTransaction()
        .addHbarTransfer(firstAccountId, Hbar.from(-10))
        .addHbarTransfer(secondAccountId, Hbar.from(10));

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Scheduled Transaction")
        .setAdminKey(firstPrivateKey)
        .setTransactionValidDuration(120)
        .setWaitForExpiry(true)
        .execute(client);
   
    //Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.log("The schedule ID is " +scheduleId);

     //Get the serialized scheduled transaction ID
     const scheduledTxId = receipt.scheduledTransactionId;
    const scheduledTxBytes = Buffer.from(scheduledTxId.toString(), 'utf8');
    console.log('The serialized scheduled transaction is:' + scheduledTxBytes);


    // Scheduled_Transcation in Base64
    const scheduledTxBase64 = scheduledTxBytes.toString('base64');
    console.log("The scheduled transaction in base64 is: " + scheduledTxBase64);

    
}

main();