import axios from 'axios';
import {Buffer} from 'buffer';
import DeviceInfo from 'react-native-device-info';

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
      device_name: this.getDeviceName(),
      device_type: await this.getDeviceType(),
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
      return resp.data;
    } catch (err) {
      throw err.response.data;
    }
  }

  /**
   * @param {string} method
   * @param {string} code
   * @returns {Object} - http response, enroll or not
   * @throws {Object} - http error response
   */
  async deleteMethod(method, code) {
    try {
      var resp = await this.updateMethod(
        method,
        code,
        false,
        false,
        null,
        null,
      );
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
      return resp.data;
    } catch (err) {
      throw err.response.data;
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
   * @param {boolean} approved
   * @returns {string}
   */
  constructRespondEventMsg(event, timestamp, method, approved) {
    var list = [
      this.userID,
      this.apiKeyID,
      event,
      timestamp,
      method,
      approved + '',
    ];
    return list.join('');
  }

  /**
   * Construct Event request JSON for an approved event
   * @param {string} event
   * @param {string} timestamp
   * @param {string} method
   * @param {string} code - PIN or Signature
   * @param {string} publicKey - PublicKey for TrustedDevice or Biometric
   * @param {string} [algorithm=null] - Algorithm used for TrustedDevice keys
   * @returns {Object} - The JSON data constructed
   */
  async constructApprovedEventJSON(
    event,
    timestamp,
    method,
    code,
    publicKey,
    algorithm = null,
  ) {
    var ipLoc = await this.getIPAddress();
    var data = {
      client_user_id: this.userID,
      issuer: this.apiKeyID,
      event: event,
      ip: ipLoc.ip,
      location: ipLoc.location,
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
   * Construct Event request JSON for a respond to an event
   * @param {Object} event
   * @param {string} method
   * @param {string} signature - PIN or Signature
   * @param {string} publicKey - PublicKey for TrustedDevice or Biometric
   * @param {string} algorithm - Algorithm used for TrustedDevice keys
   * @param {boolean} approved - PublicKey for TrustedDevice or Biometric
   * @returns {Object} - The JSON data constructed
   */
  constructRespondEventJSON(
    ev,
    method,
    signature,
    publicKey,
    algorithm,
    approved,
  ) {
    var data = {
      client_user_id: this.userID,
      issuer: this.apiKeyID,
      event: ev.event,
      ip: ev.ip,
      location: ev.location,
      timestamp: ev.timestamp,
      method: method,
      code: signature,
      approved: approved,
      public_key: publicKey,
      algorithm: algorithm,
    };
    return data;
  }

  /**
   * Construct Event request JSON for a registering a new trusted device
   * @param {string} event
   * @param {string} timestamp
   * @param {string} method
   * @param {string} signature - PIN or Signature
   * @param {string} publicKey - PublicKey for TrustedDevice or Biometric
   * @param {string} algorithm - Algorithm used for TrustedDevice keys
   * @param {string} newPublicKey - New PublicKey to be enrolled
   * @param {string} newAlgo - New PublicKey Algorithm to be enrolled
   * @param {boolean} approved - PublicKey for TrustedDevice or Biometric
   * @returns {Object} - The JSON data constructed
   */
  async constructRegisterNewDeviceJSON(
    event,
    timestamp,
    method,
    signature,
    publicKey,
    algorithm,
    newPublicKey,
    newAlgo,
  ) {
    var ipLoc = await this.getIPAddress();
    var data = {
      client_user_id: this.userID,
      issuer: this.apiKeyID,
      event: event,
      ip: ipLoc.ip,
      location: ipLoc.location,
      timestamp: timestamp,
      method: method,
      code: signature,
      approved: true,
      public_key: publicKey,
      algorithm: algorithm,

      register_new_device: true,
      new_device_public_key: newPublicKey,
      device_type: await this.getDeviceType(),
      device_name: this.getDeviceName(),
      new_device_algorithm: newAlgo,
    };
    return data;
  }

  /**
   * Construct Event request JSON for a pending event
   * @param {string} event
   * @param {string} timestamp
   * @param {string} method
   * @returns {Object} - The JSON data constructed
   */
  async constructEventJSON(event, timestamp, method) {
    var ipLoc = await this.getIPAddress();
    var data = {
      client_user_id: this.userID,
      issuer: this.apiKeyID,
      event: event,
      ip: ipLoc.ip,
      location: ipLoc.location,
      timestamp: timestamp,
      method: method,
    };
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

  /**
   * Create event that need approval from a TrustedDevice
   * @param {Object} req
   * @returns {Object} - The Event Object created
   * @throws {Object} - http error response
   */
  async createPendingEventRequest(req) {
    const path = '/event/create_pending';
    try {
      var resp = await this.createEventRequest(req, path);
      return resp;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create response to an event
   * @param {number} eventID
   * @param {Object} req
   * @returns {Object} - The Event Object created
   * @throws {Object} - http error response
   */
  async createRespondEventRequest(eventID, req) {
    const path = '/event/respond/' + eventID;
    try {
      var resp = await this.createEventRequest(req, path);
      return resp;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get an event based on the ID
   * @param {number} eventID
   * @returns {Object} - The Event Object created
   * @throws {Object} - http error response
   */
  async getEvent(eventID) {
    try {
      var config = {
        headers: {
          API_KEY_ID: this.apiKeyID,
          API_SECRET_KEY: this.apiSecretKey,
          'Content-type': 'application/json',
        },
      };
      const path = '/event/get/' + eventID;
      var resp = await axios.get(this.baseURL + path, config);
      return resp.data;
    } catch (err) {
      throw err.response.data;
    }
  }

  /**
   * Get new event based on the user ID
   * @returns {Object} - The Event Object created
   * @throws {Object} - http error response
   */
  async getNewEvent() {
    try {
      var config = {
        headers: {
          API_KEY_ID: this.apiKeyID,
          API_SECRET_KEY: this.apiSecretKey,
          'Content-type': 'application/json',
        },
      };
      const path = '/event/new/' + this.userID;
      var resp = await axios.get(this.baseURL + path, config);
      return resp.data;
    } catch (err) {
      throw err.response.data;
    }
  }

  async getDeviceType() {
    try {
      var resp = await DeviceInfo.getManufacturer();
      console.log(resp);
      return resp;
    } catch (err) {
      console.log(err);
      return 'unknown';
    }
  }
  getDeviceName() {
    var deviceID = DeviceInfo.getDeviceId();
    var readableVersion = DeviceInfo.getReadableVersion();
    console.log(deviceID + ' ' + readableVersion);
    return deviceID + ' ' + readableVersion;
  }
  async getIPAddress() {
    try {
      var resp = await axios.get('http://geoip-db.com/json/');
      console.log(resp.data);
      return {
        ip: resp.data.IPv4,
        location: resp.data.city,
      };
    } catch (err) {
      return {
        ip: 'unknown',
        location: 'unknown',
      };
    }
  }
}

export default Requests;
