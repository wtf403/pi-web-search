import type { ExtensionContext, AgentToolUpdateCallback } from "@earendil-works/pi-coding-agent";
import { getWtfConfig } from "./config.ts";
import { deriveSources, normalizeCitedSources, sanitizeSearchResults, titleFromUrl } from "./results.ts";
import type { StreamResult } from "./types.ts";

function resolveChatUrl(baseUrl: string): string {
    const base = baseUrl.replace(/\/+$/, "");
    if (base.endsWith("/chat/completions")) return base;
    if (base.endsWith("/api/v1")) return `${base}/chat/completions`;
    return `${base}/api/v1/chat/completions`;
}

export async function callWtfSearch(
    _ctx: ExtensionContext,
    prompt: string,
    onUpdate?: AgentToolUpdateCallback,
    signal?: AbortSignal,
): Promise<StreamResult> {
    const { baseUrl, apiKey, model } = getWtfConfig();
    if (!apiKey) throw new Error("Missing WTF_SEARCH_API_KEY");

    onUpdate?.({
        content: [{ type: "text", text: `Searching for "${prompt.slice(0, 80)}"...` }],
        details: {},
    });

    const response = await fetch(resolveChatUrl(baseUrl), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            stream: false,
        }),
        signal,
    });

    if (!response.ok) throw new Error(`WTF search API error (${response.status}): ${await response.text()}`);

    const data: any = await response.json();
    const choice = data?.choices?.[0]?.message;
    const text: string = choice?.content || "No answer available.";

    // Collect citations if provider returns them (OpenAI-style annotations)
    const citations: Array<{ title: string; url: string }> = [];
    const annotations = choice?.annotations || [];
    for (const a of annotations) {
        const url = a?.url_citation?.url || a?.url;
        if (typeof url === "string") citations.push({ title: a?.title || titleFromUrl(url), url });
    }

    const citationDetails: Array<{ title: string; url: string; source: string; type: string }> = citations.map((c) => ({ ...c, source: "wtf.url_citation", type: "citation" as const }));
    const sanitized: any = sanitizeSearchResults(citationDetails as any);
    const sources: any = sanitized.length ? normalizeCitedSources(sanitized) : deriveSources([], []);

    return {
        text,
        sources,
        providerKind: "wtf",
        nativeSearchUsed: sanitized.length > 0,
        nativeSearchEvents: [],
        nativeSearchCalls: [],
        searchQueries: [prompt],
        searchResults: sanitized,
        citations: sanitized,
    };
}
