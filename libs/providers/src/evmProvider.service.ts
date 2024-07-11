import { Injectable } from "@nestjs/common";

@Injectable()
export class EvmProviderService {
    async getTvl() {
        return 1;
    }
}
