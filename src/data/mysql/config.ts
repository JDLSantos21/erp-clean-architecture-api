// MySQL pool client

import { createPool } from "mysql2/promise";

const mysqlPool = createPool({
  host: "localhost",
  user: "root",
  database: "database_name",
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default mysqlPool;
