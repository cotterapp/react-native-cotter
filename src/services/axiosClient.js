import axios from 'axios';

var axiosInstance = axios.create({
  baseURL: 'https://www.cotter.app/api/v0',
  /* other custom settings */
});

module.exports = axiosInstance;
