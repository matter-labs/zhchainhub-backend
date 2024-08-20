// import { INestApplication } from "@nestjs/common";
// import { Test, TestingModule } from "@nestjs/testing";

// import request from "supertest";

// import { ApiModule } from "../../src/api.module";

describe("MetricsController (e2e)", () => {
    // let app: INestApplication;
    // beforeEach(async () => {
    //     const moduleFixture: TestingModule = await Test.createTestingModule({
    //         imports: [ApiModule],
    //     }).compile();
    //     app = moduleFixture.createNestApplication();
    //     await app.init();
    // });
    // afterEach(async () => {
    //     await app.close();
    // });
    describe("/ecosystem (GET)", () => {
        it("/ecosystem (GET)", () => {
            // return request(app.getHttpServer())
            //     .get("/metrics/ecosystem")
            //     .expect(200)
            //     .expect(({ body }) => {
            //         expect(body.l1Tvl).toBeDefined();
            //         expect(body.ethGasInfo).toBeDefined();
            //         expect(body.zkChains).toBeDefined();
            //         expect(body.zkChains.length).toBeGreaterThan(0);
            //     });
        });
    });
    // describe("/chain/:chainId (GET)", () => {
    //     it("correct request for RPC + METADATA", () => {
    //         return request(app.getHttpServer())
    //             .get("/metrics/zkchain/0")
    //             .expect(200)
    //             .expect(({ body }) => {
    //                 expect(body.chainType).toBeDefined();
    //                 expect(body.tvl).toBeDefined();
    //                 expect(body.batchesInfo).toBeDefined();
    //                 expect(body.feeParams).toBeDefined();
    //                 expect(body.metadata).toBeDefined();
    //                 expect(body.l2ChainInfo).toBeDefined();
    //             });
    //     });
    //     it("correct request for METADATA", () => {
    //         return request(app.getHttpServer())
    //             .get("/metrics/zkchain/1")
    //             .expect(200)
    //             .expect(({ body }) => {
    //                 expect(body.chainType).toBeDefined();
    //                 expect(body.tvl).toBeDefined();
    //                 expect(body.batchesInfo).toBeDefined();
    //                 expect(body.feeParams).toBeDefined();
    //                 expect(body.metadata).toBeDefined();
    //                 expect(body.l2ChainInfo).toBeUndefined();
    //             });
    //     });
    //     it("correct request for RPC", () => {
    //         return request(app.getHttpServer())
    //             .get("/metrics/zkchain/2")
    //             .expect(200)
    //             .expect(({ body }) => {
    //                 expect(body.chainType).toBeDefined();
    //                 expect(body.tvl).toBeDefined();
    //                 expect(body.batchesInfo).toBeDefined();
    //                 expect(body.feeParams).toBeDefined();
    //                 expect(body.metadata).toBeUndefined();
    //                 expect(body.l2ChainInfo).toBeDefined();
    //             });
    //     });
    //     it("correct request for NO RPC + METADATA", () => {
    //         return request(app.getHttpServer())
    //             .get("/metrics/zkchain/3")
    //             .expect(200)
    //             .expect(({ body }) => {
    //                 expect(body.chainType).toBeDefined();
    //                 expect(body.tvl).toBeDefined();
    //                 expect(body.batchesInfo).toBeDefined();
    //                 expect(body.feeParams).toBeDefined();
    //                 expect(body.metadata).toBeUndefined();
    //                 expect(body.l2ChainInfo).toBeUndefined();
    //             });
    //     });
    //     it("invalid negative number for chain id", () => {
    //         return request(app.getHttpServer())
    //             .get("/metrics/zkchain/-1")
    //             .expect(400)
    //             .expect(({ body }) => {
    //                 expect(body.message).toEqual(
    //                     "Validation failed: Parameter chainId must be a positive integer",
    //                 );
    //             });
    //     });
    //     it("not a number for chain id", () => {
    //         return request(app.getHttpServer())
    //             .get("/metrics/zkchain/notanumber")
    //             .expect(400)
    //             .expect(({ body }) => {
    //                 expect(body.message).toEqual(
    //                     "Validation failed: Parameter chainId must be a positive integer",
    //                 );
    //             });
    //     });
    // });
});
