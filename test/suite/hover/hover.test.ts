import assert from 'assert'
import vscode, { Position } from 'vscode'

import { buildFixtures } from '../fixture'
import { activateLS, FILE_LOAD_SLEEP_TIME, showFile, sleep } from '../helper'
import { findAllIndexInString } from '../utils'

describe('Should show hover on component', async () => {
  const fixturePaths = buildFixtures()
  const componentNames = Object.keys(fixturePaths)

  for (let index = 0; index < componentNames.length; index++) {
    const componentName = componentNames[index]
    const p = fixturePaths[componentName]

    await it('shows hover for component', async () => {
      // if (componentName !== 'Statistic') return

      await vscode.commands.executeCommand('workbench.action.closeEditorsInGroup')
      const docUri = vscode.Uri.file(p)
      await activateLS()
      await showFile(docUri)
      await sleep(FILE_LOAD_SLEEP_TIME)
      const editor = vscode!.window!.activeTextEditor
      const line = editor?.document.lineAt(6)
      const subCompCharacters = findAllIndexInString(line?.text!, '.').map(c => c + 1)
      subCompCharacters.push(5)
      await testComponentHover(docUri, componentName, subCompCharacters)
    })
  }
})

async function testComponentHover(docUri: vscode.Uri, componentName: string, columns: number[]) {
  try {
    await showFile(docUri)
    bypassSpecialCase(componentName, columns)
    let hasFlag = false

    for (let index = 0; index < columns.length; index++) {
      const column = columns[index]

      const result = (await vscode.commands.executeCommand(
        'vscode.executeHoverProvider',
        docUri,
        new Position(6, column)
      )) as vscode.Hover[]

      if (isHoverContainsFlag(result)) {
        hasFlag = true
      }
    }

    if (!hasFlag) {
      throw Error(`Hover failed - no component hover of "${componentName}"`)
    }

    assert.ok(true, `Hover succeed - "${componentName}"`)
  } catch (e) {
    throw Error(`Hover failed, encounter error - "${e}"`)
  }
}

function isHoverContainsFlag(hovers: vscode.Hover[]): boolean {
  return hovers.some(hover => {
    return hover.contents.some(content => {
      return (content as any).value.includes('文档')
    })
  })
}

function bypassSpecialCase(componentName: string, positions: number[]) {
  if (['Typography.Text', 'Typography.Title', 'Typography.Paragraph'].includes(componentName)) {
    // Typography is not a component
    positions.pop()
  }

  return
}
