import {NativeModules} from 'react-native';
import {sign} from 'tweetnacl';
import {Buffer} from 'buffer';
import Requests from '../Requests';
import {saveItemSecure, getItemSecure} from '../services/deviceStorage';
import {CotterAuthModal} from './wrapper';
import TokenHandler from '../TokenHandler';

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
    this.tokenHandler = new TokenHandler(
      baseURL,
      apiKeyID,
      apiSecretKey,
      userID,
    );
  }

  getKeystoreAliasPubKey() {
    return keyStoreAlias + this.apiKeyID + this.userID + 'PUB_KEY';
  }
  getKeystoreAliasSecKey() {
    return keyStoreAlias + this.apiKeyID + this.userID + 'SEC_KEY';
  }

  /**
   * @throws {Object} - error because no public key
   */
  async getPublicKey() {
    try {
      var pubKey = await getItemSecure(this.getKeystoreAliasPubKey());
      return pubKey;
    } catch (e) {
      throw 'NO_PUB_KEY';
    }
  }
  async getSecretKey() {
    try {
      var secKey = await getItemSecure(this.getKeystoreAliasSecKey());
      return secKey;
    } catch (e) {
      throw 'NO_SEC_KEY';
    }
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
   * @param {boolean} [getOAuthToken=false] - Whether or not to return oauth tokens
   */
  async enrollDevice(onSuccess, onError, getOAuthToken = false) {
    var getNewKeys = false;
    try {
      var pubKeyOrig = await this.getPublicKey();
      var secKeyOrig = await this.getSecretKey();
    } catch (err) {
      if (err == 'NO_PUB_KEY' || err == 'NO_SEC_KEY') {
        getNewKeys = true;
      } else {
        throw err;
      }
    }
    const {RNRandomBytes} = NativeModules;
    RNRandomBytes.randomBytes(32, (_, bytes) => {
      var pubKey = pubKeyOrig;
      var secKey = secKeyOrig;

      if (getNewKeys) {
        seed = Buffer.from(bytes, 'base64');
        var keypair = sign.keyPair.fromSeed(seed);
        secKey = new Buffer(keypair.secretKey).toString('base64');
        pubKey = new Buffer(keypair.publicKey).toString('base64');
        saveItemSecure(this.getKeystoreAliasPubKey(), pubKey);
        saveItemSecure(this.getKeystoreAliasSecKey(), secKey);
      }

      this.requests
        .updateMethod(
          this.method,
          pubKey,
          true,
          false,
          null,
          this.algorithm,
          getOAuthToken,
        )
        .then((resp) => {
          if (getOAuthToken) {
            this.tokenHandler.storeTokens(resp.oauth_token);
          }
          onSuccess(resp);
        })
        .catch((err) => {
          console.log(err);
          var errMsg = err.msg ? err.msg : 'Something went wrong';
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
      try {
        var pubKey = await this.getPublicKey();
      } catch (e) {
        return false;
      }
      if (!pubKey || (pubKey && pubKey.length < 5)) {
        return false;
      }
      // Check enrolled method
      var resp = await this.requests.checkEnrolledMethod(this.method, pubKey);

      // return enrolled or not
      if (resp.enrolled && resp.method === this.method) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * Request authorization, either from a trusted device or non-trusted device
   * @param {string} event - Name tag of event (LOGIN, TRANSACTION, etc)
   * @param {successCallback} onSuccess
   * @param {errorCallback} onError
   * @param {Object} [authRequestText={}] - Customization texts for the Auth Request modal
   * @param {boolean} [getOAuthToken=false] - Whether or not to return oauth tokens
   */
  async requestAuth(
    event,
    onSuccess,
    onError,
    authRequestText = {},
    getOAuthToken = false,
  ) {
    var thisDeviceTrusted = await this.trustedDeviceEnrolled();
    if (thisDeviceTrusted) {
      await this.authorizeDevice(event, onSuccess, onError, getOAuthToken);
    } else {
      await this.requestAuthFromNonTrusted(
        event,
        onSuccess,
        onError,
        authRequestText,
        getOAuthToken,
      );
    }
  }
  /**
   * Authorize an event with this device, assuming this device is a trusted device
   * @param {string} event - Name tag of event (LOGIN, TRANSACTION, etc)
   * @param {boolean} [getOAuthToken=false] - Whether or not to return oauth tokens
   * @param {successCallback} onSuccess
   * @param {errorCallback} onError
   */
  async authorizeDevice(event, onSuccess, onError, getOAuthToken = false) {
    var timestamp = Math.round(new Date().getTime() / 1000).toString();
    var stringToSign = this.requests.constructApprovedEventMsg(
      event,
      timestamp,
      this.method,
    );
    try {
      var pubKey = await this.getPublicKey();
      var signature = await this.sign(stringToSign);
      var data = await this.requests.constructApprovedEventJSON(
        event,
        timestamp,
        this.method,
        signature,
        pubKey,
        this.algorithm,
      );
      var resp = await this.requests.createApprovedEventRequest(
        data,
        getOAuthToken,
      );
      console.log(resp);
      if (getOAuthToken === true) {
        this.tokenHandler.storeTokens(resp.oauth_token);
      }
      onSuccess(resp);
    } catch (err) {
      console.log(err);
      onError('Something went wrong', err);
    }
  }

  /**
   * Authorize an event with this device, assuming this device is a trusted device
   * @param {string} event - Name tag of event (LOGIN, TRANSACTION, etc)
   * @param {successCallback} onSuccess
   * @param {errorCallback} onError
   * @param {Object} [authRequestText={}] - Customization texts for the Auth Request modal
   * @param {boolean} [getOAuthToken=false] - Whether or not to return oauth tokens
   */
  async requestAuthFromNonTrusted(
    event,
    onSuccess,
    onError,
    authRequestText = {},
    getOAuthToken = false,
  ) {
    var timestamp = Math.round(new Date().getTime() / 1000).toString();
    try {
      var data = await this.requests.constructEventJSON(
        event,
        timestamp,
        this.method,
      );
      var resp = await this.requests.createPendingEventRequest(data);
      console.log(resp);
      CotterAuthModal.showAuthRequest(
        authRequestText,
        resp.ID,
        this,
        onSuccess,
        onError,
        getOAuthToken,
      );
    } catch (err) {
      onError('Something went wrong', err);
    }
  }

  /**
   * Check if there's new event request for this user, and show modal
   * to approve the request if needed.
   * @param {Object} [authApproveText={}] - Customization texts for the Auth Approve modal
   */
  async getNewEvent(authApproveText = {}) {
    var thisDeviceTrusted = await this.trustedDeviceEnrolled();
    if (thisDeviceTrusted) {
      try {
        var resp = await this.requests.getNewEvent();
        console.log(resp);
        if (resp) CotterAuthModal.showAuthApprove(authApproveText, this, resp);
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  }

  /**
   * Approve or reject an authentication request
   * @param {Object} ev - Event object to approve/reject
   * @param {boolean} approve - Event object to approve/reject
   */
  async approveEvent(ev, approve) {
    var stringToSign = this.requests.constructRespondEventMsg(
      ev.event,
      ev.timestamp,
      this.method,
      approve,
    );
    try {
      var pubKey = await this.getPublicKey();
      var signature = await this.sign(stringToSign);
      var data = this.requests.constructRespondEventJSON(
        ev,
        this.method,
        signature,
        pubKey,
        this.algorithm,
        approve,
      );
      var resp = await this.requests.createRespondEventRequest(ev.ID, data);
      console.log('RESPOND', resp);
      return resp;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  /**
   * Show QR Code of this device to be scanned by the Trusted Device
   * Once scanned, this device becomes a Trusted Device
   * @param {successCallback} onSuccess
   * @param {errorCallback} onError
   * @param {Object} [showQRText={}] - Customization texts for the Show QR Code modal
   */
  async trustThisDevice(onSuccess, onError, showQRText = {}) {
    var timeNow = Math.floor(new Date().getTime() / 1000);
    var qrTextNoKey = `:${this.algorithm}:${this.apiKeyID}:${this.userID}:${timeNow}`;
    try {
      var pubKey = await this.getPublicKey();
      if (pubKey && pubKey.length > 5) {
        CotterAuthModal.showQRCode(
          showQRText,
          this,
          pubKey + qrTextNoKey,
          onSuccess,
          onError,
        );
        return;
      }
    } catch (e) {
      const {RNRandomBytes} = NativeModules;
      RNRandomBytes.randomBytes(32, (_, bytes) => {
        seed = Buffer.from(bytes, 'base64');

        var keypair = sign.keyPair.fromSeed(seed);
        const secKey = new Buffer(keypair.secretKey).toString('base64');
        const pubKey = new Buffer(keypair.publicKey).toString('base64');
        saveItemSecure(this.getKeystoreAliasPubKey(), pubKey);
        saveItemSecure(this.getKeystoreAliasSecKey(), secKey);

        CotterAuthModal.showQRCode(
          showQRText,
          this,
          pubKey + qrTextNoKey,
          onSuccess,
          onError,
        );
      });
    }
  }

  /**
   * Scan QR Code of the new device to be enrolled
   * Once scanned, the new device becomes a Trusted Device
   * @param {string} appName - Your App Name to show when asking permission for camera
   * @param {Object} [scanQRText={}] - Customization texts for the Scan QR Code modal
   */
  async scanQRCode(scanQRText = {}) {
    CotterAuthModal.showQRScan(scanQRText, this);
    return;
  }

  /**
   * Enroll Other Device after scanning QR Code
   * Once scanned the QR Code, the new device becomes a Trusted Device
   * @param {string} newKeyAndAlgo - New public key and algorithm
   * @throws {string} error message
   * @returns {Object} response object
   * @throws {Object} - http error response
   */
  async enrollOtherDevice(newKeyAndAlgo) {
    console.log('newKeyAndAlgo', newKeyAndAlgo);
    var newKeys = newKeyAndAlgo.split(':');
    if (newKeys.length < 5) {
      throw 'enrollOtherDevice, invalid newPublicKeyAndAlgo string. Should be of format <publickey>:<algo>:<issuer>:<userid>:<timestamp>';
    }

    var newPublicKey = newKeys[0];
    var newAlgo = newKeys[1];
    var newIssuer = newKeys[2];
    var newUserID = newKeys[3];
    var newTimeStamp = parseInt(newKeys[4]);

    // Check if QR Code expired
    var timeNow = Math.floor(new Date().getTime() / 1000);
    var timeExpire = 60 * 3; // in seconds
    if (newTimeStamp < timeNow - timeExpire) {
      throw (
        'The QR Code is expired. Current timestamp = ' +
        timestamp +
        ', QRCode was created at ' +
        newTimeStamp
      );
    }

    // Check if issuer == api key id
    if (newIssuer != this.apiKeyID) {
      throw 'This QR Code belongs to another app, and cannot be registered for this app.';
    }

    // check if user id == user id
    if (newUserID != this.userID) {
      throw 'This QR Code belongs to another user, and cannot be registered for this user.';
    }

    try {
      var event = 'ENROLL_NEW_TRUSTED_DEVICE';
      var stringToSign =
        this.requests.constructApprovedEventMsg(
          event,
          timeNow + '',
          this.method,
        ) + newPublicKey;
      var signature = await this.sign(stringToSign);
      var pubKey = await this.getPublicKey();
      var req = await this.requests.constructRegisterNewDeviceJSON(
        event,
        timeNow + '',
        this.method,
        signature,
        pubKey,
        this.algorithm,
        newPublicKey,
        newAlgo,
      );
      var resp = await this.requests.createApprovedEventRequest(req);
      return resp;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Remove Device from trusted devices
   * @returns {Object} - response
   * @throws {string} - error message
   */
  async removeDevice() {
    var thisDeviceTrusted = await this.trustedDeviceEnrolled();
    if (thisDeviceTrusted) {
      try {
        var pubKey = await this.getPublicKey();
        var resp = await this.requests.deleteMethod(this.method, pubKey);
        return resp;
      } catch (err) {
        var errMsg = err.msg ? err.msg : 'Something went wrong';
        throw errMsg;
      }
    } else {
      throw 'This device is not a trusted device';
    }
  }
}

export default TrustedDevice;
