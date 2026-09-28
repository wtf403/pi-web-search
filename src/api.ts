import type { ExtensionContext, AgentToolUpdateCallback } from "@earendil-works/pi-coding-agent";
import { getProviderKind } from "./providers/config.ts";
import { callWtfSearch } from "./providers/wtf.ts";
import type { StreamResult } from "./providers/types.ts";

export { getProviderKind, getConfig } from "./providers/config.ts";
export type { Source, SearchResultDetail, NativeSearchCallDetail, StreamResult } from "./providers/types.ts";

export async function callApiStream(
    ctx: ExtensionContext,
    _model: any,
    body: any,
    onUpdate?: AgentToolUpdateCallback,
    signal?: AbortSignal,
    _thinkingLevel?: any,
    _urls?: string[]
): Promise<StreamResult> {
    const prompt: string = body?.contents?.[0]?.parts?.[0]?.text || body?.prompt || "";
    if (!prompt) throw new Error("No prompt text found in request body");
    return callWtfSearch(ctx, prompt, onUpdate, signal);
}
