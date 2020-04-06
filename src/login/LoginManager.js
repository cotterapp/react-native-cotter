import Login from './Login';

class LoginManager {
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
}

LoginManager.LoginRegistry = {};

export default LoginManager;
