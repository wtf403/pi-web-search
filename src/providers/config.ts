import type { Api, Model } from "@earendil-works/pi-ai";
import type { ProviderKind } from "./types.ts";

export function getWtfConfig() {
    const baseUrl = (process.env.WTF_SEARCH_BASE_URL || "https://admin.router.plus").replace(/\/+$/, "");
    const apiKey = process.env.WTF_SEARCH_API_KEY || "";
    const model = process.env.WTF_SEARCH_MODEL || "pplx-web/pplx-auto";
    return { baseUrl, apiKey, model };
}

export function getProviderKind(_model?: Model<Api>): ProviderKind {
    return "wtf";
}

export function getConfig(_model?: Model<Api>) {
    return { kind: "wtf" as ProviderKind };
}
