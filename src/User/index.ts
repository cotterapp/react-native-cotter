import {
  saveItemSecure,
  getItemSecure,
  removeItemSecure,
} from '../services/deviceStorage';
import Cotter from '../Cotter';
import {successCallback, errorCallback} from '../TrustedDevice/types';
import Verify from '../Verify/Verify';
import TrustedDevice from '../TrustedDevice';
import UserHandler, {CotterUserInterface} from './handler';

class User {
  ID: string;
  issuer: string;
  client_user_id: string;
  enrolled: string[];
  identifier: string;

  constructor(user: CotterUserInterface) {
    this.ID = user.ID;
    this.issuer = user.issuer;
    this.client_user_id = user.client_user_id;
    this.enrolled = user.enrolled;
    this.identifier = user.identifier;
  }

  static async getLoggedInUser(): Promise<User> {
    var usr = await UserHandler.getLoggedInUser();
    return new User(usr);
  }

  static removeLoggedInUser(): void {
    UserHandler.removeLoggedInUser();
  }
  // =============================
  //        Trusted Device
  // =============================

  async registerDevice(onSuccess: successCallback, onError: errorCallback) {
    const trustDev = new TrustedDevice(this.issuer, null, [], this.ID);
    return await trustDev.enrollDeviceWithCotterUserID(
      this.ID,
      onSuccess,
      onError,
      true,
    );
  }

  async isThisDeviceTrusted(): Promise<boolean> {
    const trustDev = new TrustedDevice(
      this.issuer,
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
      this.issuer,
      this.client_user_id,
      [],
      this.ID,
    );
    return await trustDev.trustThisDevice(onSuccess, onError);
  }

  async checkNewSignInRequest(): Promise<void> {
    const trustDev = new TrustedDevice(
      this.issuer,
      this.client_user_id,
      [],
      this.ID,
    );
    return await trustDev.getNewEvent();
  }

  async scanQRCode(scanQRText: Object = {}) {
    const trustDev = new TrustedDevice(
      this.issuer,
      this.client_user_id,
      [],
      this.ID,
    );

    return await trustDev.scanQRCode(scanQRText);
  }

  async removeDevice(): Promise<any> {
    const trustDev = new TrustedDevice(
      this.issuer,
      this.client_user_id,
      [],
      this.ID,
    );
    return await trustDev.removeDevice();
  }
  // =============================
  //      Verify Email
  // =============================
  async verifyEmailWithLink(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const verify = new Verify(
      callbackURL,
      this.issuer,
      onError,
      onSuccess,
      true,
    );
    return await verify.openAuthWithInput(
      Verify.emailType,
      this.identifier,
      Verify.smsChannel,
      null,
      Verify.magicLinkMethod,
    );
  }

  async verifyEmailWithOTP(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const verify = new Verify(
      callbackURL,
      this.issuer,
      onError,
      onSuccess,
      true,
    );
    return await verify.openAuthWithInput(
      Verify.emailType,
      this.identifier,
      Verify.smsChannel,
      null,
      null,
    );
  }

  // =============================
  //      Verify SMS
  // =============================
  async verifyPhoneWithOTPViaSMS(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const verify = new Verify(
      callbackURL,
      this.issuer,
      onError,
      onSuccess,
      true,
    );
    return await verify.openAuthWithInput(
      Verify.phoneType,
      this.identifier,
      Verify.smsChannel,
      null,
      null,
    );
  }

  async verifyPhoneWithLinkViaSMS(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const verify = new Verify(
      callbackURL,
      this.issuer,
      onError,
      onSuccess,
      true,
    );
    return await verify.openAuthWithInput(
      Verify.phoneType,
      this.identifier,
      Verify.smsChannel,
      null,
      Verify.magicLinkMethod,
    );
  }

  // =============================
  //      Verify WhatsApp
  // =============================

  async verifyPhoneWithOTPViaWhatsApp(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const verify = new Verify(
      callbackURL,
      this.issuer,
      onError,
      onSuccess,
      true,
    );
    return await verify.openAuthWithInput(
      Verify.phoneType,
      this.identifier,
      Verify.whatsappChannel,
      null,
      null,
    );
  }

  async verifyPhoneWithLinkViaWhatsApp(
    callbackURL: string,
    onSuccess: successCallback,
    onError: errorCallback,
  ) {
    const verify = new Verify(
      callbackURL,
      this.issuer,
      onError,
      onSuccess,
      true,
    );
    return await verify.openAuthWithInput(
      Verify.phoneType,
      this.identifier,
      Verify.whatsappChannel,
      null,
      Verify.magicLinkMethod,
    );
  }
}

export default User;
