import TrustedDevice from '../TrustedDevice';
import TokenHandler from '../TokenHandler';
import {CotterIdentity} from 'cotter-token-js';
import {CotterIdentityInterface} from 'cotter-token-js/lib/CotterIdentity';
import CotterEvent, {
  CotterEventInterface,
} from 'cotter-token-js/lib/CotterEvent';

const DEV = true;
const STAGING = false;

const COTTER_BASE_URL: string = DEV
  ? 'http://localhost:1234/api/v0'
  : STAGING
  ? 'https://s.www.cotter.app/api/v0'
  : 'https://www.cotter.app/api/v0';

class Cotter {
  static BaseURL: string = COTTER_BASE_URL;
  baseURL: string;
  apiKeyID: string;
  apiSecretKey: string;
  userID: string;
  trustedDevice: TrustedDevice;
  tokenHandler: TokenHandler;

  constructor(
    baseURL: string,
    apiKeyID: string,
    apiSecretKey: string,
    userID: string,
    identifiers: Array<string> = [],
  ) {
    this.baseURL = baseURL;
    Cotter.BaseURL = baseURL;
    this.apiKeyID = apiKeyID;
    this.apiSecretKey = apiSecretKey;
    this.userID = userID;
    this.trustedDevice = new TrustedDevice(
      baseURL,
      apiKeyID,
      apiSecretKey,
      userID,
      identifiers,
    );
    this.tokenHandler = new TokenHandler(
      baseURL,
      apiKeyID,
      apiSecretKey,
      userID,
    );
  }

  static validateIdentityResponse(response: CotterIdentityInterface): boolean {
    return new CotterIdentity(response).validate();
  }

  static validateEventResponse(response: CotterEventInterface): boolean {
    return new CotterEvent(response).validate();
  }
}

Cotter.BaseURL = COTTER_BASE_URL;

export default Cotter;
