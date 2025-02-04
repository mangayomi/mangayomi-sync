import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import { db } from "./database.js";
import * as auth from "./auth.js";
import * as data from "./data.js";
import * as migration from "./migration.js";
import * as sync from "./sync.js";

dotenv.config();
const app = express();

const endMiddleware = (req: Request, res: Response, next: any) => {
    if (process.env.MODE !== "prod") {
        console.log("BODY", req.body);
    }
    next();
};

app.use(express.static("public"));
app.use(cors({
    origin: process.env.MODE !== "prod" ? "http://localhost:25565" : process.env.CORS_ORIGIN_URL
}));
app.use(express.json({ limit: "50mb" }));
app.use(endMiddleware);
app.use(compression());

(async () => {
    await db.sequelize.sync({
        force: process.env.MODE !== 'prod'
    });
})();

auth.registerEndpoints(app);
data.registerEndpoints(app);
migration.registerEndpoints(app);
sync.registerEndpoints(app);

app.listen(process.env.PORT, () => {
    console.log(`Server is running at http://0.0.0.0:${process.env.PORT}`);
});
