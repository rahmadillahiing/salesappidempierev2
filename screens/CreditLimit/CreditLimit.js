import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { GetDataLocal, NumberFormat } from "../../utils";
import {
  COLORS,
  SIZES,
  FONTS,
  icons,
  images,
  constants,
} from "../../constants";

import {
  FormInput,
  Header,
  IconButton,
  InfoItem,
  TextButton,
} from "../../components";
import DropDownPicker from "react-native-dropdown-picker";

const CreditLimit = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [profile, setProfile] = useState("");
  const [items, setItems] = useState([]);
  const [openlokasi, setOpenlokasi] = useState(false);
  const [valuelokasi, setValuelokasi] = useState(null);
  const [bpid, setBpid] = useState("");
  const [additional, setAdditional] = useState("");
  const [kenaikanLimit, setKenaikanLimit] = useState("0");
  const [omset, setOmset] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  //   useEffect(() => {
  //     isFocused && getUser();
  //   }, [isFocused]);

  const getUser = () => {
    GetDataLocal("user").then((res) => {
      const data = res;
      setProfile(data);
      console.log("data", data);
      getLokasi(data.salesrep);
    });
  };

  const getLokasi = async (result) => {
    console.log("Cek user", result);
    // idempiere
    const response = await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getCustomersCl",
            DataRow: {
              field: [
                {
                  "@column": "SalesRep_ID",
                  val: result,
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
    console.log("hitung", response.data.WindowTabData.DataSet.DataRow);
    const dataLokasi = [];
    for (var i = 0; i < count; i++) {
      dataLokasi.push({
        key: response.data.WindowTabData.DataSet.DataRow[i].field[0].val,
        label: response.data.WindowTabData.DataSet.DataRow[i].field[1].val,
        value:
          response.data.WindowTabData.DataSet.DataRow[i].field[0].val +
          " " +
          response.data.WindowTabData.DataSet.DataRow[i].field[3].val,
        addr: response.data.WindowTabData.DataSet.DataRow[i].field[10].val,
        contact: response.data.WindowTabData.DataSet.DataRow[i].field[14].val,
        cl: response.data.WindowTabData.DataSet.DataRow[i].field[9].val,
        custidemp: response.data.WindowTabData.DataSet.DataRow[i].field[5].val,
        clavailable:
          response.data.WindowTabData.DataSet.DataRow[i].field[11].val,
        bpid: response.data.WindowTabData.DataSet.DataRow[i].field[7].val,
        phone: response.data.WindowTabData.DataSet.DataRow[i].field[15].val,
      });
    }
    // console.log("data lokasi", dataLokasi);
    setItems(dataLokasi);
  };

  function renderHeader() {
    return (
      <Header
        title="Pengajuan Kenaikan CL"
        containerStyle={{
          height: 30,
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

  function renderDetails() {
    return (
      <SafeAreaView>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ padding: 10 }}
        >
          <View
            style={{ alignContent: "flex-start", alignItems: "flex-start" }}
          >
            <Text
              style={{
                ...FONTS.h3,
                padding: 10,
                right: 10,
                color: COLORS.black,
              }}
            >
              Pilih Lokasi
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <DropDownPicker
              style={{
                borderColor: COLORS.black,
              }}
              listMode="MODAL"
              itemKey={items.key}
              searchable={true}
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
                setBpid(value);
                console.log("nilai", value);
                renderAdditional(value);
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              marginTop: 10,
              //   backgroundColor: COLORS.lightGray1,
              borderRadius: 15,
            }}
          >
            {additional.length > 0 && (
              <View
                style={{
                  marginTop: SIZES.padding,
                  borderRadius: SIZES.radius,
                  paddingHorizontal: SIZES.radius,
                  backgroundColor: COLORS.lightGray2,
                }}
              >
                <InfoItem label="Nama" value={bpid?.contact} />
                <InfoItem label="No Telp" value={bpid?.phone} />
                <InfoItem label="Alamat" value={bpid?.addr} />
                <InfoItem
                  label="Avg Pelunasan"
                  value={
                    additional[0]?.avgdays.toString() +
                    " Hari" +
                    "(" +
                    additional[0]?.statusorder +
                    ")"
                  }
                />
                <InfoItem
                  label="Total Piutang"
                  value={
                    additional[0].aropen > 0
                      ? "Rp." + NumberFormat(additional[0]?.aropen.toString())
                      : "Rp.0"
                  }
                />
                <InfoItem
                  label="Piutang Jatuh Tempo"
                  value={
                    additional[0].aropenoverdue > 0
                      ? "Rp." +
                        NumberFormat(additional[0]?.aropenoverdue.toString())
                      : "Rp.0"
                  }
                />
                <InfoItem
                  label="Limit Saat Ini"
                  value={
                    additional[0].cl > 0
                      ? "Rp." + NumberFormat(additional[0]?.cl.toString())
                      : "Rp.0"
                  }
                />
                <InfoItem
                  label="Limit Tersedia"
                  value={
                    additional[0].clavailable > 0
                      ? "Rp." +
                        NumberFormat(additional[0]?.clavailable.toString())
                      : "Rp.0"
                  }
                />
                <FormInput
                  label="Omset Customer"
                  keyboardType="number-pad"
                  value={omset}
                  onChange={(value) => {
                    if (value === "" || value === "-" || value === ".") {
                      value = "0";
                    }

                    setOmset(NumberFormat(value));
                  }}
                  containerStyle={{ marginTop: SIZES.radius }}
                  inputContainerStyle={{ backgroundColor: COLORS.lightGray1 }}
                  textAlign="right"
                />
                <FormInput
                  label="Kenaikan Limit"
                  keyboardType="number-pad"
                  value={kenaikanLimit}
                  onChange={(value) => {
                    if (value === "" || value === "-" || value === ".") {
                      value = "0";
                    }

                    setKenaikanLimit(NumberFormat(value));
                  }}
                  containerStyle={{ marginTop: SIZES.radius }}
                  inputContainerStyle={{ backgroundColor: COLORS.lightGray1 }}
                  textAlign="right"
                />
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
                  onPress={() => simpanCustomer()}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const simpanCustomer = () => {
    if (omset === "0" || omset === 0) {
      Alert.alert("Invalid Omset", "Mohon Data Omset Untuk Di isi");
      return;
    }
    if (kenaikanLimit === "0" || kenaikanLimit === 0) {
      Alert.alert(
        "Invalid Data Kenaikan Limit",
        "Mohon Isi Data Kenaikan Limit "
      );
      return;
    }

    Alert.alert(
      "Simpan Data Pengajuan Kenaikan Credit Limit?",
      "Menyimpan Data Pengajuan Atas " +
        bpid.label +
        " Dari Limit Rp." +
        NumberFormat(bpid.cl.toString()) +
        " Menjadi Rp." +
        NumberFormat(kenaikanLimit.toString()) +
        " ?",
      [
        {
          text: "Yes",
          onPress: async () => {
            setIsLoading(true);
            const requestOptions = {
              body: {
                cl_bpid: bpid.custidemp,
                cl_bpname: bpid.label,
                cl_omsetcustomer: Number.parseFloat(omset.replace(/,/g, "")),
                cl_baselimit: bpid.cl,
                cl_kenaikanlimit: Number.parseFloat(
                  kenaikanLimit.replace(/,/g, "")
                ),
                cl_salesid: profile.salesrep,
                cl_nik: profile.id,
                cl_salesname: profile.fullname,
              },
            };
            console.log("pooh", requestOptions);
            axios
              .post(
                constants.CashColServer + "/api/v1/creditlimit/submit",
                requestOptions
              )
              .then((response) => {
                console.log("status", response);
                Alert.alert(
                  "Berhasil tersimpan",
                  "Data Pengajuan Credit Limit Atas " +
                    bpid.label +
                    " Telah Tersimpan",
                  [{ text: "Okay" }]
                );
                setIsLoading(false);
                navigation.navigate("Home");
              })
              .catch((error) => {
                console.log("Error", error);
                setIsLoading(false);
                return;
              });
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

  //   function renderData(bpid) {
  //     renderAdditional(bpid.custidemp);
  //   }

  async function renderAdditional(bpidemp) {
    console.log("bpidemp", bpidemp);
    const response = await axios
      .post(
        constants.idempServerBpr +
          "ADInterface/services/rest/model_adservice/query_data",
        {
          ModelCRUDRequest: {
            ModelCRUD: {
              serviceType: "GetSummaryPayment",
              DataRow: {
                field: [
                  {
                    "@column": "C_BPartner_ID",
                    val: bpidemp.custidemp,
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
      .then((response) => {
        let datacount = response.data.WindowTabData.RowCount;
        console.log("itung", datacount);
        const additional = [];
        if (datacount > 0) {
          let data = response.data.WindowTabData.DataSet.DataRow;
          console.log("data", data);
          additional.push({
            id: data.field[2].val,
            custname: data.field[3].val,
            countpayment: data.field[4].val,
            avgdays: data.field[5].val,
            avgorders: data.field[6].val,
            aropen: data.field[7].val,
            aropenoverdue: data.field[8].val,
            cl: data.field[9].val,
            clavailable: data.field[10].val,
            statusorder: data.field[11].val,
          });
        } else {
          additional.push({
            id: bpidemp.custidemp,
            custname: bpidemp.label,
            countpayment: 0,
            avgdays: 0,
            avgorders: 0,
            aropen: 0,
            aropenoverdue: 0,
            cl: bpidemp.cl,
            clavailable: bpidemp.clavailable,
            statusorder: "-",
          });
        }
        console.log("tinkywinky", additional);
        setAdditional(additional);
      })
      .catch((error) => {
        console.log("error", error);
        Alert.alert("Error", "Ada Error Hubungi IT");
        setIsLoading(false);
        return;
      });
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
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            marginTop: SIZES.radius,
            paddingBottom: 40,
          }}
        >
          {renderDetails()}
        </KeyboardAwareScrollView>
      </View>
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ fontSize: 20, color: "white" }}>Mohon Tunggu...</Text>
        </View>
      )}
    </View>
  );
};

export default CreditLimit;

const styles = StyleSheet.create({
  outContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.lightGray1,
    marginTop: 12,
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
