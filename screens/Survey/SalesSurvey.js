import React, { memo, useCallback, useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import moment from "moment";
import axios from "axios";

import { useFocusEffect } from "@react-navigation/native";

import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

import { connect } from "react-redux";

// Async storage
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GetDataLocal, NumberFormat } from "../../utils";

import Icon from "@expo/vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
Feather.loadFont();

import { COLORS, SIZES, icons, constants, images } from "../../constants";

const SalesSurvey = (props) => {
  const [lokasi, setLokasi] = useState(null);
  const [suggestionsList, setSuggestionsList] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [additional, setAdditional] = useState(null);
  const [listProductAvailable, setListProductAvailable] = useState([]);
  const [selectedItemCat, setSelectedItemCat] = useState(null);
  const [categoriItem, setCategoriItem] = useState(null);
  const [idempid, setIdempId] = useState("");
  const [weight, setWeight] = useState(0);
  const [uomId, setUomId] = useState("");
  const [harga, setHarga] = useState("0");

  const dropdownController = useRef(null);

  const searchRef = useRef(null);
  const flatListRef = useRef();

  const [stock, setStock] = useState("0");

  const [todos, setTodos] = useState([]);

  useEffect(() => {
    if (props.selectedTab == "Sales Survey") {
      getLokasi();
      cleardata();
    }
  }, [props.selectedTab]);

  useFocusEffect(
    useCallback(() => {
      cleardata();
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
      const todo = await AsyncStorage.getItem("salesqty");
      if (todo != null) {
        setTodos(JSON.parse(todo));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveTodoToUserDevice = async (todos) => {
    try {
      // console.log(todos);
      const stringifyTodos = JSON.stringify(todos);
      await AsyncStorage.setItem("salesqty", stringifyTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const addTodo = () => {
    if (lokasi === null) {
      Alert.alert(
        "Error",
        "Anda belum checkin/berada di luar non customer BPR"
      );
      return;
    }

    let kembar = false;
    if (selectedItem == null || stock == null) {
      Alert.alert("Error", "Pilih produk dan input qty terlebih dahulu ");
    } else {
      const newTodo = {
        id: selectedItem,
        task: textInput,
        qty: stock,
        unit: selectedMeasure,
      };
      // console.log("newtodo", newTodo);
      todos.forEach((obj) => {
        if (obj.id === selectedItem) {
          kembar = true;
          const newStockItem =
            Number.parseFloat(obj.qty) + Number.parseFloat(stock);
          obj.qty = newStockItem;
          AsyncStorage.removeItem("salesqty");
          saveTodoToUserDevice(todos);

          return;
        }
      });

      if (!kembar) {
        setTodos([...todos, newTodo]);
      }
      InsertUpdateData();
    }
  };

  const getLokasi = () => {
    GetDataLocal("lokasi").then((res) => {
      if (res !== null) {
        setLokasi(res);
      }
      if (res !== null) {
        setLokasi(res);
        console.log("lokasi", res);
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
    //   console.log("res1", res1);
    //   if (res1 !== null) {
    //     // if (res1.length > 0) {
    //     console.log("masuk sini dah");
    //     setAdditional(res1);
    //     getListPrice(res1.pricelistid).then(function (listPrice) {
    //       console.log(
    //         "tes listprice",
    //         listPrice.data.WindowTabData.DataSet.DataRow
    //       );
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
          // price: item.price,
          idempid: item.key,
          // weight: item.weight,
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
    setSelectedMeasure(null);
    setTextInput("");
    setStock(null);
  }, []);

  const onOpenSuggestionsList = useCallback((isOpened) => {}, []);

  const InsertUpdateData = () => {
    var ketemu = false;
    try {
      GetDataLocal("salesqty").then((res) => {
        res.forEach((element) => {
          // console.log("tes Found", found);
          if (element.id === selectedItem) {
            ketemu = true;
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tanggal: lokasi.tanggal,
                lokasiid: lokasi == null ? "" : lokasi.locationid,
                prodid: selectedItem,
                nik: lokasi.nik,
                qty: element.qty,
                unit: selectedMeasure,
                lokasiname: lokasi.customer,
                prodname: textInput,
              }),
            };
            const url = constants.loginServer + "/insertupdatesalesqty";

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
              unit: selectedMeasure,
              lokasiname: lokasi.customer,
              prodname: textInput,
            }),
          };
          const url = constants.loginServer + "/insertupdatesalesqty";

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
              fontSize: 12,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            {todo?.task}
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Qty : {todo?.qty} {todo?.unit}
          </Text>
        </View>
        {/* {!todo?.completed && (
          <TouchableOpacity onPress={() => markTodoComplete(todo.id)}>
            <View style={[styles.actionIcon, { backgroundColor: "green" }]}>
              <Icon name="done" size={20} color="white" />
            </View>
          </TouchableOpacity>
        )} */}
        <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
          <View style={styles.actionIcon}>
            <Icon name="delete" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

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
          lokasiname: lokasi.customer,
        }),
      };
      const url = constants.loginServer + "/deletesalesqtydetail";
      // console.log("delete detail qty sales", url);
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

  const onChangeTextQty = (stock) => {
    if (stock === "" || stock === "-") {
      stock = "0";
    }
    setStock(NumberFormat(stock));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={"light-content"} />
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: COLORS.gray,
          }}
        >
          Lokasi
        </Text>
        <Text style={styles.sectionLokasi}>
          {lokasi == null ? "Belum Melakukan Check in" : lokasi.customer}
        </Text>
        <Text
          style={
            (styles.sectionTitle, { color: COLORS.gray, fontWeight: "bold" })
          }
        >
          Produk Raja
        </Text>
        <View
          style={[
            // { flex: 1, flexDirection: 'row'},
            Platform.select({ ios: { zIndex: 100 } }),
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
              item && console.log("pilih", item);
              item && setSelectedItem(item.id);
              item && setSelectedItemCat(item.category);
              item && setTextInput(item.title);
              item && setCategoriItem(item.category);
              item && setSelectedMeasure(item.uomname);
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
        </View>
        <Text style={{ color: "#668", fontSize: 13 }}>
          produk id: {selectedItem}
        </Text>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={{ color: COLORS.gray }}>Qty Sales</Text>
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
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              alignSelf: "flex-start",
              marginRight: 20,
            }}
          >
            <View
              style={{
                flex: 1,
                height: 30,
                marginTop: SIZES.height > 800 ? SIZES.base : 0,
                flexDirection: "row",
                alignSelf: "flex-end",
                borderRadius: 15,
              }}
            >
              <TouchableOpacity onPress={addTodo}>
                <View style={styles.iconContainer}>
                  <Icon name="add" color="white" size={30} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {todos.length > 0 && (
          <View
            style={{
              flex: 2,
              marginTop: 5,
              backgroundColor: COLORS.lightGray2,
              padding: 20,
              borderRadius: 20,
              marginBottom: 180,
            }}
          >
            <Text style={{ color: COLORS.gray, fontSize: 18 }}>Sales Qty</Text>
            <FlatList
              keyExtractor={(item) => `${item.id}+${item.qty}`}
              showsVerticalScrollIndicator={false}
              ref={flatListRef}
              data={todos}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 20,
              }}
              renderItem={({ item }) => <ListItem todo={item} />}
            />
          </View>
        )}
      </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(SalesSurvey);

const styles = StyleSheet.create({
  iconContainer: {
    height: 50,
    width: 50,
    backgroundColor: COLORS.primary,
    elevation: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.lightGray1,
    marginTop: 12,
  },
  title: {
    textAlign: "center",
    fontSize: 25,
    marginBottom: 50,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  sectionLokasi: {
    fontWeight: "bold",
    marginBottom: 3,
    fontSize: 20,
  },
  listItem: {
    padding: 10,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    elevation: 12,
    borderRadius: 7,
    marginVertical: 5,
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
});
