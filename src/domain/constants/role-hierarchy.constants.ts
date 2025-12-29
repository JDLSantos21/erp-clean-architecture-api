import { RoleName } from "../entities";
import { ROLE_HIERARCHY } from "../../shared/constants/permission-levels";

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
