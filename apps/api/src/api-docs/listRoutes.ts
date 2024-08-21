import { Application } from "express";

import { ILogger } from "@zkchainhub/shared";

// Function to list all routes
export const listRoutes = (app: Application, logger: ILogger) => {
    const routes: string[] = [];

    const extractPathFromRegexp = (regexp: RegExp): string => {
        const match = regexp.source.match(/\\\/(.*?)\\\//g);
        if (!match) return "";
        return match.map((m) => m.replace(/\\\//g, "")).join("");
    };

    const processStack = (stack: any[], prefix = "") => {
        stack.forEach((middleware: any) => {
            if (middleware.route) {
                // Route middleware
                const methods = Object.keys(middleware.route.methods).map((method) =>
                    method.toUpperCase(),
                );
                routes.push(
                    `Mapped { ${methods.join(", ")} ${prefix}${middleware.route.path} } route`,
                );
            } else if (middleware.name === "router" && middleware.handle.stack) {
                // Router middleware (nested routes)
                const routerPath = prefix + extractPathFromRegexp(middleware.regexp);
                processStack(middleware.handle.stack, routerPath);
            }
        });
    };

    processStack(app._router.stack);

    routes.forEach((route) => logger.info(route));
};
