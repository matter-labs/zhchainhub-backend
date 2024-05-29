import type { AxiosInstance, CreateAxiosDefaults } from "axios";
import axios from "axios";

export default class CoingeckoService {
    private instance: AxiosInstance;

    constructor(
        private url: string,
        private apiKey: string,
    ) {
        const config: CreateAxiosDefaults = {
            baseURL: url,
            headers: {
                "x-cg-demo-api-key": this.apiKey,
            },
        };

        this.instance = axios.create(config);
    }

    get(): AxiosInstance {
        if (!this.instance) {
            throw new Error("Client not initialized");
        }
        return this.instance;
    }
}
