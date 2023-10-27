import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  TouchableHighlight,
} from "react-native";
import React, { useEffect, useState } from "react";

import { SwipeListView } from "react-native-swipe-list-view";
import axios from "axios";

import Icon from "@expo/vector-icons/MaterialIcons";

import { Header, IconButton } from "../../components";
import { SIZES, icons, images, COLORS, constants } from "../../constants";
import { GetDataLocal, NumberFormat } from "../../utils";
import moment from "moment";

const MonitoringSo = ({ navigation }) => {
  const [dataSo, setDataSo] = useState([]);
  const [refreshing, setRefreshing] = React.useState(true);
  const [profile, setProfile] = useState("");

  useEffect(() => {
    getUser();
  }, []);

  const onRefresh = () => {
    // console.log("masuk lewat refresh");
    if (profile.id !== "") {
      cekSalesOrder(profile.salesrep);
    }
  };

  const getUser = () => {
    GetDataLocal("user").then((res) => {
      const data = res;
      setProfile(data);
      // console.log("profile", data);
      cekSalesOrder(data);
    });
  };

  async function cekSalesOrder(data) {
    // console.log("data", data);
    await axios
      .post(
        constants.idempServerBpr +
          "ADInterface/services/rest/model_adservice/query_data",
        {
          ModelCRUDRequest: {
            ModelCRUD: {
              serviceType: "getAppOrderStatus2",
              DataRow: {
                field: [
                  {
                    "@column": "SalesRep_ID",
                    val: data.salesrep,
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
        // console.log("response", JSON.stringify(response.data));
        const hitungso = response.data.WindowTabData.RowCount;

        let sodata = [];

        if (hitungso === 1) {
          sodata.push({
            id:
              response.data.WindowTabData.DataSet.DataRow.field[0].val +
              response.data.WindowTabData.DataSet.DataRow.field[7].val,
            status: response.data.WindowTabData.DataSet.DataRow.field[4].val,
            tglorder: response.data.WindowTabData.DataSet.DataRow.field[2].val,
            grandtotal:
              response.data.WindowTabData.DataSet.DataRow.field[6].val,
            bpname: response.data.WindowTabData.DataSet.DataRow.field[3].val,
            supir: response.data.WindowTabData.DataSet.DataRow.field[9].val,
            nopol: response.data.WindowTabData.DataSet.DataRow.field[8].val,
            noso: response.data.WindowTabData.DataSet.DataRow.field[5].val,
            noinout: response.data.WindowTabData.DataSet.DataRow.field[7].val,
          });
        } else {
          for (var i = 0; i < hitungso; i++) {
            sodata.push({
              id:
                response.data.WindowTabData.DataSet.DataRow[i].field[0].val +
                response.data.WindowTabData.DataSet.DataRow[i].field[7].val,
              status:
                response.data.WindowTabData.DataSet.DataRow[i].field[4].val,
              tglorder:
                response.data.WindowTabData.DataSet.DataRow[i].field[2].val,
              grandtotal:
                response.data.WindowTabData.DataSet.DataRow[i].field[6].val,
              bpname:
                response.data.WindowTabData.DataSet.DataRow[i].field[3].val,
              supir:
                response.data.WindowTabData.DataSet.DataRow[i].field[9].val,
              nopol:
                response.data.WindowTabData.DataSet.DataRow[i].field[8].val,
              noso: response.data.WindowTabData.DataSet.DataRow[i].field[5].val,
              noinout:
                response.data.WindowTabData.DataSet.DataRow[i].field[7].val,
            });
          }
        }

        // console.log("sodata", sodata);
        setDataSo(sodata);
        setRefreshing(false);
      });
  }

  function renderHeader() {
    return (
      <Header
        title="MONITORING SALES ORDER"
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

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const deleteRow = (rowMap, rowKey) => {
    closeRow(rowMap, rowKey);
    const newData = [...dataSo];
    const prevIndex = dataSo.findIndex((item) => item.id === rowKey);
    newData.splice(prevIndex, 1);
    setDataSo(newData);
  };

  const VisibleItem = (props) => {
    const { data, rowHeightAnimatedValue, removeRow, rightActionState } = props;

    if (rightActionState) {
      Animated.timing(rowHeightAnimatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        removeRow();
      });
    }

    return (
      <Animated.View
        style={[styles.rowFront, { height: rowHeightAnimatedValue }]}
      >
        <TouchableHighlight
          style={styles.rowFrontVisible}
          onPress={
            () =>
              navigation.navigate("MonitoringSoDetail", {
                detailItem: data.item,
              })
            // console.log("data", data.item)
          }
          underlayColor={"#aaa"}
        >
          <View>
            <View
              style={{
                alignContent: "space-between",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.title} numberOfLines={1}>
                {data.item.noso}
              </Text>
              <Text style={styles.title} numberOfLines={1}>
                {data.item.status}
              </Text>
            </View>
            <View
              style={{
                alignContent: "space-between",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.details} numberOfLines={1}>
                {data.item.bpname}
              </Text>
              <Text style={styles.details} numberOfLines={1}>
                {moment(data.item.tglorder).format("YYYY-MM-DD")}
              </Text>
            </View>
            <View
              style={{
                alignContent: "space-around",
                flexDirection: "row",
                justifyContent: "flex-start",
              }}
            >
              <Text style={styles.title}>Total : </Text>
              <Text style={styles.title}>
                {NumberFormat(data.item.grandtotal.toString())}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </Animated.View>
    );
  };

  const renderItem = (data, rowMap) => {
    const rowHeightAnimatedValue = new Animated.Value(70);

    return (
      <VisibleItem
        data={data}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        removeRow={() => deleteRow(rowMap, data.item.id)}
      />
    );
  };

  const HiddenItemWithActions = (props) => {
    const { onDelete } = props;

    // return (
    //   <View style={[styles.rowBack]}>
    //     <TouchableOpacity
    //       style={[styles.backRightBtn, styles.backRightBtnRight]}
    //       onPress={onDelete}
    //     >
    //       <Text>Delete</Text>
    //     </TouchableOpacity>
    //   </View>
    // );
  };

  const renderHiddenItem = (data, rowMap) => {
    const rowActionAnimatedValue = new Animated.Value(75);
    const rowHeightAnimatedValue = new Animated.Value(60);

    return (
      <HiddenItemWithActions
        data={data}
        rowMap={rowMap}
        rowActionAnimatedValue={rowActionAnimatedValue}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        // onClose={() => closeRow(rowMap, data.item.id)}
        onDelete={() => deleteRow(rowMap, data.item.id)}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white2 }}>
      <View>
        <StatusBar barStyle={"light-content"} />
        {renderHeader()}
      </View>
      <View style={styles.container}>
        <StatusBar backgroundColor="#FF6347" barStyle="light-content" />
        <SwipeListView
          RefreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          useFlatList={true}
          data={dataSo}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={75}
          rightOpenValue={-75}
          disableRightSwipe
        />
      </View>
    </SafeAreaView>
  );
};

export default MonitoringSo;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f4f4",
    flex: 1,
  },
  backTextWhite: {
    color: "#FFF",
  },
  rowFront: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    height: 60,
    margin: 5,
    marginBottom: 10,
    shadowColor: "#999",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  rowFrontVisible: {
    backgroundColor: "#FFF",
    borderRadius: 5,
    height: 70,
    padding: 5,
    marginBottom: 5,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#DDD",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    margin: 5,
    marginBottom: 10,
    borderRadius: 5,
  },
  backRightBtn: {
    alignItems: "flex-end",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
    paddingRight: 17,
  },
  backRightBtnLeft: {
    backgroundColor: "#1f65ff",
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: "red",
    right: 0,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  trash: {
    height: 25,
    width: 25,
    marginRight: 7,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#666",
  },
  details: {
    fontSize: 12,
    color: "#999",
  },
});
