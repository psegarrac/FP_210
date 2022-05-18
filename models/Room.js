const mongoose = require("mongoose");
const { Schema } = mongoose;

const RoomSchema = new Schema({
  id: String,
  name: String,
  color: String,
  usersRoom: [
    {
      name: String,
      avatar: String,
      id: String,
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
    },
  ],
  isOpen: Boolean,
});

RoomSchema.set("timestamps", true);

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;
