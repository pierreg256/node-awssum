var util = require('util');
var amazon = require("../lib/amazon");
var sqs = require("../lib/sqs");
var _ = require('underscore');

var env = process.env;
var accessKeyId = process.env.ACCESS_KEY_ID;
var secretAccessKey = process.env.SECRET_ACCESS_KEY;
var awsAccountId = process.env.AWS_ACCOUNT_ID;

var sqs = new sqs.Sqs(accessKeyId, secretAccessKey, awsAccountId, amazon.US_EAST_1);

console.log( 'Region :', sqs.region() );
console.log( 'EndPoint :',  sqs.endPoint() );
console.log( 'AccessKeyId :', sqs.accessKeyId() );
console.log( 'SecretAccessKey :', sqs.secretAccessKey() );
console.log( 'AwsAccountId :', sqs.awsAccountId() );

sqs.receiveMessage('my-queue', undefined, 5, undefined, function(err, data) {
    var msgs = [];
    var i = 1;

    console.log("\nReceiving message from my-queue - expecting success");
    console.log('Error :', util.inspect(err, true, null));
    console.log('Data :', util.inspect(data, true, null));

    // if there wasn't an error, delete these messages in one hit
    if ( ! err ) {
        // make sure we have some messages to delete
        if ( _.isUndefined(data.ReceiveMessageResponse.ReceiveMessageResult.Message) ) {
            console.log("\nNo messages to change visibility of");
            return;
        }

        if ( ! _.isArray(data.ReceiveMessageResponse.ReceiveMessageResult.Message) ) {
            // turn this into an array
            data.ReceiveMessageResponse.ReceiveMessageResult.Message = [
                data.ReceiveMessageResponse.ReceiveMessageResult.Message
            ];
        }

        _.each(data.ReceiveMessageResponse.ReceiveMessageResult.Message, function(m) {
            msgs.push({
                receiptHandle : m.ReceiptHandle,
                visibilityTimeout : 10
            });
            i++;
        });

        sqs.changeMessageVisibilityBatch('my-queue', msgs, function(err, data) {
            console.log("\nChanging visibility batch - expecting success");
            console.log('Error :', util.inspect(err, true, null));
            console.log('Data :', util.inspect(data, true, null));
        });
    }
});