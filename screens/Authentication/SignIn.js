import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { showMessage } from "react-native-flash-message";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";

import { FONTS, SIZES, COLORS, icons, constants } from "../../constants";
import AuthLayout from "./AuthLayout";
import {
  CustomSwitch,
  FormInput,
  TextButton,
  TextIconButton,
} from "../../components";

import { utils } from "../../utils";

const SignIn = ({ navigation }) => {
  const [nik, setNik] = React.useState("");
  const [nikError, setNikError] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = useState(false);

  function isEnableSignIn() {
    return nik != "" && password != "";
  }

  const login = async () => {
    setLoading(true);

    const response = await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getSalesInfo",
            DataRow: {
              field: [
                {
                  "@column": "nik",
                  val: nik,
                },
                {
                  "@column": "Password",
                  val: password,
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
    );
    console.log(
      "login response status",
      response.data.WindowTabData.DataSet.DataRow
    );

    if (response.status == 200) {
      if (response.data.WindowTabData.RowCount > 0) {
        const message = "SUKSES";
        const data = {
          fullname: response.data.WindowTabData.DataSet.DataRow.field[1].val,
          salesrep: response.data.WindowTabData.DataSet.DataRow.field[3].val,
          id: response.data.WindowTabData.DataSet.DataRow.field[2].val,
          org: response.data.WindowTabData.DataSet.DataRow.field[0].val,
          whid: response.data.WindowTabData.DataSet.DataRow.field[4].val,
          pass: response.data.WindowTabData.DataSet.DataRow.field[5].val,
          region: response.data.WindowTabData.DataSet.DataRow.field[6].val,
          jobid: response.data.WindowTabData.DataSet.DataRow.field[8].val,
          jobtitle: response.data.WindowTabData.DataSet.DataRow.field[9].val,
        };
        // console.log("data simpan", data);
        persistLogin({ ...data }, message, response.status);
        navigation.replace("Home");
      } else {
        setLoading(false);
        alert("Nik atau Password Salah");
      }
    } else if (response.status == 400) {
      alert("Wrong username or password");
      setLoading(false);
    } else {
      alert("An error has occured. Check your connection and try again");
      setLoading(false);
    }
  };

  const persistLogin = (credentials, message, status) => {
    AsyncStorage.setItem("user", JSON.stringify(credentials))
      .then(() => {
        console.log("persist Login :", credentials);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <AuthLayout
      title="Sales Informasi Sistem"
      subtitle="Selamat datang, mohon login"
      version={"Versi " + Constants.manifest.version}
    >
      <View
        style={{
          flex: 1,
          marginTop: SIZES.height > 800 ? SIZES.padding * 2 : SIZES.radius,
        }}
      >
        {/* Form Inputs */}
        <FormInput
          label="Nik"
          autoCompleteType="characters"
          value={nik}
          onChange={(value) => {
            setNik(value);
          }}
          errorMsg={nikError}
          appendComponent={
            <View
              style={{
                justifyContent: "center",
              }}
            >
              <Image
                source={
                  nik == "" || (nik != "" && nikError == "")
                    ? icons.correct
                    : icons.cancel
                }
                style={{
                  height: 20,
                  width: 20,
                  tintColor:
                    nik == ""
                      ? COLORS.gray
                      : nik != "" && nikError == ""
                      ? COLORS.green
                      : COLORS.red,
                }}
              />
            </View>
          }
        />

        <FormInput
          label="Password"
          secureTextEntry={!showPass}
          autoCompleteType="password"
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          value={password}
          onChange={(value) => setPassword(value)}
          appendComponent={
            <TouchableOpacity
              style={{
                width: 40,
                alignItems: "flex-end",
                justifyContent: "center",
              }}
              onPress={() => setShowPass(!showPass)}
            >
              <Image
                source={showPass ? icons.eye_close : icons.eye}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: COLORS.gray,
                }}
              />
            </TouchableOpacity>
          }
        />

        {/* Sign In & Sign Up */}
        <TextButton
          label="Masuk"
          disabled={isEnableSignIn() ? false : true}
          buttonContainerStyle={{
            height: 55,
            alignItems: "center",
            marginTop: SIZES.padding,
            borderRadius: SIZES.radius,
            backgroundColor: isEnableSignIn()
              ? COLORS.primary
              : COLORS.transparentPrimary,
          }}
          onPress={login}
        />
      </View>
      {/* Footer */}
      <View>
        <TextIconButton
          containerStyle={{
            height: 50,
            alignItems: "center",
            marginTop: SIZES.radius,
            borderRadius: SIZES.radius,
            backgroundColor: COLORS.white,
          }}
          icon={icons.sep}
          iconPosition="LEFT"
          iconStyle={{
            height: 40,
            width: 40,
            tintColor: null,
          }}
          label="Copyright of IT SEP "
          labelStyle={{
            marginLeft: SIZES.radius,
          }}
        />
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ fontSize: 20, color: "white" }}>Mohon Tunggu...</Text>
        </View>
      )}
    </AuthLayout>
  );
};

export default SignIn;

const styles = StyleSheet.create({
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
});
