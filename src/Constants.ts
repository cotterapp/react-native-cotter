const COTTER_BASE_URL: string = 'https://www.cotter.app/api/v0';
const COTTER_JS_BASE_URL: string = 'https://js.cotter.app/app';

class Constants {
  static BaseURL: string = COTTER_BASE_URL;
  static JSBaseURL: string = COTTER_JS_BASE_URL;

  static setBaseURL(baseURL: string) {
    Constants.BaseURL = baseURL;
  }

  static setJSBaseURL(jsBaseURL: string) {
    Constants.JSBaseURL = jsBaseURL;
  }
}

Constants.BaseURL = COTTER_BASE_URL;
Constants.JSBaseURL = COTTER_JS_BASE_URL;

export default Constants;
