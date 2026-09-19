export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const downloadJson = (data: any, filename: string): void => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });
    downloadBlob(blob, `${filename}.json`);
};

export const downloadCsv = (data: any[], filename: string): void => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
        headers
            .map((header) => {
                const value = row[header];
                const stringValue = value == null ? '' : String(value);
                return `"${stringValue.replace(/"/g, '""')}"`;
            })
            .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
};

export const downloadText = (text: string, filename: string, mimeType = 'text/plain'): void => {
    const blob = new Blob([text], { type: mimeType });
    downloadBlob(blob, filename);
};

export const downloadImage = async (url: string, filename: string): Promise<void> => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        downloadBlob(blob, filename);
    } catch {
        window.open(url, '_blank');
    }
};

export const downloadFromUrl = (url: string, filename?: string): void => {
    const link = document.createElement('a');
    link.href = url;
    if (filename) link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToFile = (data: any, format: 'json' | 'csv', filename: string): void => {
    if (format === 'json') {
        downloadJson(data, filename);
    } else if (format === 'csv') {
        downloadCsv(Array.isArray(data) ? data : [data], filename);
    }
};

export const exportResults = (results: any[], filename: string): void => {
    const timestamp = new Date().toISOString().split('T')[0];
    downloadJson(
        {
            exportedAt: new Date().toISOString(),
            totalResults: results.length,
            results,
        },
        `${filename}_${timestamp}`
    );
};