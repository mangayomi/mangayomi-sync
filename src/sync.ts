import { Express } from "express";
import { User } from "./model/user.js";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import jwt from "jsonwebtoken";
import { db } from "./database.js";
import { mergeProgress } from "./merge.js";
import {
  BackupData,
  Category,
  Chapter,
  Update,
  History,
  Manga,
  Track,
} from "./model/backup.js";
import { plainToInstance } from "class-transformer";
import { TimelineDTO, validateDto } from "./dto/dto.js";

export function registerEndpoints(app: Express): void {
  /**
   * @author Schnitzel5
   * @version 1.0.0
   * This secured endpoint responds a "remote" hash of the logged users'
   * backup data which is compared to the "local" hash.
   * If the hash differs, then the progress should be synced.
   */
  app.get("/check", async (req, res) => {
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
        const hash = crypto.createHash("sha256");
        const backup = user.backupData
          ? (JSON.parse(user.backupData) as BackupData)
          : null;
        if (!backup) {
          res
            .status(200)
            .json({ hash: hash.update(Buffer.from("")).digest("hex") });
          return;
        }
        const filteredBackup: {
          version: string;
          manga: Manga[];
          categories: Category[];
          chapters: Chapter[];
          tracks: Track[];
          history: History[];
          updates: Update[];
        } = {
          version: backup.version,
          manga: backup.manga,
          categories: backup.categories,
          chapters: backup.chapters,
          tracks: backup.tracks,
          history: backup.history,
          updates: backup.updates,
        };
        hash.update(
          Buffer.from(JSON.stringify(filteredBackup)).toString("utf-8")
        );
        res.status(200).json({ hash: hash.digest("hex") });
        return;
      }
      res.status(401).json({ error: "Invalid token" });
    } catch (error: any) {
      console.log("Check failed: ", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  /**
   * @author Schnitzel5
   * @version 1.0.0
   * This secured endpoint receives local data of a client and merges the progress for following:
   * - manga
   * - chapters
   * - categories
   * - tracks
   * - history
   * the merged data is sent back to the client
   */
  app.post("/sync", async (req, res) => {
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
        const mergedData = mergeProgress(
          JSON.parse(user.backupData ?? "{}"),
          req.body.backupData,
          req.body.changedItems
        );
        user.backupData =
          typeof mergedData === "string"
            ? mergedData
            : JSON.stringify(mergedData);
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
   * @version 1.0.0
   * This secured endpoint receives a list of tracked changes (timelines) which modifies the current sync data.
   */
  app.patch("/sync", async (req, res) => {
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
    const dto = plainToInstance(TimelineDTO, req.body);
    const valid = await validateDto(dto);
    if (!valid) {
      res.status(400).json({ error: "Invalid data" });
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
        // patch user.backupData
        //user.backupData = ;
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
}
