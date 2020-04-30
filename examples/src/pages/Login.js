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
import {Cotter} from 'react-native-cotter';
import colors from '../assets/colors';
import {Title} from '../components/Text';
import {Button, ButtonImage, ButtonContainer} from '../components/Button';
import {InputContainer, InputLabel, InputText} from '../components/Input';
import {API_KEY_ID, API_SECRET_KEY, USER_ID, COTTER_BASE_URL} from '../apiKeys';

const winHeight = Dimensions.get('window').height;
const helloLogo = require('../assets/images/hello-logo.png');

class Login extends PureComponent {
  state = {
    email: '',
    loading: false,
    ip: null,
    secKey: null,
    response: null,
    userID: null,
  };

  authenticate = async () => {
    console.log('Start', new Date().getTime());

    // 1️⃣ (Optional) Get User ID from backend based on the email entered
    try {
      const userID = await this.getUserID(this.state.email);

      this.setState({userID: userID});

      // 2️⃣ Request trusted device authentication
      var cotter = new Cotter(
        COTTER_BASE_URL,
        API_KEY_ID,
        API_SECRET_KEY,
        userID,
      );
      cotter.trustedDevice.requestAuth(
        'LOGIN',
        this.onRequestSuccess,
        this.onRequestError,
        {},
        (getOAuthToken = true),
      );
    } catch (err) {
      Alert.alert('Login to backend error', err.msg);
      console.log('Login to backend error', err);
    }
  };

  onRequestError = (errorMessage, error) => {
    alert(errorMessage);
    console.log(error);
  };

  onRequestSuccess = response => {
    console.log(response);

    // 3️⃣ Validate the event response
    if (Cotter.validateEventResponse(response)) {
      console.log('Success', new Date().getTime());
      this.props.navigation.navigate('Dashboard', {
        userID: this.state.userID,
      });
    } else {
      Alert.alert('Event response is invalid');
    }
  };

  // This is an example on how you can register your user to your backend server
  getUserID = async email => {
    console.log('Getting ID from backend');
    try {
      const response = await fetch(
        'https://0eexu.sse.codesandbox.io/users/login', // This is an example API endpoint. Use your server's endpoint instead
        {
          method: 'POST',
          body: JSON.stringify({email: email}),
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

      // Return back the User ID registered in your backend.
      // RECOMMENDED: Use an unchanging user ID so users can
      // update their email/phone number.
      return data.id;
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
              Welcome back
            </Title>
            <InputContainer style={{paddingTop: 60}}>
              <InputLabel style={{fontSize: 20}}>Email</InputLabel>
              <InputText
                placeholder={'e.g. +12345678910'}
                style={{fontSize: 17}}
                value={this.state.email}
                onChangeText={text => this.setState({email: text})}
                autoCapitalize="none"
              />
            </InputContainer>
            <ButtonContainer>
              <ButtonImage
                onPress={this.authenticate}
                backgroundColor={colors.purple}
                color={colors.invertTextColor}>
                <Title style={[styles.text, {textAlign: 'center'}]}>
                  Log In
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
    fontFamily: 'Akkurat',
    fontSize: 22,
    paddingLeft: 10,
    alignSelf: 'center',
    color: colors.white,
  },
  textSmall: {
    fontSize: 10,
    fontFamily: 'Akkurat',
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
export default Login;
