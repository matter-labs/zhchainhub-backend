export const tokenBalancesAbi = [
    {
        inputs: [
            { internalType: "address", name: "_targetAddress", type: "address" },
            {
                internalType: "address[]",
                name: "_tokenAddresses",
                type: "address[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
] as const;
