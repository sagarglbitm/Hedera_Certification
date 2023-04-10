/* 

    This Script is used for create a consensus transaction Hedra Consensus service using First_Account

*/

// Import Dependencies
const {
    PrivateKey,
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require('dotenv').config({ path: '../.env' });

// Grab the FIRST_ACCOUNT_ID and FIRST_PRIVATE_KEY from the Environmental file
const myAccountId = process.env.FIRST_ACCOUNT_ID;
const myPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

// Creating connection to the Hedera network
const client = Client.forTestnet();

// Set the operator account ID and operator private key
client.setOperator(myAccountId, myPrivateKey);


async function consensusService() {

    // Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);

    // Grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);

    // Wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 5000));

    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (message) => {
            let messageAsString = Buffer.from(message.contents, "utf8").toString();
            console.log(
                `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
            );
        });

    // Send message to Topic
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: "Hello Consensus Service",
    }).execute(client);
    const getReceipt = await sendResponse.getReceipt(client);

    // Get the status of the transaction
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus.toString());
}

// Calling consensusService Function
consensusService();