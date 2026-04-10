import { DataSource } from "typeorm";
import { config } from "dotenv";
config();

export default new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "1234",
  database: "finance-system",
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
});