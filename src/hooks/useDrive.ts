export const extractDriveFileId = (url: string): string | null => {
    if (!url) return null;

    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];

    const docsMatch = url.match(/\/(document|spreadsheets|presentation|forms)\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch) return docsMatch[2];

    const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch) return openMatch[1];

    const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) return ucMatch[1];

    return null;
};

export const isDriveUrl = (url: string): boolean => {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
};

export function useDrive() {
    // In v2, we might not have the Firebase Gmail token easily accessible yet,
    // so we'll just provide the identification logic for now.
    return {
        extractDriveFileId,
        isDriveUrl
    };
}
