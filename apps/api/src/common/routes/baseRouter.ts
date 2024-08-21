import { Router } from "express";

export abstract class BaseRouter {
    public router: Router;

    constructor(public readonly prefix: string = "") {
        this.router = Router();
        this.initializeRoutes();
    }

    protected abstract initializeRoutes(): void;
}
