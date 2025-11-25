# Solución: Error de Login con Usuarios de Supabase

## Problema

El código de login estaba usando `supabase.auth.signInWithPassword()` que es para autenticación de Supabase Auth, pero los usuarios están almacenados en la tabla `users` de la base de datos con contraseñas encriptadas.

## Solución

### 1. Actualizar el Servicio de Autenticación

El archivo `src/services/authService.ts` ahora:
- Consulta la tabla `users` directamente
- Verifica la contraseña contra el hash almacenado
- Retorna los datos del usuario

### 2. Crear Endpoint de Verificación de Contraseña

Necesitas crear un endpoint backend que verifique las contraseñas con bcrypt:

**`/api/auth/verify-password`** (POST)
```typescript
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  const { plainPassword, hash } = await req.json();
  
  try {
    const valid = await bcrypt.compare(plainPassword, hash);
    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false }, { status: 400 });
  }
}
```

### 3. Crear Endpoint de Registro

**`/api/auth/register`** (POST)
```typescript
import bcrypt from 'bcrypt';
import { supabase } from '@/integrations/supabase/client';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  
  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
        role: 'Developer',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }
}
```

## Usuarios de Prueba

Los siguientes usuarios están precargados en la base de datos:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| pedro@evior.dev | password123 | Product Owner |
| david@evior.dev | password123 | Developer |
| morena@evior.dev | password123 | Developer |
| franco@evior.dev | password123 | DevOps |

## Flujo de Login

1. Usuario ingresa email y contraseña
2. Se consulta la tabla `users` por email
3. Se verifica la contraseña contra el hash
4. Si es válida, se retorna el usuario
5. Se almacena en localStorage
6. Se actualiza el estado de autenticación

## Próximos Pasos

1. Crear los endpoints de backend (`/api/auth/verify-password` y `/api/auth/register`)
2. Instalar bcrypt: `npm install bcrypt`
3. Probar login con los usuarios de prueba
4. Implementar recuperación de contraseña
5. Agregar validación de email
