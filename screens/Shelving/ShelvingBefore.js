import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Camera } from "expo-camera";
// import * as ImageManipulator from "expo-image-manipulator";
import { GetDataLocal } from "../../utils";

import {
  Header,
  IconButton,
  TextButton,
  TextIconButton,
} from "../../components";
import { COLORS, SIZES, icons, images, constants } from "../../constants";

const ShelvingBefore = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const cameraRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [lokasi, setLokasi] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    getLokasi();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takePicture = async () => {
    getLokasi();
    if (cameraRef) {
      // console.log("in take picture");
      const camRatios = await cameraRef.current.getSupportedRatiosAsync();
      try {
        let photo = await cameraRef.current.takePictureAsync({
          skipProcessing: true,
          // allowsEditing: true,
          // aspect: [4, 3],
          ratio: camRatios,
          quality: 1,
        });
        // let resizePhoto = await ImageManipulator.manipulateAsync(
        //   photo.uri,
        //   [
        //     {
        //       resize: { width: photo.width * 0.3, height: photo.height * 0.3 },
        //     },
        //   ],
        //   { compress: 1, format: "png", base64: false }
        // );
        // return resizePhoto;
        return photo;
      } catch (e) {
        console.log(e);
      }
    }
  };

  const getCurrentTime = () => {
    let today = new Date();
    let hours = (today.getHours() < 10 ? "0" : "") + today.getHours();
    let minutes = (today.getMinutes() < 10 ? "0" : "") + today.getMinutes();
    let seconds = (today.getSeconds() < 10 ? "0" : "") + today.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
  };

  function getLokasi() {
    GetDataLocal("lokasi").then((res) => {
      // console.log("lokasi survey", res);
      if (res !== null) {
        setLokasi(res);
      } else {
        setLokasi(null);
      }
    });
  }

  const simpanDisplayBefore = () => {
    // console.log("lokasi", lokasi.customer);
    if (image == null) {
      Alert.alert("Informasi", "Anda belum melakukan pengambilan foto");
      return;
    }
    if (lokasi !== null) {
      if (lokasi.locationid !== null) {
        Alert.alert("Simpan Data", "Apakah anda ingin menyimpan data ini?", [
          {
            text: "Yes",
            onPress: () => {
              // console.log(lokasi);
              setIsLoading(true);
              var data = new FormData();
              data.append("image", {
                uri: image,
                type: "image/jpg",
                name:
                  lokasi.tanggal +
                  lokasi.locationid +
                  lokasi.nik +
                  getCurrentTime() +
                  "displaybn.jpg",
              });
              // console.log("tes data", data);
              const config = {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "multipart/form-data",
                },
                body: data,
              };

              try {
                const response = fetch(
                  constants.loginServer + "/upload",
                  config
                ).then(async (response) => {
                  const isJson = response.headers
                    .get("content-type")
                    ?.includes("application/json");
                  const hasil1 = isJson && (await response.json());
                  // console.log("respon foto", hasil1);
                  const pathSave = hasil1[0].path;
                  // console.log("culade", pathSave);
                  if (pathSave !== "undefined") {
                    const requestOptions = {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        tanggal: lokasi.tanggal,
                        lokasiid: lokasi.locationid,
                        path: pathSave,
                        nik: lokasi.nik,
                        lokasiname: lokasi.customer,
                      }),
                    };
                    // console.log("kirim data foto :", requestOptions);
                    const url = constants.loginServer + "/insertsalesdisplay";
                    fetch(url, requestOptions).then(async (response) => {
                      const isJson = response.headers
                        .get("content-type")
                        ?.includes("application/json");
                      const hasil1 = isJson && (await response.json());
                      if (!response.ok) {
                        setIsLoading(false);
                        Alert.alert("Data Invalid", "Hubungi IT", [
                          { text: "Okay" },
                        ]);
                        return;
                      } else {
                        setIsLoading(false);
                        // console.log("data tersimpan :", hasil1);
                        Alert.alert("Sukses", "Data telah tersimpan", [
                          { text: "Okay" },
                        ]);
                        setImage(null);
                      }
                    });
                  }
                });
              } catch {
                setIsLoading(false);
                (err) => console.log(err);
                return;
              }
            },
          },
          {
            text: "No",
            onPress: () => {
              return;
            },
          },
        ]);
      } else {
        Alert.alert(
          "Warning",
          "Belum Melakukan Check in/berada di lokasi non customer"
        );
        return;
      }
    } else {
      // console.log("cek lokasi", lokasi !== null);
      Alert.alert(
        "Warning",
        "Belum Melakukan Check in/berada di lokasi non customer"
      );
      return;
    }
  };

  function renderHeader() {
    return (
      <Header
        title="TAMPILAN SEBELUM"
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
            onPress={() => navigation.navigate("Home")}
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

  function renderShelving() {
    return (
      <View
        style={{
          flex: 1,
          marginTop: 20,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {useCamera ? (
          <View>
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
        ) : (
          <View style={{ width: "50%" }}>
            <TextButton
              buttonContainerStyle={{
                marginLeft: 170,
                height: 40,
                width: 70,
                marginTop: SIZES.padding,
                marginBottom: 5,
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.red2,
              }}
              label="Simpan"
              onPress={simpanDisplayBefore}
            />
            <View style={{ width: "100%", alignItems: "center" }}>
              {true && (
                <Image
                  source={{ uri: image }}
                  style={{
                    width: 300,
                    height: 300,
                    backgroundColor: COLORS.lightGray1,
                    borderRadius: 8,
                  }}
                />
              )}
            </View>

            <View
              style={{
                // flexDirection: "row",
                alignContent: "center",
                flex: 1,
              }}
            >
              <TextIconButton
                containerStyle={{
                  height: 50,
                  alignItems: "center",
                  borderRadius: SIZES.radius,
                  backgroundColor: COLORS.darkBlue,
                  marginTop: 20,
                }}
                icon={icons.camera}
                iconPosition="RIGHT"
                label="Ambil Foto"
                labelStyle={{
                  // marginLeft: SIZES.radius,
                  padding: 5,
                  color: COLORS.white,
                }}
                onPress={async () => {
                  // console.log("in pick camera");
                  setUseCamera(true);
                }}
              />
            </View>
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
      {renderHeader()}
      {renderShelving()}
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

export default ShelvingBefore;

const styles = StyleSheet.create({
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
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
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
