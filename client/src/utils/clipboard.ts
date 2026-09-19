export const isClipboardSupported = (): boolean =>
    typeof navigator !== 'undefined' && typeof navigator.clipboard !== 'undefined';

export const copyText = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);;
        textarea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
};

export const copyRichText = async (html: string, text?: string): Promise<boolean> => {
    try {
        const blob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([text || html.replace(/<[^>]+>/g, '')], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob,
        });
        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch {
        return false;
    }
};

export const copyImage = async (imageUrl: string): Promise<boolean> => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);
        return true;
    } catch (e) {
        console.error("Error copying image", e);
        return false;
    }
};

export const copyJson = async (data: any): Promise<boolean> => {
    try {
        const json = JSON.stringify(data, null, 2);
        return copyText(json);
    } catch (e) {
        console.error("Error copying JSON", e);
        return false;
    }
};

export const readClipboard = async (): Promise<string> => {
    try {
        const text = await navigator.clipboard.readText();
        return text;
    } catch (e) {
        console.error("Error reading clipboard", e);
        return "";
    }
};