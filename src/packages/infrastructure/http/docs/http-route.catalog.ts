import type { HttpRoute } from "./http-route.doc";

export interface HttpRouteCatalog {
    routes(): HttpRoute[];
}
