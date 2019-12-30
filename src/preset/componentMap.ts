export interface ComponentMapping {
  [k: string]: ComponentDocLocation
}

export interface ComponentDocLocation {
  docAlias?: string // by default use lower case component name
  anchorBeforeProps: string
}

export const antdComponentMap: ComponentMapping = {
  // Affix: {
  //   anchorBeforeProps: '## API',
  // },
  Alert: {
    anchorBeforeProps: '## API',
  },
  // Anchor: {
  //   anchorBeforeProps: '## API',
  // },
  // 'Anchor.Link': {
  //   docAlias: 'anchor',
  //   anchorBeforeProps: '### Link Props',
  // },
  // AutoComplete: {
  //   anchorBeforeProps: '## API',
  // },
  // Avatar: {
  //   anchorBeforeProps: '## API',
  // },
  // Badge: {
  //   anchorBeforeProps: '## API',
  // },
  // BackTop: {
  //   anchorBeforeProps: '## API',
  // },
  // Breadcrumb: {
  //   anchorBeforeProps: '### Breadcrumb',
  // },
  // 'Breadcrumb.Item': {
  //   anchorBeforeProps: '### Breadcrumb.Item',
  // },
  // 'Breadcrumb.Separator': {
  //   anchorBeforeProps: '### Breadcrumb.Separator `3.21.0`',
  // },
  // Button: {
  //   anchorBeforeProps: '## API',
  // },
  // Calendar: {
  //   anchorBeforeProps: '## API',
  // },
  // Card: {
  //   anchorBeforeProps: '## API',
  // },
  // 'Card.Grid': {
  //   anchorBeforeProps: '### Card.Grid',
  // },
  // 'Card.Meta': {
  //   anchorBeforeProps: '### Card.Meta',
  // },
  // Carousel: {
  //   anchorBeforeProps: '## API',
  // },
}
