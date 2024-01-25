import React, { useEffect, useState } from "react";
import { View, Image, SectionList, Text, TouchableOpacity } from "react-native";

import { Header, IconButton, TextButton, OrderCard } from "../../components";
import {
  COLORS,
  SIZES,
  FONTS,
  icons,
  images,
  dummyData,
  constants,
} from "../../constants";
import axios from "axios";
import { GetDataLocal } from "../../utils";
import moment from "moment";

const EditOrderSalesBeras = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = React.useState("history");
  const [orders, setOrders] = React.useState([]);
  const [profile, setProfile] = useState("");

  useEffect(() => {
    getUser();
  }, []);

  //   useEffect(() => {
  //     const getSalesHeader = async () => {
  //       await axios
  //         .get(
  //           constants.CashColServer +
  //             `/api/v1/salesorder/salesheader/${profile.salesrep}/draft`
  //         )
  //         .then(function (response) {
  //           console.log("data SO", response.data);
  //           setOrders(response.data);
  //         })
  //         .catch((error) => {
  //           console.log("error", error);
  //         });
  //     };
  //     getSalesHeader();
  //   }, []);

  const getSalesHeader = async (id) => {
    await axios
      .get(
        constants.CashColServer + `/api/v1/salesorder/salesheader/${id}/draft`
      )
      .then(function (response) {
        setOrders(response.data);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  async function getUser() {
    await GetDataLocal("user").then((res) => {
      const data = res;
      getSalesHeader(res.salesrep);
      setProfile(data);
    });
  }

  function renderHeader() {
    return (
      <Header
        title="ORDER SAYA"
        containerStyle={{
          height: 50,
          marginHorizontal: SIZES.padding,
          marginTop: 40,
        }}
        leftComponent={
          <IconButton
            icon={icons.back}
            containerStyle={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderRadius: SIZES.radius,
              borderColor: COLORS.gray2,
            }}
            iconStyle={{
              width: 20,
              height: 20,
              tintColor: COLORS.gray2,
            }}
            onPress={() => navigation.goBack()}
          />
        }
        rightComponent={
          <TouchableOpacity onPress={() => console.log("Account")}>
            <Image
              source={images.raja}
              style={{
                width: 40,
                height: 40,
                borderRadius: 5,
              }}
            />
          </TouchableOpacity>
        }
      />
    );
  }

  function renderTabButtons() {
    return (
      <View
        style={{
          flexDirection: "row",
          height: 50,
          marginTop: SIZES.radius,
          paddingHorizontal: SIZES.padding,
        }}
      >
        <TextButton
          buttonContainerStyle={{
            flex: 1,
            borderRadius: SIZES.radius,
            backgroundColor:
              selectedTab == "history"
                ? COLORS.primary
                : COLORS.transparentPrimary9,
          }}
          label="History"
          labelStyle={{
            color: selectedTab == "history" ? COLORS.white : COLORS.primary,
          }}
          onPress={() => {
            setSelectedTab("history");
            if (profile !== "") {
              //   console.log("profile", profile);
              getSalesHeader(profile.salesrep);
            }
          }}
        />
      </View>
    );
  }

  function renderOrders() {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: SIZES.padding,
          paddingHorizontal: SIZES.padding,
        }}
      >
        <SectionList
          sections={orders}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OrderCard orderItem={item} profile={profile} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                marginTop: SIZES.radius,
                marginBottom: SIZES.base,
              }}
            >
              <Text
                style={{
                  ...FONTS.body3,
                  color: selectedTab == "history" ? COLORS.gray : COLORS.black,
                }}
              >
                {title}
              </Text>
            </View>
          )}
          ListFooterComponent={<View style={{ height: 50 }} />}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      {renderHeader()}
      {renderTabButtons()}
      {renderOrders()}
    </View>
  );
};

export default EditOrderSalesBeras;
