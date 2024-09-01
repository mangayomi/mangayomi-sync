import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE_URI ?? '',
  {
    dialect: 'mysql',
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(error => {
    console.error("Unable to connect to the database: ", error);
  });

export const db = {
    sequelize: sequelize,
};
