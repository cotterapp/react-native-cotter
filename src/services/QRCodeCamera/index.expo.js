import React, {useState, useEffect} from 'react';
import {Camera} from 'expo-camera';
import {StyleSheet, Text, View} from 'react-native';

const QRCodeCamera = React.forwardRef(
  ({style, onBarCodeRead, notAuthorizedView}, ref) => {
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
      (async () => {
        const {status} = await Camera.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);

    if (!hasPermission) return notAuthorizedView;

    return (
      <Camera
        style={style}
        type={Camera.Constants.Type.back}
        ref={ref}
        onBarCodeScanned={onBarCodeRead}></Camera>
    );
  },
);

// const QRCodeCamera = () => <Text>hello</Text>;
export default QRCodeCamera;
