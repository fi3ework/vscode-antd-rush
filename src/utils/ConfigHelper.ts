import { ensureFile, ensureFileSync, readJsonSync, writeJsonSync } from 'fs-extra'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { ExtensionContext, workspace } from 'vscode'
import merge from 'lodash.merge'

import { ResourceVersion } from '../types'

interface WorkspaceConfig {
  antdVersion: ResourceVersion
}

const DEFAULT_CONFIG: WorkspaceConfig = {
  antdVersion: 'v3',
}

type WorkspacesConfig = Record<string, WorkspaceConfig>

class ConfigHelper {
  private filename = 'workspaces.json'
  private filePath: string

  public constructor(context: ExtensionContext) {
    const storagePath = context.globalStoragePath
    this.filePath = path.join(storagePath, this.filename)
    this.initStorageFile()
  }

  public getConfig(workspacePath: string): WorkspaceConfig {
    const config: WorkspacesConfig = readJsonSync(this.filePath)
    return merge(DEFAULT_CONFIG, config[workspacePath])
  }

  public getCurrConfig(): WorkspaceConfig {
    // TODO: when will the rootPath be undefined?
    const workspacePath = workspace.rootPath || ''
    return this.getConfig(workspacePath)
  }

  public setConfig(workspacePath: string, configPatch: WorkspaceConfig) {
    const config: WorkspacesConfig = readJsonSync(this.filePath)
    writeJsonSync(
      this.filePath,
      merge(config, {
        [workspacePath]: configPatch,
      }),
      {
        spaces: 4,
      }
    )
  }

  public setCurrConfig(configPatch: WorkspaceConfig) {
    const workspacePath = workspace.rootPath || ''
    return this.setConfig(workspacePath, configPatch)
  }

  private initStorageFile() {
    if (!fs.existsSync(this.filePath)) {
      writeJsonSync(this.filePath, {})
    }
  }
}

export { ConfigHelper }
