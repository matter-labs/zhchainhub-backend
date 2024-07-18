import { Injectable } from "@nestjs/common";

/**
 * EvmProviderService provides methods to interact with an EVM-based blockchain.
 */
@Injectable()
export class EvmProviderService {
    /**
     * Retrieves the total value locked (TVL) from the EVM-based blockchain.
     * @returns {Promise<number>} The TVL value.
     */
    async getTvl() {
        return 1;
    }
}
