import React, {PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
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
      COTTER_JS_URL,
      COTTER_BASE_URL,
      'myexample://auth_callback',
      API_KEY_ID,
      this.onError,
      this.onSuccess,
      (getOAuthToken = true),
    );
    await verify.openAuthWithInput('EMAIL', encodeURI(this.state.email));
    // this.onSuccess();
  };

  onError = (errorMessage, error) => {
    alert(errorMessage);
    console.log(error);
  };

  onSuccess = (response) => {
    console.log(response);
    this.setState({response});
    // alert('Registering to backend');
    var userID = this.registerUser(response);
    this.setState({userID: userID});
    // Initialize Cotter
    var cotter = new Cotter(
      COTTER_BASE_URL,
      API_KEY_ID,
      API_SECRET_KEY,
      userID,
    );
    // Enroll device as Trusted Device
    cotter.trustedDevice.enrollDevice(
      this.onEnrollSuccess,
      this.onEnrollError,
      (getOAuthToken = true),
    );
    /* 1. Navigate to the callbackScreenName route with params */
  };

  onEnrollSuccess = (resp) => {
    console.log(resp);
    this.props.navigation.navigate('RegisterSuccess', {
      trustedDeviceResp: resp,
      verifyResp: this.state.response,
      userID: this.state.userID,
    });
  };
  onEnrollError = (err) => {
    alert(err);
    console.log(err);
    // this.props.navigation.navigate('RegisterSuccess', {
    //   trustedDeviceResp: err,
    //   verifyResp: this.state.response,
    //   userID: this.state.userID,
    // });
  };

  registerUser = (response) => {
    // register in backend
    // check cotter's token
    // register user in Cotter with some user ID
    // get back the user ID
    var userID = USER_ID;
    return userID;
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
                onChangeText={(text) => this.setState({email: text})}
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
export default Register;
