import { Express } from "express";
import { User } from "./model/user.js";
import jwt from "jsonwebtoken";
import { Snapshot } from "./model/snapshot.js";
import { db } from "./database.js";

export function registerEndpoints(app: Express): void {
    /**
     * @author Schnitzel5
     * @version 1.0
     * This secured endpoint receives the full backup of the client and overwrites the current backup.
     */
    app.post("/upload/full", async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(
                    auth.split(" ")[1],
                    process.env.JWT_SECRET_KEY ?? "sugoireads"
                );
            } else {
                res.status(401).json({ error: "Missing token" });
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
                user.backupData =
                    typeof req.body.backupData === "string"
                        ? req.body.backupData
                        : JSON.stringify(req.body.backupData);
                await user.save({ transaction: transaction });
                res.status(200).json({ backupData: user.backupData });
                await transaction.commit();
                return;
            }
            res.status(401).json({ error: "Invalid token" });
            await transaction.commit();
        } catch (error: any) {
            await transaction.rollback();
            console.log("Sync failed: ", error);
            res.status(500).json({ error: "Server error" });
        }
    });

    /**
     * @author Schnitzel5
     * @version 1.0
     * This secured endpoint sends the full backup from the DB to the client.
     */
    app.get("/download", async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(
                    auth.split(" ")[1],
                    process.env.JWT_SECRET_KEY ?? "sugoireads"
                );
            } else {
                res.status(401).json({ error: "Missing token" });
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
                res
                    .status(200)
                    .json({
                        backupData:
                            req.query.type === "raw"
                                ? JSON.parse(user.backupData ?? "")
                                : user.backupData,
                    });
                return;
            }
            res.status(401).json({ error: "Invalid token" });
        } catch (error: any) {
            console.log("Download failed: ", error);
            res.status(500).json({ error: "Server error" });
        }
    });

    /**
     * @author Schnitzel5
     * @version 1.0
     * This secured endpoint fetches a list of backups of the logged user.
     */
    app.get("/snapshot", async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(
                    auth.split(" ")[1],
                    process.env.JWT_SECRET_KEY ?? "sugoireads"
                );
            } else {
                res.status(401).json({ error: "Missing token" });
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
                const snapshots = await Snapshot.findAll({
                    where: {
                        user: user.id
                    },
                    order: [["dbCreatedAt", "DESC"]],
                    attributes: ["id", "dbCreatedAt"],
                });
                res.status(200).json(snapshots);
                return;
            }
            res.status(401).json({ error: "Invalid token" });
        } catch (error: any) {
            console.log("Fetching snapshot failed: ", error);
            res.status(500).json({ error: "Server error" });
        }
    });

    /**
     * @author Schnitzel5
     * @version 1.0
     * This secured endpoint returns the backup of a specific snapshot that belongs to the user.
     */
    app.get("/snapshot/:snapshotId(^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$)", async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(
                    auth.split(" ")[1],
                    process.env.JWT_SECRET_KEY ?? "sugoireads"
                );
            } else {
                res.status(401).json({ error: "Missing token" });
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
                const snapshot = await Snapshot.findOne({
                    where: {
                        id: req.params.snapshotId,
                        user: user.id,
                    },
                });
                if (snapshot != null) {
                    res.status(200).json({
                        backupData: snapshot.data
                    });
                    return;
                }
                res.status(404).json({});
                return;
            }
            res.status(401).json({ error: "Invalid token" });
        } catch (error: any) {
            console.log("Fetching snapshot data failed: ", error);
            res.status(500).json({ error: "Server error" });
        }
    });

    /**
     * @author Schnitzel5
     * @version 1.0
     * This secured endpoint creates a backup from the current sync data of the logged user.
     */
    app.post("/snapshot", async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(
                    auth.split(" ")[1],
                    process.env.JWT_SECRET_KEY ?? "sugoireads"
                );
            } else {
                res.status(401).json({ error: "Missing token" });
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
                if (user.backupData == null) {
                    res.status(400).json({ error: "No data" });
                    return;
                }
                await Snapshot.create({
                    user: user.id,
                    data: user.backupData
                });
                res.status(200).json({});
                return;
            }
            res.status(401).json({ error: "Invalid token" });
        } catch (error: any) {
            console.log("Creating snapshot failed: ", error);
            res.status(500).json({ error: "Server error" });
        }
    });

     /**
     * @author Schnitzel5
     * @version 1.0
     * This secured endpoint deletes a specific snapshot that belongs to the user.
     */
     app.delete("/snapshot/:snapshotId(^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$)", async (req, res) => {
        let decodedData: any;
        try {
            const auth = req.headers.authorization;
            if (auth && auth.split(" ").length > 1) {
                decodedData = jwt.verify(
                    auth.split(" ")[1],
                    process.env.JWT_SECRET_KEY ?? "sugoireads"
                );
            } else {
                res.status(401).json({ error: "Missing token" });
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
                const snapshot = await Snapshot.findOne({
                    where: {
                        id: req.params.snapshotId,
                        user: user.id,
                    },
                });
                if (snapshot != null) {
                    await snapshot.destroy();
                    res.status(200).json({});
                    return;
                }
                res.status(404).json({});
                return;
            }
            res.status(401).json({ error: "Invalid token" });
        } catch (error: any) {
            console.log("Fetching snapshot data failed: ", error);
            res.status(500).json({ error: "Server error" });
        }
    });
}
