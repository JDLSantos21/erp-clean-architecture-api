/**
 * Constantes de códigos de error para la aplicación ERP
 * Formato: ErrC:XYnn donde X=módulo, Y=operación, nn=número secuencial
 */

// ========================= GENERAL ERRORS =========================
export const GENERAL_ERRORS = {
  NOT_FOUND: "ErrC:Gx01",
  INVALID_DATA: "ErrC:Gx02",
  UNAUTHORIZED: "ErrC:Gx03",
  FORBIDDEN: "ErrC:Gx04",
  INTERNAL_SERVER_ERROR: "ErrC:Gx05",
};

// ========================= AUTH ERRORS =========================
export const AUTH_ERRORS = {
  // Autenticación General (Ax)
  GENERAL: {
    TOKEN_GENERATION_ERROR: "ErrC:Ax01",
    TOKEN_NOT_PROVIDED: "ErrC:Ax02",
    INVALID_TOKEN_FORMAT: "ErrC:Ax03",
    INVALID_TOKEN: "ErrC:Ax04",
    TOKEN_VALIDATION_ERROR: "ErrC:Ax05",
  },

  // Login (Al)
  LOGIN: {
    INVALID_CREDENTIALS: "ErrC:Al01",
    USER_NOT_FOUND: "ErrC:Al02",
    INVALID_LOGIN_DATA: "ErrC:Al03",
    ACCOUNT_BLOCKED: "ErrC:Al04",
    INCORRECT_PASSWORD: "ErrC:Al05",
  },

  // Registro (Ar)
  REGISTER: {
    USER_ALREADY_EXISTS: "ErrC:Ar01",
    INVALID_EMAIL: "ErrC:Ar02",
    WEAK_PASSWORD: "ErrC:Ar03",
    INCOMPLETE_DATA: "ErrC:Ar04",
    CREATION_ERROR: "ErrC:Ar05",
  },

  // Autorización (Az)
  AUTHORIZATION: {
    INSUFFICIENT_PERMISSIONS: "ErrC:Az01",
    UNAUTHORIZED_ROLE: "ErrC:Az02",
    ACCESS_DENIED: "ErrC:Az03",
    INSUFFICIENT_HIERARCHY: "ErrC:Az04",
  },
} as const;

// ========================= EMPLOYEE ERRORS =========================
export const EMPLOYEE_ERRORS = {
  // General (Ex)
  GENERAL: {
    NOT_FOUND: "ErrC:Ex01",
    INVALID_CODE: "ErrC:Ex02",
    ALREADY_EXISTS: "ErrC:Ex03",
    INVALID_DATA: "ErrC:Ex04",
  },

  // Creación (Ec)
  CREATE: {
    MISSING_REQUIRED_DATA: "ErrC:Ec01",
    DUPLICATE_DNI: "ErrC:Ec02",
    DUPLICATE_EMAIL: "ErrC:Ec03",
    INVALID_ROLE: "ErrC:Ec04",
    CREATION_ERROR: "ErrC:Ec05",
  },

  // Actualización (Eu)
  UPDATE: {
    NOT_FOUND_FOR_UPDATE: "ErrC:Eu01",
    UPDATE_CONFLICT: "ErrC:Eu02",
    INVALID_UPDATE_DATA: "ErrC:Eu03",
    CANNOT_UPDATE_SUPERIOR: "ErrC:Eu04",
  },
} as const;

// ========================= VEHICLE ERRORS =========================
export const VEHICLE_ERRORS = {
  // General (Vx)
  GENERAL: {
    NOT_FOUND: "ErrC:Vx01",
    INVALID_DATA: "ErrC:Vx02",
    ALREADY_EXISTS: "ErrC:Vx03",
  },

  // Creación (Vc)
  CREATE: {
    DUPLICATE_PLATE: "ErrC:Vc01",
    INVALID_TYPE: "ErrC:Vc02",
    INVALID_YEAR: "ErrC:Vc03",
    INVALID_FUEL_CAPACITY: "ErrC:Vc04",
  },
} as const;

// ========================= FUEL ERRORS =========================
export const FUEL_ERRORS = {
  // General (Fx)
  GENERAL: {
    TANK_ALREADY_EXISTS: "ErrC:Fx01",
    REFILL_NOT_FOUND: "ErrC:Fx02",
    INVALID_AMOUNT: "ErrC:Fx03",
    UNSUPPORTED_FUEL_TYPE: "ErrC:Fx04",
  },

  // Mappers (Fm)
  MAPPER: {
    INVALID_CONSUMPTION_OBJECT: "ErrC:Fm01",
    INVALID_TANK_OBJECT: "ErrC:Fm02",
    INVALID_REFILL_OBJECT: "ErrC:Fm03",
    INVALID_TANK_RESET_OBJECT: "ErrC:Fm04",
  },

  // Operaciones (Fo)
  OPERATIONS: {
    INSUFFICIENT_FUEL: "ErrC:Fo01",
    CAPACITY_EXCEEDED: "ErrC:Fo02",
    TANK_ALREADY_FULL: "ErrC:Fo03",
    CANNOT_CONSUME_EMPTY_TANK: "ErrC:Fo04",
  },
} as const;

// ========================= INVENTORY ERRORS =========================
export const INVENTORY_ERRORS = {
  // General (Ix)
  GENERAL: {
    MATERIAL_NOT_FOUND: "ErrC:Ix01",
    INVALID_QUANTITY: "ErrC:Ix02",
    MATERIAL_ALREADY_EXISTS: "ErrC:Ix03",
    INSUFFICIENT_STOCK: "ErrC:Ix04",
  },

  // Mappers (Im)
  MAPPER: {
    INVALID_MATERIAL_OBJECT: "ErrC:Im01",
    INVALID_STOCK_MOVE_OBJECT: "ErrC:Im02",
    INCONSISTENT_DATA: "ErrC:Im03",
  },

  // Movimientos (Ii)
  MOVEMENTS: {
    INVALID_MOVEMENT_TYPE: "ErrC:Ii01",
    INVALID_MOVEMENT_DATE: "ErrC:Ii02",
    DUPLICATE_MOVEMENT: "ErrC:Ii03",
    INVALID_LOCATION: "ErrC:Ii04",
  },
} as const;

// ========================= CUSTOMER ERRORS =========================
export const CUSTOMER_ERRORS = {
  // General (Cx)
  GENERAL: {
    NOT_FOUND: "ErrC:Cx01",
    ALREADY_EXISTS: "ErrC:Cx02",
    INVALID_DATA: "ErrC:Cx03",
    INVALID_RUC_DNI: "ErrC:Cx04",
  },
} as const;

// ========================= SYSTEM ERRORS =========================
export const SYSTEM_ERRORS = {
  // General (Sx)
  GENERAL: {
    INTERNAL_SERVER_ERROR: "ErrC:Sx01",
    SERVICE_UNAVAILABLE: "ErrC:Sx02",
    CONFIGURATION_ERROR: "ErrC:Sx03",
    RESOURCE_UNAVAILABLE: "ErrC:Sx04",
  },
} as const;

// ========================= DATABASE ERRORS =========================
export const DATABASE_ERRORS = {
  // General (Dx)
  GENERAL: {
    CONNECTION_ERROR: "ErrC:Dx01",
    QUERY_ERROR: "ErrC:Dx02",
    TRANSACTION_FAILED: "ErrC:Dx03",
    CONSTRAINT_VIOLATION: "ErrC:Dx04",
    CONNECTION_TIMEOUT: "ErrC:Dx05",
  },
} as const;

// ========================= VALIDATION ERRORS =========================
export const VALIDATION_ERRORS = {
  // General (Wx)
  GENERAL: {
    MISSING_REQUIRED_FIELD: "ErrC:Wx01",
    INVALID_DATA_FORMAT: "ErrC:Wx02",
    VALUE_OUT_OF_RANGE: "ErrC:Wx03",
    INVALID_FIELD_LENGTH: "ErrC:Wx04",
    INVALID_CHARACTERS: "ErrC:Wx05",
  },

  // Mappers (Wm)
  MAPPER: {
    INVALID_USER_OBJECT: "ErrC:Wm01",
    MAPPING_FAILED: "ErrC:Wm02",
    INCORRECT_DATA_STRUCTURE: "ErrC:Wm03",
  },
} as const;

// ========================= MENSAJES DE ERROR =========================
export const ERROR_MESSAGES = {
  //GENERAL
  [GENERAL_ERRORS.NOT_FOUND]: "Recurso no encontrado",
  [GENERAL_ERRORS.INVALID_DATA]: "Datos inválidos",
  [GENERAL_ERRORS.UNAUTHORIZED]: "No autorizado",
  [GENERAL_ERRORS.FORBIDDEN]: "Prohibido",
  [GENERAL_ERRORS.INTERNAL_SERVER_ERROR]: "Error interno del servidor",

  // AUTH
  [AUTH_ERRORS.GENERAL.TOKEN_GENERATION_ERROR]: "Error register user",
  [AUTH_ERRORS.GENERAL.TOKEN_NOT_PROVIDED]: "No se proporcionó token",
  [AUTH_ERRORS.GENERAL.INVALID_TOKEN_FORMAT]: "Formato de token no válido",
  [AUTH_ERRORS.GENERAL.INVALID_TOKEN]: "Token no válido",
  [AUTH_ERRORS.GENERAL.TOKEN_VALIDATION_ERROR]: "Internal server error",

  [AUTH_ERRORS.LOGIN.INVALID_CREDENTIALS]: "Credenciales inválidas",
  [AUTH_ERRORS.LOGIN.USER_NOT_FOUND]: "Usuario no encontrado",
  [AUTH_ERRORS.LOGIN.INVALID_LOGIN_DATA]: "Datos de login inválidos",
  [AUTH_ERRORS.LOGIN.ACCOUNT_BLOCKED]: "Cuenta bloqueada temporalmente",
  [AUTH_ERRORS.LOGIN.INCORRECT_PASSWORD]: "Contraseña incorrecta",

  // EMPLOYEE
  [EMPLOYEE_ERRORS.GENERAL.NOT_FOUND]: "Empleado no encontrado",
  [EMPLOYEE_ERRORS.GENERAL.INVALID_CODE]: "Código de empleado no válido",
  [EMPLOYEE_ERRORS.GENERAL.ALREADY_EXISTS]: "El empleado ya existe",
  [EMPLOYEE_ERRORS.GENERAL.INVALID_DATA]: "Datos de empleado inválidos",

  // FUEL
  [FUEL_ERRORS.GENERAL.TANK_ALREADY_EXISTS]:
    "Ya existe un tanque de combustible",
  [FUEL_ERRORS.GENERAL.REFILL_NOT_FOUND]: "Reabastecimiento no encontrado",
  [FUEL_ERRORS.MAPPER.INVALID_CONSUMPTION_OBJECT]:
    "Invalid fuel consumption object",
  [FUEL_ERRORS.MAPPER.INVALID_TANK_OBJECT]: "Invalid fuel tank object",
  [FUEL_ERRORS.MAPPER.INVALID_REFILL_OBJECT]: "Invalid fuel refill object",
  [FUEL_ERRORS.MAPPER.INVALID_TANK_RESET_OBJECT]:
    "Invalid fuel tank reset object",

  // INVENTORY
  [INVENTORY_ERRORS.MAPPER.INVALID_MATERIAL_OBJECT]: "Invalid material object",
  [INVENTORY_ERRORS.MAPPER.INVALID_STOCK_MOVE_OBJECT]:
    "Invalid stock move object",

  // VALIDATION
  [VALIDATION_ERRORS.MAPPER.INVALID_USER_OBJECT]: "Invalid user object",
} as const;

// ========================= CÓDIGOS HTTP =========================
export const HTTP_STATUS_CODES = {
  // GENERAL
  [GENERAL_ERRORS.NOT_FOUND]: 404,
  [GENERAL_ERRORS.INVALID_DATA]: 400,
  [GENERAL_ERRORS.UNAUTHORIZED]: 401,
  [GENERAL_ERRORS.FORBIDDEN]: 403,
  [GENERAL_ERRORS.INTERNAL_SERVER_ERROR]: 500,
  // AUTH
  [AUTH_ERRORS.GENERAL.TOKEN_GENERATION_ERROR]: 500,
  [AUTH_ERRORS.GENERAL.TOKEN_NOT_PROVIDED]: 401,
  [AUTH_ERRORS.GENERAL.INVALID_TOKEN_FORMAT]: 401,
  [AUTH_ERRORS.GENERAL.INVALID_TOKEN]: 401,
  [AUTH_ERRORS.GENERAL.TOKEN_VALIDATION_ERROR]: 500,

  [AUTH_ERRORS.LOGIN.INVALID_CREDENTIALS]: 401,
  [AUTH_ERRORS.LOGIN.USER_NOT_FOUND]: 404,
  [AUTH_ERRORS.LOGIN.INVALID_LOGIN_DATA]: 400,
  [AUTH_ERRORS.LOGIN.ACCOUNT_BLOCKED]: 423,
  [AUTH_ERRORS.LOGIN.INCORRECT_PASSWORD]: 401,

  // EMPLOYEE
  [EMPLOYEE_ERRORS.GENERAL.NOT_FOUND]: 404,
  [EMPLOYEE_ERRORS.GENERAL.INVALID_CODE]: 400,
  [EMPLOYEE_ERRORS.GENERAL.ALREADY_EXISTS]: 409,
  [EMPLOYEE_ERRORS.GENERAL.INVALID_DATA]: 400,

  // FUEL
  [FUEL_ERRORS.GENERAL.TANK_ALREADY_EXISTS]: 409,
  [FUEL_ERRORS.GENERAL.REFILL_NOT_FOUND]: 404,
  [FUEL_ERRORS.MAPPER.INVALID_CONSUMPTION_OBJECT]: 400,
  [FUEL_ERRORS.MAPPER.INVALID_TANK_OBJECT]: 400,
  [FUEL_ERRORS.MAPPER.INVALID_REFILL_OBJECT]: 400,
  [FUEL_ERRORS.MAPPER.INVALID_TANK_RESET_OBJECT]: 400,

  // INVENTORY
  [INVENTORY_ERRORS.MAPPER.INVALID_MATERIAL_OBJECT]: 400,
  [INVENTORY_ERRORS.MAPPER.INVALID_STOCK_MOVE_OBJECT]: 400,

  // VALIDATION
  [VALIDATION_ERRORS.MAPPER.INVALID_USER_OBJECT]: 400,
} as const;

// ========================= UTILIDADES =========================

/**
 * Obtiene el mensaje de error para un código dado
 */
export const getErrorMessage = (errorCode: string): string => {
  return (
    ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] ||
    "Error desconocido"
  );
};

/**
 * Obtiene el código HTTP para un código de error dado
 */
export const getHttpStatusCode = (errorCode: string): number => {
  return HTTP_STATUS_CODES[errorCode as keyof typeof HTTP_STATUS_CODES] || 500;
};

/**
 * Crea un mensaje de error completo con el código incluido
 */
export const createErrorMessage = (
  errorCode: string,
  customMessage?: string
): string => {
  const defaultMessage = getErrorMessage(errorCode);
  const message = customMessage || defaultMessage;
  return `${message} ${errorCode}`;
};
