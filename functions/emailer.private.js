const axios = require("axios");

exports.email = async (context, call_log) => {
  // Pulling the url from the .env file
  let url = context.EMAIL_URL;
  call_log.account_sid = context.ACCOUNT_SID;
  call_log.auth_token = context.AUTH_TOKEN;
  // initiating the headers so that the backend knows what is coming and who its coming from
  const headers = {
    headers: {
      "Content-Type": "application/json ",
      "X-Master-Key": "hiddenkey", //TODO Need to put this in .env
    },
  };
  // figures out whether to email with or without attachment, directs accordingly
  call_log.recording_id == null
    ? (url += "/email")
    : (url += "/emailAttachment");
  try {
    // axios tries to send out the email and waits for a response.
    const emailer = await axios.post(url, call_log, headers);
    const response = emailer.data;
    return response;
  } catch (error) {
    return error;
  }
};
