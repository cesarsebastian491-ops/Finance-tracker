import { DataSource } from "typeorm";
import { config } from "dotenv";
config();

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "finance-system",
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
});