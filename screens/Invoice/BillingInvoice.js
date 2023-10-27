import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";

import { Header, IconButton } from "../../components";
// Async storage
import AsyncStorage from "@react-native-async-storage/async-storage";

import { GetDataLocal, NumberFormat } from "../../utils";

import { COLORS, SIZES, icons, constants, images } from "../../constants";

import { useNavigation, useIsFocused } from "@react-navigation/native";

const BillingInvoice = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(true);
  const [lokasi, setLokasi] = useState(null);
  const [invoice, setInvoice] = useState([]);
  const flatListRef = useRef();
  const isFocused = useIsFocused();

  useEffect(() => {
    isFocused && getLokasi();
  }, [isFocused]);

  const getInvoice = (props) => {
    const url = constants.loginServer + `/getdatainvoiceheader?filter=${props}`;
    // console.log("url", url);
    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundschedule = isJson && (await response.json());
      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }
      // console.log("Data invoice", foundschedule);
      setInvoice(foundschedule);
      setRefreshing(false);
    });
  };

  const getLokasi = () => {
    GetDataLocal("lokasi").then((res) => {
      // console.log("result", res);
      if (res !== null) {
        setLokasi(res);
        getInvoice(res.locationIdemp);
      } else {
        setRefreshing(false);
      }
    });
  };

  function renderHeader() {
    return (
      <Header
        title="TAGIHAN INVOICE"
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

  const ListItem = ({ invoice }) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          navigation.navigate("InvoiceDetail", {
            detailItem: {
              invnumber: invoice.invnumber,
              invtotal: invoice.invtotal,
              totalpayment: invoice.totalpayment,
              nourut: invoice.nourut,
              lokasi: lokasi.customer,
              nik: lokasi.nik,
            },
          })
        }
      >
        <View>
          <Text
            style={{
              fontSize: 15,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            No Tagihan : {invoice?.invnumber}
          </Text>

          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Tagihan : Rp.{NumberFormat(invoice?.invtotal.toString())}
          </Text>
          <Text
            style={{
              // fontWeight: "bold",
              fontSize: 14,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
              alignItems: "flex-end",
              alignContent: "flex-end",
            }}
          >
            Pembayaran :{" "}
            {invoice.totalpayment === 0
              ? "-"
              : "Rp." + NumberFormat(invoice?.totalpayment.toString())}
          </Text>
          {invoice.totalpayment !== 0 ||
          invoice?.invtotal - invoice?.totalpayment !== 0 ? (
            <Text
              style={{
                // fontWeight: "bold",
                fontSize: 14,
                color: "#1f145c",
                // textDecorationLine: todo?.completed ? "line-through" : "none",
                alignItems: "flex-end",
                alignContent: "flex-end",
              }}
            >
              Belum terbayar : Rp.
              {NumberFormat(
                (invoice?.invtotal - invoice?.totalpayment).toString()
              )}
            </Text>
          ) : (
            <></>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = () => {
    getLokasi();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={"light-content"} />
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
          {lokasi == null ? "Belum Melakukan Check in" : lokasi.customer}
        </Text>
        {/* {invoice.length > 0 && ( */}
        <View
          style={{
            flex: 1,
            marginTop: 5,
            backgroundColor: COLORS.lightGray2,
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: COLORS.gray, fontSize: 18, left: 10 }}>
            {/* {console.log("total tampilan :", total)} */}
            {invoice.length === 0
              ? "Tidak ada data invoice untuk di tagih"
              : "Data Invoice"}
          </Text>
          <FlatList
            keyExtractor={(item) => `${item.invnumber}`}
            showsVerticalScrollIndicator={false}
            ref={flatListRef}
            data={invoice}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 50,
            }}
            renderItem={({ item }) => <ListItem invoice={item} />}
            refreshControl={
              <RefreshControl
                //refresh control used for the Pull to Refresh
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        </View>
        {/* )} */}
      </View>
    </SafeAreaView>
  );
};

export default BillingInvoice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white2,
    marginTop: 12,
  },
  sectionLokasi: {
    fontWeight: "bold",
    marginBottom: 3,
    fontSize: 18,
  },
  listItem: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    elevation: 12,
    borderRadius: 7,
    marginVertical: 5,
  },
});
