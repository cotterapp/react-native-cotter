import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import colors from '../assets/colors';

export const ButtonContainer = (props) => (
  <View style={[styles.container, props.style]}>{props.children}</View>
);

export const Button = (props) => (
  <TouchableOpacity
    style={[
      props.big ? styles.bigtouchable : styles.touchable,
      {
        backgroundColor: props.loading
          ? colors.disabled
          : props.backgroundColor,
      },
      props.style,
    ]}
    onPress={props.onPress}
    disabled={props.loading || props.disabled}>
    {props.loading ? (
      <ActivityIndicator size="small" color={colors.invertTextColor} />
    ) : (
      <Text style={[styles.text, {color: props.color}]}>{props.children}</Text>
    )}
  </TouchableOpacity>
);

export const ButtonImage = (props) => (
  <TouchableOpacity
    style={[
      {
        backgroundColor: props.loading
          ? colors.disabled
          : props.backgroundColor,
      },
      props.style,
      styles.image,
    ]}
    onPress={props.onPress}
    disabled={props.loading || props.disabled}>
    {props.loading ? (
      <ActivityIndicator size="small" color={colors.invertTextColor} />
    ) : (
      props.children
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  text: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottom: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
  },
  touchable: {
    flex: 1,
    borderRadius: 5,
    paddingVertical: 20,
    paddingHorizontal: 20,
    margin: 5,
  },
  bigtouchable: {
    width: '100%',
    padding: 25,
    marginTop: 'auto',
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    margin: 5,
  },
});
