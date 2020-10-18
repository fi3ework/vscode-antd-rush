# Contribute

## Fetch documentations

### 1. Prepare GitHub token

As GitHub's open API has limitation with non-authentication request. It's recommended to add token to request header. Add a file to `{projectRoot}/build-resource/token.ts` and content of

```typescript
export const GITHUB_TOKEN = `${YOUR_GITHUB_TOKEN}`
```

### 2. Pre-build documentation JSON

```zsh
yarn run build-doc:download-and-parse
```

The documentation relevent config is in `./src/build-resource/constant.ts`. It contains the documentation's configuration.

## Development

### 1. Run extension in debug mode

Press <kbd>F5</kbd> to run extension in debug mode.

## Scripts

- `build-doc:download-and-parse`: Download Markdown files and parse them to JSON which will be shown.
- `build-doc:parse`: Parse Markdowned files under `src/resource/*.md` to JSON without re-download.
- `build-dev`: Will be runned as pre-task when debugging.
- `build-prod`: Build a optimized version of dist.
- `compile-test`: Compile test files.
- `test`: Run unit test cases.
