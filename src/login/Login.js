import {Linking, Alert} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import LoginManager from './LoginManager';
import {sha256} from 'react-native-sha256';
import {generateSecureRandom} from 'react-native-securerandom';
import {Buffer} from 'buffer';
import {hexToBytes} from './utils';

class Login {
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
   * @param {string} baseURL
   * @param {string} callbackURL
   * @param {string} apiKeyID
   * @param {errorCallback} onError
   * @param {successCallback} onSuccess
   * @param {boolean} [getOAuthToken=false] - Whether or not to return oauth tokens
   */
  constructor(
    baseURL,
    callbackURL,
    apiKeyID,
    onError,
    onSuccess,
    getOAuthToken = false,
  ) {
    this.baseURL = baseURL;
    this.callbackURL = callbackURL;
    this.apiKeyID = apiKeyID;
    this.state = this.generateState();
    this.onError = onError;
    this.onSuccess = onSuccess;
    LoginManager.setGetOAuthToken(getOAuthToken);
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

  constructURLPath(identifierType) {
    var url = `${this.baseURL}?api_key=${this.apiKeyID}`;
    url = url + `&redirect_url=${this.callbackURL}`;
    url = url + `&type=${identifierType}`;
    url = url + `&code_challenge=${this.codeChallenge}`;
    url = url + `&state=${this.state}`;
    return url;
  }

  constructURLPathWithInput(identifierType, identifier) {
    var url = `${this.baseURL}?direct_login=true`;
    url = url + `&api_key=${this.apiKeyID}`;
    url = url + `&redirect_url=${this.callbackURL}`;
    url = url + `&type=${identifierType}`;
    url = url + `&code_challenge=${this.codeChallenge}`;
    url = url + `&state=${this.state}`;
    url = url + `&input=${encodeURIComponent(identifier)}`;
    return url;
  }

  // Public Functions
  /**
   * @param {string} identifierType
   */
  async openAuth(identifierType) {
    await this.generateCodeVerifierAndChallenge();
    try {
      const url = this.constructURLPath(identifierType);
      this.authURL = url;
      console.log(url);
      LoginManager.addLoginRegistry(this, this.state);
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
   */
  async openAuthWithInput(identifierType, identifier) {
    await this.generateCodeVerifierAndChallenge();
    try {
      const url = this.constructURLPathWithInput(identifierType, identifier);
      this.authURL = url;
      console.log(url);
      LoginManager.addLoginRegistry(this, this.state);
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

export default Login;
