# Opus locale translation brief

Only the component library is localised. Site chrome, documentation, the application container, the playground and long-form documentation stay in English.

Create two TypeScript files in `/Users/F7905607/Dropbox/Projects/Opus/Library/lib/i18n/` for the target locale, using the English files as the authoritative key lists:

- `componentMessages.<code>.ts` → export `componentMessages<Pascal>: Record<string, string>`
  - Shared component messages used by package controls (Kanban, DataGrid, FilterBuilder, SearchBox, Calendar, Pagination and common labels).
- `componentUiMessages.<code>.ts` → export `componentUiMessages<Pascal>: Record<string, string>`
  - Component-specific UI strings. Start from `componentUiMessages.en.ts`; do not add or remove keys.

Then register both files in `componentMessages.ts` and `componentUiMessages.ts` and run:

```bash
npm run generate:i18n
```

Translate every value into natural [LANGUAGE]. Keep unavoidable technical terms in English (Opus, opus-react, ChatGPT, OpenAI, npm, URLs, code identifiers, GHSA IDs). Preserve every `{placeholder}` token exactly. Use double-quoted keys/values and valid TypeScript. Do not translate documentation, navigation, page titles, descriptions or settings labels.

## Context for ambiguous component labels

Use the English meaning in the actual component, rather than translating isolated words:

- `audioPlayer.track` and `audioPlayer.trackCount`: an audio track (noun), never the verb “follow”, “trace” or “monitor”. The count identifies the current audio item within the playlist.
- `kanban.openTicket`: an action that opens an existing work item for `{title}`, never a description of an already-open ticket or a travel ticket.
- `kanban.addCard` and `kanban.addCardSubmit`: create a task card on a Kanban board, never a geographic map.
- `kanban.attach`: attach a file to a comment, never join a group or meeting.
- `filter.and`: the Boolean conjunction AND in the target language. French `ET` belongs only in French.

Keep related labels consistent and preserve all named placeholders, including their occurrence counts. Regenerate `public/i18n` after editing TypeScript sources.
