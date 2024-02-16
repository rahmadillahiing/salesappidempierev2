import React from "react";
import { View, Text } from "react-native";

import LineDivider from "./LineDivider";
import { COLORS, FONTS } from "../constants";

const InfoItem = ({ label, value, withDivider = true }) => {
  return (
    <>
      <View
        style={{
          padding: 5,
          flexDirection: "row",
          height: 30,
          alignItems: "center",
        }}
      >
        <Text style={{ color: COLORS.gray, ...FONTS.body5 }}>{label}</Text>
        <Text style={{ flex: 1, textAlign: "right", ...FONTS.body5 }}>
          {value}
        </Text>
      </View>

      {withDivider && (
        <LineDivider
          lineStyle={{
            backgroundColor: COLORS.lightGray1,
          }}
        />
      )}
    </>
  );
};

export default InfoItem;
