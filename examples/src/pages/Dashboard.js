import React, {useEffect, useState} from 'react';
import {View, Image, Dimensions, StyleSheet} from 'react-native';
import {Title, Subtitle} from '../components/Text';
import colors from '../assets/colors';
import {Button, ButtonContainer} from '../components/Button';
import {Cotter} from 'react-native-cotter';
import {API_KEY_ID, API_SECRET_KEY, USER_ID, COTTER_BASE_URL} from '../apiKeys';

const dashboardImg = require('../assets/images/hello-app-dashboard.png');
const winWidth = Dimensions.get('window').width;
const winHeight = Dimensions.get('window').height;

function Dashboard({route}) {
  const [cotter, setCotter] = useState(null);
  const [trustedDev, setTrustedDev] = useState(false);
  const [userID, setUserID] = useState(
    route && route.params && route.params.userID
      ? route.params.userID
      : USER_ID,
  );

  useEffect(() => {
    var cotter = new Cotter(
      COTTER_BASE_URL,
      API_KEY_ID,
      API_SECRET_KEY,
      userID,
    );
    setCotter(cotter);
  }, []);

  useEffect(() => {
    if (cotter != null) {
      checkThisDeviceTrusted();
    }
  }, [cotter]);

  const checkThisDeviceTrusted = () => {
    cotter.trustedDevice
      .trustedDeviceEnrolled()
      .then((trusted) => {
        setTrustedDev(trusted);
      })
      .catch((err) => console.log(err));
  };

  const checkNewEvent = () => {
    cotter.trustedDevice.getNewEvent();
  };

  const trustThisDevice = () => {
    cotter.trustedDevice.trustThisDevice(onSuccessTrust, onErrorTrust);
  };
  const onSuccessTrust = () => {
    alert('Success');
  };
  const onErrorTrust = (errmsg, err) => {
    alert(errmsg);
  };
  const scanQRCode = () => {
    cotter.trustedDevice.scanQRCode();
  };
  const removeDevice = async () => {
    try {
      var resp = await cotter.trustedDevice.removeDevice();
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

  const logOut = () => {
    cotter.tokenHandler.removeTokens();
  };

  return (
    <View style={styles.container}>
      {/* <Image
        source={dashboardImg}
        style={{width: winWidth, height: winHeight, resizeMode: 'cover'}}
      /> */}

      <Title style={styles.title} style={{marginTop: 30}}>
        Dashboard
      </Title>
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
          onPress={logOut}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>Log Out</Title>
        </Button>
      </ButtonContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: winHeight,
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
    fontFamily: 'Akkurat',
    fontSize: 17,
    alignSelf: 'center',
    color: colors.purple,
  },
  title: {
    fontFamily: 'Akkurat-Bold',
    fontSize: 25,
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
export default Dashboard;
