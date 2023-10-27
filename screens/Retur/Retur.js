import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";

//camera
import { Camera } from "expo-camera";
// import * as ImageManipulator from "expo-image-manipulator";

import moment from "moment";

import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

// Async storage
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GetDataLocal, NumberFormat } from "../../utils";

import Icon from "@expo/vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
Feather.loadFont();

import {
  TextButton,
  Header,
  IconButton,
  FormPicker,
  TextIconButton,
} from "../../components";

import { COLORS, SIZES, icons, constants, images } from "../../constants";

const Retur = ({ navigation }) => {
  const [isLoading, setIsloading] = useState(false);
  const [additional, setAdditional] = useState(null);
  const [listProductAvailable, setListProductAvailable] = useState([]);
  const [lokasi, setLokasi] = useState(null);
  const [suggestionsList, setSuggestionsList] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [uomId, setUomId] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [alasanRetur, setAlasanRetur] = useState("");
  const [alasanReturLain, setAlasanReturLain] = useState("");
  const [idempid, setIdempId] = useState("");
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const dropdownController = useRef(null);

  const [useCamera, setUseCamera] = useState(false);
  const cameraRef = useRef(null);

  const searchRef = useRef(null);
  const flatListRef = useRef();

  const [stock, setStock] = useState("0");

  const [todos, setTodos] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getLokasi();
    }, [])
  );

  useEffect(() => {
    getTodosFromUserDevice();
  }, []);

  useEffect(() => {
    saveTodoToUserDevice(todos);
  }, [todos]);

  const getTodosFromUserDevice = async () => {
    try {
      const todo = await AsyncStorage.getItem("retur");
      if (todo != null) {
        setTodos(JSON.parse(todo));
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const saveTodoToUserDevice = async (todos) => {
    try {
      // console.log(todos);
      const stringifyTodos = JSON.stringify(todos);
      await AsyncStorage.setItem("retur", stringifyTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const addTodo = () => {
    if (lokasi.locationid === null) {
      Alert.alert(
        "Error",
        "Belum Melakukan Check in/berada di lokasi non customer"
      );
      return;
    }

    if (
      alasanRetur == null ||
      alasanRetur == "" ||
      alasanRetur == "undefined"
    ) {
      // console.log("alasan retur", alasanRetur);
      Alert.alert("Error", "Mohon untuk Mengisi alasan retur terlebih dahulu");
      return;
    }

    if (alasanRetur.id == 5 && alasanReturLain == "") {
      Alert.alert("Error", "Mohon untuk Mengisi alasan untuk opsi lain-lain");
      return;
    }

    let kembar = false;
    if (selectedItem == null || stock == null || stock == "0") {
      Alert.alert("Error", "Pilih produk dan input qty terlebih dahulu ");
    } else {
      const newTodo = {
        id: selectedItem,
        task: textInput,
        qty: stock,
        unit: selectedMeasure,
        alasan: alasanRetur.id == 5 ? alasanReturLain : alasanRetur.label,
        idempid: idempid,
        unitid: uomId,
      };

      // console.log("newtodo", newTodo);
      todos.forEach((obj) => {
        if (obj.id === selectedItem) {
          kembar = true;
          const newStockItem =
            Number.parseFloat(obj.qty) + Number.parseFloat(stock);
          obj.qty = newStockItem;
          obj.alasan =
            alasanRetur.id == 5 ? alasanReturLain : alasanRetur.label;
          AsyncStorage.removeItem("retur");
          saveTodoToUserDevice(todos);

          return;
        }
      });

      if (!kembar) {
        setTodos([...todos, newTodo]);
      }
      // InsertUpdateData();
      cleardata();
    }
  };

  const getLokasi = () => {
    let lokasiretur = "";
    GetDataLocal("lokasi").then((res) => {
      if (res !== null) {
        lokasiretur = res;
        setLokasi(res);
        // console.log("lokasi", res);
      }
    });
    if (lokasiretur.locationid !== null) {
      GetDataLocal("additional").then(async (res1) => {
        // console.log("res1",res1)
        if (res1 !== null) {
          // if (res1.length > 0) {
          setAdditional(res1);
          // console.log("res1 retur", res1);

          axios
            .post(
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
                          val: res1.pricelistid,
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
            )
            .then(function (listPrice) {
              const product = [];
              if (listPrice.data.WindowTabData.RowCount === 1) {
                product.push({
                  key: listPrice.data.WindowTabData.DataSet.DataRow.field[0]
                    .val,
                  id: listPrice.data.WindowTabData.DataSet.DataRow.field[0].val,
                  title:
                    listPrice.data.WindowTabData.DataSet.DataRow.field[1].val,
                  price:
                    listPrice.data.WindowTabData.DataSet.DataRow.field[8].val,
                  weight:
                    listPrice.data.WindowTabData.DataSet.DataRow.field[3].val,
                  idempid:
                    listPrice.data.WindowTabData.DataSet.DataRow.field[4].val,
                  category:
                    listPrice.data.WindowTabData.DataSet.DataRow.field[7].val,
                  uomname:
                    listPrice.data.WindowTabData.DataSet.DataRow.field[9].val,
                  uomid:
                    listPrice.data.WindowTabData.DataSet.DataRow.field[10].val,
                });
              } else {
                for (
                  var i = 0;
                  i < listPrice.data.WindowTabData.RowCount;
                  i++
                ) {
                  product.push({
                    key: listPrice.data.WindowTabData.DataSet.DataRow[i]
                      .field[0].val,
                    id: listPrice.data.WindowTabData.DataSet.DataRow[i].field[0]
                      .val,
                    title:
                      listPrice.data.WindowTabData.DataSet.DataRow[i].field[1]
                        .val,
                    price:
                      listPrice.data.WindowTabData.DataSet.DataRow[i].field[8]
                        .val,
                    weight:
                      listPrice.data.WindowTabData.DataSet.DataRow[i].field[3]
                        .val,
                    idempid:
                      listPrice.data.WindowTabData.DataSet.DataRow[i].field[4]
                        .val,
                    category:
                      listPrice.data.WindowTabData.DataSet.DataRow[i].field[7]
                        .val,
                    uomname:
                      listPrice.data.WindowTabData.DataSet.DataRow[i].field[9]
                        .val,
                    uomid:
                      listPrice.data.WindowTabData.DataSet.DataRow[i].field[10]
                        .val,
                  });
                  // console.log("hasil mapping", product);
                }
              }
              setListProductAvailable(product);
            });
          // }
        }
      });
    }
  };

  // const getSuggestions = useCallback(
  //   async (q) => {
  //     const filterToken = q.toLowerCase();
  //     // console.log("getSuggestions", q);
  //     if (typeof q !== "string" || q.length < 3) {
  //       setSuggestionsList(null);
  //       return;
  //     }
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
          id: item.id,
          title: item.title,
          price: item.price,
          idempid: item.idempid,
          weight: item.weight,
          category: item.category,
          uomname: item.uomname,
          uomid: item.uomid,
        }));

      setSuggestionsList(suggestions);
      setLoading(false);
    },
    [listProductAvailable]
  );

  const onClearPress = useCallback(() => {
    setSuggestionsList(null);
    setSelectedItem(null);
    setSelectedMeasure(null);
    setTextInput("");
    setStock("0");
    setAlasanRetur("");
    setAlasanRetur("");
  }, []);

  const onOpenSuggestionsList = useCallback((isOpened) => {}, []);

  const InsertUpdateData = () => {
    var ketemu = false;
    try {
      GetDataLocal("retur").then((res) => {
        res.forEach((element) => {
          // console.log("tes Found", found);
          if (element.id === selectedItem) {
            ketemu = true;
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tanggal: lokasi.tanggal,
                lokasiid: lokasi.locationid,
                prodid: selectedItem,
                nik: lokasi.nik,
                qty: element.qty,
                // unit: selectedMeasure,
                alasan:
                  alasanRetur.id == 5 ? alasanReturLain : alasanRetur.label,
              }),
            };
            const url = constants.loginServer + "/insertupdatereturnproduct";

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
                // Alert.alert("Sukses", "Data telah tersimpan", [
                //   { text: "Okay" },
                // ]);
              }
            });
          }
        });
        if (!ketemu) {
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tanggal: lokasi.tanggal,
              lokasiid: lokasi.locationid,
              prodid: selectedItem,
              nik: lokasi.nik,
              qty: stock,
              // unit: selectedMeasure,
              alasan: alasanRetur.id == 5 ? alasanReturLain : alasanRetur.label,
            }),
          };
          const url = constants.loginServer + "/insertupdatereturnproduct";

          fetch(url, requestOptions).then(async (response) => {
            const isJson = response.headers
              .get("content-type")
              ?.includes("application/json");
            const hasil1 = isJson && (await response.json());
            if (!response.ok) {
              Alert.alert("Data Invalid", "Hubungi IT", [{ text: "Okay" }]);
              return;
            } else {
              return;
              // console.log("data tersimpan :", hasil1);
              // Alert.alert("Sukses", "Data telah tersimpan", [{ text: "Okay" }]);
            }
          });
        }
        cleardata();
      });
    } catch {
      (err) => console.log(err);
      return;
    }
  };

  const cleardata = () => {
    setSelectedItem(null);
    setSuggestionsList(null);
    setSelectedMeasure(null);
    setStock("0");
    setAlasanRetur("");
    setAlasanReturLain("");
  };

  function renderHeader() {
    return (
      <Header
        title="INPUT RETUR"
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
            onPress={() => navigation.goBack()}
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

  const deleteTodo = (todoId) => {
    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: lokasi.tanggal,
          lokasiid: lokasi.locationid,
          prodid: todoId,
          nik: lokasi.nik,
        }),
      };
      const url = constants.loginServer + "/deletestockproduct";

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
          // Alert.alert("Sukses", "Data telah tersimpan", [{ text: "Okay" }]);
        }
      });
    } catch {
      (err) => console.log(err);
      return;
    }

    const newTodosItem = todos.filter((item) => item.id != todoId);
    setTodos(newTodosItem);
  };

  const ListItem = ({ todo }) => {
    return (
      <View style={styles.listItem}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 10,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            {todo.id}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            {todo?.task}
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Qty : {todo?.qty} {todo?.unit}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            Alasan : {todo?.alasan}
          </Text>
        </View>
        <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
          <View style={styles.actionIcon}>
            <Icon name="delete" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const onChangeTextQty = (stock) => {
    if (stock === "" || stock === "-") {
      stock = "0";
    }
    setStock(NumberFormat(stock));
  };

  async function simpanRetur() {
    if (todos.length === 0) {
      Alert.alert(
        "Warning",
        "Input minimal 1 produk terlebih dahulu sebelum melakukan penyimpanan data"
      );
      return;
    }

    Alert.alert(
      "Simpan data retur?",
      "Apakah anda yakin ingin menyimpan data retur?",
      [
        {
          text: "Yes",
          onPress: async () => {
            setIsloading(true);

            const dataReturDetail = [];

            todos.forEach((element) => {
              dataReturDetail.push({
                TargetPort: "createData",
                ModelCRUD: {
                  serviceType: "addSalesOrderLine",
                  DataRow: {
                    field: [
                      {
                        "@column": "AD_Org_ID",
                        val: "@C_Order.AD_Org_ID",
                      },
                      {
                        "@column": "C_Order_ID",
                        val: "@C_Order.C_Order_ID",
                      },
                      {
                        "@column": "Description",
                        val: element.alasanRetur,
                      },
                      {
                        "@column": "M_Product_ID",
                        val: element.idempid,
                      },
                      {
                        "@column": "QtyEntered",
                        val: element.qty,
                      },
                      {
                        "@column": "C_UOM_ID",
                        val: element.unitid,
                      },
                    ],
                  },
                },
              });
            });

            var data = JSON.stringify({
              CompositeRequest: {
                ADLoginRequest: {
                  user: lokasi.nama,
                  pass: lokasi.pass,
                  lang: "en_US",
                  ClientID: "1000003",
                  RoleID: "1000079",
                  OrgID: "0",
                  WarehouseID: "0",
                  stage: "9",
                },
                serviceType: "composite",
                operations: {
                  operation: [
                    {
                      TargetPort: "createData",
                      ModelCRUD: {
                        serviceType: "addSalesOrder",
                        DataRow: {
                          field: [
                            {
                              "@column": "AD_Org_ID",
                              val: lokasi.org,
                            },
                            {
                              "@column": "C_DocTypeTarget_ID",
                              val: "1000084",
                            },
                            {
                              "@column": "Description",
                              val: "Retur " + lokasi.customer,
                            },
                            {
                              "@column": "DateOrdered",
                              val: moment(new Date()).format(
                                "YYYY-MM-DD HH:mm:ss"
                              ),
                            },
                            {
                              "@column": "C_BPartner_ID",
                              val: lokasi.locationIdemp,
                            },
                            {
                              "@column": "M_Warehouse_ID",
                              val: lokasi.whid,
                            },
                            {
                              "@column": "SalesRep_ID2",
                              val: lokasi.salesrep,
                            },
                          ],
                        },
                      },
                    },
                    dataReturDetail,
                  ],
                },
              },
            });
            // console.log("Tes API", data);
            var config = {
              method: "post",
              url:
                constants.idempServerBpr +
                "ADInterface/services/rest/composite_service/composite_operation",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              data: data,
            };

            axios(config)
              .then(function (response) {
                // console.log(JSON.stringify(response.data));

                const check =
                  JSON.stringify(response.data).indexOf("true") > -1;

                // console.log(
                //   "tes",
                //   JSON.stringify(response.data).indexOf("true") > -1
                // );
                if (check === true) {
                  var arr = "";
                  var data = JSON.stringify(
                    response.data.CompositeResponses.CompositeResponse
                      .StandardResponse
                  );

                  // if (data["@IsError"] === true) {
                  //   arr = data["Error"];
                  // }
                  // console.log("data", data.length);

                  // console.log("arr", data["Error"]);
                  Alert.alert("Error Retur", "Terdapat Error,Hubungi IT ", [
                    { text: "OK" },
                  ]);
                  setIsloading(false);
                } else {
                  // var data = JSON.stringify(
                  //   response.data.CompositeResponses.CompositeResponse
                  //     .StandardResponse
                  // );
                  var data = new FormData();
                  data.append("image", {
                    uri: image,
                    type: "image/jpg",
                    name:
                      moment(new Date()).format("YYYY-MM-DD HH:mm:ss") +
                      "-" +
                      lokasi.locationIdemp +
                      ".jpg",
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
                      // console.log("hasil1", hasil1);
                    });
                  } catch {
                    setIsloading(false);
                    (err) => console.log(err);
                    return;
                  }

                  let data1 =
                    response.data.CompositeResponses.CompositeResponse
                      .StandardResponse[0].outputFields.outputField[0][
                      "@value"
                    ];
                  // console.log("data", data);
                  const options = {
                    redoc: data1,
                    path:
                      moment(new Date()).format("YYYY-MM-DD HH:mm:ss") +
                      "-" +
                      lokasi.locationIdemp +
                      ".jpg",
                    nik: lokasi.nik,
                  };

                  axios
                    .post(constants.loginServer + "/insertreturnidemp", options)
                    .then((response) => {
                      // console.log(response.status);
                      Alert.alert("Data Retur Tersimpan", "", [
                        { text: "Okay" },
                      ]);
                      // AsyncStorage.removeItem("additional");
                      setTodos([]);
                      setImage(null);
                      AsyncStorage.removeItem("retur");
                      setIsloading(false);
                    });
                }
              })
              .catch(function (error) {
                console.log(error);
                setIsloading(false);
              });

            // setTodos([]);
            // AsyncStorage.removeItem("retur");
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={"light-content"} />
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
        <View style={styles.innercontainer}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: COLORS.gray,
            }}
          >
            Lokasi
          </Text>
          <Text style={styles.sectionLokasi}>
            {lokasi == null ? "Belum Melakukan Check in" : lokasi.customer}
          </Text>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "flex-start",
                flexDirection: "row",
              }}
            >
              <Image
                source={{ uri: image }}
                style={{
                  width: 150,
                  height: 100,
                  backgroundColor: COLORS.darkGray2,
                  borderRadius: 8,
                }}
              />
              <TextIconButton
                containerStyle={{
                  paddingLeft: 20,
                  height: 40,
                  width: 70,
                  alignItems: "center",
                  // borderRadius: SIZES.radius,
                  // backgroundColor: COLORS.primary,

                  // backgroundColor: COLORS.white,
                  // marginTop: 20,
                }}
                icon={icons.camera}
                iconPosition="CENTER"
                onPress={async () => {
                  // console.log("in pick camera");
                  setUseCamera(true);
                }}
              />
            </View>
            {image !== null && (
              <TouchableOpacity
                style={{ paddingTop: 80 }}
                onPress={() => {
                  setImage(null);
                }}
              >
                <Text style={{ fontStyle: "italic", color: "red" }}>Batal</Text>
              </TouchableOpacity>
            )}

            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <TextButton
                label="Simpan"
                buttonContainerStyle={{
                  height: 40,
                  width: 70,
                  borderRadius: SIZES.radius,
                }}
                onPress={() => {
                  simpanRetur();
                }}
              />
            </View>
          </View>

          <View
            style={[
              { marginTop: 10 },
              Platform.select({ ios: { zIndex: 100 } }),
            ]}
          >
            <Text style={(styles.sectionTitle, { color: COLORS.gray })}>
              Product Raja
            </Text>

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
                //   item && console.log("pilih", item);
                // item && setSelectedItem(item.id.split(" ")[0].trim());
                // item && setSelectedMeasure(item.id.split(" ")[1].trim());
                item && setSelectedItem(item.id);
                // item && setSelectedMeasure(item.id.split(" ")[1].trim());
                item && setTextInput(item.title);
                item && setIdempId(item.idempid);
                item && setSelectedMeasure(item.uomname);
                item && setUomId(item.uomid);
              }}
              debounce={600}
              suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
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
                  borderRadius: 20,
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
                borderRadius: 20,
              }}
              suggestionsListContainerStyle={{
                backgroundColor: "#383b42",
              }}
              containerStyle={{ flexGrow: 1, flexShrink: 1 }}
              renderItem={(item, text) => (
                <Text style={{ color: "#fff", padding: 15 }}>{item.title}</Text>
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
            <Text style={{ color: "#668", fontSize: 13 }}>
              produk id: {selectedItem}
            </Text>
            <Text style={{ color: COLORS.gray }}>Qty retur</Text>
            <View>
              <View
                style={{
                  height: 30,
                  marginTop: SIZES.height > 800 ? SIZES.base : 0,
                  flexDirection: "row",
                  borderRadius: 15,
                }}
              >
                <TextInput
                  style={{
                    width: 70,
                    backgroundColor: COLORS.lightGray2,
                    borderRadius: 10,
                  }}
                  value={stock}
                  selectTextOnFocus
                  keyboardType="numeric"
                  // placeholder="Qty"
                  textAlign="right"
                  // maxLength={6}
                  onChangeText={onChangeTextQty}
                />
                <Text
                  style={{
                    color: COLORS.gray,
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                    fontWeight: "bold",
                  }}
                >
                  {selectedMeasure !== null && selectedMeasure}
                </Text>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <TouchableOpacity onPress={addTodo}>
                    <View style={styles.iconContainer}>
                      <Icon name="add" color="white" size={30} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              <FormPicker
                label="Alasan Retur"
                placeholder="Pilih Jenis "
                modalTitle="Pilih Jenis Retur"
                value={alasanRetur.value}
                setValue={setAlasanRetur}
                options={constants.jenisretur}
                containerStyle={{
                  marginTop: SIZES.radius,
                }}
                inputContainerStyle={{
                  backgroundColor: COLORS.white,
                }}
              />
              {alasanRetur.id == 5 && (
                <TextInput
                  style={{
                    marginTop: 10,
                    backgroundColor: COLORS.lightGray2,
                    borderRadius: 10,
                    padding: 5,
                  }}
                  value={alasanReturLain}
                  selectTextOnFocus
                  placeholder="Isi alasan lain lain"
                  onChangeText={(text) => setAlasanReturLain(text)}
                />
              )}
            </View>
            {todos.length > 0 && (
              <View
                style={{
                  flex: 1,
                  height: SIZES.height > 800 ? 45 : 45,
                  paddingHorizontal: SIZES.radius,
                  marginTop: SIZES.height > 800 ? SIZES.base : 0,
                  borderRadius: SIZES.radius,
                  backgroundColor: COLORS.lightGray1,
                }}
              >
                <Text style={{ color: "#668", fontSize: 13 }}>
                  List Barang Retur
                </Text>
                <FlatList
                  keyExtractor={(item) => `${item.id}+${item.qty}`}
                  showsVerticalScrollIndicator={false}
                  ref={flatListRef}
                  data={todos}
                  contentContainerStyle={{
                    padding: 30,
                    paddingBottom: 100,
                  }}
                  renderItem={({ item }) => <ListItem todo={item} />}
                />
              </View>
            )}
          </View>
          {todos.length > 0 && (
            <View
              style={{
                flex: 1,
                height: SIZES.height > 800 ? 45 : 45,
                paddingHorizontal: SIZES.radius,
                marginTop: 20,
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.lightGray2,
              }}
            >
              <Text style={{ color: "#668", fontSize: 13 }}>
                List Barang Retur
              </Text>
              <FlatList
                keyExtractor={(item) => `${item.id}+${item.qty}`}
                showsVerticalScrollIndicator={false}
                ref={flatListRef}
                data={todos}
                contentContainerStyle={{
                  padding: 10,
                  paddingBottom: 50,
                }}
                renderItem={({ item }) => <ListItem todo={item} />}
              />
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
      )}
    </SafeAreaView>
  );
};

export default Retur;

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
  text: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
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
  container: {
    flex: 1,
  },
  innercontainer: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.lightGray1,
    marginTop: 12,
  },
  dropdowncontainer: {
    flex: 1,
    position: "relative",
    padding: 10,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray1,
  },
  inputcontainer: {
    padding: 10,
    marginTop: 5,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray1,
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  sectionLokasi: {
    fontWeight: "bold",
    marginBottom: 3,
    fontSize: 16,
  },
  iconContainer: {
    height: 50,
    width: 50,
    backgroundColor: COLORS.primary,
    elevation: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    padding: 10,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    elevation: 12,
    borderRadius: 7,
    marginVertical: 10,
  },
  actionIcon: {
    height: 25,
    width: 25,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
    marginLeft: 5,
    borderRadius: 3,
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
