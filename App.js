import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";

import CustomDrawer from "./navigation/CustomDrawer";

import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";
import thunk from "redux-thunk";
import rootReducer from "./stores/rootReducer";

import {
  Retur,
  SalesOrderBeras,
  SalesOrderBihun,
  SalesOrderBerasNonKunjungan,
  StockSurvey,
  CustomerSurvey,
  ShelvingAfter,
  ShelvingBefore,
  ShelvingFloor,
  OnBoarding,
  CheckIn,
  SignIn,
  SignUp,
  ForgotPassword,
  Otp,
  FoodDetail,
  MyCart,
  Checkout,
  Success,
  MyCard,
  AddCard,
  DeliveryStatus,
  Map,
  Order,
  Review,
  Coupon,
  MyAccount,
  MyAccountEdit,
  Settings,
  ChangePassword,
  NotificationSetting,
  BillingInvoice,
  InvoiceDetail,
  ConfirmInvoice,
  BillingInvoiceNonKunjungan,
  InvoiceDetailNonKunjungan,
  ConfirmTtf,
  InvoiceEditHeader,
  InvoiceEditDetail,
  InvoiceEditSubDetail,
  MonitoringSo,
  MonitoringSoDetail,
  DashboardDetail,
} from "./screens";

const Stack = createStackNavigator();

const store = createStore(rootReducer, applyMiddleware(thunk));

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

const App = () => {
  const [loaded] = useFonts({
    "Poppins-Black": require("./assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }
  return (
    <Provider store={store}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={"OnBoarding"}
        >
          <Stack.Screen name="OnBoarding" component={OnBoarding} />

          <Stack.Screen name="CheckIn" component={CheckIn} />

          <Stack.Screen name="SignIn" component={SignIn} />

          <Stack.Screen name="ShelvingAwal" component={ShelvingBefore} />

          <Stack.Screen name="ShelvingSetelah" component={ShelvingAfter} />

          <Stack.Screen name="ShelvingFloor" component={ShelvingFloor} />

          <Stack.Screen name="StockSurvey" component={StockSurvey} />

          <Stack.Screen name="salesorderBeras" component={SalesOrderBeras} />

          <Stack.Screen name="salesorderBihun" component={SalesOrderBihun} />

          <Stack.Screen
            name="SalesOrderBerasNonKunjungan"
            component={SalesOrderBerasNonKunjungan}
          />

          <Stack.Screen name="Retur" component={Retur} />

          <Stack.Screen name="BillingCustomer" component={BillingInvoice} />

          <Stack.Screen name="InvoiceDetail" component={InvoiceDetail} />

          <Stack.Screen name="ConfirmInvoice" component={ConfirmInvoice} />

          <Stack.Screen name="ConfirmTtf" component={ConfirmTtf} />

          <Stack.Screen
            name="InvoiceEditSubDetail"
            component={InvoiceEditSubDetail}
          />
          <Stack.Screen
            name="InvoiceEditDetail"
            component={InvoiceEditDetail}
          />

          <Stack.Screen
            name="InvoiceEditHeader"
            component={InvoiceEditHeader}
          />

          <Stack.Screen
            name="BillingInvoiceNonKunjungan"
            component={BillingInvoiceNonKunjungan}
          />

          <Stack.Screen
            name="InvoiceDetailNonKunjungan"
            component={InvoiceDetailNonKunjungan}
          />

          <Stack.Screen name="CustomerSurvey" component={CustomerSurvey} />

          <Stack.Screen name="MonitoringSo" component={MonitoringSo} />

          <Stack.Screen
            name="MonitoringSoDetail"
            component={MonitoringSoDetail}
          />

          <Stack.Screen name="DashboardDetail" component={DashboardDetail} />

          <Stack.Screen name="SignUp" component={SignUp} />

          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />

          <Stack.Screen name="Otp" component={Otp} />

          <Stack.Screen name="Home" component={CustomDrawer} />

          <Stack.Screen name="FoodDetail" component={FoodDetail} />

          <Stack.Screen name="MyCart" component={MyCart} />

          <Stack.Screen name="MyCard" component={MyCard} />

          <Stack.Screen name="AddCard" component={AddCard} />

          <Stack.Screen name="Checkout" component={Checkout} />

          <Stack.Screen
            name="Success"
            component={Success}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen
            name="DeliveryStatus"
            component={DeliveryStatus}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen name="Order" component={Order} />

          <Stack.Screen name="Review" component={Review} />

          <Stack.Screen name="Coupon" component={Coupon} />

          <Stack.Screen name="MyAccount" component={MyAccount} />

          <Stack.Screen name="MyAccountEdit" component={MyAccountEdit} />

          <Stack.Screen name="Settings" component={Settings} />

          <Stack.Screen name="ChangePassword" component={ChangePassword} />

          <Stack.Screen
            name="NotificationSetting"
            component={NotificationSetting}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
