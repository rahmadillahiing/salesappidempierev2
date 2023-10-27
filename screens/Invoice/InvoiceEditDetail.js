import {
  StyleSheet,
  Text,
  View,
  Animated,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TouchableHighlight,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SwipeListView } from "react-native-swipe-list-view";

import axios from "axios";

import { FormDateInput, Header, IconButton } from "../../components";
import { SIZES, icons, images, COLORS, constants } from "../../constants";
import { GetDataLocal, NumberFormat } from "../../utils";

import moment from "moment";

const InvoiceEditDetail = ({ navigation, route }) => {
  const [dataInvoiceHeader, setDataInvoiceHeader] = useState([]);
  const [dataInvoiceDetail, setDataInvoiceDetail] = useState([]);

  useEffect(() => {
    let detailItem = route.params;
    setDataInvoiceHeader(detailItem.detailItem);
    // console.log(detailItem.detailItem.invoice);
    cekdetail(detailItem.detailItem.invoice.key);
  }, []);

  function cekdetail(billingid) {
    // console.log("billing id", billingid);
    axios
      .get(
        constants.CashColServer +
          `/api/v1/task-collector/invoice_list_for_edit/invoice_detail/${billingid}`
      )
      .then((response) => {
        let hitunginv = response.data.length;
        // console.log("data response", response.data);
        // console.log("data itungan", hitunginv);

        const datainvdetail = [];
        for (var i = 0; i < hitunginv; i++) {
          datainvdetail.push({
            key: response.data[i].pinv_id,
            billingid: response.data[i].pinv_billingid,
            invbuktitrf: response.data[i].pinv_paymentnote,
            paymentinv: response.data[i].pinv_payment,
            confirmttf: response.data[i].pinv_isConfirmTTF,
            tglttf: response.data[i].pinv_tglConfirmTTF,
            invnumber: response.data[i].inv_number,
            invtotal: response.data[i].inv_total,
            istagihttf: response.data[i].inv_istagihttf,
            customername: response.data[i].TaskAssignLine_CustomerName,
            paymenttype:
              response.data[i].pinv_paymenttype === "0"
                ? "Tukar Faktur"
                : response.data[i].pinv_paymenttype,
            bppnomor: response.data[i].TAlokasiBPBDetail_RunningNumber,
            bppid: response.data[i].pinv_bpp,
            bppprefix: response.data[i].TAlokasiBPBDetail_Prefix,
            path: response.data[i].pinv_path,
          });
        }
        // console.log("data parsing", datainvdetail);
        setDataInvoiceDetail(datainvdetail);
      });
  }

  const HiddenItemWithActions = (props) => {
    const { onDelete } = props;

    return (
      <View style={[styles.rowBack]}>
        <TouchableOpacity
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={onDelete}
        >
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  function renderHeader() {
    return (
      <Header
        title="Invoice Edit"
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
            onPress={() => navigation.navigate("InvoiceEditHeader")}
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
    // console.log("data", data);
    return (
      <VisibleItem
        data={data}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        removeRow={() =>
          confirmRow(
            rowMap,
            data.item.key,
            data.item.invnumber,
            data.item.paymenttype
          )
        }
      />
    );
  };

  const closeRow = (rowMap, rowKey) => {
    // console.log("tes close", rowMap[rowKey]);
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const confirmRow = (rowMap, rowKey, invNo, invStatus) => {
    // console.log("rowmap", rowMap);
    // console.log("rowkey", rowKey);
    closeRow(rowMap, rowKey);
    Alert.alert(
      "Konfirmasi",
      "Konfirmasi Delete nomor invoice " + invNo + " ?",
      [
        {
          text: "Yes",
          onPress: () => {
            // setIsLoading(true);
            const requestOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nourut: rowKey,
                invstatus: invStatus === "Tukar Faktur" ? "0" : invStatus,
              }),
            };
            // console.log("request option", requestOptions);
            const url =
              constants.CashColServer + `/api/v1/task-collector/deletePayment`;
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
                // setIsLoading(false);
                // console.log("hasil", hasil1);

                Alert.alert("Invalid Data", "please check the data", [
                  { text: "Okay" },
                ]);
                return;
              } else {
                // setIsLoading(false);
                // console.log(hasil1);
                // const newData = [...dataInv];
                // const prevIndex = dataInv.findIndex(
                //   (item) => item.id === rowKey
                // );
                // newData[prevIndex].status = "Y";
                // console.log("previndex", newData[prevIndex]);
                // setDataInv(newData);
                navigation.goBack();
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
          // onPress={() =>
          //   invoice.status === "Tertagih"
          //     ? navigation.navigate("InvoiceEditDetail", {
          //         detailItem: {
          //           invoice,
          //         },
          //       })
          //     : (setModalVisible(true), setPilihList(invoice))
          // }
          onPress={
            () =>
              data.item.paymenttype === "Tukar Faktur"
                ? ""
                : navigation.navigate("InvoiceEditSubDetail", {
                    detailItem: data.item,
                  })
            // console.log("data", [data.item, dataInvoiceHeader])
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
                {data.item.invnumber}
              </Text>
              <Text style={styles.title} numberOfLines={1}>
                {data.item.paymenttype}
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
                {data.item.customername}
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
                <Text style={styles.title}>
                  {data.item.confirmttf === "Y"
                    ? "Tanggal TTF : "
                    : "Pembayaran : "}
                </Text>
                <Text style={styles.title}>
                  {data.item.confirmttf === "Y"
                    ? moment(data.item.tglttf).format("DD-MM-YYYY").toString()
                    : NumberFormat(data.item.paymentinv.toString())}
                </Text>
              </View>

              <View
                style={{
                  alignContent: "space-around",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                }}
              >
                <Text style={styles.title}>Total Invoice: </Text>
                <Text style={styles.title}>
                  {NumberFormat(data.item.invtotal.toString())}
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
          </View>
        </TouchableHighlight>
        {/* </TouchableHighlight> */}
      </Animated.View>
    );
  };

  const renderHiddenItem = (data, rowMap) => {
    const rowActionAnimatedValue = new Animated.Value(80);
    const rowHeightAnimatedValue = new Animated.Value(80);

    return (
      <HiddenItemWithActions
        data={data}
        rowMap={rowMap}
        rowActionAnimatedValue={rowActionAnimatedValue}
        rowHeightAnimatedValue={rowHeightAnimatedValue}
        // onClose={() => closeRow(rowMap, data.item.id)}
        onDelete={() =>
          confirmRow(
            rowMap,
            data.item.key,
            data.item.invnumber,
            data.item.paymenttype
          )
        }
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      <StatusBar barStyle={"dark-content"} />
      {renderHeader()}
      <View>
        <SwipeListView
          // RefreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          // }
          useFlatList={true}
          data={dataInvoiceDetail}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={75}
          rightOpenValue={-75}
          disableRightSwipe
          // disableLeftSwipe
        />
      </View>
    </SafeAreaView>
  );
};

export default InvoiceEditDetail;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f4f4",
    flex: 1,
  },
  backTextWhite: {
    color: "#FFF",
  },
  rowFront: {
    padding: 7,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 5,
    height: 90,
    margin: 10,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#999",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  rowFrontVisible: {
    backgroundColor: COLORS.lightGray2,
    borderRadius: 10,
    height: 80,
    // padding: 5,
    // marginBottom: 5,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#43f40e",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    margin: 10,
    marginBottom: 10,
    borderRadius: 5,
    marginTop: 10,
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
