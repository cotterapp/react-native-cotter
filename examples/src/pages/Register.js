import React, {PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {Login} from 'react-native-cotter';
import colors from '../assets/colors';
import {Title} from '../components/Text';
import {Button, ButtonImage, ButtonContainer} from '../components/Button';
import {InputContainer, InputLabel, InputText} from '../components/Input';

const winHeight = Dimensions.get('window').height;

class Register extends PureComponent {
  state = {
    email: 'hello@gmail.com',
    loading: false,
    ip: null,
    secKey: null,
  };
  continue = async () => {
    var login = new Login(
      'https://js.cotter.app/app',
      'myexample://auth_callback',
      '<API_KEY_ID>',
      this.onError,
      this.onSuccess,
    );
    await login.openAuthWithInput('EMAIL', this.state.email);
  };

  onError = (errorMessage, error) => {
    alert(errorMessage);
    console.log(error);
  };

  onSuccess = response => {
    console.log(response);
    // alert('Registering to backend');
    /* 1. Navigate to the callbackScreenName route with params */
    this.props.navigation.replace('Dashboard', {
      loginResponse: response,
    });
  };

  render() {
    return (
      <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <Title style={{fontSize: 35, alignSelf: 'flex-start'}}>
              Welcome
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
                backgroundColor={colors.red}
                color={colors.invertTextColor}>
                <Title style={[styles.text, {textAlign: 'center'}]}>
                  Sign In Without Password
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
    backgroundColor: 'rgba(0, 0, 0, 0)',
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
  image: {
    height: 150,
    width: 150,
    resizeMode: 'contain',
  },
});
export default Register;
