import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import SushiScreen from './src/screens/SushiScreen';
import BebidasScreen from './src/screens/BebidasScreen';
import HistorialScreen from './src/screens/HistorialScreen';
import AlitasScreen from './src/screens/AlitasScreen';
import RegistroScreen from './src/screens/RegistroScreen';
import SplashScreen from './src/screens/SplashScreen';
import ClientSelectionModal from './src/components/ClientSelectionModal';
import SavedDaysModal from './src/components/SavedDaysModal';
import PostresScreen from './src/screens/PostresScreen';
import InventarioScreen from './src/screens/InventarioScreen';
import ExpenseScreen from './src/screens/ExpenseScreen';
import OrderManagerModal from './src/components/OrderManagerModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  TouchableOpacity,
  Image,
  View,
  Modal,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';

// Importar CSS para web
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    .web-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .tab-content {
      flex: 1;
      overflow-y: auto;
    }
  `;
  document.head.appendChild(style);
}

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

function TabNavigator({
  isDarkMode,
  toggleTheme,
  is3x2Active,
  toggle3x2,
  history,
  setHistory,
  currentOrder,
  addToCurrentOrder,
  navigation,
  registroInfo,
  setConfirmationModalVisible,
  expenses,
  handleResetExpenses,
  handleAddExpense,
  handleUpdateExpenses,
  setOrderManagerVisible,
}) {
  const appStyles = {
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#fff',
    },
    text: {
      color: isDarkMode ? '#fff' : '#000',
    },
    tabBarStyle: {
      backgroundColor: 'red',
      height: Platform.OS === 'web' ? 70 : 60,
      ...(Platform.OS === 'web' && {
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }),
    },
    headerStyle: {
      backgroundColor: 'red',
    },
    headerTintColor: '#fff',
    tabBarLabelStyle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#fff',
      paddingBottom: 2,
      textAlign: 'center',
    },
    tabBarActiveTintColor: '#fff',
    tabBarInactiveTintColor: '#000',
    tabBarItemStyle: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 10,
    },
  };

  return (
    <View
      style={[
        { flex: 1 },
        Platform.OS === 'web' && {
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }
      ]}
    >
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarStyle: appStyles.tabBarStyle,
          tabBarLabelStyle: appStyles.tabBarLabelStyle,
          tabBarActiveTintColor: appStyles.tabBarActiveTintColor,
          tabBarInactiveTintColor: appStyles.tabBarInactiveTintColor,
          tabBarItemStyle: appStyles.tabBarItemStyle,
          tabBarIndicatorStyle: {
            backgroundColor: '#fff',
            top: 0,
            height: 3,
          },
          lazy: Platform.OS !== 'web',
          tabBarIcon: ({ focused }) => {
            const color = focused ? '#fff' : '#000';

            const sushiIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><ellipse cx='12.07' cy='7' fill='${color}' rx='3' ry='1.71'/><path fill='${color}' d='M12.07 22c4.48 0 8-2.2 8-5V7c0-2.8-3.52-5-8-5s-8 2.2-8 5v10c0 2.8 3.51 5 8 5m0-18c3.53 0 6 1.58 6 3a2 2 0 0 1-.29.87c-.68 1-2.53 2-5 2.12h-1.39C8.88 9.83 7 8.89 6.35 7.84a2.2 2.2 0 0 1-.28-.76V7c0-1.42 2.46-3 6-3'/></svg>`;

            const bebidasIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path fill='${color}' d='M6 8H3L2 2h5M1 1V0h3v2H3V1'/></svg>`;

            const extrasIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><g fill='none' fill-rule='evenodd'><path d='m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z'/><path fill='${color}' d='M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m4.5 8.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m-4.5 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m-4.5 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3'/></g></svg>`;

            const historialIcon = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='${color}' d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M9 17H7v-7h2zm4 0h-2V7h2zm4 0h-2v-4h2z'/></svg>`;

            if (route.name === 'Sushi') {
              return <SvgXml xml={sushiIcon} width={24} height={24} />;
            } else if (route.name === 'Alitas') {
              const iconSource = require('./assets/images/Alitasicon.png');
              return <Image source={iconSource} style={{ width: 24, height: 24, tintColor: color }} />;
            } else if (route.name === 'Bebidas') {
              return <SvgXml xml={bebidasIcon} width={24} height={24} />;
            } else if (route.name === 'Extras') {
              return <SvgXml xml={extrasIcon} width={24} height={24} />;
            } else if (route.name === 'Historial') {
              return <SvgXml xml={historialIcon} width={24} height={24} />;
            }
          },
          headerShown: false,
        })}
        {...(Platform.OS === 'web' && {
          sceneContainerStyle: {
            flex: 1,
            overflow: 'auto',
            height: '100%',
          },
        })}
      >
        <Tab.Screen name="Sushi">
          {() => (
            <SushiScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
              is3x2Active={is3x2Active}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Alitas">
          {() => (
            <AlitasScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Bebidas">
          {() => (
            <BebidasScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Extras">
          {() => (
            <PostresScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Historial">
          {() => (
            <HistorialScreen
              isDarkMode={isDarkMode}
              history={history}
              onUpdateHistory={setHistory}
              registro={registroInfo}
              expenses={expenses}
              navigation={navigation}
              handleResetExpenses={handleResetExpenses}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {currentOrder.length > 0 && (
        <TouchableOpacity
          style={[
            styles.orderButton,
            isDarkMode && styles.darkFloatingButton,
            Platform.OS === 'web' && {
              bottom: 90,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }
          ]}
          onPress={() => setConfirmationModalVisible(true)}>
          <Text style={styles.floatingButtonText}>
            Confirmar Pedido ({currentOrder.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MainApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [is3x2Active, setIs3x2Active] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [clientSelectionVisible, setClientSelectionVisible] = useState(false);
  const [registroInfo, setRegistroInfo] = useState(null);
  const [clients, setClients] = useState([]);
  const [savedDays, setSavedDays] = useState([]);
  const [savedDaysModalVisible, setSavedDaysModalVisible] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [isSnackEnvironment, setIsSnackEnvironment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cashAmount, setCashAmount] = useState('');
  const [change, setChange] = useState(0);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [orderManagerVisible, setOrderManagerVisible] = useState(false);

  const showRegistroInfo = () => {
    if (registroInfo) {
      Alert.alert(
        'Información del Registro',
        `Cambio en caja: $${registroInfo.cashInBox}\nFecha: ${registroInfo.date}\nTrabajador: ${registroInfo.workerName}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sin información',
        'No hay información de registro disponible',
        [{ text: 'OK' }]
      );
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    loadDarkModePreference();
    loadSavedDays();
    loadExpenses();
    loadHistory();
    loadArchivedOrders();

    if (typeof expo !== 'undefined') {
      setIsSnackEnvironment(true);
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      saveHistory(history);
    }
  }, [history]);

  const loadDarkModePreference = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses !== null) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('history');
      if (savedHistory !== null) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadArchivedOrders = async () => {
    try {
      const savedArchivedOrders = await AsyncStorage.getItem('archivedOrders');
      if (savedArchivedOrders !== null) {
        setArchivedOrders(JSON.parse(savedArchivedOrders));
      }
    } catch (error) {
      console.error('Error loading archived orders:', error);
    }
  };

  const loadSavedDays = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedDays');
      if (saved) {
        setSavedDays(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved days:', error);
    }
  };

  const saveExpenses = async (newExpenses) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await AsyncStorage.setItem('history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const saveArchivedOrders = async (orders) => {
    try {
      await AsyncStorage.setItem('archivedOrders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving archived orders:', error);
    }
  };

  const handleResetExpenses = async () => {
    setExpenses([]);
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify([]));
    } catch (error) {
      console.error('Error resetting expenses:', error);
    }
  };

  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  };

  const handleUpdateExpenses = (updatedExpenses) => {
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  };

  const handleArchiveOrder = async (order) => {
    const updatedArchivedOrders = [...archivedOrders, order];
    setArchivedOrders(updatedArchivedOrders);
    await saveArchivedOrders(updatedArchivedOrders);
  };

  const handleLoadArchivedOrder = (items) => {
    setCurrentOrder(items);
  };

  const handleDeleteArchivedOrder = async (orderId) => {
    const updatedArchivedOrders = archivedOrders.filter(order => order.id !== orderId);
    setArchivedOrders(updatedArchivedOrders);
    await saveArchivedOrders(updatedArchivedOrders);
  };

  const handleEditOrderName = async (orderId, newName) => {
    const updatedArchivedOrders = archivedOrders.map(order =>
      order.id === orderId ? { ...order, name: newName } : order
    );
    setArchivedOrders(updatedArchivedOrders);
    await saveArchivedOrders(updatedArchivedOrders);
  };

  const handleExportDayReport = async (day) => {
    try {
      if (isSnackEnvironment) {
        Alert.alert(
          'Función limitada en Snack',
          'La exportación completa de PDF funciona en build local o Expo Go'
        );
        return;
      }

      const dayOrders = history.filter((order) => {
        const orderDate = new Date(order.time).toLocaleDateString();
        const selectedDate = new Date(day.date).toLocaleDateString();
        return orderDate === selectedDate;
      });

      const totalSales = dayOrders.reduce((sum, order) => sum + order.price, 0);
      const dayExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date).toLocaleDateString();
        const selectedDate = new Date(day.date).toLocaleDateString();
        return expenseDate === selectedDate;
      });
      const totalExpenses = dayExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; text-align: center; }
              .summary { margin: 20px 0; padding: 10px; background: #f5f5f5; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Reporte Diario - ${new Date(day.date).toLocaleDateString()}</h1>
            
            <div class="summary">
              <h2>Resumen</h2>
              <p>Ventas Totales: $${totalSales.toFixed(2)}</p>
              <p>Gastos Totales: $${totalExpenses.toFixed(2)}</p>
              <p>Balance Neto: $${(totalSales - totalExpenses).toFixed(2)}</p>
            </div>

            <h2>Órdenes</h2>
            <table>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Método de Pago</th>
              </tr>
              ${dayOrders
          .map(
            (order) => `
                <tr>
                  <td>${new Date(order.time).toLocaleTimeString()}</td>
                  <td>${order.clientName || 'N/A'}</td>
                  <td>${order.type} - ${order.name}</td>
                  <td>$${order.price.toFixed(2)}</td>
                  <td>${order.paymentMethod || 'No especificado'}</td>
                </tr>
              `
          )
          .join('')}
            </table>

            <h2>Gastos</h2>
            <table>
              <tr>
                <th>Hora</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
              ${dayExpenses
          .map(
            (expense) => `
                <tr>
                  <td>${new Date(expense.date).toLocaleTimeString()}</td>
                  <td>${expense.description}</td>
                  <td>$${expense.amount.toFixed(2)}</td>
                </tr>
              `
          )
          .join('')}
            </table>
          </body>
        </html>
      `;

      if (!Print || !Print.printToFileAsync) {
        Alert.alert('Error', 'Funcionalidad de impresión no disponible');
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (!FileSystem || !FileSystem.copyAsync) {
        Alert.alert(
          'PDF Generado',
          'El PDF se generó correctamente. Función de compartir disponible en build local.'
        );
        return;
      }

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        const fileName = `reporte_${new Date(day.date)
          .toLocaleDateString()
          .replace(/\//g, '-')}.pdf`;
        const shareableUri = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({
          from: uri,
          to: shareableUri,
        });
        await Sharing.shareAsync(shareableUri);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert(
        'Error',
        'Hubo un error al generar el reporte. Por favor intenta de nuevo.'
      );
    }
  };

  const toggleTheme = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const toggle3x2 = () => setIs3x2Active(!is3x2Active);

  const addToCurrentOrder = (item) => {
    setCurrentOrder((prevOrder) => {
      const newOrder = [
        ...prevOrder,
        {
          ...item,
          time: new Date().toLocaleString(),
          isPromotional: false,
        },
      ];

      if (is3x2Active && item.type === 'Sushi') {
        const sushiItems = newOrder.filter((i) => i.type === 'Sushi');
        if (sushiItems.length % 3 === 0) {
          const lastSushiIndex = newOrder.length - 1;
          newOrder[lastSushiIndex] = {
            ...newOrder[lastSushiIndex],
            originalPrice: newOrder[lastSushiIndex].price,
            price: 0,
            isPromotional: true,
          };
        }
      }

      return newOrder;
    });
  };

  const handleCreateNewClient = (name) => {
    const newClient = {
      id: Date.now(),
      name,
      orders: [],
    };
    setClients((prevClients) => [...prevClients, newClient]);
    finalizeOrder(newClient);
  };

  const handleSelectClient = (client) => {
    finalizeOrder(client);
  };

  const finalizeOrder = (client) => {
    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

    const orderWithClientInfo = currentOrder.map((item) => ({
      ...item,
      clientId: client.id,
      clientName: client.name,
      time: new Date().toLocaleString(),
      paymentMethod: paymentMethod,
      cashReceived: paymentMethod === 'efectivo' ? parseFloat(cashAmount) : null,
      change: paymentMethod === 'efectivo' ? change : null,
    }));

    const updatedHistory = [...history, ...orderWithClientInfo];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    setCurrentOrder([]);
    setClientSelectionVisible(false);
    setPaymentMethod(null);
    setCashAmount('');
    setChange(0);
  };

  const confirmOrder = () => {
    if (currentOrder.length > 0) {
      setConfirmationModalVisible(false);
      setPaymentModalVisible(true);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);

    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

    if (method === 'efectivo') {
      setCashAmount('');
      setChange(0);
    } else {
      setPaymentModalVisible(false);
      setTimeout(() => {
        setClientSelectionVisible(true);
      }, 300);
    }
  };

  const calculateChange = (amount) => {
    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
    const changeAmount = parseFloat(amount) - total;
    setChange(changeAmount >= 0 ? changeAmount : 0);
  };

  const confirmCashPayment = () => {
    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

    if (!cashAmount || parseFloat(cashAmount) < total) {
      Alert.alert('Error', 'El monto recibido debe ser mayor o igual al total');
      return;
    }

    setPaymentModalVisible(false);
    setTimeout(() => {
      setClientSelectionVisible(true);
    }, 300);
  };

  const cancelOrder = () => {
    setCurrentOrder([]);
    setConfirmationModalVisible(false);
    setPaymentModalVisible(false);
    setPaymentMethod(null);
    setCashAmount('');
    setChange(0);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? '#121212' : '#fff',
        ...(Platform.OS === 'web' && {
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        })
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...(Platform.OS === 'web' && {
            cardStyle: { flex: 1, overflow: 'auto' }
          })
        }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen
          name="MainTabs"
          options={({ navigation }) => ({
            headerShown: true,
            headerStyle: {
              backgroundColor: 'red',
            },
            headerTintColor: '#fff',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Registro', { currentInfo: registroInfo })
                }
                style={{ marginLeft: 15 }}>
                <Image
                  source={require('./assets/images/LOGO.jpg')}
                  style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                    borderRadius: 20,
                  }}
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={toggle3x2} style={{ marginRight: 15 }}>
                  <View
                    style={[
                      styles.promoButton,
                      is3x2Active && styles.promoButtonActive,
                    ]}>
                    <Text style={styles.promoButtonText}>3x2</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExpenseScreen')}
                  style={{ marginRight: 15 }}>
                  <View style={styles.expenseButton}>
                    <Text style={styles.promoButtonText}>Egresos</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setOrderManagerVisible(true)}
                  style={{ marginRight: 15 }}>
                  <Icon name="list" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={showRegistroInfo}
                  style={{ marginRight: 15 }}>
                  <Icon name="information-circle" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={{ marginRight: 15 }}>
                  <Icon
                    name={isDarkMode ? 'moon' : 'sunny'}
                    size={30}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            ),
            headerTitle: () => null,
          })}>
          {(props) => (
            <TabNavigator
              {...props}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              is3x2Active={is3x2Active}
              toggle3x2={toggle3x2}
              history={history}
              setHistory={setHistory}
              currentOrder={currentOrder}
              addToCurrentOrder={addToCurrentOrder}
              registroInfo={registroInfo}
              setConfirmationModalVisible={setConfirmationModalVisible}
              expenses={expenses}
              handleResetExpenses={handleResetExpenses}
              handleAddExpense={handleAddExpense}
              handleUpdateExpenses={handleUpdateExpenses}
              navigation={navigation}
              setOrderManagerVisible={setOrderManagerVisible}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Registro">
          {(props) => (
            <RegistroScreen
              {...props}
              setRegistroInfo={setRegistroInfo}
              isDarkMode={isDarkMode}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Inventario"
          options={{
            title: 'Inventario',
            headerShown: true,
            headerStyle: {
              backgroundColor: 'red',
            },
            headerTintColor: '#fff',
          }}>
          {(props) => (
            <InventarioScreen
              {...props}
              isDarkMode={isDarkMode}
              storageKey="inventoryItems1"
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="ExpenseScreen"
          options={{
            title: 'Gestión de Egresos',
            headerShown: true,
            headerStyle: {
              backgroundColor: 'red',
            },
            headerTintColor: '#fff',
          }}>
          {(props) => (
            <ExpenseScreen
              isDarkMode={isDarkMode}
              expenses={expenses}
              onUpdateExpenses={setExpenses}
              navigation={navigation}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>

      {/* Modal de Confirmación de Pedido */}
      <Modal
        visible={confirmationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfirmationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isDarkMode && styles.darkModalContent,
            ]}>
            <Text
              style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
              Confirmar Pedido
            </Text>
            <ScrollView style={styles.orderList}>
              {currentOrder.map((item, index) => (
                <Text
                  key={index}
                  style={[
                    styles.modalDescription,
                    isDarkMode && styles.darkModalDescription,
                  ]}>
                  {item.type} - {item.name} -{' '}
                  {item.isPromotional ? 'Promoción 3x2' : `$${item.price}`}
                </Text>
              ))}
            </ScrollView>
            <Text
              style={[styles.totalText, isDarkMode && styles.darkModalTitle]}>
              Total: ${currentOrder.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmOrder}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelOrder}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Método de Pago */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
              Método de Pago
            </Text>

            <Text style={[styles.totalText, isDarkMode && styles.darkModalTitle]}>
              Total: ${currentOrder.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </Text>

            {!paymentMethod ? (
              <View style={styles.paymentMethodContainer}>
                <TouchableOpacity
                  style={styles.paymentMethodButton}
                  onPress={() => handlePaymentMethodSelect('efectivo')}>
                  <Text style={styles.paymentMethodText}>Efectivo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.paymentMethodButton}
                  onPress={() => handlePaymentMethodSelect('tarjeta')}>
                  <Text style={styles.paymentMethodText}>Tarjeta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentMethodButton, { backgroundColor: '#FFA500' }]}
                  onPress={() => handlePaymentMethodSelect('pendiente')}>
                  <Text style={styles.paymentMethodText}>Aún no cobrado</Text>
                </TouchableOpacity>
              </View>
            ) : paymentMethod === 'efectivo' ? (
              <View style={styles.cashPaymentContainer}>
                <Text style={[styles.cashPaymentLabel, isDarkMode && styles.darkModalDescription]}>
                  Monto recibido:
                </Text>
                <TextInput
                  style={[styles.cashInput, isDarkMode && styles.darkCashInput]}
                  placeholder="Ingresa el monto"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  keyboardType="numeric"
                  value={cashAmount}
                  onChangeText={(text) => {
                    setCashAmount(text);
                    calculateChange(text);
                  }}
                />
                {change > 0 && (
                  <Text style={[styles.changeText, isDarkMode && styles.darkModalDescription]}>
                    Cambio: ${change.toFixed(2)}
                  </Text>
                )}
                <View style={styles.cashButtonContainer}>
                  <TouchableOpacity
                    style={styles.confirmCashButton}
                    onPress={confirmCashPayment}>
                    <Text style={styles.buttonText}>Confirmar Pago</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setPaymentMethod(null)}>
                    <Text style={styles.buttonText}>Atrás</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setPaymentModalVisible(false);
                setPaymentMethod(null);
                setCashAmount('');
                setChange(0);
              }}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Gestión de Pedidos Archivados */}
      <OrderManagerModal
        visible={orderManagerVisible}
        onClose={() => setOrderManagerVisible(false)}
        isDarkMode={isDarkMode}
        archivedOrders={archivedOrders}
        currentOrder={currentOrder}
        onLoadOrder={handleLoadArchivedOrder}
        onArchiveOrder={handleArchiveOrder}
        onDeleteArchivedOrder={handleDeleteArchivedOrder}
        onEditOrderName={handleEditOrderName}
      />

      <ClientSelectionModal
        visible={clientSelectionVisible}
        onClose={() => {
          setClientSelectionVisible(false);
          setConfirmationModalVisible(false);
          setPaymentModalVisible(false);
        }}
        onSelectClient={handleSelectClient}
        onCreateNewClient={handleCreateNewClient}
        isDarkMode={isDarkMode}
        existingClients={clients}
      />

      <SavedDaysModal
        visible={savedDaysModalVisible}
        onClose={() => setSavedDaysModalVisible(false)}
        savedDays={savedDays}
        isDarkMode={isDarkMode}
        onExportDay={handleExportDayReport}
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <View style={{
        flex: 1,
        ...(Platform.OS === 'web' && {
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden'
        })
      }}>
        <MainApp />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  promoButton: {
    backgroundColor: '#ddd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
  },
  promoButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },
  promoButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  expenseButton: {
    backgroundColor: '#ddd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    maxWidth: 500,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  darkModalTitle: {
    color: '#ffffff',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  darkModalDescription: {
    color: '#cccccc',
  },
  orderList: {
    maxHeight: 300,
    width: '100%',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orderButton: {
    position: 'absolute',
    bottom: Platform.select({
      ios: 80,
      android: 80,
      web: 90,
    }),
    right: 20,
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'scale(1.05)',
      },
    }),
  },
  darkFloatingButton: {
    backgroundColor: '#333',
  },
  floatingButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paymentMethodContainer: {
    width: '100%',
    marginVertical: 15,
  },
  paymentMethodButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  paymentMethodText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cashPaymentContainer: {
    width: '100%',
    marginVertical: 15,
  },
  cashPaymentLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  cashInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    width: '100%',
  },
  darkCashInput: {
    backgroundColor: '#444',
    borderColor: '#666',
    color: 'white',
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'green',
  },
  cashButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmCashButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
});