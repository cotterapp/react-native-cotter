import React, {Component} from 'react';
import BottomModal from 'react-native-modal';
import {
  View,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import colors from '../assets/colors';
import {Title, Subtitle} from '../components/Text';
import {ButtonContainer, ButtonImage, Button} from '../components/Button';
import QRCode from 'react-native-qrcode-svg';

import QRCodeScanner from 'react-native-qrcode-scanner';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
} from 'react-native-permissions';

const winHeight = Dimensions.get('window').height;
const winWidth = Dimensions.get('window').width;
const tapImage = require('../assets/images/tap_device.png');
const warningImage = require('../assets/images/warning.png');
const cotterLogo = require('../assets/images/cotter_logo.png');
const closeImage = require('../assets/images/close.png');
const checkImage = require('../assets/images/check.png');

const api = {};
export const CotterAuthModal = api;

const AUTH_REQUEST_DEADLINE = 60; // in seconds
const AUTH_REQUEST_ERROR_DURATION = 3; // in seconds (how long until the modal close after error)

const QR_SHOW_DEADLINE = 60 * 3; //in seconds
const QR_SHOW_SECONDS_TO_RETRY = 3; //in seconds (how long each interval is)
const QR_SHOW_RESULT_DURATION = 3; // in seconds (how long until the modal close after success or error)

const defaultAuthReqText = {
  title: 'Approve this login from your phone',
  subtitle: "A notification is sent to your trusted device to confirm it's you",
  image: tapImage,
  titleError: 'Something went wrong',
  subtitleError: "We are unable to confirm it's you, please try again",
  imageError: warningImage,
};

const defaultAuthApproveText = {
  title: 'Are you trying to sign in?',
  subtitle: 'Someone is trying to sign in to your account from another device',
  logo: cotterLogo,
  buttonNo: "No, it's not me",
  buttonYes: 'Yes',
};

const defaultShowQRText = {
  title: 'Register This Device',
  subtitle: 'Please scan this QR Code from a Trusted Device',
  imageSuccess: checkImage,
  imageError: warningImage,
};

const defaultScanQRText = {
  title: 'Scan QR Code',
  subtitle: 'Scan the QR Code from the new device',
  imageSuccess: checkImage,
  imageError: warningImage,
  blocked:
    'Camera is blocked. Please go to Settings and allow access to camera.',
};

const connectCotterWrapper = function(WrappedComponent) {
  return class extends Component {
    state = {
      visibleAuthRequest: false,
      authReqText: {},
      defaultAuthReqText: defaultAuthReqText,
      eventID: null,
      seconds: AUTH_REQUEST_DEADLINE,

      // Auth Approve Modal
      visibleAuthApprove: false,
      authApproveText: {},
      defaultAuthApproveText: defaultAuthApproveText,
      error: false,

      // Show QR Code Modal
      visibleShowQRCode: false,
      showQRText: {},
      defaultShowQRText: defaultShowQRText,
      qrText: null,
      qrShowSuccess: false,
      qrShowError: false,

      // Scan QR Code Modal
      visibleScanQRCode: false,
      scanQRText: {},
      defaultScanQRText: defaultScanQRText,
      cameraOk: false,
      scanQRSuccess: false,
      scanQRError: false,
    };

    componentDidMount() {
      api.showAuthRequest = this.showAuthRequest;
      api.showAuthApprove = this.showAuthApprove;
      api.showQRCode = this.showQRCode;
      api.showQRScan = this.showQRScan;
    }

    showAuthRequest = (authReqText, eventID, trustDev, onSuccess, onError) => {
      this.setState({
        visibleAuthRequest: true,
        authReqText: authReqText,
        eventID: eventID,
        defaultAuthReqText: defaultAuthReqText,
        error: false,
        seconds: AUTH_REQUEST_DEADLINE,
      });
      this.trustDev = trustDev;
      this.onAuthReqSuccess = onSuccess;
      this.onAuthReqError = onError;
      this.startTimerAuthRequest();
    };

    hideAuthRequest = () => {
      this.setState({visibleAuthRequest: false});
    };

    startTimerAuthRequest = () => {
      var deadline = new Date().getTime() + (AUTH_REQUEST_DEADLINE + 1) * 1000;
      var self = this;
      var x = setInterval(function() {
        var now = new Date().getTime();
        var t = deadline - now;
        var seconds = Math.floor((t % (1000 * 60)) / 1000);
        self.setState({seconds: seconds});
        self.getEvent();
        if (t < 0) {
          clearInterval(x);
          self.setState({error: true});
          setTimeout(
            () => self.errorAndCloseAuthReq('Request Timeout', null),
            AUTH_REQUEST_ERROR_DURATION * 1000,
          );
        }
      }, 1000);
      this.timerAuthReq = x;
    };

    dismissAuthRequest = () => {
      this.errorAndCloseAuthReq('Dismissed', null);
    };

    getEvent = () => {
      this.trustDev.requests
        .getEvent(this.state.eventID)
        .then(resp => {
          console.log('poll', resp);
          if (resp.approved === true) {
            this.onAuthReqSuccess(resp);
            clearInterval(this.timerAuthReq);
            this.hideAuthRequest();
          }
        })
        .catch(err => {
          this.errorAndCloseAuthReq('Something went wrong', err);
        });
    };

    errorAndCloseAuthReq = (errMsg, err) => {
      clearInterval(this.timerAuthReq);
      this.hideAuthRequest();
      this.onAuthReqError(errMsg, err);
    };

    // Auth Approve Request
    showAuthApprove = (authApproveText, trustDev, event) => {
      console.log('EVENT', event);
      this.setState({
        visibleAuthApprove: true,
        authApproveText: authApproveText,
        event: event,
        defaultAuthApproveText: defaultAuthApproveText,
        error: false,
      });
      this.trustDev = trustDev;
    };

    hideAuthApprove = () => {
      this.setState({visibleAuthApprove: false});
    };

    closeAndRejectAuthApprove = () => {
      this.rejectEvent();
      this.hideAuthApprove();
    };

    approveEvent = () => {
      this.trustDev.approveEvent(this.state.event, true);
      this.hideAuthApprove();
    };

    rejectEvent = () => {
      this.trustDev.approveEvent(this.state.event, false);
      this.hideAuthApprove();
    };

    // Show QR Code
    showQRCode = (showQRText, trustDev, qrText, onSuccess, onError) => {
      this.setState({
        visibleShowQRCode: true,
        showQRText: showQRText,
        qrText: qrText,
      });
      this.onQRShowSuccess = onSuccess;
      this.onQRShowError = onError;
      this.trustDev = trustDev;
      this.startTimerQRShow();
    };

    hideQRCode = () => {
      clearInterval(this.timerQRShow);
      this.setState({
        visibleShowQRCode: false,
        qrShowSuccess: false,
        qrShowError: false,
      });
    };

    trustedDeviceEnrolled = async () => {
      try {
        var trustedDevice = await this.trustDev.trustedDeviceEnrolled();
        if (trustedDevice) {
          this.onEnrollNewDeviceSuccess();
        }
      } catch (err) {
        console.log('Something went wrong', err);
      }
    };

    startTimerQRShow = () => {
      var deadline = new Date().getTime() + (QR_SHOW_DEADLINE + 1) * 1000;
      var self = this;
      var x = setInterval(function() {
        var now = new Date().getTime();
        var t = deadline - now;
        var seconds = Math.floor((t % (1000 * 60)) / 1000);
        self.setState({seconds: seconds});
        self.trustedDeviceEnrolled();
        if (t < 0) {
          clearInterval(x);
          self.setState({error: true});
          setTimeout(
            () => self.errorAndCloseQRShow('Request Timeout', null),
            QR_SHOW_RESULT_DURATION * 1000,
          );
        }
      }, QR_SHOW_SECONDS_TO_RETRY * 1000);
      this.timerQRShow = x;
    };

    dismissQRShow = () => {
      this.errorAndCloseQRShow('Dismissed', null);
    };

    errorAndCloseQRShow = (errMsg, err) => {
      this.setState({qrShowSuccess: false, qrShowError: true});
      var self = this;
      setTimeout(() => {
        self.hideQRCode();
        self.onQRShowError(errMsg, err);
      }, AUTH_REQUEST_ERROR_DURATION * 1000);
    };

    onEnrollNewDeviceSuccess = () => {
      clearInterval(this.timerQRShow);
      this.setState({qrShowSuccess: true, qrShowError: false});
      var self = this;
      setTimeout(() => {
        self.hideQRCode();
        self.onQRShowSuccess();
      }, AUTH_REQUEST_ERROR_DURATION * 1000);
    };
    // Scan QR Code
    hideQRScan = () => {
      this.setState({visibleScanQRCode: false});
    };
    respondToPermission = result => {
      console.log(result);
      switch (result) {
        case RESULTS.UNAVAILABLE:
          alert('Camera is not available on this device.');
          break;
        case RESULTS.DENIED:
          if (!this.state.cameraAsked) {
            this.setState({cameraAsked: true});
            request(
              Platform.select({
                android: PERMISSIONS.ANDROID.CAMERA,
                ios: PERMISSIONS.IOS.CAMERA,
              }),
            )
              .then(this.respondToPermission)
              .catch(error => this.requestCameraOpenSettings());
          } else {
            alert(this.state.defaultScanQRText.blocked);
            this.setState({cameraAsked: false});
          }
          break;
        case RESULTS.GRANTED:
          this.setState({cameraOk: true});
          break;
        case RESULTS.BLOCKED:
          this.requestCameraOpenSettings();
          break;
      }
    };

    requestCameraOpenSettings = () => {
      Alert.alert(
        'Unable to Open Camera',
        this.state.defaultScanQRText.blocked,
        [
          {
            text: 'Cancel',
            onPress: this.hideQRScan,
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () =>
              openSettings().catch(() => console.warn("Can't open settings")),
          },
        ],
        {cancelable: false},
      );
    };

    getPermission = () =>
      check(
        Platform.select({
          android: PERMISSIONS.ANDROID.CAMERA,
          ios: PERMISSIONS.IOS.CAMERA,
        }),
      )
        .then(this.respondToPermission)
        .catch(error => {
          console.log(error);
          alert(this.state.defaultScanQRText.blocked);
        });

    showQRScan = (scanQRText, trustDev) => {
      this.setState({
        visibleScanQRCode: true,
        scanQRText: scanQRText,
      });
      this.trustDev = trustDev;
      this.getPermission();
    };

    onErrorQRScanned = () => {
      var self = this;
      this.setState({scanQRSuccess: false, scanQRError: true});
      setTimeout(() => {
        self.hideQRScan();
        this.setState({
          scanQRSuccess: false,
          scanQRError: false,
          cameraAsked: false,
        });
      }, AUTH_REQUEST_ERROR_DURATION * 1000);
    };

    onSuccessQRScanned = () => {
      var self = this;
      this.setState({scanQRSuccess: true, scanQRError: false});
      setTimeout(() => {
        self.hideQRScan();
        this.setState({
          scanQRSuccess: false,
          scanQRError: false,
          cameraAsked: false,
        });
      }, AUTH_REQUEST_ERROR_DURATION * 1000);
    };

    submitScannedCode = async e => {
      var scannedCode = e.data;
      try {
        var resp = await this.trustDev.enrollOtherDevice(scannedCode);
        console.log(resp);

        if (resp.approved === true) {
          this.onSuccessQRScanned();
        } else {
          this.onErrorQRScanned();
        }
      } catch (e) {
        this.onErrorQRScanned();
        console.log(e);
      }
    };
    render() {
      const authReqText = Object.assign(
        {...this.state.defaultAuthReqText},
        this.state.authReqText,
      );

      const authApproveText = Object.assign(
        {...this.state.defaultAuthApproveText},
        this.state.authApproveText,
      );

      const showQRText = Object.assign(
        {...this.state.defaultShowQRText},
        this.state.showQRText,
      );

      const scanQRText = Object.assign(
        {...this.state.defaultScanQRText},
        this.state.scanQRText,
      );

      var scanQRtitle = (
        <View style={{width: '100%'}}>
          <Title style={[styles.title, styles.textCenter]}>
            {scanQRText.title}
          </Title>
          <Subtitle style={[styles.subtitle, styles.textCenter]}>
            {scanQRText.subtitle}
          </Subtitle>
        </View>
      );
      var scanQRComponent = this.state.cameraOk ? (
        <QRCodeScanner
          onRead={this.submitScannedCode}
          topContent={scanQRtitle}
          bottomViewStyle={{justifyContent: 'flex-start'}}
          fadeIn={false}
        />
      ) : (
        <View
          style={[
            styles.container,
            {
              height: '100%',
              width: winWidth - 40,
              justifyContent: 'space-between',
            },
          ]}>
          {scanQRtitle}
          <ButtonContainer>
            <Button
              onPress={this.getPermission}
              backgroundColor={colors.green}
              color={colors.invertTextColor}>
              Scan QR Code
            </Button>
          </ButtonContainer>
        </View>
      );
      var scanQRSuccessError = (
        <View
          style={[
            styles.container,
            {
              height: '100%',
              width: winWidth - 40,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          {scanQRtitle}
          <View style={styles.imageViewSuccessError}>
            <Image
              source={
                this.state.scanQRSuccess
                  ? scanQRText.imageSuccess
                  : scanQRText.imageError
              }
              style={styles.successErrorImage}
            />
          </View>
        </View>
      );
      return (
        <View style={styles.container}>
          <WrappedComponent {...this.props} />

          {/* Auth Request Modal */}
          <BottomModal
            isVisible={this.state.visibleAuthRequest}
            onSwipeComplete={this.dismissAuthRequest}
            swipeDirection={['up', 'down']}
            onBackdropPress={this.dismissAuthRequest}
            onBackButtonPress={this.dismissAuthRequest}
            style={{
              justifyContent: 'flex-end',
              margin: 0,
            }}>
            <View style={styles.bottomModal}>
              <Title style={styles.title}>
                {this.state.error ? authReqText.titleError : authReqText.title}
              </Title>
              <Subtitle style={styles.subtitle}>
                {this.state.error
                  ? authReqText.subtitleError
                  : authReqText.subtitle}
              </Subtitle>
              <View style={styles.imageViewSuccessError}>
                <Image
                  source={
                    this.state.error
                      ? authReqText.imageError
                      : authReqText.image
                  }
                  style={styles.tapImage}
                />
              </View>
            </View>
          </BottomModal>

          {/* Auth Approve Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.visibleAuthApprove}
            onRequestClose={this.hideAuthApprove}
            onDismiss={this.hideAuthApprove}
            presentationStyle="fullScreen">
            <View style={styles.fullModal}>
              <View style={{width: winWidth, paddingLeft: 20}}>
                <TouchableOpacity onPress={this.closeAndRejectAuthApprove}>
                  <Image source={closeImage} style={styles.closeImage} />
                </TouchableOpacity>
              </View>
              <View style={[styles.imageView, {paddingBottom: 40}]}>
                <Image source={authApproveText.logo} style={[styles.logo]} />
                <Title style={[styles.title, styles.textCenter]}>
                  {authApproveText.title}
                </Title>
                <Subtitle style={[styles.subtitle, styles.textCenter]}>
                  {authApproveText.subtitle}
                </Subtitle>
              </View>
              <View style={{alignSelf: 'flex-end', paddingBottom: 30}}>
                <ButtonContainer>
                  <ButtonImage style={styles.button} onPress={this.rejectEvent}>
                    <Subtitle style={{color: colors.red}}>
                      {authApproveText.buttonNo}
                    </Subtitle>
                  </ButtonImage>
                  <ButtonImage
                    style={styles.button}
                    onPress={this.approveEvent}>
                    <Subtitle style={{color: colors.green}}>
                      {authApproveText.buttonYes}
                    </Subtitle>
                  </ButtonImage>
                </ButtonContainer>
              </View>
            </View>
          </Modal>

          {/* Show QR Code Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.visibleShowQRCode}
            onRequestClose={this.hideQRCode}
            onDismiss={this.hideQRCode}
            presentationStyle="fullScreen">
            <View style={styles.fullModal}>
              <View style={{width: winWidth, padding: 20}}>
                <TouchableOpacity onPress={this.hideQRCode}>
                  <Image source={closeImage} style={styles.closeImage} />
                </TouchableOpacity>
              </View>
              <View style={[styles.imageView]}>
                <Title
                  style={[
                    styles.title,
                    styles.textCenter,
                    {paddingBottom: 10},
                  ]}>
                  {showQRText.title}
                </Title>
                <Subtitle
                  style={[
                    styles.subtitle,
                    styles.textCenter,
                    {paddingBottom: 20},
                  ]}>
                  {showQRText.subtitle}
                </Subtitle>
                <View style={styles.qrContainer}>
                  {this.state.qrShowSuccess || this.state.qrShowError ? (
                    <View style={styles.imageViewSuccessError}>
                      <Image
                        source={
                          this.state.qrShowSuccess
                            ? showQRText.imageSuccess
                            : showQRText.imageError
                        }
                        style={styles.successErrorImage}
                      />
                    </View>
                  ) : (
                    <QRCode
                      value={this.state.qrText}
                      size={winWidth * 0.6}
                      backgroundColor={colors.backgroundColor}
                      color={colors.textColor}
                    />
                  )}
                </View>
              </View>
            </View>
          </Modal>

          {/* Scan QR Code Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.visibleScanQRCode}
            onRequestClose={this.hideQRScan}
            onDismiss={this.hideQRScan}
            presentationStyle="fullScreen">
            <View style={styles.fullModal}>
              <View style={{width: winWidth, padding: 20}}>
                <TouchableOpacity onPress={this.hideQRScan}>
                  <Image source={closeImage} style={styles.closeImage} />
                </TouchableOpacity>
              </View>
              <View style={styles.imageView}>
                {this.state.scanQRSuccess || this.state.scanQRError
                  ? scanQRSuccessError
                  : scanQRComponent}
              </View>
            </View>
          </Modal>
        </View>
      );
    }
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomModal: {
    backgroundColor: 'white',
    height: winHeight * 0.4,
    padding: 40,
  },
  fullModal: {
    backgroundColor: 'white',
    height: winHeight,
    padding: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    alignSelf: 'flex-start',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    alignSelf: 'flex-start',
    color: colors.darkGrey,
  },
  textCenter: {
    alignSelf: 'center',
    textAlign: 'center',
  },
  imageView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewSuccessError: {
    width: winWidth * 0.6,
    height: winWidth * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  tapImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    margin: 'auto',
    resizeMode: 'contain',
  },
  successErrorImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    margin: 'auto',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImage: {
    width: 20,
    height: 20,
    alignSelf: 'flex-start',
  },
  qrContainer: {
    padding: 20,
  },
});

export default connectCotterWrapper;
