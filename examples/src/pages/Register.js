import React, {PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import {Verify, Cotter} from 'react-native-cotter';
import colors from '../assets/colors';
import {Title} from '../components/Text';
import {Button, ButtonImage, ButtonContainer} from '../components/Button';
import {InputContainer, InputLabel, InputText} from '../components/Input';
import {
  API_KEY_ID,
  API_SECRET_KEY,
  USER_ID,
  COTTER_JS_URL,
  COTTER_BASE_URL,
} from '../apiKeys';

const winHeight = Dimensions.get('window').height;
const helloLogo = require('../assets/images/hello-logo.png');

class Register extends PureComponent {
  state = {
    email: '',
    loading: false,
    ip: null,
    secKey: null,
    response: null,
    userID: null,
  };
  continue = async () => {
    var verify = new Verify(
      'myexample://auth_callback',
      API_KEY_ID,
      this.onError,
      this.onSuccess,
      (getOAuthToken = true),
    );
    await verify.openAuthWithInput('EMAIL', this.state.email);
  };

  onError = (errorMessage, error) => {
    alert(errorMessage);
    console.log(error);
  };

  onSuccess = async response => {
    console.log(response);
    this.setState({response});

    // 1️⃣ Validating the response
    if (Cotter.validateIdentityResponse(response.token)) {
      // 2️⃣ (Optional) Register your user to your backend
      try {
        var userID = await this.registerUserToBackend(response);

        this.setState({userID: userID});
        console.log('User id', userID);

        // 3️⃣ Initialize Cotter with your User ID and email/phone number (this is an array)
        var cotter = new Cotter(
          API_KEY_ID,
          userID, // user id can just be the user's email if you want => but your user can't update their email if you do this
          [response.token.identifier],
        );
        // 4️⃣ Enroll device as Trusted Device
        cotter.trustedDevice.enrollDevice(
          this.onEnrollSuccess,
          this.onEnrollError,
          (getOAuthToken = true),
        );
      } catch (err) {
        Alert.alert('Registering to backend error', err.err.msg);
        console.log('Registering to backend error:', err.err);
      }
    } else {
      Alert.alert('Invalid Cotter Token');
      console.log('Invalid Cotter Token:', response.token);
    }
  };

  onEnrollSuccess = resp => {
    console.log(resp);
    this.props.navigation.navigate('RegisterSuccess', {
      trustedDeviceResp: resp,
      verifyResp: this.state.response,
      userID: this.state.userID,
    });
  };
  onEnrollError = err => {
    alert(err);
    console.log(err);
  };

  // This is an example on how you can register your user to your backend server
  registerUserToBackend = async payload => {
    console.log('Registering to backend');
    try {
      const response = await fetch(
        'https://0eexu.sse.codesandbox.io/users/register', // This is an example API endpoint. Use your server's endpoint instead
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw data;
      }
      if (!data.new_user) {
        throw {msg: 'User already exist', err: null};
      }
      // Return back the User ID registered in your backend.
      // RECOMMENDED: Use an unchanging user ID so users can
      // update their email/phone number.
      return data.user.id;
    } catch (err) {
      var errmsg = err.error ? err.error : null;
      throw {msg: errmsg, err: err};
    }
  };
  render() {
    return (
      <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <Image source={helloLogo} style={styles.logo} />
            <Title style={{fontSize: 20, alignSelf: 'flex-start'}}>
              Welcome to
            </Title>
            <Title
              style={{
                fontSize: 35,
                color: colors.purple,
                alignSelf: 'flex-start',
              }}>
              Hello App
            </Title>
            <InputContainer style={{paddingTop: 60}}>
              <InputLabel style={{fontSize: 20}}>Email</InputLabel>
              <InputText
                placeholder={'e.g. email@example.com'}
                style={{fontSize: 17}}
                value={this.state.email}
                onChangeText={text => this.setState({email: text})}
                autoCapitalize="none"
              />
            </InputContainer>
            <ButtonContainer>
              <ButtonImage
                onPress={this.continue}
                backgroundColor={colors.purple}
                color={colors.invertTextColor}>
                <Title style={[styles.text, {textAlign: 'center'}]}>
                  Sign Up
                </Title>
              </ButtonImage>
            </ButtonContainer>
          </View>
        </TouchableWithoutFeedback>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: winHeight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '40%',
    backgroundColor: colors.backgroundColor,
    padding: 20,
  },
  buttonImage: {
    width: 50,
    height: 50,
    marginTop: -5,
    borderWidth: 0,
    borderColor: 'rgba(0,0,0,0)',
  },
  placeholder: {
    alignSelf: 'center',
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  text: {
    fontSize: 22,
    paddingLeft: 10,
    alignSelf: 'center',
    color: colors.white,
  },
  textSmall: {
    fontSize: 10,
  },
  button: {
    marginTop: 20,
  },
  logo: {
    height: 70,
    width: 70,
    marginBottom: 50,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
});
export default Register;
