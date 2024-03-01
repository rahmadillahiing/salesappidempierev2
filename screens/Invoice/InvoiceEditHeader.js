import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";

import { SwipeListView } from "react-native-swipe-list-view";
import axios from "axios";

import {
  FormDateInput,
  Header,
  IconButton,
  LineDivider,
} from "../../components";
import { SIZES, icons, images, COLORS, constants } from "../../constants";
import { GetDataLocal, NumberFormat } from "../../utils";
import RadioGroup from "react-native-radio-buttons-group";
import moment from "moment";

import { useNavigation, useIsFocused } from "@react-navigation/native";

const InvoiceEditHeader = () => {
  const [profile, setProfile] = useState("");
  const [gagalKunjung, setGagalKunjung] = useState("");
  const [selectedTgl, setSelectedTgl] = useState(null);
  const [pilihList, setPilihList] = useState([]);

  const [dataGagalKunjungan, setDataGagalKunjungan] = useState([]);
  const [dataInvoice, setDataInvoice] = useState([]);
  const [cash, setCash] = useState(0);
  const [bankTransfer, setBankTransfer] = useState(0);
  const [cekGiro, setCekGiro] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const flatListRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [dtVisible, setDtVisible] = useState(false);

  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    isFocused && getUser();
  }, [isFocused]);

  const getUser = () => {
    GetDataLocal("user").then((res) => {
      const data = res;
      setProfile(data);
      // console.log("data", data.id);
      getDataInvoice(data.id);
      getDataGagalTagih();
    });
  };

  function getDataInvoice(nik) {
    axios
      .get(
        constants.CashColServer +
          `/api/v1/task-collector/invoice_list_for_edit/collector/${nik}`
      )
      .then((response) => {
        const hitunginvoice = response.data.length;
        // console.log("response", response.data);
        let datainvoice = [];
        let cash = 0;
        let banktransfer = 0;
        let cekgiro = 0;
        let previnvoice = "";
        for (var i = 0; i < hitunginvoice; i++) {
          if (previnvoice !== response.data[i].inv_number) {
            datainvoice.push({
              key: response.data[i].inv_id,
              noinv: response.data[i].inv_number,
              lokasi: response.data[i].TaskAssignLine_CustomerName,
              total: response.data[i].inv_total,
              status: response.data[i].status,
              paymenttype: response.data[i].pinv_paymenttype,
              payment:
                response.data[i].pinv_payment == null
                  ? 0
                  : response.data[i].pinv_payment,
            });
          } else {
            datainvoice.forEach((obj) => {
              if (obj.noinv == previnvoice) {
                obj.payment = obj.payment + response.data[i].pinv_payment;
              }
            });
          }
          previnvoice = response.data[i].inv_number;
          if (response.data[i].pinv_paymenttype == "CASH") {
            cash = cash + response.data[i].pinv_payment;
          } else if (response.data[i].pinv_paymenttype == "BANK TRANSFER") {
            banktransfer = banktransfer + response.data[i].pinv_payment;
          } else if (response.data[i].pinv_paymenttype == "GIRO/CEK") {
            cekgiro = cekgiro + response.data[i].pinv_payment;
          }
        }
        console.log("data invoice", datainvoice);
        console.log("data cash", cash);
        console.log("data bank transfer", banktransfer);
        console.log("data giro", cekgiro);

        setDataInvoice(datainvoice);
        setCash(cash);
        setBankTransfer(banktransfer);
        setCekGiro(cekgiro);
      });
  }

  const onRefresh = () => {
    // getLokasi();
    getUser();
  };
  const getDataGagalTagih = () => {
    let dataGagalTagih = [];
    const count = constants.gagaltagih.length;

    for (var i = 0; i < count; i++) {
      dataGagalTagih.push({
        id: constants.gagaltagih[i].id,
        label: constants.gagaltagih[i].label,
        value: constants.gagaltagih[i].value,
      });
    }
    setDataGagalKunjungan(dataGagalTagih);
  };

  function onPressRadioButton(radioButtonsArray) {
    let filteredResult = dataGagalKunjungan.find(
      (e) => e.id == radioButtonsArray
    );
    // console.log("tes", filteredResult);
    setGagalKunjung(filteredResult);

    // console.log("data pilih", radioButtonsArray);

    radioButtonsArray === 4
      ? (setDtVisible(true), setSelectedTgl(null))
      : setDtVisible(false);
  }

  function renderHeader() {
    return (
      <Header
        title="Invoice Status"
        containerStyle={{
          height: 40,
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
            onPress={() => navigation.navigate("MainLayout")}
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
  function simpandata() {
    if (pilihList.status === "Terupdate") {
      Alert.alert(
        "Data Sudah Terupdate",
        "Data ini sudah pernah di update alasan tidak tertagih"
      );
      return;
    }
    if (
      gagalKunjung.value ===
        "Janji bayar kunjungan berikutnya                         " &&
      selectedTgl === null
    ) {
      Alert.alert(
        "Invalid Tanggal",
        "Pilih tanggal kunjungan yang di janjikan oleh customer"
      );
      return;
    }

    if (gagalKunjung === "") {
      Alert.alert("Pilih Alasan", "Pilih Alasan Kenapa Tidak tertagih");
      return;
    }

    Alert.alert(
      "Simpan Data tidak tertagih ",
      "Apakah anda ingin menyimpan data alasan tidak tertagih ini?",
      [
        {
          text: "Yes",
          onPress: () => {
            // console.log(lokasi);
            {
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nourut: pilihList.key,
                  paymenttype: pilihList.status,
                  payment: "0",
                  nik: profile.id,
                  paymentnote:
                    selectedTgl === null
                      ? gagalKunjung.value.replace(/^\s+|\s+$/gm, "")
                      : gagalKunjung.value.replace(/^\s+|\s+$/gm, "") +
                        ` ${moment(selectedTgl)
                          .format("DD-MM-YYYY")
                          .toString()}`,
                  cashextra: "0",
                  path: "",
                  bpp: null,
                }),
              };
              // console.log("request", requestOptions);
              const url = constants.loginServer + "/insertinvoicepayment";
              // console.log("url", url);

              fetch(url, requestOptions).then(async (response) => {
                const isJson = response.headers
                  .get("content-type")
                  ?.includes("application/json");
                const hasil1 = isJson && (await response.json());
                if (!response.ok) {
                  Alert.alert("Data Invalid", "Hubungi IT", [{ text: "Okay" }]);
                  return;
                } else {
                  // console.log("data tersimpan :", hasil1);
                  Alert.alert("Sukses", "Data telah tersimpan", [
                    { text: "Okay" },
                  ]);
                  const newData = [...dataInvoice];
                  const prevIndex = dataInvoice.findIndex(
                    (item) => item.key === pilihList.key
                  );
                  newData[prevIndex].status = "Terupdate";
                  setSelectedTgl(null);
                  setModalVisible(false);
                }
              });
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
  }

  function modalView() {
    // console.log("pilih", pilihList);
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Pilih Alasan Tidak Tertagih
            </Text>
            <RadioGroup
              radioButtons={dataGagalKunjungan}
              onPress={onPressRadioButton}
              selectedId={gagalKunjung.id}
              layout="column"
            />
            {dtVisible === true ? (
              <View>
                <FormDateInput
                  placeholder="DD/MM/YYYY"
                  value={selectedTgl}
                  setDate={setSelectedTgl}
                  containerStyle={{
                    width: 180,
                    flexDirection: "column",
                    marginBottom: 15,
                  }}
                  inputContainerStyle={{
                    backgroundColor: COLORS.lightGray2,
                  }}
                />
              </View>
            ) : (
              <></>
            )}
            <View style={{ flexDirection: "row" }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => simpandata()}
              >
                <Text style={styles.textStyle}>Simpan</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  setGagalKunjung("");
                }}
              >
                <Text style={styles.textStyle}> Batal </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  const ListItem = ({ invoice }) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          invoice.status === "Tertagih"
            ? navigation.navigate("InvoiceEditDetail", {
                detailItem: {
                  invoice,
                },
              })
            : (setModalVisible(true), setPilihList(invoice))
        }
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontStyle: "italic",
                color:
                  invoice.status === "Tertagih" ? COLORS.green : COLORS.red,
              }}
            >
              {invoice?.status}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            {invoice?.noinv}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            {invoice?.lokasi}
          </Text>

          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Tagihan : Rp.{NumberFormat(invoice?.total.toString())}
          </Text>

          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Tertagih : Rp.{NumberFormat(invoice?.payment.toString())}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      <StatusBar barStyle={"dark-content"} />

      {renderHeader()}
      <View style={styles.container}>
        {modalView()}
        <View
          style={{
            flex: 1,
            marginTop: 5,
            backgroundColor: COLORS.lightGray2,
            padding: 5,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: COLORS.gray, fontSize: 18, left: 10 }}>
            {/* {console.log("total tampilan :", total)} */}
            {dataInvoice.length === 0
              ? "Tidak ada data invoice"
              : "Data Invoice"}
          </Text>
          <Text style={{ color: COLORS.green, fontSize: 14, left: 10 }}>
            {/* {console.log("total tampilan :", cash)} */}
            {dataInvoice.length > 0 &&
              "Total Cash Rp." + NumberFormat(cash.toString())}
          </Text>
          <LineDivider
            lineStyle={{
              backgroundColor: COLORS.red2,
            }}
          />
          <Text style={{ color: COLORS.green, fontSize: 14, left: 10 }}>
            {/* {console.log("total tampilan :", cash)} */}
            {dataInvoice.length > 0 &&
              "Total Transfer Rp." + NumberFormat(bankTransfer.toString())}
          </Text>
          <LineDivider
            lineStyle={{
              backgroundColor: COLORS.red2,
            }}
          />
          <Text style={{ color: COLORS.green, fontSize: 14, left: 10 }}>
            {/* {console.log("total tampilan :", cash)} */}
            {dataInvoice.length > 0 &&
              "Total Cek Dan Giro Rp." + NumberFormat(cekGiro.toString())}
          </Text>
          <LineDivider
            lineStyle={{
              backgroundColor: COLORS.red2,
            }}
          />
          <FlatList
            keyExtractor={(item) => `${item.key}`}
            showsVerticalScrollIndicator={false}
            ref={flatListRef}
            data={dataInvoice}
            contentContainerStyle={{
              padding: 10,
              paddingBottom: 50,
            }}
            renderItem={({ item }) => <ListItem invoice={item} />}
            refreshControl={
              <RefreshControl
                //refresh control used for the Pull to Refresh
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        </View>
        {/* )} */}
      </View>
    </SafeAreaView>
  );
};

export default InvoiceEditHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.white2,
    marginTop: 12,
  },
  listItem: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    elevation: 12,
    borderRadius: 7,
    marginVertical: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    marginLeft: 10,
    marginRight: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
});
