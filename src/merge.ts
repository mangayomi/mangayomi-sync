import { BackupData, Category, Chapter, History, Manga, Track } from "./model/backup";

export function mergeProgress(oldData: BackupData, data: BackupData): string {
    const oldVersion = oldData.version;
    const newVersion = data.version;
    if (oldVersion === '1' && newVersion === '1') {
        return mergeProgressV1(oldData, data);
    }
    return JSON.stringify(oldData);
};

/**
 * @author Schnitzel5
 * @version 1.0.0
 * syncing chapters is not 100% straight-forward because of the missing timestamp info,
 * it relies on the lastest read progress which might be annoying for users who want to 
 * reread a manga or rewatch an anime
 */
function mergeProgressV1(oldData: BackupData, data: BackupData): string {
    oldData.manga = oldData.manga.map((manga: Manga) => {
        const newManga = data.manga.find(m => m.id === manga.id);
        if (newManga == undefined) {
            return null;
        }
        return newManga.lastRead > manga.lastRead ? newManga : manga;
    }).filter(manga => manga != null); // discard removed mangas and update existing mangas by lastRead timestamp
    data.manga.filter(newManga => oldData.manga.find(m => m.id === newManga.id) == undefined)
        .forEach(m => oldData.manga.push(m)); // append new added mangas
    oldData.chapters = oldData.chapters.map((chapter: Chapter) => {
        const newChapter = data.chapters.find(ch => ch.id === chapter.id);
        if (newChapter == undefined) {
            return null;
        }
        return newChapter.isRead || Number(newChapter.lastPageRead) > Number(chapter.lastPageRead) ? newChapter : chapter;
    }).filter(chapter => chapter != null);
    data.chapters.filter(newChapter => oldData.chapters.find(ch => ch.id === newChapter.id) == undefined)
        .forEach(ch => oldData.chapters.push(ch));
    oldData.categories = oldData.categories.filter(category => data.categories
        .find(cat => cat.id === category.id));
    data.categories.filter(newCategory => oldData.categories.find(cat => cat.id === newCategory.id) == undefined)
        .forEach(cat => oldData.categories.push(cat));
    oldData.tracks = oldData.tracks.map((track: Track) => {
        const newTrack = data.tracks.find(tr => tr.id === track.id);
        if (newTrack == undefined) {
            return null;
        }
        return newTrack.lastChapterRead > track.lastChapterRead ? newTrack : track;
    }).filter(track => track != null);
    data.tracks.filter(newTrack => oldData.tracks.find(tr => tr.id === newTrack.id) == undefined)
        .forEach(tr => oldData.tracks.push(tr));
    oldData.history = oldData.history.map((history: History) => {
        const newHistory = data.history.find(h => h.mangaId === history.mangaId);
        return newHistory != undefined && Number(newHistory.date) > Number(history.date) ? newHistory : history;
    });
    data.history.filter(newHistory => oldData.history.find(h => h.mangaId === newHistory.mangaId) == undefined)
        .forEach(h => oldData.history.push(h));
    return JSON.stringify(oldData);
}
