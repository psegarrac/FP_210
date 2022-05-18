const mongoose = require("mongoose");
const { Schema } = mongoose;

const playerSchema = {
  id: String,
  name: String,
  cellsConquered: Number,
  color: String,
  hasLost: Boolean,
};

const GameSchema = new Schema({
  roomId: String,
  grid: [
    {
      id: String,
      row: Number,
      cell: Number,
      cell_x: Number,
      cell_y: Number,
      playerId: {
        type: String,
        default: null,
      },
      color: {
        type: String,
        default: null,
      },
    },
  ],
  players: [playerSchema],
  defeatedPlayers: [
    {
      id: String,
      name: String,
      cellsConquered: Number,
    },
  ],
  totalCellsToWin: Number,
  round: {
    turn: Number,
    roundNumber: Number,
    player: {
      type: playerSchema,
      default: null,
    },
  },
});

GameSchema.set("timestamps", true);

const Game = mongoose.model("Game", GameSchema);
module.exports = Game;
