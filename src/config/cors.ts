import { CorsOptions } from "cors";
import { envs } from "./envs";

/**
 * Configuración de CORS para el servidor
 *
 * En desarrollo: permite orígenes configurados en CORS_ORIGINS
 * En producción: solo permite orígenes específicos
 *
 * Variables de entorno:
 * - CORS_ORIGINS: Lista de orígenes permitidos separados por comas
 *   Ejemplo: "https://app.midominio.com,https://admin.midominio.com"
 * - NODE_ENV: "development" | "production"
 */
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = envs.CORS_ORIGINS;
    const isProduction = envs.NODE_ENV === "production";

    // Permitir peticiones sin origin (como Postman, Thunder Client, o apps móviles)
    if (!origin) {
      return callback(null, true);
    }

    // Verificar si el origen está en la lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // En desarrollo, mostrar advertencia pero permitir
    if (!isProduction) {
      console.warn(
        `⚠️  CORS: Origen no configurado permitido en desarrollo: ${origin}`
      );
      return callback(null, true);
    }

    // En producción, rechazar origen no permitido
    console.error(`❌ CORS: Origen bloqueado: ${origin}`);
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },

  // Credenciales (cookies, authorization headers)
  credentials: true,

  // Headers permitidos
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  // Métodos HTTP permitidos
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  // Headers expuestos al cliente
  exposedHeaders: ["Content-Range", "X-Content-Range", "X-Total-Count"],

  // Tiempo de cache de preflight (en segundos)
  maxAge: 86400, // 24 horas

  // Permitir preflight exitoso con status 204
  optionsSuccessStatus: 204,
};

/**
 * Configuración de CORS simplificada para desarrollo
 * Permite todos los orígenes - SOLO USAR EN DESARROLLO
 */
export const corsConfigDevelopment: CorsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
