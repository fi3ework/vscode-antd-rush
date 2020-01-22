export interface ComponentMapping {
  [k: string]: ComponentDocLocation
}

export interface ComponentDocLocation {
  docAlias?: string // by default use lower case component name
  anchorBeforeProps: string | string[]
  methods: string[]
}

export const antdComponentMap: ComponentMapping = {
  Affix: {
    anchorBeforeProps: '## API',
    methods: ['target', 'onChange'],
  },
  Alert: {
    anchorBeforeProps: '## API',
    methods: ['afterClose', 'onClose'],
  },
  Anchor: {
    anchorBeforeProps: '### Anchor Props',
    methods: ['getContainer', 'onClick', 'getCurrentAnchor', 'onChange'],
  },
  'Anchor.Link': {
    docAlias: 'anchor',
    anchorBeforeProps: '### Link Props',
    methods: [],
  },
  AutoComplete: {
    anchorBeforeProps: '## API',
    methods: [
      'filterOption',
      'getPopupContainer',
      'onBlur',
      'onChange',
      'onFocus',
      'onSearch',
      'onSelect',
      'onDropdownVisibleChange',
    ],
  },
  Avatar: {
    anchorBeforeProps: '## API',
    methods: ['onError'],
  },
  BackTop: {
    anchorBeforeProps: '## API',
    methods: ['target', 'onClick'],
  },
  Badge: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  Breadcrumb: {
    anchorBeforeProps: '## API',
    methods: ['itemRender'],
  },
  'Breadcrumb.Item': {
    docAlias: 'breadcrumb',
    anchorBeforeProps: '### Breadcrumb.Item',
    methods: ['overlay', 'onClick'],
  },
  'Breadcrumb.Separator': {
    docAlias: 'breadcrumb',
    anchorBeforeProps: '### Breadcrumb.Separator `3.21.0`',
    methods: [],
  },
  Button: {
    anchorBeforeProps: '## API',
    methods: ['onClick'],
  },
  Calendar: {
    anchorBeforeProps: '## API',
    methods: [
      'dateCellRender',
      'dateFullCellRender',
      'disabledDate',
      'monthCellRender',
      'monthFullCellRender',
      'onPanelChange',
      'onSelect',
      'onChange',
      'headerRender',
    ],
  },
  Card: {
    anchorBeforeProps: '### Card',
    methods: ['onTabChange'],
  },
  'Card.Grid': {
    docAlias: 'card',
    anchorBeforeProps: '### Card.Grid',
    methods: [],
  },
  'Card.Meta': {
    docAlias: 'card',
    anchorBeforeProps: '### Card.Meta',
    methods: [],
  },
  Carousel: {
    anchorBeforeProps: '## API',
    methods: ['afterChange', 'beforeChange'],
  },
  Cascader: {
    anchorBeforeProps: '## API',
    methods: [
      'displayRender',
      'getPopupContainer',
      'loadData',
      'onChange',
      'onPopupVisibleChange',
      'filter',
      'render',
      'sort',
    ],
  },
  Checkbox: {
    anchorBeforeProps: '## API',
    methods: ['onChange'],
  },
  'Checkbox.Group': {
    docAlias: 'checkbox',
    anchorBeforeProps: '#### Checkbox Group',
    methods: ['onChange'],
  },
  Collapse: {
    anchorBeforeProps: '### Collapse',
    methods: ['onChange', 'expandIcon'],
  },
  'Collapse.Panel': {
    docAlias: 'collapse',
    anchorBeforeProps: '### Collapse.Panel',
    methods: [],
  },
  Comment: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  DatePicker: {
    anchorBeforeProps: ['### DatePicker'],
    methods: [
      // Picker
      'dateRender',
      'disabledDate',
      'getCalendarContainer',
      'onOpenChange',
      'onPanelChange',
      // DatePicker
      'disabledTime',
      'renderExtraFooter',
      'onChange',
      'onOk',
      'onPanelChange',
    ],
  },
  MonthPicker: {
    docAlias: 'date-picker',
    anchorBeforeProps: ['### MonthPicker'],
    methods: [
      // Picker
      'dateRender',
      'disabledDate',
      'getCalendarContainer',
      'onOpenChange',
      'onPanelChange',
      // MonthPicker
      'monthCellContentRender',
      'renderExtraFooter',
      'onChange',
    ],
  },
  WeekPicker: {
    docAlias: 'date-picker',
    anchorBeforeProps: ['### WeekPicker'],
    methods: [
      // Picker
      'dateRender',
      'disabledDate',
      'getCalendarContainer',
      'onOpenChange',
      'onPanelChange',
      // WeekPicker
      'onChange',
      'renderExtraFooter',
    ],
  },
  RangePicker: {
    docAlias: 'date-picker',
    anchorBeforeProps: ['### RangePicker'],
    methods: [
      // Picker
      'dateRender',
      'disabledDate',
      'getCalendarContainer',
      'onOpenChange',
      'onPanelChange',
      // RangePicker
      'disabledTime',
      'ranges',
      'renderExtraFooter',
      'onCalendarChange',
      'onChange',
      'onOk',
    ],
  },
  Descriptions: {
    anchorBeforeProps: '### Descriptions',
    methods: [],
  },
  'Description.Item': {
    docAlias: 'descriptions',
    anchorBeforeProps: '### DescriptionItem',
    methods: [],
  },
  Divider: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  Drawer: {
    anchorBeforeProps: '## API',
    methods: ['getContainer', 'onClose', 'afterVisibleChange'],
  },
  Dropdown: {
    anchorBeforeProps: '## API',
    methods: ['getPopupContainer', 'overlay', 'onVisibleChange'],
  },
  'Dropdown.Button': {
    docAlias: 'dropdown',
    anchorBeforeProps: '### Dropdown.Button',
    methods: ['onClick', 'onVisibleChange'],
  },
  Empty: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  Form: {
    anchorBeforeProps: '### Form',
    methods: ['onSubmit'],
  },
  'Form.Item': {
    docAlias: 'form',
    anchorBeforeProps: '### Form.Item',
    methods: [],
  },
  Row: {
    docAlias: 'grid',
    anchorBeforeProps: '### Row',
    methods: [],
  },
  Col: {
    docAlias: 'grid',
    anchorBeforeProps: '### Col',
    methods: [],
  },
  Icon: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  Input: {
    anchorBeforeProps: '### Input',
    methods: ['onChange', 'onPressEnter'],
  },
  'Input.TextArea': {
    docAlias: 'input',
    anchorBeforeProps: '### Input.TextArea',
    methods: ['onPressEnter'],
  },
  'Input.Search': {
    docAlias: 'input',
    anchorBeforeProps: ['#### Input.Search'],
    methods: ['onSearch', 'onChange', 'onPressEnter'],
  },
  'Input.Group': {
    docAlias: 'input',
    anchorBeforeProps: '#### Input.Group',
    methods: [],
  },
  'Input.Password': {
    docAlias: 'input',
    anchorBeforeProps: '#### Input.Password.+',
    methods: [],
  },
  InputNumber: {
    anchorBeforeProps: '## API',
    methods: ['formatter', 'parser', 'onChange', 'onPressEnter'],
  },
  Layout: {
    anchorBeforeProps: '### Layout',
    methods: [],
  },
  'Layout.Sider': {
    docAlias: 'layout',
    anchorBeforeProps: '### Layout.Sider',
    methods: ['onCollapse', 'onBreakpoint'],
  },
  List: {
    anchorBeforeProps: '## API',
    methods: ['renderItem'],
  },
  'List.Item': {
    docAlias: 'list',
    anchorBeforeProps: '### List.Item',
    methods: [],
  },
  'List.Item.Meta': {
    docAlias: 'list',
    anchorBeforeProps: '### List.Item.Meta',
    methods: [],
  },
  Mention: {
    anchorBeforeProps: '### Mention',
    methods: [
      'getSuggestionContainer',
      'onBlur',
      'onChange',
      'onFocus',
      'onSearchChange',
      'onSelect',
    ],
  },
  Mentions: {
    anchorBeforeProps: '### Mentions',
    methods: [
      'filterOption',
      'validateSearch',
      'onChange',
      'onSelect',
      'onSearch',
      'onFocus',
      'onBlur',
      'getPopupContainer',
    ],
  },
  Menu: {
    anchorBeforeProps: '## API',
    methods: ['onClick', 'onDeselect', 'onOpenChange', 'onSelect'],
  },
  'Menu.Item': {
    docAlias: 'menu',
    anchorBeforeProps: '### Menu.Item',
    methods: [],
  },
  'Menu.SubMenu': {
    docAlias: 'menu',
    anchorBeforeProps: '### Menu.SubMenu',
    methods: ['onTitleClick'],
  },
  'Menu.ItemGroup': {
    docAlias: 'menu',
    anchorBeforeProps: '### Menu.ItemGroup',
    methods: [],
  },
  Message: {
    anchorBeforeProps: '## API',
    methods: ['onClose'],
  },
  Modal: {
    anchorBeforeProps: '## API',
    methods: ['afterClose', 'getContainer', 'onCancel', 'onOk'],
  },
  Notification: {
    anchorBeforeProps: '## API',
    methods: ['getContainer', 'onClose', 'onClick'],
  },
  PageHeader: {
    anchorBeforeProps: '## API',
    methods: ['onBack'],
  },
  Pagination: {
    anchorBeforeProps: '## API',
    methods: ['itemRender', 'showTotal', 'onChange', 'onShowSizeChange'],
  },
  Popconfirm: {
    anchorBeforeProps: '## API',
    methods: ['onCancel', 'onConfirm', 'getPopupContainer', 'onVisibleChange'],
  },
  Popover: {
    anchorBeforeProps: '## API',
    methods: ['getPopupContainer', 'onVisibleChange'],
  },
  Progress: {
    anchorBeforeProps: '## API',
    methods: ['format'],
  },
  Radio: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  'Radio.Group': {
    docAlias: 'radio',
    anchorBeforeProps: '### RadioGroup',
    methods: ['onChange'],
  },
  Rate: {
    anchorBeforeProps: '## API',
    methods: ['onBlur', 'onChange', 'onFocus', 'onHoverChange', 'onKeyDown'],
  },
  Result: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  Select: {
    anchorBeforeProps: '### Select props',
    methods: [
      'dropdownRender',
      'filterOption',
      'getPopupContainer',
      'maxTagPlaceholder',
      'onBlur',
      'onChange',
      'onDeselect',
      'onFocus',
      'onInputKeyDown',
      'onMouseEnter',
      'onMouseLeave',
      'onPopupScroll',
      'onSearch',
      'onSelect',
      'onDropdownVisibleChange',
    ],
  },
  'Select.Option': {
    docAlias: 'select',
    anchorBeforeProps: '### Option props',
    methods: [],
  },
  'Select.OptGroup': {
    docAlias: 'select',
    anchorBeforeProps: '### OptGroup props',
    methods: [],
  },
  Skeleton: {
    anchorBeforeProps: '### Skeleton',
    methods: [],
  },
  Slider: {
    anchorBeforeProps: '## API',
    methods: ['tipFormatter', 'onAfterChange', 'onChange', 'getTooltipPopupContainer'],
  },
  Spin: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  Statistic: {
    anchorBeforeProps: '#### Statistic',
    methods: ['formatter'],
  },
  'Statistic.Countdown': {
    docAlias: 'statistic',
    anchorBeforeProps: '#### Statistic.Countdown',
    methods: ['onFinish'],
  },
  Steps: {
    anchorBeforeProps: '### Steps',
    methods: ['progressDot', 'onChange'],
  },
  'Steps.Step': {
    docAlias: 'steps',
    anchorBeforeProps: '### Steps.Step',
    methods: [],
  },
  Switch: {
    anchorBeforeProps: '## API',
    methods: ['onChange', 'onClick'],
  },
  Table: {
    anchorBeforeProps: '### Table',
    methods: [
      'expandedRowRender',
      'expandIcon',
      'footer',
      'rowClassName',
      'rowKey',
      'title',
      'onChange',
      'onExpand',
      'onExpandedRowsChange',
      'onHeaderRow',
      'onRow',
      'getPopupContainer',
    ],
  },
  'Table.Column': {
    docAlias: 'table',
    anchorBeforeProps: '### Column',
    methods: [
      'filterDropdown',
      'filterIcon',
      'render',
      'sorter',
      'title',
      'onCell',
      'onFilter',
      'onFilterDropdownVisibleChange',
      'onHeaderCell',
    ],
  },
  'Table.ColumnGroup': {
    docAlias: 'table',
    anchorBeforeProps: '### ColumnGroup',
    methods: [],
  },
  Tabs: {
    anchorBeforeProps: '### Tabs',
    methods: ['renderTabBar', 'onChange', 'onEdit', 'onNextClick', 'onPrevClick', 'onTabClick'],
  },
  'Tabs.TabPane': {
    docAlias: 'tabs',
    anchorBeforeProps: '### Tabs.TabPane',
    methods: [],
  },
  Tag: {
    anchorBeforeProps: '### Tag',
    methods: ['afterClose', 'onClose'],
  },
  'Tag.CheckableTag': {
    docAlias: 'tag',
    anchorBeforeProps: '### Tag.CheckableTag',
    methods: ['onChange'],
  },
  TimePicker: {
    anchorBeforeProps: '## API',
    methods: [
      'addon',
      'disabledHours',
      'disabledMinutes',
      'disabledSeconds',
      'getPopupContainer',
      'onChange',
      'onOpenChange',
    ],
  },
  Timeline: {
    anchorBeforeProps: '### Timeline',
    methods: [],
  },
  'Timeline.Item': {
    docAlias: 'timeline',
    anchorBeforeProps: '### Timeline.Item',
    methods: [],
  },
  Tooltip: {
    anchorBeforeProps: ['### Common API', '### 共同的 API', '## API'],
    methods: ['title', 'getPopupContainer', 'onVisibleChange'],
  },
  Transfer: {
    anchorBeforeProps: '## API',
    methods: [
      'filterOption',
      'footer',
      'listStyle',
      'render',
      'onChange',
      'onScroll',
      'onSearch',
      'onSelectChange',
    ],
  },
  Tree: {
    anchorBeforeProps: '### Tree props',
    methods: [
      'filterTreeNode',
      'loadData',
      'onCheck',
      'onDragEnd',
      'onDragEnter',
      'onDragLeave',
      'onDragOver',
      'onDragStart',
      'onDrop',
      'onExpand',
      'onLoad',
      'onRightClick',
      'onSelect',
    ],
  },
  'Tree.TreeNode': {
    docAlias: 'tree',
    anchorBeforeProps: '### TreeNode props',
    methods: ['icon'],
  },
  'Tree.DirectoryTree': {
    docAlias: 'tree',
    anchorBeforeProps: '### DirectoryTree props',
    methods: [],
  },
  TreeSelect: {
    anchorBeforeProps: '### Tree props',
    methods: [
      'filterTreeNode',
      'getPopupContainer',
      'loadData',
      'maxTagPlaceholder',
      'onChange',
      'onSearch',
      'onSelect',
      'onTreeExpand',
    ],
  },
  'TreeSelect.TreeNode': {
    docAlias: 'tree-select',
    anchorBeforeProps: '### TreeNode props',
    methods: [],
  },
  'Typography.Text': {
    docAlias: 'typography',
    anchorBeforeProps: '### Typography.Text',
    methods: [],
  },
  'Typography.Title': {
    docAlias: 'typography',
    anchorBeforeProps: '### Typography.Title',
    methods: ['onChange'],
  },
  'Typography.Paragraph': {
    docAlias: 'typography',
    anchorBeforeProps: '### Typography.Paragraph',
    methods: ['onChange'],
  },
  Upload: {
    anchorBeforeProps: '## API',
    methods: [
      'action',
      'beforeUpload',
      'customRequest',
      'data',
      'previewFile',
      'showUploadList',
      'onPreview',
      'onRemove',
      'onDownload',
      'transformFile',
    ],
  },
}
