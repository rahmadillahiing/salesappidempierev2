import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

import moment from "moment";
import axios from "axios";

import { connect } from "react-redux";
import { setSelectedTab } from "../../stores/tab/tabActions";

import Feather from "@expo/vector-icons/Feather";
Feather.loadFont();

import { FormInput, FormDateInput, TextButton } from "../../components";
import { COLORS, SIZES, constants } from "../../constants";

import { GetDataLocal, NumberFormat } from "../../utils";

const ProductSurvey = (props) => {
  const [lokasi, setLokasi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemCat, setSelectedItemCat] = useState(null);
  const [categoriItem, setCategoriItem] = useState(null);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [idempid, setIdempId] = useState("");
  const [weight, setWeight] = useState(0);
  const [uomId, setUomId] = useState("");

  const dropdownController = useRef(null);
  const searchRef = useRef(null);
  const [additional, setAdditional] = useState(null);
  const [listProductAvailable, setListProductAvailable] = useState([]);

  const [harga, setHarga] = useState("0");
  const [periodeAwal, setPeriodeAwal] = useState(null);
  const [periodeAkhir, setPeriodeAkhir] = useState(null);
  const [promo, setPromo] = useState("");

  useFocusEffect(
    useCallback(() => {
      cleardata();
    }, [])
  );

  useEffect(() => {
    if (props.selectedTab == "Survey Harga") {
      getLokasi();
      cleardata();
    }
  }, [props.selectedTab]);

  const getLokasi = () => {
    GetDataLocal("lokasi").then((res) => {
      if (res !== null) {
        setLokasi(res);
        // console.log("lokasi", res);
        getProduct().then(function (listPrice) {
          const product = [];
          if (listPrice.data.WindowTabData.RowCount === 1) {
            product.push({
              key: listPrice.data.WindowTabData.DataSet.DataRow.field[0].val,
              id: listPrice.data.WindowTabData.DataSet.DataRow.field[1].val,
              title: listPrice.data.WindowTabData.DataSet.DataRow.field[2].val,
              category:
                listPrice.data.WindowTabData.DataSet.DataRow.field[3].val,
              uomname:
                listPrice.data.WindowTabData.DataSet.DataRow.field[7].val,
            });
          } else {
            for (var i = 0; i < listPrice.data.WindowTabData.RowCount; i++) {
              product.push({
                key: listPrice.data.WindowTabData.DataSet.DataRow[i].field[0]
                  .val,
                id: listPrice.data.WindowTabData.DataSet.DataRow[i].field[1]
                  .val,
                title:
                  listPrice.data.WindowTabData.DataSet.DataRow[i].field[2].val,
                category:
                  listPrice.data.WindowTabData.DataSet.DataRow[i].field[3].val,
                uomname:
                  listPrice.data.WindowTabData.DataSet.DataRow[i].field[7].val,
              });
              // console.log("hasil mapping", product);
              setListProductAvailable(product);
            }
          }
        });
      }
    });
    // GetDataLocal("additional").then(async (res1) => {
    //   if (res1 !== null) {
    //     // if (res1.length > 0) {
    //     setAdditional(res1);
    //     // console.log("res1", res1);
    //     getListPrice(res1.pricelistid).then(function (listPrice) {
    //       console.log("tes listprice", listPrice.data.WindowTabData.RowCount);
    //       // const product = [];
    //       // setListProductAvailable(product);
    //       const product = [];
    //       if (listPrice.data.WindowTabData.RowCount === 1) {
    //         product.push({
    //           key: listPrice.data.WindowTabData.DataSet.DataRow.field[0].val,
    //           id: listPrice.data.WindowTabData.DataSet.DataRow.field[0].val,
    //           title: listPrice.data.WindowTabData.DataSet.DataRow.field[1].val,
    //           price: listPrice.data.WindowTabData.DataSet.DataRow.field[8].val,
    //           weight: listPrice.data.WindowTabData.DataSet.DataRow.field[3].val,
    //           idempid:
    //             listPrice.data.WindowTabData.DataSet.DataRow.field[4].val,
    //           category:
    //             listPrice.data.WindowTabData.DataSet.DataRow.field[7].val,
    //           uomname:
    //             listPrice.data.WindowTabData.DataSet.DataRow.field[9].val,
    //           uomid: listPrice.data.WindowTabData.DataSet.DataRow.field[10].val,
    //         });
    //       } else {
    //         for (var i = 0; i < listPrice.data.WindowTabData.RowCount; i++) {
    //           product.push({
    //             key: listPrice.data.WindowTabData.DataSet.DataRow[i].field[0]
    //               .val,
    //             id: listPrice.data.WindowTabData.DataSet.DataRow[i].field[0]
    //               .val,
    //             title:
    //               listPrice.data.WindowTabData.DataSet.DataRow[i].field[1].val,
    //             price:
    //               listPrice.data.WindowTabData.DataSet.DataRow[i].field[8].val,
    //             weight:
    //               listPrice.data.WindowTabData.DataSet.DataRow[i].field[3].val,
    //             idempid:
    //               listPrice.data.WindowTabData.DataSet.DataRow[i].field[4].val,
    //             category:
    //               listPrice.data.WindowTabData.DataSet.DataRow[i].field[7].val,
    //             uomname:
    //               listPrice.data.WindowTabData.DataSet.DataRow[i].field[9].val,
    //             uomid:
    //               listPrice.data.WindowTabData.DataSet.DataRow[i].field[10].val,
    //           });
    //           // console.log("hasil mapping", product);
    //         }
    //       }
    //       setListProductAvailable(product);
    //     });
    //     // }
    //   }
    // });
  };

  function getProduct() {
    return axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getProductFG",
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
  }

  async function getListPrice(data2) {
    // console.log("pricelist ID", data2);
    return await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getProductPrice",
            DataRow: {
              field: [
                {
                  "@column": "M_PriceList_ID",
                  val: data2,
                },
                {
                  "@column": "Today",
                  val: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
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
  }

  function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  const getPromo = (props) => {
    // console.log("Masuk promo", props);
    // console.log("lokasi", lokasi === null);

    if (lokasi.locationid === null) {
      Alert.alert(
        "Warning cek promo",
        "Anda belum melakukan check in, mohon check in terlebih dahulu"
      );
      return;
    }

    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lokasiid: lokasi.locationid,
        prodid: props,
      }),
    };
    // console.log("requestoption", requestOptions);
    const url = constants.loginServer + "/getdatapromo";

    fetch(url, requestOptions).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundPromo = isJson && (await response.json());
      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error ambil promo");
        return;
      }
      // console.log("promo ketemu", foundPromo);
      if (foundPromo.length == 0) {
        // console.log("tidak ada promo");
        setPromo("");
      } else {
        // setPromo(
        //   `Harga promo senilai Rp. ${formatNumber(
        //     foundPromo[0].harga
        //   )} untuk periode ${foundPromo[0].startperiod} s/d ${
        //     foundPromo[0].endperiod
        //   }`
        // );
        setPromo(foundPromo);
      }
      setLoading(false);
    });
  };

  const getSuggestions = useCallback(
    async (q) => {
      const filterToken = q.toLowerCase();
      // console.log("getSuggestions", q);
      if (typeof q !== "string" || q.length < 3) {
        setSuggestionsList(null);
        return;
      }
      setLoading(true);
      // const response = await fetch(constants.loginServer + "/getproductfg");
      // const items = await response.json();
      const items = listProductAvailable;
      const suggestions = items
        .filter((item) => item.title.toLowerCase().includes(filterToken))
        .map((item) => ({
          key: item.key,
          id: item.id,
          title: item.title,
          idempid: item.idempid,
          uomname: item.uomname,
        }));
      setSuggestionsList(suggestions);
      setLoading(false);
    },
    [listProductAvailable]
  );

  const onClearPress = useCallback(() => {
    setSuggestionsList(null);
    setSelectedItem(null);
    setPromo("");
    setHarga("0");
    setPeriodeAwal(null);
    setPeriodeAkhir(null);
  }, []);

  const onOpenSuggestionsList = useCallback((isOpened) => {}, []);

  const simpanData = () => {
    // console.log("lokasi simpan", lokasi.locationid);
    if (lokasi === null) {
      Alert.alert(
        "Warning Simpan",
        "Anda belum melakukan check in, mohon check in terlebih dahulu"
      );
      return;
    }
    if (periodeAwal !== null) {
      if (periodeAkhir == null) {
        Alert.alert("Warning", "Periode berakhir tidak boleh kosong");
        return;
      }
      if (periodeAwal > periodeAkhir) {
        Alert.alert(
          "Warning",
          "Periode Awal tidak boleh lebih besar dari periode akhir"
        );
        return;
      }
    }

    if (selectedItem == null) {
      Alert.alert(
        "Warning",
        "pilih salah satu product yang tersedia terlebih dahulu"
      );
      return;
    }

    if (harga == "" || harga == 0) {
      Alert.alert("Warning", "Harga tidak boleh tidak terisi atau 0");
      return;
    }

    // if (harga <= 0) {
    //   Alert.alert("Warning", "Harga tidak boleh 0 atau dibawah 0");
    //   return;
    // }

    if (lokasi.locationid !== null) {
      Alert.alert("Simpan Data", "Apakah anda ingin menyimpan data ini?", [
        {
          text: "Yes",
          onPress: () => {
            setIsLoading(true);
            try {
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tanggal: lokasi.tanggal,
                  lokasiid: lokasi.locationid,
                  prodid: selectedItem,
                  nik: lokasi.nik,
                  harga: Number.parseFloat(harga.replace(/,/g, "")),
                  periodeawal:
                    periodeAwal == null
                      ? periodeAwal
                      : moment(periodeAwal).format("YYYY-MM-DD"),
                  periodeakhir:
                    periodeAkhir == null
                      ? periodeAkhir
                      : moment(periodeAkhir).format("YYYY-MM-DD"),
                  lokasiname: lokasi.customer,
                  prodname: categoriItem,
                }),
              };
              console.log("request", requestOptions);
              const url = constants.loginServer + "/inserthargaproduct";

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
                  ]);
                  cleardata();
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
      getLokasi();
      Alert.alert(
        "Warning",
        "Belum Melakukan Check in/berada di lokasi non customer"
      );
      return;
    }
  };

  const cleardata = () => {
    setHarga("0");
    setPeriodeAwal(null);
    setPeriodeAkhir(null);
    setSelectedItem(null);
    setSuggestionsList(null);
    setPromo("");
  };

  const onChangeTextharga = (harga) => {
    if (harga === "" || harga === "-") {
      harga = "0";
    }
    setHarga(NumberFormat(harga));
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={"light-content"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
      >
        <ScrollView
          nestedScrollEnabled
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: 100 }}
          style={styles.scrollContainer}
        >
          <View style={[styles.container]}>
            <View
              style={[styles.section, Platform.select({ ios: { zIndex: 97 } })]}
            >
              <Text style={styles.sectionTitle}>Lokasi</Text>
              <Text style={styles.sectionLokasi}>
                {lokasi == null ? "Belum Melakukan Check in" : lokasi.customer}
              </Text>

              <Text style={styles.sectionTitle}>Product Raja</Text>
              <>
                <View
                  style={[
                    { flex: 1, flexDirection: "row", alignItems: "center" },
                    Platform.select({ ios: { zIndex: 1 } }),
                  ]}
                >
                  <AutocompleteDropdown
                    ref={searchRef}
                    controller={(controller) => {
                      dropdownController.current = controller;
                    }}
                    // initialValue={'1'}
                    direction={Platform.select({ ios: "down" })}
                    dataSet={suggestionsList}
                    onChangeText={getSuggestions}
                    onSelectItem={(item) => {
                      // item && setSelectedItem(item.id.split(" ")[0].trim());
                      // item && setSelectedItem(item.id);
                      item && setSelectedItem(item.id);
                      item && setSelectedItemCat(item.category);
                      item && setTextInput(item.title);
                      // item && setHarga(NumberFormat(item.price.toString()));
                      // item && setWeight(item.weight);
                      item && setIdempId(item.idempid);
                      item && setCategoriItem(item.title);
                      item && setSelectedMeasure(item.uomname);
                      // item && setUomId(item.uomid);
                    }}
                    debounce={600}
                    //   suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
                    onClear={onClearPress}
                    //  onSubmit={(e) => onSubmitSearch(e.nativeEvent.text)}
                    onOpenSuggestionsList={onOpenSuggestionsList}
                    loading={loading}
                    useFilter={false} // set false to prevent rerender twice
                    textInputProps={{
                      placeholder: "Ketik 3+ karakter (proses...)",
                      autoCorrect: false,
                      autoCapitalize: "none",
                      style: {
                        borderRadius: 25,
                        backgroundColor: "#383b42",
                        color: "#fff",
                        paddingLeft: 18,
                      },
                    }}
                    rightButtonsContainerStyle={{
                      right: 8,
                      height: 30,
                      alignSelf: "center",
                    }}
                    inputContainerStyle={{
                      backgroundColor: "#383b42",
                      borderRadius: 25,
                    }}
                    suggestionsListContainerStyle={{
                      backgroundColor: "#383b42",
                    }}
                    containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                    renderItem={(item, text) => (
                      <Text style={{ color: "#fff", padding: 15 }}>
                        {item.title}
                      </Text>
                    )}
                    ChevronIconComponent={
                      <Feather name="chevron-down" size={20} color="#fff" />
                    }
                    ClearIconComponent={
                      <Feather name="x-circle" size={18} color="#fff" />
                    }
                    inputHeight={50}
                    showChevron={false}
                    closeOnBlur={false}
                    //  showClear={false}
                  />
                </View>
                <Text style={{ color: "#668", fontSize: 13 }}>
                  produk id: {selectedItem}
                </Text>
              </>
            </View>
          </View>
          <View
            style={{
              paddingVertical: SIZES.padding,
              paddingHorizontal: SIZES.radius,
              borderRadius: SIZES.radius,
              backgroundColor: COLORS.lightGray2,
              marginTop: -60,
            }}
          >
            {/* //   `Harga promo senilai Rp. ${formatNumber(
        //     foundPromo[0].harga
        //   )} untuk periode ${foundPromo[0].startperiod} s/d ${
        //     foundPromo[0].endperiod
        //   }` */}

            {promo !== "" && (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: -20,
                  }}
                >
                  {promo[0].diskon !== 0 ? (
                    <Text style={{ color: "#668", fontSize: 13 }}>
                      Terdapat potongan harga sebesar Rp.
                      {formatNumber(promo[0].diskon)} {"\n"}dari harga Rp.
                      {formatNumber(promo[0].hargapromo)} menjadi Rp.
                      {formatNumber(promo[0].finalpromo)}
                      {/* Harga promo senilai Rp. */}
                    </Text>
                  ) : (
                    <Text style={{ color: "#668", fontSize: 13 }}>
                      Harga Normal Rp.{formatNumber(promo[0].hargacurrent)}
                    </Text>
                  )}
                  <Text
                    style={{ color: "#668", fontSize: 16, fontWeight: "bold" }}
                  >
                    {/* {formatNumber(promo[0].harga)} */}
                  </Text>
                </View>
                {promo[0].diskon !== 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#668", fontSize: 13 }}>
                      Periode{" "}
                    </Text>
                    <Text
                      style={{
                        color: "#668",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {moment(promo[0].startperiod).format("DD-MM-yyyy")}
                      <Text style={{ color: "#668", fontSize: 13 }}> s/d </Text>
                      {moment(promo[0].endperiod).format("DD-MM-yyyy")}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <FormInput
              label="Harga"
              selectTextOnFocus
              keyboardType="numeric"
              value={harga}
              onChange={onChangeTextharga}
              inputContainerStyle={{
                backgroundColor: COLORS.white,
              }}
            />
            {/* periode awal */}
            <FormDateInput
              label="Periode awal promo"
              placeholder="DD/MM/YYYY"
              value={periodeAwal}
              setDate={setPeriodeAwal}
              containerStyle={{
                marginTop: SIZES.radius,
              }}
              inputContainerStyle={{
                backgroundColor: COLORS.white,
              }}
            />
            <FormDateInput
              label="Periode akhir promo"
              placeholder="DD/MM/YYYY"
              value={periodeAkhir}
              setDate={setPeriodeAkhir}
              containerStyle={{
                marginTop: SIZES.radius,
              }}
              inputContainerStyle={{
                backgroundColor: COLORS.white,
              }}
            />
          </View>
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
            onPress={() => simpanData()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      {isLoading && (
        <View>
          <Modal
            transparent={true}
            animationType={"none"}
            visible={isLoading}
            style={{ zIndex: 1100 }}
            onRequestClose={() => {}}
          >
            <View style={styles.modalBackground}>
              <View style={styles.activityIndicatorWrapper}>
                <ActivityIndicator
                  animating={isLoading}
                  color="#00ff00"
                  size="large"
                />
              </View>
            </View>
          </Modal>
        </View>
      )}
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

export default connect(mapStateToProps, mapDispatchToProps)(ProductSurvey);

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 25,
    marginBottom: 50,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  sectionLokasi: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  activityIndicatorWrapper: {
    // backgroundColor: "#rgba(0, 0, 0, 0.5)",
    height: 100,
    width: 100,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
