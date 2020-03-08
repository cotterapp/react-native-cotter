import axios from 'axios';

const DEV = false;
var axiosInstance = axios.create({
  baseURL: DEV
    ? 'http://localhost:1234/api/v0'
    : 'https://www.cotter.app/api/v0',
  /* other custom settings */
});

module.exports = axiosInstance;
