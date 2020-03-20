import React from 'react';
import { StyleSheet, Text } from 'react-native';
import colors from '../assets/colors';

export const Title = props => (
  <Text {...props} style={[styles.title, props.style]}>
    {props.children}
  </Text>
);

export const Subtitle = props => (
  <Text {...props} style={[styles.subtitle, props.style]}>
    {props.children}
  </Text>
);

const styles = StyleSheet.create({
  title: {
    color: colors.textColor,
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Akkurat-Bold',
  },
  subtitle: {
    color: colors.textColor,
    fontSize: 17,
    fontWeight: '400',
  },
});
