import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";

import * as Location from "expo-location";
import DropDownPicker from "react-native-dropdown-picker";
//camera
import { Camera } from "expo-camera";
// import * as ImageManipulator from "expo-image-manipulator";
//async storage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import {
  Header,
  IconButton,
  TextButton,
  RadioButton,
  TextIconButton,
} from "../../components";
import {
  COLORS,
  SIZES,
  FONTS,
  icons,
  images,
  constants,
} from "../../constants";
import { GetDataLocal } from "../../utils";
import axios from "axios";

const CheckOut = ({ navigation }) => {
  const [isGetLocation, setIsGetLocation] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [dataAdditional, setDataAdditional] = useState([]);
  const [openlokasi, setOpenlokasi] = useState(false);
  const [valuelokasi, setValuelokasi] = useState(null);
  const [bpid, setBpid] = useState(null);
  const [valuelokasiCode, setValuelokasiCode] = useState(0);
  const [valuelokasiIdempCode, setValuelokasiIdempCode] = useState(null);
  const [labellokasi, setLabellokasi] = useState(null);
  const [dt, setDt] = useState(null);
  const [tgl, setTgl] = useState(null);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isRemember, setIsRemember] = useState(true);
  const [alasanLain, setAlasanLain] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
    "Wait, we are fetching your location..."
  );
  const [profile, setProfile] = useState({
    fullname: "",
    id: "",
    org: "",
    pass: "",
    salesrep: "",
    whid: "",
    region: "",
    jobid: "",
    jobtitle: "",
  });

  const [useCamera, setUseCamera] = useState(false);
  const cameraRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    // console.log("permission", isGetLocation);
    // if (isGetLocation == false) {
    //   checkInOut();
    getUser();
    // console.log("tes lokasi", profile.id);
    // }

    // console.log("testing lokasi", location);
  }, []);

  useEffect(() => {
    getLokasi();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    let secTimer = setInterval(() => {
      var time = new Date();
      setDt(
        ("0" + time.getHours()).slice(-2) +
          ":" +
          ("0" + time.getMinutes()).slice(-2) +
          ":" +
          ("0" + time.getSeconds()).slice(-2)
      );
      setTgl(
        time.getFullYear() +
          "-" +
          ("0" + (time.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + time.getDate()).slice(-2)
      );
    }, 1000);

    return () => clearInterval(secTimer);
  }, []);

  const takePicture = async () => {
    if (cameraRef) {
      // console.log("in take picture");
      const camRatios = await cameraRef.current.getSupportedRatiosAsync();
      // console.log("ratio camera", camRatios);
      try {
        let photo = await cameraRef.current.takePictureAsync({
          skipProcessing: true,
          // allowsEditing: true,
          // aspect: [4, 3],
          ratio: camRatios,
          quality: 1,
        });
        return photo;
      } catch (e) {
        console.log(e);
      }
    }
  };

  const cleartgl = () => {
    AsyncStorage.removeItem("lokasi")
      .then(() => {
        AsyncStorage.removeItem("todos");
        AsyncStorage.removeItem("retur");
        AsyncStorage.removeItem("sales");
        AsyncStorage.removeItem("salesrmp");
        AsyncStorage.removeItem("salesqty");
        AsyncStorage.removeItem("additional");
        AsyncStorage.removeItem("additionalrmp");
      })
      .catch((error) => console.log(error));
  };

  const simpanData = () => {
    // if (isRemember && image === null) {
    if (image === null) {
      Alert.alert(
        "Lampirkan foto Check out dibawah 5 menit",
        "Lampirkan foto anda didepan toko"
      );
      return;
    }

    setIsLoading(true);

    var data = new FormData();
    data.append("image", {
      uri: image,
      type: "image/jpg",
      name:
        location.locationid != 0
          ? tgl + dt + "-" + location.locationIdemp + "-checkout" + ".jpg"
          : tgl + dt + "-" + location.customer + "-checkout" + ".jpg",
    });

    const config = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
      body: data,
    };

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tanggal: tgl + " " + dt,
        lokasiid: location.locationid,
        nik: location.nik,
        customer: location.customer.replace("'", "`"),
        alasan: isRemember ? "Toko Tutup" : alasanLain,
        lokasiidemp: location.locationIdemp,
        foto:
          location.locationid != 0
            ? tgl + dt + "-" + location.locationid + "-checkout" + ".jpg"
            : tgl + dt + "-" + location.customer + "-checkout" + ".jpg",
      }),
    };
    console.log("tembak data", requestOptions);
    // setIsLoading(true);
    try {
      const response = fetch(constants.loginServer + "/upload", config).then(
        async (response) => {
          const isJson = response.headers
            .get("content-type")
            ?.includes("application/json");
          const hasil1 = isJson && (await response.json());
          // console.log("hasil1", hasil1);
        }
      );
    } catch {
      setIsLoading(false);
      (err) => console.log(err);
      return;
    }

    const url = constants.loginServer + "/updatesalescicov2";

    // setIsLoading(true);
    fetch(url, requestOptions).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const hasil1 = isJson && (await response.json());
      console.log("hasil", hasil1);
      if (!response.ok) {
        console.log("err", response);
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        setIsLoading(false);
        Alert.alert("Invalid Data", "please check the data", [
          { text: "Okay" },
        ]);
        return;
      } else {
        // console.log(hasil1);
        Alert.alert("Sukses", "Checkout Berhasil", [{ text: "Okay" }]);
        cleartgl();
        navigation.navigate("Home");
        setIsLoading(false);
      }
    });
  };

  const getUser = async () => {
    await GetDataLocal("user").then((res) => {
      const data = res;
      console.log("profile", data);
      setProfile(data);
      //   getLokasi(res);
    });
  };

  const getLokasi = async () => {
    await GetDataLocal("lokasi").then((res) => {
      const data = res;
      console.log("lokasi", data);
      setLocation(data);
    });
  };

  function renderHeader() {
    return (
      <Header
        title="CHECK OUT"
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
                width: 50,
                height: 50,
                borderRadius: 5,
              }}
            />
          </TouchableOpacity>
        }
      />
    );
  }

  function renderDetails() {
    return (
      <SafeAreaView>
        <View style={{ marginTop: SIZES.radius }}>
          <Text style={{ color: COLORS.darkGray2, ...FONTS.h2 }}>
            Tanggal : {tgl}
          </Text>
          <Text style={{ color: COLORS.darkGray2, ...FONTS.h2 }}>
            Waktu : {dt}
          </Text>
          <Text style={{ color: COLORS.darkGray2, ...FONTS.h3 }}>
            Lokasi : {location.customer}
          </Text>

          <Text
            style={{
              ...FONTS.h4,
              padding: 10,
              right: 10,
              color: COLORS.black,
            }}
          >
            Alasan Kunjungan Kurang dari 5 Menit
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 5 }}>
          <View
            style={{ alignContent: "flex-start", alignItems: "flex-start" }}
          >
            <RadioButton
              label="Toko Tutup"
              isSelected={isRemember}
              onPress={() => {
                setIsRemember(true);
                setAlasanLain("");
                setImage(null);
              }}
            />
          </View>
          <View
            style={{
              padding: 2,
              alignContent: "flex-start",
              alignItems: "flex-start",
              marginTop: 10,
            }}
          >
            <RadioButton
              label="Alasan Lain"
              isSelected={!isRemember}
              onPress={() => {
                setIsRemember(false);
                setImage(null);
              }}
            />
            <View
              style={{
                width: "100%",
                padding: 5,
                borderColor: COLORS.black,
              }}
            >
              <Text
                style={{
                  ...FONTS.h3,
                  padding: 10,
                  right: 10,
                  color: !isRemember ? COLORS.black : COLORS.lightGray1,
                }}
              >
                Input Alasan Lainnya
              </Text>
              <TextInput
                autoCapitalize="characters"
                editable={!isRemember}
                style={{
                  marginTop: 10,
                  backgroundColor: COLORS.white,
                  borderColor: !isRemember ? COLORS.black : COLORS.lightGray1,
                  borderWidth: 1,
                  width: "100%",
                  borderRadius: 10,
                  padding: 10,
                }}
                value={alasanLain}
                selectTextOnFocus
                onChangeText={(text) => setAlasanLain(text.replace("'", "`"))}
              />
            </View>
            <View style={{ marginTop: SIZES.radius }}>
              {/* <Text
                style={{
                  // color: !isRemember ? COLORS.gray : COLORS.lightGray1,
                  color: COLORS.gray,
                  ...FONTS.body4,
                }}
              >
                Validasi data lokasi anda
              </Text> */}
              <Text
                style={{
                  //   color: isRemember ? COLORS.red2 : COLORS.lightGray1,
                  color: COLORS.red2,
                  ...FONTS.body4,
                }}
              >
                Harus Mengambil foto
              </Text>
              <View
                style={{
                  width: "100%",
                  alignItems: "flex-start",
                  flexDirection: "row",
                }}
              >
                {/* {true && ( */}
                <View>
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: 150,
                      height: 100,
                      backgroundColor: COLORS.lightGray1,
                      borderRadius: 8,
                    }}
                  />
                  {image !== null && (
                    <TouchableOpacity
                      onPress={() => {
                        setImage(null);
                      }}
                    >
                      <Text style={{ fontStyle: "italic", color: "red" }}>
                        Batal
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {/* )} */}
                <TextIconButton
                  containerStyle={{
                    height: 50,
                    width: 50,
                    alignItems: "center",
                    borderRadius: SIZES.padding,
                    backgroundColor: COLORS.lightGray2,
                    marginTop: 20,
                  }}
                  icon={icons.camera}
                  iconPosition="LEFT"
                  labelStyle={{
                    marginLeft: SIZES.middle,
                    color: COLORS.white,
                  }}
                  onPress={async () => {
                    // console.log("in pick camera");
                    setUseCamera(true);
                  }}
                />
              </View>
            </View>
          </View>

          <TextButton
            disabled={isLoading}
            buttonContainerStyle={{
              height: 60,
              marginTop: SIZES.padding,
              marginHorizontal: SIZES.padding,
              marginBottom: SIZES.padding,
              borderRadius: SIZES.radius,
              backgroundColor: isLoading ? COLORS.darkBlue : COLORS.primary,
            }}
            label={isLoading ? "Mohon tunggu" : "Check Out"}
            onPress={simpanData}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  function renderCamera() {
    return (
      <View
        style={{
          flex: 1,
          paddingVertical: SIZES.padding,
          paddingHorizontal: SIZES.radius,
          borderRadius: SIZES.radius,
          backgroundColor: COLORS.lightGray2,
        }}
      >
        <View style={{ flex: 1, marginTop: SIZES.radius }}>
          <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={{ flex: 9 }}></View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setUseCamera(false);
                }}
              >
                <Text style={styles.text}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button]}
                onPress={async () => {
                  // console.log("in take pic");
                  const r = await takePicture();
                  setUseCamera(false);
                  if (!r.cancelled) {
                    // console.log("uri urian", r.uri);
                    setImage(r.uri);
                  }
                  // console.log("response", JSON.stringify(r.uri));
                }}
              >
                <Text style={styles.text}>PICTURE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setType(
                    type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  );
                }}
              >
                <Text style={styles.text}>Flip</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: SIZES.radius,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.lightGray2,
      }}
    >
      {renderHeader()}
      {useCamera ? (
        <View
          style={{
            flex: 1,
            marginTop: SIZES.radius,
            paddingBottom: 40,
          }}
        >
          {renderCamera()}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              marginTop: SIZES.radius,
              // paddingHorizontal: SIZES.padding,
              paddingBottom: 40,
            }}
          >
            {renderDetails()}
          </KeyboardAwareScrollView>

          {/* <TextButton
            buttonContainerStyle={{
              height: 60,
              marginTop: SIZES.padding,
              marginHorizontal: SIZES.padding,
              marginBottom: SIZES.padding,
              borderRadius: SIZES.radius,
              backgroundColor: COLORS.primary,
            }}
            label="Check in"
            onPress={() => simpanCustomer()}
          /> */}
        </View>
      )}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ fontSize: 20, color: "white", marginTop: 16 }}>
            Mohon Tunggu...
          </Text>
        </View>
      )}
    </View>
  );
};

export default CheckOut;

const styles = StyleSheet.create({
  dropdownstyle: {
    flex: 1,
  },
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
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    minWidth: "100%",
    maxHeight: "100%",
    flex: 1,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 40,
    margin: 8,
    backgroundColor: "grey",
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});
