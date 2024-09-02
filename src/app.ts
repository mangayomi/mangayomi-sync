import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import compression from "compression";
import { db } from "./database.js";
import { registerEndpoints } from "./auth.js";

dotenv.config();
const app = express();

const endMiddleware = (req: Request, res: Response, next: any) => {
    console.log("BODY", req.body);
    next();
};

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(endMiddleware);
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
