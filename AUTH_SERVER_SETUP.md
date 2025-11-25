# Configuración del Servidor de Autenticación

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

Esto instalará:
- `bcrypt` - Para encriptación de contraseñas
- `express` - Servidor web
- `concurrently` - Para ejecutar múltiples procesos

### 2. Configurar variables de entorno

El archivo `.env` ya tiene las credenciales de Supabase configuradas.

## Ejecución

### Opción 1: Ejecutar ambos (Recomendado)

```bash
npm run dev:all
```

Esto ejecuta:
- Vite dev server en `http://localhost:8080`
- Auth server en `http://localhost:3001`

### Opción 2: Ejecutar por separado

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Backend:
```bash
npm run dev:server
```

## Endpoints de Autenticación

### POST /api/auth/login

Inicia sesión con email y contraseña.

**Request:**
```json
{
  "email": "pedro@evior.dev",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "pedro@evior.dev",
  "name": "Pedro",
  "role": "Product Owner",
  "avatar": "url",
  "skills": ["Leadership", "Strategy"],
  "availability": 100
}
```

### POST /api/auth/register

Registra un nuevo usuario.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "Developer"
}
```

### POST /api/auth/verify-password

Verifica una contraseña contra un hash bcrypt.

**Request:**
```json
{
  "plainPassword": "password123",
  "hash": "$2a$12$..."
}
```

**Response:**
```json
{
  "valid": true
}
```

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| pedro@evior.dev | password123 | Product Owner |
| david@evior.dev | password123 | Developer |
| morena@evior.dev | password123 | Developer |
| franco@evior.dev | password123 | DevOps |

## Flujo de Login

1. Usuario ingresa email y contraseña en la UI
2. Se envía POST a `/api/auth/login`
3. El servidor verifica la contraseña contra el hash
4. Si es válida, retorna los datos del usuario
5. El frontend almacena la sesión en localStorage
6. Se actualiza el estado de autenticación

## Solución de Problemas

### Error: "Cannot find module 'bcrypt'"

```bash
npm install bcrypt
```

### Error: "Cannot find module 'express'"

```bash
npm install express
```

### Error: "Connection refused on localhost:3001"

Asegúrate de que el servidor está ejecutándose:
```bash
npm run dev:server
```

### Error: "Invalid email or password"

Verifica que:
1. El email existe en la base de datos
2. La contraseña es correcta
3. El usuario está activo (is_active = true)

## Estructura de Archivos

```
src/
├── api/
│   └── auth/
│       ├── verify-password.ts
│       └── register.ts
├── services/
│   └── authService.ts
└── context/
    └── AuthContext.tsx

server.ts (raíz del proyecto)
```

## Próximos Pasos

1. Implementar recuperación de contraseña
2. Agregar validación de email
3. Implementar refresh tokens
4. Agregar rate limiting
5. Implementar 2FA
