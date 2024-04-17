import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";

import axios from "axios";

import {
  FormDateInput,
  Header,
  IconButton,
  LineDivider,
} from "../../components";

import { SIZES, icons, images, COLORS, constants } from "../../constants";

import { useNavigation, useIsFocused } from "@react-navigation/native";

import { NumberFormat } from "../../utils";

const InvoiceOutstanding = (profile) => {
  const flatListRef = useRef();
  const [invoice, setInvoice] = useState([]);
  const [isLoading, setIsloading] = useState(true);

  const user = profile.route.params.profile;

  // console.log("user", user);
  useEffect(() => {
    CekInvoice(user);
  }, []);

  // CekInvoice(user);

  function CekInvoice(user) {
    axios
      .post(
        constants.idempServerBpr +
          "ADInterface/services/rest/model_adservice/query_data",
        {
          ModelCRUDRequest: {
            ModelCRUD: {
              serviceType: "getopeninvoicedetail",
              DataRow: {
                field: [
                  {
                    "@column": "SalesRep_ID",
                    val: user.salesrep,
                  },
                ],
              },
            },
            ADLoginRequest: {
              user: user.fullname,
              pass: user.pass,
              lang: "en_US",
              ClientID: "1000003",
              RoleID: "1000079",
              OrgID: "0",
              WarehouseID: "0",
              stage: "9",
            },
          },
        }
      )
      .then(function (invoice) {
        console.log("invoice", invoice.data);
        const invoicedetail = [];
        if (invoice.data.WindowTabData.RowCount === 1) {
          console.log("hasil", invoice.data.WindowTabData.DataSet.DataRow);
          invoicedetail.push({
            key: invoice.data.WindowTabData.DataSet.DataRow.field[4].val,
            id: invoice.data.WindowTabData.DataSet.DataRow.field[4].val,
            invno: invoice.data.WindowTabData.DataSet.DataRow.field[5].val,
            bpname: invoice.data.WindowTabData.DataSet.DataRow.field[2].val,
            invdate: invoice.data.WindowTabData.DataSet.DataRow.field[6].val,
            invttf: invoice.data.WindowTabData.DataSet.DataRow.field[7].val,
            daydue: invoice.data.WindowTabData.DataSet.DataRow.field[8].val,
            invtotal: invoice.data.WindowTabData.DataSet.DataRow.field[9].val,
            invamt: invoice.data.WindowTabData.DataSet.DataRow.field[10].val,
          });
        } else {
          console.log("hasil2", invoice.data.WindowTabData.DataSet.DataRow[0]);

          for (var i = 0; i < invoice.data.WindowTabData.RowCount; i++) {
            invoicedetail.push({
              key: invoice.data.WindowTabData.DataSet.DataRow[i].field[4].val,
              id: invoice.data.WindowTabData.DataSet.DataRow[i].field[4].val,
              invno: invoice.data.WindowTabData.DataSet.DataRow[i].field[5].val,
              bpname:
                invoice.data.WindowTabData.DataSet.DataRow[i].field[2].val,
              invdate:
                invoice.data.WindowTabData.DataSet.DataRow[i].field[6].val,
              invttf:
                invoice.data.WindowTabData.DataSet.DataRow[i].field[7].val,
              daydue:
                invoice.data.WindowTabData.DataSet.DataRow[i].field[8].val,
              invtotal:
                invoice.data.WindowTabData.DataSet.DataRow[i].field[9].val,
              invamt:
                invoice.data.WindowTabData.DataSet.DataRow[i].field[10].val,
            });
            console.log("hasil mapping", invoicedetail);
          }
        }
        setInvoice(invoicedetail);
        setIsloading(false);
      });
  }
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  function renderHeader() {
    return (
      <Header
        title="Invoice Due Date"
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

  const ListItem = ({ todo }) => {
    console.log("data", todo);
    return (
      <View style={styles.listItem}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 2, alignContent: "flex-start" }}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 14,
                color: "#1f145c",
              }}
            >
              {todo?.invno}
            </Text>
          </View>

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
              }}
            >
              {todo?.invdate}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              color: "#1f145c",
            }}
          >
            {todo?.bpname}
          </Text>
          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Total : Rp. {NumberFormat(todo?.invtotal.toString())}
          </Text>
          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Tagihan : Rp. {NumberFormat(todo?.invamt.toString())}
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
            }}
          ></View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.outcontainer}>
      <StatusBar barStyle={"dark-content"} />
      <View>{renderHeader()}</View>
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item) => `${item.key}`}
          showsVerticalScrollIndicator={false}
          ref={flatListRef}
          data={invoice}
          contentContainerStyle={{
            padding: 15,
            paddingBottom: 50,
          }}
          renderItem={({ item }) => <ListItem todo={item} />}
        />
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

export default InvoiceOutstanding;

const styles = StyleSheet.create({
  outcontainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.white2,
    marginTop: 12,
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
  listItem: {
    padding: 8,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    elevation: 12,
    borderRadius: 7,
    marginVertical: 5,
  },
});
