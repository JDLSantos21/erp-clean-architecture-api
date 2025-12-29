import { envs } from "../../config";
import { CacheService, Logger } from "../../domain";
import { TelemetryDatasource } from "../../domain/datasources/telemetry.datasource";
import { VehicleTelemetry } from "../../domain/entities/telemetry/VehicleTelemetry";
import axios, { AxiosInstance } from "axios";
import vm from "vm";

export class GpsGateDatasourceImpl implements TelemetryDatasource {
  private readonly axiosInstance: AxiosInstance;
  private readonly fransonApplicationId: string =
    "0DB484A0E3533C5D82C95536146A609E";
  private readonly baseUrl: string = "https://smartcar.claro.com.do";
  private sessionPromise: Promise<string> | null = null;

  constructor(private readonly cacheService: CacheService) {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "es-ES,es;q=0.9",
        Origin: this.baseUrl,
        Referer: `${this.baseUrl}/VehicleTracker/VehicleTracker.html?appid=130`,
      },
    });

    this.setupInterceptors();

    // Inicialización "Eager" (fuego y olvido) para calentar el caché
    this.getSessionId().catch((err) =>
      Logger.error("[INFRA] Error en inicialización temprana de sesión", err)
    );
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(async (config) => {
      try {
        const sessionId = await this.getSessionId();
        if (sessionId) {
          config.headers.Cookie = `FransonSessionID=${sessionId}; FransonApplicationID=${this.fransonApplicationId}`;
        }
      } catch (error) {
        Logger.error(
          "[INFRA] No se pudo obtener Session ID para la petición",
          error
        );
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      async (response) => {
        let data = response.data;

        // Si la respuesta es string (debido a transformResponse), intentamos parsear
        // para verificar si es un error JSON-RPC en lugar del script esperado.
        if (typeof data === "string") {
          try {
            if (data.trim().startsWith("{")) {
              data = JSON.parse(data);
            }
          } catch (e) {
            // No es JSON, probablemente es el script esperado
          }
        }

        if (data?.error?.message === "Session has expired") {
          const originalRequest = response.config as any;

          if (!originalRequest._retry) {
            originalRequest._retry = true;
            Logger.info(
              "[INFRA] JSON-RPC Session Expired - Invalidando sesión y reintentando..."
            );
            this.sessionPromise = null;
            await this.cacheService.delete("GPSGATE_SESSION_ID");
            return this.axiosInstance(originalRequest);
          }
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        // Reintento si recibimos 401 (Sesión vencida)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          Logger.info("[INFRA] 401 Detectado - Invalidando sesión");
          this.sessionPromise = null; // invalidar promesa actual para forzar login
          await this.cacheService.delete("GPSGATE_SESSION_ID");
          return this.axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene un Session ID válido, ya sea de memoria, caché o login.
   * Maneja condiciones de carrera retornando la misma promesa a llamadas simultáneas.
   */
  private async getSessionId(): Promise<string> {
    if (this.sessionPromise) {
      return this.sessionPromise;
    }

    this.sessionPromise = (async () => {
      const cachedSession = await this.cacheService.get<string>(
        "GPSGATE_SESSION_ID"
      );

      if (cachedSession) return cachedSession;
      return this.performLogin();
    })().catch((error) => {
      this.sessionPromise = null;
      throw error;
    });

    return this.sessionPromise;
  }

  private async performLogin(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/comGpsGate/rpc/Directory/v.1?_METHOD=Login`,
        {
          id: 1,
          method: "Login",
          params: {
            strUserName: envs.SMARTCAR_USER,
            strPassword: envs.SMARTCAR_PASSWORD,
            bStaySignedIn: false,
            appId: 0,
          },
        }
      );

      if (response.data.error) {
        throw new Error(
          response.data.error.message || "Error desconocido en Login GpsGate"
        );
      }

      const cookies = response.headers["set-cookie"];
      let sessionId = "";

      if (cookies) {
        const sessionCookie = cookies.find((c) =>
          c.includes("FransonSessionID")
        );
        if (sessionCookie) {
          sessionId = sessionCookie.split(";")[0].split("=")[1];
        }
      }

      if (!sessionId) throw new Error("No se sessionID en las cookies");

      await this.cacheService.set("GPSGATE_SESSION_ID", sessionId, 18000);
      return sessionId;
    } catch (error) {
      Logger.error("[INFRA] Fallo en Login:", error);
      throw new Error("Authentication failed with GpsGate");
    }
  }

  async getFleetTelemetry(): Promise<VehicleTelemetry[]> {
    const payload = {
      id: 1,
      method: "GetLatestUserDataByViewChunked",
      params: { appId: 130, iCount: 500, iIndex: 0, iViewID: 673 },
    };

    try {
      const response = await this.axiosInstance.post(
        "/comGpsGate/rpc/Directory/v.1?_METHOD=GetLatestUserDataByViewChunked",
        payload,
        { transformResponse: [(d) => d] }
      );

      const result = this.executeScript(response.data);
      const users = result?.result?.result?.users || [];

      if (users.length > 0) {
        Logger.info(`[INFRA] ${users.length} encontrados.`);
      } else {
        Logger.warn("[INFRA] La lista de vehiculos está vacía.");
      }

      return this.mapToEntities(users);
    } catch (error) {
      Logger.error("[INFRA] Error fetching fleet telemetry:", error);
      throw error;
    }
  }

  private executeScript(script: string): any {
    try {
      const scriptToRun = `(${script})`;
      return vm.runInNewContext(scriptToRun, { Date });
    } catch (e) {
      Logger.error("[INFRA] VM script execution failed", e);
      throw new Error("Failed to process GpsGate executable response");
    }
  }

  private mapToEntities(users: any[]): VehicleTelemetry[] {
    return users.map((u: any) => {
      return new VehicleTelemetry({
        id: u.id,
        name: u.name || `Vehículo ${u.id}`,
        lat: u.trackPoint?.pos?.lat || 0,
        lng: u.trackPoint?.pos?.lng || 0,
        speed: Math.round(u.trackPoint?.vel?.speed || 0),
        heading: u.trackPoint?.vel?.heading || 0,
        lastUpdate: new Date(),
      });
    });
  }
}
