import Checkbox from "expo-checkbox";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import {
  Header,
  IconButton,
  FormPicker,
  LineDivider,
  TextIconButton,
  TextButton,
} from "../../components";
import { FONTS, SIZES, COLORS, icons, constants } from "../../constants";
import { NumberFormat } from "../../utils";

//camera
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import DropDownPicker from "react-native-dropdown-picker";

const InvoiceDetail = ({ navigation, route }) => {
  const [isChecked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [image, setImage] = useState(null);
  const [detailItem, setdetailItem] = React.useState([]);
  const [pembayaran, setPembayaran] = React.useState([]);
  const [harga, setHarga] = React.useState("0");
  const [alasanPembayaran, setAlasanPembayaran] = React.useState("");
  const [bpp, setBpp] = React.useState([]);
  const [pilihNomorBpp, setPilihNomorBpp] = React.useState("");
  const [cashTambahan, setCashTambahan] = React.useState("0");

  const [useCamera, setUseCamera] = useState(false);
  const cameraRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasPermission, setHasPermission] = useState(null);

  const [openlokasi, setOpenlokasi] = useState(false);
  const [valuelokasi, setValuelokasi] = useState(null);

  React.useEffect(() => {
    let { detailItem } = route.params;
    // console.log("masuk detail invoice", route.params.detailItem.nik);
    setdetailItem(detailItem);
    nomorBpp(route.params.detailItem.nik);
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (isChecked === false) {
      setCashTambahan("0");
    }
  }, [isChecked]);

  const getCurrentTime = () => {
    let today = new Date();
    let hours = (today.getHours() < 10 ? "0" : "") + today.getHours();
    let minutes = (today.getMinutes() < 10 ? "0" : "") + today.getMinutes();
    let seconds = (today.getSeconds() < 10 ? "0" : "") + today.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
  };

  const onChangeTextharga = (harga) => {
    if (harga === "" || harga === "-") {
      harga = "0";
    }
    setHarga(NumberFormat(harga));
  };

  function nomorBpp(nik) {
    // console.log(
    //   "path",
    //   constants.CashColServer + `/api/v1/bpb/running_number/nik/${nik}`
    // );
    axios
      .get(constants.CashColServer + `/api/v1/bpb/running_number/nik/${nik}`)
      .then((response) => {
        // console.log("respon nomor", response.data);
        let countnumber = response.data.length;
        // console.log("hitung", countnumber);
        let databpp = [];
        for (var i = 0; i < countnumber; i++) {
          databpp.push({
            key: response.data[i].id,
            prefix: response.data[i].prefix,
            value: response.data[i].running_number,
            label:
              response.data[i].prefix + "-" + response.data[i].running_number,
          });
          // console.log("data bpp", databpp);
          setBpp(databpp);
        }
      });
  }

  function clearData() {
    setImage(null);
    setChecked(false);
    setdetailItem([]);
    setPembayaran([]);
    setHarga("0");
    setAlasanPembayaran("");
    setCashTambahan("0");
    setBpp([]);
    setPilihNomorBpp("");
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

  const takePicture = async () => {
    if (cameraRef) {
      // console.log("in take picture");
      try {
        let photo = await cameraRef.current.takePictureAsync({
          skipProcessing: true,
          allowsEditing: true,
          aspect: [4, 3],
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

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const simpanPembayaran = () => {
    // console.log(Number.parseFloat(harga.replace(/,/g, "")));
    // console.log(detailItem.invtotal - detailItem.totalpayment);
    // console.log(
    //   "banding",
    //   Number.parseFloat(harga.replace(/,/g, "")) >
    //     detailItem.invtotal - detailItem.totalpayment
    // );
    // console.log("pembayaran", pembayaran);
    // console.log("pembayaran", pembayaran.id);
    if (pembayaran.id > 1 && image == null) {
      Alert.alert(
        "Informasi",
        "Anda belum melakukan pengambilan foto giro/cek"
      );
      return;
    }
    if (pilihNomorBpp === "") {
      Alert.alert("Informasi", "Pilih nomor BPP terlebih dahulu");
      return;
    }

    // console.log(
    //   "cash tambahan",
    //   Number.parseFloat(cashTambahan.replace(/,/g, ""))
    // );
    // console.log("cash", Number.parseFloat(harga.replace(/,/g, "")));

    if (
      Number.parseFloat(harga.replace(/,/g, "")) +
        Number.parseFloat(cashTambahan.replace(/,/g, "")) >
      detailItem.invtotal - detailItem.totalpayment
    ) {
      Alert.alert("Warning", "Pembayaran lebih besar dari tagihan");
      return;
    }

    if (Number.parseFloat(harga.replace(/,/g, "")) === "0") {
      Alert.alert("Warning", "Pembayaran tidak boleh 0");
      return;
    }

    if (pembayaran.id === undefined || pembayaran.id === 0) {
      Alert.alert("Warning", "Pilih jenis pembayaran terlebih dahulu");
      return;
    }
    if (pembayaran.id >= 2 && alasanPembayaran === "") {
      Alert.alert(
        "Warning",
        "Isi Nomor Cek/Giro/bukti transfer terlebih dahulu"
      );
      return;
    }
    if (bpp === "") {
      Alert.alert("Warning", "Isi nomor bukti pembayaran terlebih dahulu");
      return;
    }

    Alert.alert(
      "Simpan Data",
      "Apakah anda ingin menyimpan data pembayaran Customer ini?",
      [
        {
          text: "Yes",
          onPress: () => {
            // console.log(lokasi);
            setIsLoading(true);
            if (pembayaran.id > 1) {
              var data = new FormData();
              data.append("image", {
                uri: image,
                type: "image/jpg",
                name:
                  detailItem.invnumber +
                  detailItem.nourut +
                  detailItem.nik +
                  getCurrentTime() +
                  "collect.jpg",
              });

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

                  if (pathSave !== "undefined") {
                    const requestOptions = {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        nourut: detailItem.nourut,
                        paymenttype: pembayaran.value,
                        payment: Number.parseFloat(harga.replace(/,/g, "")),
                        nik: detailItem.nik,
                        paymentnote: alasanPembayaran,
                        cashextra:
                          isChecked === true
                            ? Number.parseFloat(cashTambahan.replace(/,/g, ""))
                            : "0",
                        path: pathSave,
                        bpp: pilihNomorBpp,
                      }),
                    };
                    // console.log("tes", requestOptions);
                    const url =
                      constants.loginServer + "/insertinvoicepayment ";
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
                          ,
                          {
                            text: "Ada retur?",
                            onPress: () => {
                              navigation.navigate("retur");
                            },
                          },
                        ]);
                        clearData();
                        navigation.goBack();
                      }
                    });
                    setIsLoading(false);
                  }
                });
              } catch {
                setIsLoading(false);
                (err) => console.log(err);
                return;
              }
            } else {
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nourut: detailItem.nourut,
                  paymenttype: pembayaran.value,
                  payment: Number.parseFloat(harga.replace(/,/g, "")),
                  nik: detailItem.nik,
                  paymentnote: alasanPembayaran,
                  cashextra: "0",
                  path: "",
                  bpp: pilihNomorBpp,
                }),
              };
              const url = constants.loginServer + "/insertinvoicepayment ";
              fetch(url, requestOptions).then(async (response) => {
                const isJson = response.headers
                  .get("content-type")
                  ?.includes("application/json");
                const hasil1 = isJson && (await response.json());
                if (!response.ok) {
                  setIsLoading(false);
                  Alert.alert("Data Invalid", "Hubungi IT", [{ text: "Okay" }]);
                  return;
                } else {
                  setIsLoading(false);
                  // console.log("data tersimpan :", hasil1);
                  Alert.alert("Sukses", "Data telah tersimpan", [
                    { text: "Okay" },
                    ,
                    {
                      text: "Ada retur?",
                      onPress: () => {
                        navigation.navigate("retur");
                      },
                    },
                  ]);
                  clearData();
                  navigation.goBack();
                }
              });
              setIsLoading(false);
            }
          },
        },
        {
          text: "No",
          onPress: () => {
            return;
          },
        },
      ]
    );
  };

  function renderHeader() {
    return (
      <Header
        title="Detail Invoice"
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
      />
    );
  }

  function renderDetails() {
    return (
      <View
        style={{
          marginTop: SIZES.radius,
          marginBottom: SIZES.padding,
          paddingHorizontal: SIZES.padding,
        }}
      >
        <LineDivider />
        {/*  Info */}
        <View
          style={{
            marginTop: SIZES.padding,
            backgroundColor: COLORS.lightGray1,
            padding: 5,
            borderRadius: 10,
            flex: 1,
            height: 150,
          }}
        >
          <Text
            style={{
              ...FONTS.h4,
            }}
          >
            {detailItem.lokasi}
          </Text>

          {/* Name & Description */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                ...FONTS.h4,
              }}
            >
              No Invoice : {""}
            </Text>
            <Text
              style={{
                ...FONTS.h2,
              }}
            >
              {detailItem?.invnumber}
            </Text>
          </View>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body3,
              textAlign: "right",
            }}
          >
            {`Tagihan Rp. ${NumberFormat(String(detailItem.invtotal))}`}
          </Text>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body3,
              textAlign: "right",
            }}
          >
            {`Terbayar Rp. ${NumberFormat(String(detailItem.totalpayment))}`}
          </Text>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body3,
              textAlign: "right",
            }}
          >
            {`Sisa Tagihan Rp. ${NumberFormat(
              String(detailItem.invtotal - detailItem.totalpayment)
            )}`}
          </Text>
        </View>
      </View>
    );
  }

  function renderPayment() {
    return (
      <View
        style={{
          marginTop: SIZES.radius,
          marginBottom: SIZES.padding,
          paddingHorizontal: SIZES.padding,
        }}
      >
        <FormPicker
          label="Jenis Pembayaran"
          placeholder="Pilih Jenis "
          modalTitle="Pilih Jenis Pembayaran"
          value={pembayaran.value}
          setValue={setPembayaran}
          options={constants.jenispembayaran}
          containerStyle={{
            marginTop: SIZES.radius,
            backgroundColor: COLORS.white2,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.gray3,
          }}
        />

        <Text
          style={{
            marginTop: 10,
            padding: 5,
            color: COLORS.gray,
          }}
        >
          Input Nilai Pembayaran
        </Text>

        <TextInput
          style={{
            backgroundColor: COLORS.gray3,
            borderRadius: 10,
            height: 50,
            fontSize: 18,
            padding: 10,
          }}
          selectTextOnFocus
          value={harga}
          keyboardType="numeric"
          textAlign="right"
          onChangeText={onChangeTextharga}
        />

        <View style={styles.dropdownstyle}>
          <DropDownPicker
            style={{
              borderColor: COLORS.black,
            }}
            listMode="MODAL"
            itemKey={bpp.key}
            searchable={true}
            items={bpp}
            open={openlokasi}
            value={valuelokasi}
            setItems={setBpp}
            setOpen={setOpenlokasi}
            setValue={setValuelokasi}
            placeholder="Pilih Bpp"
            defaultValue={bpp}
            onSelectItem={(value) => {
              setPilihNomorBpp(value.key);
            }}
          />
        </View>
        {/* <TextInput
          style={{
            marginTop: 10,
            backgroundColor: COLORS.lightGray2,
            borderRadius: 10,
            padding: 5,
          }}
          value={bpp}
          keyboardType="numeric"
          selectTextOnFocus
          placeholder="Isi Nomor Bukti Penerimaan Pembayaran"
          onChangeText={(text) => setBpp(text)}
        /> */}
        {/* <DropDownPicker /> */}
        {pembayaran.id >= 2 && (
          <View>
            <TextInput
              style={{
                marginTop: 10,
                backgroundColor: COLORS.lightGray2,
                borderRadius: 10,
                padding: 5,
              }}
              value={alasanPembayaran}
              selectTextOnFocus
              autoCapitalize="characters"
              placeholder="Isi Nomor Cek/Giro/bukti transfer"
              onChangeText={(text) => setAlasanPembayaran(text)}
            />
            {/* <TextInput
              style={{
                marginTop: 10,
                backgroundColor: COLORS.lightGray2,
                borderRadius: 10,
                padding: 5,
              }}
              value={
                isChecked
                  ? NumberFormat(String(cashTambahan))
                  : "Isi Cash tambahan(Jika Ada)"
              }
              selectTextOnFocus
              editable={isChecked}
              keyboardType="numeric"
              textAlign={isChecked ? "right" : "left"}
              placeholder={isChecked ? "0" : "Isi Cash tambahan(Jika Ada)"}
              onChangeText={(text) => setCashTambahan(text)}
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                onChange={isChecked}
                // setCashTambahan("0")
              />
              <Text style={styles.paragraph}>Tambah Cash</Text>
            </View> */}
            <Text
              style={{
                paddingHorizontal: 5,
                color: COLORS.red2,
                ...FONTS.body4,
              }}
            >
              Harus Melampirkan foto bukti
            </Text>
            <View
              style={{
                width: "100%",
                alignItems: "flex-start",
                flexDirection: "row",
              }}
            >
              {true && (
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
              )}
              <TextIconButton
                containerStyle={{
                  height: 50,
                  width: 50,
                  alignItems: "center",
                  borderRadius: SIZES.padding,
                  backgroundColor: COLORS.white,
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

              <TextIconButton
                containerStyle={{
                  height: 50,
                  width: 50,
                  alignItems: "center",
                  borderRadius: SIZES.padding,
                  backgroundColor: COLORS.white,
                  marginTop: 20,
                }}
                icon={icons.attach}
                iconPosition="LEFT"
                labelStyle={{
                  marginLeft: 2,
                  color: COLORS.black,
                }}
                onPress={pickImage}
              />
            </View>
          </View>
        )}
        {/* {pembayaran.id == 3 && (
          <View>
            <TextInput
              style={{
                marginTop: 10,
                backgroundColor: COLORS.gray,
                borderRadius: 10,
                padding: 5,
              }}
              value={alasanPembayaran}
              selectTextOnFocus
              placeholder="Isi Keterangan Pembayaran"
              onChangeText={(text) => setAlasanPembayaran(text)}
            />
            <TextInput
              style={{
                marginTop: 10,
                backgroundColor: COLORS.lightGray2,
                borderRadius: 10,
                padding: 5,
              }}
              value={
                isChecked
                  ? NumberFormat(String(cashTambahan))
                  : "Isi Cash tambahan(Jika Ada)"
              }
              selectTextOnFocus
              editable={isChecked}
              keyboardType="numeric"
              textAlign={isChecked ? "right" : "left"}
              placeholder={isChecked ? "0" : "Isi Cash tambahan(Jika Ada)"}
              onChangeText={(text) =>
                isChecked ? setCashTambahan(text) : setCashTambahan("0")
              }
            />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                onChange={isChecked}
              />
              <Text style={styles.paragraph}>Tambah Cash</Text>
            </View>
          </View>
        )} */}
        <TextButton
          buttonContainerStyle={{
            height: 60,
            marginTop: SIZES.padding,
            marginHorizontal: SIZES.padding,
            marginBottom: SIZES.padding,
            borderRadius: SIZES.radius,
            backgroundColor: COLORS.primary,
          }}
          label="Simpan"
          onPress={() => simpanPembayaran()}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      {/* Header */}
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
        <ScrollView style={{ flex: 1 }}>
          {/* Details */}
          {renderDetails()}

          <LineDivider />

          {renderPayment()}
        </ScrollView>
      )}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ fontSize: 20, color: "white", marginTop: 16 }}>
            Mohon Tunggu...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default InvoiceDetail;

const styles = StyleSheet.create({
  dropdownstyle: {
    flex: 1,
    marginTop: 10,
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
  checkbox: {
    margin: 8,
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
