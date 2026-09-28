import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { webSearch, WebSearchSchema } from "./web_search.ts";

const WEB_SEARCH_TOOL = "web_search";

export default function (pi: ExtensionAPI) {
    pi.registerTool({
        name: WEB_SEARCH_TOOL,
        label: "Web Search",
        description: "Search the web via OpenAI-compatible chat completions (WTF_SEARCH_BASE_URL / WTF_SEARCH_API_KEY / WTF_SEARCH_MODEL).",
        parameters: WebSearchSchema,
        execute: (id, params, signal = new AbortController().signal, onUpdate, ctx) =>
            webSearch(id, params, signal, onUpdate, ctx, pi.getThinkingLevel()),
        renderCall(args, theme) {
            const query = args.query || "…";
            const urlCount = args.urls?.length ?? 0;
            const urls = urlCount > 0 ? theme.fg("muted", ` + ${urlCount} URL${urlCount === 1 ? "" : "s"}`) : "";
            return new Text(
                `${theme.fg("toolTitle", theme.bold("web_search"))} ${theme.fg("accent", query)}${urls}`,
                0,
                0,
            );
        },
        renderResult(result, { expanded }, theme) {
            const output = result.content
                .filter((part: any) => part.type === "text")
                .map((part: any) => part.text)
                .join("\n");

            const isError = Boolean((result.details as any)?.error);
            if (!expanded && !isError) return new Text("", 0, 0);

            return new Text(theme.fg(isError ? "error" : "toolOutput", output), 0, 0);
        }
    });
}
