export interface successCallback {
  (response: Object): any;
}
export interface errorCallback {
  (errorMessage: string): any;
  (error: Object): any;
}
