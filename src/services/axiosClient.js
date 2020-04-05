import axios from 'axios';
import Cotter from '../Cotter';

var axiosInstance = axios.create({
  baseURL: Cotter.BaseURL,
  /* other custom settings */
});

module.exports = axiosInstance;
