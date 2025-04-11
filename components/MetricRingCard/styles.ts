import { StyleSheet, Dimensions } from 'react-native';

const CARD_WIDTH = Dimensions.get('window').width * 0.42;
const SMALL_CARD_WIDTH = Dimensions.get('window').width * 0.21; 

export const metricStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 160,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  smallCard: {
    width: SMALL_CARD_WIDTH,
    height: 120, 
    marginBottom: 12,
    marginHorizontal: 4,
  },
  ringText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});