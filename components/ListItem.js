import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { COLORS } from "../constants";
import { NumberFormat, windowWidth } from "../utils/";

const ListItem = ({ prodid, product, qty, alasan, unit, tglactual }) => {
  console.log("alasan", prodid);
  // return (
  //   <View
  //     style={{
  //       flexDirection: "row",
  //       justifyContent: "space-between",
  //       alignItems: "center",
  //       padding: 5,
  //     }}
  //   >
  //     <View
  //       style={{
  //         flexDirection: "row",
  //         alignItems: "center",
  //         flex: 1,
  //         backgroundColor: COLORS.lightGray1,
  //         paddingHorizontal: 20,
  //         borderRadius: 20,
  //       }}
  //     >
  //       {/* <Image
  //         source={photo}
  //         style={{ width: 55, height: 55, borderRadius: 10, marginRight: 8 }}
  //       /> */}
  //       <View
  //         style={{
  //           width: windowWidth,
  //         }}
  //       >
  //         <Text
  //           style={{
  //             color: "#333",
  //             //   fontFamily: "Roboto-Medium",
  //             fontSize: 12,
  //           }}
  //         >
  //           {prodid} ({product})
  //         </Text>
  //         <Text
  //           style={{
  //             color: "#333",
  //             fontSize: 14,
  //             //   textTransform: "uppercase",
  //           }}
  //         >
  //           {unit !== undefined
  //             ? "Qty : " + NumberFormat(qty.toString()) + " " + unit
  //             : "Harga : " + NumberFormat(qty.toString())}
  //           {/* Qty : {qty} {unit} */}
  //         </Text>
  //         {alasan != undefined && (
  //           <Text
  //             style={{
  //               color: "#333",
  //               fontSize: 14,
  //               // textTransform: "uppercase",
  //             }}
  //           >
  //             alasan : {alasan}
  //           </Text>
  //         )}
  //         {tglactual != undefined ||
  //           (tglactual == "" && (
  //             <Text
  //               style={{
  //                 color: "#333",
  //                 fontSize: 14,
  //                 // textTransform: "uppercase",
  //               }}
  //             >
  //               Periode : {tglactual}
  //             </Text>
  //           ))}
  //       </View>
  //     </View>

  //     {/* <TouchableOpacity
  //       style={{
  //         backgroundColor: "#0aada8",
  //         padding: 10,
  //         width: 100,
  //         borderRadius: 10,
  //       }}
  //     >
  //       <Text
  //         style={{
  //           color: "#fff",
  //           textAlign: "center",
  //           fontSize: 14,
  //         }}
  //       >
  //         {qty}
  //       </Text>
  //     </TouchableOpacity> */}
  //   </View>
  // );
};

export default ListItem;
