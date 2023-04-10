/* 
   * Use Account1 as a treasury account so that Account2 can spend 20 Hbar on behalf of Account1
   * Create a transaction that transfers the 20Hbars to Account3
   * Re-run the same operation and show that the allowance has been used and that the second transaction fail

*/

// Import Dependencies
const {
    Client,
    PrivateKey,
    Hbar,
    TransferTransaction,
    AccountAllowanceApproveTransaction,
    AccountBalanceQuery,
    TransactionId
} = require("@hashgraph/sdk");

// Loading Variable From Environment File
require('dotenv').config({ path: '../.env' });

// Fetch The Account_Id's And Private_Key's From Environmental File
const firstAcountId = process.env.FIRST_ACCOUNT_ID;
const firstPrivateKey = PrivateKey.fromString(process.env.FIRST_PRIVATE_KEY);
const secondAccountId = process.env.SECOND_ACCOUNT_ID;
const secondPrivateKey = PrivateKey.fromString(process.env.SECOND_PRIVATE_KEY);
const thirdAccountId = process.env.THIRD_ACCOUNT_ID;
const thirdPrivateKey = PrivateKey.fromString(process.env.THIRD_PRIVATE_KEY);

// Condition To Check Account_Id and Private_key is present or not
if (firstAcountId == null ||
    firstPrivateKey == null ||
    secondAccountId == null ||
    secondPrivateKey == null ||
    thirdAccountId == null ||
    thirdPrivateKey == null) {
    throw new Error("Environment variables of AcountId's and PrivateKey's must be present");
}

// Create our connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(firstAcountId, firstPrivateKey);

async function transferHbar() {


    console.log("-------Second Account Taking Allowance Approval For Sending Money On Behalf Of First Account------- \n");

    //  Approve SecondAccount to spend 20Hbar on behalf of FirstAccount
    const allowBal = new Hbar(20);
    const allowanceTx = new AccountAllowanceApproveTransaction()
        .approveHbarAllowance(firstAcountId, secondAccountId, allowBal)
        .freezeWith(client);
    const allowanceSign = await allowanceTx.sign(firstPrivateKey);
    const allowanceSubmit = await allowanceSign.execute(client);
    const allowanceRx = await allowanceSubmit.getReceipt(client);
    console.log(`- Allowance approval status: ${allowanceRx.status}\n`);

    console.log("---------Check The Account Balance Before Transfer---------\n");

    // Check The Balance Of First_Account Before Transfer
    const firstAccountBalanceBeforeTransfer = new AccountBalanceQuery()
        .setAccountId(firstAcountId);
    const firstAccountBalance = await firstAccountBalanceBeforeTransfer.execute(client);
    console.log(`The account balance for account ${firstAcountId} before Transfer is ${firstAccountBalance.hbars} HBar`);

    // Check The Balance Of Second_Account Before Transfer
    const secondAccountBalanceBeforeTransfer = new AccountBalanceQuery()
        .setAccountId(secondAccountId);
    const secondAccountBlance = await secondAccountBalanceBeforeTransfer.execute(client);
    console.log(`The account balance for account ${secondAccountId} before Transfer is ${secondAccountBlance.hbars} HBar`);

    // Check The Balance Of Third_Account Before Transfer
    const thirdAccountBalanceBeforeTransfer = new AccountBalanceQuery()
        .setAccountId(thirdAccountId);
    const thirdAccountBalance = await thirdAccountBalanceBeforeTransfer.execute(client);
    console.log(`The account balance for account ${thirdAccountId} before Transfer is ${thirdAccountBalance.hbars} HBar \n`);


    console.log("-------------Second_Account  Transfer Hbar from FirstAccount to ThirdAccount------------- \n");

    // Second_Account performing  Transfer Hbar from FirstAccount to ThirdAccount
    const sendBal = new Hbar(20);
    const allowanceSendTx = await new TransferTransaction()
        .addApprovedHbarTransfer(firstAcountId, sendBal.negated())
        .addHbarTransfer(thirdAccountId, sendBal)
        .setTransactionId(TransactionId.generate(secondAccountId))
        .freezeWith(client);
    const approvedSendSign = await allowanceSendTx.sign(secondPrivateKey);
    const approvedSendSubmit = await approvedSendSign.execute(client);
    const approvedSendRx = await approvedSendSubmit.getReceipt(client);

    console.log(`- Allowance  Balance Transfer status: ${approvedSendRx.status}\n`);


    console.log("---------Check Account's Balance After Transfer--------\n");

    // Check The Balance Of First_Account After Transfer
    const firstAccountBalanceAfterTransfer = new AccountBalanceQuery()
        .setAccountId(firstAcountId);
    const firstBalance = await firstAccountBalanceAfterTransfer.execute(client);
    console.log(`The account balance for account ${firstAcountId} is ${firstBalance.hbars} HBar`);

    // Check The Balance Of Second_Account After Transfer
    const secondAccountBalanceAfterTransfer = new AccountBalanceQuery()
        .setAccountId(secondAccountId);
    const secondBalance = await secondAccountBalanceAfterTransfer.execute(client);
    console.log(`The account balance for account ${secondAccountId} is ${secondBalance.hbars} HBar`);

    // Check The Balance Of Third_Account After Transfer
    const thirdAccountBalanceAfterTransfer = new AccountBalanceQuery()
        .setAccountId(thirdAccountId);
    const thirdBalance = await thirdAccountBalanceAfterTransfer.execute(client);
    console.log(`The account balance for account ${thirdAccountId} is ${thirdBalance.hbars} HBar \n`);

    console.log("--------Again Second_Account Try TO Send 20Hbar From First Account To Third Account--------\n");

    // Again Second_Account Try To Transfer 20 Hbar from first Account to Third Account 
    const allowanceSendHbar = await new TransferTransaction()
        .addApprovedHbarTransfer(firstAcountId, sendBal.negated())
        .addHbarTransfer(thirdAccountId, sendBal)
        .setTransactionId(TransactionId.generate(secondAccountId))
        .freezeWith(client);
    const approvedSendSignHbar = await allowanceSendHbar.sign(secondPrivateKey);
    const approvedSendSubmitHbar = await approvedSendSignHbar.execute(client);
    const approvedSendReceiptHbar = await approvedSendSubmitHbar.getReceipt(client);

    console.log(`- Allowance transfer transaction${approvedSendReceiptHbar.TransactionId} failed with status ${approvedSendReceiptHbar.status.toString()}.`);
}

// calling transferHbar Function
transferHbar();