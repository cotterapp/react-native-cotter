import React, {useEffect, useState} from 'react';
import {View, Image, Dimensions, StyleSheet} from 'react-native';
import {Title, Subtitle} from '../components/Text';
import colors from '../assets/colors';
import {Button, ButtonContainer} from '../components/Button';
import {Cotter} from 'react-native-cotter';
import {API_KEY_ID, COTTER_BASE_URL} from '../apiKeys';
import {ScrollView} from 'react-native-gesture-handler';

const dashboardImg = require('../assets/images/hello-app-dashboard.png');
const winWidth = Dimensions.get('window').width;
const winHeight = Dimensions.get('window').height;

function Dashboard({route}) {
  Cotter.setBaseURL(COTTER_BASE_URL);
  const [cotter, setCotter] = useState(null);
  const [trustedDev, setTrustedDev] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    var cotter = new Cotter(API_KEY_ID);
    setCotter(cotter);
  }, []);

  useEffect(() => {
    if (cotter != null) {
      getLoggedInUser();
    }
  }, [cotter]);

  const getLoggedInUser = async () => {
    let user = await cotter.getLoggedInUser();
    setUser(user);
  };

  useEffect(() => {
    if (user != null) {
      checkThisDeviceTrusted();
    }
  }, [user]);

  const checkThisDeviceTrusted = async () => {
    try {
      var trusted = await user.isThisDeviceTrusted();
      setTrustedDev(trusted);
    } catch (err) {
      console.log(err);
    }
  };

  const checkNewEvent = () => {
    user.checkNewSignInRequest();
  };

  const trustThisDevice = () => {
    user.trustThisDevice(onSuccessTrust, onErrorTrust);
  };
  const onSuccessTrust = () => {
    alert('Success');
  };
  const onErrorTrust = (errmsg, err) => {
    alert(errmsg);
  };
  const scanQRCode = () => {
    user.scanQRCode();
  };
  const removeDevice = async () => {
    try {
      var resp = await user.removeDevice();
      alert(resp);
      console.log(resp);
    } catch (err) {
      alert(err);
    }
  };

  const getAccessToken = async () => {
    try {
      var accessToken = await cotter.tokenHandler.getAccessToken();
      console.log('Access Token', accessToken);
    } catch (err) {
      console.log('Access Token Error', err);
    }
  };

  const getIDToken = async () => {
    try {
      var idToken = await cotter.tokenHandler.getIDToken();
      console.log('ID Token', idToken);
    } catch (err) {
      console.log('ID Token Error', err);
    }
  };

  const verifyEmail = () => {
    user.verifyEmailWithLink(
      'myexample://auth_callback',
      payload => console.log(payload),
      err => console.log(err),
    );
  };

  const logOut = () => {
    cotter.logOut();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Image
        source={dashboardImg}
        style={{width: winWidth, height: winHeight, resizeMode: 'cover'}}
      /> */}
      <Title style={styles.title}>Dashboard</Title>
      <Subtitle style={styles.subtitle}>
        {trustedDev
          ? 'This is a trusted device'
          : 'This is not a trusted device'}
      </Subtitle>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={checkNewEvent}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Check New Login Request
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={trustThisDevice}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Trust This Device
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={scanQRCode}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Scan QR Code
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={removeDevice}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Remove This Device
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={getAccessToken}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Read Access Token
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={getIDToken}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Read ID Token
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={verifyEmail}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Verify Email of Logged-in User
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={logOut}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>Log Out</Title>
        </Button>
      </ButtonContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: winHeight,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: '40%',
    backgroundColor: colors.backgroundColor,
    padding: 40,
  },
  buttonImage: {
    width: 50,
    height: 50,
    marginTop: -5,
    borderWidth: 0,
    borderColor: 'rgba(0,0,0,0)',
  },
  text: {
    fontSize: 17,
    alignSelf: 'center',
    color: colors.purple,
  },
  title: {
    fontSize: 25,
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
export default Dashboard;
