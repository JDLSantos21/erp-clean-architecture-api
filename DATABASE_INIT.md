# Inicialización de Base de Datos - ERP API

## Comandos disponibles

### 1. Seed automático (Recomendado)

```bash
pnpm db:seed
```

- Ejecuta el seed automáticamente usando variables de entorno
- Crea los 6 roles del sistema (ADMIN, ADMINISTRATIVO, SUPERVISOR, OPERADOR, CHOFER, USER)
- Crea usuario administrador con credenciales del .env
- Idempotente: verifica si ya existen antes de crear

### 2. Inicializador interactivo

```bash
pnpm db:init
```

- Versión interactiva con prompts
- Te permite ingresar las credenciales manualmente
- Opción de actualizar usuario existente
- Interfaz visual mejorada

### 3. Seed con Prisma

```bash
pnpm prisma db seed
```

- Integrado con el workflow de Prisma
- Se ejecuta automáticamente después de `prisma migrate dev`

## Configuración

### Variables de entorno (.env)

```env
# Credenciales del usuario administrador
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Administrador
ADMIN_LASTNAME=Sistema
```

## Roles creados

| Rol            | Nivel | Descripción                                   |
| -------------- | ----- | --------------------------------------------- |
| ADMIN          | 6     | Administrador del sistema con acceso completo |
| ADMINISTRATIVO | 5     | Personal administrativo con permisos elevados |
| SUPERVISOR     | 4     | Supervisor de operaciones                     |
| OPERADOR       | 3     | Operador con permisos básicos                 |
| CHOFER         | 2     | Chofer con acceso a vehículos y combustible   |
| USER           | 1     | Usuario básico con permisos de lectura        |

## Flujo de primera instalación

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 2. Ejecutar migraciones
pnpm prisma migrate dev

# 3. Inicializar datos (el seed se ejecuta automáticamente con migrate dev)
# O manualmente:
pnpm db:seed

# 4. Verificar creación
# Usuario: admin
# Password: Admin123!
```

## Notas importantes

- ⚠️ **Seguridad**: Cambia las credenciales predeterminadas en producción
- 🔄 **Idempotente**: Los scripts verifican existencia antes de crear
- 📝 **Actualización**: Los roles se actualizan si cambia su jerarquía
- 🔐 **Contraseñas**: Se hashean con bcrypt (10 rounds)
