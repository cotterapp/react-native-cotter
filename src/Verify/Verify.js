import {Linking, Alert} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import VerifyManager from './VerifyManager';
import {sha256} from 'react-native-sha256';
import {generateSecureRandom} from 'react-native-securerandom';
import {Buffer} from 'buffer';
import {hexToBytes} from './utils';
import Constants from '../Constants';

class Verify {
  static defaultPhoneChannels = ['SMS'];

  static emailType = 'EMAIL';
  static phoneType = 'PHONE';
  static smsChannel = 'SMS';
  static whatsappChannel = 'WHATSAPP';
  static emailChannel = 'EMAIL';
  static validPhoneChannels = ['SMS', 'WHATSAPP'];
  static magicLinkMethod = 'MAGIC_LINK';
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
   * @param {string} callbackURL
   * @param {string} apiKeyID
   * @param {errorCallback} onError
   * @param {successCallback} onSuccess
   * @param {boolean} [getOAuthToken=false] - Whether or not to return oauth tokens
   */
  constructor(callbackURL, apiKeyID, onError, onSuccess, getOAuthToken = true) {
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

  constructURLPath(
    identifierType,
    phoneChannels,
    cotterUserID = null,
    authMethod = null,
  ) {
    var url = `${Constants.JSBaseURL}?api_key=${this.apiKeyID}`;
    url = url + `&redirect_url=${this.callbackURL}`;
    url = url + `&type=${identifierType}`;
    url = url + `&code_challenge=${this.codeChallenge}`;
    url = url + `&state=${this.state}`;

    if (phoneChannels && phoneChannels.length > 0) {
      phoneChannels.forEach((c) => (url = url + `&phone_channels[]=${c}`));
    }
    if (cotterUserID && cotterUserID.length > 0) {
      url = url + `&cotter_user_id=${cotterUserID}`;
    }
    if (authMethod && authMethod.length > 0) {
      url = url + `&auth_method=${authMethod}`;
    }
    return url;
  }

  constructURLPathWithInput(
    identifierType,
    identifier,
    channel,
    cotterUserID = null,
    authMethod = null,
  ) {
    var url = `${Constants.JSBaseURL}?direct_login=true`;
    url = url + `&api_key=${this.apiKeyID}`;
    url = url + `&redirect_url=${this.callbackURL}`;
    url = url + `&type=${identifierType}`;
    url = url + `&code_challenge=${this.codeChallenge}`;
    url = url + `&state=${this.state}`;
    url = url + `&input=${encodeURIComponent(identifier)}`;

    if (channel && channel.length > 0) {
      url = url + `&use_channel=${channel}`;
    }
    if (cotterUserID && cotterUserID.length > 0) {
      url = url + `&cotter_user_id=${cotterUserID}`;
    }
    if (authMethod && authMethod.length > 0) {
      url = url + `&auth_method=${authMethod}`;
    }
    return url;
  }

  // Public Functions
  /**
   * @param {string} identifierType
   * @param {Array} [phoneChannels=["SMS"]] - (For type PHONE) options for user: ["SMS"] or ["SMS", "WHATSAPP"] or ["WHATSAPP"]
   * @param {string} [cotterUserID = null] - Verifying the identifier of an existing user
   * @param {string} [authMethod = null] - Magic Link or OTP
   */
  async openAuth(
    identifierType,
    phoneChannels = defaultPhoneChannels,
    cotterUserID = null,
    authMethod = null,
  ) {
    if (!Array.isArray(phoneChannels)) {
      throw new Error(
        'Phone channels have to be an array. Ex. ["SMS", "WHATSAPP"]',
      );
    }
    phoneChannels.forEach((v) => {
      if (!Verify.validPhoneChannels.includes(v)) {
        this.onError(
          `Invalid phone channel ${v}. Allowed channels are ${Verify.smsChannel} and ${Verify.whatsappChannel}`,
        );
        throw new Error(
          `Invalid phone channel ${v}. Allowed channels are ${Verify.smsChannel} and ${Verify.whatsappChannel}`,
        );
      }
    });

    await this.generateCodeVerifierAndChallenge();
    try {
      const url = this.constructURLPath(
        identifierType,
        identifierType === 'PHONE' ? phoneChannels : null,
        cotterUserID,
        authMethod,
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
   * @param {string} [cotterUserID = null] - Verifying the identifier of an existing user
   * @param {string} [authMethod = null] - Magic Link or OTP
   */
  async openAuthWithInput(
    identifierType,
    identifier,
    channel = Verify.smsChannel,
    cotterUserID = null,
    authMethod = null,
  ) {
    if (!Verify.validPhoneChannels.includes(channel)) {
      this.onError(
        `Invalid phone channel ${channel}. Allowed channels are ${Verify.smsChannel} and ${Verify.whatsappChannel}`,
      );
      throw new Error(
        `Invalid phone channel ${channel}. Allowed channels are ${Verify.smsChannel} and ${Verify.whatsappChannel}`,
      );
    }

    await this.generateCodeVerifierAndChallenge();
    try {
      var url = this.constructURLPathWithInput(
        identifierType,
        identifier,
        identifierType === 'PHONE' ? channel : null,
        cotterUserID,
        authMethod,
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
