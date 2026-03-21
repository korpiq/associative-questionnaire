import { spawnSync } from 'node:child_process'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

const feature = await loadFeature('tests/integration/cookie-based-container-deployment.feature')

describeFeature(feature, ({ Scenario }) => {
  const imageTag = 'associative-survey:integration'
  const containerName = 'associative-survey-integration'
  const port = '18081'
  let saverResponseBody = ''

  function runCommand(command: string, args: string[], input?: string): string {
    const result = spawnSync(command, args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      input
    })
    const output = `${result.stdout}${result.stderr}`

    if (result.status !== 0) {
      throw new Error(`Command failed: ${command} ${args.join(' ')}\n${output}`.trim())
    }

    return output.trim()
  }

  async function waitForBodyContains(url: string, expected: string): Promise<string> {
    let lastBody = ''

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await fetch(url)

      if (response.ok) {
        lastBody = await response.text()
        if (lastBody.includes(expected)) {
          return lastBody
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    throw new Error(`Expected ${url} to contain "${expected}", but last body was:\n${lastBody}`)
  }

  async function fetchBody(url: string, init?: RequestInit): Promise<string> {
    const response = await fetch(url, init)
    const body = await response.text()

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}\n${body}`)
    }

    return body
  }

  function cleanupContainer(): void {
    spawnSync('docker', ['rm', '-f', containerName], {
      cwd: process.cwd(),
      encoding: 'utf8'
    })
  }

  afterAll(() => {
    cleanupContainer()
  })

  Scenario(
    'The prepared container image reports zero respondents, saves one cookie-identified response, and reports one respondent',
    ({ Given, When, Then, And }) => {
      Given('the cookie-based container test resources are cleaned up', () => {
        saverResponseBody = ''
        cleanupContainer()
      })

      When('I build the project for the cookie-based container deployment test', () => {
        runCommand('npm', ['run', 'build'])
      })

      And('I prepare container assets for the sample target for the cookie-based container deployment test', () => {
        runCommand('npm', ['run', 'prepare:container'])
      })

      And('I build the cookie-based sample container image', () => {
        runCommand('docker', ['build', '-t', imageTag, '.'])
      })

      And('I start the cookie-based sample container', () => {
        cleanupContainer()
        runCommand('docker', ['run', '-d', '--name', containerName, '-p', `${port}:8080`, imageTag])
      })

      Then('the cookie-based sample survey page contains {string}', async (_ctx, expected) => {
        await waitForBodyContains(`http://127.0.0.1:${port}/surveys/survey/`, expected)
      })

      And('the cookie-based sample report page contains {string}', async (_ctx, expected) => {
        const reportBody = await waitForBodyContains(
          `http://127.0.0.1:${port}/cgi-bin/survey/report.cgi`,
          expected
        )

        expect(reportBody).toContain(expected)
      })

      When('I submit one cookie-identified survey response through the sample saver CGI', async () => {
        saverResponseBody = await fetchBody(`http://127.0.0.1:${port}/cgi-bin/survey/save.cgi`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: 'associativeSurveyRespondentId=11111111111111111111111111111111'
          },
          body: 'favorite-color=blue&notes=First+survey+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D'
        })
      })

      Then('the cookie-based saver response contains {string}', (_ctx, expected) => {
        expect(saverResponseBody).toContain(expected)
      })

      And('the cookie-based sample report page later contains {string}', async (_ctx, expected) => {
        const reportBody = await waitForBodyContains(
          `http://127.0.0.1:${port}/cgi-bin/survey/report.cgi`,
          expected
        )

        expect(reportBody).toContain(expected)
      })
    }
  )
})
