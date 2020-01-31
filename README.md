<p align="center">
  <a href="https://github.com/fi3ework/vscode-antd-rush">
    <img width="200px" height="200px" src="https://user-images.githubusercontent.com/12322740/73346951-ba4dbe80-42c1-11ea-8784-5af0916ec459.png">
  </a>
</p>
<h1 align="center">Antd Rush</h1>
<div align="center">

Rush to Ant Design in VS Code

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=fi3ework.vscode-antd-rush">
<img src="https://vsmarketplacebadge.apphb.com/version/fi3ework.vscode-antd-rush.svg" />
</a>
<a href="https://marketplace.visualstudio.com/items?itemName=fi3ework.vscode-antd-rush">
<img src="https://vsmarketplacebadge.apphb.com/downloads-short/fi3ework.vscode-antd-rush.svg" />
</a>
<a href="https://marketplace.visualstudio.com/items?itemName=fi3ework.vscode-antd-rush">
<img src="https://vsmarketplacebadge.apphb.com/installs-short/fi3ework.vscode-antd-rush.svg" />
</a>
<a href="https://marketplace.visualstudio.com/items?itemName=fi3ework.vscode-antd-rush">
<img src="https://vsmarketplacebadge.apphb.com/rating-short/fi3ework.vscode-antd-rush.svg" />
</a>
<a href="https://github.com/fi3ework/vscode-antd-rush/actions?query=workflow%3ATest">
<img src="https://img.shields.io/github/workflow/status/fi3ework/vscode-antd-rush/Test?label=GitHub%20Actions" />
</a>
</p>

</div>

[Download from Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=fi3ework.vscode-antd-rush)

English | [中文](./README-zh_CN.md)

## Feature

- 💬 Show documentation for Ant Design component and props
- ⚡️ Insert method handler automatically
- ✨ Easy to upgrade with Ant Design
- 🌐 Support Chinese and English documentation

## Caveat

- Currently used version of the Ant Design documentation is **3.26.4**
- `@types/react` is required to be installed in the project

## Usage

### Component props table hover hint

- Hover on component and get component documentation hint
- Jump to Ant Design documentation page via link

<img src="assets/hover-component.gif">

### Props detail hover hint

<img src="assets/hover-props.gif">

### Auto insert method handler

- Trigger `!` to auto insert handler with prefix `#` (default `handle`, it's configurable)
- Trigger `#` to insert handler after inquiry input
- No add TypeScript type annotation for now
- class component insertion template is

```jsx
this.handleMethod = () => {}
```

- functional component insertion template is

```jsx
const handleMethod = useCallback(() => {})
```

<img src="assets/insertion.gif">

## Contributing

See [CONTRIBUTING](https://github.com/fi3ework/vscode-antd-rush/blob/master/CONTRIBUTING.md)

## Roadmap

See [#1](https://github.com/fi3ework/vscode-antd-rush/issues/1)

## License

MIT
