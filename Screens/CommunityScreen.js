import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';

function CommunityScreen() {
  return (
    <SafeAreaView style={ styles.container}>
      <Text style={ styles.title}> Community </Text>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },

  title: {
    color: '#BB86FC',
    fontSize: 20,
    marginTop: 50,
    textAlign: 'center',
  },

});

export default CommunityScreen;
