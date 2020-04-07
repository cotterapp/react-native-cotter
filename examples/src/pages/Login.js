import React, {PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
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
    const userID = await this.getUserID();

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
  };

  onRequestError = (errorMessage, error) => {
    alert(errorMessage);
    console.log(error);
  };

  onRequestSuccess = (response) => {
    console.log(response);

    console.log('Success', new Date().getTime());
    this.props.navigation.navigate('Dashboard', {
      userID: this.state.userID,
    });
  };
  getUserID = async (email) => {
    // get user ID for the email
    await new Promise((r) => setTimeout(r, 1000));
    var userID = USER_ID;
    this.setState({userID: userID});
    return userID;
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
                onChangeText={(text) => this.setState({email: text})}
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
