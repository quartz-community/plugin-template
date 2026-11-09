# Changelog

## 0.1.1

### Patch Changes

- 7eacbea: The example transformer's `addHeadingSlugs` option now gives headings their ids with the shared `HeadingSlugger` from `@quartz-community/utils` instead of `rehype-slug`. The ids are the same as before, and the package no longer depends on `rehype-slug`.
- a98c35a: Stop bundling `preact` and the other `SINGLETON_EXTERNALS`. tsup checks `noExternal` first, so `noExternal: [/.*/]` overrode them, and every plugin built from the template shipped its own copy of Preact.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial Quartz community plugin template.
