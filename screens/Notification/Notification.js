import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, SectionList, Text } from "react-native";

import { connect } from "react-redux";

import { NotificationCard } from "../../components";
import { constants, COLORS, SIZES, FONTS, images } from "../../constants";
import { GetDataLocal } from "../../utils";
import axios from "axios";
import moment from "moment";
import { setSelectedTab } from "../../stores/tab/tabActions";

const Notification = (props) => {
  const [dataAbsensi, setDataAbsensi] = useState([]);

  useEffect(() => {
    if (props.selectedTab === "Notification") {
      GetDataLocal("user").then((res) => {
        if (res != "") {
          const data = res;
          fetchdata2(data.id);
          // console.log("data absen", dataAbsensi);
        }
      });
    }
  }, [props.selectedTab]);

  const fetchdata2 = async (nik) => {
    // console.log("nik", nik);
    await axios
      .get(constants.inhouseServer + `getbakneedrevision?userid=${nik}`)
      .then((response) => {
        let countdata = response.data.result.length;
        console.log("absensi", countdata);

        let data = [];
        for (var i = 0; i < countdata; i++) {
          data.push({
            id:
              response.data.result[i].nik.toString() +
              response.data.result[i].date.toString(),
            image: images.absen,
            nik: response.data.result[i].nik,
            title: moment(response.data.result[i].date).format("DD-MM-yyyy"),
            desc:
              response.data.result[i].actual_start_time != null
                ? moment(response.data.result[i].actual_start_time).format(
                    "hh:mm:ss"
                  )
                : "",
            desc2:
              response.data.result[i].actual_end_time != null
                ? moment(response.data.result[i].actual_start_time).format(
                    "hh:mm:ss"
                  )
                : "",
            duration:
              response.data.result[i].rev_ci_type != null
                ? "Tidak Absen In"
                : "",
            duration2:
              response.data.result[i].rev_co_type != null
                ? "Tidak Absen Out"
                : "",
          });
        }
        let a = [
          {
            title:
              data.length > 0
                ? "Absen yang perlu di perbaiki"
                : "Tidak ada absen yang perlu di perbaiki",
            data,
          },
        ];
        // console.log("data final", a[0].data);
        setDataAbsensi(a);
      });
  };

  function renderNotifications() {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <SectionList
          sections={dataAbsensi}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          style={{
            marginBottom: 200,
            paddingHorizontal: SIZES.padding,
          }}
          renderItem={({ item }) => (
            <NotificationCard notificationItem={item} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                marginTop: SIZES.radius,
                marginBottom: SIZES.base,
              }}
            >
              <Text
                style={{
                  ...FONTS.body3,
                }}
              >
                {title}
              </Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      {renderNotifications()}
    </View>
  );
};

function mapStateToProps(state) {
  return {
    selectedTab: state.tabReducer.selectedTab,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSelectedTab: (selectedTab) => {
      return dispatch(setSelectedTab(selectedTab));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
