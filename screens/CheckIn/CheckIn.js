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

const CheckIn = ({ navigation }) => {
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
  const [lokasiLain, setLokasiLain] = useState("");
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
    if (isGetLocation == false) {
      checkInOut();
      getUser();
      // console.log("tes lokasi", profile.id);
    }

    // console.log("testing lokasi", location);
  }, [dt]);

  // useEffect(() => {
  //   getUser();
  //   // checkInOut();
  //   // getLokasi();
  //   // checkInOut();
  // }, []);

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
      const camRatios = await cameraRef.current.getSupportedRatiosAsync();
      // console.log("ratio camera", camRatios);
      // console.log("in take picture");
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

  const simpanData = () => {
    // console.log("valuelokasiIdempCode", valuelokasiIdempCode);
    // console.log("lokasiLain", lokasiLain);
    // console.log("labellokasi", labellokasi);
    // console.log("value", valuelokasi);
    if (displayCurrentAddress === "Wait, we are fetching you location...") {
      Alert.alert(
        "Invalid Geo location",
        "Data Geotagging belum didapatkan, pastikan data sudah muncul terlebih dahulu sebelum melakukan check in"
      );
      return;
    }

    if (valuelokasiIdempCode === null && lokasiLain.trim() == "") {
      Alert.alert(
        "Invalid Data Lokasi",
        isRemember
          ? "Pilih Lokasi kunjungan terlebih dahulu"
          : "Tulis lokasi kunjungan customer prospek terlebih dahulu"
      );
      return;
    }

    // if (!isRemember && image === null) {
    if (image === null) {
      Alert.alert("Lampirkan foto", "Lampirkan foto anda didepan toko");
      return;
    }

    setIsLoading(true);

    var data = new FormData();
    data.append("image", {
      uri: image,
      type: "image/jpg",
      // name: tgl + dt + "-" + lokasiLain + ".jpg",
      name: isRemember
        ? tgl + dt + "-" + valuelokasiIdempCode + ".jpg"
        : tgl + dt + "-" + lokasiLain + ".jpg",
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
        lokasigps: displayCurrentAddress,
        lokasiid: isRemember ? valuelokasiCode : lokasiLain,
        latitude: latitude,
        longitude: longitude,
        nik: profile.id,
        // foto: isRemember ? image : tgl + dt + "-" + lokasiLain + ".jpg",
        foto: isRemember
          ? tgl + dt + "-" + valuelokasiIdempCode + ".jpg"
          : tgl + dt + "-" + lokasiLain + ".jpg",
        lokasi: isRemember ? labellokasi : lokasiLain,
        lokasiidemp: valuelokasiIdempCode,
      }),
    };
    // console.log("req absen", requestOptions);
    // console.log("req", {
    //   tanggal: tgl + " " + dt,
    //   lokasigps: displayCurrentAddress,
    //   lokasiid: isRemember ? valuelokasi : lokasiLain,
    //   latitude: latitude,
    //   longitude: longitude,
    //   nik: profile.id,
    //   foto: isRemember ? image : tgl + dt + "-" + lokasiLain + ".jpg",
    //   lokasi: labellokasi,
    // });

    // if (isRemember === false) {
    setIsLoading(true);
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
    // }

    const url = constants.loginServer + "/insertsalescicov2";
    setIsLoading(true);
    // console.log("url", url);
    fetch(url, requestOptions).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const hasil1 = isJson && (await response.json());
      // console.log("hasil insert", hasil1);
      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        Alert.alert("Invalid Data", "please check the data", [
          { text: "Okay" },
        ]);
        setIsLoading(false);
        return;
      } else {
        // clearCombo();
        const dataLocation = {
          locationid: isRemember ? valuelokasiCode : "0",
          locationIdemp: isRemember ? valuelokasiIdempCode : "0",
          waktuin: dt,
          tanggal: tgl,
          lokasi: displayCurrentAddress,
          nama: profile.fullname,
          region: profile.region,
          nik: profile.id,
          org: profile.org,
          pass: profile.pass,
          salesrep: profile.salesrep,
          whid: profile.whid,
          customer: isRemember ? labellokasi : lokasiLain,
        };

        // console.log("data di cache", dataLocation);
        persistLocation({ dataLocation });

        persistAdditional();
        //rmp dimatikan sementara
        // persistLocationRmp({ valuelokasiIdempCode });

        Alert.alert("Data succesfully saved", "", [
          {
            text: "Okay",
            onPress: () => {
              // if (canGoBack()) {
              navigation.navigate("Home");
              // } else {
              //   navigate("Home");
              // }
            },
          },
        ]);
        setIsLoading(false);
      }
    });
    // setIsLoading(false);
  };

  const persistLocationRmp = async (dataBp) => {
    const response = await axios.post(
      constants.idempServerRmp +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getCustomers",
            DataRow: {
              field: [
                {
                  "@column": "C_BPartner_ID",
                  val: dataBp,
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
    );
    const count = response.data.WindowTabData.RowCount;

    if (count > 0) {
      const dataLocationRmp = {
        bpid: response.data.WindowTabData.DataSet.DataRow.field[7].val,
        oa: response.data.WindowTabData.DataSet.DataRow.field[6].val,
        pricelistid: response.data.WindowTabData.DataSet.DataRow.field[4].val,
        cl: response.data.WindowTabData.DataSet.DataRow.field[9].val,
        clavailable: response.data.WindowTabData.DataSet.DataRow.field[11].val,
        addstart1: response.data.WindowTabData.DataSet.DataRow.field[12].val,
        addstart2: response.data.WindowTabData.DataSet.DataRow.field[13].val,
      };

      await AsyncStorage.setItem(
        "additionalrmp",
        JSON.stringify(dataLocationRmp)
      )
        .then(() => {
          console.log("additional RMP :", dataLocationRmp);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const persistLocation = (dataLocation) => {
    AsyncStorage.setItem("lokasi", JSON.stringify(dataLocation.dataLocation))
      .then(() => {
        // console.log("lokasi :", dataLocation.dataLocation);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const persistAdditional = async () => {
    await AsyncStorage.setItem("additional", JSON.stringify(dataAdditional))
      .then(() => {
        console.log("additional :", dataAdditional);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getUser = async () => {
    await GetDataLocal("user").then((res) => {
      const data = res;
      // console.log("profile", data);
      setProfile(data);
      getLokasi(res);
    });
  };

  const getLokasi = async (result) => {
    // console.log("Cek user", result.jobid);
    let kolom = "";
    let parameter = "";
    if (result.jobid == 1000006) {
      kolom = "SalesRep_ID";
      parameter = result.salesrep;
    } else {
      kolom = "C_SalesRegion_ID";
      parameter = result.region;
    }
    // idempiere
    const response = await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getCustomers",
            DataRow: {
              field: [
                {
                  "@column": kolom,
                  val: parameter,
                },
                // {
                //   "@column": "C_SalesRegion_ID",
                //   val: result.region,
                // },
                // {
                //   "@column": "SalesRep_ID",
                //   val: result.salesrep,
                // },
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
    );
    const count = response.data.WindowTabData.RowCount;
    // console.log("hitung", count);
    const dataLokasi = [];
    for (var i = 0; i < count; i++) {
      dataLokasi.push({
        key: response.data.WindowTabData.DataSet.DataRow[i].field[0].val,
        label: response.data.WindowTabData.DataSet.DataRow[i].field[1].val,
        value:
          response.data.WindowTabData.DataSet.DataRow[i].field[0].val +
          " " +
          response.data.WindowTabData.DataSet.DataRow[i].field[3].val,
        pricelistid:
          response.data.WindowTabData.DataSet.DataRow[i].field[4].val,
        oa: response.data.WindowTabData.DataSet.DataRow[i].field[6].val,
        cl: response.data.WindowTabData.DataSet.DataRow[i].field[9].val,
        custidemp: response.data.WindowTabData.DataSet.DataRow[i].field[5].val,
        clavailable:
          response.data.WindowTabData.DataSet.DataRow[i].field[11].val,
        bpid: response.data.WindowTabData.DataSet.DataRow[i].field[7].val,
        wmin1: response.data.WindowTabData.DataSet.DataRow[i].field[12].val,
        wmin2: response.data.WindowTabData.DataSet.DataRow[i].field[13].val,
      });
    }
    // console.log("data lokasi", dataLokasi);
    setItems(dataLokasi);
  };

  const checkInOut = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("status", status);

    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });

    console.log("kordinat", coords);
    setLocation(JSON.stringify(coords));
    setLatitude(JSON.stringify(coords.latitude));
    setLongitude(JSON.stringify(coords.longitude));

    // console.log(
    //   "location",
    //   JSON.stringify(coords.latitude + "," + coords.longitude)
    // );

    if (coords) {
      const { latitude, longitude } = coords;

      let lokasi = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      // console.log("lokasi", lokasi);
      setIsGetLocation(true);

      const alamat = axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}
      &location_type=ROOFTOP&result_type=street_address&key=${constants.GOOGLE_MAP_API_KEY}`
        )
        .then((response) => {
          // console.log(
          //   "data",
          //   JSON.stringify(response.data.results[0].formatted_address)
          // );
          setDisplayCurrentAddress(response.data.results[0].formatted_address);
        });

      // for (let item of lokasi) {
      //   let address = `${item.district}, ${item.city}, ${item.region}, ${item.postalCode}`;

      //   setDisplayCurrentAddress(address);
      // }
    }
  };

  function renderHeader() {
    return (
      <Header
        title="CHECK IN"
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
            Lokasi : {displayCurrentAddress}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ padding: 20 }}
        >
          <View style={styles.dropdowncontainer}>
            <View
              style={{ alignContent: "flex-start", alignItems: "flex-start" }}
            >
              <RadioButton
                label="Lokasi kunjungan terdaftar"
                isSelected={isRemember}
                onPress={() => {
                  setIsRemember(true);
                  setLokasiLain("");
                  setImage(null);
                }}
              />

              <Text
                style={{
                  ...FONTS.h3,
                  padding: 10,
                  right: 10,
                  color: isRemember ? COLORS.black : COLORS.lightGray1,
                }}
              >
                Lokasi Kunjungan
              </Text>
            </View>
            <View style={styles.dropdownstyle}>
              <DropDownPicker
                style={{
                  borderColor: isRemember ? COLORS.black : COLORS.lightGray1,
                }}
                listMode="MODAL"
                itemKey={items.key}
                searchable={true}
                disabled={!isRemember}
                open={openlokasi}
                value={valuelokasi}
                items={items}
                setOpen={setOpenlokasi}
                setValue={setValuelokasi}
                setItems={setItems}
                placeholder="Pilih Lokasi"
                defaultValue={items}
                zIndex={10}
                onSelectItem={(value) => {
                  setBpid(value.bpid);
                  setValuelokasiCode(value.key);
                  setValuelokasiIdempCode(value.custidemp);
                  // console.log("isi semua", value);
                  setLabellokasi(value.label);
                  setDataAdditional({
                    bpid: value.bpid,
                    oa: value.oa,
                    pricelistid: value.pricelistid,
                    cl: value.cl,
                    clavailable: value.clavailable,
                    addstart1: value.wmin1,
                    addstart2: value.wmin2,
                  });
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
                label="Kunjungan customer prospek"
                isSelected={!isRemember}
                onPress={() => {
                  setIsRemember(false);
                  setValuelokasi(null);
                  setLabellokasi(null);
                  setValuelokasiIdempCode(null);
                  setValuelokasiCode(0);
                  setBpid(null);
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
                  Input lokasi saat ini
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
                  value={lokasiLain}
                  selectTextOnFocus
                  onChangeText={(text) => setLokasiLain(text.replace("'", "`"))}
                />
              </View>
              <View style={{ marginTop: SIZES.radius }}>
                <Text
                  style={{
                    // color: !isRemember ? COLORS.gray : COLORS.lightGray1,
                    color: COLORS.gray,
                    ...FONTS.body4,
                  }}
                >
                  Validasi data lokasi anda
                </Text>
                <Text
                  style={{
                    // color: !isRemember ? COLORS.red2 : COLORS.lightGray1,
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
                    // disabled={isRemember}
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
              label={isLoading ? "Mohon tunggu" : "Check in"}
              onPress={simpanData}
            />
          </View>
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

export default CheckIn;

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
