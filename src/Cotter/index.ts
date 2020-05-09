import TrustedDevice from '../TrustedDevice';
import TokenHandler from '../TokenHandler';
import {CotterIdentity} from 'cotter-token-js';
import {CotterIdentityInterface} from 'cotter-token-js/lib/CotterIdentity';
import CotterEvent, {
  CotterEventInterface,
} from 'cotter-token-js/lib/CotterEvent';

const COTTER_BASE_URL: string = 'https://www.cotter.app/api/v0';
const COTTER_JS_BASE_URL: string = 'https://js.cotter.app/app';

class Cotter {
  static BaseURL: string = COTTER_BASE_URL;
  static JSBaseURL: string = COTTER_JS_BASE_URL;
  apiKeyID: string;
  userID: string;
  trustedDevice: TrustedDevice;
  tokenHandler: TokenHandler;

  constructor(
    apiKeyID: string,
    userID: string,
    identifiers: Array<string> = [],
  ) {
    this.apiKeyID = apiKeyID;
    this.userID = userID;
    this.trustedDevice = new TrustedDevice(apiKeyID, userID, identifiers);
    this.tokenHandler = new TokenHandler(apiKeyID, userID);
  }

  static validateIdentityResponse(response: CotterIdentityInterface): boolean {
    return new CotterIdentity(response).validate();
  }

  static validateEventResponse(response: CotterEventInterface): boolean {
    return new CotterEvent(response).validate();
  }

  static setBaseURL(baseURL: string) {
    Cotter.BaseURL = baseURL;
  }

  static setJSBaseURL(jsBaseURL: string) {
    Cotter.JSBaseURL = jsBaseURL;
  }
}

Cotter.BaseURL = COTTER_BASE_URL;
Cotter.JSBaseURL = COTTER_JS_BASE_URL;

export default Cotter;
