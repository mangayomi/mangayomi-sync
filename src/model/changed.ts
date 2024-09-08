export interface ChangedItems {
    deletedMangas: DeletedManga[]
    updatedChapters: UpdatedChapter[]
    deletedCategories: DeletedCategory[]
}

export interface DeletedManga {
    mangaId: number
}

export interface UpdatedChapter {
    chapterId: number
    mangaId: number
    isBookmarked: boolean
    isRead: boolean
    lastPageRead: string
    deleted: boolean
}

export interface DeletedCategory {
    categoryId: number
}
