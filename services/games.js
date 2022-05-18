const { apiClient } = require("../config/apiClient.js");

const getSingleGame = (data) => {
  return apiClient(`/games/${data.roomId}`).get();
};

const createGame = (data) => {
  return apiClient("/games/create", data).post();
};

const putGame = (data) => {
  return apiClient(`/games/${data.roomId}/updateGame`, data.newGameInfo).put();
};

const delGame = (data) => {
  return apiClient(`/games/${data.roomId}`).del();
};

module.exports = {
  createGame,
  putGame,
  delGame,
  getSingleGame,
};
