import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import Dashboard from './pages/Dashboard';
import {LoadingPage} from 'react-native-cotter';
import Login from './pages/Login';
import Start from './pages/Start';
import RegisterDevice from './pages/RegisterDevice';

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

function MainStackRouter() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="Start"
        component={Start}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name="RegisterDevice"
        component={RegisterDevice}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{headerShown: false}}
      />
      <MainStack.Screen
        name="RegisterSuccess"
        component={RegisterSuccess}
        options={{headerShown: false}}
      />
    </MainStack.Navigator>
  );
}

function Router() {
  return (
    <RootStack.Navigator mode="modal">
      <RootStack.Screen
        name="Main"
        component={MainStackRouter}
        options={{headerShown: false}}
      />
      <RootStack.Screen
        name="CotterLoadingVerify"
        component={LoadingPage}
        options={{headerShown: false}}
      />
    </RootStack.Navigator>
  );
}

export default Router;
