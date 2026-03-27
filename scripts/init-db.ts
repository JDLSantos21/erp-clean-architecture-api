#!/usr/bin/env tsx

import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import * as readline from "readline/promises";

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

interface AdminCredentials {
  username: string;
  password: string;
  name: string;
  lastName: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptAdminCredentials(): Promise<AdminCredentials> {
  console.log("\n📝 Configuración del usuario administrador:\n");

  const username = await rl.question("Usuario (default: admin): ");
  const password = await rl.question("Contraseña (default: Admin123!): ");
  const name = await rl.question("Nombre (default: Administrador): ");
  const lastName = await rl.question("Apellido (default: Sistema): ");

  return {
    username: username.trim() || "admin",
    password: password.trim() || "Admin123!",
    name: name.trim() || "Administrador",
    lastName: lastName.trim() || "Sistema",
  };
}

async function seedRoles() {
  console.log("\n🔧 Creando roles del sistema...");

  const roles = Object.entries(ROLE_HIERARCHY).map(
    ([name, hierarchyLevel]) => ({
      name: name as RoleName,
      hierarchyLevel,
      description: ROLE_DESCRIPTIONS[name as keyof typeof ROLE_DESCRIPTIONS],
    })
  );

  let created = 0;
  let updated = 0;

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (existingRole) {
      await prisma.role.update({
        where: { name: role.name },
        data: {
          hierarchyLevel: role.hierarchyLevel,
          description: role.description,
        },
      });
      console.log(
        `   ↻ ${role.name.padEnd(15)} (nivel ${
          role.hierarchyLevel
        }) - Actualizado`
      );
      updated++;
    } else {
      await prisma.role.create({
        data: role,
      });
      console.log(
        `   ✓ ${role.name.padEnd(15)} (nivel ${role.hierarchyLevel}) - Creado`
      );
      created++;
    }
  }

  console.log(`\n   📊 Resumen: ${created} creados, ${updated} actualizados`);
}

async function seedAdminUser(credentials: AdminCredentials) {
  console.log("\n👤 Creando usuario administrador...");

  const existingUser = await prisma.user.findUnique({
    where: { username: credentials.username },
  });

  if (existingUser) {
    console.log(`   ⚠️  Usuario "${credentials.username}" ya existe`);
    const overwrite = await rl.question(
      "   ¿Deseas actualizar la contraseña? (s/N): "
    );

    if (overwrite.toLowerCase() === "s") {
      const hashedPassword = bcrypt.hashSync(credentials.password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: credentials.name,
          lastName: credentials.lastName,
        },
      });
      console.log(`   ✓ Usuario actualizado correctamente`);
    } else {
      console.log(`   ↷ Usuario existente sin cambios`);
    }
    return;
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error("Rol ADMIN no encontrado.");
  }

  const hashedPassword = bcrypt.hashSync(credentials.password, 10);

  await prisma.user.create({
    data: {
      username: credentials.username,
      password: hashedPassword,
      name: credentials.name,
      lastName: credentials.lastName,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  console.log(`   ✓ Usuario creado exitosamente`);
  console.log(`\n   🔐 Credenciales de acceso:`);
  console.log(`      Usuario:     ${credentials.username}`);
  console.log(`      Contraseña:  ${credentials.password}`);
  console.log(`\n   ⚠️  IMPORTANTE: Guarda estas credenciales de forma segura`);
}

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✓ Conexión a base de datos establecida");
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:");
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  console.clear();
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   🚀 Inicializador de Base de Datos - ERP API   ║");
  console.log("╚═══════════════════════════════════════════════════╝");

  await checkDatabaseConnection();

  const useEnv = process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD;
  let credentials: AdminCredentials;

  if (useEnv) {
    console.log("\n📋 Usando credenciales de variables de entorno");
    credentials = {
      username: process.env.ADMIN_USERNAME!,
      password: process.env.ADMIN_PASSWORD!,
      name: process.env.ADMIN_NAME || "Administrador",
      lastName: process.env.ADMIN_LASTNAME || "Sistema",
    };
  } else {
    credentials = await promptAdminCredentials();
  }

  try {
    await seedRoles();
    await seedAdminUser(credentials);

    console.log("\n╔═══════════════════════════════════════════════════╗");
    console.log("║         ✅ Inicialización completada              ║");
    console.log("╚═══════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ Error durante la inicialización:");
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
