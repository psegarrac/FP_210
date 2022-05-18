const { apiClient } = require("../config/apiClient.js");

const createUser = (data) => {
  return apiClient("/auth/register", data).post();
};

const loginInUser = (data) => {
  return apiClient("/auth/login", data).post();
};

const updateRanking = (data) => {
  return apiClient(`/users/${data.id}/updateRanking`, data).put();
};

const getSingleUser = (data) => {
  return apiClient(`/users/${data.id}`).get();
};

const getUsers = () => {
  return apiClient("/users").get();
};

module.exports = {
  createUser,
  getUsers,
  getSingleUser,
  loginInUser,
  updateRanking,
};
