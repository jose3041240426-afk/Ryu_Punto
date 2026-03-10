import React, { useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ImageBackground, Platform } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const isWeb = Platform.OS === 'web';
const isMobile = !isWeb;

// Configuración responsive
const numColumns = isMobile ? 2 : 2; // 2 columnas en móvil, 4 en web
const gap = isMobile ? 20 : 10;
const availableWidth = screenWidth - (gap * (numColumns + 1));
const itemSize = availableWidth / numColumns;
const itemHeight = itemSize * 0.65;

const drinksItems = [
  {
    id: '1',
    name: 'Coca-Cola 500ml',
    price: 20,
    type: 'Refresco',
    image: require('../../assets/images/coca.jpg')
  },
  {
    id: '2',
    name: 'Jugo del Valle 237ml',
    price: 10,
    type: 'Jugo',
    image: require('../../assets/images/vall.jpg')
  },
  {
    id: '3',
    name: 'Sprite 500ml (Vidrio)',
    price: 25,
    type: 'Refresco',
    image: require('../../assets/images/sprite.jpg')
  },
  {
    id: '4',
    name: 'Agua de Jamaica',
    price: 15,
    type: 'Agua Fresca',
    image: require('../../assets/images/Jamaica.jpg')
  },
  {
    id: '5',
    name: 'Agua de Horchata',
    price: 15,
    type: 'Agua Fresca',
    image: require('../../assets/images/horchata.webp')
  }
];

const SushiCard = ({ item, width, height, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { width, height },
        (isHovered || isPressed) && styles.cardHovered
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // @ts-ignore - Solo para web
      onMouseEnter={() => isWeb && setIsHovered(true)}
      // @ts-ignore - Solo para web
      onMouseLeave={() => isWeb && setIsHovered(false)}
    >
      <ImageBackground
        source={item.image}
        style={styles.cardImage}
        imageStyle={styles.cardImageRadius}
        resizeMode="cover"
      >
        {isWeb && isHovered ? (
          <View style={styles.hoverOverlay}>
            <Text style={styles.priceText}>${item.price}</Text>
            <Text style={styles.ingredientsText}>{item.type}</Text>
          </View>
        ) : (
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle} numberOfLines={2} adjustsFontSizeToFit>
              {item.name}
            </Text>
            <Text style={styles.priceText}>${item.price}</Text>
            {isMobile && (
              <Text style={styles.mobileType}>
                {item.type}
              </Text>
            )}
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function BebidasScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const handleSelection = (item) => {
    addToCurrentOrder({
      type: 'Bebida',
      name: item.name,
      price: item.price,
      clientId: clientId,
      details: item.type
    });
  };

  const renderItem = ({ item }) => (
    <SushiCard
      item={item}
      width={itemSize}
      height={itemHeight}
      onPress={() => handleSelection(item)}
    />
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollView, isDarkMode && styles.darkScrollView]}
      showsVerticalScrollIndicator={true}
    >
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.mainTitle, isDarkMode && styles.darkMainTitle]}>BEBIDAS</Text>

        <Text style={[styles.sectionHeader, isDarkMode && styles.darkSectionHeader]}>REFRESCOS</Text>
        <FlatList
          data={drinksItems.filter(item => item.type === 'Refresco')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: gap }}
          scrollEnabled={false}
        />

        <Text style={[styles.sectionHeader, isDarkMode && styles.darkSectionHeader]}>JUGOS</Text>
        <FlatList
          data={drinksItems.filter(item => item.type === 'Jugo')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: gap }}
          scrollEnabled={false}
        />

        <Text style={[styles.sectionHeader, isDarkMode && styles.darkSectionHeader]}>AGUAS FRESCAS</Text>
        <FlatList
          data={drinksItems.filter(item => item.type === 'Agua Fresca')}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: gap }}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Platform.OS === 'web' ? 0 : 10,
  },
  darkScrollView: {
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: Platform.OS === 'web' ? 10 : 5,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  mainTitle: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    marginVertical: Platform.OS === 'web' ? 20 : 15,
    color: '#000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  darkMainTitle: {
    color: '#fff',
    textShadowColor: 'rgba(0, 100, 255, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontSize: Platform.OS === 'web' ? 32 : 26,
    letterSpacing: 2,
  },
  sectionHeader: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    color: '#000',
    alignSelf: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  darkSectionHeader: {
    color: '#fff',
    textShadowColor: 'rgba(0, 100, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Estilos de tarjeta
  cardContainer: {
    borderRadius: 15,
    elevation: Platform.OS === 'android' ? 3 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHovered: {
    transform: Platform.OS === 'web' ? [{ scale: 1.02 }] : [{ scale: 0.98 }],
    elevation: Platform.OS === 'android' ? 5 : 0,
    shadowOpacity: 0.3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageRadius: {
    borderRadius: 15,
  },
  cardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 5 : 8,
  },
  cardTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: Platform.OS === 'web' ? 5 : 3,
    includeFontPadding: false,
  },
  priceText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  mobileType: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
    fontStyle: 'italic',
  },
  hoverOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  ingredientsText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 12 : 10,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 5,
  },
  grid: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    width: '100%'
  },
});