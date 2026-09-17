# Superhuman Browser Use Pack: Installation Checklist

This document is the step-by-step install guide for the Browser Use Pack in your own Superhuman account.

## 1. Prerequisites

Before you install the Pack, make sure you have:

- a Superhuman account
- access to the Superhuman Pack tooling / admin workspace
- a Browser Use Cloud account
- a Browser Use API key generated in the Browser Use dashboard

Browser Use API key location:

- `https://cloud.browser-use.com/settings`

## 2. Required Browser Use configuration

Your Browser Use API key should be generated from the Browser Use Cloud settings page. The Pack expects the API key to be sent as the following HTTP header:

- `x-browser-use-api-key`

The MCP endpoint used by the Pack is:

- `https://api.browser-use.com/v3/mcp`

## 3. Install the Pack in Superhuman

1. Open the Superhuman Pack tooling.
2. Create or import the Pack definition from this repository.
3. Confirm the Pack includes the following network allow-list entries:
   - `api.browser-use.com`
   - `cloud.browser-use.com`
4. Confirm the Pack includes the Browser Use MCP server registration:
   - name: `Browser Use`
   - endpoint: `https://api.browser-use.com/v3/mcp`
5. Confirm the auth block uses a custom header token:
   - header name: `x-browser-use-api-key`
   - instructions URL: `https://cloud.browser-use.com/settings`
6. Save and upload the Pack.

## 4. Connect your Browser Use account

1. Open the installed Pack inside Superhuman.
2. Choose to connect or authenticate the account.
3. Paste your Browser Use API key.
4. Confirm the Pack connects successfully.

## 5. Validate the Pack

After connection, validate the Browser Use toolset is available in Superhuman Go.

Recommended smoke test prompt:

> Open example.com and tell me the page title.

If the Pack is working, the agent should resolve the Browser Use MCP tool and complete the browser task.

## 6. Basic validation sequence

Run the following in order:

1. `BrowserUseHealthCheck`
2. `RunBrowserTask` with a simple instruction like: "Open example.com and return the page title."
3. `GetBrowserTaskStatus` using the task ID returned from step 2

If all three succeed, the Pack is operational.

## 7. Troubleshooting

### Unauthorized

- regenerate the Browser Use API key
- reconnect the Pack
- verify the header is exactly `x-browser-use-api-key`

### Network access blocked

- ensure `api.browser-use.com` is in the allow-list
- ensure `cloud.browser-use.com` is in the allow-list

### Tools not visible in Superhuman Go

- re-upload or reinstall the Pack
- reconnect the account
- confirm the Pack loaded successfully in the Superhuman Pack environment

### Long-running automation tasks

Use the task polling pattern:

1. call `RunBrowserTask`
2. store the resulting task ID
3. poll `GetBrowserTaskStatus` until the task reaches the desired terminal state

## 8. Notes

This is a direct Browser Use MCP integration, not a custom proxy or local bridge. It is a clean architecture because Browser Use Cloud already exposes a public MCP endpoint and its API key auth fits the Pack's custom-header auth model.

## 9. Summary

The install flow is simple:

- generate Browser Use API key
- install Pack in Superhuman
- authenticate using `x-browser-use-api-key`
- confirm Browser Use tools become available
- validate with one basic automation prompt
