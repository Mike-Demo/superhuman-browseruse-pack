# Superhuman Browser Use Pack: Prompt Examples

This file contains example prompts you can use to validate the Pack in Superhuman Go after installation.

## Basic browser checks

- "Open example.com and tell me the page title."
- "Go to https://example.com and summarize the page in one sentence."
- "Check whether https://example.com loads successfully and report the status."

## Form completion / browser automation

- "Open https://example.com, fill in the form fields with sample data if present, and tell me what changed on the page."
- "Navigate to a news site and list the top three headlines visible on the homepage."
- "Visit https://example.com and extract the main heading text from the page."

## Research / extraction

- "Search the web for 'browser use mcp server' and give me the top five relevant results with titles and links."
- "Open DuckDuckGo, search for 'best AI browser automation tools', and summarize the top 3 results."
- "Go to an ecommerce site, find the first product listing, and tell me the product name and price."

## Automation tasks

- "Open a website, click the first visible navigation link, then describe what page you land on."
- "Open a site, find the first contact or support link, then summarize its text and destination."
- "Visit a page, extract all visible headings, and format them as a bullet list."

## Validation prompts for the Pack

Use these prompts to confirm that the Browser Use MCP tool is actually being invoked through the Pack:

- "Use Browser Use to visit example.com and return the page title."
- "Use the Browser Use tool to open a webpage and extract its main heading."
- "Run a browser automation task with Browser Use to check if example.com loads and report the result."

## Good prompt structure

For best results, give the agent explicit instructions:

- which site to visit
- what to look for
- desired output format
- whether the task is read-only or requires interaction

Example:

> Use Browser Use to open https://example.com, read the main page heading, and reply with just the heading text.

## Troubleshooting prompts

If the agent is not using the Browser Use tool properly, try asking:

- "Use the Browser Use Pack to open example.com and tell me the page title."
- "Check whether the Browser Use integration is available and working."
- "Use Browser Use to confirm network access and page load status for example.com."

## Notes

These are intentionally simple prompts designed to validate that the Pack is installed, connected, and correctly exposing Browser Use's MCP tools to Superhuman Go.
