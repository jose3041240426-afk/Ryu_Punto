import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  TextInput,
  Keyboard,
  Switch,
  useWindowDimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { generatePDFContent, generateTicketHTML, exportToPDF, printTicket, exportToImage } from '../utils/pdfGenerator';
import useBluetoothPrinter from '../hooks/useBluetoothPrinter';
import CalculatorModal from '../components/CalculatorModal';

// Importar imágenes locales
import DetailsIcon from '../../assets/images/info.png';
import PDFIcon from '../../assets/images/pdf.png';
import InventoryIcon from '../../assets/images/inventario.png';
import ImageIcon from '../../assets/images/imagen.png';
import CalculatorIcon from '../../assets/images/calculadora.png';
import ResetIcon from '../../assets/images/reinicio.png';
import ArchiveIcon from '../../assets/images/Bebidas.png';

const HISTORY_STORAGE_KEY = '@ryu_sushi_history';
const PAYMENT_STATUS_KEY = '@payment_status';
const EDIT_HISTORY_KEY = '@ryu_sushi_edit_history';

// Listas de productos para la edición
const sushiProducts = [
  { id: 's1', name: 'Torrelo', price: 100, type: 'Sushi' },
  { id: 's2', name: 'Vaquero', price: 100, type: 'Sushi' },
  { id: 's3', name: 'Mar y tierra', price: 100, type: 'Sushi' },
  { id: 's4', name: 'Camaron', price: 100, type: 'Sushi' },
  { id: 's5', name: 'Surimi', price: 100, type: 'Sushi' },
  { id: 's6', name: 'Costeño', price: 100, type: 'Sushi' },
  { id: 's7', name: 'Vegetariano', price: 95, type: 'Sushi' },
  { id: 's8', name: 'Gallinazo', price: 100, type: 'Sushi' },
  { id: 's9', name: 'Res', price: 100, type: 'Sushi' },
  { id: 's10', name: 'Ryu burro', price: 105, type: 'Sushi' },
  { id: 's11', name: 'Flamin', price: 105, type: 'Sushi' },
  { id: 's12', name: 'Goliat', price: 110, type: 'Sushi' },
  { id: 's13', name: 'Pastor', price: 100, type: 'Sushi' },
];

const friesProducts = [
  { id: 'f1', name: 'Papas a la Francesa', price: 50, type: 'Papas' },
  { id: 'f2', name: 'Papas Gajo', price: 60, type: 'Papas' },
];

const wingsProducts = [
  // Alitas
  { id: 'w1', name: 'Wings Naturales', price: 100, type: 'Alitas', subtype: 'completa', flavor: 'Natural' },
  { id: 'w2', name: 'Wings BBQ', price: 105, type: 'Alitas', subtype: 'completa', flavor: 'BBQ' },
  { id: 'w3', name: 'Wings Búfalo', price: 105, type: 'Alitas', subtype: 'completa', flavor: 'Búfalo' },
  { id: 'w4', name: 'Wings Mango Habanero', price: 110, type: 'Alitas', subtype: 'completa', flavor: 'Mango Habanero' },
  { id: 'winf', name: 'Wings Infierno', price: 120, type: 'Alitas', subtype: 'completa', flavor: 'Infierno' },

  // Boneless
  { id: 'w9', name: 'Boneless Natural', price: 130, type: 'Boneless', subtype: 'completa', flavor: 'Natural' },
  { id: 'w10', name: 'Boneless BBQ', price: 135, type: 'Boneless', subtype: 'completa', flavor: 'BBQ' },
  { id: 'w11', name: 'Boneless Búfalo', price: 135, type: 'Boneless', subtype: 'completa', flavor: 'Búfalo' },
  { id: 'w12', name: 'Boneless Mango Habanero', price: 140, type: 'Boneless', subtype: 'completa', flavor: 'Mango Habanero' },
  { id: 'binf', name: 'Boneless Infierno', price: 150, type: 'Boneless', subtype: 'completa', flavor: 'Infierno' },

  // Kilo Alitas
  { id: 'wa1', name: 'Kilo Alitas Naturales', price: 200, type: 'Alitas', subtype: 'kilo', flavor: 'Natural' },
  { id: 'wa2', name: 'Kilo Alitas BBQ', price: 200, type: 'Alitas', subtype: 'kilo', flavor: 'BBQ' },
  { id: 'wa3', name: 'Kilo Alitas Búfalo', price: 200, type: 'Alitas', subtype: 'kilo', flavor: 'Búfalo' },
  { id: 'wa4', name: 'Kilo Alitas Mango Habanero', price: 200, type: 'Alitas', subtype: 'kilo', flavor: 'Mango Habanero' },
  { id: 'wa5', name: 'Kilo Alitas Infierno', price: 200, type: 'Alitas', subtype: 'kilo', flavor: 'Infierno' },

  // Kilo Boneless
  { id: 'wk1', name: 'Kilo Boneless Natural', price: 250, type: 'Boneless', subtype: 'kilo', flavor: 'Natural' },
  { id: 'wk2', name: 'Kilo Boneless BBQ', price: 250, type: 'Boneless', subtype: 'kilo', flavor: 'BBQ' },
  { id: 'wk3', name: 'Kilo Boneless Búfalo', price: 250, type: 'Boneless', subtype: 'kilo', flavor: 'Búfalo' },
  { id: 'wk4', name: 'Kilo Boneless Mango Habanero', price: 250, type: 'Boneless', subtype: 'kilo', flavor: 'Mango Habanero' },
  { id: 'wk5', name: 'Kilo Boneless Infierno', price: 250, type: 'Boneless', subtype: 'kilo', flavor: 'Infierno' },
];

// Opciones para personalización
const rollOptions = ['Empanizado', 'Natural', 'Alga fuera', 'Flamin'];
const wingFlavorOptions = ['Natural', 'BBQ', 'Búfalo', 'Mango Habanero', 'Infierno'];
const rollListOptions = [
  'Torrelo', 'Vaquero', 'Mar y tierra', 'Camaron', 'Surimi', 'Costeño',
  'Vegetariano', 'Gallinazo', 'Res', 'Ryu burro', 'Flamin', 'Goliat', 'Pastor'
];
const bebidaOptions = [
  'Coca-Cola 500ml', 'Jugo del Valle 237ml', 'Sprite 500ml (Vidrio)',
  'Agua de Jamaica', 'Agua de Horchata'
];

const combosPredefinidos = [
  {
    id: 'combo1',
    name: 'COMBO 1',
    basePrice: 100,
    type: 'Combo',
    description: '200gr de BONELESS y 150gr de PAPAS A LA FRANCESA',
    shortName: 'Combo 1',
    options: [{ type: 'sabor', label: 'Sabor del Boneless', key: 'sabor_boneless', options: wingFlavorOptions }]
  },
  {
    id: 'combo2',
    name: 'COMBO 2',
    basePrice: 130,
    type: 'Combo',
    description: '1 SUSHI y 150gr de PAPAS A LA FRANCESA',
    shortName: 'Combo 2',
    options: [{ type: 'rollo', label: 'Tipo de Rollo', key: 'tipo_rollo', options: rollListOptions }]
  },
  {
    id: 'combo3',
    name: 'COMBO 3',
    basePrice: 100,
    type: 'Combo',
    description: '200gr de ALITAS y 150gr de PAPAS A LA FRANCESA',
    shortName: 'Combo 3',
    options: [{ type: 'sabor', label: 'Sabor de las Alitas', key: 'sabor_alitas', options: wingFlavorOptions }]
  },
  {
    id: 'combo4',
    name: 'COMBO 4',
    basePrice: 140,
    type: 'Combo',
    description: '200gr de BONELESS y 200gr de ALITAS',
    shortName: 'Combo 4',
    options: [{
      type: 'multiple-sabor',
      label: 'Sabores',
      options: [
        { label: 'Sabor del Boneless', key: 'sabor_boneless', options: wingFlavorOptions },
        { label: 'Sabor de las Alitas', key: 'sabor_alitas', options: wingFlavorOptions }
      ]
    }]
  },
  {
    id: 'combo5',
    name: 'COMBO 5',
    basePrice: 200,
    type: 'Combo',
    description: '200gr de ALITAS, 200gr de BONELESS y 1 SUSHI',
    shortName: 'Combo 5',
    options: [{
      type: 'multiple',
      label: 'Selecciones',
      options: [
        { label: 'Sabor de las Alitas', key: 'sabor_alitas', options: wingFlavorOptions },
        { label: 'Sabor del Boneless', key: 'sabor_boneless', options: wingFlavorOptions },
        { label: 'Tipo de Rollo', key: 'tipo_rollo', options: rollListOptions }
      ]
    }]
  },
  {
    id: 'combo6',
    name: 'COMBO 6',
    basePrice: 600,
    type: 'Combo',
    description: '3 ROLLOS DE SUSHI, 1 BONELESS, 1 ALITAS, 1 PAPAS Y UN REFRESCO',
    shortName: 'Combo 6',
    options: [{
      type: 'combo6-rollos',
      label: 'Selecciones del Combo 6',
      options: [
        { label: 'Sabor del Boneless', key: 'sabor_boneless', options: wingFlavorOptions },
        { label: 'Sabor de las Alitas', key: 'sabor_alitas', options: wingFlavorOptions },
        { label: 'Refresco', key: 'refresco', options: bebidaOptions }
      ]
    }]
  },
];

const drinkProducts = [
  { id: 'd1', name: 'Coca-Cola 500ml', price: 20, type: 'Bebida' },
  { id: 'd2', name: 'Jugo del Valle 237ml', price: 10, type: 'Bebida' },
  { id: 'd3', name: 'Sprite 500ml (Vidrio)', price: 25, type: 'Bebida' },
  { id: 'd4', name: 'Agua de Jamaica', price: 15, type: 'Bebida' },
  { id: 'd5', name: 'Agua de Horchata', price: 15, type: 'Bebida' },
];

const extraProducts = [
  combosPredefinidos[0], // Combo 1 - BONELESS y PAPAS
  combosPredefinidos[1], // Combo 2 - SUSHI y PAPAS
  combosPredefinidos[2], // Combo 3 - ALITAS y PAPAS
  combosPredefinidos[3], // Combo 4 - BONELESS y ALITAS
  combosPredefinidos[4], // Combo 5 - ALITAS, BONELESS y SUSHI
  { id: 'e6', name: 'Combo 3x2 Sushi', price: 200, type: 'Sushi', isPromotional: true },
  { id: 'e7', name: 'Palillos', price: 10, type: 'Extra' },
];

import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los tuyos
const supabaseUrl = "https://wkkrbknqqiohbxwsfpvc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra3Jia25xcWlvaGJ4d3NmcHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjczNzMsImV4cCI6MjA2NzUwMzM3M30.KDg5sjVEnpWhZvQIhadxDUQIgq0WTTHmlrfEgHiXZqQ";

const supabase = createClient(supabaseUrl, supabaseKey);

// Función auxiliar para almacenamiento compatible con web
const storage = {
  // Detectar si estamos en web
  isWeb: () => Platform.OS === 'web',

  // Obtener item
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  // Guardar item
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  // Eliminar item
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  // Limpiar todo el almacenamiento
  clear: async () => {
    if (Platform.OS === 'web') {
      localStorage.clear();
    } else {
      await AsyncStorage.clear();
    }
  }
};

const HistorialScreen = ({
  history = [],
  isDarkMode,
  onUpdateHistory,
  registro = {},
  expenses = [],
  navigation
}) => {
  const { printTicket: printBluetoothTicket } = useBluetoothPrinter();
  const scrollViewRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('todos'); // 'todos', 'efectivo', 'tarjeta', 'pendiente'

  const [imageProcessingModalVisible, setImageProcessingModalVisible] = useState(false);
  const [imageProcessingComponent, setImageProcessingComponent] = useState(null);
  const [calculatorModalVisible, setCalculatorModalVisible] = useState(false);
  const [calculatorInput, setCalculatorInput] = useState('');
  const [calculatorHistory, setCalculatorHistory] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState({});
  const passwordInputRef = useRef(null);

  // Estados para edición de pedidos
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDidiFood, setIsDidiFood] = useState(false);


  // Estados para personalización de productos
  const [sushiModalVisible, setSushiModalVisible] = useState(false);
  const [selectedSushiItem, setSelectedSushiItem] = useState(null);

  const [wingsComboModalVisible, setWingsComboModalVisible] = useState(false);
  const [selectedWingsType, setSelectedWingsType] = useState('');
  const [selectedWingsSubtype, setSelectedWingsSubtype] = useState('');
  const [selectedWingsFlavors, setSelectedWingsFlavors] = useState([]);

  const [comboCustomModalVisible, setComboCustomModalVisible] = useState(false);
  const [selectedComboItem, setSelectedComboItem] = useState(null);
  const [comboSelections, setComboSelections] = useState({});
  // Estado para los 3 slots de rollos del Combo 6
  const [combo6RollosSlots, setCombo6RollosSlots] = useState([
    { rollo: '', preparacion: '' },
    { rollo: '', preparacion: '' },
    { rollo: '', preparacion: '' },
  ]);
  const [combo6ActiveSlot, setCombo6ActiveSlot] = useState(null); // null | 'rollo' | 'preparacion' + slotIdx

  // Estados para flujo de cobro en edición
  const [paymentFlowVisible, setPaymentFlowVisible] = useState(false);
  const [paymentFlowMethod, setPaymentFlowMethod] = useState(null);
  const [paymentFlowCashAmount, setPaymentFlowCashAmount] = useState('');
  const [paymentFlowChange, setPaymentFlowChange] = useState(0);

  const { width } = useWindowDimensions();

  // Estado para mantener el orden de los clientes
  const [clientOrder, setClientOrder] = useState([]);

  // Motivos predefinidos para eliminación
  const deleteReasons = [
    'Equivocación',
    'Cliente canceló',
    'Cambio de decisión',
    'Error en el pedido',
    'Otros'
  ];

  // Cargar historial, estados de pago y orden desde almacenamiento
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar historial
        const cachedHistory = await storage.getItem(HISTORY_STORAGE_KEY);
        if (cachedHistory && (!history || history.length === 0)) {
          const parsedHistory = JSON.parse(cachedHistory);
          onUpdateHistory(parsedHistory);

          // Generar orden inicial basado en el tiempo si no existe
          const uniqueClientIds = [...new Set(parsedHistory.map(item => String(item.clientId)))];
          setClientOrder(uniqueClientIds);
        }

        // Cargar estados de pago
        const savedPaymentStatus = await storage.getItem(PAYMENT_STATUS_KEY);
        if (savedPaymentStatus) {
          setPaymentStatus(JSON.parse(savedPaymentStatus));
        }

        // Cargar orden de clientes guardado
        const savedClientOrder = await storage.getItem(EDIT_HISTORY_KEY);
        if (savedClientOrder) {
          setClientOrder(JSON.parse(savedClientOrder));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Guardar historial en almacenamiento
  useEffect(() => {
    const saveToCacheAsync = async (data) => {
      try {
        await storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving to cache:', error);
      }
    };
    if (history?.length > 0) {
      saveToCacheAsync(history);
    }
  }, [history]);

  // Guardar estados de pago en almacenamiento
  useEffect(() => {
    const savePaymentStatus = async () => {
      try {
        await storage.setItem(PAYMENT_STATUS_KEY, JSON.stringify(paymentStatus));
      } catch (error) {
        console.error('Error saving payment status:', error);
      }
    };

    if (Object.keys(paymentStatus).length > 0) {
      savePaymentStatus();
    }
  }, [paymentStatus]);

  // Guardar orden de clientes en almacenamiento
  useEffect(() => {
    const saveClientOrder = async () => {
      try {
        await storage.setItem(EDIT_HISTORY_KEY, JSON.stringify(clientOrder));
      } catch (error) {
        console.error('Error saving client order:', error);
      }
    };

    if (clientOrder.length > 0) {
      saveClientOrder();
    }
  }, [clientOrder]);

  const handleResetHistory = useCallback(() => {
    Alert.alert(
      'Confirmar Reinicio',
      '¿Estás seguro que deseas reiniciar todo el historial? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: async () => {
            try {
              // Usar la función de almacenamiento compatible con web
              await storage.removeItem(HISTORY_STORAGE_KEY);
              await storage.removeItem('@ryu_sushi_clients');
              await storage.removeItem(PAYMENT_STATUS_KEY);
              await storage.removeItem(EDIT_HISTORY_KEY);

              // Si estamos en web, también podemos limpiar localStorage completamente
              if (Platform.OS === 'web') {
                // Opcional: limpiar todo localStorage para la aplicación
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key.startsWith('@ryu_sushi')) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
              }

              onUpdateHistory([]);
              setPaymentStatus({});
              setClientOrder([]);

              // Mostrar confirmación
              if (Platform.OS === 'web') {
                alert('Historial reiniciado correctamente');
              }
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'No se pudo reiniciar el historial');
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, [onUpdateHistory]);

  // Función alternativa para web que usa window.confirm
  const handleResetHistoryWeb = useCallback(() => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        '¿Estás seguro que deseas reiniciar todo el historial? Esta acción no se puede deshacer.'
      );

      if (confirmed) {
        try {
          // Limpiar datos específicos de la aplicación
          storage.removeItem(HISTORY_STORAGE_KEY);
          storage.removeItem('@ryu_sushi_clients');
          storage.removeItem(PAYMENT_STATUS_KEY);
          storage.removeItem(EDIT_HISTORY_KEY);

          // Limpiar cualquier otro dato relacionado
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('@ryu_sushi')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));

          onUpdateHistory([]);
          setPaymentStatus({});
          setClientOrder([]);

          alert('Historial reiniciado correctamente');
        } catch (error) {
          console.error('Error resetting data:', error);
          alert('Error: No se pudo reiniciar el historial');
        }
      }
    } else {
      // Usar la función original para React Native
      handleResetHistory();
    }
  }, [onUpdateHistory, handleResetHistory]);

  const togglePaymentStatus = useCallback(async (clientId) => {
    const newStatus = !paymentStatus[clientId];
    setPaymentStatus(prev => ({
      ...prev,
      [clientId]: newStatus
    }));
  }, [paymentStatus]);

  const handleDeleteConfirmation = useCallback((clientId) => {
    setCurrentClientId(clientId);
    setDeleteModalVisible(true);
    setSelectedReason('');
    setCustomReason('');
  }, []);

  const verifyPassword = useCallback(() => {
    if (passwordInput === '210210') {
      setPasswordStatus('correct');
      setTimeout(() => {
        setPasswordModalVisible(false);
        proceedWithDeletion();
      }, 1000);
    } else {
      setPasswordStatus('incorrect');
      setPasswordAttempts(prev => prev + 1);
      if (passwordAttempts >= 2) {
        setTimeout(() => {
          setPasswordModalVisible(false);
          setPasswordAttempts(0);
          Alert.alert('Error', 'Has excedido el número máximo de intentos');
        }, 1000);
      }
    }
  }, [passwordInput, passwordAttempts]);

  const proceedWithDeletion = useCallback(async () => {
    if (!currentClientId) return;

    const motivo = selectedReason === 'Otros' ? customReason : selectedReason;

    try {
      const updatedHistory = history.filter((item) => String(item.clientId) !== String(currentClientId));
      onUpdateHistory(updatedHistory);

      // Eliminar el estado de pago para este cliente
      const newPaymentStatus = { ...paymentStatus };
      delete newPaymentStatus[currentClientId];
      setPaymentStatus(newPaymentStatus);

      // Eliminar del orden de clientes
      setClientOrder(prev => prev.filter(id => String(id) !== String(currentClientId)));

      // Mostrar alerta según la plataforma
      if (Platform.OS === 'web') {
        alert(`Éxito: El pedido ha sido eliminado correctamente.\nMotivo: ${motivo}`);
      } else {
        Alert.alert(
          'Éxito',
          `El pedido ha sido eliminado correctamente.\nMotivo: ${motivo}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      if (Platform.OS === 'web') {
        alert('Error: No se pudo eliminar el pedido');
      } else {
        Alert.alert('Error', 'No se pudo eliminar el pedido', [{ text: 'OK' }]);
      }
    } finally {
      setDeleteModalVisible(false);
      setPasswordInput('');
      setPasswordStatus(null);
      setPasswordAttempts(0);
    }
  }, [currentClientId, selectedReason, customReason, history, onUpdateHistory, paymentStatus]);

  const handleDeleteOrder = useCallback(() => {
    if (!selectedReason) {
      if (Platform.OS === 'web') {
        alert('Error: Por favor selecciona un motivo para eliminar el pedido');
      } else {
        Alert.alert('Error', 'Por favor selecciona un motivo para eliminar el pedido');
      }
      return;
    }

    if (selectedReason === 'Otros' && !customReason.trim()) {
      if (Platform.OS === 'web') {
        alert('Error: Por favor especifica el motivo para eliminar el pedido');
      } else {
        Alert.alert('Error', 'Por favor especifica el motivo para eliminar el pedido');
      }
      return;
    }

    setDeleteModalVisible(false);
    setTimeout(() => {
      setPasswordModalVisible(true);
      setPasswordInput('');
      setPasswordStatus(null);

      const focusInput = () => {
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
      };

      if (Platform.OS === 'ios') {
        setTimeout(focusInput, 300);
      } else {
        setTimeout(focusInput, 100);
      }
    }, 300);
  }, [selectedReason, customReason]);


  const calculateOrderTotals = useCallback((orderItems) => {
    return orderItems.reduce((acc, item) => {
      const price = parseFloat(item.price) || 0;
      acc.total += price;

      if (item.type === 'Sushi') acc.sushi += price;
      else if (item.type === 'Alitas') {
        acc.wings += price;
      }
      else if (item.type === 'Bebida') acc.drinks += price;
      else if (item.type === 'Papas') acc.fries += price;
      else if (item.type === 'Boneless') {
        acc.boneless += price;
      }
      else if (item.type === 'Postres') acc.desserts += price;

      return acc;
    }, {
      total: 0,
      sushi: 0,
      wings: 0,
      drinks: 0,
      fries: 0,
      boneless: 0,
      desserts: 0
    });
  }, []);

  const handleStartPaymentFlow = () => {
    setPaymentFlowMethod(null);
    setPaymentFlowCashAmount('');
    setPaymentFlowChange(0);
    setPaymentFlowVisible(true);
  };

  const handlePaymentFlowMethodSelect = (method) => {
    setPaymentFlowMethod(method);
    if (method !== 'efectivo') {
      finalizePaymentFlow(method);
    }
  };

  const calculatePaymentFlowChange = (amount) => {
    const total = calculateOrderTotals(editedItems).total;
    const changeAmount = parseFloat(amount) - total;
    setPaymentFlowChange(changeAmount >= 0 ? changeAmount : 0);
  };

  const finalizePaymentFlow = (method, cash = null, changeAmt = null) => {
    const clientId = editingOrder?.clientId;
    if (!clientId) return;

    // 1. Actualizar estado visual global
    setPaymentStatus(prev => ({
      ...prev,
      [clientId]: true
    }));

    // 2. Actualizar metadatos de pago en el historial real para este cliente
    const updatedHistory = history.map(item => {
      if (String(item.clientId) === String(clientId)) {
        return {
          ...item,
          paymentMethod: method,
          cashReceived: cash,
          change: changeAmt
        };
      }
      return item;
    });

    // 3. Sincronizar editedItems para que si el usuario pulsa "Guardar Cambios" no se pierdan estos datos
    setEditedItems(prev => prev.map(item => ({
      ...item,
      paymentMethod: method,
      cashReceived: cash,
      change: changeAmt
    })));

    onUpdateHistory(updatedHistory);
    setPaymentFlowVisible(false);

    if (Platform.OS === 'web') {
      alert(`Cobro registrado con éxito (${method})${cash ? `. Recibido: $${cash}. Cambio: $${changeAmt}` : ''}`);
    } else {
      Alert.alert('Éxito', `Cobro registrado con éxito (${method})${cash ? `. Recibido: $${cash}. Cambio: $${changeAmt}` : ''}`);
    }
  };

  const confirmCashPaymentFlow = () => {
    const total = calculateOrderTotals(editedItems).total;
    if (!paymentFlowCashAmount || parseFloat(paymentFlowCashAmount) < total) {
      if (Platform.OS === 'web') alert('Error: El monto recibido debe ser mayor o igual al total');
      else Alert.alert('Error', 'El monto recibido debe ser mayor o igual al total');
      return;
    }
    finalizePaymentFlow('efectivo', parseFloat(paymentFlowCashAmount), paymentFlowChange);
  };

  const calculateProductTotals = useCallback((history) => {
    return history.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = { quantity: 0, total: 0 };
      }
      acc[item.type].quantity += 1;
      acc[item.type].total += parseFloat(item.price) || 0;
      return acc;
    }, {});
  }, []);

  const exportTicketToPDF = useCallback(async (orderData) => {
    const html = generateTicketHTML(orderData, registro);
    const fileName = `ticket_cliente${orderData.clientNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    await exportToPDF(html, fileName);
  }, [registro]);

  const handleExportToPDF = useCallback(async () => {
    try {
      const htmlContent = generatePDFContent(history, expenses, registro);
      const fileName = `reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`;
      await exportToPDF(htmlContent, fileName);

      if (Platform.OS === 'web') {
        alert('Éxito: El PDF se ha generado correctamente');
      } else {
        Alert.alert('Éxito', 'El PDF se ha generado correctamente', [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      if (Platform.OS === 'web') {
        alert('Error: No se pudo generar el PDF. Por favor, intente nuevamente.');
      } else {
        Alert.alert('Error', 'No se pudo generar el PDF. Por favor, intente nuevamente.', [{ text: 'OK' }]);
      }
    }
  }, [history, expenses, registro]);

  const handleExportToImage = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        alert('Procesando: Generando imagen del reporte...');
      } else {
        Alert.alert('Procesando', 'Generando imagen del reporte...', [{ text: 'OK' }]);
      }

      const htmlContent = generatePDFContent(history, expenses, registro);
      const fileName = `reporte_ventas_${new Date().toISOString().split('T')[0]}`;

      const ImageRendererComponent = await exportToImage(htmlContent, fileName);

      if (ImageRendererComponent) {
        setImageProcessingComponent(<ImageRendererComponent />);
        setImageProcessingModalVisible(true);
      }
    } catch (error) {
      console.error('Error al exportar imagen:', error);
      setImageProcessingModalVisible(false);
      if (Platform.OS === 'web') {
        alert('Error: No se pudo generar la imagen. Por favor, intente nuevamente.');
      } else {
        Alert.alert('Error', 'No se pudo generar la imagen. Por favor, intente nuevamente.', [{ text: 'OK' }]);
      }
    }
  }, [history, expenses, registro]);

  const ordersWithClientNumbers = useMemo(() => {
    const clientGroups = history.reduce((groups, item) => {
      const stringClientId = String(item.clientId);
      if (!groups[stringClientId]) {
        groups[stringClientId] = [];
      }
      groups[stringClientId].push(item);
      return groups;
    }, {});

    return Object.entries(clientGroups).reduce((orders, [clientId, items]) => {
      const clientName = typeof items[0].clientName === 'object'
        ? items[0].clientName?.name || `Cliente ${Object.keys(orders).length + 1}`
        : String(items[0].clientName || `Cliente ${Object.keys(orders).length + 1}`);

      orders[clientId] = {
        items,
        clientNumber: clientName,
        time: items[0].time,
        clientId: String(clientId),
      };
      return orders;
    }, {});
  }, [history]);

  // ORDENAR los clientes según el orden guardado
  const sortedClientIds = useMemo(() => {
    if (clientOrder.length === 0) {
      // Si no hay orden guardado, usar orden por tiempo
      return Object.keys(ordersWithClientNumbers).sort((a, b) => {
        const timeA = ordersWithClientNumbers[a]?.time || '';
        const timeB = ordersWithClientNumbers[b]?.time || '';
        return timeA.localeCompare(timeB);
      });
    }

    // Filtrar solo los clientes que existen en el historial actual
    const existingClientIds = Object.keys(ordersWithClientNumbers);
    const orderedIds = clientOrder.filter(id => existingClientIds.includes(id));

    // Agregar cualquier nuevo cliente al final
    const newClientIds = existingClientIds.filter(id => !clientOrder.includes(id));

    return [...orderedIds, ...newClientIds];
  }, [ordersWithClientNumbers, clientOrder]);

  const filteredClientIds = useMemo(() => {
    if (paymentFilter === 'todos') return sortedClientIds;

    return sortedClientIds.filter(clientId => {
      const orderData = ordersWithClientNumbers[clientId];
      if (!orderData || !orderData.items || orderData.items.length === 0) return false;

      if (paymentFilter === 'didi') {
        return orderData.items.some(item => item.isDidiFood === true);
      }

      const method = orderData.items[0]?.paymentMethod || 'pendiente';

      if (paymentFilter === 'pendiente') {
        return method === 'pendiente';
      }
      return method === paymentFilter;
    });
  }, [sortedClientIds, ordersWithClientNumbers, paymentFilter]);

  // Funciones para edición de pedidos
  const handleEditOrder = useCallback((clientId) => {
    const orderData = ordersWithClientNumbers[clientId];
    if (!orderData) return;

    setEditingOrder(orderData);
    setEditedItems([...orderData.items]);
    // Inicializar estado DiDi Food desde los items
    setIsDidiFood(orderData.items.some(item => item.isDidiFood === true));
    // Buscar si ya hay una nota guardada para este pedido
    const existingNote = orderData.items[0]?.note || '';
    setOrderNote(existingNote);
    setEditModalVisible(true);
  }, [ordersWithClientNumbers]);

  const handleRemoveItemFromEdit = useCallback((index) => {
    setEditedItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Manejadores para personalización - CORREGIDOS COMPLETAMENTE
  const handleSushiOptionSelect = useCallback((option) => {
    if (!selectedSushiItem || !editingOrder) return;

    let finalPrice = selectedSushiItem.price;
    if (option === 'Flamin' && selectedSushiItem.name !== 'Flamin') {
      finalPrice += 5;
    }

    // Obtener info de pago actual
    const currentPaymentMethod = editedItems[0]?.paymentMethod || 'pendiente';
    const currentCashReceived = editedItems[0]?.cashReceived || null;
    const currentChange = editedItems[0]?.change || null;

    const newItem = {
      ...selectedSushiItem,
      name: `${selectedSushiItem.name} (${option})`,
      price: finalPrice,
      clientId: editingOrder.clientId,
      clientName: editingOrder.clientNumber,
      time: editingOrder.time,
      details: option,
      paymentMethod: currentPaymentMethod,
      cashReceived: currentCashReceived,
      change: currentChange
    };

    setEditedItems(prev => [...prev, newItem]);
    setSushiModalVisible(false);
    setSelectedSushiItem(null);
    setAddProductModalVisible(false);
  }, [selectedSushiItem, editingOrder, editedItems]);

  const handleWingsComboConfirm = useCallback(() => {
    if (selectedWingsFlavors.length !== 2 || !editingOrder) return;

    // Buscar los productos que coincidan con los sabores seleccionados
    const flavor1 = wingsProducts.find(f =>
      f.flavor === selectedWingsFlavors[0] &&
      f.type === selectedWingsType &&
      f.subtype === selectedWingsSubtype
    );
    const flavor2 = wingsProducts.find(f =>
      f.flavor === selectedWingsFlavors[1] &&
      f.type === selectedWingsType &&
      f.subtype === selectedWingsSubtype
    );

    if (!flavor1 || !flavor2) {
      console.error('No se encontraron los productos:', { selectedWingsFlavors, selectedWingsType, selectedWingsSubtype });
      return;
    }

    const highestPrice = Math.max(flavor1.price, flavor2.price);
    const typeText = selectedWingsType === 'Alitas' ? 'Alitas' : 'Boneless';
    const comboName = `${typeText} ${selectedWingsFlavors[0]}/${selectedWingsFlavors[1]}`;

    // Obtener info de pago actual
    const currentPaymentMethod = editedItems[0]?.paymentMethod || 'pendiente';
    const currentCashReceived = editedItems[0]?.cashReceived || null;
    const currentChange = editedItems[0]?.change || null;

    const newItem = {
      id: `combo_${Date.now()}`,
      type: selectedWingsType,
      name: comboName,
      price: highestPrice,
      clientId: editingOrder.clientId,
      clientName: editingOrder.clientNumber,
      time: editingOrder.time,
      details: `Combinación: ${selectedWingsFlavors[0]} + ${selectedWingsFlavors[1]} (${selectedWingsSubtype === 'completa' ? 'Orden completa' : 'Kilo'})`,
      paymentMethod: currentPaymentMethod,
      cashReceived: currentCashReceived,
      change: currentChange
    };

    console.log('Agregando item combinado:', newItem);
    setEditedItems(prev => [...prev, newItem]);
    setWingsComboModalVisible(false);
    setSelectedWingsFlavors([]);
    setSelectedWingsType('');
    setSelectedWingsSubtype('');
    setAddProductModalVisible(false);
  }, [selectedWingsFlavors, editingOrder, selectedWingsType, selectedWingsSubtype, editedItems]);

  const handleComboConfirm = useCallback(() => {
    if (!selectedComboItem || !editingOrder) return;

    const option = selectedComboItem.options[0];
    let isValid = true;
    let errorMessage = '';

    // Validación especial para Combo 6
    if (option.type === 'combo6-rollos') {
      const incompleteSlot = combo6RollosSlots.findIndex(s => !s.rollo || !s.preparacion);
      if (incompleteSlot !== -1) {
        isValid = false;
        errorMessage = `Completa el Rollo ${incompleteSlot + 1}: elige rollo y preparación`;
      }
      if (isValid) {
        for (const subOpt of option.options) {
          if (!comboSelections[subOpt.key]) {
            isValid = false;
            errorMessage = `Debes seleccionar ${subOpt.label.toLowerCase()}`;
            break;
          }
        }
      }
      if (!isValid) {
        Platform.OS === 'web' ? alert(errorMessage) : Alert.alert('Error', errorMessage);
        return;
      }

      const s = comboSelections;
      const rollosDesc = combo6RollosSlots.map((sl, i) => `${sl.rollo} (${sl.preparacion})`).join(', ');
      const displayName = `Combo 6: ${rollosDesc}, Boneless ${s.sabor_boneless}, Alitas ${s.sabor_alitas}, Papas y ${s.refresco}`;
      const detailsString = `${selectedComboItem.description} | Rollos: ${rollosDesc} | Boneless: ${s.sabor_boneless} | Alitas: ${s.sabor_alitas} | Refresco: ${s.refresco}`;

      const currentPaymentMethod = editedItems[0]?.paymentMethod || 'pendiente';
      const currentCashReceived = editedItems[0]?.cashReceived || null;
      const currentChange = editedItems[0]?.change || null;

      const newItem = {
        id: `combo_${Date.now()}`,
        type: 'Combo',
        name: displayName,
        price: selectedComboItem.basePrice,
        clientId: editingOrder.clientId,
        clientName: editingOrder.clientNumber,
        time: editingOrder.time,
        details: detailsString,
        paymentMethod: currentPaymentMethod,
        cashReceived: currentCashReceived,
        change: currentChange
      };

      setEditedItems(prev => [...prev, newItem]);
      setComboCustomModalVisible(false);
      setSelectedComboItem(null);
      setComboSelections({});
      setCombo6RollosSlots([
        { rollo: '', preparacion: '' },
        { rollo: '', preparacion: '' },
        { rollo: '', preparacion: '' },
      ]);
      setCombo6ActiveSlot(null);
      setAddProductModalVisible(false);
      return;
    }

    if (option.type === 'multiple-select') {
      const selections = comboSelections[option.key] || [];
      if (selections.length !== option.maxSelections) {
        isValid = false;
        errorMessage = `Debes seleccionar exactamente ${option.maxSelections} rollos`;
      }
    } else if (option.type === 'multiple' || option.type === 'multiple-sabor' || option.type === 'multiple-complex') {
      for (const opt of option.options) {
        if (!comboSelections[opt.key]) {
          isValid = false;
          errorMessage = `Debes seleccionar ${opt.label.toLowerCase()}`;
          break;
        }
      }
    } else if (!comboSelections[option.key]) {
      isValid = false;
      errorMessage = `Debes seleccionar ${option.label.toLowerCase()}`;
    }

    if (!isValid) {
      alert(errorMessage);
      return;
    }

    let displayName = selectedComboItem.shortName;
    const s = comboSelections;

    if (selectedComboItem.id === 'combo1') displayName += `: Boneless ${s.sabor_boneless} y Papas`;
    else if (selectedComboItem.id === 'combo2') displayName += `: Rollo ${s.tipo_rollo} y Papas`;
    else if (selectedComboItem.id === 'combo3') displayName += `: Alitas ${s.sabor_alitas} y Papas`;
    else if (selectedComboItem.id === 'combo4') displayName += `: Boneless ${s.sabor_boneless} y Alitas ${s.sabor_alitas}`;
    else if (selectedComboItem.id === 'combo5') displayName += `: Alitas ${s.sabor_alitas}, Boneless ${s.sabor_boneless} y Rollo ${s.tipo_rollo}`;

    let detailsString = selectedComboItem.description + ' | Personalizado: ' +
      Object.entries(comboSelections).map(([k, v]) => `${k.replace('_', ' ')}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ');

    // Obtener info de pago actual
    const currentPaymentMethod = editedItems[0]?.paymentMethod || 'pendiente';
    const currentCashReceived = editedItems[0]?.cashReceived || null;
    const currentChange = editedItems[0]?.change || null;

    const newItem = {
      id: `combo_${Date.now()}`,
      type: 'Combo',
      name: displayName,
      price: selectedComboItem.basePrice,
      clientId: editingOrder.clientId,
      clientName: editingOrder.clientNumber,
      time: editingOrder.time,
      details: detailsString,
      paymentMethod: currentPaymentMethod,
      cashReceived: currentCashReceived,
      change: currentChange
    };

    console.log('Agregando combo personalizado:', newItem);
    setEditedItems(prev => [...prev, newItem]);
    setComboCustomModalVisible(false);
    setSelectedComboItem(null);
    setComboSelections({});
    setAddProductModalVisible(false);
  }, [selectedComboItem, editingOrder, comboSelections, editedItems, combo6RollosSlots]);

  // Resetear el Combo 6 al abrir el modal
  const openComboCustomModal = useCallback((product) => {
    setSelectedComboItem(product);
    setComboSelections({});
    if (product.id === 'combo6') {
      setCombo6RollosSlots([
        { rollo: '', preparacion: '' },
        { rollo: '', preparacion: '' },
        { rollo: '', preparacion: '' },
      ]);
      setCombo6ActiveSlot(null);
    }
    setComboCustomModalVisible(true);
  }, []);

  const handleAddProductToEdit = useCallback((product) => {
    if (!editingOrder) return;

    // Si es un producto de sushi y no es promocional, mostrar modal de opciones
    if (product.type === 'Sushi' && !product.isPromotional) {
      setSelectedSushiItem(product);
      setSushiModalVisible(true);
      return;
    }

    // Si es un combo con opciones, mostrar modal de personalización
    if (product.type === 'Combo' && product.options) {
      openComboCustomModal(product);
      return;
    }

    // Obtener info de pago actual de los items existentes
    const currentPaymentMethod = editedItems[0]?.paymentMethod || 'pendiente';
    const currentCashReceived = editedItems[0]?.cashReceived || null;
    const currentChange = editedItems[0]?.change || null;

    // Crear el nuevo item FORZANDO el clientId del pedido en edición
    const newItem = {
      ...product,
      clientId: editingOrder.clientId, // <-- Esto es crucial: mantener mismo clientId
      clientName: editingOrder.clientNumber,
      time: editingOrder.time,
      paymentMethod: currentPaymentMethod,
      cashReceived: currentCashReceived,
      change: currentChange
    };

    console.log('Agregando producto simple:', newItem);
    setEditedItems(prev => [...prev, newItem]);
    setAddProductModalVisible(false);
  }, [editingOrder, editedItems]);

  // SOLUCIÓN COMPLETA: Guardar pedido editado manteniendo el orden
  const handleSaveEditedOrder = useCallback(() => {
    if (editedItems.length === 0) {
      if (Platform.OS === 'web') {
        alert('Error: Un pedido debe tener al menos un producto');
      } else {
        Alert.alert('Error', 'Un pedido debe tener al menos un producto');
      }
      return;
    }

    console.log('Guardando pedido editado. Items:', editedItems.length);
    console.log('ClientId:', editingOrder.clientId);

    // Actualizar todos los items con la nota Y asegurando que mantienen el clientId
    const itemsWithNote = editedItems.map(item => ({
      ...item,
      note: orderNote.trim(),
      clientId: editingOrder.clientId,
      isDidiFood: isDidiFood,
      // Mantener la hora original para no afectar el orden
      time: editingOrder.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    // 1. Mantener el orden actual de clientes
    const currentOrder = [...clientOrder];
    const clientIdStr = String(editingOrder.clientId);

    // 2. Asegurarse de que el cliente esté en el orden
    if (!currentOrder.includes(clientIdStr)) {
      currentOrder.push(clientIdStr);
      setClientOrder(currentOrder);
    }

    // 3. Eliminar todos los items antiguos de este cliente
    const filteredHistory = history.filter(item =>
      String(item.clientId) !== clientIdStr
    );

    // 4. Agregar los nuevos items
    const updatedHistory = [...filteredHistory, ...itemsWithNote];

    console.log('Historial actualizado. Total items:', updatedHistory.length);
    console.log('Items del cliente:', itemsWithNote.length);

    // 5. Actualizar el estado principal
    onUpdateHistory(updatedHistory);

    // 6. Cerrar el modal
    setEditModalVisible(false);
    setEditingOrder(null);
    setEditedItems([]);
    setOrderNote('');

    if (Platform.OS === 'web') {
      alert(`Éxito: El pedido ha sido actualizado correctamente. Productos: ${editedItems.length}`);
    } else {
      Alert.alert('Éxito', `El pedido ha sido actualizado correctamente. Productos: ${editedItems.length}`, [{ text: 'OK' }]);
    }
  }, [editedItems, orderNote, history, editingOrder, onUpdateHistory, clientOrder]);

  const handleCancelEdit = useCallback(() => {
    setEditModalVisible(false);
    setEditingOrder(null);
    setEditedItems([]);
    setOrderNote('');
  }, []);

  const totalGeneral = useMemo(() => (
    history.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
  ), [history]);

  const productTotals = useMemo(() => calculateProductTotals(history), [history, calculateProductTotals]);

  const renderOrderItem = useCallback(({ item }) => (
    <View style={[styles.historyItem, {
      backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
      borderColor: isDarkMode ? '#555' : '#ddd'
    }]}>
      <Text style={[styles.historyText, { color: isDarkMode ? '#fff' : '#000' }]}>
        <Text style={styles.boldText}>{item.type}:</Text> {item.name}
      </Text>
      <Text style={[styles.historyText, { color: isDarkMode ? '#fff' : '#000' }]}>
        <Text style={styles.boldText}>Hora:</Text> {item.time}
      </Text>
      <Text style={[styles.historyText, { color: isDarkMode ? '#fff' : '#000' }]}>
        <Text style={styles.boldText}>Precio:</Text> ${item.price}
      </Text>
    </View>
  ), [isDarkMode]);

  const renderClientOrder = useCallback(({ item: clientId }) => {
    const orderData = ordersWithClientNumbers[clientId];
    if (!orderData) return null;
    const orderTotals = calculateOrderTotals(orderData.items);

    // Derivar si está pagado: desde el estado local O desde los metadatos del primer item
    const isPaidFromMetadata = orderData.items[0]?.paymentMethod && orderData.items[0]?.paymentMethod !== 'pendiente';
    const isPaid = paymentStatus[clientId] || isPaidFromMetadata || false;

    const isMobile = width < 800;
    const cardWidth = isMobile ? '98%' : '32.5%';

    return (
      <View style={[styles.orderCard, {
        backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF',
        borderColor: isDarkMode ? '#333' : '#E0E0E0',
        width: cardWidth,
      }]}>
        <View style={styles.orderHeader}>
          <Text style={[styles.clientNumber, { color: isDarkMode ? '#fff' : '#000' }]}>
            {orderData.clientNumber}
          </Text>
          {orderData.items.some(i => i.isDidiFood) && (
            <View style={styles.didiBadge}>
              <Text style={styles.didiBadgeText}>DiDi</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => togglePaymentStatus(clientId)}
            style={[styles.paymentBadge, { backgroundColor: isPaid ? '#4CAF50' : '#FFC107' }]}
          >
            <Text style={styles.paymentBadgeText}>{isPaid ? 'Pagado' : 'Pendiente'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.orderItemsList}>
          {orderData.items.map((orderItem, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={[styles.itemName, { color: isDarkMode ? '#ccc' : '#333' }]}>
                {orderItem.name}
              </Text>
              <Text style={[styles.itemPrice, { color: isDarkMode ? '#fff' : '#000' }]}>
                ${parseFloat(orderItem.price).toFixed(2)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text style={[styles.orderTotal, { color: isDarkMode ? '#fff' : '#000' }]}>
          Total: ${orderTotals.total.toFixed(2)}
        </Text>

        {orderData.items[0]?.note ? (
          <View style={styles.cardNoteContainer}>
            <Text style={[styles.cardNoteLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Nota:</Text>
            <Text style={[styles.cardNoteText, { color: isDarkMode ? '#fff' : '#333' }]}>
              {orderData.items[0].note}
            </Text>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => handleEditOrder(clientId)}
          >
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => exportTicketToPDF(orderData)}
          >
            <MaterialIcons name="picture-as-pdf" size={18} color="#fff" />
            <Text style={styles.buttonText}>Ticket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleDeleteConfirmation(clientId)}
          >
            <MaterialIcons name="delete" size={18} color="#fff" />
            <Text style={styles.buttonText}>Borrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [ordersWithClientNumbers, calculateOrderTotals, paymentStatus, isDarkMode, width, togglePaymentStatus, handleEditOrder, exportTicketToPDF, handleDeleteConfirmation]);

  // En móvil (iOS/Android) 1 columna, en web/tablet 3 columnas
  const isMobile = width < 800;
  const numColumns = isMobile ? 1 : 3;

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollView}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>HISTORIAL</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScrollView}
        >
          <TouchableOpacity
            style={[styles.filterButton, paymentFilter === 'todos' && styles.filterButtonActive]}
            onPress={() => setPaymentFilter('todos')}
          >
            <Text style={[styles.filterButtonText, paymentFilter === 'todos' && styles.filterButtonTextActive]}>TODOS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, paymentFilter === 'efectivo' && { backgroundColor: '#4CAF50' }]}
            onPress={() => setPaymentFilter('efectivo')}
          >
            <Text style={[styles.filterButtonText, paymentFilter === 'efectivo' && styles.filterButtonTextActive]}>EFECTIVO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, paymentFilter === 'tarjeta' && { backgroundColor: '#2196F3' }]}
            onPress={() => setPaymentFilter('tarjeta')}
          >
            <Text style={[styles.filterButtonText, paymentFilter === 'tarjeta' && styles.filterButtonTextActive]}>TARJETA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, paymentFilter === 'pendiente' && { backgroundColor: '#FFC107' }]}
            onPress={() => setPaymentFilter('pendiente')}
          >
            <Text style={[styles.filterButtonText, paymentFilter === 'pendiente' && styles.filterButtonTextActive]}>PENDIENTE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, paymentFilter === 'didi' && { backgroundColor: '#FF5722' }]}
            onPress={() => setPaymentFilter('didi')}
          >
            <Text style={[styles.filterButtonText, paymentFilter === 'didi' && styles.filterButtonTextActive]}>DIDI FOOD</Text>
          </TouchableOpacity>
        </ScrollView>


        {history.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDarkMode ? '#aaa' : '#999' }]}>
            No hay registros en el historial.
          </Text>
        ) : (
          <FlatList
            data={filteredClientIds}
            renderItem={renderClientOrder}
            keyExtractor={(clientId) => String(clientId)}
            contentContainerStyle={styles.list}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
            key={numColumns}
          />
        )}

        <View style={styles.totalContainer}>
          <Text style={[styles.totalText, { color: isDarkMode ? '#fff' : '#000' }]}>
            <Text style={styles.boldText}>Total general:</Text> ${totalGeneral.toFixed(2)}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Inventario')}
          >
            <Image source={InventoryIcon} style={styles.iconImage} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleExportToPDF}
          >
            <Image source={PDFIcon} style={styles.iconImage} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleExportToImage}
          >
            <Image source={ImageIcon} style={styles.iconImage} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setModalVisible(true)}
          >
            <Image source={DetailsIcon} style={styles.iconImage} />
          </TouchableOpacity>

          {/* BOTÓN DE CALCULADORA FUNCIONAL */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setCalculatorModalVisible(true)}
          >
            <Image source={CalculatorIcon} style={styles.iconImage} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              Alert.alert(
                'Gestión de Pedidos',
                'La gestión de pedidos archivados está disponible en la pantalla principal. Ve a cualquier categoría y presiona el icono de lista.',
                [{ text: 'OK' }]
              );
            }}
          >
            <MaterialIcons name="list" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleResetHistoryWeb}
          >
            <Image source={ResetIcon} style={styles.iconImage} />
          </TouchableOpacity>
        </View>

        {/* Modal Detalle Ventas */}
        <Modal
          animationType="fade"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Detalles de Ventas</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { color: isDarkMode ? '#fff' : '#000' }]}>Producto</Text>
                <Text style={[styles.tableHeaderText, { color: isDarkMode ? '#fff' : '#000' }]}>Cantidad</Text>
                <Text style={[styles.tableHeaderText, { color: isDarkMode ? '#fff' : '#000' }]}>Total</Text>
              </View>

              {Object.entries(productTotals).map(([product, { quantity, total }]) => (
                <View key={product} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { color: isDarkMode ? '#fff' : '#000' }]}>{product}</Text>
                  <Text style={[styles.tableCell, { color: isDarkMode ? '#fff' : '#000' }]}>{quantity}</Text>
                  <Text style={[styles.tableCell, { color: isDarkMode ? '#fff' : '#000' }]}>${total.toFixed(2)}</Text>
                </View>
              ))}

              <View style={[styles.tableRow, {
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? '#555' : '#ccc',
                paddingTop: 10
              }]}>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>TOTAL</Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>
                  {history.length}
                </Text>
                <Text style={[styles.tableCell, { fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }]}>
                  ${totalGeneral.toFixed(2)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'red' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* MODAL DE ELIMINACIÓN DEL SEGUNDO CÓDIGO */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={[styles.deleteModalContainer, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.deleteModalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
              <Text style={[styles.deleteModalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                Eliminar Pedido
              </Text>

              <Text style={[styles.deleteModalText, { color: isDarkMode ? '#fff' : '#000' }]}>
                Selecciona el motivo de eliminación:
              </Text>

              <View style={styles.reasonsContainer}>
                {deleteReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonButton,
                      selectedReason === reason && { backgroundColor: isDarkMode ? '#555' : '#ddd' }
                    ]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <Text style={[styles.reasonText, { color: isDarkMode ? '#fff' : '#000' }]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedReason === 'Otros' && (
                <TextInput
                  style={[
                    styles.customReasonInput,
                    {
                      color: isDarkMode ? '#fff' : '#000',
                      borderColor: isDarkMode ? '#555' : '#ddd',
                      backgroundColor: isDarkMode ? '#444' : '#f9f9f9'
                    }
                  ]}
                  placeholder="Especifica el motivo..."
                  placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                />
              )}

              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={[styles.deleteModalButton, {
                    backgroundColor: '#FF5252',
                    opacity: !selectedReason || (selectedReason === 'Otros' && !customReason.trim()) ? 0.5 : 1
                  }]}
                  onPress={handleDeleteOrder}
                  disabled={!selectedReason || (selectedReason === 'Otros' && !customReason.trim())}
                >
                  <Text style={styles.buttonText}>Confirmar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deleteModalButton, { backgroundColor: '#757575' }]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Contraseña */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={passwordModalVisible}
          onRequestClose={() => {
            setPasswordModalVisible(false);
            setPasswordStatus(null);
            setPasswordInput('');
          }}
        >
          <View style={[styles.passwordModalContainer, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.passwordModalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
              <Text style={[styles.passwordModalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                Confirmar Eliminación
              </Text>

              <Text style={[styles.passwordModalText, { color: isDarkMode ? '#fff' : '#000' }]}>
                Ingresa la contraseña para confirmar:
              </Text>

              <View style={styles.passwordInputContainer}>
                <TextInput
                  ref={passwordInputRef}
                  style={[
                    styles.passwordInput,
                    {
                      color: isDarkMode ? '#fff' : '#000',
                      borderColor: isDarkMode ? '#555' : '#ddd',
                      backgroundColor: isDarkMode ? '#444' : '#f9f9f9'
                    },
                    passwordStatus === 'correct' && styles.passwordInputCorrect,
                    passwordStatus === 'incorrect' && styles.passwordInputIncorrect
                  ]}
                  placeholder="Contraseña"
                  placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
                  value={passwordInput}
                  onChangeText={setPasswordInput}
                  secureTextEntry={true}
                  onSubmitEditing={verifyPassword}
                  autoFocus={true}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  blurOnSubmit={false}
                />
                {passwordStatus === 'correct' && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#4CAF50"
                    style={styles.passwordStatusIcon}
                  />
                )}
                {passwordStatus === 'incorrect' && (
                  <MaterialIcons
                    name="error"
                    size={24}
                    color="#FF5252"
                    style={styles.passwordStatusIcon}
                  />
                )}
              </View>

              {passwordStatus === 'incorrect' && (
                <Text style={styles.passwordErrorText}>
                  Contraseña incorrecta. Intento {passwordAttempts} de 3.
                </Text>
              )}

              <View style={styles.passwordModalButtons}>
                <TouchableOpacity
                  style={[styles.passwordModalButton, {
                    backgroundColor: '#4CAF50',
                    opacity: passwordStatus !== null ? 0.5 : 1
                  }]}
                  onPress={verifyPassword}
                  disabled={passwordStatus !== null}
                >
                  <Text style={styles.buttonText}>Verificar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.passwordModalButton, {
                    backgroundColor: '#757575',
                    opacity: passwordStatus !== null ? 0.5 : 1
                  }]}
                  onPress={() => {
                    setPasswordModalVisible(false);
                    setPasswordInput('');
                    setPasswordStatus(null);
                  }}
                  disabled={passwordStatus !== null}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL DE CALCULADORA - FUNCIONAL */}
        <CalculatorModal
          isDarkMode={isDarkMode}
          visible={calculatorModalVisible}
          onClose={() => setCalculatorModalVisible(false)}
          calculatorInput={calculatorInput}
          setCalculatorInput={setCalculatorInput}
          calculatorHistory={calculatorHistory}
          setCalculatorHistory={setCalculatorHistory}
          history={history}
          expenses={expenses}
          registro={registro}
        />

        {/* Modal Editar Pedido */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={handleCancelEdit}
        >
          <View style={styles.editModalContainer}>
            <View style={[styles.editModalContent, { backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' }]}>
              <Text style={[styles.editModalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                Editar Pedido: {editingOrder?.clientNumber}
              </Text>

              <View style={styles.editModalItemsList}>
                <ScrollView>
                  {editedItems.map((item, index) => (
                    <View key={index} style={styles.editItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.editItemName, { color: isDarkMode ? '#fff' : '#333' }]}>{item.name}</Text>
                        <Text style={{ color: '#888' }}>${parseFloat(item.price).toFixed(2)}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeItemButton}
                        onPress={() => handleRemoveItemFromEdit(index)}
                      >
                        <MaterialIcons name="delete" size={24} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Total del Pedido */}
              <View style={[styles.orderTotalRow, { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff8e1', borderColor: isDarkMode ? '#555' : '#FFD600' }]}>
                <Text style={[styles.orderTotalLabel, { color: isDarkMode ? '#FFD600' : '#F57F17' }]}>Total del Pedido:</Text>
                <Text style={[styles.orderTotalAmount, { color: isDarkMode ? '#FFD600' : '#F57F17' }]}>
                  ${editedItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toFixed(2)}
                </Text>
              </View>

              {/* Estado de Pago */}
              <View style={[styles.paymentStatusRow, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
                <Text style={[styles.paymentStatusLabel, { color: isDarkMode ? '#fff' : '#000' }]}>Estado de Pago:</Text>
                {(paymentStatus[editingOrder?.clientId] || (editingOrder?.items[0]?.paymentMethod && editingOrder?.items[0]?.paymentMethod !== 'pendiente')) ? (
                  <TouchableOpacity
                    style={[styles.paymentStatusBadge, { backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', gap: 5 }]}
                    onPress={handleStartPaymentFlow}
                  >
                    <Text style={styles.paymentStatusBadgeText}>PAGADO</Text>
                    <MaterialIcons name="edit" size={14} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.paymentStatusBadge, { backgroundColor: '#FFC107' }]}
                    onPress={handleStartPaymentFlow}
                  >
                    <Text style={styles.paymentStatusBadgeText}>COBRAR PEDIDO</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.didiFoodToggleRow, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0', marginTop: 10 }]}>
                <Text style={[styles.paymentStatusLabel, { color: isDarkMode ? '#fff' : '#000' }]}>DiDi Food:</Text>
                <Switch
                  value={isDidiFood}
                  onValueChange={(value) => {
                    setIsDidiFood(value);
                    if (value) {
                      handleStartPaymentFlow();
                    }
                  }}
                  trackColor={{ false: "#767577", true: "#FF5722" }}
                  thumbColor={isDidiFood ? "#fff" : "#f4f3f4"}
                />
              </View>

              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => setAddProductModalVisible(true)}
              >
                <Text style={styles.addProductButtonText}>+ Agregar Producto</Text>
              </TouchableOpacity>

              <View style={styles.noteContainer}>
                <Text style={[styles.noteLabel, { color: isDarkMode ? '#fff' : '#333' }]}>Nota del pedido:</Text>
                <TextInput
                  style={[styles.noteInput, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#555' : '#ddd' }]}
                  multiline
                  numberOfLines={3}
                  value={orderNote}
                  onChangeText={setOrderNote}
                  placeholder="Escribe una nota aquí..."
                  placeholderTextColor="#888"
                />
              </View>

              <View style={styles.editModalButtons}>
                <TouchableOpacity
                  style={[styles.editModalButton, { backgroundColor: '#888' }]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editModalButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleSaveEditedOrder}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Seleccionar Producto */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={addProductModalVisible}
          onRequestClose={() => setAddProductModalVisible(false)}
        >
          <View style={styles.addProductModalContainer}>
            <View style={[styles.addProductContent, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
              <Text style={[styles.addProductTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Seleccionar Categoría</Text>

              {!selectedCategory ? (
                <View style={styles.categoryGrid}>
                  {[
                    { name: 'Sushi', color: '#FF5252', items: sushiProducts },
                    { name: 'Alitas', color: '#FF9800', items: wingsProducts },
                    { name: 'Bebidas', color: '#2196F3', items: drinkProducts },
                    { name: 'Postres / Otros', color: '#9C27B0', items: extraProducts },
                    { name: 'Papas', color: '#8BC34A', items: friesProducts },
                  ].map((cat, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.categoryCard, { backgroundColor: cat.color }]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={styles.categoryCardText}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={{ flex: 1, width: '100%' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                    <TouchableOpacity onPress={() => setSelectedCategory(null)} style={{ padding: 5 }}>
                      <MaterialIcons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={[styles.categoryTitleText, { color: isDarkMode ? '#fff' : '#000' }]}>
                      {selectedCategory.name}
                    </Text>
                  </View>

                  {/* Botón de combinación para Alitas/Boneless */}
                  {(selectedCategory.name === 'Alitas') && (
                    <>
                      <TouchableOpacity
                        style={styles.wingsComboInlineButton}
                        onPress={() => {
                          setSelectedWingsType('Alitas');
                          setSelectedWingsSubtype('completa');
                          setSelectedWingsFlavors([]);
                          setWingsComboModalVisible(true);
                        }}
                      >
                        <Text style={styles.wingsComboInlineButtonText}>Combinar 2 Sabores (Alitas)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.wingsComboInlineButton, { backgroundColor: '#e67e22' }]}
                        onPress={() => {
                          setSelectedWingsType('Boneless');
                          setSelectedWingsSubtype('completa');
                          setSelectedWingsFlavors([]);
                          setWingsComboModalVisible(true);
                        }}
                      >
                        <Text style={styles.wingsComboInlineButtonText}>Combinar 2 Sabores (Boneless)</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <FlatList
                    data={selectedCategory.items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.productItem, { borderBottomColor: isDarkMode ? '#444' : '#eee' }]}
                        onPress={() => handleAddProductToEdit(item)}
                      >
                        <Text style={[styles.productName, { color: isDarkMode ? '#fff' : '#333' }]}>{item.name}</Text>
                        <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.closeAddProductButton}
                onPress={() => {
                  setAddProductModalVisible(false);
                  setSelectedCategory(null);
                }}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de Pago Detallado (Reutilizado de App.js) */}
        <Modal
          visible={paymentFlowVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setPaymentFlowVisible(false)}
        >
          <View style={styles.modalOverlayPayment}>
            <View style={[styles.modalContentPayment, isDarkMode && styles.darkModalContentPayment]}>
              <Text style={[styles.modalTitlePayment, isDarkMode && styles.darkModalTitlePayment]}>
                Cobrar Pedido
              </Text>

              <Text style={[styles.paymentTotalText, isDarkMode && styles.darkModalTitlePayment]}>
                Total a Cobrar: ${calculateOrderTotals(editedItems).total.toFixed(2)}
              </Text>

              {!paymentFlowMethod ? (
                <View style={styles.paymentMethodContainer}>
                  <TouchableOpacity
                    style={styles.paymentMethodButton}
                    onPress={() => handlePaymentFlowMethodSelect('efectivo')}
                  >
                    <Text style={styles.paymentMethodText}>Efectivo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paymentMethodButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => handlePaymentFlowMethodSelect('tarjeta')}
                  >
                    <Text style={styles.paymentMethodText}>Tarjeta</Text>
                  </TouchableOpacity>
                </View>
              ) : paymentFlowMethod === 'efectivo' ? (
                <View style={styles.cashPaymentContainer}>
                  <Text style={[styles.cashPaymentLabel, isDarkMode && styles.darkModalDescriptionPayment]}>
                    Monto recibido:
                  </Text>
                  <TextInput
                    style={[styles.cashInputPayment, isDarkMode && styles.darkCashInputPayment]}
                    placeholder="0.00"
                    placeholderTextColor={isDarkMode ? '#888' : '#999'}
                    keyboardType="numeric"
                    autoFocus
                    value={paymentFlowCashAmount}
                    onChangeText={(text) => {
                      setPaymentFlowCashAmount(text);
                      calculatePaymentFlowChange(text);
                    }}
                  />

                  <Text style={[styles.changeTextPayment, { color: paymentFlowChange > 0 ? '#4CAF50' : '#888' }]}>
                    Cambio: ${paymentFlowChange.toFixed(2)}
                  </Text>

                  <View style={styles.cashButtonContainerPayment}>
                    <TouchableOpacity
                      style={styles.confirmCashButtonPayment}
                      onPress={confirmCashPaymentFlow}
                    >
                      <Text style={styles.buttonTextPayment}>Confirmar Pago</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.backButtonPayment}
                      onPress={() => setPaymentFlowMethod(null)}
                    >
                      <Text style={styles.buttonTextPayment}>Atrás</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.cancelButtonPayment}
                onPress={() => setPaymentFlowVisible(false)}
              >
                <Text style={styles.buttonTextPayment}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Personalizar Sushi */}
        <Modal
          visible={sushiModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSushiModalVisible(false)}
        >
          <View style={styles.modalOverlayPersonalizar}>
            <View style={[styles.modalContentPersonalizar, isDarkMode && styles.darkModalContentPersonalizar]}>
              <Text style={[styles.modalTitlePersonalizar, isDarkMode && styles.darkModalTitlePersonalizar]}>
                Opciones para {selectedSushiItem?.name}:
              </Text>
              {rollOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionButtonPersonalizar, isDarkMode && styles.darkOptionButtonPersonalizar]}
                  onPress={() => handleSushiOptionSelect(option)}
                >
                  <Text style={styles.buttonTextPersonalizar}>{option}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.closeButtonPersonalizar, { backgroundColor: '#7f8c8d' }]}
                onPress={() => setSushiModalVisible(false)}
              >
                <Text style={styles.buttonTextPersonalizar}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal Combinar Alitas - CORREGIDO */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={wingsComboModalVisible}
          onRequestClose={() => {
            setWingsComboModalVisible(false);
            setSelectedWingsFlavors([]);
            setSelectedWingsType('');
            setSelectedWingsSubtype('');
          }}
        >
          <View style={styles.modalOverlayPersonalizar}>
            <View style={[styles.modalContentPersonalizar, isDarkMode && styles.darkModalContentPersonalizar, { maxWidth: 500 }]}>
              <Text style={[styles.modalTitlePersonalizar, isDarkMode && styles.darkModalTitlePersonalizar]}>
                Combinar 2 Sabores
              </Text>
              <Text style={{ textAlign: 'center', marginBottom: 10, color: isDarkMode ? '#fff' : '#000' }}>
                {selectedWingsType} - {selectedWingsSubtype === 'completa' ? 'Orden completa' : 'Kilo'}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                {['completa', 'kilo'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.subtypeButton,
                      selectedWingsSubtype === st && styles.subtypeButtonActive,
                      { marginHorizontal: 5 }
                    ]}
                    onPress={() => setSelectedWingsSubtype(st)}
                  >
                    <Text style={[
                      styles.subtypeButtonText,
                      selectedWingsSubtype === st && { color: '#fff' }
                    ]}>
                      {st === 'completa' ? 'Completa' : 'Kilo'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.flavorGrid}>
                {wingFlavorOptions.map((flavor) => {
                  const isSelected = selectedWingsFlavors.includes(flavor);
                  return (
                    <TouchableOpacity
                      key={flavor}
                      style={[styles.flavorButton, isSelected && styles.flavorButtonActive]}
                      onPress={() => {
                        setSelectedWingsFlavors(prev => {
                          if (prev.includes(flavor)) {
                            return prev.filter(f => f !== flavor);
                          }
                          if (prev.length < 2) {
                            return [...prev, flavor];
                          }
                          return prev;
                        });
                      }}
                    >
                      <Text style={[
                        styles.flavorButtonText,
                        isSelected && styles.flavorButtonTextActive
                      ]}>
                        {flavor}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.selectionInfo}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>
                  Seleccionados: {selectedWingsFlavors.join(' + ') || 'Ninguno'}
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#aaa' : '#666', marginTop: 5 }}>
                  {selectedWingsFlavors.length === 2 ? 'Listo para agregar' : 'Selecciona 2 sabores'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.modalButtonPersonalizar, { backgroundColor: '#7f8c8d', flex: 0.48 }]}
                  onPress={() => {
                    setWingsComboModalVisible(false);
                    setSelectedWingsFlavors([]);
                    setSelectedWingsType('');
                    setSelectedWingsSubtype('');
                  }}
                >
                  <Text style={styles.buttonTextPersonalizar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButtonPersonalizar,
                    {
                      backgroundColor: selectedWingsFlavors.length === 2 ? '#e74c3c' : '#95a5a6',
                      flex: 0.48
                    }
                  ]}
                  disabled={selectedWingsFlavors.length !== 2}
                  onPress={() => {
                    console.log('Confirmando combo de alitas:', {
                      type: selectedWingsType,
                      subtype: selectedWingsSubtype,
                      flavors: selectedWingsFlavors
                    });
                    handleWingsComboConfirm();
                  }}
                >
                  <Text style={styles.buttonTextPersonalizar}>Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Personalizar Combo */}
        <Modal
          visible={comboCustomModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setComboCustomModalVisible(false)}
        >
          <View style={styles.modalOverlayPersonalizar}>
            <View style={[styles.modalContentPersonalizar, isDarkMode && styles.darkModalContentPersonalizar, { maxHeight: '90%', width: '90%' }]}>
              <Text style={[styles.modalTitlePersonalizar, isDarkMode && styles.darkModalTitlePersonalizar]}>
                Personalizar {selectedComboItem?.name}
              </Text>

              <ScrollView style={{ width: '100%' }}>
                {selectedComboItem?.options?.map((optionGroup, groupIdx) => {

                  // ════════════════════════════════════════
                  // COMBO 6 — 3 slots de Rollo + Preparación
                  // ════════════════════════════════════════
                  if (optionGroup.type === 'combo6-rollos') {
                    const prepOptions = ['Empanizado', 'Natural', 'Flamin', 'Alga fuera'];
                    return (
                      <View key={groupIdx}>
                        {/* 3 Slots de Rollos */}
                        <Text style={[styles.comboOptionLabel, isDarkMode && styles.darkComboOptionLabel, { marginBottom: 10 }]}>
                          🍣 Elige los 3 Rollos de Sushi
                        </Text>
                        {combo6RollosSlots.map((slot, slotIdx) => {
                          const slotComplete = slot.rollo && slot.preparacion;
                          return (
                            <View
                              key={slotIdx}
                              style={{
                                backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 12,
                                borderWidth: 2,
                                borderColor: slotComplete ? '#27ae60' : (isDarkMode ? '#555' : '#ddd'),
                              }}
                            >
                              <Text style={{ fontWeight: 'bold', color: isDarkMode ? '#fff' : '#333', marginBottom: 8, fontSize: 15 }}>
                                Rollo {slotIdx + 1} {slotComplete ? '✅' : '⬜'}
                              </Text>

                              {/* Selector de Rollo */}
                              <Text style={{ fontSize: 13, color: isDarkMode ? '#aaa' : '#666', marginBottom: 6 }}>
                                Tipo de rollo:
                              </Text>
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'nowrap' }}>
                                  {rollListOptions.map((rollo) => {
                                    const isRolloSel = slot.rollo === rollo;
                                    return (
                                      <TouchableOpacity
                                        key={rollo}
                                        style={[
                                          styles.flavorButton,
                                          isRolloSel && styles.flavorButtonActive,
                                          { marginRight: 6, marginBottom: 0 }
                                        ]}
                                        onPress={() => {
                                          const updated = [...combo6RollosSlots];
                                          updated[slotIdx] = { ...updated[slotIdx], rollo };
                                          setCombo6RollosSlots(updated);
                                        }}
                                      >
                                        <Text style={[styles.flavorButtonText, isRolloSel && styles.flavorButtonTextActive]}>
                                          {rollo}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              </ScrollView>

                              {/* Selector de Preparación */}
                              <Text style={{ fontSize: 13, color: isDarkMode ? '#aaa' : '#666', marginBottom: 6 }}>
                                Preparación:
                              </Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {prepOptions.map((prep) => {
                                  const isPrepSel = slot.preparacion === prep;
                                  return (
                                    <TouchableOpacity
                                      key={prep}
                                      style={[
                                        styles.flavorButton,
                                        isPrepSel && { backgroundColor: '#8E44AD', borderColor: '#6C3483' },
                                        { marginRight: 6, marginBottom: 4 }
                                      ]}
                                      onPress={() => {
                                        const updated = [...combo6RollosSlots];
                                        updated[slotIdx] = { ...updated[slotIdx], preparacion: prep };
                                        setCombo6RollosSlots(updated);
                                      }}
                                    >
                                      <Text style={[styles.flavorButtonText, isPrepSel && styles.flavorButtonTextActive]}>
                                        {prep}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          );
                        })}

                        {/* Resto de opciones del Combo 6 (Boneless, Alitas, Refresco) */}
                        <View style={{ height: 1, backgroundColor: isDarkMode ? '#444' : '#ddd', marginVertical: 10 }} />
                        {optionGroup.options.map((subOpt, subIdx) => (
                          <View key={subIdx} style={styles.comboOptionGroup}>
                            <Text style={[styles.comboOptionLabel, isDarkMode && styles.darkComboOptionLabel]}>
                              {subOpt.label}
                            </Text>
                            <View style={styles.flavorGrid}>
                              {subOpt.options.map((opt) => {
                                const isSel = comboSelections[subOpt.key] === opt;
                                return (
                                  <TouchableOpacity
                                    key={opt}
                                    style={[styles.flavorButton, isSel && styles.flavorButtonActive]}
                                    onPress={() => setComboSelections({ ...comboSelections, [subOpt.key]: opt })}
                                  >
                                    <Text style={[styles.flavorButtonText, isSel && styles.flavorButtonTextActive]}>{opt}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  }

                  if (optionGroup.type === 'multiple-select') {
                    return (
                      <View key={groupIdx} style={styles.comboOptionGroup}>
                        <Text style={[styles.comboOptionLabel, isDarkMode && styles.darkComboOptionLabel]}>
                          {optionGroup.label} (máx {optionGroup.maxSelections})
                        </Text>
                        <View style={styles.flavorGrid}>
                          {optionGroup.options.map((opt) => {
                            const isSel = (comboSelections[optionGroup.key] || []).includes(opt);
                            return (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.flavorButton, isSel && styles.flavorButtonActive]}
                                onPress={() => {
                                  const current = comboSelections[optionGroup.key] || [];
                                  if (current.includes(opt)) {
                                    setComboSelections({ ...comboSelections, [optionGroup.key]: current.filter(i => i !== opt) });
                                  } else if (current.length < optionGroup.maxSelections) {
                                    setComboSelections({ ...comboSelections, [optionGroup.key]: [...current, opt] });
                                  }
                                }}
                              >
                                <Text style={[styles.flavorButtonText, isSel && styles.flavorButtonTextActive]}>{opt}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        <Text style={{ fontSize: 12, color: isDarkMode ? '#aaa' : '#666', marginTop: 5 }}>
                          Seleccionados: {(comboSelections[optionGroup.key] || []).length} de {optionGroup.maxSelections}
                        </Text>
                      </View>
                    );
                  } else if (optionGroup.type === 'multiple' || optionGroup.type === 'multiple-sabor' || optionGroup.type === 'multiple-complex') {
                    return (
                      <View key={groupIdx}>
                        {optionGroup.options.map((subOpt, subIdx) => (
                          <View key={subIdx} style={styles.comboOptionGroup}>
                            <Text style={[styles.comboOptionLabel, isDarkMode && styles.darkComboOptionLabel]}>{subOpt.label}</Text>
                            <View style={styles.flavorGrid}>
                              {subOpt.options.map((opt) => {
                                const isSel = comboSelections[subOpt.key] === opt;
                                return (
                                  <TouchableOpacity
                                    key={opt}
                                    style={[styles.flavorButton, isSel && styles.flavorButtonActive]}
                                    onPress={() => setComboSelections({ ...comboSelections, [subOpt.key]: opt })}
                                  >
                                    <Text style={[styles.flavorButtonText, isSel && styles.flavorButtonTextActive]}>{opt}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  } else {
                    return (
                      <View key={groupIdx} style={styles.comboOptionGroup}>
                        <Text style={[styles.comboOptionLabel, isDarkMode && styles.darkComboOptionLabel]}>{optionGroup.label}</Text>
                        <View style={styles.flavorGrid}>
                          {optionGroup.options.map((opt) => {
                            const isSel = comboSelections[optionGroup.key] === opt;
                            return (
                              <TouchableOpacity
                                key={opt}
                                style={[styles.flavorButton, isSel && styles.flavorButtonActive]}
                                onPress={() => setComboSelections({ ...comboSelections, [optionGroup.key]: opt })}
                              >
                                <Text style={[styles.flavorButtonText, isSel && styles.flavorButtonTextActive]}>{opt}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  }
                })}
              </ScrollView>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.modalButtonPersonalizar, { backgroundColor: '#7f8c8d', flex: 0.48 }]}
                  onPress={() => {
                    setComboCustomModalVisible(false);
                    setSelectedComboItem(null);
                    setComboSelections({});
                    setCombo6RollosSlots([
                      { rollo: '', preparacion: '' },
                      { rollo: '', preparacion: '' },
                      { rollo: '', preparacion: '' },
                    ]);
                    setCombo6ActiveSlot(null);
                  }}
                >
                  <Text style={styles.buttonTextPersonalizar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButtonPersonalizar, { backgroundColor: '#27ae60', flex: 0.48 }]}
                  onPress={() => {
                    console.log('Confirmando combo personalizado:', {
                      combo: selectedComboItem?.name,
                      selections: comboSelections
                    });
                    handleComboConfirm();
                  }}
                >
                  <Text style={styles.buttonTextPersonalizar}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Procesando Imagen */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={imageProcessingModalVisible}
        >
          <View style={styles.processingModalContainer}>
            {imageProcessingComponent}
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flexGrow: 1 },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
  list: { paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 20 },
  orderCard: {
    width: '100%',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 400,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  clientNumber: { fontSize: 18, fontWeight: 'bold' },
  orderTime: { fontSize: 14, color: '#666' },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  itemName: { flex: 1, fontSize: 14 },
  itemPrice: { fontSize: 14, fontWeight: 'bold' },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexWrap: 'wrap',
    gap: 5,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  totalContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  totalText: { fontSize: 20 },
  boldText: { fontWeight: 'bold' },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 30,
    flexWrap: 'wrap',
    gap: 15,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: { width: 32, height: 32, resizeMode: 'contain' },
  paymentStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  paymentText: { fontSize: 12, fontWeight: 'bold' },
  paymentSwitch: { transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] },
  modalContainer: { flex: 1, padding: 20, paddingTop: 40, },
  modalTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  tableContainer: { width: '90%', marginVertical: 20, alignSelf: 'center' },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tableCell: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
    width: '50%',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processingModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ESTILOS DEL MODAL DE ELIMINACIÓN (DEL SEGUNDO CÓDIGO)
  deleteModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    width: '95%',
    maxWidth: 600,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  deleteModalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  reasonsContainer: {
    marginBottom: 15,
  },
  reasonButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  reasonText: {
    fontSize: 14,
  },
  customReasonInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteModalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  // ESTILOS DEL MODAL DE CONTRASEÑA (DEL SEGUNDO CÓDIGO)
  passwordModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  passwordModalContent: {
    width: '95%',
    maxWidth: 600,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  passwordModalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  passwordInputCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  passwordInputIncorrect: {
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  passwordStatusIcon: {
    marginLeft: 10,
  },
  passwordErrorText: {
    color: '#FF5252',
    textAlign: 'center',
    marginBottom: 15,
  },
  passwordModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passwordModalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  // Estilos para edición de pedidos
  editModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  editModalContent: {
    width: '95%',
    maxWidth: 800,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  editModalItemsList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  editItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  editItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeItemButton: {
    padding: 5,
  },
  addProductButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addProductButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noteContainer: {
    marginBottom: 20,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  editModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editModalButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  // Estilos para añadir productos
  addProductModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  addProductContent: {
    width: '95%',
    maxWidth: 900,
    height: '85%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  addProductTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  categoryCard: {
    width: '48%',
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  categoryCardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    width: '100%',
  },
  productName: {
    fontSize: 16,
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  closeAddProductButton: {
    marginTop: 20,
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  orderItemsList: {
    flex: 1,
    marginVertical: 10,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  processingModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para notas en tarjetas
  cardNoteContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  cardNoteLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardNoteText: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Estilos del historial item
  historyItem: {
    padding: 6,
    marginVertical: 2,
    borderRadius: 8,
    borderWidth: 0,
    backgroundColor: 'rgba(150,150,150, 0.15)',
  },
  historyText: {
    fontSize: 11,
    marginVertical: 1,
    textAlign: 'left',
  },
  // Estilos para nuevos modales de personalización
  wingsComboInlineButton: {
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  wingsComboInlineButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlayPersonalizar: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentPersonalizar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 5,
  },
  darkModalContentPersonalizar: {
    backgroundColor: '#333',
  },
  modalTitlePersonalizar: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  darkModalTitlePersonalizar: {
    color: '#fff',
  },
  optionButtonPersonalizar: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  darkOptionButtonPersonalizar: {
    backgroundColor: '#2980b9',
  },
  closeButtonPersonalizar: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonTextPersonalizar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 5,
  },
  subtypeButtonActive: {
    backgroundColor: '#e74c3c',
  },
  subtypeButtonText: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  flavorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 15,
  },
  flavorButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  flavorButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  flavorButtonText: {
    fontSize: 14,
    color: '#333',
  },
  flavorButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectionInfo: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonPersonalizar: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  comboOptionGroup: {
    marginBottom: 20,
    width: '100%',
  },
  comboOptionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  darkComboOptionLabel: {
    color: '#fff',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotalAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  paymentStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  paymentStatusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentStatusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  paymentStatusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  modalOverlayPayment: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentPayment: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  darkModalContentPayment: {
    backgroundColor: '#1E1E1E',
  },
  modalTitlePayment: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  darkModalTitlePayment: {
    color: '#fff',
  },
  paymentTotalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#E91E63',
  },
  paymentMethodContainer: {
    gap: 12,
    marginBottom: 20,
  },
  paymentMethodButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentMethodText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cashPaymentContainer: {
    marginBottom: 20,
  },
  cashPaymentLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  darkModalDescriptionPayment: {
    color: '#AAA',
  },
  cashInputPayment: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    color: '#000',
    backgroundColor: '#F9F9F9',
    marginBottom: 10,
  },
  darkCashInputPayment: {
    backgroundColor: '#333',
    borderColor: '#444',
    color: '#FFF',
  },
  changeTextPayment: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  cashButtonContainerPayment: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmCashButtonPayment: {
    flex: 2,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonPayment: {
    flex: 1,
    backgroundColor: '#888',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonPayment: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F44336',
  },
  buttonTextPayment: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterScrollView: {
    maxHeight: 60,
    marginBottom: 20,
    width: '100%',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#666',
    borderColor: '#444',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  didiFoodToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  didiBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  didiBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default HistorialScreen;