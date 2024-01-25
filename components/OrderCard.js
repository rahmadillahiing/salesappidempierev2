import React from "react";
import { View, Text, Image, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import TextButton from "./TextButton";
import OrderStatus from "./OrderStatus";

import { FONTS, COLORS, SIZES, constants } from "../constants";
import axios from "axios";

const OrderCard = ({ orderItem, profile }) => {
  const navigation = useNavigation();

  console.log("order", orderItem);

  console.log("profile", profile);

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

  // async function cancelSo(order) {
  //   console.log("data", order);

  //   Alert.alert(
  //     "Reject Sales Order?",
  //     "Cancel Sales Order " + order.name + " tanggal" + order.orderdate + "?",
  //     [
  //       {
  //         text: "Yes",
  //         onPress: async () => {
  //           axios
  //             .get(
  //               constants.CashColServer +
  //                 `/api/v1/salesorder/salesheader/${order.orderid}/cancelso`
  //             )
  //             .then(function (response) {
  //               Alert.alert("Data SO terupdate", response, [{ text: "Okay" }]);
  //             })
  //             .catch((error) => {
  //               console.log("error update", error);
  //             });
  //         },
  //       },
  //       {
  //         text: "No",
  //         onPress: () => {
  //           return;
  //         },
  //       },
  //     ]
  //   );
  // }

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
        </View>

        {/* Price / Order no */}
        {/* <View>
          <Text
            style={{
              color: COLORS.primary,
              ...FONTS.h2,
              fontSize: 18,
              lineHeight: 0,
            }}
          >
            {["C", "D"].includes(orderItem.status)
              ? `$${orderItem.price.toFixed(2)}`
              : `#${orderItem.id}`}
          </Text>
        </View> */}
      </View>

      {/* Buttons */}
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
