/**
 * Represents the available sources for metadata.
 */
export type MetadataSource = "github" | "local" | "static";

export interface GithubMetadataConfig {
    source: "github";
    tokenUrl: string;
    chainUrl: string;
}

export interface LocalFileMetadataConfig {
    source: "local";
    tokenJsonPath: string;
    chainJsonPath: string;
}

export interface StaticMetadataConfig {
    source: "static";
}

export type MetadataConfig<Source extends MetadataSource> = Source extends "github"
    ? GithubMetadataConfig
    : Source extends "local"
    ? LocalFileMetadataConfig
    : Source extends "static"
    ? StaticMetadataConfig
    : never;
