# Supabase Credentials Validation Tests

## Descripción

Este conjunto de tests valida que las credenciales de Supabase estén correctamente configuradas en el archivo `.env` y que sean válidas.

## Tests Incluidos

### 1. **VITE_SUPABASE_URL should be configured**
- Verifica que la URL de Supabase esté definida
- Valida que tenga el formato correcto: `https://{project-id}.supabase.co`

### 2. **VITE_SUPABASE_PUBLISHABLE_KEY should be configured**
- Verifica que la clave pública esté definida
- Valida que sea un token JWT válido (comienza con "ey")

### 3. **VITE_SUPABASE_PROJECT_ID should be configured**
- Verifica que el ID del proyecto esté definido
- Valida que sea alfanumérico en minúsculas

### 4. **VITE_SUPABASE_URL should contain the project ID**
- Verifica que la URL contenga el ID del proyecto
- Asegura consistencia entre las credenciales

### 5. **VITE_SUPABASE_PUBLISHABLE_KEY should be a valid JWT token**
- Valida la estructura del JWT (3 partes separadas por puntos)
- Verifica que cada parte sea base64 válido

### 6. **JWT token should contain Supabase claims**
- Decodifica el JWT y verifica los claims requeridos:
  - `iss`: "supabase"
  - `ref`: ID del proyecto
  - `role`: "anon"
  - `iat`: Timestamp de emisión
  - `exp`: Timestamp de expiración

### 7. **JWT token should not be expired**
- Verifica que el token no haya expirado
- Compara la fecha de expiración con la hora actual

### 8. **Supabase client should be instantiable with provided credentials**
- Intenta crear un cliente de Supabase con las credenciales
- Verifica que no lance errores

### 9. **All required Supabase credentials should be present**
- Verifica que las tres credenciales requeridas estén presentes
- Valida que ninguna esté vacía

### 10. **Credentials should match expected values**
- Verifica que las credenciales coincidan con los valores específicos esperados
- Útil para detectar cambios accidentales

## Cómo Ejecutar

### Ejecutar solo los tests de Supabase
```bash
npm run test:supabase
```

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar en modo watch
```bash
npm run test:watch -- tests/supabase/credentials.test.ts
```

## Resultados Esperados

Todos los 10 tests deberían pasar:

```
✓ Supabase Credentials Validation (10)
  ✓ VITE_SUPABASE_URL should be configured
  ✓ VITE_SUPABASE_PUBLISHABLE_KEY should be configured
  ✓ VITE_SUPABASE_PROJECT_ID should be configured
  ✓ VITE_SUPABASE_URL should contain the project ID
  ✓ VITE_SUPABASE_PUBLISHABLE_KEY should be a valid JWT token
  ✓ JWT token should contain Supabase claims
  ✓ JWT token should not be expired
  ✓ Supabase client should be instantiable with provided credentials
  ✓ All required Supabase credentials should be present
  ✓ Credentials should match expected values
```

## Solución de Problemas

### ❌ "VITE_SUPABASE_URL should be configured" falla
- Verifica que `.env` contenga `VITE_SUPABASE_URL`
- Asegúrate de que no esté vacío
- Valida el formato: debe ser `https://{project-id}.supabase.co`

### ❌ "VITE_SUPABASE_PUBLISHABLE_KEY should be configured" falla
- Verifica que `.env` contenga `VITE_SUPABASE_PUBLISHABLE_KEY`
- Asegúrate de que sea un JWT válido (comienza con "ey")
- Copia la clave completa sin espacios

### ❌ "JWT token should not be expired" falla
- El token JWT ha expirado
- Necesitas generar una nueva clave desde el dashboard de Supabase
- Ve a: https://supabase.com/dashboard/project/{project-id}/settings/api

### ❌ "Credentials should match expected values" falla
- Las credenciales en `.env` no coinciden con los valores esperados
- Esto puede ser intencional si estás usando un proyecto diferente
- Actualiza el test si necesitas usar credenciales diferentes

## Integración Continua

Estos tests se ejecutan automáticamente como parte del suite de tests del proyecto:

```bash
npm test
```

Se recomienda ejecutar estos tests antes de hacer commit para asegurar que las credenciales estén correctamente configuradas.

## Seguridad

⚠️ **Importante**: Las credenciales de Supabase están en el archivo `.env` que está en `.gitignore`. Nunca hagas commit de este archivo.

Los tests validan las credenciales localmente pero no las exponen en los logs de CI/CD.

## Referencias

- [Documentación de Supabase](https://supabase.com/docs)
- [JWT.io - Decodificador de JWT](https://jwt.io)
- [Vitest - Testing Framework](https://vitest.dev)
