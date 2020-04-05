import TrustedDevice from '../TrustedDevice';
import TokenHandler from '../TokenHandler';

const DEV = true;
const STAGING = false;

const COTTER_BASE_URL = DEV
  ? 'http://localhost:1234/api/v0'
  : STAGING
  ? 'https://s.www.cotter.app/api/v0'
  : 'https://www.cotter.app/api/v0';

class Cotter {
  static BaseURL = COTTER_BASE_URL;
  static accessToken;
  static idToken;
  static tokenType;
  /**
   * @param {string} baseURL
   * @param {string} apiKeyID
   * @param {string} apiSecretKey
   * @param {string} userID
   */
  constructor(baseURL, apiKeyID, apiSecretKey, userID) {
    this.baseURL = baseURL;
    Cotter.BaseURL = baseURL;
    this.apiKeyID = apiKeyID;
    this.apiSecretKey = apiSecretKey;
    this.userID = userID;
    this.trustedDevice = new TrustedDevice(
      baseURL,
      apiKeyID,
      apiSecretKey,
      userID,
    );
    this.tokenHandler = new TokenHandler(
      baseURL,
      apiKeyID,
      apiSecretKey,
      userID,
    );
  }
}

Cotter.BaseURL = COTTER_BASE_URL;

export default Cotter;
