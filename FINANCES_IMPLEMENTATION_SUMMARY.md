# Finances Implementation Summary

## ✅ Implementación Completada

Se ha implementado un sistema completo de gestión financiera (Finances) con soporte para **backend Express.js** y **fallback a localStorage**.

## 📁 Estructura de Archivos

### Backend
- **`server.ts`** - Servidor Express.js con endpoints de Finances

### Frontend - APIs
- **`src/api/finances/transactions.ts`** - Tipos y servicios de transacciones
- **`src/api/finances/invoices.ts`** - Tipos y servicios de facturas
- **`src/api/finances/reports.ts`** - Tipos y servicios de reportes
- **`src/lib/api-client.ts`** - Cliente HTTP para comunicación con backend

### Frontend - Hooks
- **`src/hooks/use-finances.ts`** - Hook React para gestionar estado de finances

### Frontend - Componentes
- **`src/pages/Finances.tsx`** - Página principal con tabs
- **`src/components/finances/TransactionsTab.tsx`** - Gestión de transacciones
- **`src/components/finances/InvoicesTab.tsx`** - Gestión de facturas
- **`src/components/finances/ReportsTab.tsx`** - Visualización de reportes

## 🚀 Cómo Usar

### Opción 1: Desarrollo Completo (Frontend + Backend)

```bash
npm run dev:all
```

Esto ejecuta:
- Frontend en `http://localhost:8080`
- Backend en `http://localhost:3001`

### Opción 2: Solo Frontend (con localStorage)

```bash
npm run dev
```

Los datos se guardan en localStorage del navegador.

### Opción 3: Desarrollo Manual

Terminal 1 - Backend:
```bash
npm run dev:server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

## 🔌 Endpoints del Backend

### Transacciones
- `POST /api/finances/transactions` - Crear
- `GET /api/finances/transactions` - Listar
- `GET /api/finances/transactions/:id` - Obtener
- `PUT /api/finances/transactions/:id` - Actualizar
- `DELETE /api/finances/transactions/:id` - Eliminar
- `GET /api/finances/projects/:projectId/expenses` - Gastos del proyecto

### Facturas
- `POST /api/finances/invoices` - Crear
- `GET /api/finances/invoices` - Listar
- `GET /api/finances/invoices/:id` - Obtener
- `PUT /api/finances/invoices/:id` - Actualizar
- `DELETE /api/finances/invoices/:id` - Eliminar
- `PUT /api/finances/invoices/:id/mark-paid` - Marcar como pagada

### Reportes
- `GET /api/finances/projects/:projectId/report` - Generar reporte

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local`:

```bash
# URL del backend (por defecto: http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api
```

## 📊 Características

### Transacciones
- ✅ CRUD completo
- ✅ Filtrado por proyecto y cliente
- ✅ Soporte para transacciones recurrentes
- ✅ Cálculo de totales por categoría
- ✅ Edición y eliminación

### Facturas
- ✅ CRUD completo
- ✅ Estados: draft, sent, paid, overdue, cancelled
- ✅ Validación de números únicos
- ✅ Marcar como pagadas
- ✅ Cálculo de ingresos y montos pendientes

### Reportes
- ✅ Generación de reportes financieros
- ✅ Gráficos de gastos por categoría (Pie Chart)
- ✅ Gráficos de ingresos por categoría (Pie Chart)
- ✅ Gráfico de flujo de caja (Bar Chart)
- ✅ Métricas financieras detalladas
- ✅ Información de salarios del equipo

## 🎨 UI/UX

### Tabs Principales
1. **Transactions** - Gestión de transacciones
2. **Invoices** - Gestión de facturas
3. **Reports** - Visualización de reportes

### Componentes
- Diálogos para crear/editar
- Tablas con acciones (editar, eliminar)
- Tarjetas de resumen
- Gráficos interactivos con Recharts
- Formateo de moneda automático

## 🔄 Flujo de Datos

```
Frontend (React)
    ↓
useFinances Hook
    ↓
API Client (src/lib/api-client.ts)
    ↓
Backend (Express.js)
    ↓
In-Memory Storage (o Base de Datos)
```

## 📝 Tipos TypeScript

### Transaction
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  projectId?: string;
  clientId?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Invoice
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  amount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### FinancialReport
```typescript
interface FinancialReport {
  projectId: string;
  projectName: string;
  budget: number;
  spent: number;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  salaries: SalaryInfo[];
  teamMembers: number;
  transactions: number;
  invoices: number;
  generatedAt: string;
}
```

## 🔧 Desarrollo Futuro

### Mejoras Sugeridas
1. **Base de Datos** - Conectar a MongoDB, PostgreSQL, etc.
2. **Autenticación** - Agregar JWT para seguridad
3. **Validación** - Agregar Zod/Joi en backend
4. **Paginación** - Agregar paginación a listados
5. **Búsqueda** - Agregar búsqueda avanzada
6. **Exportación** - Exportar reportes a PDF/Excel
7. **Notificaciones** - Alertas de facturas vencidas
8. **Webhooks** - Integración con servicios externos

### Agregar Nuevo Endpoint

1. **Backend** (`server.ts`):
```typescript
app.get('/api/finances/new-endpoint', (req, res) => {
  // Lógica aquí
  res.json({ data: { result: {...} } });
});
```

2. **Cliente API** (`src/lib/api-client.ts`):
```typescript
async newEndpoint() {
  return this.request('/finances/new-endpoint');
}
```

3. **Hook** (`src/hooks/use-finances.ts`):
```typescript
const newMethod = useCallback(async () => {
  const response = await apiClient.newEndpoint() as ApiResponse<T>;
  return response.data?.result;
}, []);
```

## 🐛 Troubleshooting

### Error: "process is not defined"
- ✅ Corregido: Usa `import.meta.env` en lugar de `process.env`

### El frontend no conecta al backend
- Verifica que el servidor esté corriendo: `npm run dev:server`
- Revisa la consola del navegador para errores
- Asegúrate de que el puerto 3001 esté disponible

### Los datos no persisten
- El backend actual usa almacenamiento en memoria
- Implementa una base de datos para persistencia
- Ver sección "Desarrollo Futuro"

## 📚 Documentación Adicional

Ver `FINANCES_BACKEND_SETUP.md` para:
- Instalación detallada
- Ejemplos de requests/responses
- Configuración avanzada
- Troubleshooting

## ✨ Resumen

La implementación de Finances está **completamente funcional** con:
- ✅ Frontend React con componentes modernos
- ✅ Backend Express.js con endpoints RESTful
- ✅ Cliente HTTP para comunicación
- ✅ Hook React para gestión de estado
- ✅ Gráficos interactivos
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Soporte para múltiples proyectos

El sistema está listo para producción con la adición de una base de datos.
