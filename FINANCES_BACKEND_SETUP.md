# Finances Backend Setup

## Overview

La funcionalidad de Finances ahora está conectada con un backend Express.js. El sistema puede funcionar de dos formas:

1. **Modo Local (localStorage)** - Sin servidor backend
2. **Modo Backend** - Con servidor Express.js

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Ejecutar el Backend

En una terminal separada, ejecuta:

```bash
npm run dev:server
```

El servidor estará disponible en `http://localhost:3001`

### 3. Ejecutar el Frontend

En otra terminal:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:8080`

## Endpoints del Backend

### Transacciones

#### Crear Transacción
```
POST /api/finances/transactions
Content-Type: application/json

{
  "type": "expense",
  "category": "salaries",
  "amount": 5000,
  "currency": "USD",
  "date": "2025-01-15T00:00:00Z",
  "description": "Monthly salaries payment",
  "projectId": "project-123",
  "isRecurring": true,
  "recurringFrequency": "monthly"
}
```

#### Listar Transacciones
```
GET /api/finances/transactions?projectId=project-123&clientId=client-456
```

#### Obtener Transacción
```
GET /api/finances/transactions/:id
```

#### Actualizar Transacción
```
PUT /api/finances/transactions/:id
Content-Type: application/json

{
  "amount": 5500,
  "description": "Updated description"
}
```

#### Eliminar Transacción
```
DELETE /api/finances/transactions/:id
```

#### Obtener Gastos del Proyecto
```
GET /api/finances/projects/:projectId/expenses
```

### Facturas

#### Crear Factura
```
POST /api/finances/invoices
Content-Type: application/json

{
  "invoiceNumber": "INV-001",
  "clientId": "client-123",
  "projectId": "project-123",
  "amount": 10000,
  "tax": 1000,
  "total": 11000,
  "status": "draft",
  "issueDate": "2025-01-15T00:00:00Z",
  "dueDate": "2025-02-15T00:00:00Z",
  "items": [],
  "notes": "Invoice notes"
}
```

#### Listar Facturas
```
GET /api/finances/invoices?projectId=project-123&clientId=client-456
```

#### Obtener Factura
```
GET /api/finances/invoices/:id
```

#### Actualizar Factura
```
PUT /api/finances/invoices/:id
Content-Type: application/json

{
  "status": "sent",
  "amount": 11000
}
```

#### Eliminar Factura
```
DELETE /api/finances/invoices/:id
```

#### Marcar Factura como Pagada
```
PUT /api/finances/invoices/:id/mark-paid
Content-Type: application/json

{
  "paidDate": "2025-01-20T00:00:00Z"
}
```

### Reportes

#### Generar Reporte Financiero
```
GET /api/finances/projects/:projectId/report?projectName=My%20Project&budget=50000
```

Respuesta:
```json
{
  "data": {
    "generateFinancialReport": {
      "projectId": "project-123",
      "projectName": "My Project",
      "budget": 50000,
      "spent": 15000,
      "totalIncome": 30000,
      "totalExpenses": 15000,
      "netProfit": 15000,
      "profitMargin": 50,
      "salaries": [],
      "teamMembers": 0,
      "transactions": 5,
      "invoices": 3,
      "generatedAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

## Configuración del Cliente API

El cliente API está configurado en `src/lib/api-client.ts`. Por defecto, usa:

```
http://localhost:3001/api
```

Para cambiar la URL del backend, crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
VITE_API_URL=https://api.example.com/api
```

O establece la variable de entorno antes de ejecutar:

```bash
VITE_API_URL=https://api.example.com/api npm run dev
```

## Características

### Transacciones
- ✅ CRUD completo
- ✅ Filtrado por proyecto y cliente
- ✅ Soporte para transacciones recurrentes
- ✅ Cálculo de totales por categoría

### Facturas
- ✅ CRUD completo
- ✅ Estados: draft, sent, paid, overdue, cancelled
- ✅ Validación de números únicos
- ✅ Marcar como pagadas
- ✅ Cálculo de ingresos y montos pendientes

### Reportes
- ✅ Generación de reportes financieros
- ✅ Cálculo de métricas
- ✅ Análisis de flujo de caja
- ✅ Gráficos de gastos e ingresos

## Almacenamiento

### Backend
- Las transacciones e invoices se almacenan en memoria (se pierden al reiniciar)
- Para persistencia, conecta a una base de datos (MongoDB, PostgreSQL, etc.)

### Frontend
- Fallback a localStorage si el backend no está disponible
- Los datos se sincronizan automáticamente

## Desarrollo

### Agregar Nuevos Endpoints

1. Agrega el endpoint en `server.ts`
2. Agrega el método en `src/lib/api-client.ts`
3. Agrega el hook en `src/hooks/use-finances.ts`
4. Usa el hook en los componentes

### Ejemplo: Nuevo Endpoint

```typescript
// server.ts
app.get('/api/finances/summary', (req, res) => {
  // Lógica aquí
  res.json({ data: { summary: {...} } });
});

// src/lib/api-client.ts
async getSummary() {
  return this.request('/finances/summary');
}

// src/hooks/use-finances.ts
const getSummary = useCallback(async () => {
  const response = await apiClient.getSummary();
  return response.data?.summary;
}, []);
```

## Troubleshooting

### El frontend no puede conectar al backend
- Verifica que el servidor esté corriendo en `http://localhost:3001`
- Revisa la consola del navegador para errores CORS
- Asegúrate de que el puerto 3001 no esté en uso

### Los datos no persisten
- El backend actual usa almacenamiento en memoria
- Los datos se pierden al reiniciar el servidor
- Implementa una base de datos para persistencia

### Errores de tipo en TypeScript
- Asegúrate de que los tipos en `src/api/finances/` coincidan con los del backend
- Usa `as ApiResponse<T>` para castear respuestas si es necesario
