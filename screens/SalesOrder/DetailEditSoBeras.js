import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";

import axios from "axios";
import Icon from "@expo/vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
Feather.loadFont();

import { CustomSwitch, Header, IconButton, TextButton } from "../../components";

import { NumberFormat } from "../../utils";
import { COLORS, SIZES, icons, constants, images } from "../../constants";
import moment from "moment";

const DetailEditSoBeras = ({ navigation, route }) => {
  const flatListRef = useRef();

  const [isLoading, setIsloading] = useState(true);
  const [listProductAvailable, setListProductAvailable] = useState([]);

  const [todos, setTodos] = useState([]);
  const [detailData, setDetailData] = useState("");
  const [lokasiData, setLokasiData] = useState([]);
  const [ongkosAngkut, setOngkosAngkut] = useState(0);
  const [additional, setAdditional] = useState(null);
  const [additionalCost, setAdditionalCost] = useState([]);
  const [oaYesNo, setOaYesNo] = useState(false);
  const [noso, setNoso] = useState("");
  const [idempid, setIdempId] = useState("");
  const [textInput, setTextInput] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemCat, setSelectedItemCat] = useState(null);
  const [categoriItem, setCategoriItem] = useState(null);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [suggestionsList, setSuggestionsList] = useState(null);
  const [uomId, setUomId] = useState("");
  const [addCost, setAddCost] = useState(0);

  const [stock, setStock] = useState("0");
  const [harga, setHarga] = useState("0");
  const [weight, setWeight] = useState(0);
  const [total, setTotal] = useState(0);
  const [oatotal, setOaTotal] = useState(0);
  const [totalBerat, setTotalBerat] = useState(0);

  React.useEffect(() => {
    let { detailItem } = route.params;
    // console.log("detail beras", detailItem.orderItem);

    if (detailItem.orderItem.orderid !== "") {
      setNoso(detailItem.orderItem.orderid);
      setDetailData(detailItem.orderItem);
      getLokasi(detailItem.orderItem.partnerid);
      getDetailProduct(detailItem.orderItem.orderid);
      //   setIsloading(false);
    }
  }, []);

  const getDetailProduct = async (orderid) => {
    await axios
      .get(
        constants.CashColServer +
          `/api/v1/salesorder/salesheader/${orderid}/detailproduct`
      )
      .then(function (response) {
        // console.log("data detail", response.data);
        let datadetail = response.data;

        if (datadetail.length > 0) {
          if (datadetail[0].OngkosAngkut !== 0) {
            setOaYesNo(true);
          }

          let dataso = [];

          for (var i = 0; i < datadetail.length; i++) {
            dataso.push({
              noso: datadetail[i].C_Order_ID,
              id: datadetail[i].BPR_OldCode,
              task: datadetail[i].BPR_Task,
              qty: Number.parseFloat(datadetail[i].QtyEntered),
              harga: Number.parseFloat(datadetail[i].PriceEntered),
              weight: datadetail[i].weight,
              oa: datadetail[i].OngkosAngkut,
              idempid: datadetail[i].M_Product_ID,
              addcost: datadetail[i].SubsidiAmt,
              categori: datadetail[i].category,
              unit: datadetail[i].uomname,
              unitid: datadetail[i].C_UOM_ID,
            });
          }
          //   console.log("data SO", dataso);
          setTodos(dataso);
          saveTodoToUserDevice(dataso);
          setIsloading(false);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  function renderHeader() {
    return (
      <Header
        title="EDIT SO BERAS"
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
            onPress={() => navigation.navigate("EditSalesOrderBeras")}
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

  function cekPriceBreak(berat, range1, additionalCost) {
    if (berat >= range1) {
      let a = additionalCost.filter(
        (obj) =>
          obj.category == selectedItemCat &&
          berat >= obj.weightfrom &&
          berat <= obj.weightto
      );
      if (a.length <= 0) {
        setAddCost(0);
        return 0;
      } else {
        setAddCost(a[0].pricebreak);
        return a[0].pricebreak;
      }
    } else {
      setAddCost(0);
      return 0;
    }
  }

  function cekPriceBreakall(berat, data) {
    // console.log("berat", berat);
    let a = additionalCost.filter(
      (obj) =>
        obj.category == data.categori &&
        berat >= obj.weightfrom &&
        berat <= obj.weightto
    );

    if (a.length > 0) {
      return a[0].pricebreak;
    } else {
      return 0;
    }
  }

  const saveTodoToUserDevice = async (todos) => {
    let totalhitung = 0;
    let totalhitungberat = 0;
    todos.forEach((obj) => {
      //   console.log("object", obj);
      totalhitung =
        totalhitung +
        Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) +
        Number.parseFloat(obj.weight * obj.qty * obj.oa) +
        obj.qty * obj.weight * obj.addcost;

      setTotal(totalhitung);

      totalhitungberat =
        totalhitungberat + Number.parseFloat(obj.weight * obj.qty);

      setTotalBerat(totalhitungberat);
    });

    // console.log("todos sync", todos);
    // try {
    //   if (todos.length > 0) {
    //     const stringifyTodos = JSON.stringify(todos);
    //     await AsyncStorage.setItem("sales", stringifyTodos);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  };

  const getLokasi = async (result) => {
    // console.log("Cek user", result);
    // idempiere
    const response = await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getCustomers",
            DataRow: {
              field: [
                {
                  "@column": "C_BPartner_ID",
                  val: result,
                },
                // {
                //   "@column": "SalesRep_ID",
                //   val: result.salesrep,
                // },
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
    // console.log("data", response.data.WindowTabData.DataSet.DataRow);
    const dataLokasi = [];
    dataLokasi.push({
      key: response.data.WindowTabData.DataSet.DataRow.field[0].val,
      label: response.data.WindowTabData.DataSet.DataRow.field[1].val,
      value:
        response.data.WindowTabData.DataSet.DataRow.field[0].val +
        " " +
        response.data.WindowTabData.DataSet.DataRow.field[3].val,
      pricelistid: response.data.WindowTabData.DataSet.DataRow.field[4].val,
      oa: response.data.WindowTabData.DataSet.DataRow.field[6].val,
      cl: response.data.WindowTabData.DataSet.DataRow.field[9].val,
      custidemp: response.data.WindowTabData.DataSet.DataRow.field[5].val,
      clavailable: response.data.WindowTabData.DataSet.DataRow.field[11].val,
      bpid: response.data.WindowTabData.DataSet.DataRow.field[7].val,
      wmin1: response.data.WindowTabData.DataSet.DataRow.field[12].val,
      wmin2: response.data.WindowTabData.DataSet.DataRow.field[13].val,
    });
    // console.log("data lokasi", dataLokasi);
    setLokasiData(dataLokasi);

    if (dataLokasi.length > 0) {
      //   console.log("data", dataLokasi);
      axios
        .all([
          getOngkosAngkut(dataLokasi[0].oa),
          getListPrice(dataLokasi[0].pricelistid),
          getAdditionalCost(dataLokasi[0].pricelistid, dataLokasi[0].bpid),
        ])
        .then(
          axios.spread(function (ongkosAngkut, listPrice, additionalCost) {
            // console.log("listprice", listPrice);
            // console.log("pricelist", listPrice.data.WindowTabData);
            // console.log(
            //   "additional cost",
            //   additionalCost.data.WindowTabData.DataSet.DataRow[1].field[0]
            //     .val
            // );

            setOngkosAngkut(
              ongkosAngkut.data.WindowTabData.RowCount <= 0
                ? 0
                : ongkosAngkut.data.WindowTabData.DataSet.DataRow.field.val
            );

            // console.log(
            //   "Ongkos angkut",
            //   ongkosAngkut.data.WindowTabData.RowCount <= 0
            //     ? 0
            //     : ongkosAngkut.data.WindowTabData.DataSet.DataRow.field.val
            // );
            const product = [];
            if (listPrice.data.WindowTabData.RowCount === 1) {
              product.push({
                key: listPrice.data.WindowTabData.DataSet.DataRow.field[0].val,
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
              for (var i = 0; i < listPrice.data.WindowTabData.RowCount; i++) {
                product.push({
                  key: listPrice.data.WindowTabData.DataSet.DataRow[i].field[0]
                    .val,
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
              }
            }
            // console.log("product", product);
            setListProductAvailable(
              [...product].sort((a, b) => (a.id > b.id ? 1 : -1))
            );

            const additional = [];
            for (
              var i = 0;
              i < additionalCost.data.WindowTabData.RowCount;
              i++
            ) {
              additional.push({
                key: i,
                pricebreak:
                  additionalCost.data.WindowTabData.DataSet.DataRow[i].field[0]
                    .val,
                weightfrom:
                  additionalCost.data.WindowTabData.DataSet.DataRow[i].field[2]
                    .val,
                weightto:
                  additionalCost.data.WindowTabData.DataSet.DataRow[i].field[3]
                    .val,
                category:
                  additionalCost.data.WindowTabData.DataSet.DataRow[i].field[1]
                    .val,
              });
            }
            setAdditionalCost(additional);
            // console.log("additional cost", additional);
          })
        );
      // }
    }
  };

  async function getOngkosAngkut(data) {
    // console.log("additional", data);
    return await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getOngkosAngkut",
            DataRow: {
              field: [
                {
                  "@column": "C_City_ID",
                  val: data,
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

  async function getAdditionalCost(data2, bpid) {
    // console.log("data2",data2)
    // console.log("bpid",bpid)

    return await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getAdditionalCost",
            DataRow: {
              field: [
                {
                  "@column": "M_PriceList_ID",
                  val: data2,
                },
                {
                  "@column": "C_BP_Group_ID",
                  val: bpid,
                },
                {
                  "@column": "IsSOLine",
                  val: "N",
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

  const addTodo = () => {
    let kembar = false;
    if (selectedItem == null || stock <= 0 || harga <= 0) {
      Alert.alert(
        "Error",
        "Pilih produk,qty dan harga tidak boleh 0 atau di bawah 0 "
      );
    } else {
      let totalhitung1 = 0;
      todos.forEach((obj) => {
        if (obj.id === selectedItem) {
          kembar = true;

          let totalhitung =
            Number.parseFloat(total) -
            Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) -
            Number.parseFloat(obj.qty) *
              Number.parseFloat(obj.weight) *
              Number.parseFloat(obj.oa) +
            obj.qty * obj.weight * obj.addcost;

          const newStockItem =
            Number.parseFloat(obj.qty) +
            Number.parseFloat(stock.replace(/,/g, ""));

          totalhitung1 =
            totalhitung +
            Number.parseFloat(newStockItem) *
              Number.parseFloat(harga.replace(/,/g, "")) +
            Number.parseFloat(obj.qty) *
              Number.parseFloat(obj.weight) *
              Number.parseFloat(obj.oa) +
            obj.qty * obj.weight * obj.addcost;

          obj.qty = newStockItem;
          obj.harga = Number.parseFloat(harga.replace(/,/g, ""));

          //   AsyncStorage.removeItem("sales");

          saveTodoToUserDevice(todos);
          cleardata();
          return;
        }
      });

      if (!kembar) {
        let totalhitungberat =
          Number.parseFloat(totalBerat) +
          Number.parseFloat(stock.replace(/,/g, "")) *
            Number.parseFloat(weight);

        setTotalBerat(totalhitungberat);

        let pricebreak = cekPriceBreak(
          totalhitungberat,
          lokasiData.wmin1,
          additionalCost
        );

        let totalhitung =
          Number.parseFloat(total) +
          Number.parseFloat(stock.replace(/,/g, "")) *
            Number.parseFloat(harga.replace(/,/g, "")) +
          Number.parseFloat(stock.replace(/,/g, "")) * weight * pricebreak;

        setTotal(totalhitung);
        const newTodo = {
          noso: noso,
          id: selectedItem,
          task: textInput,
          qty: Number.parseFloat(stock.replace(/,/g, "")),
          harga: Number.parseFloat(harga.replace(/,/g, "")),
          weight: weight,
          oa: oaYesNo === true ? ongkosAngkut : 0,
          idempid: idempid,
          addcost: pricebreak,
          categori: categoriItem,
          unit: selectedMeasure,
          unitid: uomId,
        };

        setTodos([...todos, newTodo]);
        cleardata();
      }
    }
  };

  const ListItem = ({ todo }) => {
    return (
      <View style={styles.listItem}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
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
          </View>
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
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            harga : Rp.
            {todo?.addcost > 0
              ? NumberFormat(
                  (todo?.harga + todo?.weight * todo?.addcost).toString()
                )
              : NumberFormat((todo?.harga).toString())}
          </Text>
          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Qty : {NumberFormat(todo?.qty.toString())} {todo?.unit}
          </Text>
          {(oaYesNo === true || todo?.addcost < 0) && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 2,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 14,
                    color: "#1f145c",
                    textDecorationLine: todo?.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  Subtotal :Rp.{" "}
                </Text>
              </View>
              <View
                style={{
                  flex: 2,
                  alignItems: "flex-end",
                  alignContent: "flex-end",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#1f145c",
                    textDecorationLine: todo?.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {NumberFormat((todo?.qty * todo?.harga).toString())}
                </Text>
              </View>
            </View>
          )}
          {oaYesNo === true && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 2 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 14,
                    color: "#1f145c",
                    textDecorationLine: todo?.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  OA {"          "}:Rp.
                </Text>
              </View>
              <View
                style={{
                  flex: 2,
                  alignItems: "flex-end",
                  alignContent: "flex-end",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#1f145c",
                    textDecorationLine: todo?.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {NumberFormat(
                    (todo?.qty * todo?.weight * todo?.oa).toString()
                  )}
                </Text>
              </View>
            </View>
          )}
          {todo?.addcost < 0 && (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 2, alignContent: "flex-start" }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 14,
                    color: "#1f145c",
                    textDecorationLine: todo?.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  Discount :Rp.
                </Text>
              </View>
              <View
                style={{
                  flex: 2,
                  alignItems: "flex-end",
                  alignContent: "flex-end",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#1f145c",
                    textDecorationLine: todo?.completed
                      ? "line-through"
                      : "none",
                  }}
                >
                  {NumberFormat(
                    (todo?.addcost * todo?.weight * todo?.qty).toString()
                  )}
                </Text>
              </View>
            </View>
          )}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 2, alignContent: "flex-start" }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 14,
                  color: "#1f145c",
                  textDecorationLine: todo?.completed ? "line-through" : "none",
                }}
              >
                Total {"       "}:Rp.
              </Text>
            </View>
            <View
              style={{
                flex: 2,
                alignItems: "flex-end",
                alignContent: "flex-end",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "#1f145c",
                  textDecorationLine: todo?.completed ? "line-through" : "none",
                }}
              >
                {NumberFormat(
                  (
                    (todo?.harga +
                      todo?.oa * todo?.weight +
                      todo?.addcost * todo?.weight) *
                    todo?.qty
                  ).toString()
                )}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={{
            height: 25,
            width: 25,
          }}
          onPress={async () =>
            deleteTodo(todo.id, todo.qty, todo.harga, todo.weight, todo.addcost)
          }
        >
          <View style={styles.actionIcon}>
            <Icon name="delete" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const cleardata = () => {
    setSelectedItem(null);
    setSelectedItemCat(null);
    setSuggestionsList(null);
    setSelectedMeasure(null);
    setUomId(null);
    setStock("0");
    setHarga("0");
    setTextInput("");
  };

  const deleteTodo = async (
    todoId,
    todoQty,
    todoHarga,
    todoWeight,
    addcost
  ) => {
    if (todos.length === 1) {
      setTodos(todos.length === 0);
    }
    const newTodosItem = todos.filter((item) => item.id != todoId.toString());
    setTodos(newTodosItem);

    // await AsyncStorage.removeItem("sales");

    saveTodoToUserDevice(newTodosItem);

    // hitungulangtodos();
  };

  const onChangeTextQty = (stock) => {
    if (stock === "" || stock === "-") {
      stock = "0";
    }
    setStock(NumberFormat(stock));
  };

  const onChangeTextharga = (harga) => {
    if (harga === "" || harga === "-") {
      harga = "0";
    }
    setHarga(NumberFormat(harga));
  };

  async function batalSo(order) {
    // console.log("data", order);

    Alert.alert(
      "Reject Sales Order?",
      "Cancel Sales Order " +
        order.orderid +
        " tanggal " +
        order.orderdate +
        "?",
      [
        {
          text: "Yes",
          onPress: async () => {
            setIsloading(true);
            axios
              .get(
                constants.CashColServer +
                  `/api/v1/salesorder/salesheader/${order.orderid}/cancelso`
              )
              .then(function (response) {
                // console.log("batal so", response.data);
                Alert.alert("Data SO Dibatalkan", response.data.msg, [
                  { text: "Okay" },
                ]);
                setIsloading(false);
                setTodos([]);
                navigation.navigate("EditSalesOrderBeras");
              })
              .catch((error) => {
                setIsloading(false);
                console.log("error update", error);
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
  }

  async function simpanSo() {
    if (todos.length === 0) {
      Alert.alert("Input produk terlebih dahulu", "", [{ text: "Okay" }]);
      return;
    }
    // console.log("list order", todos);
    Alert.alert(
      "Ubah data Sales Order?",
      "Apakah anda yakin ingin menyimpan SO?",
      [
        {
          text: "Yes",
          onPress: async () => {
            setIsloading(true);

            const dataSoDetail = [];

            todos.forEach((element) => {
              dataSoDetail.push({
                C_Order_ID: noso,
                M_Product_ID: element.idempid,
                QtyEntered: element.qty,
                QtyOrdered: element.qty * element.weight,
                PriceEntered:
                  element.harga +
                  element.oa * element.weight +
                  element.addcost * element.weight,
                PriceActual:
                  element.harga / element.weight + element.oa + element.addcost,
                PriceList: element.harga / element.weight,
                OngkosAngkut: element.oa,
                SubsidiAmt: element.addcost,
                LineNetAmt:
                  (element.harga +
                    element.oa * element.weight +
                    element.addcost * element.weight) *
                  element.qty,
                BPR_Task: element.task,
                BPR_OldCode: element.id,
                C_UOM_ID: element.unitid,
                weight: element.weight,
                unit: element.unit,
                category: element.categori,
              });
            });
            // console.log("detail so", dataSoDetail);
            const options = {
              detail: dataSoDetail,
            };
            // console.log("datanya", options);
            // console.log("http://localhost:3001/api/v1/submitupdatedetail");
            axios
              .post(
                constants.CashColServer +
                  "/api/v1/salesorder/submitupdatedetail",
                options
              )
              .then((response) => {
                // console.log("status", response);
                Alert.alert("Data SO Terupdate", response.data.msg, [
                  { text: "Okay" },
                ]);
                setIsloading(false);
                setTodos([]);
                navigation.navigate("EditSalesOrderBeras");
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
  }

  return (
    <SafeAreaView style={styles.outcontainer}>
      <StatusBar barStyle={"dark-content"} />
      <View style={styles.outcontainer}>
        {renderHeader()}
        <View style={styles.container}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: COLORS.darkGray,
            }}
          >
            Lokasi : {detailData.name}
          </Text>

          <Text
            style={
              (styles.sectionTitle,
              { color: COLORS.red2, fontWeight: "bold", fontSize: 16 })
            }
          >
            {lokasiData.length > 0
              ? "Credit Limit Rp." +
                NumberFormat(lokasiData[0].clavailable.toString())
              : "Tidak ada data limit SO"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 5,
            }}
          >
            <View>
              {ongkosAngkut !== 0 ? (
                <CustomSwitch
                  label="Ongkos Angkut"
                  additional={oaYesNo ? ongkosAngkut.toString() : "0"}
                  value={oaYesNo}
                  onChange={(value) => {
                    setOaYesNo(value);
                    //   hitungulang(value);
                  }}
                />
              ) : (
                <></>
              )}
            </View>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <TextButton
                label="Simpan SO"
                buttonContainerStyle={{
                  height: 40,
                  width: 90,
                  borderRadius: SIZES.radius,
                  marginLeft: 160,
                }}
                onPress={() => {
                  simpanSo();
                }}
              />
              <TextButton
                label="Batal SO"
                buttonContainerStyle={{
                  height: 40,
                  width: 80,
                  borderRadius: SIZES.radius,
                  marginLeft: SIZES.radius,
                }}
                onPress={() => {
                  batalSo(detailData);
                }}
              />
            </View>
          </View>
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
              clearOnFocus={true}
              closeOnBlur={false}
              onSelectItem={(item) => {
                item && setSelectedItem(item.id);
                item && setSelectedItemCat(item.category);
                item && setTextInput(item.title);
                item && setHarga(NumberFormat(item.price.toString()));
                item && setWeight(item.weight);
                item && setIdempId(item.idempid);
                item && setCategoriItem(item.category);
                item && setSelectedMeasure(item.uomname);
                item && setUomId(item.uomid);
              }}
              dataSet={listProductAvailable}
              onClear={cleardata}
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
              <Text style={{ color: COLORS.gray }}>Qty Order</Text>
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
                    {/* {selectedMeasure !== null && selectedMeasure} */}
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
              <Text style={{ color: COLORS.gray }}>
                Harga
                {selectedMeasure !== null && " /" + selectedMeasure}
              </Text>
              <View
                style={{
                  height: 30,
                  marginTop: SIZES.height > 800 ? SIZES.base : 0,
                  flexDirection: "row",
                  borderRadius: 15,
                }}
              >
                <TextInput
                  editable={false}
                  style={{
                    width: 100,
                    backgroundColor: COLORS.lightGray2,
                    borderRadius: 10,
                  }}
                  selectTextOnFocus
                  value={harga}
                  keyboardType="numeric"
                  // placeholder="Harga"
                  textAlign="right"
                  onChangeText={onChangeTextharga}
                />
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
                padding: 10,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: COLORS.gray, fontSize: 14, left: 10 }}>
                {/* {console.log("total tampilan :", total)} */}
                Sales Order Total : Rp.{NumberFormat(total.toString())}
              </Text>
              <Text style={{ color: COLORS.gray, fontSize: 14, left: 10 }}>
                {/* {console.log("total tampilan :", total)} */}
                Total Berat : {NumberFormat(totalBerat.toString())} KG
              </Text>
              <FlatList
                keyExtractor={(item) => `${item.id}+${item.qty}`}
                showsVerticalScrollIndicator={false}
                ref={flatListRef}
                data={todos}
                contentContainerStyle={{
                  padding: 15,
                  paddingBottom: 50,
                }}
                renderItem={({ item }) => <ListItem todo={item} />}
              />
            </View>
          )}
        </View>
      </View>
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

export default DetailEditSoBeras;

const styles = StyleSheet.create({
  outcontainer: {
    flex: 1,
  },
  iconContainer: {
    marginLeft: 5,
    marginTop: -10,
    height: 40,
    width: 60,
    backgroundColor: COLORS.primary,
    elevation: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.lightGray2,
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
    fontSize: 18,
  },
  listItem: {
    padding: 8,
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
