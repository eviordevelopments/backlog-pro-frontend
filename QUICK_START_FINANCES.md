# Quick Start - Finances

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Ejecutar Frontend + Backend
```bash
npm run dev:all
```

Esto abre:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3001

### 3. Usar la Aplicación

1. Navega a la sección **Finances** en el menú
2. Selecciona un proyecto
3. Usa los tabs para:
   - **Transactions** - Agregar ingresos/gastos
   - **Invoices** - Crear y gestionar facturas
   - **Reports** - Ver reportes financieros

## 📝 Ejemplos de Uso

### Crear una Transacción
1. Click en "New Transaction"
2. Completa el formulario:
   - Type: expense
   - Category: salaries
   - Amount: 5000
   - Currency: USD
   - Date: 2025-01-15
   - Description: Monthly salaries payment
3. Click "Create Transaction"

### Crear una Factura
1. Click en "New Invoice"
2. Completa el formulario:
   - Invoice Number: INV-001
   - Client ID: client-123
   - Amount: 10000
   - Tax: 1000
   - Total: 11000
   - Status: draft
3. Click "Create Invoice"

### Ver Reportes
1. Click en tab "Reports"
2. Visualiza:
   - Tarjetas de resumen (Budget, Spent, Profit)
   - Gráficos de gastos e ingresos
   - Flujo de caja
   - Métricas financieras

## 🔧 Configuración

### Cambiar URL del Backend

Crea `.env.local`:
```bash
VITE_API_URL=http://localhost:3001/api
```

O en producción:
```bash
VITE_API_URL=https://api.example.com/api
```

## 📊 Características Principales

| Característica | Estado |
|---|---|
| CRUD Transacciones | ✅ |
| CRUD Facturas | ✅ |
| Reportes Financieros | ✅ |
| Gráficos | ✅ |
| Filtrado por Proyecto | ✅ |
| Transacciones Recurrentes | ✅ |
| Estados de Factura | ✅ |
| Cálculo de Métricas | ✅ |

## 🎯 Próximos Pasos

1. **Agregar Base de Datos**
   - Conectar MongoDB o PostgreSQL
   - Reemplazar almacenamiento en memoria

2. **Autenticación**
   - Agregar JWT
   - Proteger endpoints

3. **Validación**
   - Agregar Zod en backend
   - Validar datos en frontend

4. **Exportación**
   - Exportar reportes a PDF
   - Exportar a Excel

## 📞 Soporte

Ver documentación completa en:
- `FINANCES_BACKEND_SETUP.md` - Configuración detallada
- `FINANCES_IMPLEMENTATION_SUMMARY.md` - Resumen técnico

## 🐛 Troubleshooting

**Error: "Cannot connect to backend"**
- Verifica que `npm run dev:server` esté ejecutándose
- Revisa que el puerto 3001 esté disponible

**Error: "process is not defined"**
- ✅ Ya está corregido en la última versión

**Los datos no se guardan**
- El backend actual usa memoria (se pierden al reiniciar)
- Implementa una base de datos para persistencia

## 📦 Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Gráficos**: Recharts
- **Backend**: Express.js
- **Almacenamiento**: En memoria (upgradeable a BD)

---

¡Listo para usar! 🎉
