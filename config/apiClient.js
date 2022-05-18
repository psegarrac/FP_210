const axios = require("axios").default;

const client = axios.create({
  baseURL: process.env.API_URL,
});

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (err) => {
    return Promise.reject(err.response);
  }
);

const prepareDataToDB = (data) => {
  return JSON.stringify(data);
};

const apiClient = (url, data, requestHeader) => {
  let headers = {
    "Content-type": "application/json",
  };

  if (requestHeader) {
    headers = {
      ...headers,
      ...requestHeader,
    };
  }

  const get = async () => {
    const res = await client.get(url, { headers });
    return res.data;
  };

  const post = async () => {
    const res = await client.post(url, prepareDataToDB(data), { headers });
    return res.data;
  };
  const put = async () => {
    const res = await client.put(url, prepareDataToDB(data), { headers });
    return res.data;
  };

  const del = async () => {
    const res = await client.delete(url, { headers });
    return res.data;
  };

  return {
    get,
    post,
    put,
    del,
  };
};

module.exports = { apiClient };
