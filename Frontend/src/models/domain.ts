export interface MetadataValue {
    id: number;
    itemId: string;
    field: string;
    value: string;
    language?: string;
}

export interface Bitstream {
    id: string;
    itemId: string;
    name: string;
    mimeType?: string;
    sizeBytes: number;
    localFilePath: string;
}

export interface Item {
    id: string;
    name: string;
    collectionId: string;
    metadata: MetadataValue[];
    bitstreams: Bitstream[];
}
