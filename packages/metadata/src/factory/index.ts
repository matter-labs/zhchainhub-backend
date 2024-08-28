import { Cache, ILogger } from "@zkchainhub/shared";

import {
    GithubMetadataProvider,
    IMetadataProvider,
    LocalFileMetadataProvider,
    MetadataConfig,
    MetadataSource,
    StaticMetadataProvider,
} from "../internal.js";

export class MetadataProviderFactory {
    static create(
        metadata: MetadataConfig<MetadataSource>,
        deps?: {
            logger?: ILogger;
            cache?: Cache;
        },
    ): IMetadataProvider {
        let metadataProvider: IMetadataProvider;

        switch (metadata.source) {
            case "github":
                if (!deps?.cache || !deps?.logger) {
                    throw new Error("Missing dependencies");
                }
                metadataProvider = new GithubMetadataProvider(
                    metadata.tokenUrl,
                    metadata.chainUrl,
                    deps.logger,
                    deps.cache,
                );
                break;
            case "local":
                if (!deps?.logger) {
                    throw new Error("Missing dependencies");
                }
                metadataProvider = new LocalFileMetadataProvider(
                    metadata.tokenJsonPath,
                    metadata.chainJsonPath,
                    deps.logger,
                );
                break;
            case "static":
                metadataProvider = new StaticMetadataProvider();
                break;
            default:
                throw new Error("Invalid metadata source");
        }

        return metadataProvider;
    }
}
