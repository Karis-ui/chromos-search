export type UUID = string;
export type Timestamp = string;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
export type ID = string | number;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type KeysOf<T> = keyof T;

export type Values<T> = T[keyof T];

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
> &
    {
        [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
> &
    {
        [K in Keys]-?: Required<Pick<T, K>> &
        Partial<Record<Exclude<Keys, K>, undefined>>;
    }[Keys];

export type Merge<T, U> = Omit<T, keyof U> & U;

export type Diff<T, U> = Omit<T, keyof U>;

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type Callback<T = void> = () => T;
export type EventHandler<T = any> = (event: T) => void;
export type AsyncCallback<T = void> = () => Promise<T>;
export type Predicate<T> = (value: T) => boolean;
export type Comparator<T> = (a: T, b: T) => number;
export type Transformer<T, U> = (value: T) => U;
export type AsyncTransformer<T, U> = (value: T) => Promise<U>;
export type VoidFunction = () => void;

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: Pagination;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}

export type SortOrder = 'asc' | 'desc';

export interface SortConfig<T = string> {
    field: T;
    order: SortOrder;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error' | 'refreshing';

export interface AsyncState<T = any, E = Error> {
    status: AsyncStatus;
    data: T | null;
    error: E | null;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    isIdle: boolean;
}

export type Result<T, E = Error> =
    | { success: true; data: T; error?: never }
    | { success: false; data?: never; error: E };

export interface Option<T = string> {
    label: string;
    value: T;
    disabled?: boolean;
}

export interface SelectOption<T = string> extends Option<T> {
    icon?: string;
    description?: string;
    group?: string;
}

export interface FileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    extension: string;
    isImage: boolean;
    isVideo: boolean;
    isAudio: boolean;
    isDocument: boolean;
}

export interface ImageDimensions {
    width: number;
    height: number;
    aspectRatio: number;
}

export interface VideoMetadata {
    duration: number;
    width: number;
    height: number;
    fps: number;
    codec: string;
    bitrate: number;
}

export interface AudioMetadata {
    duration: number;
    sampleRate: number;
    channels: number;
    bitrate: number;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Address {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    formatted: string;
}

export interface GeoLocation {
    coordinates: Coordinates;
    address?: Address;
    placeName?: string;
    accuracy?: number;
}

export interface Range<T = number> {
    min: T;
    max: T;
}

export interface TimeRange extends Range<Timestamp> { }

export interface NumericRange extends Range<number> {
    step?: number;
}

export interface Metric {
    id: string;
    label: string;
    value: number;
    unit?: string;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    trend?: number[];
}

export interface Dimension {
    id: string;
    label: string;
    values: string[];
}

export interface ChartDataPoint {
    x: string | number | Date;
    y: number;
    label?: string;
    color?: string;
    metadata?: Record<string, any>;
}

export interface ChartSeries {
    name: string;
    data: ChartDataPoint[];
    color?: string;
    type?: 'line' | 'bar' | 'area' | 'scatter';
}

export type Theme = 'light' | 'dark' | 'auto' | 'cyberpunk' | 'matrix';
export type ThemeMode = 'light' | 'dark';

export interface Viewport {
    width: number;
    height: number;
    dpr: number;
    orientation: 'portrait' | 'landscape';
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface KeyValue<K = string, V = any> {
    key: K;
    value: V;
}

export interface LabeledValue<T = string> {
    label: string;
    value: T;
}

export interface Metadata {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    createdBy?: UUID;
    updatedBy?: UUID;
    version?: string;
    tags?: string[];
}

export interface Audit {
    id: UUID;
    action: string;
    userId: UUID;
    timestamp: Timestamp;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}