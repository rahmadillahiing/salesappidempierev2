export const NumberFormat = (num) => {
  var num1 = Number.parseFloat(num.replace(/,/g, ""));

  return "" + num1.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

// export const currencyFormat = (num) => {
//   var num1 = Number.parseFloat(num.replace(/,/g, ""));
//   return "" + num1.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
// };

//6 digit tuh brp ya ? 600.000
//coba
//tetep ilang
// pas angka brp
// angka ke 5
//harusnya 90.000 bukan 9.0000
