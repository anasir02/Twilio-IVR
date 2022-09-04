const VoiceResponse = require("twilio").twiml.VoiceResponse;
const mongoose = require("mongoose");
const Call = require("../model/call");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.ACCOUNT_TOKEN;
const client = require("twilio")(accountSid, authToken);

exports.welcome = () => {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: "/ivr/menu",
    numDigits: "1",
    method: "POST",
  });

  gather.say(
    "Thanks for calling Twilio. " +
      "Please press 1 to forward your to you registered phone number. " +
      "Press 2 to record voicemail.",
    { loop: 3 }
  );

  return voiceResponse.toString();
};

exports.menu = (digit) => {
  const optionActions = {
    1: callForwarding,
    2: goToVoiceMail,
  };

  return optionActions[digit] ? optionActions[digit]() : redirectWelcome();
};

/**
 * Returns Twiml
 * @return {String}
 */
const callForwarding = () => {
  const response = new VoiceResponse();

  response.say("Please hold on while we forward your call to our agent");

  response.dial("+923364302537");

  retrieveCallLogs();

  return response.toString();
};

/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
const goToVoiceMail = () => {
  const response = new VoiceResponse();
  response.say(
    "Please leave a message at the beep.\nPress the star key when finished."
  );
  response.record({
    method: "GET",
    maxLength: 20,
    finishOnKey: "*",
  });
  response.say("I did not receive a recording");
};

const retrieveCallLogs = () => {
  let url = process.env.MONGO_DB_URL;
  mongoose
    .connect(url)
    .then(() => {
      console.log("connected to MongoDB");
    })
    .catch((error) => {
      console.log("error connecting to MongoDB:", error.message);
    });
  client.calls.list({ limit: 1 }).then((calls) => {
    const call = new Call({
      from: calls.from,
      startTime: calls.start_time,
      endTime: calls.end_time,
      duration: calls.duration,
    });

    call
      .save()
      .then(() => {
        console.log("Call data saved in DB");
        console.log(call);
        return mongoose.connection.close();
      })
      .catch((err) => console.log(err));
  });
};

/**
 * Returns an xml with the redirect
 * @return {String}
 */
const redirectWelcome = () => {
  const twiml = new VoiceResponse();

  twiml.say("Returning to the main menu", {
    voice: "alice",
    language: "en-GB",
  });

  twiml.redirect("/ivr/welcome");

  return twiml.toString();
};
