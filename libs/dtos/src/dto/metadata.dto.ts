/**
 * RPC class representing the RPC information.
 */
export class RPC {
    /**
     * The URL of the RPC.
     * @type {string}
     * @memberof RPC
     */
    url: string;

    /**
     * The status of the RPC (optional).
     * @type {boolean}
     * @memberof RPC
     */
    status?: boolean;

    constructor(data: RPC) {
        this.url = data.url;
        this.status = data.status;
    }
}

/**
 * Metadata class representing the metadata information.
 */
export class Metadata {
    /**
     * The URL of the chain's icon (optional).
     * @type {string}
     * @memberof Metadata
     */
    iconUrl?: string;

    /**
     * The name of the chain.
     * @type {string}
     * @memberof Metadata
     */
    chainName: string;

    /**
     * An array of public RPCs.
     * @type {RPC[]}
     * @memberof Metadata
     */
    publicRpcs: RPC[];

    /**
     * The URL of the chain's explorer.
     * @type {string}
     * @memberof Metadata
     */
    explorerUrl: string;

    /**
     * The launch date of the chain (timestamp).
     * @type {number}
     * @memberof Metadata
     */
    launchDate: number;

    /**
     * The environment of the chain (e.g., mainnet, testnet).
     * @type {string}
     * @memberof Metadata
     */
    environment: string;

    /**
     * The native token of the chain.
     * @type {string}
     * @memberof Metadata
     */
    nativeToken: string;

    constructor(data: Metadata) {
        this.iconUrl = data.iconUrl;
        this.chainName = data.chainName;
        this.publicRpcs = data.publicRpcs;
        this.explorerUrl = data.explorerUrl;
        this.launchDate = data.launchDate;
        this.environment = data.environment;
        this.nativeToken = data.nativeToken;
    }
}
