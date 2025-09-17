const AUTH_CONSTANTS = {
  JWT_SECRET: process.env.JWT_SECRET || "default_secret",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "1h",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  ROLES: [
    "ADMIN",
    "ADMINISTRATIVO",
    "CHOFER",
    "SUPERVISOR",
    "OPERADOR",
    "USER",
  ] as const,
};

export default AUTH_CONSTANTS;
