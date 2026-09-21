type WebMCPTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute: (input: unknown) => unknown | Promise<unknown>;
};

type ModelContext = {
  registerTool: (tool: WebMCPTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

export function getModelContext() {
  if (typeof document === "undefined") return undefined;
  return (document as unknown as { modelContext?: ModelContext }).modelContext;
}
