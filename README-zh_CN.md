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

[English](./README.md) | 中文

## 特性

- 💬 为 Ant Design 组件及属性显示对应官方文档
- ⚡️ 自动插入组件 handler
- ✨ 易于随官方进行升级
- 🌐 支持中/英文档

## 提示

- 当前使用的 Ant Design 文档版本为 **3.26.4**
- 需要用户的项目中安装了 `@types/react`

## 功能

### 悬浮提示组件 props 表格

- 悬浮在组件上显示官方文档的组件详情
- 提供链接直接跳转到 Ant Design 的官方文档页面

<img src="assets/hover-component.gif">

### 悬浮提示 props 详情

- 悬浮在 props 上显示官方文档的 props 详情

<img src="assets/hover-props.gif">

### 自动插入 method handler

- 触发 `!` 自动插入带默认前缀的 handler（默认前缀预置为 `handle`，可配置）
- 触发 `#` 在提示输入 handler name 后插入
- 暂时不会为 TypeScript 自动添加类型标注
- class component 插入的模板为

```jsx
this.handleMethod = () => {}
```

- functional component 插入的模板为

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
