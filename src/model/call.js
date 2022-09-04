const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
  from: Number,
  startTime: Date,
  endTime: Date,
  duration: Number,
});

callSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Call = mongoose.model("Call", callSchema);

module.exports = Call;
