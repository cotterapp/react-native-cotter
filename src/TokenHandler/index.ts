import {
  saveItemSecure,
  getItemSecure,
  removeItemSecure,
} from '../services/deviceStorage';
import {CotterAccessToken, CotterIDToken} from 'cotter-jwt-js';
import Requests from '../Requests';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';
const ID_TOKEN_KEY = 'ID_TOKEN';
const TOKEN_TYPE_KEY = 'TOKEN_TYPE';

interface OAuthToken {
  access_token: string;
  id_token: string;
  token_type: string;
  refresh_token: string;
}

export default class TokenHandler {
  accessToken: string;
  idToken: string;
  tokenType: string;
  refreshToken: string;
  baseURL: string;
  apiKeyID: string;
  apiSecretKey: string;
  userID: string;
  requests: Requests;

  constructor(
    baseURL: string,
    apiKeyID: string,
    apiSecretKey?: string,
    userID?: string,
  ) {
    this.baseURL = baseURL;
    this.apiKeyID = apiKeyID;
    this.apiSecretKey = apiSecretKey;
    this.userID = userID;
    this.requests = new Requests(baseURL, apiKeyID, apiSecretKey, userID);
  }

  storeTokens(oauthTokens: OAuthToken) {
    console.log('Storing Tokens');
    if (oauthTokens === null || oauthTokens === undefined) {
      throw new Error('oauthTokens are not specified (null or undefined)');
    }
    this.setAccessToken(oauthTokens.access_token);
    this.setIDToken(oauthTokens.id_token);
    this.setTokenType(oauthTokens.token_type);
    if (oauthTokens.refresh_token && oauthTokens.refresh_token.length > 0) {
      saveItemSecure(REFRESH_TOKEN_KEY, oauthTokens.refresh_token);
    }
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    saveItemSecure(ACCESS_TOKEN_KEY, accessToken);
  }

  async getAccessToken(): Promise<CotterAccessToken> {
    let accessToken: string | undefined;
    if (this.accessToken && this.accessToken.length > 0) {
      accessToken = this.accessToken;
    } else {
      accessToken = await getItemSecure(ACCESS_TOKEN_KEY);
    }
    if (!accessToken || accessToken.length <= 0) {
      throw new Error('Access token is not in storage');
    }
    var accessTok = new CotterAccessToken(accessToken);

    // if Access token already expired: refetch new token
    if (accessTok.getExpiration() < new Date().getTime() / 1000) {
      accessToken = await this.getTokensFromRefreshToken();
    }
    return new CotterAccessToken(accessToken);
  }

  setIDToken(idToken: string) {
    this.idToken = idToken;
    saveItemSecure(ID_TOKEN_KEY, idToken);
  }

  async getIDToken(): Promise<CotterIDToken> {
    let idToken: string | undefined;
    if (this.idToken && this.idToken.length > 0) {
      idToken = this.idToken;
    } else {
      idToken = await getItemSecure(ID_TOKEN_KEY);
    }
    if (!idToken || idToken.length <= 0) {
      throw new Error('ID token is not in storage');
    }
    return new CotterIDToken(idToken);
  }

  setTokenType(tokenType: string) {
    this.tokenType = tokenType;
    saveItemSecure(TOKEN_TYPE_KEY, tokenType);
  }

  async getTokenType(): Promise<string> {
    let tokenType: string | undefined;
    if (this.tokenType && this.tokenType.length > 0) {
      tokenType = this.tokenType;
    } else {
      tokenType = await getItemSecure(TOKEN_TYPE_KEY);
    }
    if (!tokenType || tokenType.length <= 0) {
      throw new Error('Token type is not in storage');
    }
    return tokenType;
  }

  async getRefreshToken(): Promise<string> {
    return await getItemSecure(REFRESH_TOKEN_KEY);
  }

  // Returns access token
  async getTokensFromRefreshToken(): Promise<string> {
    console.log('Refreshing token');
    try {
      var refreshToken = await this.getRefreshToken();
      var resp = await this.requests.getTokensFromRefreshToken(refreshToken);
      this.storeTokens(resp);
      return resp.access_token;
    } catch (err) {
      throw err;
    }
  }

  // Remove all tokens from storage
  removeTokens() {
    console.log('Removing Tokens');
    removeItemSecure(ACCESS_TOKEN_KEY);
    removeItemSecure(ID_TOKEN_KEY);
    removeItemSecure(TOKEN_TYPE_KEY);
    removeItemSecure(REFRESH_TOKEN_KEY);
    this.accessToken = '';
    this.idToken = '';
    this.tokenType = '';
    this.refreshToken = '';
  }
}
