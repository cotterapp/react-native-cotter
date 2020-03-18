# Cotter React Native SDK

Cotter's React Native SDK makes it quick and easy to build secure passwordless login using email or phone number in your Android app. We provide a full-suite authentication that includes SSO for email or phone number secured with the FIDO protocol (coming soon).

Get started with our 📚 [integration guides and example projects](https://docs.cotter.app/verify-email-and-phone-number/react-native-sdk).

yarn add rn-secure-storage
yarn add tweetnacl
yarn add react-native-randombytes
yarn add react-native-qrcode-svg
yarn add react-native-svg
yarn add react-native-qrcode-scanner
yarn add react-native-permissions
yarn add react-native-camera

cd ios && pod install && cd ..

import {connectCotterWrapper} from 'react-native-cotter';

https://github.com/react-native-community/react-native-permissions

1)
permissions_path = '../node_modules/react-native-permissions/ios'

pod 'Permission-Camera', :path => "#{permissions_path}/Camera.podspec"

2)
<key>NSCameraUsageDescription</key>
<string>YOUR TEXT</string>

3)
<uses-permission android:name="android.permission.CAMERA" />
