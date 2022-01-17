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
    rowcount: number;
    new: number;
    updated: number;
    deleted: number;
}
