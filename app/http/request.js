import axios from "axios";

const API_URL = "http://localhost:8080";
const API_BASE_URL = process.env.NEXT_PUBLIC_REACT_APP_BASE_URL ?? API_URL;

const server = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retry: 0,
  retryDelay: 1000,
});

server.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["x-access-token"] = token;
    }
    if (config.method === "options") {
      config.headers["Access-Control-Allow-Origin"] = "*";
    }
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (err) => Promise.reject(err),
);

server.interceptors.response.use(
  (res) => {
    if (res.status) {
      return res.data;
    }
    return res;
  },
  (err) => Promise.reject(err),
);

export const get = (url, config = {}) => server.get(url, config);

export const post = (url, data = {}, config = {}) =>
  server.post(url, data, config);
