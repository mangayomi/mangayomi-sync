import { Express } from "express";
import { User } from "./model/user.js";
import { UserDTO, validateDto } from "./dto/dto.js";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./database.js";
import { mergeProgress } from "./merge.js";
import {
  BackupData,
  Category,
  Chapter,
  Feed,
  History,
  Manga,
  Track,
} from "./model/backup.js";

export function registerEndpoints(app: Express): void {
  /**
   * @author Schnitzel5
   * @version 1.0.0
   * This endpoint is the entrypoint to retrieve the JWT token required
   * for all other secured endpoints (upload, download, ...).
   */
  app.post("/login", async (req, res) => {
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
        const pwMatch = await bcrypt.compare(
          dto.password,
          user.passwordHash.toString()
        );
        if (!pwMatch) {
          res.status(400).json({ error: "Invalid password" });
          return;
        }
      }
      dto.password = "";
      const token = jwt.sign(
        {
          uuid: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET_KEY ?? "cozy_furnace",
        {
          expiresIn: `${process.env.JWT_EXPIRATION_DAYS ?? "365"}d`,
        }
      );
      res.status(200).json({ token: token });
    } catch (error: any) {
      console.log("Login failed: ", error);
      res.status(500).json({ error: "Server error" });
    }
  });

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
          process.env.JWT_SECRET_KEY ?? "cozy_furnace"
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
          feeds: Feed[];
        } = {
          version: backup.version,
          manga: backup.manga,
          categories: backup.categories,
          chapters: backup.chapters,
          tracks: backup.tracks,
          history: backup.history,
          feeds: backup.feeds,
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
          process.env.JWT_SECRET_KEY ?? "cozy_furnace"
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
   * This secured endpoint receives the full backup of the client and overwrites the current backup.
   */
  app.post("/upload/full", async (req, res) => {
    let decodedData: any;
    try {
      const auth = req.headers.authorization;
      if (auth && auth.split(" ").length > 1) {
        decodedData = jwt.verify(
          auth.split(" ")[1],
          process.env.JWT_SECRET_KEY ?? "cozy_furnace"
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
   * @version 1.0.0
   * This secured endpoint sends the full backup from the DB to the client.
   */
  app.get("/download", async (req, res) => {
    let decodedData: any;
    try {
      const auth = req.headers.authorization;
      if (auth && auth.split(" ").length > 1) {
        decodedData = jwt.verify(
          auth.split(" ")[1],
          process.env.JWT_SECRET_KEY ?? "cozy_furnace"
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
}
