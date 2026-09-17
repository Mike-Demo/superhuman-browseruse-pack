import * as sdk from "@codahq/packs-sdk";

const BROWSER_USE_API_HOST = "api.browser-use.com";
const BROWSER_USE_SETTINGS_URL = "https://cloud.browser-use.com/settings";
const BROWSER_USE_MCP_ENDPOINT = "https://api.browser-use.com/v3/mcp";
const BROWSER_USE_API_KEY_HEADER = "x-browser-use-api-key";

const jsonString = (value: unknown): string => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch (_error) {
    return String(value ?? "");
  }
};

export const pack = sdk.newPack();

// Browser Use Cloud is reachable over the public Cloud API and MCP endpoint.
pack.addNetworkDomain(BROWSER_USE_API_HOST);
pack.addNetworkDomain("cloud.browser-use.com");

pack.setUserAuthentication({
  type: sdk.AuthenticationType.CustomHeaderToken,
  headerName: BROWSER_USE_API_KEY_HEADER,
  instructionsUrl: BROWSER_USE_SETTINGS_URL,
  // Required when the pack declares multiple network domains: pick the primary
  // domain used for user auth and MCP traffic.
  networkDomain: BROWSER_USE_API_HOST,
  getConnectionName: async (context) => {
    try {
      const response = await context.fetcher.fetch({
        method: "GET",
        url: "https://api.browser-use.com/v3/me",
      });

      return (
        response.body?.email ??
        response.body?.name ??
        response.body?.username ??
        "Browser Use account"
      );
    } catch (_error) {
      return "Browser Use account";
    }
  },
});

pack.addMCPServer({
  // MCP server names may only contain alphanumeric characters and underscores.
  name: "Browser_Use",
  endpointUrl: BROWSER_USE_MCP_ENDPOINT,
});

pack.addFormula({
  name: "RunBrowserTask",
  description: "Start a Browser Use browser automation task and return the task ID.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.String,
      name: "instructions",
      description: "Instructions for the Browser Use agent to execute in the browser.",
    }),
  ],
  resultType: sdk.ValueType.String,
  execute: async ([instructions], context) => {
    if (!instructions || !instructions.trim()) {
      throw new Error("Instructions are required to start a Browser Use task.");
    }

    const response = await context.fetcher.fetch({
      method: "POST",
      url: "https://api.browser-use.com/v3/run",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: instructions.trim() }),
    });

    const taskId = response.body?.id ?? response.body?.task_id;
    if (!taskId) {
      throw new Error(`Browser Use task creation response did not return an ID: ${jsonString(response.body)}`);
    }

    return String(taskId);
  },
});

pack.addFormula({
  name: "GetBrowserTaskStatus",
  description: "Fetch the Browser Use task status and payload for a task ID.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.String,
      name: "taskId",
      description: "The Browser Use task ID returned by RunBrowserTask.",
    }),
  ],
  resultType: sdk.ValueType.String,
  execute: async ([taskId], context) => {
    if (!taskId || !taskId.trim()) {
      throw new Error("A valid Browser Use task ID is required.");
    }

    const response = await context.fetcher.fetch({
      method: "GET",
      url: `https://api.browser-use.com/v3/task/${encodeURIComponent(taskId.trim())}`,
    });

    return jsonString(response.body ?? {});
  },
});

pack.addFormula({
  name: "BrowserUseHealthCheck",
  description: "Confirms the Browser Use API is reachable and the user API key is valid.",
  parameters: [],
  resultType: sdk.ValueType.String,
  execute: async (_, context) => {
    try {
      const response = await context.fetcher.fetch({
        method: "GET",
        url: "https://api.browser-use.com/v3/me",
      });

      return jsonString(response.body ?? { ok: true });
    } catch (error) {
      return jsonString({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
});
