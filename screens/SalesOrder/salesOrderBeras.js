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
// Async storage
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GetDataLocal } from "../../utils";

import Icon from "@expo/vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
Feather.loadFont();

import { CustomSwitch, Header, IconButton, TextButton } from "../../components";

import { NumberFormat } from "../../utils";
import { COLORS, SIZES, icons, constants, images } from "../../constants";
import moment from "moment";

const SalesOrderBeras = ({ navigation }) => {
  const [isLoading, setIsloading] = useState(false);
  const [listProductAvailable, setListProductAvailable] = useState([]);
  const [lokasi, setLokasi] = useState(null);
  const [addCost, setAddCost] = useState(0);
  const [uomId, setUomId] = useState("");
  const [additional, setAdditional] = useState(null);
  const [additionalCost, setAdditionalCost] = useState([]);
  const [suggestionsList, setSuggestionsList] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemCat, setSelectedItemCat] = useState(null);
  const [categoriItem, setCategoriItem] = useState(null);
  const [selectedMeasure, setSelectedMeasure] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [idempid, setIdempId] = useState("");
  const [noso, setNoso] = useState("");
  const [ongkosAngkut, setOngkosAngkut] = useState(0);
  const [loading, setLoading] = useState(false);
  const [oaYesNo, setOaYesNo] = useState(false);
  const [totalBerat, setTotalBerat] = useState(0);
  // const dropdownController = useRef(null);

  // const searchRef = useRef(null);
  const flatListRef = useRef();

  const [stock, setStock] = useState("0");
  const [harga, setHarga] = useState("0");
  const [weight, setWeight] = useState(0);
  const [total, setTotal] = useState(0);
  const [oatotal, setOaTotal] = useState(0);

  const [todos, setTodos] = useState([]);

  useEffect(() => {
    // let v = moment().add(2, "days").format("YYYY-MM-DD HH:mm:ss");

    // console.log("tgl", v);
    getTodosFromUserDevice();
  }, []);

  useEffect(() => {
    // saveTodoToUserDevice(todos);
    if (additional !== null) {
      hitungulangtodos();
      // console.log("todos", todos);
    }
  }, [todos]);

  useEffect(() => {
    // console.log("additional", additional);
    // console.log("product list", listProductAvailable);
    if ((additional === null) | (listProductAvailable.count === 0)) {
      getLokasi();
    }
  }, [additional, listProductAvailable]);

  useEffect(() => {
    // if (lokasi !== null && additional !== null) {
    // console.log("lokasi", lokasi);
    if (lokasi !== null) {
      cekCreditLimit(lokasi.locationIdemp);
    }
  }, []);

  const hitungulangtodos = async () => {
    const hitung = todos.length;
    let totalhitung = 0;
    let totalhitungberat = 0;

    if (hitung > 0) {
      todos.forEach((obj) => {
        // console.log("testing cek additional ", obj);
        // totalhitung =
        //   totalhitung +
        //   Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) +
        //   Number.parseFloat(obj.weight * obj.qty * obj.oa) +
        //   obj.qty * obj.weight * obj.addcost;

        // setTotal(totalhitung);

        totalhitungberat =
          totalhitungberat + Number.parseFloat(obj.weight * obj.qty);

        // AsyncStorage.removeItem("sales");

        // saveTodoToUserDevice(todos);
        return;
      });
      setTotalBerat(totalhitungberat);
      // console.log("range masuk ?", totalhitungberat > additional.addstart1);
      if (totalhitungberat > additional.addstart1) {
        todos.forEach((obj) => {
          let pricebreak = cekPriceBreakall(totalhitungberat, obj);

          // console.log("pricebreak", pricebreak);
          obj.addcost = Number.parseFloat(pricebreak);

          totalhitung =
            totalhitung +
            Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) +
            Number.parseFloat(obj.weight * obj.qty * obj.oa) +
            obj.qty * obj.weight * obj.addcost;

          setTotal(totalhitung);
        });
      } else {
        todos.forEach((obj) => {
          obj.addcost = 0;
          // console.log("netralin", obj);

          totalhitung =
            totalhitung +
            Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) +
            Number.parseFloat(obj.weight * obj.qty * obj.oa) +
            obj.qty * obj.weight * obj.addcost;

          setTotal(totalhitung);
        });
      }
      // totalhitung =
      //   totalhitung +
      //   Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) +
      //   Number.parseFloat(obj.weight * obj.qty * obj.oa) +
      //   obj.qty * obj.weight * obj.addcost;

      // setTotal(totalhitung);

      await AsyncStorage.removeItem("sales");

      saveTodoToUserDevice(todos);
    }
  };

  function cekPriceBreakall(berat, data) {
    // console.log("berat", berat);
    let a = additionalCost.filter(
      (obj) =>
        obj.category == data.categori &&
        berat >= obj.weightfrom &&
        berat <= obj.weightto
    );
    // .map((item) => ({
    //   id: item.id,
    //   title: item.title,
    //   price: item.price,
    //   idempid: item.idempid,
    //   weight: item.weight,
    //   category: item.category,
    // }));
    // setAddCost(a[0].pricebreak);
    // console.log("pricebreak", a);

    if (a.length > 0) {
      return a[0].pricebreak;
    } else {
      return 0;
    }
    // if (a.length <= 0) {
    //   setAddCost(0);
    //   return 0;
    // } else {
    //   setAddCost(a[0].pricebreak);
    //   return a[0].pricebreak;
    // }
    // console.log("a", a.pricebreak);
    // return a[0].pricebreak;
    // setAddCost(a.pricebreak);
  }

  const getTodosFromUserDevice = async () => {
    try {
      const todo = await AsyncStorage.getItem("sales");
      // console.log("todo", todo);
      if (todo != null) {
        let datahitung = JSON.parse(todo);
        let hitungtotal = 0;
        let hitungtotaloa = 0;
        let hitungtotaladdcost = 0;
        let hitungtotalberat = 0;

        const count = datahitung.length;
        if (count > 0) {
          setOaYesNo(
            datahitung[0].oa > 0 || datahitung[0].oa !== undefined
              ? true
              : false
          );
        }
        if (oaYesNo === true) {
          for (var i = 0; i < count; i++) {
            const hitung = datahitung[i].qty * datahitung[i].harga;
            hitungtotal = hitungtotal + hitung;

            const hitungberat = datahitung[i].qty * datahitung[i].weight;
            hitungtotalberat = hitungtotalberat + hitungberat;

            const hitungaddcost = hitungberat * datahitung[i].addcost;
            hitungtotaladdcost = hitungtotaladdcost + hitungaddcost;

            const hitungoa =
              datahitung[i].qty * datahitung[i].weight * datahitung[i].oa;
            // console.log("oa itung", hitungoa);
            hitungtotaloa = hitungtotaloa + hitungoa;
          }
        } else {
          for (var i = 0; i < count; i++) {
            const hitung = datahitung[i].qty * datahitung[i].harga;
            hitungtotal = hitungtotal + hitung;
            hitungtotaloa = 0;
            // console.log("test berat", datahitung[i].qty * datahitung[i].weight);
            const hitungberat = datahitung[i].qty * datahitung[i].weight;
            hitungtotalberat = hitungtotalberat + hitungberat;

            const hitungaddcost = hitungberat * datahitung[i].addcost;
            hitungtotaladdcost = hitungtotaladdcost + hitungaddcost;
          }
        }
        setTodos(JSON.parse(todo));
        setTotal(hitungtotal + hitungtotaloa + hitungtotaladdcost);
        setOaTotal(hitungtotaloa);
        setTotalBerat(hitungtotalberat);

        // cekAdditionalCost(hitungtotalberat);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const saveTodoToUserDevice = async (todos) => {
    let totalhitung = 0;
    let totalhitungberat = 0;
    todos.forEach((obj) => {
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
    try {
      if (todos.length > 0) {
        const stringifyTodos = JSON.stringify(todos);
        await AsyncStorage.setItem("sales", stringifyTodos);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const hitungulang = (val) => {
    // console.log("hitung todos", todos.length);
    const hitung = todos.length;
    let totalhitung = 0;
    let totalhitungberat = 0;

    if (hitung > 0) {
      todos.forEach((obj) => {
        // console.log("obj", obj);
        if (val === true) {
          obj.oa = ongkosAngkut;

          // console.log("object ", obj);
          // totalhitung =
          //   totalhitung +
          //   Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) +
          //   Number.parseFloat(obj.weight * obj.qty * obj.oa) +
          //   obj.qty * obj.weight * obj.addcost;

          // setTotal(totalhitung);

          // totalhitungberat =
          //   totalhitungberat + Number.parseFloat(obj.weight * obj.qty);

          // setTotalBerat(totalhitungberat);

          // cekAdditionalCost(totalhitungberat);

          AsyncStorage.removeItem("sales");

          saveTodoToUserDevice(todos);
          return;
        } else {
          obj.oa = 0;

          // totalhitung =
          //   totalhitung +
          //   Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) +
          //   Number.parseFloat(obj.weight * obj.qty * obj.oa) +
          //   obj.qty * obj.weight * obj.addcost;

          // setTotal(totalhitung);

          // totalhitungberat =
          //   totalhitungberat + Number.parseFloat(obj.weight * obj.qty);

          // setTotalBerat(totalhitungberat);

          // cekAdditionalCost(totalhitungberat);
          AsyncStorage.removeItem("sales");

          saveTodoToUserDevice(todos);
          return;
        }
      });
    }
  };

  const addTodo = () => {
    // console.log("master barang", listProductAvailable);
    if (lokasi.locationid === null) {
      Alert.alert(
        "Error",
        "Belum Melakukan Check in/berada di lokasi non customer"
      );
      return;
    }

    let kembar = false;
    // console.log("item dipilih", selectedItem);
    if (selectedItem == null || stock <= 0 || harga <= 0) {
      Alert.alert(
        "Error",
        "Pilih produk,qty dan harga tidak boleh 0 atau di bawah 0 "
      );
    } else {
      // let totalhitungberat1 = 0;
      let totalhitung1 = 0;
      // console.log("OA yes no", oaYesNo);
      // console.log("total pertama ", total);
      // console.log("newtodo", newTodo);
      todos.forEach((obj) => {
        // console.log("obj", obj);
        if (obj.id === selectedItem) {
          kembar = true;

          let totalhitung =
            Number.parseFloat(total) -
            Number.parseFloat(obj.qty) * Number.parseFloat(obj.harga) -
            Number.parseFloat(obj.qty) *
              Number.parseFloat(obj.weight) *
              Number.parseFloat(obj.oa) +
            obj.qty * obj.weight * obj.addcost;

          // console.log("total hitung", totalhitung);

          // let totalberat =
          //   Number.parseFloat(totalBerat) -
          //   Number.parseFloat(obj.qty) * Number.parseFloat(obj.weight);

          // console.log(
          //   "tes tambah qty",
          //   Number.parseFloat(stock.replace(/,/g, ""))
          // );

          const newStockItem =
            Number.parseFloat(obj.qty) +
            Number.parseFloat(stock.replace(/,/g, ""));

          // console.log("tes barang sama", newStockItem);

          // console.log("total", totalhitung1);
          // console.log("CL", additional.clavailable);
          totalhitung1 =
            totalhitung +
            Number.parseFloat(newStockItem) *
              Number.parseFloat(harga.replace(/,/g, "")) +
            Number.parseFloat(obj.qty) *
              Number.parseFloat(obj.weight) *
              Number.parseFloat(obj.oa) +
            obj.qty * obj.weight * obj.addcost;

          // if (totalhitung1 > additional.clavailable) {
          //   Alert.alert("Warning", "Transaksi melebihi Credit Limit");
          //   return;
          // } else {
          obj.qty = newStockItem;
          obj.harga = Number.parseFloat(harga.replace(/,/g, ""));

          // totalhitungberat1 =
          //   totalberat +
          //   Number.parseFloat(newStockItem) * Number.parseFloat(obj.weight);

          // setTotalBerat(totalhitungberat1);
          // setTotal(totalhitung1);
          // setTotalBerat(totalhitungberat1);
          // cekAdditionalCost(totalhitungberat1);
          AsyncStorage.removeItem("sales");

          saveTodoToUserDevice(todos);
          cleardata();
          return;
          // }
        }

        // setTotal(totalhitung1);
      });

      if (!kembar) {
        // console.log("total curr", Number.parseFloat(total));
        // console.log("qty", Number.parseFloat(stock.replace(/,/g, "")));
        // console.log("harga", Number.parseFloat(harga.replace(/,/g, "")));
        // console.log("berat", Number.parseFloat(weight));

        // console.log("CL", additional.clavailable);

        let totalhitungberat =
          Number.parseFloat(totalBerat) +
          Number.parseFloat(stock.replace(/,/g, "")) *
            Number.parseFloat(weight);

        // let totalhitungberat1 =
        //   totalBerat +
        //   Number.parseFloat(stock.replace(/,/g, "")) *
        //     Number.parseFloat(weight);
        // console.log("berat product", totalhitungberat);

        setTotalBerat(totalhitungberat);

        let pricebreak = cekPriceBreak(
          totalhitungberat,
          additional.addstart1,
          additionalCost
        );

        // console.log("pricebreak", pricebreak);
        // console.log("total", total);
        // console.log("qty", stock);
        // console.log("harga", harga);
        // console.log("weight", weight);

        // console.log("cek", cek);
        let totalhitung =
          Number.parseFloat(total) +
          Number.parseFloat(stock.replace(/,/g, "")) *
            Number.parseFloat(harga.replace(/,/g, "")) +
          Number.parseFloat(stock.replace(/,/g, "")) * weight * pricebreak;

        // console.log("total", totalhitung);

        // if (totalhitung > additional.clavailable) {
        //   Alert.alert("Warning", "Transaksi melebihi Credit Limit");
        //   return;
        // } else {
        setTotal(totalhitung);

        // cekAdditionalCost(totalhitungberat);

        // setTotalBerat(totalhitungberat);
        // console.log("total setelah", totalhitung);
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

        console.log("new add", newTodo);

        setTodos([...todos, newTodo]);
        // }

        // console.log("hasil", todos);
        // InsertData(totalhitung);
        cleardata();
      }
    }
  };

  function cekPriceBreak(berat, range1, additionalCost) {
    // console.log("masuk pricebreak");
    if (berat >= range1) {
      // console.log("masuk sini ", additionalCost);
      // console.log("cek category ", selectedItemCat);

      let a = additionalCost.filter(
        (obj) =>
          obj.category == selectedItemCat &&
          berat >= obj.weightfrom &&
          berat <= obj.weightto
      );
      // .map((item) => ({
      //   id: item.id,
      //   title: item.title,
      //   price: item.price,
      //   idempid: item.idempid,
      //   weight: item.weight,
      //   category: item.category,
      // }));
      // setAddCost(a[0].pricebreak);
      // console.log("a", a);
      if (a.length <= 0) {
        setAddCost(0);
        return 0;
      } else {
        setAddCost(a[0].pricebreak);
        return a[0].pricebreak;
      }
      // console.log("a", a.pricebreak);
      // return a[0].pricebreak;
      // setAddCost(a.pricebreak);
    } else {
      // console.log("Berat saat ini", berat);
      setAddCost(0);
      return 0;
    }
  }

  function renderHeader() {
    return (
      <Header
        title="INPUT SO BERAS"
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
    // axios(config2).then(function async(response) {
    //   console.log("total AR customer", response.data.WindowTabData.RowCount);
    //   if (response.data.WindowTabData.RowCount > 0) {
    //     Alert.alert(
    //       "Informasi",
    //       "Ada Invoice jatuh tempo, tidak bisa melakukan SO"
    //     );
    //     navigation.navigate("MainLayout");
    //   }
    // });
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

  const getLokasi = async () => {
    var lokasitemp = "";
    await GetDataLocal("lokasi").then((res) => {
      if (res !== null) {
        lokasitemp = res;
        console.log("lokasi awal", lokasitemp);
        setLokasi(res);
      }
    });
    if (lokasitemp !== "") {
      cekArCustomer(lokasitemp.locationIdemp);
      await GetDataLocal("sales").then(async (res2) => {
        // console.log("cek cache sales", res2);
        if (res2 !== null) {
          setNoso(res2[0].noso);
          console.log("load dari storage", res2[0].noso);
        } else {
          let soNumber =
            moment(new Date()).format("YYYYMMDDHHmmss").toString() +
            lokasitemp.salesrep.toString() +
            lokasitemp.locationIdemp.toString();
          console.log("nomor baru", soNumber);
          setNoso(soNumber);
        }
      });

      await GetDataLocal("additional").then(async (res1) => {
        if (res1 !== null) {
          setAdditional(res1);
          axios
            .all([
              getOngkosAngkut(res1.oa),
              getListPrice(res1.pricelistid),
              getAdditionalCost(res1.pricelistid, res1.bpid),
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
                //   ongkosAngkut.data.WindowTabData.DataSet.DataRow.field.val
                // );
                const product = [];
                if (listPrice.data.WindowTabData.RowCount === 1) {
                  product.push({
                    key: listPrice.data.WindowTabData.DataSet.DataRow.field[0]
                      .val,
                    id: listPrice.data.WindowTabData.DataSet.DataRow.field[0]
                      .val,
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
                      listPrice.data.WindowTabData.DataSet.DataRow.field[10]
                        .val,
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
                      id: listPrice.data.WindowTabData.DataSet.DataRow[i]
                        .field[0].val,
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
                        listPrice.data.WindowTabData.DataSet.DataRow[i]
                          .field[10].val,
                    });
                  }
                }

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
                      additionalCost.data.WindowTabData.DataSet.DataRow[i]
                        .field[0].val,
                    weightfrom:
                      additionalCost.data.WindowTabData.DataSet.DataRow[i]
                        .field[2].val,
                    weightto:
                      additionalCost.data.WindowTabData.DataSet.DataRow[i]
                        .field[3].val,
                    category:
                      additionalCost.data.WindowTabData.DataSet.DataRow[i]
                        .field[1].val,
                  });
                }
                setAdditionalCost(additional);
                // console.log("additional cost", additional);
              })
            );
          // }
        }
      });
    }
  };

  const getSuggestions = useCallback(
    async (q) => {
      const filterToken = q.toLowerCase();
      console.log("getSuggestions", q);
      if (typeof q !== "string" || q.length < 3) {
        setSuggestionsList(null);

        return;
      }
      setLoading(true);
      // const response = await fetch(constants.loginServer + "/getproductfg");
      console.log("product tersedia", listProductAvailable);
      const items = listProductAvailable;
      // console.log("item cari", listProductAvailable);
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
      // console.log("sugestion", suggestions);
      setSuggestionsList(suggestions);
      setLoading(false);
    },
    [listProductAvailable]
  );

  const onClearPress = useCallback(() => {
    setSuggestionsList(null);
    setSelectedItem(null);
    setSelectedItemCat(null);
    setSelectedMeasure(null);
    setTextInput("");
    setStock("0");
    setHarga("0");
  }, []);

  const onOpenSuggestionsList = useCallback((isOpened) => {}, []);

  async function cekCreditLimit(bpid) {
    // console.log("bpid", bpid);
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
      // console.log(
      //   "cek CL",
      //   response.data.WindowTabData.DataSet.DataRow.field.val
      // );
      setAdditional({
        ...additional,
        cl: response.data.WindowTabData.DataSet.DataRow.field.val,
      });
      persistAdditional(
        additional,
        response.data.WindowTabData.DataSet.DataRow.field.val
      );
    });
  }

  const persistAdditional = async (additional, newAdditional) => {
    // console.log("tes masuk 1 ", additional);

    // console.log("tes masuk 2 ", newAdditional);

    let newValue = additional;
    newValue.clavailable = newAdditional;

    await AsyncStorage.setItem("additional", JSON.stringify(newValue))
      .then(() => {
        // console.log("additionalnewvalue :", newValue);
        setAdditional(null);
        setIsloading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsloading(false);
      });
  };

  async function simpanSo() {
    if (todos.length === 0) {
      Alert.alert("Input produk terlebih dahulu", "", [{ text: "Okay" }]);
      return;
    }
    Alert.alert(
      "Simpan Sales Order?",
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

            const dataSoHeader = [];
            dataSoHeader.push({
              C_Order_ID: noso,
              AD_Org_ID: lokasi.org,
              C_DocTypeTarget_ID: "1000048",
              DateOrdered: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
              DatePromised: moment()
                .add(2, "days")
                .format("YYYY-MM-DD HH:mm:ss"),
              C_BPartner_ID: lokasi.locationIdemp,
              M_Warehouse_ID: lokasi.whid,
              M_PriceList_ID: additional.pricelistid,
              SalesRep_ID2: lokasi.salesrep,
              DeliveryViaRule:
                oaYesNo === true && ongkosAngkut !== 0 ? "D" : "P",
              C_BPartner_Name: lokasi.customer,
            });
            // console.log("header so", dataSoHeader);
            // console.log("detail so", dataSoDetail);
            const options = {
              header: dataSoHeader,
              detail: dataSoDetail,
            };
            console.log("datanya", options);
            // console.log("http://localhost:3001/api/v1/salesorder-submit");
            axios
              .post(
                constants.CashColServer + "/api/v1/salesorder/submit",
                options
              )
              .then((response) => {
                console.log("status", response);
                Alert.alert("Data SO Tersimpan", "", [{ text: "Okay" }]);
                setIsloading(false);
                AsyncStorage.removeItem("sales");
                setTodos([]);
              });

            //remark SO ke lokal
            // todos.forEach((element) => {
            //   dataSoDetail.push({
            //     "@preCommit": "false",
            //     "@postCommit": "false",
            //     TargetPort: "createData",
            //     ModelCRUD: {
            //       serviceType: "addSalesOrderLine",
            //       TableName: "C_OrderLine",
            //       RecordID: "0",
            //       Action: "Create",
            //       DataRow: {
            //         field: [
            //           {
            //             "@column": "C_Order_ID",
            //             val: "@C_Order.C_Order_ID",
            //           },
            //           {
            //             "@column": "M_Product_ID",
            //             val: element.idempid,
            //           },
            //           {
            //             "@column": "QtyEntered",
            //             val: element.qty,
            //           },
            //           {
            //             "@column": "QtyOrdered",
            //             val: element.qty * element.weight,
            //           },
            //           {
            //             "@column": "PriceEntered",
            //             val:
            //               element.harga +
            //               element.oa * element.weight +
            //               element.addcost * element.weight,
            //           },
            //           {
            //             "@column": "PriceActual",
            //             val:
            //               element.harga / element.weight +
            //               element.oa +
            //               element.addcost,
            //           },
            //           {
            //             "@column": "PriceList",
            //             val: element.harga / element.weight, //harga perkilo
            //           },
            //           {
            //             "@column": "OngkosAngkut",
            //             val: element.oa, //oa saja
            //           },
            //           {
            //             "@column": "SubsidiAmt",
            //             val: element.addcost,
            //           },
            //           {
            //             "@column": "LineNetAmt",
            //             val:
            //               (element.harga +
            //                 element.oa * element.weight +
            //                 element.addcost * element.weight) *
            //               element.qty,
            //           },
            //           {
            //             "@column": "BPR_Task",
            //             val: element.task,
            //           },
            //           {
            //             "@column": "BPR_OldCode",
            //             val: element.id,
            //           },
            //           {
            //             "@column": "C_UOM_ID",
            //             val: element.unitid,
            //           },
            //         ],
            //       },
            //     },
            //   });
            // });
            // var data = JSON.stringify({
            //   CompositeRequest: {
            //     ADLoginRequest: {
            //       user: lokasi.nama,
            //       pass: lokasi.pass,
            //       lang: "en_US",
            //       ClientID: "1000003",
            //       RoleID: "1000079",
            //       OrgID: "0",
            //       WarehouseID: "0",
            //       stage: "9",
            //     },
            //     serviceType: "composite",
            //     operations: {
            //       operation: [
            //         {
            //           TargetPort: "createData",
            //           ModelCRUD: {
            //             serviceType: "addSalesOrder",
            //             TableName: "C_Order",
            //             RecordID: "0",
            //             Action: "Create",
            //             DataRow: {
            //               field: [
            //                 {
            //                   "@column": "AD_Org_ID",
            //                   val: lokasi.org,
            //                 },
            //                 {
            //                   "@column": "C_DocTypeTarget_ID",
            //                   val: "1000048",
            //                 },
            //                 {
            //                   "@column": "DateOrdered",
            //                   val: moment(new Date()).format(
            //                     "YYYY-MM-DD HH:mm:ss"
            //                   ),
            //                 },
            //                 {
            //                   "@column": "DatePromised",
            //                   val: moment()
            //                     .add(2, "days")
            //                     .format("YYYY-MM-DD HH:mm:ss"),
            //                 },
            //                 {
            //                   "@column": "C_BPartner_ID",
            //                   val: lokasi.locationIdemp,
            //                 },
            //                 {
            //                   "@column": "M_Warehouse_ID",
            //                   val: lokasi.whid,
            //                 },
            //                 {
            //                   "@column": "M_PriceList_ID",
            //                   val: additional.pricelistid,
            //                 },
            //                 {
            //                   "@column": "SalesRep_ID2",
            //                   val: lokasi.salesrep,
            //                 },
            //                 {
            //                   "@column": "DeliveryViaRule",
            //                   val:
            //                     oaYesNo === true && ongkosAngkut !== 0
            //                       ? "D"
            //                       : "P",
            //                 },
            //               ],
            //             },
            //           },
            //         },
            //         dataSoDetail,
            //         {
            //           TargetPort: "setDocAction",
            //           ModelSetDocAction: {
            //             serviceType: "docActOrder",
            //             recordIDVariable: "@C_Order.C_Order_ID",
            //             docAction: "PR",
            //           },
            //         },
            //       ],
            //     },
            //   },
            // });
            // var config = {
            //   method: "post",
            //   url:
            //     constants.idempServerBpr +
            //     "ADInterface/services/rest/composite_service/composite_operation",
            //   headers: {
            //     Accept: "application/json",
            //     "Content-Type": "application/json",
            //   },
            //   data: data,
            // };
            // axios(config)
            //   .then(function (response) {
            //     // console.log("balikan", response.data);

            //     console.log(
            //       "tes ambil error balikan",
            //       JSON.stringify(
            //         response.data.CompositeResponses.CompositeResponse
            //           .StandardResponse
            //       )
            //     );

            //     // console.log(
            //     //   "balikan 2",
            //     //   JSON.stringify(response.data).indexOf("@IsError: true") > -1
            //     // );

            //     // console.log(
            //     //   "balikan 3",
            //     //   JSON.stringify(response.data).indexOf(": true") > -1
            //     // );

            //     // console.log(
            //     //   "check",response)

            //     const check =
            //       JSON.stringify(response.data).indexOf("true") > -1;
            //     // console.log("check", check);
            //     // console.log(
            //     //   "check",
            //     //   response.data.CompositeResponses.CompositeResponse
            //     //     .StandardResponse[1]
            //     // );
            //     if (check === true) {
            //       // console.log(
            //       //   "error so",
            //       //   response.data.CompositeResponses.CompositeResponse
            //       //     .StandardResponse[1].Error
            //       // );

            //       var arr = [];
            //       // var data =
            //       //   response.data.CompositeResponses.CompositeResponse
            //       //     .StandardResponse[2];

            //       var data =
            //         response.data.CompositeResponses.CompositeResponse
            //           .StandardResponse;

            //       // console.log("tes", data);

            //       // console.log("error value", data["Error"]);
            //       if (data["@IsError"] === true) {
            //         arr = data["Error"];
            //       }

            //       Alert.alert("Error SO Hubungi IT", arr, [{ text: "OK" }]);
            //       setIsloading(false);
            //     } else {
            //       // console.log(
            //       //   "sukses",
            //       //   response.data.CompositeResponses.CompositeResponse
            //       // );
            //       let result =
            //         response.data.CompositeResponses.CompositeResponse
            //           .StandardResponse[0].outputFields.outputField[1][
            //           "@value"
            //         ];
            //       // console.log("no doc", result);

            //       const options = {
            //         sodoc: result,
            //         tglorder: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
            //         salesman: lokasi.salesrep,
            //         nik: lokasi.nik,
            //         lokasi: lokasi.locationid,
            //         lokasiidemp: lokasi.locationIdemp,
            //       };
            //       // console.log("option", options);
            //       axios
            //         .post(
            //           constants.loginServer + "/insertsalesorderidemp",
            //           options
            //         )
            //         .then((response) => {
            //           // console.log(response.status);
            //           Alert.alert("Data SO Tersimpan", "", [{ text: "Okay" }]);
            //           AsyncStorage.removeItem("sales");
            //           // AsyncStorage.removeItem("additional");
            //           setTodos([]);
            //           cekCreditLimit(lokasi.locationIdemp);
            //         });
            //     }
            //   })
            //   .catch(function (error) {
            //     console.log(error);
            //   });
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

  const deleteTodo = async (
    todoId,
    todoQty,
    todoHarga,
    todoWeight,
    addcost
  ) => {
    // setTotal(
    //   Number.parseFloat(total) -
    //     Number.parseFloat(todoQty) * Number.parseFloat(todoHarga)
    // );
    // setTotalBerat(
    //   Number.parseFloat(totalBerat) -
    //     Number.parseFloat(todoQty) * Number.parseFloat(todoWeight)
    // );
    // console.log("todos", todos);
    if (todos.length === 1) {
      setTodos(todos.length === 0);
    }
    const newTodosItem = todos.filter((item) => item.id != todoId.toString());
    // console.log("hasil", newTodosItem);
    setTodos(newTodosItem);

    await AsyncStorage.removeItem("sales");

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

  return (
    <SafeAreaView style={styles.outcontainer}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle={"dark-content"} />
        {renderHeader()}
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
            {lokasi === null ? "Belum Melakukan Check in" : lokasi.customer}
          </Text>

          <Text
            style={
              (styles.sectionTitle,
              { color: COLORS.red2, fontWeight: "bold", fontSize: 16 })
            }
          >
            {additional !== null
              ? "Credit Limit Rp." +
                NumberFormat(additional.clavailable.toString())
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
              <CustomSwitch
                label="Ongkos Angkut"
                additional={oaYesNo ? ongkosAngkut.toString() : "0"}
                value={oaYesNo}
                onChange={(value) => {
                  setOaYesNo(value);
                  hitungulang(value);
                }}
              />
            </View>
            <View
              style={{
                flex: 1,
                alignItems: "flex-end",
              }}
            >
              <TextButton
                label="Simpan"
                buttonContainerStyle={{
                  height: 40,
                  width: 70,
                  borderRadius: SIZES.radius,
                }}
                onPress={() => {
                  simpanSo();
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
            {/* <AutocompleteDropdown
              ref={searchRef}
              controller={(controller) => {
                dropdownController.current = controller;
              }}
              // initialValue={'1'}
              direction={Platform.select({ ios: "down" })}
              dataSet={suggestionsList}
              onChangeText={getSuggestions}
              onSelectItem={(item) => {
                // item && console.log("pilih", item);
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
            /> */}

            <AutocompleteDropdown
              clearOnFocus={true}
              closeOnBlur={false}
              onSelectItem={(item) => {
                // item && console.log("pilih", item);
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
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="white" />
            <Text style={{ fontSize: 20, color: "white", marginTop: 16 }}>
              Mohon Tunggu...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SalesOrderBeras;

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
