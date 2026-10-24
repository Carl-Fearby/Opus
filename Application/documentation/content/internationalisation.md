# Internationalisation

Opus ships built-in component translations for 48 languages: English plus 47 others, including right-to-left Arabic, Persian, Hebrew and Urdu.

## What is translated

The component layer only — 796 shared strings per locale covering the controls people read: Kanban board actions and dialogs, DataGrid toolbars and filters, the calendar and date pickers, pagination, search, charts, form validation, empty and loading states, and the accessible names behind them.

Documentation, navigation, page titles, and marketing pages stay in English so the surrounding site remains consistent.

## Using a shipped locale

```tsx
import { OpusI18nProvider, getOpusTranslations, opusTranslationLocales } from "opus-react";

// opusTranslationLocales lists every shipped locale, e.g. "en", "fr", "ja", "ar".
const locale = "fr";

export function App() {
  return (
    <OpusI18nProvider locale={locale} messages={getOpusTranslations(locale)}>
      <YourApp />
    </OpusI18nProvider>
  );
}
```

Load only the locale you need so the bundle stays small:

```tsx
const messages = await fetch(`/i18n/${locale}.json`).then((response) => response.json());
```

The documentation site does exactly this: the language picker lazily loads a locale's bundle the first time it is selected, so no extra locales are downloaded up front.

## Overriding or extending strings

Pass extra keys through `messages` to override any built-in string, or to translate copy the package does not cover. Components fall back to English when a key is not supplied, so translations can be introduced incrementally:

```tsx
<OpusI18nProvider
  locale="fr"
  messages={{
    ...getOpusTranslations("fr"),
    "kanban.boardTitle": "Tableau Kanban",
  }}
>
  <YourApp />
</OpusI18nProvider>
```

`OpusI18nProvider` also accepts `messages` without a `locale` when you only want to supply overrides.

## Right-to-left locales

Arabic, Persian, Hebrew and Urdu are mirrored by the components themselves. Set `dir="rtl"` on your document (or container) alongside the locale:

```tsx
<OpusI18nProvider locale="ar" messages={getOpusTranslations("ar")}>
  <YourApp />
</OpusI18nProvider>
```

## Placeholders

Messages support `{name}` placeholders, and every translation keeps the placeholder names from its English source:

```tsx
t("calendar.eventAdded", "{title} added to this day", { title });
```

## Helping with translations

The translations were produced with machine assistance and reviewed against the English source, but native-speaker proof-reading is still welcome — particularly for word sense, which is where machine translation most often goes wrong.

To proof-read a locale, open an issue on GitHub or use the contact details in the contributors section of the site, and tell us which language you can review.
