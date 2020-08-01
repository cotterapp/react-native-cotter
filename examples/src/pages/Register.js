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
import {Verify, Cotter, Constants} from 'react-native-cotter';
import colors from '../assets/colors';
import {Title} from '../components/Text';
import {Button, ButtonImage, ButtonContainer} from '../components/Button';
import {InputContainer, InputLabel, InputText} from '../components/Input';
import {API_KEY_ID, COTTER_JS_URL, COTTER_BASE_URL, USER_ID} from '../apiKeys';

const winHeight = Dimensions.get('window').height;
const helloLogo = require('../assets/images/hello-logo.png');

class Register extends PureComponent {
  state = {
    phone: '',
    loading: false,
    ip: null,
    secKey: null,
    response: null,
    userID: null,
    cotter: new Cotter(API_KEY_ID),
  };
  continue = async () => {
    Constants.setBaseURL(COTTER_BASE_URL);
    Constants.setJSBaseURL(COTTER_JS_URL);
    // 1️⃣  Verify phone number with a magic link via WhatsApp
    await this.state.cotter.signInWithEmailLink(
      'myexample://auth_callback',
      this.onSuccess,
      this.onError,
      {email: this.state.phone},
    );
  };

  onError = (errorMessage, error) => {
    alert(errorMessage);
    console.log(error);
  };

  onSuccess = async response => {
    console.log(response);
    this.setState({response});

    try {
      // 2️⃣ Enroll device as Trusted Device for this user
      // a) Get the logged-in user
      var user = await this.state.cotter.getLoggedInUser();
      console.log(user);
      // b) Register this device as trusted
      await user.registerDevice(
        resp => alert('Success'),
        err => alert('Error'),
      );
    } catch (err) {
      console.log('Error getting logged-in user:', err);
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
                value={this.state.phone}
                onChangeText={text => this.setState({phone: text})}
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
