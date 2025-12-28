import { TelemetryDatasource } from "../../domain/datasources/telemetry.datasource";
import { VehicleTelemetry } from "../../domain/entities/telemetry/VehicleTelemetry";
import axios, { AxiosInstance } from "axios";
import vm from "vm";

export class GpsGateDatasourceImpl implements TelemetryDatasource {
  private readonly axiosInstance: AxiosInstance;
  private fransonSessionId: string = "";
  private fransonApplicationId: string = "example-app-id"; // Reemplazar con el Application ID real
  private readonly baseUrl: string = "https://smartcar.claro.com.do";

  constructor() {
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
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.fransonSessionId) {
        config.headers.Cookie = `FransonSessionID=${this.fransonSessionId}; FransonApplicationID=${this.fransonApplicationId}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // Reintento si recibimos 401 (Sesión vencida)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.login();
          return this.axiosInstance(originalRequest);
        }
        return Promise.reject(error);
      }
    );
  }

  private async login(): Promise<void> {
    console.log("[INFRA] Refreshing GpsGate session...");
    try {
      const response = await axios.post(
        `${this.baseUrl}/comGpsGate/rpc/Directory/v.1?_METHOD=Login`,
        {
          id: 1,
          method: "Login",
          params: {
            strUserName: "example", // Mantenlo en variables de entorno en producción
            strPassword: "example",
            bStaySignedIn: false,
            appId: 0,
          },
        }
      );

      console.log("Login successfully executed.");

      console.log(
        "[INFRA] GpsGate login response cookie.",
        response.headers["set-cookie"]
      );

      const cookies = response.headers["set-cookie"];
      if (cookies) {
        const sessionCookie = cookies.find((c) =>
          c.includes("FransonSessionID")
        );
        if (sessionCookie) {
          this.fransonSessionId = sessionCookie.split(";")[0].split("=")[1];
          console.log("[INFRA] Session ID updated successfully.");
        }
      }
    } catch (error) {
      console.error("[INFRA] Login failed:", error);
      throw new Error("Authentication failed with GpsGate");
    }
  }

  async getFleetTelemetry(): Promise<VehicleTelemetry[]> {
    if (!this.fransonSessionId) {
      console.log("[INFRA] No session ID, logging in...");
      await this.login();
    }

    const payload = {
      id: 1,
      method: "GetLatestUserDataByViewChunked",
      params: { appId: 130, iCount: 500, iIndex: 0, iViewID: 673 },
    };

    try {
      const response = await this.axiosInstance.post(
        "/comGpsGate/rpc/Directory/v.1?_METHOD=GetLatestUserDataByViewChunked",
        payload,
        { transformResponse: [(d) => d] } // Evitamos que Axios intente parsear el string ejecutable
      );

      console.log("[INFRA] Fetched fleet telemetry data.");

      const result = this.executeScript(response.data);

      // La estructura de GpsGate es: result.result.users
      const users = result?.result?.result?.users || [];
      console.log("[INFRA] First user name:", users[0]?.name);
      return this.mapToEntities(users);
    } catch (error) {
      console.error("[INFRA] Error fetching fleet telemetry:", error);
      throw error;
    }
  }

  private executeScript(script: string): any {
    try {
      // GpsGate envía: {"id":1, "result": {...}}
      // Lo envolvemos para que el VM lo retorne como expresión
      const scriptToRun = `(${script})`;
      return vm.runInNewContext(scriptToRun, { Date });
    } catch (e) {
      console.error("[INFRA] VM script execution failed", e);
      throw new Error("Failed to process GpsGate executable response");
    }
  }

  private mapToEntities(users: any[]): VehicleTelemetry[] {
    return users.map((u: any) => {
      // El objeto 'u' (user) contiene 'trackPoint' con la telemetría real
      return new VehicleTelemetry({
        id: u.id,
        name: u.name || `Vehículo ${u.id}`,
        lat: u.trackPoint?.pos?.lat || 0,
        lng: u.trackPoint?.pos?.lng || 0,
        speed: Math.round(u.trackPoint?.vel?.speed || 0),
        heading: u.trackPoint?.vel?.heading || 0,
        lastUpdate: new Date(), // GpsGate usa timestamps internos, aquí usamos el de recepción
      });
    });
  }
}
