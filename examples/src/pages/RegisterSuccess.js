import React, {PureComponent} from 'react';
import {StyleSheet, View, Image, Dimensions} from 'react-native';
import colors from '../assets/colors';
import {Title, Subtitle} from '../components/Text';
import {Button, ButtonContainer} from '../components/Button';

const checkPurple = require('../assets/images/check-purple.png');
const winWidth = Dimensions.get('window').width;

class RegisterSuccess extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      device: null,
      loading: true,
      loginResp:
        this.props.route && this.props.route.params
          ? this.props.route.params.loginResp
          : null,
      trustedDeviceResp:
        this.props.route && this.props.route.params
          ? this.props.route.params.trustedDeviceResp
          : null,
      userID:
        this.props.route && this.props.route.params
          ? this.props.route.params.userID
          : null,
    };
  }

  componentDidMount() {
    setTimeout(() => this.goToDashboard(), 3000);
  }

  goToDashboard = () => {
    this.props.navigation.navigate('Dashboard', {
      loginResp: this.state.loginResp,
      trustedDeviceResp: this.state.trustedDeviceResp,
      userID: this.state.userID,
    });
  };

  render() {
    return (
      <>
        <View style={styles.container}>
          <Image source={checkPurple} style={styles.image} />
          <Title style={[styles.title, {marginBottom: 20}]}>Success!</Title>
          <Title style={styles.midtitle}>Your Phone Number</Title>
          <Title style={[styles.title, {fontSize: 17}]}>
            {this.state.loginResp
              ? this.state.loginResp.identifier.identifier
              : null}
          </Title>
          <Subtitle style={[styles.midtitle, {width: 200}]}>
            is verified successfully
          </Subtitle>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: winWidth,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundColor,
    padding: 20,
  },
  logo: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: '800',
    marginTop: 10,
    fontSize: 25,
  },
  midtitle: {
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 10,
    fontSize: 17,
  },
  subtitle: {
    alignSelf: 'center',
    textAlign: 'center',
    marginVertical: 20,
  },
  image: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    margin: 30,
    resizeMode: 'contain',
  },
  button: {
    marginTop: 60,
  },
});

export default RegisterSuccess;
