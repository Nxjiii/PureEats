import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

function CommunityScreen() {
  return (
    <SafeAreaView style={ styles.container}>
      <Text> Community </Text>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2E3837',
    flex: 1,
   justifyContent: 'center',
   alignItems: 'center'
  }
});

export default CommunityScreen;
