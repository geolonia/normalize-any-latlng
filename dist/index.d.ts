export declare type NormalizationResult = {
    lat: number | null;
    lng: number | null;
    format?: string;
};
export declare type Normalize = (latlngStr: string) => NormalizationResult[];
export declare const normalize: Normalize;
