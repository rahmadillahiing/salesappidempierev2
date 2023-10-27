import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SIZES, icons, COLORS, constants } from "../../constants";
import { IconButton, Header } from "../../components";
import axios from "axios";
import { GetDataLocal, NumberFormat } from "../../utils";

const MonitoringSoDetail = ({ navigation, route }) => {
  const [listData, setListData] = useState("");
  const flatListRef = useRef();
  const [profile, setProfile] = useState("");
  const [dataSo, setDataSo] = useState([]);
  useEffect(() => {
    let detailItem = route.params.detailItem;
    setListData(detailItem);
    // console.log("detail", detailItem);
    getUser(detailItem);
  }, []);

  function renderHeader() {
    return (
      <Header
        title="DETAIL MONITORING SO"
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

  const getUser = (detailItem) => {
    GetDataLocal("user").then((res) => {
      // console.log("user", res);
      const data = res;
      setProfile(data);
      // console.log("profile", detailItem);
      cekSalesOrder(detailItem, data);
    });
  };

  async function cekSalesOrder(detailitem, data) {
    // console.log("noso", detailitem.noso);
    // console.log("data", data);

    await axios
      .post(
        constants.idempServerBpr +
          "ADInterface/services/rest/model_adservice/query_data",
        {
          ModelCRUDRequest: {
            ModelCRUD: {
              serviceType: "getAppOrderStatusDetail",
              DataRow: {
                field: [
                  {
                    "@column": "DocumentNo",
                    val: detailitem.noso,
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
        // console.log("response", response.data);
        const hitungso = response.data.WindowTabData.RowCount;
        // console.log("SO", response.data);

        let sodata = [];

        if (hitungso == 1) {
          // console.log("hitung a", hitungso);
          sodata.push({
            id: response.data.WindowTabData.DataSet.DataRow.field[0].val,
            docno: response.data.WindowTabData.DataSet.DataRow.field[1].val,
            productid: response.data.WindowTabData.DataSet.DataRow.field[2].val,
            prodname: response.data.WindowTabData.DataSet.DataRow.field[3].val,
            qty: response.data.WindowTabData.DataSet.DataRow.field[4].val,
            uom: response.data.WindowTabData.DataSet.DataRow.field[5].val,
            qtysent: response.data.WindowTabData.DataSet.DataRow.field[6].val,
          });
        } else {
          for (var i = 0; i < hitungso; i++) {
            sodata.push({
              id: response.data.WindowTabData.DataSet.DataRow[i].field[0].val,
              docno:
                response.data.WindowTabData.DataSet.DataRow[i].field[1].val,
              productid:
                response.data.WindowTabData.DataSet.DataRow[i].field[2].val,
              prodname:
                response.data.WindowTabData.DataSet.DataRow[i].field[3].val,
              qty: response.data.WindowTabData.DataSet.DataRow[i].field[4].val,
              uom: response.data.WindowTabData.DataSet.DataRow[i].field[5].val,
              qtysent:
                response.data.WindowTabData.DataSet.DataRow[i].field[6].val,
            });
          }
        }

        // console.log("sodata", sodata);
        setDataSo(sodata);
        // setRefreshing(false);
      });
  }

  const ListItem = ({ todo }) => {
    // console.log("todo", todo);
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
                fontSize: 16,
                color: "#1f145c",
                // textDecorationLine: todo?.completed ? "line-through" : "none",
                // textDecorationLine: "line-through",
              }}
            >
              No SO : {todo?.docno}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#1f145c",
              //   textDecorationLine: todo?.completed ? "line-through" : "none",
              //   textDecorationLine: "line-through",
            }}
          >
            {todo?.productid}
          </Text>

          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              //   textDecorationLine: todo?.completed ? "line-through" : "none",
              //   textDecorationLine: "line-through",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            {todo?.prodname}
            {/* {todo?.addcost > 0
              ? NumberFormat(
                  (todo?.harga + todo?.weight * todo?.addcost).toString()
                )
              : NumberFormat((todo?.harga).toString())} */}
          </Text>
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
                  fontSize: 12,
                  color: "#1f145c",
                  //   textDecorationLine: todo?.completed ? "line-through" : "none",
                  //   textDecorationLine: "line-through",
                }}
              >
                Qty SO : {todo?.qty + " " + todo?.uom}
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
                  fontSize: 12,
                  color: "#1f145c",
                  //   textDecorationLine: todo?.completed ? "line-through" : "none",
                  //   textDecorationLine: "line-through",
                }}
              >
                Qty sent : {todo?.qtysent.toString() + " " + todo?.uom}
                {/* {NumberFormat(
                  (
                    (todo?.harga +
                      todo?.oa * todo?.weight +
                      todo?.addcost * todo?.weight) *
                    todo?.qty
                  ).toString()
                )} */}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      {renderHeader()}
      <FlatList
        keyExtractor={(item) => `${item.id}`}
        showsVerticalScrollIndicator={false}
        ref={flatListRef}
        data={dataSo}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 50,
        }}
        renderItem={({ item }) => <ListItem todo={item} />}
      />
    </SafeAreaView>
  );
};

export default MonitoringSoDetail;

const styles = StyleSheet.create({
  listItem: {
    padding: 8,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    elevation: 12,
    borderRadius: 7,
    marginVertical: 5,
  },
});
