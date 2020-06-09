import React, {PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
} from 'react-native';
import colors from '../assets/colors';
import {Title} from '../components/Text';
import {ButtonImage, ButtonContainer} from '../components/Button';

const winHeight = Dimensions.get('window').height;
const helloLogo = require('../assets/images/hello-logo.png');

class Start extends PureComponent {
  goToSignup = () => {
    this.props.navigation.navigate('Register');
  };
  goToLogin = () => {
    this.props.navigation.navigate('Login');
  };
  render() {
    return (
      <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.container}>
            <Image source={helloLogo} style={styles.logo} />
            <Title style={{fontSize: 30, alignSelf: 'flex-start'}}>
              Plan your day with
            </Title>
            <Title
              style={{
                fontSize: 35,
                color: colors.purple,
                alignSelf: 'flex-start',
              }}>
              Hello App
            </Title>
            <View
              style={{
                flex: 0,
                alignSelf: 'flex-end',
                marginTop: 'auto',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                flexDirection: 'column',
              }}>
              <ButtonContainer>
                <ButtonImage
                  onPress={this.goToSignup}
                  backgroundColor={colors.purple}
                  color={colors.invertTextColor}>
                  <Title style={[styles.text, {textAlign: 'center'}]}>
                    Sign Up
                  </Title>
                </ButtonImage>
              </ButtonContainer>
              <ButtonContainer>
                <ButtonImage
                  onPress={this.goToLogin}
                  backgroundColor={colors.backgroundColor}
                  color={colors.textColor}>
                  <Title
                    style={[
                      styles.text,
                      {textAlign: 'center', color: colors.textColor},
                    ]}>
                    Log In
                  </Title>
                </ButtonImage>
              </ButtonContainer>
            </View>
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
    backgroundColor: colors.white,
    padding: 20,
    flex: 1,
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
    fontSize: 20,
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
    height: 100,
    width: 100,
    marginBottom: 50,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
  },
});
export default Start;
