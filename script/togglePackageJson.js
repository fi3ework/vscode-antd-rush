const { write } = require('edit-package')

const mapping = {
  tsc: 'out',
  wp: 'dist',
}

async function toggle() {
  await write({ main: `./${mapping[process.env.VSC_BUILDER]}/extension.js` })
}

toggle()
