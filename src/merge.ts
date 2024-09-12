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
    .filter((chapter) => chapter != null); // discard removed chapters and update chapter read progress
  data.chapters
    .filter(
      (newChapter) =>
        oldData.chapters.find((ch) => ch.id === newChapter.id) == undefined
    )
    .forEach((ch) => oldData.chapters.push(ch)); // append new added chapters

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
    .filter((history) => history != null); // discard removed manga history and update existing manga history by date timestamp
  data.history
    .filter(
      (newHistory) =>
        oldData.history.find((h) => h.mangaId === newHistory.mangaId) ==
        undefined
    )
    .forEach((h) => oldData.history.push(h)); // append new manga history
  
  if (!oldData.feeds) {
    oldData.feeds = [];
  }
  oldData.feeds = oldData.feeds
    .map((feed) => {
      const newFeed = data.feeds.find((f) => f.id === feed.id);
      if (
        changedItems.updatedChapters.find(
          (deleted) => deleted.deleted && deleted.mangaId === feed.mangaId
        ) != undefined
      ) {
        return null;
      }
      return newFeed &&
        (Number(newFeed.date) >= Number(newFeed.date) ||
          newFeed.chapterName !== feed.chapterName ||
          newFeed.mangaId !== feed.mangaId)
        ? newFeed
        : feed;
    })
    .filter((feed) => feed != null); // discard feeds of removed mangas and update existing feed items on diff
  data.feeds
    .filter(
      (newFeeds) =>
        oldData.feeds.find(
          (f) =>
            f.mangaId === newFeeds.mangaId &&
            f.chapterName === newFeeds.chapterName
        ) == undefined
    )
    .forEach((f) => oldData.feeds.push(f)); // append new feeds

  return JSON.stringify(oldData);
}
