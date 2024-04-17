import moment from "moment";
import React from "react";
import { View, Text, Image, ScrollView, SafeAreaView } from "react-native";

import { Header, IconButton, LineDivider, ListItem } from "../../components";
import {
  FONTS,
  SIZES,
  COLORS,
  icons,
  images,
  dummyData,
  constants,
} from "../../constants";

const DashboardDetail = ({ navigation, route }) => {
  const [selectedSize, setSelectedSize] = React.useState("");
  const [detailItem, setdetailItem] = React.useState([]);
  const [qty, setQty] = React.useState(1);
  const [displayBefore, setDisplaybefore] = React.useState("");
  const [displayAfter, setDisplayafter] = React.useState("");
  const [returData, setReturData] = React.useState("");
  const [soData, setSoData] = React.useState("");
  const [surveyDataHarga, setSurveyDataHarga] = React.useState("");
  const [surveyStock, setSurveyStock] = React.useState("");
  const [surveyCompetitor, setSurveyCompetitor] = React.useState("");
  const [surveyQtySales, setSurveyQtySales] = React.useState("");
  const [fotoIn, setFotoIn] = React.useState(null);
  const [fotoOut, setFotoOut] = React.useState(null);

  React.useEffect(() => {
    let { detailItem } = route.params;
    console.log("item kiriman", detailItem);
    if (detailItem.dimageb == null) {
      setDisplaybefore(null);
    } else {
      setDisplaybefore(constants.loginServer + detailItem.dimageb);
    }
    if (detailItem.dimagea == null) {
      setDisplayafter(null);
    } else {
      setDisplayafter(constants.loginServer + detailItem.dimagea);
    }
    if (detailItem.cico_fotoin !== null) {
      setFotoIn(constants.loginServer + "/uploads/" + detailItem.cico_fotoin);
      console.log(
        "fotoin",
        constants.loginServer + "/uploads/" + detailItem.cico_fotoin
      );
    }
    if (detailItem.cico_fotoout !== null) {
      setFotoOut(constants.loginServer + "/uploads/" + detailItem.cico_fotoout);
    }

    // console.log("tes path1", constants.loginServer + detailItem.dimageb);
    // console.log("tes path2", constants.loginServer + detailItem.dimagea);
    // console.log("detail item", detailItem);
    setdetailItem(detailItem);
    if (detailItem.returid !== null) {
      getReturn(detailItem.returid);
    }
    // if (detailItem.soid !== null) {
    //   getSo(detailItem.soid);
    // }
    if (detailItem.countharga !== null) {
      getSurveyHarga(
        detailItem.id,
        detailItem.tglasli,
        detailItem.nik,
        detailItem.name
      );
    }
    if (detailItem.stockid !== null) {
      getStock(detailItem.stockid);
    }
    if (detailItem.countcompetitor !== null) {
      getSurveyHargaCompetitor(
        detailItem.id,
        detailItem.tglasli,
        detailItem.nik,
        detailItem.name
      );
    }
    // if (detailItem.countcompetitor !== null) {
    //   getSurveyHargaCompetitor(
    //     detailItem.id,
    //     detailItem.tglasli,
    //     detailItem.nik
    //   );
    // }
    if (detailItem.countqtysales !== null) {
      getQtySales(detailItem.qtysalesid);
    }
  }, []);

  const getQtySales = (props) => {
    // console.log("props schedule", props);
    const url = constants.loginServer + `/getdataqtysales?filter=${props}`;
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
      // console.log("Data schedule", foundschedule);
      setSurveyQtySales(foundschedule);
    });
  };

  // Render
  const getStock = (props) => {
    // console.log("props schedule", props);
    const url = constants.loginServer + `/getDataStock?filter=${props}`;
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
      // console.log("Data schedule", foundschedule);
      setSurveyStock(foundschedule);
    });
  };

  const getSurveyHarga = (customer, tgl, nik, name) => {
    // console.log("props schedule", props);
    const url =
      constants.loginServer +
      `/getDataSurveyHarga?customer=${0}&tgl=${moment(tgl).format(
        "YYYY-MM-DD"
      )}&nik=${nik}&name=${name}`;
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
      // console.log("Data survey harga", foundschedule);
      setSurveyDataHarga(foundschedule);
    });
  };

  const getSurveyHargaCompetitor = (customer, tgl, nik, name) => {
    // console.log("props schedule", props);
    const url =
      constants.loginServer +
      `/getdatasurveyhargacompetitor?customer=${0}&tgl=${moment(tgl).format(
        "YYYY-MM-DD"
      )}&nik=${nik}&name=${name}`;
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
      // console.log("Data survey harga", foundschedule);
      setSurveyCompetitor(foundschedule);
    });
  };

  const getReturn = (props) => {
    // console.log("props schedule", props);
    const url = constants.loginServer + `/getDataReturn?filter=${props}`;
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
      // console.log("Data schedule", foundschedule);
      setReturData(foundschedule);
    });
  };

  const getSo = (props) => {
    // console.log("props schedule", props);
    const url = constants.loginServer + `/getDataSo?filter=${props}`;
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
      // console.log("Data schedule", foundschedule);
      setSoData(foundschedule);
    });
  };

  function renderHeader() {
    return (
      <Header
        title="Detail Dashboard"
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

  function renderDetails() {
    return (
      <View
        style={{
          marginTop: SIZES.radius,
          marginBottom: SIZES.padding,
          paddingHorizontal: SIZES.padding,
        }}
      >
        <LineDivider />
        {/*  Info */}
        <View
          style={{
            marginTop: SIZES.padding,
          }}
        >
          {/* Name & Description */}
          <Text style={{ ...FONTS.h2 }}>{detailItem?.name}</Text>
          <Text
            style={{
              marginTop: SIZES.base,
              color: COLORS.darkGray,
              textAlign: "justify",
              ...FONTS.body3,
            }}
          >
            Tanggal : {detailItem.tglin}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                marginTop: SIZES.base,
                color: COLORS.darkGray,
                textAlign: "justify",
                ...FONTS.body4,
              }}
            >
              Check in : {detailItem.timein == null ? "-" : detailItem.timein}
            </Text>
            <View style={{ width: 15 }} />
            <Text
              style={{
                marginTop: SIZES.base,
                color: COLORS.darkGray,
                textAlign: "justify",
                ...FONTS.body4,
              }}
            >
              Check out : {detailItem.timeot == null ? "-" : detailItem.timeot}
            </Text>
          </View>
          <LineDivider />
        </View>
        {/* Card */}
        <View
          style={{
            height: 220,
            borderRadius: 15,
            backgroundColor: COLORS.lightGray2,
            marginTop: 20,
          }}
        >
          {/* CI & CO */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: SIZES.base,
              paddingHorizontal: SIZES.radius,
            }}
          >
            {/* header  */}
            <View style={{ flexDirection: "row" }}>
              <Image
                source={icons.focus}
                style={{
                  height: 20,
                  width: 20,
                }}
              />
              <Text
                style={{
                  color: COLORS.darkGray2,
                  ...FONTS.body4,
                  marginLeft: 5,
                }}
              >
                Foto CI & CO(kalau dibawah 5 menit kunjungan)
              </Text>
            </View>
          </View>
          {/*  Image */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <Image
              key={fotoIn + Math.floor(Math.random() * 100) + 1}
              source={
                detailItem.cico_fotoin == null
                  ? images.standar
                  : { uri: fotoIn }
              }
              style={{
                resizeMode: "contain",
                height: 170,
                width: "100%",
              }}
            />
            <Image
              key={fotoOut + Math.floor(Math.random() * 100) + 2}
              source={
                detailItem.cico_fotoout == null
                  ? images.standar
                  : { uri: fotoOut }
              }
              style={{
                resizeMode: "contain",
                height: 170,
                width: "100%",
              }}
            />
          </View>
        </View>
        {/* Card */}
        <View
          style={{
            height: 220,
            borderRadius: 15,
            backgroundColor: COLORS.lightGray2,
            marginTop: 20,
          }}
        >
          {/* before & after */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: SIZES.base,
              paddingHorizontal: SIZES.radius,
            }}
          >
            {/* header  */}
            <View style={{ flexDirection: "row" }}>
              <Image
                source={icons.focus}
                style={{
                  height: 20,
                  width: 20,
                }}
              />
              <Text
                style={{
                  color: COLORS.darkGray2,
                  ...FONTS.body4,
                  marginLeft: 5,
                }}
              >
                Display Sebelum & sesudah
              </Text>
            </View>
          </View>
          {/*  Image */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <Image
              key={displayBefore + Math.floor(Math.random() * 100) + 1}
              source={
                detailItem.dimageb == null
                  ? images.standar
                  : { uri: displayBefore }
              }
              style={{
                resizeMode: "contain",
                height: 170,
                width: "100%",
              }}
            />
            <Image
              key={displayAfter + Math.floor(Math.random() * 100) + 2}
              source={
                detailItem.dimagea == null
                  ? images.standar
                  : { uri: displayAfter }
              }
              style={{
                resizeMode: "contain",
                height: 170,
                width: "100%",
              }}
            />
          </View>
        </View>
        {/* Card */}
        <View
          style={{
            height: 220,
            borderRadius: 15,
            backgroundColor: COLORS.lightGray2,
            marginTop: 20,
          }}
        >
          {/* before & after */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: SIZES.base,
              paddingHorizontal: SIZES.radius,
            }}
          >
            {/* header  */}
            <View style={{ flexDirection: "row" }}>
              <Image
                source={icons.focus}
                style={{
                  height: 20,
                  width: 20,
                }}
              />
              <Text
                style={{
                  color: COLORS.darkGray2,
                  ...FONTS.body4,
                  marginLeft: 5,
                }}
              >
                Shelving :{" "}
                {detailItem.sfshelvings == null || detailItem.sfshelvings <= 0
                  ? " - "
                  : detailItem.sfshelvings}{" "}
                of{" "}
                {detailItem.sfshelvinge == null || detailItem.sfshelvinge <= 0
                  ? " - "
                  : detailItem.sfshelvinge}
              </Text>
              <Text
                style={{
                  color: COLORS.darkGray2,
                  ...FONTS.body4,
                  marginLeft: 5,
                }}
              >
                <View style={{ width: 15 }} />
                Floor :{" "}
                {detailItem.sffloors == null || detailItem.sffloors <= 0
                  ? " - "
                  : detailItem.sffloors}{" "}
                of{" "}
                {detailItem.sffloore == null || detailItem.sffloore <= 0
                  ? " - "
                  : detailItem.sffloore}
              </Text>
            </View>
          </View>
          {/* Food Image */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Image
              source={
                detailItem.sfimage == null
                  ? images.standar
                  : { uri: constants.loginServer + detailItem.sfimage }
              }
              style={{
                resizeMode: "contain",
                height: 170,
                width: "100%",
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  // console.log("tes", detailItem.sffloors <= 0 ? "a" : "b");
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      {/* Header */}
      {renderHeader()}

      <ScrollView style={{ flex: 1 }}>
        {/* Details */}
        {renderDetails()}

        <LineDivider />

        {/* Restaurant */}
        {/* {renderRestaurant()} */}

        {/* Footer */}
        {/* <LineDivider />

        {renderFooter()} */}
        <View>
          {returData !== "" && (
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Data Retur
            </Text>
          )}

          {returData !== "" &&
            returData.map((item) => (
              <ListItem
                key={item.prodid}
                prodid={item.prodid}
                product={item.product}
                qty={item.qty}
                alasan={item.reason}
                unit={item.unit}
              />
            ))}
        </View>
        <LineDivider />
        <View>
          {soData !== "" && (
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Data SO
            </Text>
          )}

          {soData !== "" &&
            soData.map((item) => (
              <ListItem
                key={item.prodid}
                prodid={item.prodid}
                product={item.productname}
                qty={item.qty}
                unit={item.unit}
              />
            ))}
        </View>
        <LineDivider />
        <View>
          {surveyDataHarga !== "" && (
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Data Survey Harga
            </Text>
          )}

          {surveyDataHarga !== "" &&
            surveyDataHarga.map((item) => (
              <ListItem
                key={item.prodid}
                prodid={item.prodid}
                product={item.productname}
                qty={item.qty}
                unit={item.unit}
                tglactual={item.tglactual}
              />
            ))}
        </View>
        <LineDivider />
        <View>
          {surveyStock !== "" && (
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Data Survey Stock
            </Text>
          )}

          {surveyStock !== "" &&
            surveyStock.map((item) => (
              <ListItem
                key={item.prodid}
                prodid={item.prodid}
                product={item.productname}
                qty={item.qty}
                unit={item.unit}
              />
            ))}
        </View>
        <LineDivider />
        <View>
          {surveyCompetitor !== "" && (
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Data Survey Harga Competitor
            </Text>
          )}

          {surveyCompetitor !== "" &&
            surveyCompetitor.map((item) => (
              <ListItem
                key={item.prodid}
                prodid={item.prodid}
                product={item.productname}
                qty={item.qty}
                unit={item.unit}
                tglactual={item.tglactual}
              />
            ))}
        </View>
        <LineDivider />
        <View>
          {surveyQtySales !== "" && (
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Data Survey Qty Sales
            </Text>
          )}

          {surveyQtySales !== "" &&
            surveyQtySales.map((item) => (
              <ListItem
                key={item.prodid}
                prodid={item.prodid}
                product={item.productname}
                qty={item.qty}
                unit={item.unit}
                tglactual={item.tglactual}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardDetail;
