import Verify from './Verify';

class VerifyManager {
  static Registry = {};
  /**
   * @param {Verify} verifyRequest
   * @param {string} state
   */
  static addRegistry(verifyRequest, state) {
    VerifyManager.Registry[state] = verifyRequest;
  }

  /**
   * @param {string} state
   * @returns {Verify}
   */
  static getRegistry(state) {
    return VerifyManager.Registry[state];
  }
}

VerifyManager.Registry = {};

export default VerifyManager;
