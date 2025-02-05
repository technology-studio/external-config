/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2023-12-05T08:12:43+01:00
 * @Copyright: Technology Studio
 */

import fs from 'fs'
import path from 'path'
import { Log } from '@txo/log'

import { type ConfigMap } from '../Model/Types'

const log = new Log('txo.external-config.Api.GetRc')

const getHomePath = (): string | undefined => process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']

const parseConfigFile = (file: string): ConfigMap | null => {
  try {
    return JSON.parse(file) as ConfigMap
  } catch (e) {
    log.error('parseConfigFile', e)
    return null
  }
}

const getConfigInDir = (dir: string, configFileName: string): ConfigMap | null => {
  let config: ConfigMap | null = null

  try {
    const fileName = path.join(dir, configFileName, 'config.json')
    const file = fs.readFileSync(fileName, 'utf8')
    config = parseConfigFile(file)
  } catch (e) {
    throw new Error(`Failed to read config file ${dir}/${configFileName}`)
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

export const getConfigMap = (
  dir: string = process.cwd(),
  topDir = '/',
  configFileName: string,
): ConfigMap | null => {
  let configMap: ConfigMap | null = null
  walkUpTree(dir, topDir, (currentDir) => {
    const _config = getConfigInDir(currentDir, configFileName)
    if (_config != null) {
      configMap = _config
    }
  })
  if (configMap != null) {
    return configMap
  }
  const homePath = getHomePath()
  if (homePath != null && homePath !== '') {
    const _config = getConfigInDir(homePath, configFileName)
    if (_config != null) {
      return _config
    }
  }

  return null
}
