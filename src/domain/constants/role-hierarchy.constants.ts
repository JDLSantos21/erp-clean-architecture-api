import { RoleName } from "../entities/Users";

export const ROLE_HIERARCHY = {
  ADMIN: 6,
  ADMINISTRATIVO: 5,
  SUPERVISOR: 4,
  OPERADOR: 3,
  CHOFER: 2,
  USER: 1,
} as const;

export const ROLE_DESCRIPTIONS = {
  ADMIN: "Administrador del sistema con acceso completo",
  ADMINISTRATIVO: "Personal administrativo con permisos elevados",
  SUPERVISOR: "Supervisor de operaciones",
  OPERADOR: "Operador con permisos básicos",
  CHOFER: "Chofer con acceso a vehículos y combustible",
  USER: "Usuario básico con permisos de lectura",
} as const;

// Función para obtener el nivel de jerarquía de un rol
export const getRoleHierarchyLevel = (roleName: RoleName): number => {
  return ROLE_HIERARCHY[roleName];
};

export const getRoleNameByLevel = (level: number): RoleName | null => {
  const entry = Object.entries(ROLE_HIERARCHY).find(
    ([, hierarchyLevel]) => hierarchyLevel === level
  );
  return entry ? (entry[0] as RoleName) : null;
};

// Función para verificar si un rol tiene permisos para una acción
export const hasPermissionLevel = (
  userRoles: RoleName[],
  requiredLevel: number
): boolean => {
  const maxUserLevel = Math.max(
    ...userRoles.map((role) => getRoleHierarchyLevel(role))
  );
  return maxUserLevel >= requiredLevel;
};

// Función para verificar si un usuario tiene al menos un rol específico o superior
export const hasRoleOrHigher = (
  userRoles: RoleName[],
  requiredRole: RoleName
): boolean => {
  const requiredLevel = getRoleHierarchyLevel(requiredRole);
  return hasPermissionLevel(userRoles, requiredLevel);
};

// Niveles de permisos para diferentes acciones
export const PERMISSION_LEVELS = {
  READ_ONLY: ROLE_HIERARCHY.USER, // 1 - Cualquier usuario autenticado
  BASIC_OPERATIONS: ROLE_HIERARCHY.CHOFER, // 2 - Operaciones básicas
  ADVANCED_OPERATIONS: ROLE_HIERARCHY.OPERADOR, // 3 - Operaciones avanzadas
  SUPERVISION: ROLE_HIERARCHY.SUPERVISOR, // 4 - Supervisión
  ADMINISTRATION: ROLE_HIERARCHY.ADMINISTRATIVO, // 5 - Administración
  SYSTEM_ADMIN: ROLE_HIERARCHY.ADMIN, // 6 - Administración del sistema
} as const;
