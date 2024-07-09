/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Date: 2024-07-09T13:32:36+02:00
 * @Copyright: Technology Studio
**/

import * as yup from 'yup'
import { join } from 'path'

import { loadConfig } from '@txo/external-config'

test('should get profile value', () => {
  const cfg = loadConfig(
    '.example',
    yup.object({
      apiUrl: yup.string().url().required(),
      apiKey: yup.string().required(),
    }),
    process.cwd(),
    join(process.cwd(), '__tests__'),
  )

  const apiUrl = cfg.getProfileValue('test-username', (config) => config.apiUrl, (profile) => new Error(`No api key found for profile ${profile}`))
  expect(apiUrl).toBe('https://api.example.com')
})
