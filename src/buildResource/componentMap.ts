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
    methods: ['onError'],
  },
  Badge: {
    anchorBeforeProps: '## API',
    methods: [],
  },
  Breadcrumb: {
    anchorBeforeProps: '### Breadcrumb',
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
    anchorBeforeProps: '## API',
    methods: ['onTabChange'],
  },
  'Card.Grid': {
    anchorBeforeProps: '### Card.Grid',
    docAlias: 'card',
    methods: [],
  },
  'Card.Meta': {
    anchorBeforeProps: '### Card.Meta',
    docAlias: 'card',
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
    anchorBeforeProps: '#### Checkbox',
    methods: ['onChange'],
  },
  'Checkbox.Group': {
    anchorBeforeProps: '## API',
    docAlias: 'checkbox',
    methods: ['onChange'],
  },
  Collapse: {
    anchorBeforeProps: '## API',
    methods: ['expandIcon'],
  },
  Comment: {
    anchorBeforeProps: '## API',
    methods: [''],
  },
  DatePicker: {
    anchorBeforeProps: ['## API', '### DatePicker'],
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
    anchorBeforeProps: ['## API', '### MonthPicker'],
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
  RangePicker: {
    docAlias: 'date-picker',
    anchorBeforeProps: ['## API', '### RangePicker'],
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
  WeekPicker: {
    docAlias: 'date-picker',
    anchorBeforeProps: ['## API', '### WeekPicker'],
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
  Descriptions: {
    anchorBeforeProps: '### Descriptions',
    methods: [],
  },
  'Description.Item': {
    anchorBeforeProps: '### DescriptionItem',
    docAlias: 'descriptions',
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
    anchorBeforeProps: '## API',
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
    anchorBeforeProps: ['### Input.TextArea', '#### Input.Search'],
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
  'Layout.Sider': {
    docAlias: 'layout',
    anchorBeforeProps: '### Layout.Sider',
    methods: ['onCollapse', 'onBreakpoint'],
  },
  List: {
    anchorBeforeProps: '## API',
    methods: ['renderItem'],
  },
  Mention: {
    anchorBeforeProps: '### Mention',
    methods: ['getSuggestionContainer'],
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
  'Menu.SubMenu': {
    docAlias: 'menu',
    anchorBeforeProps: '### Menu.SubMenu',
    methods: ['onTitleClick'],
  },
  Message: {
    anchorBeforeProps: '## API',
    methods: ['onClose'],
  },
  Modal: {
    anchorBeforeProps: '## API',
    methods: ['getContainer', 'onCancel', 'onOk'],
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
    methods: ['onCancel', 'onConfirm', 'getPopupContainer', 'onVisibleChange'],
  },
  Progress: {
    anchorBeforeProps: '## API',
    methods: ['format'],
  },
  Radio: {
    anchorBeforeProps: '### Radio',
    methods: ['onCancel', 'onConfirm'],
  },
  'Radio.Group': {
    anchorBeforeProps: '### RadioGroup',
    methods: ['onChange'],
  },
  Rate: {
    anchorBeforeProps: '## API',
    methods: ['onBlur', 'onChange', 'onFocus', 'onHoverChange', 'onKeyDown'],
  },
  Select: {
    anchorBeforeProps: '### Select props',
    methods: [
      'dropdownRender',
      'filterOption',
      'getPopupContainer',
      'maxTagPlaceholder',
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
  Slider: {
    anchorBeforeProps: '## API',
    methods: ['tipFormatter', 'onAfterChange', 'onChange', 'getTooltipPopupContainer'],
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
    docAlias: 'tabs',
    anchorBeforeProps: '### Tabs',
    methods: [
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
    anchorBeforeProps: '### (.*)API',
    methods: ['title', 'getPopupContainer', 'onVisibleChange'],
  },
  Transfer: {
    anchorBeforeProps: '### Transfer',
    methods: [
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
    anchorBeforeProps: '### Typography.Text',
    methods: [],
  },
  'Typography.Title': {
    anchorBeforeProps: '### Typography.Title',
    methods: ['onChange'],
  },
  'Typography.Paragraph': {
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
