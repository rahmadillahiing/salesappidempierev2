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

import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

import moment from "moment";

import { connect } from "react-redux";
import { setSelectedTab } from "../../stores/tab/tabActions";

import Feather from "@expo/vector-icons/Feather";
Feather.loadFont();

import { FormInput, FormDateInput, TextButton } from "../../components";
import { COLORS, SIZES, icons, constants } from "../../constants";

import { GetDataLocal, NumberFormat } from "../../utils";

const ProductCompetitorSurvey = (props) => {
  const [lokasi, setLokasi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionsList, setSuggestionsList] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const dropdownController = useRef(null);

  const searchRef = useRef(null);

  const [harga, setHarga] = useState("0");
  const [periodeAwal, setPeriodeAwal] = useState(null);
  const [periodeAkhir, setPeriodeAkhir] = useState(null);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     getLokasi();
  //   }, [])
  // );

  useEffect(() => {
    if (props.selectedTab == "Kompetitor") {
      getLokasi();
    }
  }, [props.selectedTab]);

  const getLokasi = () => {
    GetDataLocal("lokasi").then((res) => {
      // console.log("lokasi survey", res);
      if (res !== null) {
        setLokasi(res);
      } else {
        setLokasi(null);
      }
    });
  };

  const getSuggestions = useCallback(async (q) => {
    const filterToken = q.toLowerCase();
    // console.log("getSuggestions", q);
    if (typeof q !== "string" || q.length < 3) {
      setSuggestionsList(null);
      return;
    }
    setLoading(true);
    const response = await fetch(
      constants.loginServer + "/getproductcompetitor"
    );
    const items = await response.json();
    const suggestions = items
      .filter((item) => item.title.toLowerCase().includes(filterToken))
      .map((item) => ({
        id: item.id,
        title: item.title,
      }));
    setLoading(false);
    setSuggestionsList(suggestions);
  }, []);

  const onClearPress = useCallback(() => {
    setSuggestionsList(null);
    setSelectedItem(null);
  }, []);

  const onOpenSuggestionsList = useCallback((isOpened) => {}, []);

  const simpanData = () => {
    if (lokasi === null) {
      Alert.alert(
        "Warning",
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

    if (harga == "") {
      Alert.alert("Warning", "Harga tidak boleh tidak terisi");
      return;
    }

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
                }),
              };
              // console.log("request", requestOptions);
              const url = constants.loginServer + "/insertcompetitorproduct";

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
          contentContainerStyle={{ paddingBottom: 200 }}
          style={styles.scrollContainer}
        >
          <View style={[styles.container]}>
            {/* <Text style={styles.title}>Survey Harga & Promo </Text> */}
            <View
              style={[styles.section, Platform.select({ ios: { zIndex: 97 } })]}
            >
              <Text style={styles.sectionTitle}>Lokasi</Text>
              <Text style={styles.sectionLokasi}>
                {lokasi == null ? "Belum Melakukan Check in" : lokasi.customer}
              </Text>

              <Text style={styles.sectionTitle}>Product Kompetitor</Text>
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
                      item && setSelectedItem(item.id);
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
              marginTop: -50,
            }}
          >
            {/* Harga */}
            <FormInput
              label="Harga"
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductCompetitorSurvey);

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
