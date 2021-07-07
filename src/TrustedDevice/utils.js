// @flow
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { sha256 } from 'react-native-sha256';
import { generateSecureRandom } from 'react-native-securerandom';
import { Buffer } from 'buffer';
import { hexToBytes } from '../Verify/utils';

// type LayoutInfo = {
//   width: number,
//   height: number,
// };

// type State = {
//   layoutInfo: ?LayoutInfo,
// };

// type Props = {
//   ratio: string,
//   children: React.Node,
// };

export class FillToAspectRatio extends React.Component {
  static defaultProps = {
    ratio: '4:3',
  };
  state = {
    layoutInfo: null,
  };
  handleLayout = ({ nativeEvent: { layout } }) => {
    const { width, height } = layout;
    this.setState({
      layoutInfo: { width, height },
    });
  };

  getRatio = () => {
    const { ratio } = this.props;
    const [ratioWidth, ratioHeight] = ratio.split(':').map((x) => Number(x));
    return ratioHeight / ratioWidth;
  };

  render() {
    const { layoutInfo } = this.state;
    if (!layoutInfo) {
      return (
        <View
          key="pre-info"
          onLayout={this.handleLayout}
          style={styles.containerStyle}
        />
      );
    }
    const { height, width } = layoutInfo;
    let wrapperWidth;

    let wrapperHeight;
    // return <Text>lol: before </Text>
    const ratio = this.getRatio();
    if (ratio * height < width) {
      wrapperHeight = width / ratio;
      wrapperWidth = width;
    } else {
      wrapperWidth = ratio * height;
      wrapperHeight = height;
    }
    const wrapperPaddingX = (width - wrapperWidth) / 2;
    const wrapperPaddingY = (height - wrapperHeight) / 2;

    return (
      <View onLayout={this.handleLayout} style={styles.containerStyle}>
        <View
          style={{
            width: wrapperWidth,
            height: wrapperHeight,
            marginLeft: wrapperPaddingX,
            marginTop: wrapperPaddingY,
          }}>
          {this.props.children}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: { flex: 1, overflow: 'hidden', position: 'relative' },
});

export const generateCodeVerifierAndChallenge = async () => {
  // generating code verifier
  var randomBytes = await generateSecureRandom(32);
  var codeVerifier = new Buffer(randomBytes).toString('base64');

  // generating code challenge
  var hashed = await sha256(codeVerifier);
  base64encoded = new Buffer(hexToBytes(hashed))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  var codeChallenge = base64encoded;
  return {
    code_verifier: codeVerifier,
    code_challenge: codeChallenge,
  };
};
