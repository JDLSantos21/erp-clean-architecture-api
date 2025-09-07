import mysqlPool from "./config";

export class MysqlDatabase {
  static async connect() {
    try {
      const connection = await mysqlPool.getConnection();
      connection.release();
      console.log("Connected to MySQL database");
      return true;
    } catch (error) {
      console.log("Error connecting to MySQL database:", error);
      throw error;
    }
  }
}
