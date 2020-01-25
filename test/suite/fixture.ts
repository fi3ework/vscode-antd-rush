import fs from 'fs'
import path from 'path'

export const FIXTURE_DIR = path.resolve(__dirname, '../fixture')

export type PropsMap = { [prop in string]: Object }

export type ComponentMap = {
  [com in string]: PropsMap
}

export function buildFixtures(): string[] {
  if (!fs.existsSync(FIXTURE_DIR)) fs.mkdirSync(FIXTURE_DIR)

  const mapping = readComponentMapping()

  Object.entries(mapping).forEach(([componentName, componentData]) => {
    const importComponent = componentName.split('.')[0]
    const fixtureName = componentName.replace(/\./, '-')
    const componentStr = fixtureTemplate(importComponent, componentName, componentData)
    fs.writeFileSync(path.resolve(FIXTURE_DIR, `${fixtureName}.jsx`), componentStr)
  })

  return getFixtures()
}

function fixtureTemplate(importComponent: string, component: string, props: PropsMap): string {
  const propsStr = Object.entries(props)
    .map(([propName, propData]) => `\n    ${propName}={}`)
    .join('')
  return `import React from 'react'
import {${importComponent}} from 'antd'
// component at Position(5, 3)
// props at Position(6+, 5)
const App = () => {
  return
  <${component}${propsStr}
  />
}
`
}

export function readComponentMapping(): ComponentMap {
  const mapping = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../src/definition.json'), 'utf-8')
  )
  const zhMapping = mapping.zh
  return zhMapping
}

export function getFixtures(): string[] {
  const componentFixtures = fs.readdirSync(FIXTURE_DIR)
  return componentFixtures.map(c => path.resolve(FIXTURE_DIR, c))
}

buildFixtures()
