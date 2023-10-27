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

import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from "@react-navigation/native";

const BillingInvoiceNonKunjungan = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(true);
  const [profile, setProfile] = useState("");
  const [lokasi, setLokasi] = useState(null);
  const [invoice, setInvoice] = useState([]);
  const flatListRef = useRef();
  const isFocused = useIsFocused();

  useEffect(() => {
    isFocused && getUser();
    // getLokasi();
  }, [isFocused]);

  const getInvoice = (props) => {
    const url =
      constants.CashColServer +
      `/api/v1/task-collector/invoice_non_kunjungan/collector/${props.id}`;
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

  const getUser = () => {
    GetDataLocal("user").then((res) => {
      const data = res;
      setProfile(data);
      // console.log("profile", data);
      getInvoice(data);
    });
  };

  const getLokasi = () => {
    GetDataLocal("lokasi").then((res) => {
      // console.log("result", res);
      if (res !== null) {
        setLokasi(res);
        // getInvoice(res.locationIdemp);
      } else {
        setRefreshing(false);
      }
    });
  };

  function renderHeader() {
    return (
      <Header
        title="INVOICE NON KUNJUNGAN"
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
          navigation.navigate("InvoiceDetailNonKunjungan", {
            detailItem: {
              invnumber: invoice.inv_number,
              invtotal: invoice.inv_total,
              totalpayment: invoice.totalpayment,
              nourut: invoice.inv_id,
              lokasi: invoice.CustomerName,
              nik: profile.id,
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
            No Tagihan : {invoice?.inv_number}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#1f145c",
              // textDecorationLine: todo?.completed ? "line-through" : "none",
            }}
          >
            {invoice?.CustomerName}
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
            Tagihan : Rp.{NumberFormat(invoice?.inv_total.toString())}
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
          {invoice.total_payment !== 0 ||
          invoice?.inv_total - invoice?.totalpayment !== 0 ? (
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
                (invoice?.inv_total - invoice?.totalpayment).toString()
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
    // getLokasi();
    getUser();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={"light-content"} />
      {renderHeader()}
      <View style={styles.container}>
        {/* {invoice.length > 0 && ( */}
        <View
          style={{
            flex: 1,
            marginTop: 5,
            backgroundColor: COLORS.lightGray2,
            padding: 5,
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
            keyExtractor={(item) => `${item.inv_number}`}
            showsVerticalScrollIndicator={false}
            ref={flatListRef}
            data={invoice}
            contentContainerStyle={{
              padding: 10,
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

export default BillingInvoiceNonKunjungan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
