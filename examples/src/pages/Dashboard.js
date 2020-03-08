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
      .then(trusted => {
        setTrustedDev(trusted);
      })
      .catch(err => alert(err));
  };

  const authenticate = async () => {
    try {
      var resp = await cotter.trustedDevice.authorizeDevice('LOGIN');
      console.log('RESP', resp);
    } catch (err) {
      console.log(err);
      alert('error');
    }
  };

  return (
    <View style={styles.container}>
      {/* <Image
        source={dashboardImg}
        style={{width: winWidth, height: winHeight, resizeMode: 'cover'}}
      /> */}

      <Title style={styles.title}>Dashboard</Title>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={authenticate}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Authenticate
          </Title>
        </Button>
      </ButtonContainer>
      <Title style={styles.title} style={{marginTop: 30}}>
        Settings
      </Title>
      <Subtitle style={styles.subtitle}>
        {trustedDev
          ? 'This is a trusted device'
          : 'This is not a trusted device'}
      </Subtitle>
      <ButtonContainer style={{marginTop: 30}}>
        <Button
          onPress={this.continue}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Check New Login Request
          </Title>
        </Button>
      </ButtonContainer>
      <ButtonContainer>
        <Button
          onPress={this.continue}
          backgroundColor={colors.lightPurple}
          color={colors.invertTextColor}>
          <Title style={[styles.text, {textAlign: 'center'}]}>
            Remove This Device
          </Title>
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
    backgroundColor: 'rgba(0, 0, 0, 0)',
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
