import * as sdk from "@superhuman/packs-sdk";

export const pack = sdk.newPack();

// Required: allow network access to the Browser Use Cloud MCP endpoint.
pack.addNetworkDomain("api.browser-use.com");

// Browser Use Cloud authenticates with a user-supplied API key in a static
// custom header, not OAuth. This is the correct auth pattern for the pack.
pack.setUserAuthentication({
  type: sdk.AuthenticationType.CustomHeaderToken,
  headerName: "x-browser-use-api-key",
  instructionsUrl: "https://cloud.browser-use.com/settings",
  getConnectionName: async (context) => {
    try {
      const response = await context.fetcher.fetch({
        method: "GET",
        url: "https://api.browser-use.com/v3/me",
      });

      return response.body?.email ?? response.body?.name ?? "Browser Use account";
    } catch (_error) {
      return "Browser Use account";
    }
  },
});

// This is the critical integration point: Superhuman Go will expose Browser Use's
// tools through this MCP server in the Pack UI / agent runtime.
pack.addMCPServer({
  name: "Browser Use",
  endpointUrl: "https://api.browser-use.com/v3/mcp",
});

// Optional formula helpers for local validation and easier manual testing.
pack.addFormula({
  name: "RunBrowserTask",
  description: "Start a Browser Use browser automation task and return the task ID.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.String,
      name: "instructions",
      description: "Natural-language instructions to execute in the browser.",
    }),
  ],
  resultType: sdk.ValueType.String,
  execute: async ([instructions], context) => {
    const response = await context.fetcher.fetch({
      method: "POST",
      url: "https://api.browser-use.com/v3/run",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: instructions }),
    });

    return response.body?.id ?? response.body?.task_id ?? JSON.stringify(response.body);
  },
});

pack.addFormula({
  name: "GetBrowserTaskStatus",
  description: "Fetch the task state and output for a Browser Use task ID.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.String,
      name: "taskId",
      description: "Browser Use task ID returned by RunBrowserTask.",
    }),
  ],
  resultType: sdk.ValueType.String,
  execute: async ([taskId], context) => {
    const response = await context.fetcher.fetch({
      method: "GET",
      url: `https://api.browser-use.com/v3/task/${taskId}`,
    });

    return JSON.stringify(response.body ?? {});
  },
});
