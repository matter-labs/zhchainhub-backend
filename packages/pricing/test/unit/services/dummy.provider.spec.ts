import { describe, expect, it } from "vitest";

import { Address } from "@zkchainhub/shared";

import { DummyPricingProvider } from "../../../src/providers/dummy.provider.js";

describe("DummyPricingProvider", () => {
    it("return undefined for all token prices", async () => {
        const provider = new DummyPricingProvider();

        const addresses: Address[] = ["0x123456789", "0xabcdef123"];
        const expectedResponse = {
            "0x123456789": undefined,
            "0xabcdef123": undefined,
        };

        const response = await provider.getTokenPrices(addresses);

        expect(response).toEqual(expectedResponse);
    });

    it("return number for all token prices", async () => {
        const price = 1;
        const provider = new DummyPricingProvider(price);

        const addresses: Address[] = ["0x123456789", "0xabcdef123"];
        const expectedResponse = {
            "0x123456789": price,
            "0xabcdef123": price,
        };

        const response = await provider.getTokenPrices(addresses);

        expect(response).toEqual(expectedResponse);
    });
});
