import type { ExtensionContext, AgentToolUpdateCallback } from "@earendil-works/pi-coding-agent";
import type { ModelThinkingLevel } from "@earendil-works/pi-ai";
import { Type, type Static } from "typebox";
import { callApiStream } from "./api.ts";
import { formatWebSearchResult } from "./format.ts";
import { getWebSearchModel, missingWebSearchConfigResult, errorResult } from "./utils.ts";

export const WebSearchSchema = Type.Object({
    query: Type.String({ description: "The search query or question to answer" }),
    urls: Type.Optional(Type.Array(Type.String(), {
        description: "Additional URLs to analyze along with search (up to 20)",
        maxItems: 20
    })),
});
export type WebSearchInput = Static<typeof WebSearchSchema>;

export async function webSearch(
    id: string,
    params: WebSearchInput,
    signal: AbortSignal,
    onUpdate: AgentToolUpdateCallback | undefined,
    ctx: ExtensionContext,
    thinkingLevel?: ModelThinkingLevel
) {
    const model = await getWebSearchModel(ctx);
    if (!model) return missingWebSearchConfigResult(ctx);

    const hasUrls = params.urls && params.urls.length > 0;
    const prompt = hasUrls
        ? `${params.query}\n\nAlso analyze these URLs:\n${params.urls!.join("\n")}`
        : params.query;

    try {
        const result = await callApiStream(ctx, model, {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        }, onUpdate, signal, thinkingLevel, params.urls);

        return formatWebSearchResult(result, { modelId: model.id });
    } catch (e: any) {
        return errorResult(e);
    }
}
