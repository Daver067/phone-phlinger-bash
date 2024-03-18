exports.handler = async function (context, event, callback) {
  // Initialize the sync and emailer module
  const sync = Runtime.getSync();
  const emailerPath = Runtime.getFunctions()["emailer"].path;
  const emailer = require(emailerPath);

  // there is going to be a recording, update the current call so I know the recording is coming
  if (event.RecordingStatus == "in-progress") {
    try {
      let current_call = await sync
        .maps("call_logs")
        .syncMapItems(event.CallSid)
        .fetch();
      current_call.data.recording_id = event.RecordingSid;
      // Update the database
      await sync
        .maps("call_logs")
        .syncMapItems(event.CallSid)
        .update({ data: current_call.data });
    } catch (err) {
      return callback(null, err);
    }
    return callback();
    // Only 2 choices, in-progress or completed, so the following is for a completed recording
  } else {
    try {
      // update call log with recording url
      let current_call = await sync
        .maps("call_logs")
        .syncMapItems(event.CallSid)
        .fetch();
      // actually i think theres something to do with the event.RecordVerb or something.
      current_call.data.recording_url = event.RecordingUrl;
      current_call.data.recording_length = event.RecordingDuration;
      // update the databasse
      await sync
        .maps("call_logs")
        .syncMapItems(event.CallSid)
        .update({ data: current_call.data });
      // download the recording and send the email - backend will worry about that downloading nonsense
      // await emailer.email(context, current_call.data);
    } catch (err) {
      return callback(null, err);
    }
    return callback();
  }
};
