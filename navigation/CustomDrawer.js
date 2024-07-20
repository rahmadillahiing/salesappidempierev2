import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  useDrawerProgress,
} from "@react-navigation/drawer";
import axios from "axios";
import Animated from "react-native-reanimated";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setSelectedTab } from "../stores/tab/tabActions";

import { MainLayout } from "../screens";
import { GetDataLocal } from "../utils";
import {
  COLORS,
  FONTS,
  SIZES,
  constants,
  icons,
  dummyData,
} from "../constants";

const Drawer = createDrawerNavigator();

const CustomDrawerItem = ({ label, icon, isFocused, onPress, disabled }) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={{
        flexDirection: "row",
        height: 32,
        marginBottom: SIZES.base,
        alignItems: "center",
        paddingLeft: SIZES.radius,
        borderRadius: SIZES.base,
        backgroundColor: isFocused ? COLORS.transparentBlack1 : null,
      }}
      onPress={onPress}
    >
      <Image
        source={icon}
        style={{
          width: 20,
          height: 20,
          tintColor: disabled ? COLORS.darkGray : COLORS.white,
        }}
      />

      <Text
        style={{
          marginLeft: 5,
          color: disabled ? COLORS.darkGray : COLORS.white,
          ...FONTS.h5,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const CustomDrawerContent = ({ navigation, selectedTab, setSelectedTab }) => {
  const [arSalesman, setArSalesman] = useState([]);
  const [profile, setProfile] = useState({
    fullname: "",
    token: "",
    id: "",
  });

  useEffect(() => {
    // console.log("cek login");
    getUser();
  }, []);

  const getUser = () => {
    GetDataLocal("user").then((res) => {
      const data = res;
      // console.log("profile di button", data);
      setProfile(data);
      if (data.jobid == 1000006) {
        cekArPersalesman(res.salesrep);
      } else {
        var dataAr = {
          invoicecount: 0,
          invoicevalue: 0,
        };
        setArSalesman(dataAr);
      }
    });
  };

  async function cekArPersalesman(salesman) {
    console.log("kode sales", salesman);
    var config2 = {
      method: "post",
      url:
        constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getOpenInvoiceArSalesman",
            DataRow: {
              field: [
                {
                  "@column": "SalesRep_ID",
                  val: salesman,
                },
              ],
            },
          },
          ADLoginRequest: {
            user: "belitangSales",
            pass: "Sales100%",
            lang: "en_US",
            ClientID: "1000003",
            RoleID: "1000006",
            OrgID: "0",
            WarehouseID: "0",
            stage: "9",
          },
        },
      },
    };

    axios(config2).then(function async(response) {
      console.log("respon AR", response.data.WindowTabData.RowCount);
      if (response.data.WindowTabData.RowCount > 0) {
        console.log("masuk itung AR");
        var dataAr = {
          invoicecount:
            response.data.WindowTabData.DataSet.DataRow.field[3].val,
          invoicevalue:
            response.data.WindowTabData.DataSet.DataRow.field[4].val,
        };
      } else {
        // console.log("masuk 0");
        var dataAr = {
          invoicecount: 0,
          invoicevalue: 0,
        };
      }
      // console.log("cek AR salesman", dataAr);
      setArSalesman(dataAr);
    });
  }

  const clearLogin = () => {
    AsyncStorage.removeItem("user")
      .then(() => {
        AsyncStorage.removeItem("todos");
        AsyncStorage.removeItem("sales");
        AsyncStorage.removeItem("retur");
        AsyncStorage.removeItem("salesqty");
        // AsyncStorage.removeItem("lokasi");
        navigation.replace("SignIn");
      })
      .catch((error) => console.log(error));
  };

  return (
    <DrawerContentScrollView
      scrollEnabled={false}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: COLORS.primary,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: SIZES.base,
        }}
      >
        {/* Profile */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            marginTop: SIZES.radius,
            alignItems: "center",
          }}
          onPress={() => {
            navigation.closeDrawer();
          }}
        >
          <Image
            source={dummyData.myProfile?.profile_image}
            style={{
              width: 50,
              height: 50,
              borderRadius: SIZES.radius,
            }}
          />

          <View
            style={{
              marginLeft: SIZES.radius,
            }}
          >
            <Text style={{ color: COLORS.white, ...FONTS.h3 }}>
              {profile.fullname}
            </Text>
            {/* <Text style={{ color: COLORS.white, ...FONTS.body4 }}>
              View your profile
            </Text> */}
          </View>
        </TouchableOpacity>

        {/* Drawer Items */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            paddingHorizontal: SIZES.radius,
          }}
        >
          <View
            style={{
              flex: 1,
              marginTop: SIZES.height > 800 ? SIZES.padding : SIZES.base,
            }}
          >
            <CustomDrawerItem
              label={constants.screens.home}
              icon={icons.home}
              isFocused={selectedTab == constants.screens.home}
              onPress={() => {
                setSelectedTab(constants.screens.home);
                navigation.navigate("MainLayout");
              }}
              profile={profile}
            />

            {/* Line Divider */}
            <View
              style={{
                height: 1,
                marginVertical: SIZES.height > 800 ? SIZES.radius : 0,
                marginLeft: SIZES.radius,
                backgroundColor: COLORS.lightGray1,
              }}
            />
            {profile.jobid != "1000008" ? (
              <View>
                <CustomDrawerItem
                  label="Display before"
                  icon={icons.boxes}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("ShelvingAwal");
                  }}
                />
                <CustomDrawerItem
                  label="Display After"
                  icon={icons.rack}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("ShelvingSetelah");
                  }}
                />
                <CustomDrawerItem
                  label="Shelving & Floor"
                  icon={icons.floor}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("ShelvingFloor");
                  }}
                />

                <CustomDrawerItem
                  label="Cek Stock"
                  icon={icons.box}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("StockSurvey");
                  }}
                />
                <View
                  style={{
                    height: 1,
                    marginVertical: SIZES.height > 800 ? SIZES.radius : 0,
                    marginLeft: SIZES.radius,
                    backgroundColor: COLORS.lightGray1,
                  }}
                />
              </View>
            ) : (
              ""
            )}

            {/* <View
              style={{
                height: 1,
                marginVertical: SIZES.height > 800 ? SIZES.radius : 0,
                marginLeft: SIZES.radius,
                backgroundColor: COLORS.lightGray1,
              }}
            /> */}
            {/* 1000008,1000007 */}
            {profile.jobid == "1000006" ? (
              <View>
                <CustomDrawerItem
                  label="Input SO Beras"
                  icon={icons.discount}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("salesorderBeras");
                  }}
                />

                <CustomDrawerItem
                  label="Input Retur Beras"
                  icon={icons.help}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("Retur");
                  }}
                />
                <View
                  style={{
                    height: 1,
                    marginVertical: SIZES.height > 800 ? SIZES.radius : 0,
                    marginLeft: SIZES.radius,
                    backgroundColor: COLORS.lightGray1,
                  }}
                />
              </View>
            ) : (
              ""
            )}

            {profile.jobid != "1000007" ? (
              <View>
                <CustomDrawerItem
                  label="Konfirmasi Invoice"
                  icon={icons.globe}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("ConfirmInvoice");
                  }}
                />

                <CustomDrawerItem
                  label="Konfirmasi TTF"
                  icon={icons.globe}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("ConfirmTtf");
                  }}
                />

                <CustomDrawerItem
                  label="Invoice Kunjungan"
                  icon={icons.term}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("BillingCustomer");
                  }}
                />

                <CustomDrawerItem
                  label="Invoice Nonkunjungan"
                  icon={icons.term}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("BillingInvoiceNonKunjungan");
                  }}
                />

                <CustomDrawerItem
                  label="Invoice Status"
                  icon={icons.term}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("InvoiceEditHeader");
                  }}
                />

                {/* Line Divider */}
                <View
                  style={{
                    height: 1,
                    marginVertical:
                      SIZES.height > 800 ? SIZES.radius : SIZES.base,
                    marginLeft: SIZES.radius,
                    backgroundColor: COLORS.lightGray1,
                  }}
                />
              </View>
            ) : (
              ""
            )}

            {profile.jobid == "1000006" ? (
              <View>
                <CustomDrawerItem
                  label="Customer Baru"
                  disabled={arSalesman.invoicecount >= 15 ? true : false}
                  icon={icons.location}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("CustomerSurvey");
                  }}
                />

                <CustomDrawerItem
                  label="Perubahan CL"
                  icon={icons.bar}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("CreditLimit");
                  }}
                />

                {/* Line Divider */}
                <View
                  style={{
                    height: 1,
                    marginVertical:
                      SIZES.height > 800 ? SIZES.radius : SIZES.base,
                    marginLeft: SIZES.radius,
                    backgroundColor: COLORS.lightGray1,
                  }}
                />

                <CustomDrawerItem
                  label="Monitoring SO"
                  icon={icons.globe}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("MonitoringSo");
                  }}
                />
                <CustomDrawerItem
                  label="Edit SO"
                  icon={icons.cart}
                  onPress={() => {
                    navigation.closeDrawer();
                    navigation.navigate("EditSalesOrderBeras");
                  }}
                />
                <View
                  style={{
                    height: 1,
                    marginVertical:
                      SIZES.height > 800 ? SIZES.radius : SIZES.base,
                    marginLeft: SIZES.radius,
                    backgroundColor: COLORS.lightGray1,
                  }}
                />
              </View>
            ) : (
              ""
            )}
          </View>
          {/* Line Divider */}

          <View
            style={{
              marginBottom: SIZES.height > 800 ? SIZES.padding : 0,
            }}
          >
            <CustomDrawerItem
              label="Logout"
              icon={icons.logout}
              onPress={clearLogin}
            />
          </View>
        </ScrollView>
      </View>
    </DrawerContentScrollView>
  );
};

const CustomDrawer = ({ selectedTab, setSelectedTab }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.primary,
      }}
    >
      <Drawer.Navigator
        useLegacyImplementation={false}
        drawerType="slide"
        overlayColor="transparent"
        screenOptions={{
          headerShown: false,
          overlayColor: "transparent",
          drawerStyle: {
            width: "60%",
          },
        }}
        initialRouteName="MainLayout"
        drawerContent={(props) => {
          return (
            <CustomDrawerContent
              navigation={props.navigation}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          );
        }}
      >
        <Drawer.Screen name="MainLayout">
          {(props) => <MainLayout {...props} />}
        </Drawer.Screen>
      </Drawer.Navigator>
    </View>
  );
};

function mapStateToProps(state) {
  return {
    selectedTab: state.tabReducer.selectedTab,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSelectedTab: (selectedTab) => {
      return dispatch(setSelectedTab(selectedTab));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomDrawer);
