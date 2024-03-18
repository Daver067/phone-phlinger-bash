exports.handler = async function (context, event, callback) {
  // Initialize the sync
  const sync = Runtime.getSync();
  // Load the emailer module
  const emailerPath = Runtime.getFunctions()["emailer"].path;
  const emailer = require(emailerPath);

  // if it was outbound, we are trying to contact OUR client
  if (event.Direction == "outbound-dial") {
    try {
      let current_call = await sync
        .maps("call_logs")
        .syncMapItems(event.ParentCallSid)
        .fetch();
      // If this is the first time through the events route I need to log the client call sid for tracking
      if (current_call.data.client_call_sid === null) {
        current_call.data.client_call_sid = event.CallSid;
      }
      // This can be added in the above loop... its the same condition basically
      if (event.CallStatus == "initiated") {
        current_call.data.outcome = "No Answer From Client";
      }
      // can also use if CallStatus == in-progress, completed... no use for those conditions right now

      // Updates the sync data values for this call log
      await sync
        .maps("call_logs")
        .syncMapItems(event.ParentCallSid)
        .update({ data: current_call.data });
      return callback();
    } catch (err) {
      return callback(null, err);
    }
  } else {
    // This else only runs for incoming calls that have been completed
    try {
      // since its inbound we need to fetch the call_log from the CallSid instead of ParentCallSid
      let current_call = await sync
        .maps("call_logs")
        .syncMapItems(event.CallSid)
        .fetch();
      // Update duration of phone call
      //TODO code for duration update
      // This means the phone call is completed and it never started a recording.
      if (current_call.data.recording_id == null) {
        // send an email with no attachment (emailer will decipher that there is no attachment needed)
        // await emailer.email(context, current_call.data);
      }
      return callback();
    } catch (err) {
      return callback(null, err);
    }
  }
};
