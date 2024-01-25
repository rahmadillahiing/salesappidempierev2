import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";

// import Checkbox from "expo-checkbox";
import { SwipeListView } from "react-native-swipe-list-view";
import axios from "axios";

// import Icon from "@expo/vector-icons/MaterialIcons";

import { Header, IconButton } from "../../components";
import { SIZES, icons, images, COLORS, constants } from "../../constants";
import { GetDataLocal, NumberFormat } from "../../utils";
// import moment from "moment";

const ConfirmInvoice = ({ navigation }) => {
  const [dataInv, setDataInv] = useState([]);
  const [refreshing, setRefreshing] = React.useState(true);
  const [profile, setProfile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //   const [isChecked, setChecked] = useState(false);
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
      .get(
        constants.CashColServer +
          `/api/v1/task-collector/invoice_waiting_approval/collector/${data.id}`
      )
      .then((response) => {
        // console.log("response", JSON.stringify(response.data));
        // console.log("response", response.data);
        const hitunginvoice = response.data.length;
        // console.log("itung2", response.data.length);
        let sodata = [];

        if (hitunginvoice === 1) {
          sodata.push({
            id: response.data[0].TaskAssignLine_UUID,
            status: response.data[0].TaskAssignLine_IsConfirmByCollector,
            sisainv: response.data[0].TaskAssignLine_SisaAmount,
            grandtotal: response.data[0].TaskAssignLine_TotalAmount,
            bpname: response.data[0].TaskAssignLine_CustomerName,
            noinv: response.data[0].TaskAssignLine_DocNumber,
          });
        } else {
          for (var i = 0; i < hitunginvoice; i++) {
            // console.log("i", i);
            sodata.push({
              id: response.data[i].TaskAssignLine_UUID,
              status: response.data[i].TaskAssignLine_IsConfirmByCollector,
              sisainv: response.data[i].TaskAssignLine_SisaAmount,
              grandtotal: response.data[i].TaskAssignLine_TotalAmount,
              bpname: response.data[i].TaskAssignLine_CustomerName,
              noinv: response.data[i].TaskAssignLine_DocNumber,
            });
          }
        }

        // console.log("sodata", sodata);
        setDataInv(sodata);
        setRefreshing(false);
      });
  }

  function renderHeader() {
    return (
      <Header
        title="Konfirmasi Assign Invoice"
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
    // console.log("tes", rowMap[rowKey]);
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const deleteRow = (rowMap, rowKey, invNo, invStatus) => {
    // console.log("rowmap", rowMap);
    // console.log("rowkey", rowKey);
    closeRow(rowMap, rowKey);
    if (invStatus === "N") {
      Alert.alert(
        "Konfirmasi Invoice",
        "Konfirmasi Penerimaan nomor invoice " + invNo + " ?",
        [
          {
            text: "Yes",
            onPress: () => {
              setIsLoading(true);
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  taskline_uuid: rowKey,
                  status_approval_denied: "Y",
                }),
              };
              // console.log("request option", requestOptions);
              const url =
                constants.CashColServer +
                "/api/v1/task-collector/setConfirmBySalesman";
              // console.log("url ", url);
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
                  const newData = [...dataInv];
                  const prevIndex = dataInv.findIndex(
                    (item) => item.id === rowKey
                  );
                  newData[prevIndex].status = "Y";
                  // console.log("previndex", newData[prevIndex]);
                  setDataInv(newData);
                  Alert.alert("Sukses", "Data Berhasil di Confirm", [
                    { text: "Okay" },
                  ]);
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
      Alert.alert("Warning", "Status Invoice Sudah terkonfirmasi sebelumnya");
      return;
    }
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

    const onRefresh = () => {
      getUser();
    };

    return (
      <Animated.View
        style={[styles.rowFront, { height: rowHeightAnimatedValue }]}
      >
        {/* <TouchableHighlight
          style={styles.rowFrontVisible}
          onPress={
            () =>
              navigation.navigate("MonitoringSoDetail", {
                detailItem: data.item,
              })
            // console.log("data", data.item)
          }
          underlayColor={"#aaa"}
        > */}
        <ScrollView
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <View
            style={{
              alignContent: "space-between",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.title} numberOfLines={1}>
              {data.item.noinv}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {data.item.status === "N" ? "Not Confirmed" : "Confirmed"}
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
          </View>
          <View>
            <View
              style={{
                alignContent: "space-around",
                flexDirection: "row",
                justifyContent: "flex-start",
              }}
            >
              <Text style={styles.title}>Total Invoice: </Text>
              <Text style={styles.title}>
                {NumberFormat(data.item.grandtotal.toString())}
              </Text>
            </View>
            <View
              style={{
                alignContent: "space-around",
                flexDirection: "row",
                justifyContent: "flex-start",
              }}
            >
              <Text style={styles.title}>Total Tagihan: </Text>
              <Text style={styles.title}>
                {NumberFormat(data.item.sisainv.toString())}
              </Text>
            </View>
          </View>
        </ScrollView>
        {/* </TouchableHighlight> */}
      </Animated.View>
    );
  };

  const renderItem = (data, rowMap) => {
    const rowHeightAnimatedValue = new Animated.Value(90);

    return (
      <VisibleItem
        data={data}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        removeRow={() =>
          deleteRow(rowMap, data.item.id, data.item.noinv, data.item.status)
        }
      />
    );
  };

  const HiddenItemWithActions = (props) => {
    const { onDelete } = props;

    return (
      <View style={[styles.rowBack]}>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={onDelete}
        >
          <Text>Confirm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHiddenItem = (data, rowMap) => {
    const rowActionAnimatedValue = new Animated.Value(90);
    const rowHeightAnimatedValue = new Animated.Value(90);
    // console.log("data", data);
    // console.log("rowmap", rowMap);

    return (
      <HiddenItemWithActions
        data={data}
        rowMap={rowMap}
        rowActionAnimatedValue={rowActionAnimatedValue}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        onClose={() => closeRow(rowMap, data.item.id)}
        onDelete={() =>
          deleteRow(rowMap, data.item.id, data.item.noinv, data.item.status)
        }
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white2 }}>
      <View>
        <StatusBar barStyle={"light-content"} />
        {renderHeader()}
      </View>
      {/* <ScrollView
        style={styles.container}
        RefreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      > */}
      <StatusBar backgroundColor="#FF6347" barStyle="light-content" />
      <View style={styles.container}>
        <SwipeListView
          RefreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          useFlatList={true}
          data={dataInv}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={75}
          rightOpenValue={-75}
          disableRightSwipe
          // disableLeftSwipe
        />
      </View>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
};

export default ConfirmInvoice;

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
    height: 90,
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
    height: 90,
    padding: 5,
    marginBottom: 5,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#43f40e",
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
    backgroundColor: "#43f40e",
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
  checkbox: {
    margin: 8,
  },
});
