/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2023-12-05T08:12:43+01:00
 * @Copyright: Technology Studio
 */

import fs from 'fs'
import path from 'path'
import { Log } from '@txo/log'

const log = new Log('txo.external-config.Api.GetRc')

const getHomePath = (): string | undefined => process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']

const parseConfigFile = <CONFIG extends Record<string, unknown>>(file: string): CONFIG | null => {
  try {
    return JSON.parse(file) as CONFIG
  } catch (e) {
    log.error('parseConfigFile', e)
    return null
  }
}

const getConfigInDir = <CONFIG extends Record<string, unknown>>(dir: string, configFileName: string): CONFIG | null => {
  let config: CONFIG | null = null

  try {
    const fileName = path.join(dir, configFileName, 'config.json')
    const file = fs.readFileSync(fileName, 'utf8')
    config = parseConfigFile(file)
  } catch (e) {
    // no config present
  }
  return config
}

const walkUpTree = (startDir: string, endDir: string, callback: (path: string) => void): void => {
  let currentDir = startDir

  while (true) {
    callback(currentDir)
    currentDir = path.join(currentDir, '..')
    if (currentDir === endDir) {
      break
    }
  }
}

export const getConfigMap = <CONFIG extends Record<string, unknown>>(
  dir: string = process.cwd(),
  topDir = '/',
  configFileName: string,
): CONFIG | null => {
  walkUpTree(dir, topDir, (currentDir) => {
    const _config = getConfigInDir<CONFIG>(currentDir, configFileName)
    if (_config != null) {
      return _config
    }
  })
  const homePath = getHomePath()
  if (homePath != null && homePath !== '') {
    const _config = getConfigInDir<CONFIG>(homePath, configFileName)
    if (_config != null) {
      return _config
    }
  }

  return null
}
