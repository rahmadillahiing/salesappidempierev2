import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as Location from "expo-location";
import RadioGroup from "react-native-radio-buttons-group";

import { Camera } from "expo-camera";
// import * as ImageManipulator from "expo-image-manipulator";
import moment from "moment";
import Checkbox from "expo-checkbox";
import axios from "axios";

import {
  Header,
  IconButton,
  TextButton,
  FormInput,
  FormDateInput,
  FormPicker,
  TextIconButton,
} from "../../components";

import { COLORS, SIZES, FONTS, icons, constants } from "../../constants";
import { GetDataLocal, NumberFormat } from "../../utils";

const CustomerSurvey = ({ navigation }) => {
  const [dataTempatUsaha, setDataTempatUsaha] = useState([]);
  const [dataKepemilikan, setDatakepemilikan] = useState([]);
  const [dataKaryawan, setDataKaryawan] = useState([]);
  const [dataPembayaran, setDataPembayaran] = useState([]);
  const [dataChannel, setDataChannel] = useState([]);
  const [dataTerm, setDataTerm] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [profile, setProfile] = useState(null);
  const [image, setImage] = useState(null);
  const [tokoImage, setTokoImage] = useState(null);
  const [tokoImage2, setTokoImage2] = useState(null);
  const [tokoImage3, setTokoImage3] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const cameraRef = useRef(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  const [isChecked, setChecked] = useState(false);
  const [npwp, setNpwp] = useState("");
  const [npwpName, setNpwpName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [companyTitle, setcompanyTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [ktpName, setKtpName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [custNo, setCustNo] = useState("");
  const [dob, setDob] = useState(null);
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState(null);
  const [addr, setAddr] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [city, setCity] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [addrInv, setAddrInv] = useState("");
  const [provinsiInv, setProvinsiInv] = useState("");
  const [cityInv, setCityInv] = useState("");
  const [kecamatanInv, setKecamatanInv] = useState("");
  const [kelurahanInv, setKelurahanInv] = useState("");
  const [dataProvInv, setDataProvInv] = useState([]);
  const [dataCityInv, setDataCityInv] = useState([]);
  const [dataKecamatanInv, setDataKecamatanInv] = useState([]);
  const [dataKelurahanInv, setDataKelurahanInv] = useState([]);

  const [cp, setCp] = useState("");
  const [phoneNoCp, setPhoneNoCp] = useState("");
  const [tempatUsaha, setTempatUsaha] = useState("");
  const [kepemilikan, setKepemilikan] = useState("");
  const [jumlahKaryawan, setJumlahKaryawan] = useState("");
  const [omset, setOmset] = useState("0");
  const [caraBayar, setCaraBayar] = useState("");
  const [creditLimit, setCreditLimit] = useState("0");
  const [custType, setCustType] = useState("");
  const [channelType, setChannelType] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [cpPenagihan, setCpPenagihan] = useState("");
  const [phoneNoCpPenagihan, setPhoneNoCpPenagihan] = useState("");
  const [termPayment, setTermPayment] = useState("");
  const [usahaStart, setUsahaStart] = useState(null);
  const [dataProv, setDataProv] = useState([]);
  const [dataCity, setDataCity] = useState([]);
  const [dataKecamatan, setDataKecamatan] = useState([]);
  const [dataKelurahan, setDataKelurahan] = useState([]);
  const [dataCustType, setDataCustType] = useState([]);
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
    "Wait, we are fetching you location..."
  );

  useEffect(() => {
    // clearData();
    getTerm();
    getTempatUsaha();
    getKepemilikan();
    getKaryawan();
    getPembayaran();

    getUser();
    getNewLocation();
    getProvinsi();
    custTypeToko();
    custChannel();
  }, []);

  useEffect(() => {
    if (provinsi !== "") {
      setCity("");
      setKecamatan("");
      setKelurahan("");

      setDataCity([]);
      setDataKecamatan([]);
      setDataKelurahan([]);
      getCity();
    }
  }, [provinsi]);

  useEffect(() => {
    if (provinsiInv !== "") {
      setCityInv("");
      setKecamatanInv("");
      setKelurahanInv("");

      setDataCityInv([]);
      setDataKecamatanInv([]);
      setDataKelurahanInv([]);
      getCityInv();
    }
  }, [provinsiInv]);

  useEffect(() => {
    if (city !== "") {
      setKecamatan("");
      setKelurahan("");

      setDataKecamatan([]);
      setDataKelurahan([]);
      getKecamatan();
    }
  }, [city]);

  useEffect(() => {
    if (cityInv !== "") {
      setKecamatanInv("");
      setKelurahanInv("");

      setDataKecamatanInv([]);
      setDataKelurahanInv([]);
      getKecamatanInv();
    }
  }, [cityInv]);

  useEffect(() => {
    if (kecamatan !== "") {
      setKelurahan("");
      setDataKelurahan([]);

      getKelurahan();
    }
  }, [kecamatan]);

  useEffect(() => {
    if (kecamatanInv !== "") {
      setKelurahanInv("");
      setDataKelurahanInv([]);

      getKelurahanInv();
    }
  }, [kecamatanInv]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const clearData = () => {
    setIdCard("");
    setcompanyTitle("");
    setCompanyName("");
    setFullName("");
    setKtpName("");
    setCustNo("");
    setPhoneNo("");
    setDob(null);
    setGender("");
    setEmail("");
    setAddr("");
    setProvinsi("");
    setCity("");
    setKecamatan("");
    setKelurahan("");
    setCustType("");
    setLatitude(null);
    setLongitude(null);
    setImage(null);
    setTokoImage(null);
    setTokoImage2(null);
    setTokoImage3(null);
    setNpwp("");
    setNpwpName("");
    setProvinsiInv("");
    setCityInv("");
    setKecamatanInv("");
    setKelurahanInv("");
    setTempatUsaha("");
    setChecked(false);
    setCp("");
    setPhoneNoCp("");
    setKepemilikan("");
    setJumlahKaryawan("");
    setOmset("0");
    setCreditLimit("0");
    setTermPayment("");
    setUsahaStart(null);
    setCpPenagihan("");
    setPhoneNoCpPenagihan("");
    setCaraBayar("");
  };

  const getTempatUsaha = () => {
    let dataTempatUsaha = [];
    const count = constants.tempatUsaha.length;

    for (var i = 0; i < count; i++) {
      dataTempatUsaha.push({
        id: constants.tempatUsaha[i].id,
        label: constants.tempatUsaha[i].label,
        value: constants.tempatUsaha[i].value,
      });
    }
    setDataTempatUsaha(dataTempatUsaha);
  };

  const getKepemilikan = () => {
    let dataKepemilikan = [];
    const count = constants.kepemilikanusaha.length;

    for (var i = 0; i < count; i++) {
      dataKepemilikan.push({
        id: constants.kepemilikanusaha[i].id,
        label: constants.kepemilikanusaha[i].label,
        value: constants.kepemilikanusaha[i].value,
      });
    }
    setDatakepemilikan(dataKepemilikan);
  };

  const getKaryawan = () => {
    let dataKaryawan = [];
    const count = constants.jumlahkaryawan.length;

    for (var i = 0; i < count; i++) {
      dataKaryawan.push({
        id: constants.jumlahkaryawan[i].id,
        label: constants.jumlahkaryawan[i].label,
        value: constants.jumlahkaryawan[i].value,
      });
    }
    setDataKaryawan(dataKaryawan);
  };

  const getPembayaran = () => {
    let dataPembayaran = [];
    const count = constants.carabayar.length;

    for (var i = 0; i < count; i++) {
      dataPembayaran.push({
        id: constants.carabayar[i].id,
        label: constants.carabayar[i].label,
        value: constants.carabayar[i].value,
      });
    }
    setDataPembayaran(dataPembayaran);
  };

  const getUser = () => {
    GetDataLocal("user").then((res) => {
      const data = res;
      // console.log("profile", data);
      setProfile(data);
    });
  };

  const getNewLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    // console.log("status", status);
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    });
    setLatitude(JSON.stringify(coords.latitude));
    setLongitude(JSON.stringify(coords.longitude));

    if (coords) {
      const { latitude, longitude } = coords;

      let lokasi = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      // console.log("lokasi", lokasi);

      for (let item of lokasi) {
        let address = `${item.district}, ${item.city}, ${item.region}, ${item.postalCode}`;

        setDisplayCurrentAddress(address);
      }
    }
  };

  const custTypeToko = async () => {
    const response = await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getPartnerGroup",
            DataRow: {
              field: [
                {
                  "@column": "IsCustomer_bpgroup",
                  val: "Y",
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

    // console.log("response", response.data.WindowTabData.Success);
    if (!response.data.WindowTabData.Success === true) {
      // get error message from body or default to response status
      // const error = (data && data.message) || response.status;
      // return Promise.reject(error);
      console.log("error getting BP");
      return;
    }

    const count = response.data.WindowTabData.RowCount;
    let datatypetoko = [];

    for (var i = 0; i < count; i++) {
      datatypetoko.push({
        id: response.data.WindowTabData.DataSet.DataRow[i].field[0].val,
        label:
          response.data.WindowTabData.DataSet.DataRow[
            i
          ].field[1].val.toString(),
        value: response.data.WindowTabData.DataSet.DataRow[i].field[0].val,
      });
    }
    // console.log("type toko :", datatypetoko);
    setDataCustType(datatypetoko);

    //   let datatypetoko = [];
    //   const count = foundtypetoko.length;

    //   for (var i = 0; i < count; i++) {
    //     datatypetoko.push({
    //       id: foundtypetoko[i].id,
    //       label: foundtypetoko[i].label.toString(),
    //       value: foundtypetoko[i].value,
    //     });
    //   }
    //   // console.log("API kecamatan :", dataKel);
    //   setDataCustType(datatypetoko);
  };

  const custChannel = async () => {
    const response = await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getChannelBP",
            DataRow: {
              field: [
                {
                  "@column": "IsActive",
                  val: "Y",
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

    // console.log("response", response.data.WindowTabData.Success);
    if (!response.data.WindowTabData.Success === true) {
      // get error message from body or default to response status
      // const error = (data && data.message) || response.status;
      // return Promise.reject(error);
      console.log("error getting Channel");
      return;
    }

    const count = response.data.WindowTabData.RowCount;
    let datachannel = [];

    for (var i = 0; i < count; i++) {
      datachannel.push({
        id: response.data.WindowTabData.DataSet.DataRow[i].field[2].val,
        label:
          response.data.WindowTabData.DataSet.DataRow[
            i
          ].field[3].val.toString(),
        value: response.data.WindowTabData.DataSet.DataRow[i].field[3].val,
      });
    }
    // console.log("data channel", datachannel);
    setDataChannel(datachannel);
  };

  const getTerm = async () => {
    const response = await axios.post(
      constants.idempServerBpr +
        "ADInterface/services/rest/model_adservice/query_data",
      {
        ModelCRUDRequest: {
          ModelCRUD: {
            serviceType: "getPaymentTerm",
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

    // console.log("response", response.data.WindowTabData.Success);
    if (!response.data.WindowTabData.Success === true) {
      // get error message from body or default to response status
      // const error = (data && data.message) || response.status;
      // return Promise.reject(error);
      console.log("error getting Term");
      return;
    }

    const count = response.data.WindowTabData.RowCount;
    let dataTerm = [];

    for (var i = 0; i < count; i++) {
      dataTerm.push({
        id: response.data.WindowTabData.DataSet.DataRow[i].field[0].val,
        label:
          response.data.WindowTabData.DataSet.DataRow[
            i
          ].field[1].val.toString(),
        value: response.data.WindowTabData.DataSet.DataRow[i].field[1].val,
      });
    }
    console.log("data term", dataTerm);
    setDataTerm(dataTerm);
  };

  const getKelurahan = () => {
    const url =
      constants.loginServer +
      `/getkelurahan?filter=${kecamatan.id}&filter2=${city.id}&filter3=${provinsi.id}`;
    // console.log("url", url);
    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundKel = isJson && (await response.json());

      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }

      let dataKel = [];
      const count = foundKel.length;

      for (var i = 0; i < count; i++) {
        dataKel.push({
          id: foundKel[i].id,
          label: foundKel[i].label.toString(),
          value: foundKel[i].value,
        });
      }
      // console.log("API kecamatan :", dataKel);
      setDataKelurahan(dataKel);
    });
  };

  const getKelurahanInv = () => {
    const url =
      constants.loginServer +
      `/getkelurahan?filter=${kecamatanInv.id}&filter2=${cityInv.id}&filter3=${provinsiInv.id}`;
    // console.log("url", url);
    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundKel = isJson && (await response.json());

      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }

      let dataKel = [];
      const count = foundKel.length;

      for (var i = 0; i < count; i++) {
        dataKel.push({
          id: foundKel[i].id,
          label: foundKel[i].label.toString(),
          value: foundKel[i].value,
        });
      }
      // console.log("API kecamatan :", dataKel);
      setDataKelurahanInv(dataKel);
    });
  };

  const getKecamatan = () => {
    const url =
      constants.loginServer +
      `/getkecamatan?filter=${city.id}&filter2=${provinsi.id}`;
    // console.log("url", url);
    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundKec = isJson && (await response.json());
      // console.log("kecamatan ketemu", foundKec);
      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }

      let dataKec = [];
      const count = foundKec.length;

      for (var i = 0; i < count; i++) {
        dataKec.push({
          id: foundKec[i].id,
          label: foundKec[i].label.toString(),
          value: foundKec[i].value,
        });
      }
      // console.log("API kecamatan :", dataKec);
      setDataKecamatan(dataKec);
    });
  };

  const getKecamatanInv = () => {
    const url =
      constants.loginServer +
      `/getkecamatan?filter=${cityInv.id}&filter2=${provinsiInv.id}`;
    // console.log("url", url);
    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundKec = isJson && (await response.json());
      // console.log("kecamatan ketemu", foundKec);
      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }

      let dataKec = [];
      const count = foundKec.length;

      for (var i = 0; i < count; i++) {
        dataKec.push({
          id: foundKec[i].id,
          label: foundKec[i].label.toString(),
          value: foundKec[i].value,
        });
      }
      // console.log("API kecamatan :", dataKec);
      setDataKecamatanInv(dataKec);
    });
  };

  const getCity = () => {
    const url = constants.loginServer + `/getcity?filter=${provinsi.id}`;

    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundCity = isJson && (await response.json());

      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }

      let dataCity = [];
      const count = foundCity.length;

      for (var i = 0; i < count; i++) {
        dataCity.push({
          id: foundCity[i].id,
          label: foundCity[i].label.toString(),
          value: foundCity[i].value,
        });
      }
      setDataCity(dataCity);
    });
  };

  const getCityInv = () => {
    const url = constants.loginServer + `/getcity?filter=${provinsiInv.id}`;

    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundCity = isJson && (await response.json());

      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }

      let dataCity = [];
      const count = foundCity.length;

      for (var i = 0; i < count; i++) {
        dataCity.push({
          id: foundCity[i].id,
          label: foundCity[i].label.toString(),
          value: foundCity[i].value,
        });
      }
      setDataCityInv(dataCity);
    });
  };

  const getProvinsi = () => {
    const url = constants.loginServer + "/getprovinsi?filter=";

    fetch(url).then(async (response) => {
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      const foundProvince = isJson && (await response.json());

      if (!response.ok) {
        // get error message from body or default to response status
        // const error = (data && data.message) || response.status;
        // return Promise.reject(error);
        console.log("error");
        return;
      }

      // console.log("tes", foundProvince);
      // console.log("hitung",foundProvince.length);
      let dataProv = [];
      const count = foundProvince.length;

      for (var i = 0; i < count; i++) {
        dataProv.push({
          id: foundProvince[i].id,
          label: foundProvince[i].label.toString(),
          value: foundProvince[i].value,
        });
      }
      // console.log("provinsi", dataProv);
      setDataProv(dataProv);
      setDataProvInv(dataProv);
    });
  };

  const takePicture = async () => {
    if (cameraRef) {
      // console.log("in take picture");
      try {
        let photo = await cameraRef.current.takePictureAsync({
          skipProcessing: true,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        // let resizePhoto = await ImageManipulator.manipulateAsync(
        //   photo.uri,
        //   [
        //     {
        //       resize: { width: photo.width * 0.3, height: photo.height * 0.3 },
        //     },
        //   ],
        //   { compress: 1, format: "png", base64: false }
        // );
        // return resizePhoto;
        return photo;
      } catch (e) {
        console.log(e);
      }
    }
  };

  const simpanCustomer = () => {
    if (displayCurrentAddress === "Wait, we are fetching you location...") {
      Alert.alert(
        "Invalid Geo location",
        "Data Geotagging belum didapatkan, pastikan data sudah muncul terlebih dahulu sebelum melakukan check in"
      );
      return;
    }

    if (npwp === "" && idCard === "") {
      Alert.alert("Warning", "Isi salah satu antara No ktp atau NPWP");
      return;
    }

    if (custTypeToko === "") {
      Alert.alert("Warning", "Pilih Group customer terlebih dahulu");
      return;
    }

    if (channelType === "") {
      Alert.alert("Warning", "Pilih Type Channel terlebih dahulu");
      return;
    }

    if (companyTitle === "") {
      Alert.alert("Warning", "Pilih title perusahaan terlebih dahulu");
      return;
    }
    if (companyName === "") {
      Alert.alert("Warning", "Isi nama perusahaan terlebih dahulu");
      return;
    }
    if (fullName === "") {
      Alert.alert("Warning", "Isi nama pemilik terlebih dahulu");
      return;
    }
    if (phoneNo === "") {
      Alert.alert("Warning", "Isi No HP terlebih dahulu");
      return;
    }

    if (addr === "") {
      Alert.alert("Warning", "Isi alamat terlebih dahulu");
      return;
    }
    if (provinsi === "") {
      Alert.alert("Warning", "Pilih provinsi terlebih dahulu");
      return;
    }
    if (city === "") {
      Alert.alert("Warning", "Pilih kota terlebih dahulu");
      return;
    }
    if (kecamatan === "") {
      Alert.alert("Warning", "Pilih Kecamatan terlebih dahulu");
      return;
    }
    if (kelurahan === "") {
      Alert.alert("Warning", "Pilih kelurahan terlebih dahulu");
      return;
    }

    if (isChecked === false && addrInv === "") {
      Alert.alert("Warning", "Isi alamat penagihan terlebih dahulu");
      return;
    }
    if (isChecked === false && provinsiInv === "") {
      Alert.alert("Warning", "Pilih provinsi penagihan terlebih dahulu");
      return;
    }
    if (isChecked === false && cityInv === "") {
      Alert.alert("Warning", "Pilih kota penagihan terlebih dahulu");
      return;
    }
    if (isChecked === false && kecamatanInv === "") {
      Alert.alert("Warning", "Pilih Kecamatan penagihan terlebih dahulu");
      return;
    }
    if (isChecked === false && kelurahanInv === "") {
      Alert.alert("Warning", "Pilih kelurahan penagihan terlebih dahulu");
      return;
    }

    if (termPayment === "") {
      Alert.alert("Warning", "Pilih term of payment terlebih dahulu");
      return;
    }

    if (
      image === null ||
      tokoImage === null ||
      tokoImage2 === null ||
      tokoImage3 === null
    ) {
      Alert.alert(
        "Warning",
        "Anda harus mengambil 4 foto : ktp/npwp, tampak jalan, lokasi dan etalase"
      );
      return;
    }

    if (idCard !== "" && ktpName === "") {
      Alert.alert("Warning", "Nama Di KTP harus di isi");
      return;
    }

    if (npwp !== "" && npwpName === "") {
      Alert.alert("Warning", "Nama Di NPWP harus di isi");
      return;
    }

    Alert.alert(
      "Simpan Data",
      "Apakah anda ingin menyimpan data Customer baru ini?",
      [
        {
          text: "Yes",
          onPress: () => {
            // console.log(lokasi);
            setIsLoading(true);

            var data = new FormData();
            data.append("image", {
              uri: image,
              type: "image/jpg",
              name:
                companyName +
                "-" +
                provinsi.id +
                city.id +
                kecamatan.id +
                "-" +
                profile.id +
                "1.jpg",
            });

            var data2 = new FormData();
            data2.append("image", {
              uri: tokoImage,
              type: "image/jpg",
              name:
                companyName +
                "-" +
                provinsi.id +
                city.id +
                kecamatan.id +
                "-" +
                profile.id +
                "2.jpg",
            });

            var data3 = new FormData();
            data3.append("image", {
              uri: tokoImage2,
              type: "image/jpg",
              name:
                companyName +
                "-" +
                provinsi.id +
                city.id +
                kecamatan.id +
                "-" +
                profile.id +
                "3.jpg",
            });

            var data4 = new FormData();
            data4.append("image", {
              uri: tokoImage3,
              type: "image/jpg",
              name:
                companyName +
                "-" +
                provinsi.id +
                city.id +
                kecamatan.id +
                "-" +
                profile.id +
                "4.jpg",
            });

            const config = {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
              },
              body: data,
            };

            const config2 = {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
              },
              body: data2,
            };

            const config3 = {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
              },
              body: data3,
            };

            const config4 = {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
              },
              body: data4,
            };

            try {
              const response = fetch(
                constants.loginServer + "/uploads1",
                config
              ).then(async (response) => {
                const isJson = response.headers
                  .get("content-type")
                  ?.includes("application/json");
                const hasil1 = isJson && (await response.json());
                const pathSave = hasil1[0].path;
                console.log("save path 1", pathSave);
                if (pathSave !== "undefined") {
                  const response2 = fetch(
                    constants.loginServer + "/uploads1",
                    config2
                  ).then(async (response2) => {
                    const isJson2 = response2.headers
                      .get("content-type")
                      ?.includes("application/json");
                    const hasil2 = isJson2 && (await response2.json());
                    const pathSave2 = hasil2[0].path;
                    if (pathSave2 !== "undefined") {
                      const response3 = fetch(
                        constants.loginServer + "/uploads1",
                        config3
                      ).then(async (response3) => {
                        const isJson3 = response3.headers
                          .get("content-type")
                          ?.includes("application/json");
                        const hasil3 = isJson3 && (await response3.json());
                        const pathSave3 = hasil3[0].path;
                        if (pathSave3 !== "undefined") {
                          const response4 = fetch(
                            constants.loginServer + "/uploads1",
                            config4
                          ).then(async (response4) => {
                            const isJson4 = response4.headers
                              .get("content-type")
                              ?.includes("application/json");
                            const hasil4 = isJson4 && (await response4.json());
                            const pathSave4 = hasil4[0].path;
                            if (pathSave4 !== "undefined") {
                              let namafoto1 =
                                companyName +
                                "-" +
                                provinsi.id +
                                city.id +
                                kecamatan.id +
                                "-" +
                                profile.id +
                                "1.jpg";
                              let namafoto2 =
                                companyName +
                                "-" +
                                provinsi.id +
                                city.id +
                                kecamatan.id +
                                "-" +
                                profile.id +
                                "2.jpg";
                              let namafoto3 =
                                companyName +
                                "-" +
                                provinsi.id +
                                city.id +
                                kecamatan.id +
                                "-" +
                                profile.id +
                                "3.jpg";
                              let namafoto4 =
                                companyName +
                                "-" +
                                provinsi.id +
                                city.id +
                                kecamatan.id +
                                "-" +
                                profile.id +
                                "4.jpg";

                              const requestOptions = {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  channel: custType.id,
                                  title: companyTitle.label,
                                  company: companyName,
                                  addr: addr,
                                  provinsi: provinsi.id,
                                  kota: city.id,
                                  kecamatan: kecamatan.id,
                                  kelurahan: kelurahan.id,
                                  owner: fullName,
                                  gender: gender.label,
                                  dob:
                                    dob == null
                                      ? dob
                                      : moment(dob).format("YYYY-MM-DD"),
                                  email: email,
                                  hp: phoneNo,
                                  noid: idCard,
                                  namaktp: ktpName,
                                  nonpwp: npwp,
                                  namanpwp: npwpName,
                                  path1: pathSave,
                                  path2: pathSave2,
                                  path3: pathSave3,
                                  path4: pathSave4,
                                  foto1: namafoto1,
                                  foto2: namafoto2,
                                  foto3: namafoto3,
                                  foto4: namafoto4,
                                  nik: profile.id,
                                  longitude: longitude,
                                  latitude: latitude,
                                  addrinv: isChecked === true ? addr : addrInv,
                                  provinv:
                                    isChecked === true
                                      ? provinsi.id
                                      : provinsiInv.id,
                                  kotainv:
                                    isChecked === true ? city.id : cityInv.id,
                                  kecamataninv:
                                    isChecked === true
                                      ? kecamatan.id
                                      : kecamatanInv.id,
                                  kelurahaninv:
                                    isChecked === true
                                      ? kelurahan.id
                                      : kelurahanInv.id,
                                  cp: cp,
                                  cpnohp: phoneNoCpPenagihan,
                                  tempatusaha: tempatUsaha.value,
                                  kepemilikan: kepemilikan.value,
                                  mulaiusaha:
                                    usahaStart == null
                                      ? usahaStart
                                      : moment(usahaStart).format("YYYY-MM-DD"),
                                  jumlahkaryawan: jumlahKaryawan.value,
                                  omset: Number.parseFloat(
                                    omset.replace(/,/g, "")
                                  ),
                                  creditlimit: Number.parseFloat(
                                    creditLimit.replace(/,/g, "")
                                  ),
                                  top: termPayment.value,
                                  payment: caraBayar.value,
                                  cppenagihan: cpPenagihan,
                                  cppenagihanhp: phoneNoCpPenagihan,
                                  telpcust: custNo,
                                  channel2: channelType.id,
                                }),
                              };
                              console.log("new customer", requestOptions);
                              const url =
                                constants.loginServer + "/insertnewcustomer ";
                              fetch(url, requestOptions).then(
                                async (response) => {
                                  const isJson = response.headers
                                    .get("content-type")
                                    ?.includes("application/json");
                                  const hasil1 =
                                    isJson && (await response.json());
                                  if (!response.ok) {
                                    setIsLoading(false);
                                    Alert.alert("Data Invalid", "Hubungi IT", [
                                      { text: "Okay" },
                                    ]);
                                    return;
                                  } else {
                                    setIsLoading(false);
                                    // console.log("data tersimpan :", hasil1);
                                    Alert.alert(
                                      "Sukses",
                                      "Data telah tersimpan",
                                      [{ text: "Okay" }]
                                    );
                                    clearData();
                                  }
                                }
                              );
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            } catch {
              setIsLoading(false);
              (err) => console.log(err);
              return;
            }
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

  function renderHeader() {
    return (
      <Header
        title="Customer Baru"
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
        rightComponent={
          <View
            style={{
              width: 40,
            }}
          />
        }
      />
    );
  }

  function renderCamera() {
    return (
      <View
        style={{
          flex: 1,
          paddingVertical: SIZES.padding,
          paddingHorizontal: SIZES.radius,
          borderRadius: SIZES.radius,
          backgroundColor: COLORS.lightGray2,
        }}
      >
        <View style={{ flex: 1, marginTop: SIZES.radius }}>
          <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={{ flex: 9 }}></View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setUseCamera(false);
                }}
              >
                <Text style={styles.text}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button]}
                onPress={async () => {
                  // console.log("in take pic");
                  const r = await takePicture();
                  setUseCamera(false);
                  if (!r.cancelled) {
                    if (image == null) {
                      setImage(r.uri);
                    } else if (tokoImage == null) {
                      setTokoImage(r.uri);
                    } else if (tokoImage2 == null) {
                      setTokoImage2(r.uri);
                    } else if (tokoImage3 == null) {
                      setTokoImage3(r.uri);
                    } else {
                      Alert.alert(
                        "Anda sudah mengambil 4 foto, hapus salah satu foto untuk pengambilan ulang"
                      );
                      return;
                    }
                  }
                  // console.log("response", JSON.stringify(r.uri));
                }}
              >
                <Text style={styles.text}>PICTURE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setType(
                    type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  );
                }}
              >
                <Text style={styles.text}>Flip</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      </View>
    );
  }

  function autoFill(newValue) {
    if (newValue === true) {
      setAddrInv("");
      setProvinsiInv("");
      setCityInv("");
      setKecamatanInv("");
      setKelurahanInv("");

      // setAddrInv(addr);
      // setProvinsiInv(provinsi);
      // setDataCityInv(dataCity);
      // setCityInv(city);
      // // console.log("kota", city);
      // setDataKecamatanInv(dataKecamatanInv);
      // setKecamatanInv(kecamatan);
      // setDataKelurahanInv(dataKelurahan);
      // setKelurahanInv(kelurahan);
      // } else {
      //   // setAddrInv("");
      //   // setProvinsiInv("");
      //   // setCityInv("");
      //   // setKecamatanInv("");
      //   // setKelurahanInv("");
    }
  }

  function onPressRadioButton(radioButtonsArray) {
    let filteredResult = dataTempatUsaha.find((e) => e.id == radioButtonsArray);

    console.log("tempat usaha", filteredResult.value);
    setTempatUsaha(filteredResult);
  }

  function onRadioButtonOwnerPress(radioKepemilikanArray) {
    let filteredResult1 = dataKepemilikan.find(
      (e) => e.id === radioKepemilikanArray
    );
    console.log("tempat usaha", filteredResult1);
    setKepemilikan(filteredResult1);
  }

  function onRadioButtonKaryawanPress(radioKaryawanArray) {
    let filteredResult2 = dataKaryawan.find((e) => e.id === radioKaryawanArray);
    console.log("data karyawan", filteredResult2);
    setJumlahKaryawan(filteredResult2);
  }

  function onRadioButtonCaraBayarPress(radioCaraBayarArray) {
    let filteredResult3 = dataPembayaran.find(
      (e) => e.id === radioCaraBayarArray
    );
    console.log("cara bayar", filteredResult3);

    setCaraBayar(filteredResult3);
  }

  // const onRadioButtonPress = (text) => {
  //   // console.log("Clicked", itemIdx);
  //   console.log("text", text);
  //   setTempatUsaha(text);
  // };

  // const onRadioButtonOwnerPress = (text) => {
  //   setKepemilikan(text);
  //   // console.log("Clicked", itemIdx);
  //   // console.log("text", text);
  //   // setTempatUsaha(text);
  // };

  // const onRadioButtonKaryawanPress = (text) => {
  //   setJumlahKaryawan(text);
  //   // console.log("Clicked", itemIdx);
  //   // console.log("text", text);
  //   // setTempatUsaha(text);
  // };

  // const onRadioButtonCaraBayarPress = (text) => {
  //   setCaraBayar(text);
  //   // console.log("Clicked", itemIdx);
  //   // console.log("text", text);
  //   // setTempatUsaha(text);
  // };

  function renderForm() {
    return (
      <View
        style={{
          paddingVertical: SIZES.padding,
          paddingHorizontal: SIZES.radius,
          borderRadius: SIZES.radius,
          backgroundColor: COLORS.lightGray2,
        }}
      >
        <View style={{ marginTop: SIZES.radius }}>
          <Text style={{ color: COLORS.darkGray2, ...FONTS.h3 }}>
            Lokasi : {displayCurrentAddress}
          </Text>
        </View>

        {/* Jenis Toko */}
        <FormPicker
          label="Customer Group"
          placeholder="Pilih Customer Group"
          modalTitle="Pilih Customer Group"
          value={custType.label}
          setValue={setCustType}
          options={dataCustType}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Jenis Channel */}
        <FormPicker
          label="Customer Channel"
          placeholder="Pilih Customer Channel"
          modalTitle="Pilih Customer Channel"
          value={channelType.label}
          setValue={setChannelType}
          options={dataChannel}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
          modalStyle={{
            height: 700,
          }}
        />

        {/* Jenis Perusahaan */}
        <FormPicker
          label="Jenis Customer"
          placeholder="Pilih Jenis "
          modalTitle="Pilih Jenis Customer"
          value={companyTitle.value}
          setValue={setcompanyTitle}
          options={constants.jenisperusahaan}
          containerStyle={{
            marginTop: SIZES.radius,
            width: "60%",
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Company name */}
        <FormInput
          label="Nama Customer"
          autoCapitalize="characters"
          value={companyName}
          onChange={(value) => {
            setCompanyName(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* No telp customer */}
        <FormInput
          label="Nomor Telp"
          keyboardType="numeric"
          value={custNo}
          onChange={(value) => {
            setCustNo(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Name owner*/}
        <FormInput
          label="Nama Pemilik"
          autoCapitalize="characters"
          value={fullName}
          onChange={(value) => {
            setFullName(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Gender */}
        <FormPicker
          label="Gender"
          placeholder="Select gender"
          modalTitle="Select Gender"
          value={gender.label}
          setValue={setGender}
          options={constants.kelamin}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />
        {/* D.O.B */}
        <FormDateInput
          label="Tanggal Lahir"
          placeholder="DD/MM/YYYY"
          value={dob}
          setDate={setDob}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* HP Number */}
        <FormInput
          label="Nomor HP"
          keyboardType="numeric"
          value={phoneNo}
          onChange={(value) => {
            setPhoneNo(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* KTP */}
        <FormInput
          keyboardType="numeric"
          label="Nomor KTP"
          value={idCard}
          onChange={(value) => {
            setIdCard(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />
        {/* Nama KTP */}
        <FormInput
          label="Nama Sesuai KTP"
          autoCapitalize="characters"
          value={ktpName}
          onChange={(value) => {
            setKtpName(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />
        {/* NPWP */}
        <FormInput
          keyboardType="numeric"
          label="Nomor NPWP"
          value={npwp}
          onChange={(value) => {
            setNpwp(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />
        {/* Nama npwp */}
        <FormInput
          label="Nama tercetak di NPWP"
          autoCapitalize="characters"
          value={npwpName}
          onChange={(value) => {
            setNpwpName(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Email */}
        <FormInput
          label="Email"
          autoCapitalize="characters"
          keyboardType="email-address"
          autoCompleteType="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Address */}
        <FormInput
          label="Alamat"
          autoCapitalize="characters"
          value={addr}
          onChange={(value) => {
            setAddr(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />
        {/* Provinsi */}
        <FormPicker
          label="Provinsi"
          placeholder="Pilih Provinsi"
          modalTitle="Pilih Provinsi"
          value={provinsi.label}
          setValue={setProvinsi}
          options={dataProv}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        {/* City */}
        <FormPicker
          label="Kota"
          placeholder="Pilih Kota"
          modalTitle="Pilih Kota"
          value={city.label}
          setValue={setCity}
          options={dataCity}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        {/* Kecamatan */}
        <FormPicker
          label="Kecamatan"
          placeholder="Pilih Kecamatan"
          modalTitle="Pilih Kecamatan"
          value={kecamatan.label}
          setValue={setKecamatan}
          options={dataKecamatan}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        {/* Kelurahan */}
        <FormPicker
          label="Kelurahan"
          placeholder="Pilih Kelurahan"
          modalTitle="Pilih Kelurahan"
          value={kelurahan.label}
          setValue={setKelurahan}
          options={dataKelurahan}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        <View style={styles.section}>
          <Checkbox
            style={styles.checkbox}
            value={isChecked}
            onValueChange={(newValue) => {
              setChecked(newValue);
              autoFill(newValue);
              // console.log("value", newValue);
            }}
            color={isChecked ? "#4630EB" : undefined}
          />
          <Text style={styles.paragraph}>
            Alamat penagihan Sama dengan diatas
          </Text>
        </View>

        {/* Address inv */}
        <FormInput
          editable={!isChecked}
          autoCapitalize="characters"
          label="Alamat Penagihan"
          value={addrInv}
          onChange={(value) => {
            setAddrInv(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: !isChecked ? COLORS.white : COLORS.darkGray2,
          }}
        />
        {/* Provinsi inv*/}
        <FormPicker
          disabled={isChecked}
          label="Provinsi penagihan"
          placeholder="Pilih Provinsi"
          modalTitle="Pilih Provinsi"
          value={provinsiInv.label}
          setValue={setProvinsiInv}
          options={dataProv}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: !isChecked ? COLORS.white : COLORS.darkGray2,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        {/* City inv*/}
        <FormPicker
          disabled={isChecked}
          label="Kota penagihan"
          placeholder="Pilih Kota"
          modalTitle="Pilih Kota"
          value={cityInv.label}
          setValue={setCityInv}
          options={dataCityInv}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: !isChecked ? COLORS.white : COLORS.darkGray2,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        {/* Kecamatan inv*/}
        <FormPicker
          disabled={isChecked}
          label="Kecamatan penagihan"
          placeholder="Pilih Kecamatan"
          modalTitle="Pilih Kecamatan"
          value={kecamatanInv.label}
          setValue={setKecamatanInv}
          options={dataKecamatanInv}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: !isChecked ? COLORS.white : COLORS.darkGray2,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        {/* Kelurahan inv*/}
        <FormPicker
          disabled={isChecked}
          label="Kelurahan penagihan"
          placeholder="Pilih Kelurahan"
          modalTitle="Pilih Kelurahan"
          value={kelurahanInv.label}
          setValue={setKelurahanInv}
          options={dataKelurahanInv}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: !isChecked ? COLORS.white : COLORS.darkGray2,
          }}
          modalStyle={{
            height: 250,
          }}
        />

        {/* Name CP */}
        <FormInput
          label="Contact person"
          autoCapitalize="characters"
          value={cp}
          onChange={(value) => {
            setCp(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* HP Number CP*/}
        <FormInput
          label="Nomor HP CP"
          keyboardType="numeric"
          value={phoneNoCp}
          onChange={(value) => {
            setPhoneNoCp(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Tempat usaha */}
        <Text
          style={{
            color: COLORS.gray,
            ...FONTS.body4,
            marginTop: SIZES.radius,
          }}
        >
          Tempat usaha
        </Text>

        <RadioGroup
          radioButtons={dataTempatUsaha}
          onPress={onPressRadioButton}
          selectedId={tempatUsaha.id}
          layout="row"
        />
        {/* <RadioButtonContainer
            values={constants.tempatUsaha}
            onPress={onRadioButtonPress}
          /> */}

        {/* Kepemilikan */}
        <Text
          style={{
            color: COLORS.gray,
            ...FONTS.body4,
            marginTop: SIZES.radius,
          }}
        >
          Kepemilikan usaha
        </Text>

        <RadioGroup
          radioButtons={dataKepemilikan}
          onPress={onRadioButtonOwnerPress}
          selectedId={kepemilikan.id}
          layout="row"
          selected={false}
        />

        {/* <RadioButtonContainer
            values={constants.kepemilikanusaha}
            onPress={onRadioButtonOwnerPress}
          /> */}

        <FormDateInput
          label="Mulai Usaha"
          placeholder="DD/MM/YYYY"
          value={usahaStart}
          setDate={setUsahaStart}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Jumlah Karyawan */}
        <Text
          style={{
            color: COLORS.gray,
            ...FONTS.body4,
            marginTop: SIZES.radius,
          }}
        >
          Jumlah Karyawan
        </Text>
        <View
          style={{
            flex: 1,
            alignContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <RadioGroup
            radioButtons={dataKaryawan}
            onPress={onRadioButtonKaryawanPress}
            selectedId={jumlahKaryawan.id}
            layout="column"
          />
        </View>

        {/* <RadioButtonContainer
            values={constants.jumlahkaryawan}
            onPress={onRadioButtonKaryawanPress}
          />  */}

        {/* Omset */}
        <FormInput
          label="Omset per bulan dalam Rp"
          keyboardType="numeric"
          value={omset}
          onChange={(value) => {
            if (value === "" || value === "-") {
              value = "0";
            }
            setOmset(NumberFormat(value));
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Credit limit */}
        <FormInput
          label="Pengajuan kredit limit Rp"
          keyboardType="numeric"
          value={creditLimit}
          onChange={(value) => {
            if (value === "" || value === "-") {
              value = "0";
            }
            setCreditLimit(NumberFormat(value));
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* TOP */}
        {/* <FormPicker
          label="Term of payment"
          placeholder="Pilih masa pembayaran"
          modalTitle="Pilih TOP"
          value={dataTerm.label}
          setValue={setTermPayment}
          options={dataTerm}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        /> */}

        {/* Cara Bayar */}
        <Text
          style={{
            color: COLORS.gray,
            ...FONTS.body4,
            marginTop: SIZES.radius,
          }}
        >
          Cara pembayaran
        </Text>
        <View
          style={{
            flex: 1,
            marginLeft: -10,
          }}
        >
          <RadioGroup
            radioButtons={dataPembayaran}
            onPress={onRadioButtonCaraBayarPress}
            selectedId={caraBayar.id}
            layout="row"
          />
        </View>
        {/* <RadioButtonContainer
            values={constants.carabayar}
            onPress={onRadioButtonCaraBayarPress}
          /> */}

        {/* Name CP penagihan */}
        <FormInput
          label="Contact person penagihan"
          autoCapitalize="characters"
          value={cpPenagihan}
          onChange={(value) => {
            setCpPenagihan(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* HP Number CP penagihan*/}
        <FormInput
          label="Nomor HP CP penagihan"
          keyboardType="numeric"
          value={phoneNoCpPenagihan}
          onChange={(value) => {
            setPhoneNoCpPenagihan(value);
          }}
          containerStyle={{
            marginTop: SIZES.radius,
          }}
          inputContainerStyle={{
            backgroundColor: COLORS.white,
          }}
        />

        {/* Pengambilan foto */}
        <View style={{ marginTop: SIZES.radius }}>
          <Text style={{ color: COLORS.gray, ...FONTS.body4 }}>
            Validasi data foto KTP/NPWP dan toko
          </Text>
          <Text style={{ color: COLORS.red2, ...FONTS.body4 }}>
            Harus Mengambil 4 foto
          </Text>
          <View
            style={{
              width: "100%",
              alignItems: "flex-start",
              flexDirection: "row",
            }}
          >
            {true && (
              <View>
                <Image
                  source={{ uri: image }}
                  style={{
                    width: 150,
                    height: 100,
                    backgroundColor: COLORS.lightGray1,
                    borderRadius: 8,
                  }}
                />
                {image !== null && (
                  <TouchableOpacity
                    onPress={() => {
                      setImage(null);
                    }}
                  >
                    <Text style={{ fontStyle: "italic", color: "red" }}>
                      Batal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <TextIconButton
              containerStyle={{
                height: 50,
                width: 50,
                alignItems: "center",
                borderRadius: SIZES.padding,
                backgroundColor: COLORS.lightGray2,
                marginTop: 20,
              }}
              icon={icons.camera}
              iconPosition="LEFT"
              labelStyle={{
                marginLeft: SIZES.middle,
                color: COLORS.white,
              }}
              onPress={async () => {
                // console.log("in pick camera");
                setUseCamera(true);
              }}
            />
          </View>
        </View>

        {/* toko */}
        {tokoImage !== null && (
          <View style={{ marginTop: SIZES.radius }}>
            <View
              style={{
                width: "100%",
                alignItems: "flex-start",
                flexDirection: "row",
              }}
            >
              {true && (
                <View>
                  <Image
                    source={{ uri: tokoImage }}
                    style={{
                      width: 150,
                      height: 100,
                      backgroundColor: COLORS.lightGray1,
                      borderRadius: 8,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setTokoImage(null);
                    }}
                  >
                    <Text style={{ fontStyle: "italic", color: "red" }}>
                      Batal
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        {/* toko2 */}
        {tokoImage2 !== null && (
          <View style={{ marginTop: SIZES.radius }}>
            <View
              style={{
                width: "100%",
                alignItems: "flex-start",
                flexDirection: "row",
              }}
            >
              {true && (
                <View>
                  <Image
                    source={{ uri: tokoImage2 }}
                    style={{
                      width: 150,
                      height: 100,
                      backgroundColor: COLORS.lightGray1,
                      borderRadius: 8,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setTokoImage2(null);
                    }}
                  >
                    <Text style={{ fontStyle: "italic", color: "red" }}>
                      Batal
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        {/* toko3 */}
        {tokoImage3 !== null && (
          <View style={{ marginTop: SIZES.radius }}>
            <View
              style={{
                width: "100%",
                alignItems: "flex-start",
                flexDirection: "row",
              }}
            >
              {true && (
                <View>
                  <Image
                    source={{ uri: tokoImage3 }}
                    style={{
                      width: 150,
                      height: 100,
                      backgroundColor: COLORS.lightGray1,
                      borderRadius: 8,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setTokoImage3(null);
                    }}
                  >
                    <Text style={{ fontStyle: "italic", color: "red" }}>
                      Batal
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
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
      {/* {isLoading ? (
        <View
          style={{
            minHeight: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <ActivityIndicator size="large" color="#000ff" />
          <Text style={{ fontSize: 20, color: "white", marginTop: 16 }}>
            Mohon Tunggu...
          </Text>
        </View>
      ) : ( */}
      <View style={{ flex: 1 }}>
        {renderHeader()}

        {useCamera ? (
          <View
            style={{
              flex: 1,
              marginTop: SIZES.radius,
              paddingBottom: 40,
            }}
          >
            {/* <KeyboardAwareScrollView
                // keyboardDismissMode="on-drag"
                contentContainerStyle={{
                  marginTop: SIZES.radius,
                  paddingHorizontal: SIZES.padding,
                  paddingBottom: 40,
                }}
              > */}
            {renderCamera()}
            {/* </KeyboardAwareScrollView> */}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <KeyboardAwareScrollView
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                marginTop: SIZES.radius,
                paddingHorizontal: SIZES.padding,
                paddingBottom: 40,
              }}
            >
              {renderForm()}
            </KeyboardAwareScrollView>

            <TextButton
              buttonContainerStyle={{
                height: 60,
                marginTop: SIZES.padding,
                marginHorizontal: SIZES.padding,
                marginBottom: SIZES.padding,
                borderRadius: SIZES.radius,
                backgroundColor: COLORS.primary,
              }}
              label="Simpan"
              onPress={() => simpanCustomer()}
            />
          </View>
        )}
      </View>
      {/* )} */}
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ fontSize: 20, color: "white", marginTop: 16 }}>
            Mohon Tunggu...
          </Text>
        </View>
      )}
    </View>
  );
};

export default CustomerSurvey;

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    minWidth: "100%",
    maxHeight: "100%",
    flex: 1,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 40,
    margin: 8,
    backgroundColor: "grey",
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    backgroundColor: "#rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  activityIndicatorWrapper: {
    backgroundColor: "#rgba(0, 0, 0, 0.5)",
    height: 100,
    width: 100,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
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
  checkbox: {
    margin: 8,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SIZES.radius,
  },
  paragraph: {
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: 10,
  },
});
