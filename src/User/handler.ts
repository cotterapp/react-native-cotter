import {saveItemSecure, getItemSecure} from '../services/deviceStorage';

const USER_STORAGE = 'COTTER_USER_STORAGE';

export class CotterUserInterface {
  ID: string;
  issuer: string;
  client_user_id: string;
  enrolled: string[];
  identifier: string;
}

class UserHandler {
  static async store(user: CotterUserInterface) {
    console.log('saving user');
    await saveItemSecure(USER_STORAGE, JSON.stringify(user));
  }

  static async getLoggedInUser(): Promise<CotterUserInterface> {
    var user = await getItemSecure(USER_STORAGE);
    return JSON.parse(user);
  }
}

export default UserHandler;
