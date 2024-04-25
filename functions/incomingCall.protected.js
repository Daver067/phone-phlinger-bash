exports.handler = async function (context, event, callback) {
  //Data Management Area
  let name = event.CallerName || "N/A";
  let city = event.FromCity || "N/A";

  // start the call log instance, initialize all of the fields. Was having issues with callerName not becoming a field when the event.CallerName was blank from twilio. it was crashing the emails...
  // The above fix appears to solve this issue

  // Grab a reference to the Sync object since we'll be using it a few times
  const sync = Runtime.getSync();

  try {
    // grab a variable that is the asset called.
    const asset = await sync
      .maps("assets")
      .syncMapItems(event.To)
      .fetch()
      .then((item) => {
        return item.data;
      });

    // start making a call log
    await sync.maps("call_logs").syncMapItems.create({
      key: event.CallSid,
      data: {
        call_sid: event.CallSid,
        asset: asset.name,
        asset_email: asset.email,
        client_id: asset.client.phone_number,
        client_email: asset.email, //TODO change this to asset.client.email once python script is changed
        asset_id: asset.phone_number,
        caller_number: event.From,
        time: Date().toString(),
        outcome: "missed call",
        caller_name: name,
        caller_city: city,
        client_call_sid: null,
        recording_id: null,
        recording_url: null,
        recording_length: 0,
      },
    });

    // machine detection needs to run, but i can still disable by changing routes
    let machineDetectionUrl = "disabledMachineDetection";
    if (asset.settings.client_answering_machine_detection === "Enable") {
      machineDetectionUrl = "machineDetection";
    }
    // Initialize the twiml to respond
    let response = new Twilio.twiml.VoiceResponse();

    asset.settings.caller_greeting_recording_or_text === "text"
      ? response.say(asset.settings.caller_greeting || "")
      : response.play(
          `https://test-phlinger-bucket.s3.us-east-2.amazonaws.com/${asset.settings.caller_greeting}`
        );

    let dial = response.dial({
      answerOnBridge: "true", // will ring until client answers
      timeout: Number(asset.settings.ring_time) || 13, // Amount of time to ring
      action: `/voicemail`, // Where the call will go after the call is completed, regardless of how it completes
      record: asset.settings.record_client || "do-not-record", // Record both ends of the dialed call "do-not-record" is other option
      recordingStatusCallbackEvent: ["in-progress", "completed"], // will ping the address below for both statements
      recordingStatusCallback: `${asset.settings.url}/recordings`, // what to do with the recordings
    });
    dial.number(asset.client.phone_number, {
      url: "/callWhisper", // When the number dialed answered, send them here.
      machineDetection: "Enable", // Checks for answering machine to answer... need this or recording to know if it got answered.
      amdStatusCallback: `${asset.settings.url}/${machineDetectionUrl}`, // What to do when the machine detection makes a decision
      statusCallbackEvent: ["initiated", "answered", "completed"], // states in which to send callback to events
      statusCallback: `${asset.settings.url}/events`, // url for callbacks in above
      statusCallbackMethod: "POST", // post request, not get
    });

    return callback(null, response);
  } catch (error) {
    // Be sure to log and return any errors that occur!
    console.error("Sync Error: ", error);
    return callback(null, error);
  }
};
