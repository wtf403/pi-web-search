import type { Api, Model } from "@earendil-works/pi-ai";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ProviderKind } from "./types.ts";

const DEFAULTS = {
    baseUrl: "https://admin.router.plus",
    apiKey: "",
    model: "pplx-web/pplx-auto",
};

function readFileConfig(): Partial<{ baseUrl: string; apiKey: string; model: string }> {
    const candidates = [
        process.env.WTF_SEARCH_CONFIG,
        join(getAgentDir(), "wtf-search.json"),
    ].filter(Boolean) as string[];
    for (const path of candidates) {
        try {
            const raw = readFileSync(path, "utf8");
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") return parsed;
        } catch {
            // missing / invalid — try next candidate
        }
    }
    return {};
}

export function getWtfConfig() {
    const file = readFileConfig();
    const baseUrl = (process.env.WTF_SEARCH_BASE_URL || file.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "");
    const apiKey = process.env.WTF_SEARCH_API_KEY || file.apiKey || DEFAULTS.apiKey;
    const model = process.env.WTF_SEARCH_MODEL || file.model || DEFAULTS.model;
    return { baseUrl, apiKey, model };
}

export function getProviderKind(_model?: Model<Api>): ProviderKind {
    return "wtf";
}

export function getConfig(_model?: Model<Api>) {
    return { kind: "wtf" as ProviderKind };
}
