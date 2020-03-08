import axios from 'axios';
import {Buffer} from 'buffer';

class Requests {
  /**
   * @param {string} baseURL
   * @param {string} apiKeyID
   * @param {string} apiSecretKey
   * @param {string} userID
   * @returns {Requests}
   */
  constructor(baseURL, apiKeyID, apiSecretKey, userID) {
    this.baseURL = baseURL;
    this.apiKeyID = apiKeyID;
    this.apiSecretKey = apiSecretKey;
    this.userID = userID;
  }

  /**
   * @param {string} method
   * @param {string} code
   * @param {boolean} enrolled
   * @param {boolean} changeCode
   * @param {string} currentCode
   * @param {string} algorithm
   * @returns {Object} - User Object
   * @throws {Object} - http error response
   */
  async updateMethod(
    method,
    code,
    enrolled,
    changeCode,
    currentCode,
    algorithm,
  ) {
    var data = {
      method: method,
      enrolled: enrolled,
      code: code, // Code for PIN or Public Key
      algorithm: algorithm,
      device_name: 'this.getDeviceName()',
      device_type: 'this.getDeviceType()',
    };

    if (changeCode) {
      data['change_code'] = changeCode;
      data['current_code'] = currentCode;
    }
    try {
      var config = {
        headers: {
          API_KEY_ID: this.apiKeyID,
          API_SECRET_KEY: this.apiSecretKey,
          'Content-type': 'application/json',
        },
      };
      const path = this.baseURL + '/user/' + this.userID;
      var resp = await axios.put(path, data, config);
      return resp;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {string} method
   * @param {string} pubKey
   * @returns {Object} - http response, enroll or not
   * @throws {Object} - http error response
   */
  async checkEnrolledMethod(method, pubKey) {
    var path = this.baseURL + '/user/enrolled/' + this.userID + '/' + method;
    if (pubKey != null) {
      var pubKeyEncoded = new Buffer(pubKey)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      path = path + '/' + pubKeyEncoded;
    }
    try {
      var config = {
        headers: {
          API_KEY_ID: this.apiKeyID,
          API_SECRET_KEY: this.apiSecretKey,
          'Content-type': 'application/json',
        },
      };
      var resp = await axios.get(path, config);
      return resp;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {string} event
   * @param {string} timestamp
   * @param {string} method
   * @returns {string}
   */
  constructApprovedEventMsg(event, timestamp, method) {
    var list = [this.userID, this.apiKeyID, event, timestamp, method, 'true'];
    return list.join('');
  }

  /**
   * @param {string} event
   * @param {string} timestamp
   * @param {string} method
   * @param {string} code - PIN or Signature
   * @param {string} publicKey - PublicKey for TrustedDevice or Biometric
   * @param {string} [algorithm=null] - Algorithm used for TrustedDevice keys
   * @returns {Object} - The JSON data constructed
   */
  constructApprovedEventJSON(
    event,
    timestamp,
    method,
    code,
    publicKey,
    algorithm = null,
  ) {
    var data = {
      client_user_id: this.userID,
      issuer: this.apiKeyID,
      event: event,
      ip: 'getIPAddress()',
      timestamp: timestamp,
      method: method,
      code: code,
      approved: true,
      public_key: publicKey,
    };
    if (algorithm) {
      data['algorithm'] = algorithm;
    }
    return data;
  }

  /**
   * Base Create Event Request used for CreateApprovedEvent or CreatePendingEvent
   * @param {Object} req
   * @param {string} path
   * @returns {Object} - The Event Object created
   * @throws {Object} - http error response
   */
  async createEventRequest(req, path) {
    try {
      var config = {
        headers: {
          API_KEY_ID: this.apiKeyID,
          API_SECRET_KEY: this.apiSecretKey,
          'Content-type': 'application/json',
        },
      };
      var resp = await axios.post(this.baseURL + path, req, config);
      return resp.data;
    } catch (err) {
      throw err.response.data;
    }
  }

  /**
   * Create event that is automatically approved
   * @param {Object} req
   * @returns {Object} - The Event Object created
   * @throws {Object} - http error response
   */
  async createApprovedEventRequest(req) {
    const path = '/event/create';
    try {
      var resp = await this.createEventRequest(req, path);
      return resp;
    } catch (err) {
      throw err;
    }
  }
}

export default Requests;
