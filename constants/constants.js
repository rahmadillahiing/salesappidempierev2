//BPR
//production
// const idempServerBpr = "http://108.137.95.190:8080/";
// const idempServerBpr = "https://ibpr.sep-food.com/";
//staging
const idempServerBpr = "http://202.158.42.132:8080/";
// const idempServerBpr = "https://stagingbpr.sep-food.com/";
//Dev
// const idempServerBpr = "http://202.158.42.131:8080/";

//RMP
////live
const idempServerRmp = "http://108.137.95.190:9090/";
////Dev
// const idempServerRmp = "http://103.94.127.82:9999/";

//bpr production internal aws
const loginServer = "http://108.137.170.97:8002";
//Cash Collection Server
const CashColServer = "https://berasraja.sep-food.com:8005";

const onboarding_screens = [
  {
    id: 1,
    backgroundImage: require("../assets/images/background_01.png"),
    bannerImage: require("../assets/images/raja.png"),
    title: "Survey Produk BPR",
    description: "Survey produk-produk beras BPR di lokasi anda",
  },
  {
    id: 2,
    backgroundImage: require("../assets/images/background_02.png"),
    bannerImage: require("../assets/images/smilingman-removebg-preview.png"),
    title: "Selalu ramah dan jangan lupa senyum",
    description: "Bersikap ramah dan sopan di setiap kunjungan",
  },
  {
    id: 3,
    backgroundImage: require("../assets/images/background_01.png"),
    bannerImage: require("../assets/images/survey-online-removebg-preview.png"),
    title: "Jangan lupa Check in dan Check out",
    description:
      "Check in dan Check out diharuskan untuk data kunjungan dan dianggap sebagai absensi juga.",
  },
];

const screens = {
  main_layout: "MainLayout",
  home: "Home",
  search: "Survey Harga",
  cart: "Kompetitor",
  favourite: "Sales Survey",
  notification: "Notification",
};

const bottom_tabs = [
  {
    id: 0,
    label: screens.home,
  },
  {
    id: 1,
    label: screens.search,
  },
  {
    id: 2,
    label: screens.cart,
  },
  {
    id: 3,
    label: screens.favourite,
  },
  {
    id: 4,
    label: screens.notification,
  },
];

const kelamin = [
  {
    id: 0,
    label: "Laki Laki",
    value: "Laki Laki",
  },
  {
    id: 1,
    label: "Perempuan",
    value: "Perempuan",
  },
];

const jenisperusahaan = [
  {
    id: 0,
    label: "",
    value: "",
  },
  {
    id: 1,
    label: "PT",
    value: "PT",
  },
  {
    id: 2,
    label: "CV",
    value: "CV",
  },
  {
    id: 3,
    label: "BAPAK",
    value: "BAPAK",
  },
  {
    id: 4,
    label: "IBU",
    value: "IBU",
  },
  {
    id: 5,
    label: "TOKO",
    value: "TOKO",
  },
];

const jenisretur = [
  {
    id: 0,
    label: "",
    value: "",
  },
  {
    id: 1,
    label: "Produk Expired",
    value: "Produk Expired",
  },
  {
    id: 2,
    label: "Produk Terdapat Kutu",
    value: "Produk Terdapat Kutu",
  },
  {
    id: 3,
    label: "Kemasan Pecah/Sobek",
    value: "Kemasan Pecah/Sobek",
  },
  {
    id: 4,
    label: "Kontaminasi benda asing",
    value: "Kontaminasi benda asing",
  },
  // {
  //   id: 5,
  //   label: "Lain-lain",
  //   value: "Lain-lain",
  // },
  {
    id: 6,
    label: "Tidak Laku",
    value: "Tidak Laku",
  },
];

const jenispembayaran = [
  {
    id: 0,
    label: "",
    value: "",
  },
  {
    id: 1,
    label: "CASH",
    value: "CASH",
  },
  {
    id: 2,
    label: "GIRO/CEK",
    value: "GIRO/CEK",
  },
  {
    id: 3,
    label: "BANK TRANSFER",
    value: "BANK TRANSFER",
  },
];

const jenispembayarannon = [
  {
    id: 3,
    label: "BANK TRANSFER",
    value: "BANK TRANSFER",
  },
];

const tempatUsaha = [
  {
    id: 0,
    label: "Gedung",
    value: "Gedung",
  },
  {
    id: 1,
    label: "Ruko",
    value: "Ruko",
  },
  {
    id: 2,
    label: "Rumah",
    value: "Rumah",
  },
];

const gagaltagih = [
  {
    id: 1,
    label: "Toko Tutup                                               ",
    value: "Toko Tutup                                               ",
  },
  {
    id: 2,
    label: "Permintaan Retur/Tarik Barang                            ",
    value: "Permintaan Retur/Tarik Barang                            ",
  },
  {
    id: 3,
    label: "Tidak Sempat Dikunjungi                                  ",
    value: "Tidak Sempat Dikunjungi                                  ",
  },
  {
    id: 4,
    label: "Janji bayar kunjungan berikutnya                         ",
    value: "Janji bayar kunjungan berikutnya                         ",
  },
];

const kepemilikanusaha = [
  {
    id: 3,
    label: "Milik sendiri",
    value: "Milik sendiri",
  },
  {
    id: 4,
    label: "Sewa",
    value: "Sewa",
  },
];

const jumlahkaryawan = [
  {
    id: 5,
    label: "1    Orang",
    value: "1    Orang",
  },
  {
    id: 6,
    label: "2-5 Orang",
    value: "2-5 Orang",
  },
  {
    id: 7,
    label: ">5  Orang",
    value: ">5  Orang",
  },
];

const carabayar = [
  {
    id: 8,
    label: "Tunai    ",
    value: "Tunai    ",
  },
  {
    id: 9,
    label: "Transfer ",
    value: "Transfer ",
  },
  {
    id: 10,
    label: "Giro/Cek ",
    value: "Giro/Cek ",
  },
  // {
  //   id: 11,
  //   label: "Cek     ",
  //   value: "Cek     ",
  // },
];

const TOP = [
  {
    id: 11,
    label: "7 Hari",
    value: 7,
  },
  {
    id: 12,
    label: "14 Hari",
    value: 14,
  },
  {
    id: 13,
    label: "21 Hari",
    value: 21,
  },
  {
    id: 14,
    label: "30 Hari",
    value: 30,
  },
  {
    id: 15,
    label: "45 Hari",
    value: 45,
  },
];

const additionalrange = [
  {
    idrange: 1,
    start: 0,
    end: 499,
  },
  {
    idrange: 2,
    start: 500,
    end: 999,
  },
  {
    idrange: 3,
    start: 1000,
    end: 1499,
  },
  {
    idrange: 4,
    start: 1500,
    end: 999999,
  },
];

const delivery_time = [
  {
    id: 1,
    label: "10 Mins",
  },
  {
    id: 2,
    label: "20 Mins",
  },
  {
    id: 3,
    label: "30 Mins",
  },
];

const ratings = [
  {
    id: 1,
    label: 1,
  },
  {
    id: 2,
    label: 2,
  },
  {
    id: 3,
    label: 3,
  },
  {
    id: 4,
    label: 4,
  },
  {
    id: 5,
    label: 5,
  },
];

const tags = [
  {
    id: 1,
    label: "Burger",
  },
  {
    id: 2,
    label: "Fast Food",
  },
  {
    id: 3,
    label: "Pizza",
  },
  {
    id: 4,
    label: "Asian",
  },
  {
    id: 5,
    label: "Dessert",
  },
  {
    id: 6,
    label: "Breakfast",
  },
  {
    id: 7,
    label: "Vegetable",
  },
  {
    id: 8,
    label: "Taccos",
  },
];

const track_order_status = [
  {
    id: 1,
    title: "Order Confirmed",
    sub_title: "Your order has been received",
  },
  {
    id: 2,
    title: "Order Prepared",
    sub_title: "Your order has been prepared",
  },
  {
    id: 3,
    title: "Delivery in Progress",
    sub_title: "Hang on! Your food is on the way",
  },
  {
    id: 4,
    title: "Delivered",
    sub_title: "Enjoy your meal!",
  },
  {
    id: 5,
    title: "Rate Us",
    sub_title: "Help us improve our service",
  },
];

const tips = [
  {
    id: 1,
    label: "No Tips",
    value: 0,
  },
  {
    id: 2,
    label: "$5",
    value: 5,
  },
  {
    id: 3,
    label: "$10",
    value: 10,
  },
  {
    id: 4,
    label: "$15",
    value: 15,
  },
  {
    id: 5,
    label: "$20",
    value: 20,
  },
];

const gender = [
  {
    id: 0,
    label: "Male",
    value: "Male",
  },
  {
    id: 1,
    label: "Female",
    value: "Female",
  },
];

const state = [
  {
    id: 0,
    label: "Sarawak",
    value: "Sarawak",
  },
  {
    id: 1,
    label: "Sabah",
    value: "Sabah",
  },
  {
    id: 2,
    label: "Johor",
    value: "Johor",
  },
  {
    id: 3,
    label: "Kedah",
    value: "Kedah",
  },
  {
    id: 4,
    label: "Kelantan",
    value: "Kelantan",
  },
  {
    id: 5,
    label: "Penang",
    value: "Penang",
  },
];

const GOOGLE_MAP_API_KEY = "AIzaSyAWZL74mSlqw9FdWx1cHFkhsKLfDildtJY";

export default {
  idempServerBpr,
  idempServerRmp,
  loginServer,
  CashColServer,
  onboarding_screens,
  screens,
  bottom_tabs,
  delivery_time,
  ratings,
  tags,
  track_order_status,
  tips,
  gender,
  state,
  GOOGLE_MAP_API_KEY,
  kelamin,
  jenisperusahaan,
  additionalrange,
  TOP,
  carabayar,
  jumlahkaryawan,
  kepemilikanusaha,
  gagaltagih,
  tempatUsaha,
  jenispembayaran,
  jenispembayarannon,
  jenisretur,
  jenisperusahaan,
};
