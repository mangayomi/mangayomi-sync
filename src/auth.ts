import { Express } from "express";
import { User } from "./model/user.js";
import { UserDTO, validateDto } from "./dto/dto.js";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./database.js";

export function registerEndpoints(app: Express): void {
    app.post('/login', async (req, res) => {
        const dto = new UserDTO();
        dto.email = req.body.email;
        dto.password = req.body.password;
        const valid = await validateDto(dto);
        if (!valid) {
            res.status(400).json({ error: "Invalid username or password" });
            return;
        }
        try {
            let user = await User.findOne({
                where: {
                    email: req.body.email,
                },
            });
            if (user == null) {
                user = await User.create({
                    email: dto.email,
                    passwordHash: await bcrypt.hash(dto.password, 10),
                });
            } else {
                const pwMatch = await bcrypt.compare(dto.password, user.passwordHash.toString());
                if (!pwMatch) {
                    res.status(400).json({ error: "Invalid password" });
                    return;
                }
            }
            dto.password = "";
            const token = jwt.sign({
                uuid: user.id,
                email: user.email,
            },
                process.env.JWT_SECRET_KEY ?? 'cozy_furnace', {
                expiresIn: `${process.env.JWT_EXPIRATION_DAYS ?? '365'}d`,
            });
            res.status(200).json({ token: token });
        } catch (error: any) {
            console.log('Login failed: ', error);
            res.status(500).json({ error: "Server error" });
        }
    });

    app.get('/check', async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET_KEY ?? 'cozy_furnace');
            } else {
                res.status(401).json({});
                return;
            }
        } catch (error: any) {
            res.status(401).json({ error: error.message });
            return;
        }
        try {
            const user = await User.findOne({
                where: {
                    email: decodedData.email,
                },
            });
            if (user != null) {
                const hash = crypto.createHash("sha256");
                hash.update(Buffer.from(user.backupData ?? "").toString('utf-8'));
                res.status(200).json({ hash: hash.digest('hex') });
                return;
            }
            res.status(401).json({});
        } catch (error: any) {
            console.log('Check failed: ', error);
            res.status(500).json({ error: "Server error" });
        }
    });

    app.post('/sync', async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET_KEY ?? 'cozy_furnace');
            } else {
                res.status(401).json({});
                return;
            }
        } catch (error: any) {
            res.status(401).json({ error: error.message });
            return;
        }
        const transaction = await db.sequelize.transaction();
        try {
            const user = await User.findOne({
                where: {
                    email: decodedData.email,
                },
            });
            if (user != null) {
                user.backupData = req.body.backupData;
                await user.save({ transaction: transaction });
                res.status(200).json({ backupData: user.backupData });
                await transaction.commit();
                return;
            }
            res.status(401).json({});
            await transaction.commit();
        } catch (error: any) {
            await transaction.rollback();
            console.log('Sync failed: ', error);
            res.status(500).json({ error: "Server error" });
        }
    });
};
