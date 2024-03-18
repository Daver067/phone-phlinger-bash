exports.handler = function (context, event, callback) {
  // Initiate the response
  let response = new Twilio.twiml.VoiceResponse();
  let dialCallStatus = event.DialCallStatus || "N/A";
  let dialBridgeStatus = event.DialBridged || "N/A";
  // if the call went through fine, end the call
  if (dialCallStatus == "completed" && dialBridgeStatus != "false") {
    //################################
    response.say("goodbye"); //TODO Remove this, just making sure I end up here for testing
    //################################
    response.hangup();
    return callback(null, response);
  }
  // default is to take a message
  response.say("sorry we missed you, please leave us a message");
  // begin a voicemail recording.
  response.record({
    timeout: 30, //TODO figure out what this value is for?
    recordingStatusCallbackEvent: ["in-progress", "completed"], // ping the recording url twice
    recordingStatusCallback:
      "https://serverless-phone-phlinger-2186-dev.twil.io/recordings", // where to ping for the recording callbacks
    action: "https://serverless-phone-phlinger-2186-dev.twil.io/hangup", // what to do after the recording... just in case the max length is hit
    maxLength: "120", // the longest a voicemail recoding can be
  });
  return callback(null, response);
};
