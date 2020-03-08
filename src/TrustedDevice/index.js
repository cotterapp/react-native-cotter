import {NativeModules} from 'react-native';
import {sign} from 'tweetnacl';
import {Buffer} from 'buffer';
import Requests from '../Requests';
import {saveItemSecure, getItemSecure} from '../services/deviceStorage';

const trustedDeviceMethod = 'TRUSTED_DEVICE';
const keyStoreAlias = 'COTTER_TRUSTED_DEVICE_KEY';
const algorithm = 'ED25519';

class TrustedDevice {
  /**
   * This callback type is called `successCallback` and is displayed as a global symbol.
   * It receives an object of the response
   * @callback successCallback
   * @param {Object} response
   */
  /**
   * This callback type is called `errorCallback` and is displayed as a global symbol.
   * It receives an error message as string and a detailed error object, that may be empty
   * @callback errorCallback
   * @param {string} errorMessage
   * @param {Object} error
   */

  /**
   * @param {string} baseURL
   * @param {string} apiKeyID
   * @param {string} apiSecretKey
   * @param {string} userID
   * @returns {TrustedDevice}
   */
  constructor(baseURL, apiKeyID, apiSecretKey, userID) {
    this.method = trustedDeviceMethod;
    this.baseURL = baseURL;
    this.apiKeyID = apiKeyID;
    this.apiSecretKey = apiSecretKey;
    this.userID = userID;
    this.requests = new Requests(baseURL, apiKeyID, apiSecretKey, userID);
    this.algorithm = algorithm;
  }

  getKeystoreAliasPubKey() {
    return keyStoreAlias + this.apiKeyID + this.userID + 'PUB_KEY';
  }
  getKeystoreAliasSecKey() {
    return keyStoreAlias + this.apiKeyID + this.userID + 'SEC_KEY';
  }
  async getPublicKey() {
    var pubKey = await getItemSecure(this.getKeystoreAliasPubKey());
    return pubKey;
  }
  async getSecretKey() {
    var secKey = await getItemSecure(this.getKeystoreAliasSecKey());
    return secKey;
  }

  /**
   * @param {string} stringToSign
   * @returns {string}
   * @throws {Object} - error from signing
   */
  async sign(stringToSign) {
    try {
      var secKey = await this.getSecretKey();
      const secretKeyUint8 = new Uint8Array(Buffer.from(secKey, 'base64'));
      const messageUint8 = new Uint8Array(Buffer.from(stringToSign, 'utf8'));

      var signature = sign.detached(messageUint8, secretKeyUint8);

      var signatureB64 = new Buffer(signature).toString('base64');
      console.log('signature', signatureB64);
      return signatureB64;
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {successCallback} onSuccess
   * @param {errorCallback} onError
   */
  enrollDevice(onSuccess, onError) {
    const {RNRandomBytes} = NativeModules;
    RNRandomBytes.randomBytes(32, (_, bytes) => {
      seed = Buffer.from(bytes, 'base64');

      var keypair = sign.keyPair.fromSeed(seed);
      const secKey = new Buffer(keypair.secretKey).toString('base64');
      const pubKey = new Buffer(keypair.publicKey).toString('base64');
      console.log(secKey);

      this.requests
        .updateMethod(this.method, pubKey, true, false, null, this.algorithm)
        .then(resp => {
          saveItemSecure(this.getKeystoreAliasPubKey(), pubKey);
          saveItemSecure(this.getKeystoreAliasSecKey(), secKey);
          onSuccess(resp);
        })
        .catch(err => {
          console.log(err);
          var errMsg =
            err.response && err.response.data
              ? err.response.data.msg
              : 'Something went wrong';
          onError(errMsg, err);
        });
    });
  }

  /**
   * Check if THIS DEVICE is enrolled as a trusted device
   * @returns {boolean}
   * @throws {Object} - http error response
   */
  async trustedDeviceEnrolled() {
    try {
      // get Public Key from secure storage
      var pubKey = await this.getPublicKey();
      // Check enrolled method
      var resp = await this.requests.checkEnrolledMethod(this.method, pubKey);

      // return enrolled or not
      if (resp.data.enrolled && resp.data.method === this.method) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Authorize an event with this device, assuming this device is a trusted device
   * @param {string} event - Name tag of event (LOGIN, TRANSACTION, etc)
   * @returns {Object} - Event Object response (contains the event and approved or not)
   * @throws {Object} - http error response
   */
  async authorizeDevice(event) {
    var timestamp = Math.round(new Date().getTime() / 1000).toString();
    var stringToSign = this.requests.constructApprovedEventMsg(
      event,
      timestamp,
      this.method,
    );
    try {
      var pubKey = await this.getPublicKey();
      var signature = await this.sign(stringToSign);
      var data = this.requests.constructApprovedEventJSON(
        event,
        timestamp,
        this.method,
        signature,
        pubKey,
        this.algorithm,
      );
      var resp = await this.requests.createApprovedEventRequest(data);
      return resp;
    } catch (err) {
      throw err;
    }
  }
}

export default TrustedDevice;
