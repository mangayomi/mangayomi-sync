export interface Root {
    backupData: BackupData
}
export interface BackupData {
    version: string
    manga: Manga[]
    categories: Category[]
    chapters: Chapter[]
    downloads: Download[]
    tracks: Track[]
    trackPreferences: TrackPreference[]
    history: History[]
    updates: Update[]
    settings: Setting[]
    extensions_preferences: ExtensionsPreference[]
    extensions: Extension[]
}

export interface Manga {
    author: string
    artist: string
    categories?: number[]
    customCoverImage: any
    dateAdded: number
    description: string
    favorite: boolean
    genre: string[]
    id: number
    imageUrl: string
    isLocalArchive: boolean
    itemType: number
    lang: string
    lastRead: number
    lastUpdate: number
    link: string
    name: string
    source: string
    status: number
    customCoverFromTracker: any
}

export interface Category {
    id: number
    name: string
    forItemType: number
}

export interface Chapter {
    archivePath: string
    dateUpload: string
    id: number
    isBookmarked: boolean
    isRead: boolean
    lastPageRead: string
    mangaId: number
    name: string
    scanlator?: string
    url: string
}

export interface Download {
    chapterId: number
    failed: number
    id: number
    isDownload: boolean
    isStartDownload: boolean
    mangaId: number
    succeeded: number
    taskIds: string[]
    total: number
}

export interface Track {
    finishedReadingDate?: number
    id: number
    lastChapterRead: number
    libraryId: any
    mangaId: number
    mediaId: number
    score: number
    startedReadingDate?: number
    status: number
    syncId: number
    title: string
    totalChapter: number
    trackingUrl: string
    isManga: boolean
}

export interface TrackPreference {
    syncId: number
    username: string
    oAuth: string
    prefs: any
}

export interface History {
    chapterId: number
    date: string
    id: number
    itemType: number
    mangaId: number
}

export interface Update {
    id: number
    mangaId: number
    chapterName: string
    date: string
}

export interface Setting {
    animatePageTransitions: boolean
    animeDisplayType: number
    animeLibraryDownloadedChapters: boolean
    animeLibraryLocalSource: any
    animeLibraryShowCategoryTabs: boolean
    animeLibraryShowContinueReadingButton: boolean
    animeLibraryShowLanguage: boolean
    animeLibraryShowNumbersOfItems: boolean
    autoExtensionsUpdates: boolean
    backgroundColor: number
    chapterFilterBookmarkedList: ChapterFilterBookmarkedList[]
    chapterFilterDownloadedList: ChapterFilterDownloadedList[]
    chapterFilterUnreadList: ChapterFilterUnreadList[]
    chapterPageIndexList: ChapterPageIndexList[]
    chapterPageUrlsList: ChapterPageUrlsList[]
    checkForExtensionUpdates: boolean
    cookiesList: CookiesList[]
    cropBorders: boolean
    dateFormat: string
    defaultReaderMode: number
    displayType: number
    doubleTapAnimationSpeed: number
    downloadLocation: string
    downloadOnlyOnWifi: boolean
    filterScanlatorList: FilterScanlatorList[]
    flexColorSchemeBlendLevel: number
    flexSchemeColorIndex: number
    id: number
    incognitoMode: boolean
    libraryDownloadedChapters: boolean
    libraryFilterAnimeBookMarkedType: number
    libraryFilterAnimeDownloadType: number
    libraryFilterAnimeStartedType: number
    libraryFilterAnimeUnreadType: number
    libraryFilterMangasBookMarkedType: number
    libraryFilterMangasDownloadType: number
    libraryFilterMangasStartedType: number
    libraryFilterMangasUnreadType: number
    libraryLocalSource: any
    libraryShowCategoryTabs: boolean
    libraryShowContinueReadingButton: boolean
    libraryShowLanguage: boolean
    libraryShowNumbersOfItems: boolean
    locale: any
    onlyIncludePinnedSources: boolean
    pagePreloadAmount: number
    personalPageModeList: PersonalPageModeList[]
    personalReaderModeList: PersonalReaderModeList[]
    pureBlackDarkMode: boolean
    relativeTimesTamps: number
    saveAsCBZArchive: boolean
    scaleType: number
    showPagesNumber: boolean
    sortChapterList: SortChapterList[]
    autoScrollPages: any
    sortLibraryAnime: any
    sortLibraryManga: any
    themeIsDark: boolean
    userAgent: string
    backupFrequency: any
    backupListOptions: number[]
    autoBackupLocation: any
    startDatebackup: any
    usePageTapZones: boolean
    markEpisodeAsSeenType: number
    defaultSkipIntroLength: number
    defaultDoubleTapToSkipLength: number
    defaultPlayBackSpeed: number
    fullScreenPlayer: any
    updateProgressAfterReading: boolean
    enableAniSkip: any
    enableAutoSkip: any
    aniSkipTimeoutLength: any
    btServerAddress: string
    btServerPort: any
    fullScreenReader: any
    customColorFilter: CustomColorFilter
    enableCustomColorFilter: boolean
    colorFilterBlendMode: number
    playerSubtitleSettings: PlayerSubtitleSettings
    mangaHomeDisplayType: number
    appFontFamily: any
    mangaGridSize: any
    animeGridSize: any
    disableSectionType: number
    useLibass: boolean
    libraryFilterNovelBookMarkedType: any
    libraryFilterNovelDownloadType: any
    libraryFilterNovelStartedType: any
    libraryFilterNovelUnreadType: any
    novelLibraryShowCategoryTabs: any
    novelLibraryDownloadedChapters: any
    novelLibraryShowLanguage: any
    novelLibraryShowNumbersOfItems: any
    novelLibraryShowContinueReadingButton: any
    novelLibraryLocalSource: any
    sortLibraryNovel: any
    novelDisplayType: number
    novelFontSize: number
    novelTextAlign: number
    navigationOrder: string[]
    hideItems: string[]
    clearChapterCacheOnAppLaunch: any
    mangaExtensionsRepo: MangaExtensionsRepo[]
    animeExtensionsRepo: AnimeExtensionsRepo[]
    novelExtensionsRepo: NovelExtensionsRepo[]
}

export interface ChapterFilterBookmarkedList {
    mangaId: number
    type: number
}

export interface ChapterFilterDownloadedList {
    mangaId: number
    type: number
}

export interface ChapterFilterUnreadList {
    mangaId: number
    type: number
}

export interface ChapterPageIndexList {
    chapterId: number
    index: number
}

export interface ChapterPageUrlsList {
    chapterId: number
    urls: any
    headers: any
}

export interface CookiesList {
    host: string
    cookie: string
}

export interface FilterScanlatorList {
    mangaId: number
    scanlators: string[]
}

export interface PersonalPageModeList {
    mangaId: number
    pageMode: number
}

export interface PersonalReaderModeList {
    mangaId: number
    readerMode: number
}

export interface SortChapterList {
    index: number
    mangaId: number
    reverse: boolean
}

export interface CustomColorFilter {
    a: number
    r: number
    g: number
    b: number
}

export interface PlayerSubtitleSettings {
    fontSize: number
    useBold: boolean
    useItalic: boolean
    textColorA: number
    textColorR: number
    textColorG: number
    textColorB: number
    borderColorA: number
    borderColorR: number
    borderColorG: number
    borderColorB: number
    backgroundColorA: number
    backgroundColorR: number
    backgroundColorG: number
    backgroundColorB: number
}

export interface MangaExtensionsRepo {
    name: string
    website: string
    jsonUrl: string
}

export interface AnimeExtensionsRepo {
    name: string
    website: string
    jsonUrl: string
}

export interface NovelExtensionsRepo {
    name: string
    website: string
    jsonUrl: string
}

export interface ExtensionsPreference {
    id: number
    sourceId: number
    key: string
    listPreference?: ListPreference
    multiSelectListPreference?: MultiSelectListPreference
    editTextPreference?: EditTextPreference
}

export interface ListPreference {
    title: string
    summary: string
    valueIndex: number
    entries: string[]
    entryValues: string[]
}

export interface MultiSelectListPreference {
    title: string
    summary: string
    entries: string[]
    entryValues: string[]
    values: string[]
}

export interface EditTextPreference {
    title: string
    summary: string
    value: string
    dialogTitle: string
    dialogMessage: string
    text: string
}

export interface Extension {
    apiUrl: string
    appMinVerReq: string
    baseUrl: string
    dateFormat: string
    dateFormatLocale: string
    hasCloudflare: boolean
    headers: string
    iconUrl: string
    id: number
    isActive: boolean
    isAdded: boolean
    isFullData: boolean
    isManga?: boolean
    itemType: number
    isNsfw: boolean
    isPinned: boolean
    lang: string
    lastUsed: boolean
    name: string
    sourceCode?: string
    sourceCodeUrl: string
    typeSource: string
    version: string
    versionLast: string
    additionalParams: string
    sourceCodeLanguage: number
    isObsolete: boolean
    isLocal: boolean
    repo: any
}
