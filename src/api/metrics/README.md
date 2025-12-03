# Metrics API - Real-time Subscriptions

Este módulo proporciona subscripciones GraphQL en tiempo real para métricas del dashboard y proyectos.

## Subscripciones Disponibles

### 1. Dashboard Metrics Updated
Recibe actualizaciones en tiempo real de las métricas globales del dashboard.

**Datos devueltos:**
- `totalProjects`: Número total de proyectos
- `totalTasks`: Número total de tareas
- `completedTasks`: Tareas completadas
- `overallProgress`: Progreso general (0-100)
- `timestamp`: Marca de tiempo de la actualización

**Uso:**
```typescript
import { useDashboardMetrics } from '@/hooks/use-metrics';

function MyComponent() {
  const { metrics, error, isConnected } = useDashboardMetrics();
  
  return (
    <div>
      {isConnected && <p>Conectado en tiempo real</p>}
      {metrics && <p>Progreso: {metrics.overallProgress}%</p>}
    </div>
  );
}
```

### 2. Project Metrics Updated
Recibe actualizaciones en tiempo real de las métricas de un proyecto específico.

**Datos devueltos:**
- `projectId`: ID del proyecto
- `projectName`: Nombre del proyecto
- `progress`: Progreso del proyecto (0-100)
- `totalTasks`: Total de tareas en el proyecto
- `completedTasks`: Tareas completadas
- `budget`: Presupuesto del proyecto
- `spent`: Cantidad gastada

**Uso:**
```typescript
import { useProjectMetrics } from '@/hooks/use-metrics';

function ProjectDashboard({ projectId }) {
  const { metrics, error, isConnected } = useProjectMetrics(projectId);
  
  return (
    <div>
      {isConnected && <p>Métricas en vivo</p>}
      {metrics && (
        <>
          <p>Progreso: {metrics.progress}%</p>
          <p>Presupuesto: ${metrics.spent} / ${metrics.budget}</p>
        </>
      )}
    </div>
  );
}
```

## Implementación Técnica

Las subscripciones utilizan WebSocket con el protocolo `graphql-ws` para mantener una conexión persistente con el servidor.

### Flujo de Conexión:
1. Se establece una conexión WebSocket
2. Se envía un mensaje `connection_init` con el token de autenticación
3. Se envía un mensaje `start` con la query de subscripción
4. El servidor envía mensajes `data` con las actualizaciones
5. La conexión se cierra automáticamente cuando el componente se desmonta

### Manejo de Errores:
- Si hay un error de conexión, se captura y se pasa al callback `onError`
- El estado `isConnected` se actualiza automáticamente
- Los errores se almacenan en el estado `error`

## Integración con el Dashboard

El Dashboard ahora muestra:
- Indicador de conexión en vivo (Wifi icon)
- Métricas actualizadas en tiempo real
- Fallback a datos locales si la conexión falla
