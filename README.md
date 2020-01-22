# vscode-antd-rush

♟ Your And-Design Rush.

## ROADMAP

- [x] Show props description and default value
- [x] Nested deconstruction type definition
- [x] Go to type definition
- [x] Show all available props of current component
- [x] ~~Split a webview of component's document via context menu (VSCode do not support open external URL)~~
- [x] Automatic generate handler for functional or class component
  - [x] Directly insert starts with `!`
  - [x] Class component handler
  - [x] Functional component handler 🔵
    - [x] Handler wrapped by useCallback 🔵
- [x] Support i18n configuration (en/zh) 🔵
- [x] Support handler generator prefix configuration 🔵
- [x] Add quick rename handler name dialog, starts with `#` 🔵
- [x] Move cursor to handler body after insertion 🔵
- [ ] Support Antd v4 🔵
- [ ] Add parameter types of handler in TS/TSX 🔵
  - [ ] Deep import types from `"antd/lib/{com}/{path}"` 🔵
  - [ ] Generic (auto detect from component) ⚪️
- [x] ~~Type `#` again to assist handler insert location ⚪️~~
- [ ] Hint user if version is not compatible ⚪️
  - [ ] Recursive find antd in node_modules ⚪️
- [ ] Antd component playground ⚪️
- [ ] Preview for `<Icon />` ⚪️

## TODO

- [x] Finish all components mapping
- [x] Cache JSON in memory
- [x] Contributing guide
- [x] PR/Issue template
- [ ] Test case
- [ ] Circle CI
- [ ] Demo Gif
- [ ] Promotion
- [ ] Release v1.0
