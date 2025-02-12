import { Express } from "express";
import { User } from "./model/user.js";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import jwt from "jsonwebtoken";
import { db } from "./database.js";
import {
  BackupData,
  Category,
  Chapter,
  Update,
  History,
  Manga,
  Track,
  Extension,
} from "./model/backup.js";
import { plainToInstance } from "class-transformer";
import { ActionType, ChangedDTO, ChangedPart, validateDto } from "./dto/dto.js";
import { Timeline } from "./model/timeline.js";

export function registerEndpoints(app: Express): void {
  /**
   * @author Schnitzel5
   * @version 1.1
   * This secured endpoint responds with a "remote" hash of the logged users'
   * backup data which is compared to the "local" hash.
   * If the hash differs, then the client should retrieve the latest remote version 
   * after pushing its local changes.
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
        const filteredBackup = prepareForHashCheck(backup);
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
   * @version 1.0
   * This secured endpoint receives a list of tracked changes which modifies the remote backup data.
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
    const dto = plainToInstance(ChangedDTO, req.body);
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
        if (user.backupData == null) {
          res.status(400).json({ error: "No remote data available" });
          return;
        }
        const temp = await patchBackup(user, JSON.parse(user.backupData), dto.changedParts);
        const patchedBackup = JSON.stringify(temp);
        user.backupData = typeof patchedBackup === "string"
          ? patchedBackup
          : JSON.stringify(patchedBackup);
        await user.save({ transaction: transaction });
        const filteredBackup = prepareForHashCheck(temp);
        const hash = crypto.createHash("sha256");
        hash.update(
          Buffer.from(JSON.stringify(filteredBackup)).toString("utf-8")
        );
        res.status(200).json({ hash: hash.digest("hex") });
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

async function patchBackup(
  user: User,
  backup: BackupData,
  changes: ChangedPart[]
): Promise<BackupData> {
  for (const change of changes.sort((c1, c2) => c1.clientDate - c2.clientDate)) {
    try {
      if (change.action.startsWith("UPDATE_")) {
        await Timeline.create({
          user: user.id,
          actionType: change.action,
          isarId: change.isarId,
          backupData: change.data,
          clientDate: change.clientDate
        });
      }
      let idx;
      let existing;
      switch (change.action) {
        case ActionType.ADD_ITEM:
          backup.manga.push(JSON.parse(change.data) as Manga);
          break;
        case ActionType.REMOVE_ITEM:
          backup.manga = backup.manga.filter(m => m.id !== change.isarId);
          backup.chapters = backup.chapters.filter(ch => ch.mangaId !== change.isarId);
          backup.history = backup.history.filter(h => h.mangaId !== change.isarId);
          backup.updates = backup.updates.filter(u => u.mangaId !== change.isarId);
          break;
        case ActionType.UPDATE_ITEM:
          existing = await Timeline.findOne({
            where: {
              user: user.id,
              actionType: change.action,
              isarId: change.isarId,
            },
            order: [["clientDate", "DESC"]],
          });
          if (existing == null || (existing?.clientDate ?? 0 < change.clientDate)) {
            idx = backup.manga.findIndex(m => m.id === change.isarId);
            if (idx != -1) {
              backup.manga[idx] = JSON.parse(change.data) as Manga;
            }
          }
          break;
        case ActionType.ADD_CATEGORY:
          backup.categories.push(JSON.parse(change.data) as Category);
          break;
        case ActionType.REMOVE_CATEGORY:
          backup.categories = backup.categories.filter(cat => cat.id !== change.isarId);
          break;
        case ActionType.RENAME_CATEGORY:
          existing = await Timeline.findOne({
            where: {
              user: user.id,
              action: change.action,
              isarId: change.isarId,
            },
            order: [["clientDate", "DESC"]],
          });
          if (existing == null || (existing?.clientDate ?? 0 < change.clientDate)) {
            idx = backup.categories.findIndex(cat => cat.id === change.isarId);
            if (idx != -1) {
              backup.categories[idx] = JSON.parse(change.data) as Category;
            }
          }
          break;
        case ActionType.ADD_CHAPTER:
          backup.chapters.push(JSON.parse(change.data) as Chapter);
          break;
        case ActionType.REMOVE_CHAPTER:
          backup.chapters = backup.chapters.filter(ch => ch.id !== change.isarId);
          break;
        case ActionType.UPDATE_CHAPTER:
          existing = await Timeline.findOne({
            where: {
              user: user.id,
              actionType: change.action,
              isarId: change.isarId,
            },
            order: [["clientDate", "DESC"]],
          });
          if (existing == null || (existing?.clientDate ?? 0 < change.clientDate)) {
            idx = backup.chapters.findIndex(ch => ch.id === change.isarId);
            if (idx != -1) {
              backup.chapters[idx] = JSON.parse(change.data) as Chapter;
            }
          }
          break;
        case ActionType.CLEAR_HISTORY:
          backup.history = [];
          break;
        case ActionType.ADD_HISTORY:
          backup.history.push(JSON.parse(change.data) as History);
          break;
        case ActionType.REMOVE_HISTORY:
          const history = backup.history.find(h => h.id === change.isarId);
          backup.history = backup.history.filter(h => h.id !== change.isarId);
          backup.manga = backup.manga.filter(m => m.id !== history?.mangaId);
          backup.chapters = backup.chapters.filter(ch => ch.mangaId !== history?.mangaId);
          backup.updates = backup.updates.filter(u => u.mangaId !== history?.mangaId);
          break;
        case ActionType.UPDATE_HISTORY:
          existing = await Timeline.findOne({
            where: {
              user: user.id,
              actionType: change.action,
              isarId: change.isarId,
            },
            order: [["clientDate", "DESC"]],
          });
          if (existing == null || (existing?.clientDate ?? 0 < change.clientDate)) {
            idx = backup.history.findIndex(h => h.id === change.isarId);
            if (idx != -1) {
              backup.history[idx] = JSON.parse(change.data) as History;
            }
          }
          break;
        case ActionType.CLEAR_UPDATES:
          backup.updates = [];
          break;
        case ActionType.ADD_UPDATE:
          backup.updates.push(JSON.parse(change.data) as Update);
          break;
        case ActionType.CLEAR_EXTENSION:
          backup.extensions = [];
          backup.extensions_preferences = [];
          break;
        case ActionType.ADD_EXTENSION:
          backup.extensions.push(JSON.parse(change.data) as Extension);
          break;
        case ActionType.REMOVE_EXTENSION:
          backup.extensions = backup.extensions.filter(ext => ext.id !== change.isarId);
          break;
        case ActionType.UPDATE_EXTENSION:
          existing = await Timeline.findOne({
            where: {
              user: user.id,
              actionType: change.action,
              isarId: change.isarId,
            },
            order: [["clientDate", "DESC"]],
          });
          if (existing == null || (existing?.clientDate ?? 0 < change.clientDate)) {
            idx = backup.extensions.findIndex(ext => ext.id === change.isarId);
            if (idx != -1) {
              backup.extensions[idx] = JSON.parse(change.data) as Extension;
            }
          }
          break;
        case ActionType.ADD_TRACK:
          backup.tracks.push(JSON.parse(change.data) as Track);
          break;
        case ActionType.REMOVE_TRACK:
          backup.tracks = backup.tracks.filter(tr => tr.id !== change.isarId);
          break;
        case ActionType.UPDATE_TRACK:
          existing = await Timeline.findOne({
            where: {
              user: user.id,
              actionType: change.action,
              isarId: change.isarId,
            },
            order: [["clientDate", "DESC"]],
          });
          if (existing == null || (existing?.clientDate ?? 0 < change.clientDate)) {
            idx = backup.tracks.findIndex(tr => tr.id === change.isarId);
            if (idx != -1) {
              backup.tracks[idx] = JSON.parse(change.data) as Track;
            }
          }
          break;
        default:
          console.log("Unknown action: ", change);
      }
    } catch (e) {
      console.error("Error processing change: ", change);
    }
  }

  return backup;
}

function prepareForHashCheck(backup: BackupData): {
  version: string;
  manga: Manga[];
  categories: Category[];
  chapters: Chapter[];
  tracks: Track[];
  history: History[];
  updates: Update[];
  extensions: Extension[];
} {
  return {
    version: backup.version,
    manga: backup.manga.map(m => {
      m.id = 0;
      return m;
    }),
    categories: backup.categories.map(cat => {
      cat.id = 0;
      return cat;
    }),
    chapters: backup.chapters.map(chap => {
      chap.id = 0;
      return chap;
    }),
    tracks: backup.tracks.map(tr => {
      tr.id = 0;
      return tr;
    }),
    history: backup.history.map(h => {
      h.id = 0;
      return h;
    }),
    updates: backup.updates.map(u => {
      u.id = 0;
      return u;
    }),
    extensions: backup.extensions.map(ext => {
      ext.id = 0;
      return ext;
    }),
  };
}
