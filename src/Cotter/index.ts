import TrustedDevice from '../TrustedDevice';
import TokenHandler from '../TokenHandler';
import { CotterIdentity } from 'cotter-token-js';
import { CotterIdentityInterface } from 'cotter-token-js/lib/CotterIdentity';
import CotterEvent, {
  CotterEventInterface,
} from 'cotter-token-js/lib/CotterEvent';
import Verify from '../Verify/Verify';
import { successCallback, errorCallback } from '../TrustedDevice/types';
import Requests from '../Requests';
import User from '../User';
import { errToString } from '../services/error';

class Cotter {
  apiKeyID: string;
  userID?: string;
  trustedDevice: TrustedDevice;
  tokenHandler: TokenHandler;

  constructor(
    apiKeyID: string,
    userID: string = null,
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

  logOut(): void {
    this.tokenHandler.removeTokens();
    User.removeLoggedInUser();
  }

  // ================================
  //            User
  // ================================
  async getLoggedInUser(): Promise<User> {
    return await User.getLoggedInUser();
  }

  // ================================
  //          Verify Email
  // ================================

  async signInWithEmailOTP(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: { email?: string },
  ) {
    return await this.signUpWithEmailOTP(
      callbackURL,
      onSuccess,
      onError,
      options,
      false,
    );
  }
  async signUpWithEmailOTP(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: { email?: string },
    signup: boolean = true,
  ) {
    const verify = new Verify(
      callbackURL,
      this.apiKeyID,
      onError,
      onSuccess,
      true,
    );
    if (options && options.email && options.email.length > 0) {
      if (signup) {
        try {
          let requests = new Requests(this.apiKeyID);
          var resp = await requests.getUserByIdentifier(options.email);
          if (
            resp &&
            resp.ID &&
            resp.ID != '00000000-0000-0000-0000-000000000000'
          ) {
            onError('User already exists');
            return;
          }
        } catch (err) {
          onError(errToString(err));
          return;
        }
      }
      return await verify.openAuthWithInput(
        Verify.emailType,
        options.email,
        Verify.smsChannel,
        null,
        null,
      );
    } else {
      return await verify.openAuth(
        Verify.emailType,
        Verify.defaultPhoneChannels,
        null,
        null,
      );
    }
  }

  async signInWithEmailLink(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: { email?: string },
  ) {
    return await this.signUpWithEmailLink(
      callbackURL,
      onSuccess,
      onError,
      options,
      false,
    );
  }
  async signUpWithEmailLink(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: { email?: string },
    signup: boolean = true,
  ) {
    const verify = new Verify(
      callbackURL,
      this.apiKeyID,
      onError,
      onSuccess,
      true,
    );
    if (options && options.email && options.email.length > 0) {
      if (signup) {
        try {
          let requests = new Requests(this.apiKeyID);
          var resp = await requests.getUserByIdentifier(options.email);
          if (
            resp &&
            resp.ID &&
            resp.ID != '00000000-0000-0000-0000-000000000000'
          ) {
            onError('User already exists');
            return;
          }
        } catch (err) {
          onError(errToString(err));
          return;
        }
      }
      return await verify.openAuthWithInput(
        Verify.emailType,
        options.email,
        Verify.smsChannel,
        null,
        Verify.magicLinkMethod,
      );
    } else {
      return await verify.openAuth(
        Verify.emailType,
        Verify.defaultPhoneChannels,
        null,
        Verify.magicLinkMethod,
      );
    }
  }

  // ================================
  //          Verify Phone
  // ================================
  async signInWithPhoneOTP(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: {
      phone?: string;
      channel?: string;
    },
  ) {
    return await this.signUpWithPhoneOTP(
      callbackURL,
      onSuccess,
      onError,
      options,
      false,
    );
  }
  async signUpWithPhoneOTP(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: {
      phone?: string;
      channel?: string;
    },
    signup: boolean = true,
  ) {
    const verify = new Verify(
      callbackURL,
      this.apiKeyID,
      onError,
      onSuccess,
      true,
    );
    if (options && options.phone && options.phone.length > 0) {
      if (signup) {
        try {
          let requests = new Requests(this.apiKeyID);
          var resp = await requests.getUserByIdentifier(options.phone);
          if (
            resp &&
            resp.ID &&
            resp.ID != '00000000-0000-0000-0000-000000000000'
          ) {
            onError('User already exists');
            return;
          }
        } catch (err) {
          onError(errToString(err));
          return;
        }
      }
      return await verify.openAuthWithInput(
        Verify.phoneType,
        options.phone,
        options.channel,
        null,
        null,
      );
    } else {
      return await verify.openAuth(
        Verify.phoneType,
        Verify.defaultPhoneChannels,
        null,
        null,
      );
    }
  }

  async signInWithPhoneLink(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: {
      phone?: string;
      channel?: string;
    },
  ) {
    return await this.signUpWithPhoneLink(
      callbackURL,
      onSuccess,
      onError,
      options,
      false,
    );
  }
  async signUpWithPhoneLink(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
    options?: {
      phone?: string;
      channel?: string;
    },
    signup: boolean = true,
  ) {
    const verify = new Verify(
      callbackURL,
      this.apiKeyID,
      onError,
      onSuccess,
      true,
    );
    if (options && options.phone && options.phone.length > 0) {
      if (signup) {
        try {
          let requests = new Requests(this.apiKeyID);
          var resp = await requests.getUserByIdentifier(options.phone);
          if (
            resp &&
            resp.ID &&
            resp.ID != '00000000-0000-0000-0000-000000000000'
          ) {
            onError('User already exists');
            return;
          }
        } catch (err) {
          onError(errToString(err));
          return;
        }
      }
      return await verify.openAuthWithInput(
        Verify.phoneType,
        options.phone,
        options.channel,
        null,
        Verify.magicLinkMethod,
      );
    } else {
      return await verify.openAuth(
        Verify.phoneType,
        Verify.defaultPhoneChannels,
        null,
        Verify.magicLinkMethod,
      );
    }
  }

  // ================================
  //        Device Based Auth
  // ================================

  async signUpWithDevice(
    identifier: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const requests = new Requests(this.apiKeyID);
    var resp: any;
    try {
      resp = await requests.registerUserToCotter([], identifier);
    } catch (e) {
      onError(errToString(e));
      return;
    }
    var user = new User(resp);
    const trustDev = new TrustedDevice(this.apiKeyID, null, [], user.ID);

    this.userID = user.client_user_id;
    this.trustedDevice = trustDev;
    this.tokenHandler = new TokenHandler(this.apiKeyID, user.client_user_id);

    await trustDev.enrollDeviceWithCotterUserID(
      user.ID,
      onSuccess,
      onError,
      true,
    );
  }

  async signInWithDevice(
    identifier: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const requests = new Requests(this.apiKeyID);
    var resp: any;
    try {
      resp = await requests.getUserByIdentifier(identifier);
    } catch (e) {
      onError(errToString(e));
      return;
    }
    var user = new User(resp);
    const trustDev = new TrustedDevice(
      this.apiKeyID,
      user.client_user_id,
      [],
      user.ID,
    );
    this.userID = user.client_user_id;
    this.trustedDevice = trustDev;
    this.tokenHandler = new TokenHandler(this.apiKeyID, user.client_user_id);
    await trustDev.requestAuth('LOGIN', onSuccess, onError, null, true);
  }
}

export default Cotter;
