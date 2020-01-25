import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vscode from 'vscode'

import { getDocUri, position, buildJsxTemplate, sameLineRange } from '../utils'
import { activateLS, showFile, FILE_LOAD_SLEEP_TIME, sleep } from '../helper'

describe('Should do hover', () => {
  const docUri = getDocUri('app.jsx')

  before('activate', async () => {
    await activateLS()
    await showFile(docUri)
    await sleep(FILE_LOAD_SLEEP_TIME)
  })

  it('shows hover for <img> tag', async () => {
    await testHover(docUri, position(67, 7), {
      contents: ['An img element represents an image\\.'],
      range: sameLineRange(67, 7, 10),
    })
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
