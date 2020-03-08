import RNSecureStorage, {ACCESSIBLE} from 'rn-secure-storage';

const options = {accessible: ACCESSIBLE.WHEN_UNLOCKED};

export const saveItemSecure = (key, value, callback, errorCallback) =>
  RNSecureStorage.set(key, value, options).then(
    res => {
      if (callback) {
        callback(res);
      }
      return res;
    },
    err => {
      if (errorCallback) {
        errorCallback(err || 'Error');
      }
      return null;
    },
  );

export const getItemSecure = async key => {
  try {
    var value = await RNSecureStorage.get(key);
    console.log('get ' + key + ' ' + value);
    return value;
  } catch (err) {
    console.log('error get ' + key + ' ' + err);
    throw err;
  }
};

export const removeItemSecure = (key, callback, errorCallback) =>
  RNSecureStorage.remove(key)
    .then(val => {
      if (callback) {
        callback(val);
      }
      return val;
    })
    .catch(err => {
      if (errorCallback) {
        errorCallback(err.message || 'ERROR');
      }
      return null;
    });
