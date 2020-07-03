import {
  saveItemSecure,
  getItemSecure,
  removeItemSecure,
} from '../services/deviceStorage';
import Cotter from '../Cotter';
import {successCallback, errorCallback} from '../TrustedDevice/types';
import Verify from '../Verify/Verify';
import TrustedDevice from '../TrustedDevice';

const USER_STORAGE = 'COTTER_USER_STORAGE';

class User {
  ID: string;
  issuer: string;
  client_user_id: string;
  enrolled: string[];
  identifier: string;
  cotter: Cotter;

  constructor(user: {
    ID: string;
    issuer: string;
    client_user_id: string;
    enrolled: string[];
    identifier: string;
  }) {
    this.ID = user.ID;
    this.issuer = user.issuer;
    this.client_user_id = user.client_user_id;
    this.enrolled = user.enrolled;
    this.identifier = user.identifier;
  }

  withCotter(cotter: Cotter): User {
    this.cotter = cotter;
    return this;
  }

  async store() {
    console.log('saving user');
    await saveItemSecure(USER_STORAGE, JSON.stringify(this));
  }

  static async getLoggedInUser(cotter: Cotter): Promise<User> {
    var user = await getItemSecure(USER_STORAGE);
    return new User(JSON.parse(user)).withCotter(cotter);
  }

  // =============================
  //        Trusted Device
  // =============================

  async registerDevice(onSuccess: successCallback, onError: errorCallback) {
    const trustDev = new TrustedDevice(this.cotter.apiKeyID, null, [], this.ID);
    return await trustDev.enrollDeviceWithCotterUserID(
      this.ID,
      onSuccess,
      onError,
      true,
    );
  }

  async isThisDeviceTrusted(): Promise<boolean> {
    const trustDev = new TrustedDevice(
      this.cotter.apiKeyID,
      this.client_user_id,
      [],
      this.ID,
    );
    return await trustDev.trustedDeviceEnrolled();
  }

  async trustThisDevice(
    onSuccess: successCallback,
    onError: errorCallback,
  ): Promise<void> {
    const trustDev = new TrustedDevice(
      this.cotter.apiKeyID,
      this.client_user_id,
      [],
      this.ID,
    );
    return await trustDev.trustThisDevice(onSuccess, onError);
  }

  async checkNewSignInRequest(): Promise<void> {
    const trustDev = new TrustedDevice(
      this.cotter.apiKeyID,
      this.client_user_id,
      [],
      this.ID,
    );
    return await trustDev.getNewEvent();
  }

  async scanQRCode(scanQRText: Object = {}) {
    const trustDev = new TrustedDevice(
      this.cotter.apiKeyID,
      this.client_user_id,
      [],
      this.ID,
    );

    return await trustDev.scanQRCode(scanQRText);
  }

  async removeDevice(): Promise<any> {
    const trustDev = new TrustedDevice(
      this.cotter.apiKeyID,
      this.client_user_id,
      [],
      this.ID,
    );
    return await trustDev.removeDevice();
  }
  // =============================
  //      Verify Email/Phone
  // =============================
  async verifyEmailWithLink(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    return await this.cotter.signInWithEmailLink(
      callbackURL,
      onSuccess,
      onError,
      {email: this.identifier},
    );
  }

  async verifyEmailWithOTP(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    return await this.cotter.signInWithEmailOTP(
      callbackURL,
      onSuccess,
      onError,
      {email: this.identifier},
    );
  }

  async verifyPhoneWithLinkViaSMS(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    return await this.cotter.signInWithPhoneLink(
      callbackURL,
      onSuccess,
      onError,
      {phone: this.identifier, channel: Verify.smsChannel},
    );
  }

  async verifyPhoneWithLinkViaWhatsApp(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    return await this.cotter.signInWithPhoneLink(
      callbackURL,
      onSuccess,
      onError,
      {phone: this.identifier, channel: Verify.whatsappChannel},
    );
  }
}

export default User;
