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

import { SwipeListView } from "react-native-swipe-list-view";
import axios from "axios";

import { Header, IconButton } from "../../components";
import { SIZES, icons, images, COLORS, constants } from "../../constants";
import { GetDataLocal, NumberFormat } from "../../utils";

const ConfirmTtf = ({ navigation }) => {
  const [profile, setProfile] = useState("");
  const [refreshing, setRefreshing] = React.useState(true);
  const [dataInv, setDataInv] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    getUser();
  }, []);

  const onRefresh = () => {
    if (profile.id !== "") {
      cekSalesOrder(profile.salesrep);
    } else {
      getUser();
    }
  };

  const getUser = () => {
    GetDataLocal("user").then((res) => {
      const data = res;
      console.log("data", data);
      setProfile(data);
      cekSalesOrder(data);
    });
  };

  async function cekSalesOrder(data) {
    await axios
      .get(
        constants.CashColServer +
          `/api/v1/task-collector/invoice_non_kunjungan_MT/collector/${data.id}`
      )
      .then((response) => {
        const hitunginvoice = response.data.length;
        let sodata = [];

        if (hitunginvoice === 1) {
          sodata.push({
            id: response.data[0].inv_id,
            status: "N",
            grandtotal: response.data[0].inv_total,
            bpname: response.data[0].CustomerName,
            noinv: response.data[0].inv_number,
          });
        } else {
          for (var i = 0; i < hitunginvoice; i++) {
            sodata.push({
              id: response.data[i].inv_id,
              status: "N",
              grandtotal: response.data[i].inv_total,
              bpname: response.data[i].CustomerName,
              noinv: response.data[i].inv_number,
            });
          }
        }
        setDataInv(sodata);
        setRefreshing(false);
      });
  }

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const confirmRow = (rowMap, rowKey, invNo, invStatus) => {
    // console.log("rowmap", rowMap);
    // console.log("rowkey", rowKey);
    closeRow(rowMap, rowKey);
    if (invStatus === "N") {
      Alert.alert(
        "Konfirmasi TTF Invoice",
        "Konfirmasi TTF nomor invoice " + invNo + " ?",
        [
          {
            text: "Yes",
            onPress: () => {
              setIsLoading(true);
              const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nourut: rowKey,
                  paymenttype: "0",
                  payment: 0,
                  nik: profile.id,
                  confirmttf: "Y",
                }),
              };
              // console.log("request option", requestOptions);
              const url = constants.loginServer + "/insertinvoicettf";
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
                  // console.log("hasil", hasil1);

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
        {/* <ScrollView
          refreshControl={
            <RefreshControl
              //refresh control used for the Pull to Refresh
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        > */}
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
            {data.item.status === "N" ? "TTF Not Confirmed" : "Confirmed"}
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
          {/* <View
              style={{
                alignContent: "space-around",
                flexDirection: "row",
                justifyContent: "flex-start",
              }}
            > */}
          {/* <Text style={styles.title}>Total Tagihan: </Text> */}
          {/* <Text style={styles.title}>
                {NumberFormat(data.item.sisainv.toString())}
              </Text> */}
          {/* </View> */}
        </View>
        {/* </ScrollView> */}
        {/* </TouchableHighlight> */}
      </Animated.View>
    );
  };

  function renderHeader() {
    return (
      <Header
        title="Konfirmasi TTF"
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

  const renderItem = (data, rowMap) => {
    const rowHeightAnimatedValue = new Animated.Value(90);

    return (
      <VisibleItem
        data={data}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        removeRow={() =>
          confirmRow(rowMap, data.item.id, data.item.noinv, data.item.status)
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

    return (
      <HiddenItemWithActions
        data={data}
        rowMap={rowMap}
        rowActionAnimatedValue={rowActionAnimatedValue}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        // onClose={() => closeRow(rowMap, data.item.id)}
        onDelete={() =>
          confirmRow(rowMap, data.item.id, data.item.noinv, data.item.status)
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
      <ScrollView
        style={styles.container}
        RefreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StatusBar backgroundColor="#FF6347" barStyle="light-content" />
        <View>
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmTtf;

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
