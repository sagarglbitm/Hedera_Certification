/*  
   * Make a second script that reads in the serialized format and provides the required signature and submit it. 

*/

// Import Dependencies
const {
    ScheduleSignTransaction,
    Client,
    PrivateKey,
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require('dotenv').config({ path: '../.env' });

// Fetch all ID's And Key's From Environmental File
const firstAccountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);
const scheduleId = process.env.SCHEDULED_ID;

// Condition To Check Account_Id and Private_key is present or not
if (firstAccountId == null ||
    firstPrivateKey == null ||
    scheduleId == null ) {
    throw new Error("Environment variables ID's and KEY's must be present");
}

// Create our connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(firstAccountId, firstPrivateKey);

async function main() {

    //Create the ScheduledSignTransaction
    const transaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(firstPrivateKey);

    //Sign with the client operator key to pay for the transaction and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " +transactionStatus);

    process.exit();
}

main();