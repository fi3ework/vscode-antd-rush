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
    methods: [''],
  },
  'Description.Item': {
    anchorBeforeProps: '### DescriptionItem',
    docAlias: 'descriptions',
    methods: [''],
  },
  Divider: {
    anchorBeforeProps: '## API',
    methods: [''],
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
    methods: [''],
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
    methods: [''],
  },
  Icon: {
    anchorBeforeProps: '## API',
    methods: [''],
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
}
