import { BackupData } from "./model/backup";
import { ChangedItems } from "./model/changed";

export function mergeProgress(
  oldData: BackupData,
  data: BackupData,
  changedItems: ChangedItems
): string {
  const oldVersion = oldData.version;
  const newVersion = data.version;
  if (oldVersion === "1" && newVersion === "1") {
    return mergeProgressV1(oldData, data, changedItems);
  }
  return JSON.stringify(oldData);
}

/**
 * @author Schnitzel5
 * @version 1.0.0
 * syncing chapters is not 100% straight-forward because of the missing timestamp info,
 * it relies on the lastest read progress which might be annoying for users who want to
 * reread a manga or rewatch an anime
 */
function mergeProgressV1(
  oldData: BackupData,
  data: BackupData,
  changedItems: ChangedItems
): string {
  oldData.manga = oldData.manga
    .map((oldManga) => {
      const newManga = data.manga.find(
        (newManga) => oldManga.id === newManga.id
      );
      return newManga &&
        (newManga.lastRead > oldManga.lastRead ||
          newManga.lastUpdate > oldManga.lastUpdate)
        ? newManga
        : oldManga;
    })
    .filter((manga) => manga != null); // update existing mangas by lastRead or lastUpdate timestamp
  data.manga
    .filter(
      (newManga) =>
        oldData.manga.find((oldManga) => oldManga.id === newManga.id) ==
        undefined
    )
    .forEach((newManga) => oldData.manga.push(newManga)); // append new added manga
  oldData.manga = oldData.manga.filter(
    (oldManga) =>
      changedItems.deletedMangas.find(
        (deleted) => deleted.mangaId === oldManga.id
      ) == undefined
  ); // remove removed mangas

  oldData.chapters = oldData.chapters
    .map((chapter) => {
      const newChapter = data.chapters.find((ch) => ch.id === chapter.id);
      const updatedChapterItem = changedItems.updatedChapters.find(
        (updated) =>
          updated.chapterId === chapter.id &&
          updated.mangaId === chapter.mangaId
      );
      if (updatedChapterItem?.deleted) {
        return null;
      }
      return updatedChapterItem && newChapter ? newChapter : chapter;
    })
    .filter((chapter) => oldData.manga.find((m) => m.id === chapter?.mangaId) != undefined)
    .filter((chapter) => chapter != null); // discard removed chapters and update chapter read progress
  data.chapters
    .filter(
      (newChapter) =>
        oldData.manga.find((m) => m.id === newChapter.mangaId) != undefined &&
        oldData.chapters.find((ch) => ch.id === newChapter.id) == undefined
    )
    .forEach((ch) => oldData.chapters.push(ch)); // append new added chapters only if the manga exists, otherwise there will be merge conflicts

  oldData.categories = oldData.categories.filter((category) => {
    const newCategory = data.categories.find((cat) => cat.id === category.id);
    if (
      changedItems.deletedCategories.find(
        (deleted) => deleted.categoryId === category.id
      ) != undefined
    ) {
      return null;
    }
    return newCategory ?? category;
  }); // discard removed categories and update existing categories
  data.categories
    .filter(
      (newCategory) =>
        oldData.categories.find((cat) => cat.id === newCategory.id) == undefined
    )
    .forEach((cat) => oldData.categories.push(cat)); // append new added categories

  oldData.tracks = oldData.tracks
    .map((track) => {
      const newTrack = data.tracks.find((tr) => tr.id === track.id);
      if (newTrack == undefined) {
        return null;
      }
      return newTrack.lastChapterRead >= track.lastChapterRead
        ? newTrack
        : track;
    })
    .filter((track) => track != null); // discard removed tracks and update existing tracks by lastChapterRead timestamp
  data.tracks
    .filter(
      (newTrack) =>
        oldData.tracks.find((tr) => tr.id === newTrack.id) == undefined
    )
    .forEach((tr) => oldData.tracks.push(tr)); // append new added tracks

  oldData.history = oldData.history
    .map((history) => {
      const newHistory = data.history.find(
        (h) => h.mangaId === history.mangaId
      );
      if (
        changedItems.deletedMangas.find(
          (deleted) => deleted.mangaId === history.mangaId
        ) != undefined
      ) {
        return null;
      }
      return newHistory && Number(newHistory.date) >= Number(history.date)
        ? newHistory
        : history;
    })
    .filter((history) => oldData.manga.find((m) => m.id === history?.mangaId) != undefined)
    .filter((history) => history != null); // discard removed manga history and update existing manga history by date timestamp
  data.history
    .filter(
      (newHistory) =>
        oldData.manga.find((m) => m.id === newHistory.mangaId) &&
        oldData.history.find((h) => h.mangaId === newHistory.mangaId) ==
          undefined
    )
    .forEach((h) => oldData.history.push(h)); // append new manga history only if the manga exists, otherwise there will be merge conflicts

  if (!oldData.updates) {
    oldData.updates = [];
  }
  oldData.updates = oldData.updates
    .map((update) => {
      const newUpdate = data.updates.find((up) => up.id === update.id);
      if (
        changedItems.updatedChapters.find(
          (deleted) => deleted.deleted && deleted.mangaId === update.mangaId
        ) != undefined
      ) {
        return null;
      }
      return newUpdate &&
        (Number(newUpdate.date) >= Number(update.date) ||
        newUpdate.chapterName !== update.chapterName ||
        newUpdate.mangaId !== update.mangaId)
        ? newUpdate
        : update;
    })
    .filter((update) => update != null); // discard updates of removed mangas and update existing updates items on diff
  data.updates
    .filter(
      (newUpdate) =>
        oldData.updates.find(
          (up) =>
            up.mangaId === newUpdate.mangaId &&
            up.chapterName === newUpdate.chapterName
        ) == undefined
    )
    .forEach((up) => oldData.updates.push(up)); // append new updates

  return JSON.stringify(oldData);
}
