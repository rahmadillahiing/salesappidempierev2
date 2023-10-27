import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Image,
  Animated,
  BackHandler,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { compareVersions } from "compare-versions";

import { constants, images, FONTS, SIZES, COLORS } from "../../constants";
import { TextButton } from "../../components";

import { GetDataLocal } from "../../utils";

const OnBoarding = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatListRef = React.useRef();

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const onViewChangeRef = React.useRef(({ viewableItems, changed }) => {
    setCurrentIndex(viewableItems[0].index);
  });

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const checkingVersion = async () => {
      setIsLoading(true);
      let appDbVersionObject = await axios.get(
        constants.loginServer + "/appversion/" + Constants.manifest.name
      );
      let appDbVersion =
        appDbVersionObject.data.results.data[0].AppProgram_Version;
      let appVersionInternal = Constants.manifest.version;

      let intCompare = compareVersions(appDbVersion, appVersionInternal);

      // console.log("appDbVersion : ", appDbVersion);
      // console.log("appVersionInternal : ", appVersionInternal);
      // console.log("intCompare : ", intCompare);

      //return intCompare;

      if (intCompare == -1) {
        let mismatch = await showAlertMismatchVersion();
        if (mismatch) {
          clearLogin();
          setIsLoading(false);
          BackHandler.exitApp();
        }
      } else {
        if (intCompare == 1) {
          let mismatch = await showAlertMismatchVersion();
          if (mismatch) {
            clearLogin();
            setIsLoading(false);
            BackHandler.exitApp();
          }
        } else {
          setIsLoading(false);
          // bootstrapAsync();
          return;
        }
      }
    };

    checkingVersion();
  }, []);

  const getUser = () => {
    setIsLoading(true);
    GetDataLocal("user").then(async (res) => {
      // console.log("getuser :", res);
      if (res !== null) {
        const response = await axios
          .post(
            constants.idempServerBpr +
              "ADInterface/services/rest/model_adservice/query_data",
            {
              ModelCRUDRequest: {
                ModelCRUD: {
                  serviceType: "getSalesInfo",
                  DataRow: {
                    field: [
                      {
                        "@column": "nik",
                        val: res.id,
                      },
                      {
                        "@column": "Password",
                        val: res.pass,
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
            }
          )
          .then(function (response) {
            console.log("info by token", response.data.WindowTabData.RowCount);
            if (response.status === 200) {
              if (response.data.WindowTabData.RowCount > 0) {
                setTimeout(() => {
                  // if (res.token !== "") {
                  setIsLoading(false);
                  navigation.replace("Home");
                  // } else {
                  //   navigation.navigate("Welcome");
                  // }
                }, 0);
              } else {
                clearLogin();
                setIsLoading(false);
                navigation.replace("SignIn");
              }
            }
          });
      } else {
        setIsLoading(false);
      }
    });
  };

  const clearLogin = () => {
    AsyncStorage.removeItem("user")
      .then(() => {
        AsyncStorage.removeItem("todos");
        AsyncStorage.removeItem("sales");
        AsyncStorage.removeItem("retur");
        AsyncStorage.removeItem("salesqty");
        AsyncStorage.removeItem("additional");
      })
      .catch((error) => console.log(error));
  };

  const showAlertMismatchVersion = async () => {
    return new Promise((resolve, reject) => {
      Alert.alert(
        "Update Program",
        "Harap Update Program",
        [
          {
            text: "OK",
            onPress: () => {
              resolve(true);
            },
          },
        ],
        {
          cancelable: false,
          onDismiss: () => {
            resolve(true);
          },
        }
      );
    });
  };

  const Dots = () => {
    const dotPosition = Animated.divide(scrollX, SIZES.width);

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {constants.onboarding_screens.map((item, index) => {
          const dotColor = dotPosition.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [
              COLORS.lightOrange,
              COLORS.primary,
              COLORS.lightOrange,
            ],
            extrapolate: "clamp",
          });

          const dotWidth = dotPosition.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [10, 30, 10],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={`dot-${index}`}
              style={{
                borderRadius: 5,
                marginHorizontal: 6,
                width: dotWidth,
                height: 10,
                backgroundColor: dotColor,
              }}
            />
          );
        })}
      </View>
    );
  };

  function renderHeaderLogo() {
    return (
      <View
        style={{
          position: "absolute",
          top: SIZES.height > 800 ? 60 : 35,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={images.bprlogo}
          resizeMode="contain"
          style={{
            width: SIZES.width * 0.5,
            height: 100,
          }}
        />
      </View>
    );
  }

  function renderFooter() {
    return (
      <View
        style={{
          height: 160,
        }}
      >
        {/* Pagination / Dots */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Dots />
        </View>

        {/* Buttons */}
        {currentIndex < constants.onboarding_screens.length - 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: SIZES.padding,
              marginVertical: SIZES.padding,
            }}
          >
            <TextButton
              label="Skip"
              buttonContainerStyle={{
                backgroundColor: null,
              }}
              labelStyle={{
                color: COLORS.darkGray2,
              }}
              onPress={() => navigation.replace("SignIn")}
            />

            <TextButton
              label="Next"
              buttonContainerStyle={{
                height: 60,
                width: 200,
                borderRadius: SIZES.radius,
              }}
              onPress={() => {
                flatListRef?.current?.scrollToIndex({
                  index: currentIndex + 1,
                  animated: true,
                });
              }}
            />
          </View>
        )}

        {currentIndex == constants.onboarding_screens.length - 1 && (
          <View
            style={{
              paddingHorizontal: SIZES.padding,
              marginVertical: SIZES.padding,
            }}
          >
            <TextButton
              label="Let's Get Started"
              buttonContainerStyle={{
                height: 60,
                borderRadius: SIZES.radius,
              }}
              onPress={() => navigation.replace("SignIn")}
            />
          </View>
        )}
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
      {renderHeaderLogo()}

      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ fontSize: 20, color: "white", marginTop: 16 }}>
            Mohon Tunggu...
          </Text>
        </View>
      )}

      <Animated.FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        data={constants.onboarding_screens}
        scrollEventThrottle={16}
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewChangeRef.current}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item, index }) => {
          return (
            <View
              style={{
                width: SIZES.width,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flex: 3,
                }}
              >
                <ImageBackground
                  source={item.backgroundImage}
                  resizeMode="stretch"
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: index == 1 ? "86%" : "100%",
                    width: "100%",
                  }}
                >
                  <Image
                    source={item.bannerImage}
                    resizeMode="contain"
                    style={{
                      width:
                        SIZES.height > 800
                          ? SIZES.width * 0.8
                          : SIZES.width * 0.7,
                      height:
                        SIZES.height > 800
                          ? SIZES.width * 0.8
                          : SIZES.width * 0.7,
                      marginBottom: -SIZES.padding,
                    }}
                  />
                </ImageBackground>
              </View>

              {/* Detail */}
              <View
                style={{
                  flex: 1,
                  marginTop: 30,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: SIZES.radius,
                }}
              >
                <Text style={{ ...FONTS.h1, fontSize: 25 }}>{item.title}</Text>
                <Text
                  style={{
                    marginTop: SIZES.radius,
                    textAlign: "center",
                    color: COLORS.darkGray,
                    paddingHorizontal: SIZES.padding,
                    ...FONTS.body3,
                  }}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {renderFooter()}
    </View>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: COLORS.darkBlue,
    fontWeight: "500",
  },
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
});
