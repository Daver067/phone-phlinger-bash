exports.handler = async function (context, event, callback) {
  // initialize the twilio client
  const client = context.getTwilioClient();
  // has to be async in twilio functions or else it terminates before it can update the call
  await client.calls(event.CallSid).update({ status: "completed" });
  return callback();
};
