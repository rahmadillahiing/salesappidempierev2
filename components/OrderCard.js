import React from "react";
import { View, Text, Image, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import TextButton from "./TextButton";
import OrderStatus from "./OrderStatus";

import { FONTS, COLORS, SIZES, constants } from "../constants";
import axios from "axios";

const OrderCard = ({ orderItem, profile }) => {
  const navigation = useNavigation();

  // console.log("order", profile);

  // console.log("profile", profile);

  function getStatus() {
    if (orderItem.status == "D") {
      return "Draft";
    } else if (orderItem.status == "C") {
      return "Complete";
    } else if (orderItem.status == "R") {
      return "Reject";
    } else if (orderItem.status == "E") {
      return "Expired";
    }
  }

  return (
    <View
      style={{
        marginBottom: SIZES.radius,
        padding: SIZES.radius,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.lightGray2,
      }}
    >
      {/* Order Info */}
      <View
        style={{
          flexDirection: "row",
        }}
      >
        {/* Logo */}
        {/* <View
          style={{
            width: 60,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: COLORS.white,
          }}
        >
          <Image
            source={orderItem.image}
            style={{
              width: 35,
              height: 35,
            }}
          />
        </View> */}

        {/* Info */}
        <View
          style={{
            flex: 1,
            marginLeft: SIZES.radius,
          }}
        >
          <Text style={{ ...FONTS.h2, fontSize: 13, lineHeight: 20 }}>
            {orderItem.name}
          </Text>

          <View
            style={{
              flexDirection: "row",
            }}
          >
            {/* Delivered Timestamp */}
            <Text style={{ color: COLORS.gray, ...FONTS.body4 }}>
              {orderItem.orderdate}
            </Text>

            {/* dot separator */}
            <View
              style={{
                backgroundColor: COLORS.gray,
                marginHorizontal: SIZES.base,
                height: 4,
                width: 4,
                borderRadius: 2,
                alignSelf: "center",
              }}
            />

            {/* Item count */}
            <Text style={{ ...FONTS.body4, color: COLORS.gray }}>
              {orderItem.itemCount} items
            </Text>
          </View>

          <OrderStatus
            status={getStatus()}
            containerStyle={{
              marginTop: 0,
            }}
            labelStyle={{
              ...FONTS.body4,
            }}
          />
          {orderItem.alasanspv !== null && (
            <Text
              style={{
                color: COLORS.red,
                ...FONTS.body4,
                fontSize: 12,
                lineHeight: 20,
              }}
            >
              {orderItem.alasanspv}
            </Text>
          )}
        </View>

        {/* Price / Order no */}
        {/* <View>
          <Text
            style={{
              color: COLORS.primary,
              ...FONTS.h2,
              fontSize: 12,
              lineHeight: 1,
            }}
          >
            {["R"].includes(orderItem.status) && `${orderItem.alasan}`}
          </Text>
        </View> */}
      </View>

      {/* Buttons */}
      {orderItem.status == "R" ? (
        <View
          style={{
            marginHorizontal: SIZES.body1,
          }}
        >
          <Text
            style={{
              color: COLORS.red,
              ...FONTS.body4,
              fontSize: 12,
              lineHeight: 20,
            }}
          >
            {["R"].includes(orderItem.status) && `${orderItem.alasan}`}
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            marginTop: SIZES.radius,
          }}
        >
          {orderItem.status === "D" && (
            <>
              <TextButton
                buttonContainerStyle={{
                  ...styles.textButtonContainer,
                  backgroundColor: COLORS.primary,
                }}
                label="Lihat Detail"
                labelStyle={{
                  ...FONTS.h4,
                }}
                onPress={() =>
                  navigation.navigate("DetailEditSoBeras", {
                    detailItem: {
                      orderItem,
                      profile,
                    },
                  })
                }
              />
              {/* <TextButton
                buttonContainerStyle={{
                  ...styles.textButtonContainer,
                  backgroundColor: COLORS.transparentPrimary9,
                  marginLeft: SIZES.radius,
                }}
                label="Cancel"
                labelStyle={{
                  ...FONTS.h4,
                  color: COLORS.primary,
                }}
                onPress={() => {
                  cancelSo(orderItem);
                }}
              /> */}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  textButtonContainer: {
    flex: 1,
    height: 40,
    borderRadius: 10,
  },
});

export default OrderCard;
