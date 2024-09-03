export function mergeProgress(oldData: any, data: any): string {
    const oldVersion = oldData.version;
    const newVersion = data.version;
    if (oldVersion === '1' && newVersion === '1') {
        return mergeProgressV1(oldData, data);
    }
    return "";
};

function mergeProgressV1(oldData: any, data: any): string {
    oldData.manga = oldData.manga.map((manga: any) => {
        // check for any timestamps and replace with newer one
    });
    oldData.chapters = oldData.chapters.map((chapter: any) => {
        // check for any timestamps and replace with newer one
    });
    oldData.history = oldData.history.map((historyItem: any) => {
        // check for any timestamps and replace with newer one
    });
    return JSON.stringify(oldData);
}
