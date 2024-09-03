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
    settings: Setting[]
    extensions: Extension[]
    extensions_preferences: ExtensionsPreference[]
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
    isManga: boolean
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
    forManga: boolean
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
    scanlator: string
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
    isManga: boolean
    mangaId: number
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
    cookiesList: any
    cropBorders: boolean
    dateFormat: string
    defaultReaderMode: number
    displayType: number
    doubleTapAnimationSpeed: number
    downloadLocation: string
    downloadOnlyOnWifi: boolean
    filterScanlatorList: any
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
    onlyIncludePinnedSources: boolean
    pagePreloadAmount: number
    personalReaderModeList: PersonalReaderModeList[]
    pureBlackDarkMode: boolean
    relativeTimesTamps: number
    saveAsCBZArchive: boolean
    scaleType: number
    showNSFW: boolean
    showPagesNumber: boolean
    sortChapterList: SortChapterList[]
    sortLibraryAnime: any
    themeIsDark: boolean
    userAgent: string
    backupFrequency: number
    backupFrequencyOptions: number[]
    syncOnAppLaunch: boolean
    syncAfterReading: boolean
    autoBackupLocation: string
    startDatebackup: number
    usePageTapZones: boolean
    markEpisodeAsSeenType: number
    defaultSkipIntroLength: number
    defaultDoubleTapToSkipLength: number
    defaultPlayBackSpeed: number
    updateProgressAfterReading: boolean
    enableAniSkip: any
    enableAutoSkip: any
    aniSkipTimeoutLength: any
    btServerAddress: string
    btServerPort: any
    fullScreenReader: boolean
    enableCustomColorFilter: boolean
    colorFilterBlendMode: number
    playerSubtitleSettings: PlayerSubtitleSettings
    mangaHomeDisplayType: number
    appFontFamily: any
    mangaGridSize: any
    animeGridSize: any
    disableSectionType: number
    useLibass: boolean
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
    urls: string[]
    headers: any
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
    isManga: boolean
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
