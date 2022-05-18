const mongoose = require("mongoose");
const { createRooms } = require("../seeds/roomSeeds");
require("dotenv").config();


mongoose.connect('mongodb://localhost/conquer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;
// reset rooms collection
conn.dropCollection("rooms");

// on open databse create room collection
conn.on("open", function (err, colection) {
  createRooms();
});

// if exist some error, show in console
conn.on("error", console.error.bind("Error connecting to mongo"));
