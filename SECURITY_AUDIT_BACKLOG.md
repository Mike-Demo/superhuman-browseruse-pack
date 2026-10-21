# Security audit backlog — 2026-10-21

Parent: [Mike-Demo/superhuman-browseruse-pack#2](https://github.com/Mike-Demo/superhuman-browseruse-pack/issues/2)

Issue creation is unavailable in this session. The two sections below contain exact issue titles and bodies ready to file in this repository; no child issues have been created.

## Prioritization

1. **Low — redact BrowserUseHealthCheck output.** This is the only confirmed finding and the only confirmed root-cause group. A parameterless health check returns the connected owner's latest session-list payload rather than a minimal status. A caller able to invoke the formula and read its result can receive unnecessary account/session data without supplying a task ID. Access by a lower-trust caller in the deployed platform is not established; this is not evidence of unauthenticated access or cross-account access. The proposed success-path-only redaction is small and low-risk, preserves the API connectivity check and error branch, and intentionally removes the unintended payload.

The four leads below are not confirmed findings and have no severity assigned. They are not grouped with the health-check finding: upstream session isolation, MCP delegation controls, execution deduplication, and instruction authorization require separate validation. Their checklist order does not imply a risk ranking.

## Ready-to-file issue 1

### Title

`[security][low] Redact BrowserUseHealthCheck session payload`

### Body

Parent audit: https://github.com/Mike-Demo/superhuman-browseruse-pack/issues/2

**Status:** Confirmed by static source inspection.
**Severity:** Low.
**Priority:** First among confirmed findings; one finding in this root-cause group.
**Fingerprint:** `healthcheck-returns-full-latest-session`

#### Evidence and reachability

- [`pack.ts:34–46`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L34-L46) configures connection-key authentication and fetches `GET /api/v3/sessions?page_size=1` for the connection name.
- [`pack.ts:48–54`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L48-L54) reads `response.body?.items?.[0]?.user?.email` from that endpoint, providing source evidence for an account-email field when present.
- [`pack.ts:192–206`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L192-L206) defines the parameterless String formula `BrowserUseHealthCheck`, fetches the same endpoint under the connection's API key, and returns `jsonString(response.body ?? { ok: true })`.
- [`pack.ts:207–211`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L207-L211) already returns `{ ok: false, error }` on failure.

Anyone permitted to invoke this formula and view its result receives the session-list body when supplied by the upstream API, including any account email and session fields present. No task ID is needed. The deployed lower-trust caller permissions and actual response contents were not tested; do not infer cross-account access or guaranteed fields in an empty response.

#### Root cause

The success path uses the entire upstream response body as the formula result. `{ ok: true }` is only a nullish-body fallback, not a redacted result.

#### Smallest fix

Keep the existing authenticated fetch, but return only `jsonString({ ok: true })` after it succeeds; never forward `response.body`. Remove the now-unused response binding if needed. Preserve the existing catch branch returning `{ ok: false, error }`. No task-status or MCP changes are needed for this finding.

#### Acceptance criteria

- [ ] A successful fetch with a populated session/email payload returns only the serialized `{ ok: true }` result, containing no upstream fields.
- [ ] A successful fetch with an absent or empty body also returns only `{ ok: true }`.
- [ ] A failed fetch preserves the existing `{ ok: false, error }` result.
- [ ] The endpoint, connection authentication, zero cache TTL, parameterless interface, and String result type remain unchanged.

## Ready-to-file issue 2

### Title

`[security][needs-validation] Audit leads to validate`

### Body

Parent audit: https://github.com/Mike-Demo/superhuman-browseruse-pack/issues/2

These are unconfirmed leads from the 2026-10-21 static audit, not established vulnerabilities. No severity is assigned. No deployed endpoint was probed and no runtime behavior was validated in this triage. Check off a lead only after recording evidence for all its missing facts and a confirmed/rejected disposition; create a separate remediation issue if confirmed. Use documentation or explicitly authorized, controlled tests; do not probe third-party sessions or start billed tasks without authorization.

- [ ] **Task-status formulas return the full upstream session payload for any supplied taskId, with session isolation left entirely to the upstream API**
  - Fingerprint: `arbitrary-taskid-full-session-payload-return`
  - Source evidence: [`pack.ts:101–125`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L101-L125) and [`pack.ts:152–188`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L152-L188).
  - Claimed root cause: `GetBrowserTaskStatus` and `WaitForBrowserTask` forward caller-supplied task IDs to the session-read endpoint under the connection's API key, returning the full upstream payload directly or nested in the timeout result. They provide no local ownership binding or field minimisation; isolation depends on upstream enforcement.
  - **Exact missing fact:** Whether api.browser-use.com enforces per-API-key session ownership for GET /api/v3/sessions/:id, and whether Browser Use session/task IDs are unguessable (high-entropy).

- [ ] **MCP registration inherits the entire present-and-future Browser Use MCP tool surface with no allowlist or scoping**
  - Fingerprint: `mcp-full-tool-surface-no-allowlist`
  - Source evidence: [`pack.ts:61–65`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L61-L65).
  - Claimed root cause: MCP registration specifies only a name and endpoint, with no in-source tool allowlist, scope, or confirmation control. Whole-surface delegation under the owner's API key depends on whether the SDK and platform provide narrowing.
  - **Exact missing fact:** The exact tool list exposed today by https://api.browser-use.com/v3/mcp, whether packs-sdk addMCPServer supports a tool allowlist/filter, and whether Superhuman Go requires owner confirmation for each MCP tool call.

- [ ] **RunBrowserTask has no idempotency binding, so recalculation or retry could create duplicate billed sessions**
  - Fingerprint: `run-browser-task-no-idempotency-duplicate-execution`
  - Source evidence: [`pack.ts:67–99`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L67-L99); the other formulas set `cacheTtlSecs: 0` at lines 103, 130, and 194.
  - Claimed root cause: Session creation POSTs only `{ task }`, with no explicit idempotency/deduplication token or formula cache TTL. Duplicate billed execution depends on unverified platform retry/recalculation and upstream deduplication behavior; changing cache TTL alone is not an established fix.
  - **Exact missing fact:** Superhuman/Coda formula recalculation, retry and caching semantics (including the default cacheTtlSecs and the effect of cacheTtlSecs:0) for a POST-performing formula like RunBrowserTask, and whether the Browser Use sessions API deduplicates identical task bodies or supports an idempotency key.

- [ ] **RunBrowserTask forwards unbounded, unconfirmed instructions to a billed browser agent under the owner API key**
  - Fingerprint: `run-browser-task-unbounded-instructions-no-confirmation`
  - Source evidence: [`pack.ts:67–90`](https://github.com/Mike-Demo/superhuman-browseruse-pack/blob/9cde4892cf42f76f8a8fa0310e90acf854f7ef6c/pack.ts#L67-L90).
  - Claimed root cause: The Pack rejects blank instructions and trims whitespace, but otherwise forwards them as the task without an in-Pack length cap, confirmation binding, spend limit, or browsing-domain restriction. Whether lower-trust input can reach execution without an owner's bound approval is unknown. The API network-domain restriction does not itself specify the browser agent's target domains.
  - **Exact missing fact:** Who besides the connected account owner can invoke RunBrowserTask or steer Superhuman Go into invoking it in the deployed Superhuman surface, and whether Superhuman presents a per-call confirmation bound to the exact instructions before the POST executes.
