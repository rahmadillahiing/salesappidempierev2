import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";

import { COLORS, FONTS, SIZES } from "../constants";

const OrderStatus = ({ status, containerStyle, labelStyle }) => {
  function getColor() {
    if (status == "Draft") {
      return COLORS.blue;
    } else if (status == "Reject") {
      return COLORS.red;
    } else if (status == "Complete") {
      return COLORS.green;
    } else {
      return COLORS.orange;
    }
  }

  function getLabel() {
    if (status == "Draft") {
      return "Menunggu Approval";
    } else if (status == "Reject") {
      return "Reject/Cancel";
    } else if (status == "Complete") {
      return "Terkonfirmasi";
    } else {
      return "SO Expired";
    }
  }

  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: SIZES.radius,
        alignItems: "center",
        ...containerStyle,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: getColor(),
        }}
      />
      <Text
        style={{
          color: getColor(),
          marginLeft: SIZES.base,
          ...FONTS.body3,
          ...labelStyle,
        }}
      >
        {getLabel()}
      </Text>
    </View>
  );
};

OrderStatus.propTypes = {
  status: PropTypes.oneOf(["Draft", "Complete", "Reject", "Expired"]),
};

export default OrderStatus;
