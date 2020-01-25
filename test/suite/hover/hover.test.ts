import assert from 'assert'
import fs from 'fs'
import vscode from 'vscode'

import { readComponentMapping, buildFixtures } from '../fixture'
import { activateLS, FILE_LOAD_SLEEP_TIME, showFile, sleep } from '../helper'
import { buildJsxTemplate, getDocUri, position, sameLineRange } from '../utils'

describe('Should do hover', () => {
  const fixturePaths = buildFixtures()
  console.log(fixturePaths)

  fixturePaths.forEach(p => {
    // for (let index = 0; index < fixturePaths.length; index++) {
    // const p = fixturePaths[index]
    const docUri = vscode.Uri.file(p)

    // before('activate', async () => {
    // })

    it('shows hover for component', async () => {
      await activateLS()
      await showFile(docUri)
      await sleep(FILE_LOAD_SLEEP_TIME)
      console.log('🐲')
      await testHover(docUri, position(6, 3), {
        contents: ['An img element represents an image\\.'],
        range: sameLineRange(6, 3, 10),
      })
    })
    // }
  })
})

async function testHover(
  docUri: vscode.Uri,
  position: vscode.Position,
  expectedHover: vscode.Hover
) {
  await showFile(docUri)

  const result = (await vscode.commands.executeCommand(
    'vscode.executeHoverProvider',
    docUri,
    position
  )) as vscode.Hover[]

  if (!result[0]) {
    throw Error('Hover failed')
  }

  const contents = result[0].contents
  contents.forEach((c, i) => {
    const val = (c as any).value
    assert.equal(val, expectedHover.contents[i])
  })

  if (result[0] && result[0].range) {
    assert.ok(result[0].range!.isEqual(expectedHover.range!))
  }
}
