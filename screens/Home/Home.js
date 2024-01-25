import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";
import FlashMessage, { showMessage } from "react-native-flash-message";
import axios from "axios";
//async storage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HorizontalCard } from "../../components";
import { connect } from "react-redux";
import { GetDataLocal } from "../../utils";
import { TextButton } from "../../components";
import { FONTS, SIZES, COLORS, dummyData, constants } from "../../constants";
import { useCallback } from "react";
import moment from "moment";
// import DialogInput from "react-native-dialog-input";
import { NumberFormat } from "../../utils";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@rneui/themed";
import { setSelectedTab } from "../../stores/tab/tabActions";

const Section = ({ title, onPress, children }) => {
  return (
    <View>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: SIZES.padding,
          marginTop: 30,
          marginBottom: 20,
        }}
      >
        <Text style={{ flex: 1, ...FONTS.h3 }}>{title}</Text>

        {/* <TouchableOpacity onPress={onPress}>
          <Text style={{ color: COLORS.primary, ...FONTS.body3 }}>
            Show All
          </Text>
        </TouchableOpacity> */}
      </View>

      {/* Content */}
      {children}
    </View>
  );
};

const Home = (props) => {
  const [refreshing, setRefreshing] = React.useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(1);
  const [selectedMenuType, setSelectedMenuType] = useState(1);
  const [profile, setProfile] = useState({
    fullname: "",
    token: "",
    id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [popular, setPopular] = useState([]);
  const [arSalesman, setArSalesman] = useState([]);
  // const [input, setInput] = useState("");
  // const [recommends, setRecommends] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [lokasi, setLokasi] = useState(null);
  const [arCustomer, setArCustomer] = useState([]);
  const [dt, setDt] = useState(null);
  const [tgl, setTgl] = useState(null);
  const isFocused = useIsFocused();
  // const [showFilterModal, setShowFilterModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const [additional, setAdditional] = useState(null);
  const [additionalRmp, setAdditionalRmp] = useState(null);
  const navigation = useNavigation();

  // useCallback(() => {
  //   // console.log("masuk sini lewat callback");
  //   onRefresh();
  // }, []);

  useEffect(() => {
    // console.log("tes isfocused", lokasi);
    GetDataLocal("lokasi").then((res) => {
      let a = res;
      console.log("check data local", res);
      if (a == null) {
        setLokasi(null);
        setAdditional(null);
      } else {
        if (lokasi !== null) {
          if (lokasi.locationIdemp !== null) {
            cekArCustomer(lokasi.locationIdemp);
            cekCreditLimit(lokasi.locationIdemp);
            // cekCreditLimitRmp(lokasi.locationIdemp);
          }
        }
      }
      navigation.addListener("focus", () => {
        console.log("masuk sini refresh auto");
        // onRefresh();
        getUser();
      });
    });
  }, [navigation]);

  useEffect(() => {
    handleChangeCategory(selectedCategoryId, selectedMenuType);
    setRefreshing(false);
  }, [popular]);

  // useEffect(() => {
  //   // console.log("pencet bro", props.selectedTab);
  //   if (props.selectedTab === "Home") {
  //     // getAdditional();
  //     // getAdditionalRmp();
  //     // getLokasi();
  //     getUser();
  //   }
  // }, [props.selectedTab]);

  useEffect(() => {
    // console.log("masuk lewat sono");
    getUser();
    handleChangeCategory(selectedCategoryId, selectedMenuType);
    // handleChangeCategory(1, selectedMenuType);
  }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // console.log("refresh 1", lokasi);
  //     if (lokasi === null) {
  //       getLokasi();
  //       getAdditional();

  //       // getAdditionalRmp();
  //     }
  //     // getUser();
  //     scheduleToday(profile.id);
  //     // console.log("category", selectedCategoryId);
  //     // console.log("menu", selectedMenuType);
  //     handleChangeCategory(selectedCategoryId, selectedMenuType);
  //   }, [lokasi])
  // );

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

  const onRefresh = () => {
    //Clear old data of the list
    // setPopular([]);
    //Call the Service to get the latest data
    // console.log("ID yg di pake", profile.id);
    // console.log("masuk lewat refresh");
    console.log("profile", profile);
    if (profile.id !== "") {
      scheduleToday(profile.id);
      cekArPersalesman(profile.salesrep);
      cekAbsen(profile.id);
    }
    getAdditional();
    // getAdditionalRmp();
    getLokasi();
    handleChangeCategory(1, 1);
  };

  async function cekArPersalesman(salesman) {
    var config2 = {
      method: "post",
      url:
        constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getOpenInvoiceArSalesman",
            DataRow: {
              field: [
                {
                  "@column": "SalesRep_ID",
                  val: salesman,
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
      },
    };

    axios(config2).then(function async(response) {
      // console.log("respon AR", response.data.WindowTabData.RowCount);
      if (response.data.WindowTabData.RowCount > 0) {
        // console.log(
        //   "masuk itung AR",
        //   response.data.WindowTabData.DataSet.DataRow[0]
        // );
        var dataAr = {
          invoicecount:
            response.data.WindowTabData.DataSet.DataRow.field[3].val,
          invoicevalue:
            response.data.WindowTabData.DataSet.DataRow.field[4].val,
        };
      } else {
        var dataAr = {
          invoicecount: 0,
          invoicevalue: 0,
        };
      }
      setArSalesman(dataAr);
    });
  }

  async function cekCreditLimitRmp(bpid) {
    // console.log("bpid", bpid);
    var config2 = {
      method: "post",
      url:
        constants.idempServerRmp +
        "ADInterface/services/rest/model_adservice/query_data",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getCreditAvailable",
            DataRow: {
              field: [
                {
                  "@column": "C_BPartner_ID",
                  val: bpid,
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
      },
    };

    axios(config2).then(function async(response) {
      console.log(
        "cek CL RMP",
        response.data.WindowTabData.DataSet.DataRow.field.val
      );
      // setAdditional({
      //   ...additional,
      //   cl: response.data.WindowTabData.DataSet.DataRow.field.val,
      // });
      persistAdditionalRmp(
        additionalRmp,
        response.data.WindowTabData.DataSet.DataRow.field.val
      );
    });
  }

  function cekArCustomer(bpid) {
    var config2 = {
      method: "post",
      url:
        constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getArPercustomer",
            DataRow: {
              field: [
                {
                  "@column": "C_BPartner_ID",
                  val: bpid,
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
      },
    };

    axios(config2).then(function async(response) {
      if (response.data.WindowTabData.RowCount > 0) {
        let customerar = [];

        customerar.push({
          hitunginv: response.data.WindowTabData.DataSet.DataRow.field[1].val,
          totalinv: response.data.WindowTabData.DataSet.DataRow.field[2].val,
        });
        setArCustomer(customerar);
        console.log("ar customer", customerar);
      } else {
        setArCustomer([]);
      }
    });
  }

  async function cekCreditLimit(bpid) {
    console.log("bpid", bpid);
    var config2 = {
      method: "post",
      url:
        constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getCreditAvailable",
            DataRow: {
              field: [
                {
                  "@column": "C_BPartner_ID",
                  val: bpid,
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
      },
    };

    axios(config2).then(function async(response) {
      persistAdditional(
        additional,
        response.data.WindowTabData.DataSet.DataRow.field.val
      );
    });
  }

  const persistAdditional = async (additional, newAdditional) => {
    console.log("tes masuk 1 ", additional);

    // console.log("tes masuk 2 ", newAdditional);

    let newValue = additional;
    newValue.clavailable = newAdditional;

    // console.log("new value", newValue);
    await AsyncStorage.setItem("additional", JSON.stringify(newValue))
      .then(() => {
        // console.log("additionalnewvalue :", newValue);
        setAdditional(newValue);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const persistAdditionalRmp = async (additionalRmp, newAdditional) => {
    "tes masuk additional rmp ", additionalRmp;

    // console.log("tes masuk 2 ", newAdditional);

    let newValue = additionalRmp;
    newValue.clavailable = newAdditional;

    // console.log("new value", newValue);
    await AsyncStorage.setItem("additionalrmp", JSON.stringify(newValue))
      .then(() => {
        // console.log("additionalnewvalue :", newValue);
        setAdditionalRmp(newValue);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const getLokasi = () => {
    // console.log("additional", additional);
    GetDataLocal("lokasi").then((res) => {
      var tgl = new Date();
      var checkdate =
        tgl.getFullYear() +
        "-" +
        ("0" + (tgl.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + tgl.getDate()).slice(-2);
      // console.log("result home", res);
      if (res !== null) {
        if (checkdate != res.tanggal) {
          cleartgl();
        } else {
          cekArCustomer(res.locationIdemp);
          setLokasi(res);
        }
        // } else {
        //   // console.log("masuk sini cari user");
        //   getUser();
        //   // cekLastCheckin();
      } else {
        cleartgl();
        // onRefresh()
      }
    });
  };

  const getAdditional = async () => {
    await GetDataLocal("additional").then((res1) => {
      // console.log("get additional BPR", res1);
      setAdditional(res1);
    });
  };

  const getAdditionalRmp = async () => {
    await GetDataLocal("additionalrmp").then((res1) => {
      setAdditionalRmp(res1);
    });
  };

  const getUser = async () => {
    await GetDataLocal("user").then((res) => {
      const data = res;
      // console.log("dari user", res);
      scheduleToday(res.id);
      setProfile(data);
      cekArPersalesman(res.salesrep);
      cekAbsen(res.id);
      // cekLastCheckin(res.id);
      getAdditional();
      getLokasi();
      handleChangeCategory(1, 1);
    });
  };

  const cleartgl = () => {
    AsyncStorage.removeItem("lokasi")
      .then(() => {
        setLokasi(null);
        setAdditional(null);
        setArCustomer([]);
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

  const checkout = () => {
    let a = moment(moment(tgl + " " + dt).format("YYYY-MM-DDTHH:mm:ss")); //now
    let b = moment(
      moment(tgl + " " + lokasi.waktuin).format("YYYY-MM-DDTHH:mm:ss")
    );
    let c = a.diff(b, "minutes");

    if (c >= 5) {
      Alert.alert(
        "Checkout",
        "Anda berada di " +
          JSON.stringify(lokasi.customer) +
          " selama " +
          c +
          " Menit, Yakin mau checkout?",
        [
          {
            text: "Yes",
            onPress: () => {
              setIsLoading(true);
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tanggal: tgl + " " + dt,
                  lokasiid: lokasi.locationid,
                  nik: lokasi.nik,
                  customer: lokasi.customer.replace("'", "`"),
                  alasan: null,
                  lokasiidemp: lokasi.locationIdemp,
                }),
              };
              // console.log(requestOptions);
              const url = constants.loginServer + "/updatesalescicov1";
              fetch(url, requestOptions).then(async (response) => {
                const isJson = response.headers
                  .get("content-type")
                  ?.includes("application/json");
                const hasil1 = isJson && (await response.json());
                // console.log("hasil", hasil1);
                if (!response.ok) {
                  // get error message from body or default to response status
                  // const error = (data && data.message) || response.status;
                  // return Promise.reject(error);
                  setIsLoading(false);
                  Alert.alert("Invalid Data", "please check the data", [
                    { text: "Okay" },
                  ]);
                  return;
                } else {
                  setIsLoading(false);
                  // console.log(hasil1);
                  Alert.alert("Sukses", "Checkout Berhasil", [
                    { text: "Okay" },
                  ]);
                  cleartgl();
                }
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
    } else {
      // console.log("tes masuk sini");
      {
        navigation.navigate("CheckOut");
      } // setVisible(true);
      // renderReasonout();
    }
  };
  // Handler

  const cekAbsen = async (nik) => {
    console.log("nik", nik);
    const response = await axios.get(
      constants.inhouseServer + `getbakneedrevision?userid=${nik}`
    );
    // setDataAbsensi(response.data.result);
    // console.log("absensi", response.data.result.length);
    if (response.data.result.length > 0) {
      showMessage({
        message: "Ada Absen Tidak Lengkap",
        description:
          "Ajukan perbaikan di hai.sep-food.com, detail ada di menu Notification",
        type: "warning",
        duration: 4000,
        icon: () => (
          <Icon
            name="warning"
            size={20}
            color="#aa2020"
            style={{ paddingRight: 20, paddingTop: 14 }}
          />
        ),
      });
    }
  };

  function handleChangeCategory(categoryId, menuTypeId) {
    let selectedMenu = popular;
    setMenuList(selectedMenu?.filter((a) => a.categories == categoryId));
  }

  const scheduleToday = (props) => {
    // console.log("props schedule", props);
    const url =
      constants.loginServer + `/getschedulebyniktodayv1?filter=${props}`;
    // console.log("url", url);
    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundschedule = isJson && (await response.json());
      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      } else {
        // console.log("schedule", foundschedule);
        setPopular(foundschedule);
      }
      // console.log("Data schedule", foundschedule);
      // setRecommends(foundschedule);
      setRefreshing(false);
      // handleChangeCategory(1, 1);
    });
  };

  // Render

  function renderCategories() {
    return (
      <FlatList
        data={dummyData.categories}
        keyExtractor={(item) => `${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              height: 55,
              marginTop: SIZES.middle,
              marginLeft: index == 0 ? SIZES.padding : SIZES.radius,
              marginRight:
                index == dummyData.categories.length - 1 ? SIZES.padding : 0,
              paddingHorizontal: 5,
              borderRadius: SIZES.radius,
              backgroundColor:
                selectedCategoryId == item.id
                  ? COLORS.primary
                  : COLORS.lightGray2,
            }}
            onPress={() => {
              setSelectedCategoryId(item.id);
              handleChangeCategory(item.id, 1);
              //   console.log("item", selectedMenuType);
            }}
          >
            <Image
              source={item.icon}
              style={{
                marginTop: 10,
                height: 30,
                width: 30,
              }}
            />

            <Text
              style={{
                alignSelf: "center",
                marginRight: SIZES.base,
                color:
                  selectedCategoryId == item.id
                    ? COLORS.white
                    : COLORS.darkGray,
                ...FONTS.h5,
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    );
  }

  function renderLokasi() {
    return (
      <View
        style={{
          flex: 1,
          marginBottom: SIZES.padding,
          padding: SIZES.radius,
          borderBottomLeftRadius: SIZES.radius,
          borderBottomRightRadius: SIZES.radius,
          backgroundColor: COLORS.lightGray2,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
          }}
        >
          {/* Info */}
          <View
            style={{
              flex: 1,
              marginLeft: SIZES.radius,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ ...FONTS.h3 }}>Sudah di lokasi ?</Text>
              <Text style={{ color: COLORS.darkGray2, ...FONTS.body4 }}>
                Jangan lupa untuk{" "}
                <Text style={{ fontWeight: "bold" }}>Check-in</Text>
              </Text>
              <View>
                <TextButton
                  label="Check-in"
                  labelStyle={{
                    color: COLORS.primary,
                    ...FONTS.body2,
                  }}
                  buttonContainerStyle={{
                    backgroundColor: COLORS.transparentPrimary,
                    borderRadius: SIZES.radius,
                  }}
                  onPress={() => navigation.navigate("CheckIn")}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  function renderReasonout() {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <DialogInput
          isDialogVisible={visible}
          title={"Alasan"}
          message={"Anda Checkout kurang dari 5 menit"}
          hintInput={"Input Alasan"}
          submitInput={(inputText) => {
            // console.log("input", inputText);
            if (inputText === undefined) {
              Alert.alert("Warning", "Alasan tidak boleh kosong", [
                { text: "Okay" },
              ]);
              return;
            }
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tanggal: tgl + " " + dt,
                lokasiid: lokasi.locationid,
                nik: lokasi.nik,
                customer: lokasi.customer.replace("'", "`"),
                alasan: inputText,
                lokasiidemp: lokasi.locationIdemp,
              }),
            };
            setIsLoading(true);
            const url = constants.loginServer + "/updatesalescicov1";
            fetch(url, requestOptions).then(async (response) => {
              const isJson = response.headers
                .get("content-type")
                ?.includes("application/json");
              const hasil1 = isJson && (await response.json());
              // console.log("hasil", hasil1);
              if (!response.ok) {
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
                setIsLoading(false);
                cleartgl();
              }
            });
            setIsLoading(false);
            setVisible(false);
          }}
          closeDialog={() => setVisible(false)}
        ></DialogInput>
      </View>
    );
  }

  function renderCl() {
    return (
      <View>
        <Text
          style={{
            alignItems: "flex-start",
            color: COLORS.darkGray2,
            ...FONTS.body4,
          }}
        >
          Overdue : {arCustomer[0].hitunginv} Invoice
        </Text>
        <Text
          style={{
            alignItems: "flex-end",
            color: COLORS.darkGray2,
            ...FONTS.body4,
          }}
        >
          Total :Rp.{" "}
          {arCustomer[0].totalinv > 0
            ? NumberFormat(arCustomer[0].totalinv).toString()
            : 0}
        </Text>
      </View>
    );
  }

  function renderClKosong() {
    return (
      <View>
        <Text style={{ color: COLORS.darkGray2, ...FONTS.body4 }}>
          Kredit limit : -
        </Text>
      </View>
    );
  }

  function renderLokasiOut() {
    return (
      <View
        style={{
          flex: 1,
          marginBottom: SIZES.radius,
          padding: SIZES.radius,
          borderBottomLeftRadius: SIZES.radius,
          borderBottomRightRadius: SIZES.radius,
          backgroundColor: COLORS.lightGray2,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
          }}
        >
          {/* Info */}
          <View
            style={{
              flex: 1,
              marginLeft: SIZES.radius,
            }}
          >
            <View style={{ flex: 1, zIndex: 1 }}>
              <Text style={{ ...FONTS.h4 }} numberOfLines={1}>
                Lokasi : {lokasi.customer}
              </Text>
              {additional === null || additional.cl === undefined ? (
                // ? renderClKosong()
                <></>
              ) : arCustomer.length > 0 ? (
                renderCl()
              ) : (
                <Text>Tidak ada overdue</Text>
              )}
              <Text style={{ color: COLORS.darkGray2, ...FONTS.body4 }}>
                Check in : {lokasi.waktuin}
              </Text>
              <View style={{ flex: 1 }}>
                <TextButton
                  label="Check-out"
                  labelStyle={{
                    color: COLORS.primary,
                  }}
                  buttonContainerStyle={{
                    backgroundColor: COLORS.transparentPrimary,
                    borderRadius: SIZES.radius,
                    height: 30,
                  }}
                  onPress={checkout}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#4e0329", "#ddb52f"]} style={styles.rootScreen}>
        <ImageBackground
          source={require("../../assets/images/background.png")}
          resizeMode="cover"
          style={styles.rootScreen}
          imageStyle={styles.backgroundImage}
        >
          {refreshing ? <ActivityIndicator /> : null}
          {visible ? renderReasonout() : null}
          <View style={{ flex: 1, zIndex: 1 }}>
            {lokasi === null ? renderLokasi() : renderLokasiOut()}
          </View>
          <View style={{ flex: 4, zIndex: 2 }}>
            {arSalesman.invoicecount > 0 ? (
              <View
                style={{
                  backgroundColor: COLORS.red,
                  marginTop: -5,
                  marginBottom: 10,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white2,
                    ...FONTS.body4,
                    marginLeft: SIZES.radius,
                  }}
                >
                  Total Invoice Due Date : {arSalesman.invoicecount} Invoice
                </Text>
                <Text
                  style={{
                    color: COLORS.white2,
                    ...FONTS.body4,
                    marginLeft: SIZES.radius,
                  }}
                >
                  Nilai Invoice Due Date :Rp.{" "}
                  {arSalesman.invoicevalue > 0
                    ? NumberFormat(arSalesman.invoicevalue).toString()
                    : 0}
                </Text>
              </View>
            ) : (
              <></>
            )}
            {/* List */}
            <FlatList
              data={menuList}
              keyExtractor={(item) =>
                `${item.id} + ${item.tgl} + ${item.idcico}`
              }
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={{ flex: 1, alignItems: "center" }}>
                  {renderCategories()}
                </View>
              }
              renderItem={({ item, index }) => {
                return (
                  <HorizontalCard
                    containerStyle={{
                      height: 120,
                      alignItems: "center",
                      marginHorizontal: SIZES.padding,
                      marginBottom: SIZES.radius,
                      padding: 5,
                    }}
                    imageStyle={{
                      marginTop: 20,
                      height: 110,
                      width: 110,
                    }}
                    item={item}
                    lokasi={lokasi === null ? "" : lokasi.customer}
                    onPress={
                      () =>
                        navigation.navigate("DashboardDetail", {
                          detailItem: item,
                        })
                      // console.log("pencet", item)
                    }
                  />
                );
              }}
              refreshControl={
                <RefreshControl
                  //refresh control used for the Pull to Refresh
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              ListFooterComponent={<View style={{ height: 200 }} />}
            />
          </View>
        </ImageBackground>
      </LinearGradient>
      <FlashMessage position={"top"} duration={3000} />
    </SafeAreaView>
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);

const styles = StyleSheet.create({
  rootScreen: {
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
  backgroundImage: {
    opacity: 0.15,
  },
});
