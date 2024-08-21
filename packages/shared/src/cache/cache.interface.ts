export type Milliseconds = number;

export type Store = {
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, data: T, ttl?: Milliseconds): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    mset(arguments_: Array<[string, unknown]>, ttl?: Milliseconds): Promise<void>;
    mget(...arguments_: string[]): Promise<unknown[]>;
    mdel(...arguments_: string[]): Promise<void>;
    keys(pattern?: string): Promise<string[]>;
    ttl(key: string): Promise<number>;
};

export type Cache<S extends Store = Store> = {
    store: S;
    set: (key: string, value: unknown, ttl?: Milliseconds) => Promise<void>;
    get: <T>(key: string) => Promise<T | undefined>;
    del: (key: string) => Promise<void>;
    reset: () => Promise<void>;
};
