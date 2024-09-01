import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import compression from "compression";
import { db } from "./database.js";
import { registerEndpoints } from "./auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(compression());

(async () => {
    await db.sequelize.sync({
        force: process.env.MODE !== 'prod'
    });
})();

registerEndpoints(app);

app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://0.0.0.0:${process.env.PORT}`);
});
