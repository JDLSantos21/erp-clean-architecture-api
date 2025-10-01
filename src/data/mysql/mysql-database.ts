import mysqlPool from "./config";

export class MysqlDatabase {
  static async connect() {
    try {
      const connection = await mysqlPool.getConnection();
      connection.release();
      return true;
    } catch (error) {
      throw error;
    }
  }
}
