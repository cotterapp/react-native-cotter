import axios from 'axios';

const DEV = false;
const STAGING = true;

const COTTER_BASE_URL = DEV
  ? 'http://localhost:1234/api/v0'
  : STAGING
  ? 'https://s.www.cotter.app/api/v0'
  : 'https://www.cotter.app/api/v0';

var axiosInstance = axios.create({
  baseURL: COTTER_BASE_URL,
  /* other custom settings */
});

module.exports = axiosInstance;
