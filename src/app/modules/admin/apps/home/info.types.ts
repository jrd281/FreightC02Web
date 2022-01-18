export interface Info
{
    etlstats: IngestionSummary[];
}

export interface IngestionSummary
{
    sourceProductName: string;
    sourceName: string;
    sourceVersion: string;
    sourceInfoArea: string;
    processTime: number;
    processDateTime: number;
    rowcount: number;
    new: number;
    updated: number;
    deleted: number;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function createDefaultInfo(): Info {
    const object = {
        'etlstats': []
    } as Info;

    return object;
}
