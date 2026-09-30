---
"@quartz-community/plugin-template": patch
---

Stop bundling `preact` and the other `SINGLETON_EXTERNALS`. tsup checks `noExternal` first, so `noExternal: [/.*/]` overrode them, and every plugin built from the template shipped its own copy of Preact.
