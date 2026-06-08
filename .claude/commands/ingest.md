---
description: Export this session and promote it into the zettelkasten wiki
---

<!-- ── PROJECT CONFIG ── change these 3 lines when copying to a new project ── -->
<!-- PROJECT_NAME:      Century Kumdo Site                                       -->
<!-- PROJECT_PATH:      d:\workspace\js\centurynew                               -->
<!-- LLM_WIKI_PAGE:     LLM/mireutech/century-kumdo-site.md                      -->
<!-- ─────────────────────────────────────────────────────────────────────────── -->

Run the end-of-session knowledge capture pipeline. Do not ask for confirmation — proceed immediately through all steps.

---

## Step 1 — Generate the session summary

Synthesize a structured session export from this conversation. Use the format below. Be specific and concrete — this becomes the permanent record in the zettelkasten.

```
# Session Export — Century Kumdo Site: <topic slug in title case>

**Date:** <today's date YYYY-MM-DD>
**Project:** Century Kumdo Site (`d:\workspace\js\centurynew`)
**Tools touched:** <comma-separated list of files read or changed this session>

---

## What happened
<1–3 sentence narrative of the session's focus>

## Changes made
<bullet list of specific changes, with file paths>

## Key decisions / constraints
<decisions made, tradeoffs chosen, constraints discovered>

## Open questions
<unresolved questions or deferred work>

## Zettelkasten sources consulted
<any zettelkasten notes or external project files referenced>
```

Omit sections that have nothing to report.

---

## Step 2 — Hand off to the zettelkasten agent

Spawn an Agent with the following:
- **Working directory:** `D:\MJData\zettelkasten`
- **Prompt:** Construct the prompt by combining:
  1. The instruction: *"You are in the zettelkasten directory. A dev-project agent has provided the following session summary. Follow the instructions in `.claude/commands/ingest-external.md` using this summary as your source. The relevant LLM wiki page for this project is `LLM/mireutech/century-kumdo-site.md` — prefer updating it over creating a new page."*
  2. The full session summary text you generated in Step 1.

---

## Step 3 — Report

After the agent completes, report:
- Which session file was written (`raw/sessions/…`)
- Which LLM wiki pages were created or updated
- Any open questions or follow-up items flagged by the agent
