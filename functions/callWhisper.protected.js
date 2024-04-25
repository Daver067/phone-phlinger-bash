exports.handler = async function (context, event, callback) {
  // start the response right away
  let response = new Twilio.twiml.VoiceResponse();

  // Gather redirects back to this form, and will hit this block, returning an empty twiml, thus connecting the call
  if (event.msg == "Gather End") {
    return callback(null, response);
  }
  const asset = await Runtime.getSync()
    .maps("assets")
    .syncMapItems(event.CalledVia)
    .fetch()
    .then((item) => {
      return item.data;
    })
    .catch((error) => {
      // returns a whisper message of nothing if an error occurs
      console.log(error);
      return error;
    });

  if (asset.settings.gather === "true") {
    // this will collect any digit and wait 5 seconds, or it will hangup
    let gather = response.gather({
      numDigits: 1,
      timeout: 5,
    });
    // the message whispered to the client, or a default
    asset.settings.client_whisper_recording_or_text === "text"
      ? gather.say(asset.settings.client_whisper || "Press 1 to accept call")
      : gather.play(
          `https://test-phlinger-bucket.s3.us-east-2.amazonaws.com/${asset.settings.client_whisper}`
        );
    // if gather isnt done, it will hangup
    response.hangup();
  } else {
    // The Asset doesn't ask for a gather, so we will just whisper the message
    asset.settings.client_whisper_recording_or_text === "text"
      ? response.say(asset.settings.client_whisper || "Press 1 to accept call")
      : response.play(
          `https://test-phlinger-bucket.s3.us-east-2.amazonaws.com/${asset.settings.client_whisper}`
        );
  }
  return callback(null, response);
};
