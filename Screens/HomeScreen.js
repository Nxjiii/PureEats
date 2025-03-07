//home screen
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8; 
const CARD_MARGIN = 10;
const ROW_SPACING = 90;

function HomeScreen() {
  const data = [
    { id: '1', title: 'Recipe 1' },
    { id: '2', title: 'Recipe 2' },
    { id: '3', title: 'Recipe 3' },
    { id: '4', title: 'Recipe 4' },
    { id: '5', title: 'Recipe 5' },
    { id: '6', title: 'Recipe 6' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderRow = (rowData) => (
    <FlatList
      horizontal
      data={rowData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
      decelerationRate="fast"
      contentContainerStyle={{ paddingLeft: CARD_MARGIN / 2, paddingRight: CARD_MARGIN * 1.5 }}
      />
  );

  const rows = [data.slice(0, 2), data.slice(2, 4), data.slice(4, 6)];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.recentlySearchedContainer}>
          <Text style={styles.recentlySearchedTitle}>Recently Searched Foods</Text>
          {rows.map((row, index) => (
            <View key={index} style={{ marginBottom: ROW_SPACING }}>
              {renderRow(row)}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: height * 0.2, 
  },
  recentlySearchedContainer: {
    padding: 20,
  },
  recentlySearchedTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 80, 
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: CARD_MARGIN,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 15,
  },

});

export default HomeScreen;
