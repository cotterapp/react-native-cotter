import TrustedDevice from '../TrustedDevice';

class Cotter {
  /**
   * @param {string} baseURL
   * @param {string} apiKeyID
   * @param {string} apiSecretKey
   * @param {string} userID
   */
  constructor(baseURL, apiKeyID, apiSecretKey, userID) {
    this.baseURL = baseURL;
    this.apiKeyID = apiKeyID;
    this.apiSecretKey = apiSecretKey;
    this.userID = userID;
    this.trustedDevice = new TrustedDevice(
      baseURL,
      apiKeyID,
      apiSecretKey,
      userID,
    );
  }
}

export default Cotter;
