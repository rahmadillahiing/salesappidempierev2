import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import PropTypes from "prop-types";

import { FONTS, COLORS } from "../constants";

const TextIconButton = ({
  containerStyle,
  label,
  labelStyle,
  icon,
  iconPosition,
  iconStyle,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        ...containerStyle,
      }}
      onPress={onPress}
    >
      {iconPosition == "LEFT" && (
        <Image
          blurRadius={disabled ? 15 : 0}
          source={icon}
          style={{
            ...styles.image,
            ...iconStyle,
          }}
        />
      )}
      <Text
        style={{
          ...FONTS.body3,
          ...labelStyle,
        }}
      >
        {label}
      </Text>
      {iconPosition == "RIGHT" && (
        <Image
          source={icon}
          style={{
            ...styles.image,
            ...iconStyle,
          }}
        />
      )}
      {iconPosition == "CENTER" && (
        <Image
          source={icon}
          style={{
            ...styles.image2,
            ...iconStyle,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

TextIconButton.propTypes = {
  iconPosition: PropTypes.oneOf(["LEFT", "RIGHT", "CENTER"]),
};

const styles = StyleSheet.create({
  image: {
    marginLeft: 5,
    width: 30,
    height: 30,
    marginRight: 5,
    // tintColor: COLORS.black,
  },
  image2: {
    alignContent: "center",
    width: 30,
    height: 30,
    alignItems: "center",
    // tintColor: COLORS.black,
  },
});

export default TextIconButton;
