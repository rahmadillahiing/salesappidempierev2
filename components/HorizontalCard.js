import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { COLORS, FONTS, icons, SIZES } from "../constants";

const HorizontalCard = ({
  containerStyle,
  imageStyle,
  item,
  onPress,
  lokasi,
}) => {
  // console.log("item", item);
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.lightGray2,
        ...containerStyle,
        marginTop: 10,
      }}
      onPress={onPress}
    >
      {/* Info */}
      <View
        style={{
          flex: 1,
          // marginTop: SIZES.padding
        }}
      >
        {/* Name */}
        <Text style={{ ...FONTS.h4 }}>{item.name}</Text>
        {/* Description */}
        <Text style={{ color: COLORS.darkGray2, ...FONTS.h5 }}>
          {item.jenis}
        </Text>
        {/* {console.log("tes", item.timeot)} */}
        {item.timein != null && item.timeot != null && (
          <Text>
            CI : {item.timein} CO: {item.timeot}
          </Text>
        )}
        <View style={{ flexDirection: "row" }}>
          {item.countso !== null && (
            <View style={{ flexDirection: "row" }}>
              <Text>SO : </Text>
              <Image
                source={icons.correct}
                style={{ width: 20, height: 20, tintColor: COLORS.green }}
              />
            </View>
          )}
          {item.countretur !== null && (
            <View style={{ flexDirection: "row" }}>
              <Text> Retur : </Text>
              <Image
                source={icons.correct}
                style={{ width: 20, height: 20, tintColor: COLORS.green }}
              />
            </View>
          )}
        </View>
      </View>

      {/* detail */}
      <View
        style={{
          flexDirection: "row",
          position: "absolute",
          top: 5,
          right: SIZES.radius,
        }}
      >
        <Text
          style={{
            ...FONTS.h0,
            fontSize: 14,
            alignItems: "center",
            alignContent: "center",
          }}
        >
          {item.tgl === "" ? item.tglin : item.tgl}
        </Text>
        {item.name === lokasi && item.tglout === null ? (
          <Image
            source={icons.clock}
            style={{
              width: 20,
              height: 20,
              tintColor: COLORS.red,
            }}
          />
        ) : (
          <Image
            source={item.timeot === null ? icons.calories : icons.hand}
            style={{
              width: 20,
              height: 20,
            }}
          />
        )}
        {/* <Text style={{ ...FONTS.body5, color: COLORS.darkGray2 }}>
          {item.calories} Calories
        </Text> */}
      </View>
    </TouchableOpacity>
  );
};

export default HorizontalCard;
