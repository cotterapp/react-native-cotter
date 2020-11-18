import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera';

const QRCodeCamera = React.forwardRef(
  ({style, onBarCodeRead, notAuthorizedView}, ref) => (
    <RNCamera
      style={style}
      ref={ref}
      captureAudio={false}
      barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
      onBarCodeRead={onBarCodeRead}
      notAuthorizedView={notAuthorizedView}
    />
  ),
);

// const QRCodeCamera = () => <Text>hello</Text>;

export default QRCodeCamera;
