---
"@quartz-community/plugin-template": patch
---

The example transformer's `addHeadingSlugs` option now gives headings their ids with the shared `HeadingSlugger` from `@quartz-community/utils` instead of `rehype-slug`. The ids are the same as before, and the package no longer depends on `rehype-slug`.
