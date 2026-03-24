import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

const feature = await loadFeature('tests/integration/container-deployment.feature')

describeFeature(feature, ({ Scenario }) => {
  const imageTag = 'associative-survey:test'
  const containerName = 'associative-survey-test'
  const port = '18080'
  const targetName = 'container-integration'
  let saverResponseBody = ''
  let saverRedirectLocation = ''
  let deployScriptPath = ''
  const surveyUrls = {
    publicUrl: `http://127.0.0.1:${port}/surveys/survey/`,
    saveUrl: `http://127.0.0.1:${port}/cgi-bin/survey/save.cgi`,
    reportUrl: `http://127.0.0.1:${port}/cgi-bin/survey/report.cgi`
  }

  function runCommand(command: string, args: string[], input?: string): string {
    const result = spawnSync(command, args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      input
    })
    const output = `${result.stdout}${result.stderr}`

    if (result.status !== 0) {
      throw new Error(
        `Command failed: ${command} ${args.join(' ')}\n${output}`.trim()
      )
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

  async function postSaver(
    url: string,
    init?: RequestInit
  ): Promise<{ body: string; location: string | null }> {
    const response = await fetch(url, {
      ...init,
      redirect: 'manual'
    })
    const body = await response.text()

    if (response.status !== 303) {
      throw new Error(`Expected redirect response, got ${response.status} ${response.statusText}\n${body}`)
    }

    return {
      body,
      location: response.headers.get('location')
    }
  }

  function cleanupContainer(): void {
    spawnSync('docker', ['rm', '-f', containerName], {
      cwd: process.cwd(),
      encoding: 'utf8'
    })
    spawnSync('docker', ['rm', '-f', 'associative-survey-debug'], {
      cwd: process.cwd(),
      encoding: 'utf8'
    })
  }

  function cleanupTarget(): void {
    rmSync(join(process.cwd(), 'targets', targetName), { recursive: true, force: true })
    rmSync(join(process.cwd(), 'deploy', targetName), { recursive: true, force: true })
  }

  function writeIntegrationTarget(): void {
    const targetDirectory = join(process.cwd(), 'targets', targetName)

    mkdirSync(join(targetDirectory, 'surveys'), { recursive: true })
    writeFileSync(
      join(targetDirectory, 'target.json'),
      JSON.stringify(
        {
          type: 'container',
          containerName,
          publicDir: '/srv/www/surveys',
          cgiDir: '/srv/www/cgi-bin',
          dataDir: '/srv/www/data',
          baseUrl: 'http://127.0.0.1',
          port: Number(port),
          staticUriPath: '/surveys',
          cgiUriPath: '/cgi-bin',
          nodeExecutable: '/usr/local/bin/node',
          cgiExtension: '.cgi'
        },
        null,
        2
      )
    )
    cpSync(
      join(process.cwd(), 'targets', 'sample', 'surveys', 'survey'),
      join(targetDirectory, 'surveys', 'survey'),
      { recursive: true }
    )
  }

  afterAll(() => {
    cleanupContainer()
    cleanupTarget()
  })

  Scenario(
    'The prepared container image serves the sample survey and stores one response',
    ({ Given, When, Then, And }) => {
      Given('the sample container test resources are cleaned up', () => {
        saverResponseBody = ''
        saverRedirectLocation = ''
        deployScriptPath = ''
        cleanupContainer()
        cleanupTarget()
      })

      When('I build the project for the container deployment test', () => {
        runCommand('npm', ['run', 'build'])
      })

      And('I package the container integration deployment target', () => {
        writeIntegrationTarget()
        const result = JSON.parse(
          runCommand('node', ['--import', 'tsx', 'src/cli/package-target.ts', `targets/${targetName}`])
        )

        deployScriptPath = result.deployScriptPath as string
      })

      And('I build the sample container image', () => {
        runCommand('docker', ['build', '-t', imageTag, '.'])
      })

      And('I start the sample container', () => {
        cleanupContainer()
        runCommand('docker', ['run', '-d', '--name', containerName, '-p', `${port}:8080`, imageTag])
      })

      And('I deploy using the generated container integration deploy.sh', () => {
        runCommand('sh', [deployScriptPath])
      })

      Then('the sample survey page contains {string}', async (_ctx, expected) => {
        await waitForBodyContains(surveyUrls.publicUrl, expected)
      })

      When('I submit one survey response through the sample saver CGI', async () => {
        const response = await postSaver(surveyUrls.saveUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'favorite-color=blue&notes=Container+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D'
        })

        saverRedirectLocation = response.location ?? ''
        saverResponseBody = response.body
      })

      Then('the saver redirects to the generated success page', () => {
        expect(saverRedirectLocation).toBe(`${surveyUrls.publicUrl}ok.html`)
        expect(saverResponseBody).toBe('')
      })

      And('the sample report page contains {string}', async (_ctx, expected) => {
        const reportBody = await fetchBody(surveyUrls.reportUrl)
        expect(reportBody).toContain(expected)
      })
    }
  )
})
