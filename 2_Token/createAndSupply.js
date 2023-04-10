/* 
   * Create a script that creates a fungible token with the Hedera Token Service belonging to Account1
   * The initial supply should be 350.50 and additional supply can be created by Account2.
   * The maximum supply should 500

*/

// Import Dependencies
const {
    TokenCreateTransaction,
    Client,
    TokenType,
    TokenMintTransaction,
    AccountBalanceQuery, PrivateKey, Wallet, TokenSupplyType
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require('dotenv').config({ path: '../.env' });

// Set  First Account As Treasurey Account And Private_Key As Treasury Key 
const treasuryId = process.env.FIRST_ACCOUNT_ID;
const treasuryKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);

// Set The Fourth Private_key As Pause Key
const pauseKey = PrivateKey.fromString(process.env.FOURTH_PRIVATE_KEY);
let tokenId;

// Check That ID's And key's is Null Or Not
if (treasuryId == null ||
    treasuryKey == null ||
    pauseKey == null) {
    throw new Error("Environment variables of ID's and Key's must be present");
}
// Fetch Second_Account as supply account 
const supplyAccountId = process.env.SECOND_ACCOUNT_ID;
const supplyPrivateKey = PrivateKey.fromString(process.env.SECOND_PRIVATE_KEY);

// Check That SupplyAccount-Id And SuppllyAccount_key is Null Or Not
if (supplyAccountId == null ||
    supplyPrivateKey == null) {
    throw new Error("Environment variables supplyAccountId and supplyPrivateKey must be present");
}

// Create our connection to the Hedera network using treasury account or Account1
const client = Client.forTestnet();
client.setOperator(treasuryId, treasuryKey);

// Created a Wallet For Admin By Using Treasury_Id And Treasury_Key 
const adminUser = new Wallet(
    treasuryId,
    treasuryKey
)
// Created a Wallet For Supply By Using supplyAccountId And supplyPrivateKey
const supplyUser = new Wallet(
    supplyAccountId,
    supplyPrivateKey
)

// Creation Of Fungible Token By First_Account
async function createFungibleToken() {

    //Create the transaction and freeze for manual signing
    const transaction = await new TokenCreateTransaction()
        .setTokenName("FOOD TOKEN")
        .setTokenSymbol("FT")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setTreasuryAccountId(treasuryId)
        .setInitialSupply(35050)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(50000)
        .setAdminKey(adminUser.publicKey)
        .setSupplyKey(supplyUser.publicKey)
        .setPauseKey(pauseKey)
        .freezeWith(client);

    //Sign the transaction with the client, who is set as admin and treasury account
    const signTx = await transaction.sign(treasuryKey);

    //Submit to a Hedera network
    const txResponse = await signTx.execute(client);
    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the token ID from the receipt
    tokenId = receipt.tokenId;

    console.log("The new token ID is " + tokenId);

    // Checking Balance of Admin_User
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(adminUser.accountId);

    //Sign with the client operator private key and submit to a Hedera network
    const tokenBalance = await balanceQuery.execute(client);

    console.log("The balance of the user is: " + tokenBalance.tokens.get(tokenId));

}

// Creation For AdditionalSupply By Second_Account 
async function additionalSupply(tokenId) {

    //Create the transaction and freeze for manual signing
    const transaction = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(14950)
        .freezeWith(client);


    //Sign the transaction with the client, who is set as admin and treasury account
    const signTx = await transaction.sign(supplyPrivateKey);

    //Submit the signed transaction to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status.toString();

    console.log("The transaction consensus status is " + transactionStatus);
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(adminUser.accountId);

    const tokenBalance = await balanceQuery.execute(client);

    console.log("The balance of the user after additional supply is: " + tokenBalance.tokens.get(tokenId));

}

//  In The Main Function,We Call Two Sub-Function
async function main() {

    // Calling The Function Of createFungibleToken 
    createFungibleToken();
    
    // This CallBack is used to Wait For 2sec and give a time to execute  above function
    await new Promise(r => setTimeout(r, 2000));

    //call additionalSupply function
    additionalSupply(tokenId);

}
main();