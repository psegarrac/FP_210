const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  avatar: String,
  color: String,
  rankingStatus: {
    cellsConquered: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
  },
});

UserSchema.set("timestamps", true);

const User = mongoose.model("User", UserSchema);
module.exports = User;
