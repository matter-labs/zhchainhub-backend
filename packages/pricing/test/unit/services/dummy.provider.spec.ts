import { beforeEach, describe, expect, it } from "vitest";

import { Address } from "@zkchainhub/shared";

import { DummyPricingProvider } from "../../../src/providers/dummy.provider.js";

describe("DummyPricingProvider", () => {
    let provider: DummyPricingProvider;

    beforeEach(() => {
        provider = new DummyPricingProvider();
    });

    it("return 1 for all token prices", async () => {
        const addresses: Address[] = ["0x123456789", "0xabcdef123"];
        const expectedResponse = {
            "0x123456789": 1,
            "0xabcdef123": 1,
        };

        const response = await provider.getTokenPrices(addresses);

        expect(response).toEqual(expectedResponse);
    });
});
