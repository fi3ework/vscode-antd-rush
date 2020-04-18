# Contribute

## 1. Pre-build document JSON

```zsh
$ yarn run build-doc
```

The documentation relevent config is in `./src/buildResource/constant.ts`. It contains the documentation's version will be fetched.

## 2. Add GitHub token (optional)

As GitHub's open API has limitation with non-authentication request. It's recommend to add token to request header. Use the token of yourself, and add is as `src/buildResource/fetchDocs.ts` lines 9-12 guide.

## 3. Run extension in debug mode

Press <kbd>F5</kbd> to run extension in debug mode.
