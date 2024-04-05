exports.handler = async function (context, event, callback) {
  const sync = Runtime.getSync();
  // initiate the response
  let response = new Twilio.twiml.VoiceResponse();

  // grab a reference to the twilio client for finding the proper original CallSid (parentCallSid)
  const client = context.getTwilioClient();

  // Either responds with human, unknown, or machine_start
  if (event.AnsweredBy == "machine_start") {
    callback(null, response);
  } else {
    try {
      // need to go deep to find the proper call log identifier
      const ParentCallSid = await client
        .calls(event.CallSid)
        .fetch()
        .then((call) => {
          return call.parentCallSid;
        });
      // grab the current call_log
      let current_call = await sync
        .maps("call_logs")
        .syncMapItems(ParentCallSid)
        .fetch();
      current_call.data.outcome = "Call Answered By Client";
      // Update the database
      await sync
        .maps("call_logs")
        .syncMapItems(ParentCallSid)
        .update({ data: current_call.data });
      return callback();
    } catch (err) {
      return callback(null, err);
    }
    // Only 2 choices, in-progress or completed, so the following is for a completed recording
  }
};
