import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import colors from '../assets/colors';

export const InputContainer = props => (
  <View {...props} style={[styles.container, props.style]}>
    {props.children}
  </View>
);

export const InputLabel = props => (
  <Text
    {...props}
    style={[
      styles.label,
      props.style,
      {
        borderBottomColor: props.focus
          ? colors.textColor
          : colors.textColorOpacity(0.3),
      },
    ]}>
    {props.children}
  </Text>
);

export const InputText = props => {
  const [color, setColor] = useState(colors.textColorOpacity(0.2));
  return (
    <TextInput
      {...props}
      onFocus={() => setColor(colors.textColor)}
      onBlur={() => setColor(colors.textColorOpacity(0.2))}
      style={[styles.input, props.style, { borderBottomColor: color }]}
      placeholderTextColor={colors.textColorOpacity(0.2)}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 30,
  },
  label: {
    color: colors.textColor,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 20,
    fontFamily: 'Akkurat',
  },
  input: {
    marginTop: 20,
    paddingBottom: 10,
    color: colors.textColor,
    fontSize: 15,
    fontWeight: '600',
    borderBottomWidth: 1,
    fontFamily: 'Akkurat',
  },
});
