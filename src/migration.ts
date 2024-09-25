import { Express } from "express";
import multer from "multer";
import * as unzipper from "unzipper";
import { BookmarkItems } from "./migration/kotatsu/bookmarks";
import { BackupData, Chapter } from "./model/backup";
import { Categories } from "./migration/kotatsu/categories";
import { Favourites } from "./migration/kotatsu/favourites";
import { Histories } from "./migration/kotatsu/histories";
import { Settings } from "./migration/kotatsu/settings";
import { Sources } from "./migration/kotatsu/sources";
import axios from "axios";
import { JSONPath } from "jsonpath-plus";
import Long from "long";

const upload = multer({
  storage: multer.memoryStorage(),
});

export function registerEndpoints(app: Express): void {
  /**
   * @author Schnitzel5
   * @version 1.0.0
   * This endpoint migrates a kotatsu backup into a mangayomi backup.
   */
  app.post("/migrate/kotatsu", upload.single("backup"), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({});
        return;
      }
      const dir = await unzipper.Open.buffer(req.file.buffer);
      const backup: BackupData = {
        version: "1",
        categories: [],
        chapters: [],
        downloads: [],
        extensions: [],
        extensions_preferences: [],
        updates: [],
        history: [],
        manga: [],
        settings: [],
        trackPreferences: [],
        tracks: [],
      };
      let bookmarks: BookmarkItems | undefined = undefined;
      let categories: Categories | undefined = undefined;
      let favourites: Favourites | undefined = undefined;
      let histories: Histories | undefined = undefined;
      let settings: Settings | undefined = undefined;
      let sources: Sources | undefined = undefined;
      await Promise.all(
        dir.files.map(async (file) => {
          const content = await file.buffer();
          const data = JSON.parse(content.toString());
          switch (file.path) {
            case "bookmark":
              bookmarks = data as BookmarkItems;
              break;
            case "categories":
              categories = data as Categories;
              break;
            case "favourites":
              favourites = data as Favourites;
              break;
            case "history":
              histories = data as Histories;
              break;
            case "settings":
              settings = data as Settings;
              break;
            case "sources":
              sources = data as Sources;
              break;
            default:
              console.log("Ignored file in Kotatsu zip file:", file.path);
          }
        })
      );
      const droppedMangas: number[] = [];
      console.log("Processing settings...");
      if (settings) {
        // processSettings(backup, settings);
        await processSources(backup, settings);
      }
      console.log("Processing categories...");
      if (categories) {
        processCategories(backup, categories);
      }
      console.log("Processing favourites...");
      if (favourites) {
        await processFavourites(backup, favourites, droppedMangas);
      }
      console.log("Processing histories...");
      if (histories) {
        processHistories(backup, histories, droppedMangas);
      }
      console.log("Processing bookmarks...");
      if (bookmarks) {
        processBookmarks(backup, bookmarks, droppedMangas);
      }
      console.log("Done.");
      const date = new Date();
      const dateString = `${date.getFullYear()}-${handleDigits(
        date.getMonth() + 1
      )}-${handleDigits(date.getDate())}_${handleDigits(
        date.getHours()
      )}_${handleDigits(date.getMinutes())}_${handleDigits(
        date.getSeconds()
      )}.${date.getMilliseconds()}`;
      const fileName = `mangayomi_${dateString}_.backup`;
      var mimetype = "application/json";
      res.setHeader("Content-Type", mimetype);
      res.setHeader("Content-disposition", "attachment; filename=" + fileName);
      res.status(200).send(JSON.stringify(backup));
    } catch (error: any) {
      console.log("Migration failed: ", error);
      res.status(500).json({ error: "Server error", debug: req.file });
    }
  });
}

let mangaIndex = 1;
const mangaIds: Map<number, number> = new Map();
let chapterIndex = 1;
const chapterIds: Map<number, number> = new Map();

function processBookmarks(
  backup: BackupData,
  bookmarks: BookmarkItems,
  droppedMangas: number[]
) {}

function processCategories(backup: BackupData, categories: Categories) {
  for (var i = 0; i < categories.length; i++) {
    backup.categories.push({
      id: categories[i].category_id,
      name: categories[i].title,
      forManga: true,
    });
  }
}

async function processFavourites(
  backup: BackupData,
  favourites: Favourites,
  droppedMangas: number[]
) {
  for (var i = 0; i < favourites.length; i++) {
    const manga = favourites[i];
    if (manga.manga.source !== "MANGADEX") {
      console.log(
        "Manga dropped (unknown source):",
        manga.manga.title,
        " | ",
        manga.manga.source
      );
      droppedMangas.push(manga.manga_id);
      continue;
    }
    const mangaId = mangaIndex++;
    mangaIds.set(manga.manga_id, mangaId);
    backup.manga.push({
      id: mangaId,
      categories: [manga.category_id],
      isManga: true,
      name: manga.manga.title,
      link: `/manga/${manga.manga.url}`,
      author: manga.manga.author ?? "",
      artist: manga.manga.author ?? "",
      dateAdded: Date.now(),
      favorite: true,
      lastRead: Date.now(),
      lastUpdate: Date.now(),
      genre: manga.manga.tags.map((tag) => tag.title),
      customCoverImage: null,
      customCoverFromTracker: null,
      description: "",
      isLocalArchive: false,
      lang: "en",
      imageUrl: "https://furnace.30062022.xyz/cover.jpg",
      status: 0,
      source: manga.manga.source,
    });
    const res = await paginatedChapterListRequest(manga.manga.url, 0, "en");
    if (res && res.status === 200) {
      const chapterList = JSONPath({
        path: "$.data[*]",
        json: res.data,
      });
      const limit: number = JSONPath({
        path: "$.limit",
        json: res.data,
      })[0];
      let offset: number = JSONPath({
        path: "$.offset",
        json: res.data,
      })[0];
      const total: number = JSONPath({
        path: "$.total",
        json: res.data,
      })[0];
      getChapters(backup, chapterList, mangaId);
      let hasMoreResults = limit + offset < total;
      while (hasMoreResults) {
        offset += limit;
        var newRequest = await paginatedChapterListRequest(
          manga.manga.url,
          offset,
          "en"
        );
        if (!newRequest || newRequest.status !== 200) {
          break;
        }
        const total = JSONPath({
          path: "$.total",
          json: res.data,
        });
        const chapterList = JSONPath({
          path: "$.data[*]",
          json: res.data,
        });
        getChapters(backup, chapterList, mangaId);
        hasMoreResults = limit + offset < total;
      }
    }
    await sleep(500);
  }
}

async function paginatedChapterListRequest(
  mangaId: string,
  offset: number,
  lang: string
) {
  try {
    const res = await axios.get(
      `https://api.mangadex.org/manga/${mangaId.replaceAll(
        "/title/",
        ""
      )}/feed?limit=500&offset=${offset}&includes[]=user&includes[]=scanlation_group&order[volume]=desc&order[chapter]=desc&translatedLanguage[]=${lang}&includeFuturePublishAt=0&includeEmptyPages=0`
    );
    return res;
  } catch (err) {
    return null;
  }
}

function getChapters(backup: BackupData, chapterList: any, mangaId: number) {
  for (const chapter of chapterList) {
    let scan = "";
    let chapterName = "";
    const groupName = JSONPath({
      path: "$.relationships[*].attributes.name",
      json: chapter,
    });
    const uploaderName = JSONPath({
      path: "$.relationships[*].attributes.username",
      json: chapter,
    });
    if (groupName?.length > 0 && groupName[0]) {
      scan += groupName[0];
      if (uploaderName?.length > 0 && uploaderName[0]) {
        scan += ` Uploaded by ${uploaderName[0]}`;
      }
    } else {
      scan = "No Group";
    }
    const volume = JSONPath({ path: "$.attributes.volume", json: chapter });
    const chapterNum = JSONPath({
      path: "$.attributes.chapter",
      json: chapter,
    });
    const title = JSONPath({ path: "$.attributes.title", json: chapter });
    const publishDate = JSONPath({
      path: "$.attributes.publishAt",
      json: chapter,
    })[0];
    const chapterId = JSONPath({ path: "$.id", json: chapter })[0];
    if (volume?.length > 0 && volume[0] && volume[0] !== "null") {
      chapterName = `Vol.${volume[0]} `;
    }
    if (chapterNum?.length > 0 && chapterNum[0] && chapterNum[0] !== "null") {
      chapterName += `Ch.${chapterNum[0]} `;
    }
    if (title?.length > 0 && title[0] && title !== "null") {
      if (chapterName.length > 0) {
        chapterName += "- ";
      }
      chapterName += title[0];
    }
    if (chapterName.length === 0) {
      chapterName += "Oneshot";
    }

    const chapterUid = generateUid("MANGADEX", chapterId);
    const chapterIdx = chapterIndex++;
    chapterIds.set(chapterUid, chapterIdx);

    backup.chapters.push({
      id: chapterIdx,
      url: chapterId,
      dateUpload: String(Date.parse(publishDate)),
      isBookmarked: false,
      scanlator: scan,
      name: chapterName,
      isRead: false,
      lastPageRead: "1",
      mangaId: mangaId,
      archivePath: "",
    });
  }
}

function generateUid(source: string, url: string): number {
  var h = Long.fromNumber(1125899906842597);
  for (let i = 0; i < source.length; i++) {
    h = h.multiply(31).add(source.codePointAt(i) ?? 0);
  }
  for (let i = 0; i < url.length; i++) {
    h = h.multiply(31).add(url.codePointAt(i) ?? 0);
  }
  return h.toNumber();
}

function processHistories(
  backup: BackupData,
  histories: Histories,
  droppedMangas: number[]
) {
  for (var i = 0; i < histories.length; i++) {
    const history = histories[i];
    if (
      droppedMangas.includes(history.manga_id) ||
      !mangaIds.get(history.manga_id) ||
      !chapterIds.get(history.chapter_id)
    ) {
      continue;
    }
    backup.history.push({
      id: i + 1,
      isManga: true,
      mangaId: mangaIds.get(history.manga_id) ?? history.manga_id,
      chapterId: chapterIds.get(history.chapter_id) ?? history.chapter_id,
      date: String(history.updated_at),
    });
    const readChapter = backup.chapters.filter((chapter) => chapter.id === chapterIds.get(history.chapter_id));
    if (readChapter.length > 0) {
      readChapter[0].isRead = true;
    }
  }
}

function processSettings(backup: BackupData, settings: Settings) {
  backup.settings.push({
    id: 227,
    animatePageTransitions: true,
    animeDisplayType: 0,
    animeLibraryDownloadedChapters: false,
    animeLibraryLocalSource: null,
    animeLibraryShowCategoryTabs: false,
    animeLibraryShowContinueReadingButton: false,
    animeLibraryShowLanguage: false,
    animeLibraryShowNumbersOfItems: false,
    autoExtensionsUpdates: false,
    backgroundColor: 0,
    chapterFilterBookmarkedList: [],
    chapterFilterDownloadedList: [],
    chapterFilterUnreadList: [],
    chapterPageIndexList: [],
    chapterPageUrlsList: [],
    checkForExtensionUpdates: true,
    cookiesList: null,
    cropBorders: false,
    dateFormat: "M/d/y",
    defaultReaderMode: 2,
    displayType: 0,
    doubleTapAnimationSpeed: 1,
    downloadLocation: "",
    downloadOnlyOnWifi: false,
    filterScanlatorList: null,
    flexColorSchemeBlendLevel: 10,
    flexSchemeColorIndex: 51,
    incognitoMode: false,
    libraryDownloadedChapters: false,
    libraryFilterAnimeBookMarkedType: 0,
    libraryFilterAnimeDownloadType: 0,
    libraryFilterAnimeStartedType: 0,
    libraryFilterAnimeUnreadType: 0,
    libraryFilterMangasBookMarkedType: 0,
    libraryFilterMangasDownloadType: 0,
    libraryFilterMangasStartedType: 0,
    libraryFilterMangasUnreadType: 0,
    libraryLocalSource: null,
    libraryShowCategoryTabs: false,
    libraryShowContinueReadingButton: false,
    libraryShowLanguage: false,
    libraryShowNumbersOfItems: false,
    onlyIncludePinnedSources: false,
    pagePreloadAmount: Number(settings.pages_preload),
    personalReaderModeList: [],
    pureBlackDarkMode: settings.amoled_theme,
    relativeTimesTamps: 2,
    saveAsCBZArchive: false,
    scaleType: 0,
    showNSFW: true,
    showPagesNumber: true,
    sortChapterList: [],
    sortLibraryAnime: null,
    themeIsDark: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; 22081212UG Build/TKQ1.220829.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.131 Mobile Safari/537.36",
    backupFrequency: 0,
    backupFrequencyOptions: [0],
    syncOnAppLaunch: true,
    syncAfterReading: true,
    autoBackupLocation: "",
    startDatebackup: 0,
    usePageTapZones: false,
    markEpisodeAsSeenType: 85,
    defaultSkipIntroLength: 85,
    defaultDoubleTapToSkipLength: 10,
    defaultPlayBackSpeed: 1,
    updateProgressAfterReading: true,
    enableAniSkip: false,
    enableAutoSkip: null,
    aniSkipTimeoutLength: null,
    btServerAddress: "127.0.0.1",
    btServerPort: null,
    fullScreenReader: false,
    enableCustomColorFilter: false,
    colorFilterBlendMode: 0,
    mangaHomeDisplayType: 1,
    appFontFamily: null,
    mangaGridSize: null,
    animeGridSize: null,
    disableSectionType: 0,
    useLibass: true,
    playerSubtitleSettings: null,
  });
}

async function processSources(backup: BackupData, sources: Sources) {
  const sourceCode = await axios.get("https://raw.githubusercontent.com/kodjodevf/mangayomi-extensions/main/dart/manga/src/all/mangadex/mangadex.dart"); 
  backup.extensions.push({
    apiUrl: "https://api.mangadex.org",
    appMinVerReq: "0.2.0",
    baseUrl: "https://mangadex.org",
    dateFormat: "yyyy-MM-dd'T'HH:mm:ss+SSS",
    dateFormatLocale: "en_Us",
    hasCloudflare: false,
    headers: "{}",
    iconUrl:
      "https://raw.githubusercontent.com/kodjodevf/mangayomi-extensions/main/dart/manga/src/all/mangadex/icon.png",
    id: 810342358,
    isActive: true,
    isAdded: true,
    isFullData: false,
    isManga: true,
    isNsfw: true,
    isPinned: false,
    lang: "en",
    lastUsed: false,
    name: "MangaDex",
    sourceCode: String(sourceCode.data),
    sourceCodeUrl:
      "https://raw.githubusercontent.com/kodjodevf/mangayomi-extensions/main/dart/manga/src/all/mangadex/mangadex.dart",
    typeSource: "mangadex",
    version: "0.0.9",
    versionLast: "0.0.9",
    additionalParams: "",
    sourceCodeLanguage: 0,
    isObsolete: false,
    isLocal: false,
  });
}

function handleDigits(value: number): string {
  return value >= 10 ? String(value) : `0${value}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
