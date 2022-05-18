const { apiClient } = require("../config/apiClient");

const getRanking = () => {
  return apiClient("/ranking").get();
};

module.exports = {
  getRanking,
};
