import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const ROLE_HIERARCHY = {
  ADMIN: 6,
  ADMINISTRATIVO: 5,
  SUPERVISOR: 4,
  OPERADOR: 3,
  CHOFER: 2,
  USER: 1,
} as const;

const ROLE_DESCRIPTIONS = {
  ADMIN: "Administrador del sistema con acceso completo",
  ADMINISTRATIVO: "Personal administrativo con permisos elevados",
  SUPERVISOR: "Supervisor de operaciones",
  OPERADOR: "Operador con permisos básicos",
  CHOFER: "Chofer con acceso a vehículos y combustible",
  USER: "Usuario básico con permisos de lectura",
} as const;

async function seedRoles() {
  console.log("🔧 Iniciando creación de roles...");

  const roles = Object.entries(ROLE_HIERARCHY).map(
    ([name, hierarchyLevel]) => ({
      name: name as RoleName,
      hierarchyLevel,
      description: ROLE_DESCRIPTIONS[name as keyof typeof ROLE_DESCRIPTIONS],
    })
  );

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (existingRole) {
      console.log(`   ↳ Rol "${role.name}" ya existe, actualizando...`);
      await prisma.role.update({
        where: { name: role.name },
        data: {
          hierarchyLevel: role.hierarchyLevel,
          description: role.description,
        },
      });
    } else {
      console.log(`   ✓ Creando rol "${role.name}"`);
      await prisma.role.create({
        data: role,
      });
    }
  }

  console.log("✅ Roles creados/actualizados correctamente\n");
}

async function seedAdminUser() {
  console.log("👤 Iniciando creación de usuario admin...");

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const adminName = process.env.ADMIN_NAME || "Administrador";
  const adminLastName = process.env.ADMIN_LASTNAME || "Sistema";

  const existingUser = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existingUser) {
    console.log(
      `   ⚠️  Usuario "${adminUsername}" ya existe, omitiendo creación`
    );
    return existingUser;
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error("Rol ADMIN no encontrado. Ejecuta seedRoles primero.");
  }

  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      username: adminUsername,
      password: hashedPassword,
      name: adminName,
      lastName: adminLastName,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log(`   ✓ Usuario admin creado: ${adminUsername}`);
  console.log(`   ✓ Credenciales:`);
  console.log(`      Usuario: ${adminUsername}`);
  console.log(`      Password: ${adminPassword}`);
  console.log("   ⚠️  Cambia la contraseña en producción!\n");

  return adminUser;
}

async function main() {
  try {
    console.log("\n🚀 Iniciando seed de base de datos...\n");
    console.log("=".repeat(50));

    await seedRoles();
    await seedAdminUser();

    console.log("=".repeat(50));
    console.log("✅ Seed completado exitosamente\n");
  } catch (error) {
    console.error("\n❌ Error durante el seed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
