import * as React from 'react';
import {View, Text} from 'react-native';
function Dashboard({route}) {
  const {loginResponse} = route.params;
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Dashboard</Text>
      <Text>{JSON.stringify(loginResponse)}</Text>
    </View>
  );
}

export default Dashboard;
