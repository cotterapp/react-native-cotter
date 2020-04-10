import {Linking, Alert} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import VerifyManager from './VerifyManager';
import {sha256} from 'react-native-sha256';
import {generateSecureRandom} from 'react-native-securerandom';
import {Buffer} from 'buffer';
import {hexToBytes} from './utils';

const defaultPhoneChannels = ['SMS'];

const smsChannel = 'SMS';
const whatsappChannel = 'WHATSAPP';
const validPhoneChannels = [smsChannel, whatsappChannel];

class Verify {
  /**
   * This callback type is called `successCallback` and is displayed as a global symbol.
   * It receives an object of the loginResponse
   * @callback successCallback
   * @param {Object} loginResponse
   */
  /**
   * This callback type is called `errorCallback` and is displayed as a global symbol.
   * It receives an error message as string and a detailed error object, that may be empty
   * @callback errorCallback
   * @param {string} errorMessage
   * @param {Object} error
   */

  /**
   * @param {string} jsBaseURL
   * @param {string} callbackURL
   * @param {string} apiKeyID
   * @param {errorCallback} onError
   * @param {successCallback} onSuccess
   * @param {boolean} [getOAuthToken=false] - Whether or not to return oauth tokens
   */
  constructor(
    jsBaseURL,
    backendBaseURL,
    callbackURL,
    apiKeyID,
    onError,
    onSuccess,
    getOAuthToken = false,
  ) {
    this.jsBaseURL = jsBaseURL;
    this.backendBaseURL = backendBaseURL;
    this.callbackURL = callbackURL;
    this.apiKeyID = apiKeyID;
    this.state = this.generateState();
    this.onError = onError;
    this.onSuccess = onSuccess;
    this.getOAuthToken = getOAuthToken;
  }

  async generateCodeVerifierAndChallenge() {
    // generating code verifier
    var randomBytes = await generateSecureRandom(32);
    var codeVerifier = new Buffer(randomBytes).toString('base64');
    this.codeVerifier = codeVerifier;

    // generating code challenge
    var hashed = await sha256(codeVerifier);
    base64encoded = new Buffer(hexToBytes(hashed))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    this.codeChallenge = base64encoded;
  }

  generateState() {
    return Math.random().toString(36).substring(2, 15);
  }

  constructURLPath(identifierType, phoneChannels) {
    var url = `${this.jsBaseURL}?api_key=${this.apiKeyID}`;
    url = url + `&redirect_url=${this.callbackURL}`;
    url = url + `&type=${identifierType}`;
    url = url + `&code_challenge=${this.codeChallenge}`;
    url = url + `&state=${this.state}`;

    if (phoneChannels && phoneChannels.length > 0) {
      phoneChannels.forEach((c) => (url = url + `&phone_channels[]=${c}`));
    }
    return url;
  }

  constructURLPathWithInput(identifierType, identifier, channel) {
    var url = `${this.jsBaseURL}?direct_login=true`;
    url = url + `&api_key=${this.apiKeyID}`;
    url = url + `&redirect_url=${this.callbackURL}`;
    url = url + `&type=${identifierType}`;
    url = url + `&code_challenge=${this.codeChallenge}`;
    url = url + `&state=${this.state}`;
    url = url + `&input=${encodeURIComponent(identifier)}`;

    if (channel && channel.length > 0) {
      url = url + `&use_channel=${channel}`;
    }
    return url;
  }

  // Public Functions
  /**
   * @param {string} identifierType
   * @param {Array} [phoneChannels=["SMS"]] - (For type PHONE) options for user: ["SMS"] or ["SMS", "WHATSAPP"] or ["WHATSAPP"]
   */
  async openAuth(identifierType, phoneChannels = defaultPhoneChannels) {
    if (!Array.isArray(phoneChannels)) {
      throw new Error(
        'Phone channels have to be an array. Ex. ["SMS", "WHATSAPP"]',
      );
    }
    phoneChannels.forEach((v) => {
      if (!validPhoneChannels.includes(v)) {
        this.onError(
          `Invalid phone channel ${v}. Allowed channels are ${smsChannel} and ${whatsappChannel}`,
        );
        throw new Error(
          `Invalid phone channel ${v}. Allowed channels are ${smsChannel} and ${whatsappChannel}`,
        );
      }
    });

    await this.generateCodeVerifierAndChallenge();
    try {
      const url = this.constructURLPath(
        identifierType,
        identifierType === 'PHONE' ? phoneChannels : null,
      );
      this.authURL = url;
      console.log(url);
      VerifyManager.addRegistry(this, this.state);
      if (await InAppBrowser.isAvailable()) {
        InAppBrowser.openAuth(url, this.callbackURL, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          // Android Properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: true,
        }).then((response) => {
          if (response.type === 'success' && response.url) {
            Linking.openURL(response.url);
          }
        });
      } else Linking.openURL(url);
    } catch (error) {
      Linking.openURL(url);
    }
  }

  /**
   * @param {string} identifierType
   * @param {string} identifier
   * @param {string} [channel='SMS'] - (For type PHONE) Channel to use to send code to user
   */
  async openAuthWithInput(identifierType, identifier, channel = smsChannel) {
    if (!validPhoneChannels.includes(channel)) {
      this.onError(
        `Invalid phone channel ${channel}. Allowed channels are ${smsChannel} and ${whatsappChannel}`,
      );
      throw new Error(
        `Invalid phone channel ${channel}. Allowed channels are ${smsChannel} and ${whatsappChannel}`,
      );
    }

    await this.generateCodeVerifierAndChallenge();
    try {
      const url = this.constructURLPathWithInput(
        identifierType,
        identifier,
        identifierType === 'PHONE' ? channel : null,
      );
      this.authURL = url;
      console.log(url);
      VerifyManager.addRegistry(this, this.state);
      if (await InAppBrowser.isAvailable()) {
        InAppBrowser.openAuth(url, this.callbackURL, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          // Android Properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: true,
        }).then((response) => {
          if (response.type === 'success' && response.url) {
            Linking.openURL(response.url);
          }
        });
      } else Linking.openURL(url);
    } catch (error) {
      Linking.openURL(url);
    }
  }
}

export default Verify;
