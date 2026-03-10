import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';

const OrderManagerModal = ({
  visible,
  onClose,
  isDarkMode,
  archivedOrders,
  currentOrder,
  onLoadOrder,
  onArchiveOrder,
  onDeleteArchivedOrder,
  onEditOrderName,
}) => {
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [newOrderName, setNewOrderName] = useState('');

  const handleArchiveCurrentOrder = () => {
    if (currentOrder.length === 0) {
      Alert.alert('Error', 'No hay pedido actual para archivar');
      return;
    }

    Alert.prompt(
      'Nombre del pedido',
      'Ingresa un nombre para identificar este pedido:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Archivar',
          onPress: (name) => {
            if (name && name.trim()) {
              onArchiveOrder({
                id: Date.now().toString(),
                name: name.trim(),
                items: [...currentOrder],
                date: new Date().toISOString(),
              });
              Alert.alert('Éxito', 'Pedido archivado correctamente');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleLoadOrder = (order) => {
    Alert.alert(
      'Cargar Pedido',
      `¿Cargar pedido "${order.name}"? Esto reemplazará el pedido actual.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cargar',
          onPress: () => {
            onLoadOrder(order.items);
            onClose();
          },
        },
      ]
    );
  };

  const handleDeleteOrder = (order) => {
    Alert.alert(
      'Eliminar Pedido',
      `¿Eliminar pedido "${order.name}" permanentemente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeleteArchivedOrder(order.id),
        },
      ]
    );
  };

  const startEditing = (order) => {
    setEditingOrderId(order.id);
    setNewOrderName(order.name);
  };

  const saveEdit = () => {
    if (newOrderName.trim()) {
      onEditOrderName(editingOrderId, newOrderName.trim());
      setEditingOrderId(null);
      setNewOrderName('');
    }
  };

  const cancelEdit = () => {
    setEditingOrderId(null);
    setNewOrderName('');
  };

  const renderOrderItem = ({ item }) => (
    <View style={[styles.orderItem, { backgroundColor: isDarkMode ? '#333' : '#f9f9f9' }]}>
      <View style={styles.orderHeader}>
        {editingOrderId === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.nameInput, { color: isDarkMode ? '#fff' : '#000' }]}
              value={newOrderName}
              onChangeText={setNewOrderName}
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.buttonText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                <Text style={styles.buttonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.orderInfo}>
              <Text style={[styles.orderName, { color: isDarkMode ? '#fff' : '#000' }]}>
                {item.name}
              </Text>
              <Text style={[styles.orderDetails, { color: isDarkMode ? '#ccc' : '#666' }]}>
                {item.items.length} items - ${item.items.reduce((sum, i) => sum + i.price, 0).toFixed(2)}
              </Text>
              <Text style={[styles.orderDate, { color: isDarkMode ? '#999' : '#888' }]}>
                {new Date(item.date).toLocaleString()}
              </Text>
            </View>
            <View style={styles.orderActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.loadButton]}
                onPress={() => handleLoadOrder(item)}
              >
                <Text style={styles.actionButtonText}>Cargar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => startEditing(item)}
              >
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteOrder(item)}
              >
                <Text style={styles.actionButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      
      {/* Lista de items del pedido */}
      <View style={styles.itemsList}>
        {item.items.slice(0, 3).map((orderItem, index) => (
          <Text key={index} style={[styles.itemText, { color: isDarkMode ? '#ccc' : '#666' }]}>
            • {orderItem.type} - {orderItem.name} (${orderItem.price})
          </Text>
        ))}
        {item.items.length > 3 && (
          <Text style={[styles.moreItems, { color: isDarkMode ? '#999' : '#888' }]}>
            ...y {item.items.length - 3} más
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
          <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
            Gestión de Pedidos
          </Text>

          {/* Pedido Actual */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
              Pedido Actual ({currentOrder.length} items)
            </Text>
            <TouchableOpacity
              style={[styles.archiveButton, currentOrder.length === 0 && styles.disabledButton]}
              onPress={handleArchiveCurrentOrder}
              disabled={currentOrder.length === 0}
            >
              <Text style={styles.archiveButtonText}>
                Archivar Pedido Actual
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pedidos Archivados */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
              Pedidos Archivados ({archivedOrders.length})
            </Text>
            
            {archivedOrders.length === 0 ? (
              <Text style={[styles.emptyText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                No hay pedidos archivados
              </Text>
            ) : (
              <FlatList
                data={archivedOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                style={styles.ordersList}
                contentContainerStyle={styles.ordersListContent}
              />
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  archiveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  archiveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ordersList: {
    maxHeight: 300,
  },
  ordersListContent: {
    paddingBottom: 10,
  },
  orderItem: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 5,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  loadButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsList: {
    marginTop: 10,
    paddingLeft: 10,
  },
  itemText: {
    fontSize: 12,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#2196F3',
    marginRight: 10,
    paddingVertical: 5,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 5,
    borderRadius: 3,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: '#757575',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderManagerModal;