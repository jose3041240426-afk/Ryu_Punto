# Documentación del Sistema Ryu Sushi - Punto de Venta

Este documento detalla la arquitectura, el flujo de trabajo y la responsabilidad de cada archivo en el proyecto de Punto de Venta para Ryu Sushi.

---

## 🚀 Tecnologías Utilizadas

- **Framework**: [React Native](https://reactnative.dev/) con [Expo SDK 54](https://expo.dev/).
- **Navegación**: [React Navigation 7](https://reactnavigation.org/).
- **Persistencia**: `AsyncStorage` para almacenamiento local y soporte para `localStorage` en web.
- **Base de Datos**: [Supabase](https://supabase.com/) (Configurado para integración futura).
- **Impresión y PDF**: `expo-print`, `expo-sharing` y `react-native-thermal-printer`.

---

## 📂 Estructura del Proyecto

### 📁 Directorios Principales

- `/assets/images/`: Contiene todos los recursos visuales del sistema (iconos, fotos de productos, logos).
- `/src/components/`: Componentes de interfaz de usuario reutilizables y ventanas modales.
- `/src/hooks/`: Lógica personalizada encapsulada en Hooks de React (ej. manejo de impresora).
- `/src/navigation/`: Configuración de las rutas y navegadores de la aplicación.
- `/src/screens/`: Pantallas principales de la aplicación.
- `/src/services/`: Integraciones con servicios externos (Supabase).
- `/src/utils/`: Funciones de utilidad, cálculos matemáticos y generadores de documentos.

---

## 📄 Descripción de Archivos Clave

### Raíz
- `App.js`: El punto de entrada de la aplicación. Configura la navegación principal y el proveedor de estado.
- `app.json`: Configuración global de Expo (nombre, versión, icono, splash screen).
- `package.json`: Lista de dependencias y scripts de ejecución.

### 🖼️ Pantallas (`src/screens/`)
- `SplashScreen.js`: Pantalla de carga inicial con el logo de la empresa.
- `SushiScreen.js`: Catálogo de productos de Sushi. Permite seleccionar tipos de rollos y extras.
- `BebidasScreen.js`: Catálogo de bebidas y refrescos.
- `AlitasScreen.js`: Gestión de alitas y boneless, incluyendo selección de sabores y tipos de cocción.
- `PostresScreen.js`: Incluye postres y **Combos Especiales** (paquetes armados).
- `InventarioScreen.js`: Panel de control de stock para insumos (bolsas, palillos, etc.) y productos.
- `HistorialScreen.js`: Registro de todas las ventas pasadas, reportes diarios y gestión de caja.

### 🧩 Componentes (`src/components/`)
- `CalculatorModal.js`: La interfaz de cobro. Calcula el total, cambio a entregar y métodos de pago.
- `ClientSelectionModal.js`: Permite asignar un pedido a un cliente específico o aplicar descuentos personalizados.
- `CalculatorButton.js`: Botón estilizado para la interfaz de la calculadora.
- `SavedDaysModal.js`: Resumen de cierres de caja anteriores.

### 🛠️ Utilidades y Hooks (`src/utils/` & `src/hooks/`)
- `pdfGenerator.js`: El motor principal para generar el HTML del ticket y convertirlo a PDF. Maneja los cálculos de totales y descuentos.
- `useBluetoothPrinter.js`: Hook para gestionar la conexión con impresoras térmicas vía Bluetooth y enviar comandos de impresión.

---

## 🔄 Flujo de la Aplicación

1. **Inicio**: El sistema carga el `SplashScreen` y redirige al menú principal.
2. **Selección**: El usuario navega por las pestañas superiores (Sushi, Bebidas, Alitas, Combos) y añade productos al carrito.
3. **Personalización**: Al seleccionar ciertos productos (como Sushi o Combos), se abren modales para elegir sabores o tipos de preparación.
4. **Cobro**: 
   - El usuario abre la "Calculadora".
   - Selecciona al cliente (opcional).
   - Ingresa el monto recibido.
   - Presiona "Aceptar" para registrar la venta.
5. **Finalización**: 
   - El sistema guarda la venta en `AsyncStorage`.
   - Se ofrece la opción de **Imprimir Ticket** (vía Bluetooth) o **Generar PDF/Imagen** para compartir por WhatsApp.
6. **Reporte**: Al final del día, el administrador revisa el `HistorialScreen` para ver el total de ventas, egresos y realizar el cierre de caja.

---

## 🛠️ Cómo Iniciar el Proyecto

Para desarrollo local, ejecuta:

```bash
npm install
npx expo start --web
```

Para probar en un dispositivo físico con la app **Expo Go**:
```bash
npx expo start
```

---
*Documentación generada para Ryu Sushi Version 22 (Alter 45).*
