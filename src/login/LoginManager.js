import Login from './Login';

class LoginManager {
  static getOAuthToken = false;
  static LoginRegistry = {};
  /**
   * @param {Login} loginRequest
   * @param {string} state
   */
  static addLoginRegistry(loginRequest, state) {
    LoginManager.LoginRegistry[state] = loginRequest;
  }

  /**
   * @param {string} state
   * @returns {Login}
   */
  static getLoginRegistry(state) {
    return LoginManager.LoginRegistry[state];
  }

  /**
   * @param {boolean} getOAuthToken
   */
  static setGetOAuthToken(getOAuthToken) {
    LoginManager.getOAuthToken = getOAuthToken;
  }

  /**
   * @returns {boolean}
   */
  static getGetOAuthToken() {
    return LoginManager.getOAuthToken;
  }
}

LoginManager.LoginRegistry = {};
LoginManager.getOAuthToken = false;

export default LoginManager;
