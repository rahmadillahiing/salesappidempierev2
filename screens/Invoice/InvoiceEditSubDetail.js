import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Header,
  IconButton,
  FormPicker,
  LineDivider,
  TextIconButton,
  TextButton,
} from "../../components";
import { COLORS, SIZES, FONTS, icons, constants } from "../../constants";

import { GetDataLocal, NumberFormat } from "../../utils";
import DropDownPicker from "react-native-dropdown-picker";

const InvoiceEditSubDetail = ({ navigation, route }) => {
  const [data, setData] = useState([]);
  const [pembayaran, setPembayaran] = useState([]);
  const [harga, setHarga] = useState("0");
  const [alasanPembayaran, setAlasanPembayaran] = useState("");
  const [bpp, setBpp] = useState([]);
  const [pilihNomorBpp, setPilihNomorBpp] = useState("");
  const [profile, setProfile] = useState("");
  //   const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openlokasi, setOpenlokasi] = useState(false);
  const [valuelokasi, setValuelokasi] = useState(null);

  let dataroute = route.params;
  // console.log("A", dataroute.detailItem);

  //   setData(dataroute);

  useEffect(() => {
    // setPembayaran(data.detailItem.paymenttype);
    getUser();
  }, []);

  const getUser = () => {
    // console.log("data partsing", alldata);
    GetDataLocal("user").then((res) => {
      const data = res;
      setProfile(data);
      nomorBpp(res.id);
    });
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
          //   console.log("data bpp", databpp);
          setBpp(databpp);
        }
      });
  }

  function renderHeader() {
    return (
      <Header
        title="Invoice Edit Data"
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
    // console.log("data", data);
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
            backgroundColor: COLORS.white,
            padding: 5,
            borderRadius: 10,
            flex: 1,
            height: 200,
          }}
        >
          <Text
            style={{
              ...FONTS.h4,
            }}
          >
            {data?.lokasi}
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
              {dataroute?.detailItem.invnumber}
            </Text>
          </View>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body4,
              textAlign: "left",
            }}
          >
            {`Pembayaran menggunakan ${dataroute?.detailItem.paymenttype}`}
          </Text>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body4,
              textAlign: "left",
            }}
          >
            {`Dengan nomor BPP ${dataroute?.detailItem.bppprefix}-${dataroute?.detailItem.bppnomor}`}
          </Text>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body4,
              textAlign: "left",
            }}
          >
            {`Nomor Bukti bayar ${dataroute?.detailItem.invbuktitrf}`}
          </Text>

          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body3,
              textAlign: "right",
            }}
          >
            {`Tagihan Rp. ${NumberFormat(
              String(dataroute?.detailItem.invtotal)
            )}`}
          </Text>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body3,
              textAlign: "right",
            }}
          >
            Terbayar RP{" "}
            {harga === "0"
              ? NumberFormat(String(dataroute?.detailItem.paymentinv))
              : harga}
            {/* {`Terbayar Rp. ${NumberFormat(
              String(dataroute?.detailItem.paymentinv)
            )}`} */}
          </Text>
          <Text
            style={{
              color: COLORS.darkGray,
              ...FONTS.body3,
              textAlign: "right",
            }}
          >
            {`Sisa Tagihan Rp. ${NumberFormat(
              String(
                dataroute?.detailItem.invtotal -
                  (harga === "0"
                    ? dataroute?.detailItem.paymentinv
                    : Number.parseFloat(harga.replace(/,/g, "")))
              )
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
          value={
            pembayaran.value
            // console.log(pembayaran)
            // pembayaran.length === 0
            //   ? [dataroute.detailItem.paymenttype]
            //   : pembayaran
          }
          setValue={setPembayaran}
          options={constants.jenispembayaran}
          containerStyle={{
            marginTop: SIZES.radius,
            // backgroundColor: COLORS.white2,
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
          value={
            harga === "0"
              ? NumberFormat(String(dataroute?.detailItem.paymentinv))
              : harga
          }
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
            {/* <Text
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
            </View> */}
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
    // if (pembayaran.id > 1 && image == null) {
    //   Alert.alert(
    //     "Informasi",
    //     "Anda belum melakukan pengambilan foto giro/cek"
    //   );
    //   return;
    // }

    if (
      pilihNomorBpp === "" &&
      harga === "0" &&
      alasanPembayaran === "" &&
      pilihNomorBpp === ""
    ) {
      Alert.alert(
        "Informasi",
        "Tidak Ada data yang berubah, gagal menyimpan data"
      );
      return;
    }

    // console.log(
    //   "cash tambahan",
    //   Number.parseFloat(cashTambahan.replace(/,/g, ""))
    // );
    // console.log("cash", Number.parseFloat(harga.replace(/,/g, "")));

    if (
      Number.parseFloat(harga.replace(/,/g, "")) >
      dataroute.detailItem.invtotal - dataroute.detailItem.totalpayment
    ) {
      Alert.alert("Warning", "Pembayaran lebih besar dari tagihan");
      return;
    }

    if (Number.parseFloat(harga.replace(/,/g, "")) === "0") {
      Alert.alert("Warning", "Pembayaran tidak boleh 0");
      return;
    }

    // if (pembayaran.id === undefined || pembayaran.id === 0) {
    //   Alert.alert("Warning", "Pilih jenis pembayaran terlebih dahulu");
    //   return;
    // }
    // if (pembayaran.id >= 2 && alasanPembayaran === "") {
    //   Alert.alert(
    //     "Warning",
    //     "Isi Nomor Cek/Giro/bukti transfer terlebih dahulu"
    //   );
    //   return;
    // }
    // if (bpp === "") {
    //   Alert.alert("Warning", "Isi nomor bukti pembayaran terlebih dahulu");
    //   return;
    // }

    Alert.alert(
      "Simpan Data",
      "Apakah anda ingin menyimpan data update pembayaran Customer ini?",
      [
        {
          text: "Yes",
          onPress: () => {
            // console.log(lokasi);
            setIsLoading(true);

            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentnumber: dataroute.detailItem.key,
                billingnumber: dataroute.detailItem.billingid,
                paymenttype:
                  pembayaran.length === 0
                    ? dataroute.detailItem.paymenttype
                    : pembayaran.value,
                payment:
                  harga === "0"
                    ? dataroute.detailItem.paymentinv
                    : Number.parseFloat(harga.replace(/,/g, "")),
                nik: profile.id,
                paymentnote:
                  alasanPembayaran === ""
                    ? dataroute.detailItem.invbuktitrf
                    : alasanPembayaran,
                cashextra: "0",
                path: dataroute.detailItem.path,
                bpp:
                  pilihNomorBpp === ""
                    ? dataroute.detailItem.bppid
                    : pilihNomorBpp,
                oldbpp: dataroute.detailItem.bppid,
              }),
            };
            // console.log("request edit", requestOptions);
            const url = constants.loginServer + "/editInvoicePayment ";
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
                Alert.alert("Sukses", "Data telah terupdate", [
                  { text: "Okay" },
                ]);
                clearData();
                navigation.navigate("InvoiceEditHeader");
              }
            });
            setIsLoading(false);
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

  function clearData() {
    setHarga("0");
    setAlasanPembayaran("");
    setBpp([]);
    setPilihNomorBpp("");
  }

  const onChangeTextharga = (harga) => {
    if (harga === "" || harga === "-") {
      harga = "0";
    }
    setHarga(NumberFormat(harga));
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.lightOrange2,
      }}
    >
      {renderHeader()}
      <ScrollView style={{ flex: 1 }}>
        {/* Details */}
        {renderDetails()}
        <LineDivider />

        {renderPayment()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvoiceEditSubDetail;

const styles = StyleSheet.create({
  dropdownstyle: {
    flex: 1,
    marginTop: 10,
  },
});
