import type { ExtensionContext, AgentToolResult } from "@earendil-works/pi-coding-agent";
import { getWtfConfig } from "./providers/config.ts";

export async function getWebSearchModel(_ctx: ExtensionContext) {
    // Dummy model object — real config comes from WTF_SEARCH_* env vars.
    const { model } = getWtfConfig();
    return { id: model, provider: "wtf", api: "openai-chat" } as any;
}

export async function getModel(ctx: ExtensionContext) {
    return getWebSearchModel(ctx);
}

export function missingWebSearchConfigResult(_ctx: ExtensionContext): AgentToolResult<any> {
    return {
        content: [{ type: "text", text: "Failed: Missing WTF_SEARCH_API_KEY. Set WTF_SEARCH_BASE_URL, WTF_SEARCH_API_KEY, WTF_SEARCH_MODEL." }],
        details: { error: "missing_config" },
    };
}

export function missingConfigResult(ctx: ExtensionContext): AgentToolResult<any> {
    return missingWebSearchConfigResult(ctx);
}

export function errorResult(e: Error): AgentToolResult<any> {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], details: { error: true } };
}
