# Contribute

## 1. Pre-build document JSON

```zsh
$ yarn run build-doc
```

The documentation relevent config is in `./src/build-resource/constant.ts`. It contains the documentation's version will be fetched.

## 2. Add GitHub token (optional)

As GitHub's open API has limitation with non-authentication request. It's recommend to add token to request header. Use the token of yourself, and add is as `src/build-resource/fetchDocs.ts` lines 9-12 guide.

## 3. Run extension in debug mode

Press <kbd>F5</kbd> to run extension in debug mode.

## scripts

- `build-doc:download-and-parse`: downloaded Markdown files and parse them to JSON which will be shown.
- `build-doc:parse`: parse Markdowned files under `src/resource/*.md` to JSON.
- `build-prod`: build a optimized version of dist.
- `build-dev`: will be runned as pre-task when debugging.
- `compile-test`: compile test files.
