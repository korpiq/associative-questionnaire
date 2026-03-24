import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { resolveSurveyUrlPort, resolveTargetSurveySettings } from '../../../src'

const feature = await loadFeature('tests/integration/ssh-deployment.feature')

describeFeature(feature, ({ Scenario }) => {
  const hostImage = 'associative-survey:ssh-host'
  const hostContainer = 'associative-survey-ssh-host'
  const targetName = 'ssh-integration'
  const sshPort = '2222'
  const httpPort = '18082'
  let testRoot = ''
  let targetDirectory = ''
  let saverResponseBody = ''
  let surveyUrls = {
    publicUrl: '',
    saveUrl: '',
    reportUrl: '',
    port: ''
  }

  function runCommand(command: string, args: string[], options?: { env?: NodeJS.ProcessEnv }): string {
    const result = spawnSync(command, args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: options?.env ?? process.env
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

  function cleanup(): void {
    spawnSync('docker', ['rm', '-f', hostContainer], {
      cwd: process.cwd(),
      encoding: 'utf8'
    })

    if (testRoot) {
      rmSync(testRoot, { recursive: true, force: true })
    }

    if (targetDirectory) {
      rmSync(targetDirectory, { recursive: true, force: true })
    }

    rmSync(join(process.cwd(), 'deploy', targetName), { recursive: true, force: true })
  }

  function writeTargetFiles(): void {
    mkdirSync(join(testRoot, 'keys'), { recursive: true })
    mkdirSync(join(testRoot, 'home', '.ssh'), { recursive: true })
    mkdirSync(join(targetDirectory, 'surveys'), { recursive: true })
    cpSync(join(process.cwd(), 'targets', 'sample', 'surveys', 'survey'), join(targetDirectory, 'surveys', 'survey'), {
      recursive: true
    })

    writeFileSync(
      join(targetDirectory, 'target.json'),
      JSON.stringify(
        {
          type: 'ssh',
          sshTarget: 'ssh-v3-test',
          publicDir: 'web-root/surveys',
          cgiDir: 'web-root/cgi-bin',
          dataDir: 'private-data',
          baseUrl: 'http://127.0.0.1',
          port: Number(httpPort),
          staticUriPath: '/surveys',
          cgiUriPath: '/cgi-bin',
          nodeExecutable: '/usr/local/bin/node',
          cgiExtension: '.cgi'
        },
        null,
        2
      )
    )
    const surveySettings = resolveTargetSurveySettings({
      workspaceDirectory: process.cwd(),
      targetName,
      surveyName: 'survey'
    })

    surveyUrls = {
      publicUrl: surveySettings.publicUrl,
      saveUrl: surveySettings.saveUrl,
      reportUrl: surveySettings.reportUrl,
      port: resolveSurveyUrlPort(surveySettings.publicUrl)
    }

    runCommand('ssh-keygen', ['-q', '-t', 'ed25519', '-N', '', '-f', join(testRoot, 'keys', 'id_ed25519')])
    runCommand('chmod', ['700', join(testRoot, 'home', '.ssh')])

    writeFileSync(
      join(testRoot, 'home', '.ssh', 'config'),
      [
        'Host ssh-v3-test',
        '  HostName 127.0.0.1',
        `  Port ${sshPort}`,
        '  User root',
        `  IdentityFile ${join(testRoot, 'keys', 'id_ed25519')}`,
        '  StrictHostKeyChecking no',
        '  UserKnownHostsFile /dev/null',
        ''
      ].join('\n')
    )

    runCommand('chmod', ['600', join(testRoot, 'home', '.ssh', 'config')])
    cpSync(join(testRoot, 'keys', 'id_ed25519.pub'), join(testRoot, 'authorized_keys'))
  }

  function writeHostDockerfile(): void {
    writeFileSync(
      join(testRoot, 'Dockerfile'),
      [
        'FROM node:20-alpine',
        '',
        'RUN apk add --no-cache openssh-server busybox-extras tar',
        'RUN mkdir -p /root/.ssh /root/web-root/surveys /root/web-root/cgi-bin /root/private-data /var/run/sshd',
        'COPY authorized_keys /root/.ssh/authorized_keys',
        'RUN chmod 700 /root/.ssh \\',
        '  && chmod 600 /root/.ssh/authorized_keys',
        'RUN ssh-keygen -A',
        "RUN printf '%s\\n' \\",
        "  'PasswordAuthentication no' \\",
        "  'PermitRootLogin yes' \\",
        "  'PubkeyAuthentication yes' \\",
        "  'AuthorizedKeysFile .ssh/authorized_keys' \\",
        '  > /etc/ssh/sshd_config.d/test.conf',
        '',
        'EXPOSE 22 8080',
        '',
        'CMD ["/bin/sh", "-lc", "/usr/sbin/sshd && exec httpd -f -p 8080 -h /root/web-root"]',
        ''
      ].join('\n')
    )
  }

  afterAll(() => {
    cleanup()
  })

  Scenario('A survey is deployed over SSH and works from the remote host', ({ Given, And, When, Then }) => {
    Given('the SSH deployment test resources are cleaned up', () => {
      saverResponseBody = ''
      testRoot = join(process.cwd(), '.test-ssh-deployment')
      targetDirectory = join(process.cwd(), 'targets', targetName)
      cleanup()
    })

    And('the SSH deployment test workspace and target are prepared', () => {
      writeTargetFiles()
    })

    And('the SSH deployment test host container image is prepared', () => {
      writeHostDockerfile()
      runCommand('docker', ['build', '-t', hostImage, testRoot])
    })

    When('I start the SSH deployment test host container', () => {
      runCommand('docker', [
        'run',
        '-d',
        '--name',
        hostContainer,
        '-p',
        `${surveyUrls.port}:8080`,
        '-p',
        `${sshPort}:22`,
        hostImage
      ])
    })

    And('I package and deploy the SSH integration target using the generated deploy.sh', () => {
      runCommand('node', ['--import', 'tsx', 'src/cli/package-target.ts', `targets/${targetName}`])
      runCommand(
        'sh',
        [join(process.cwd(), 'deploy', targetName, 'deploy.sh')],
        {
          env: {
            ...process.env,
            ASSOCIATIVE_SURVEY_SSH_CONFIG: join(testRoot, 'home', '.ssh', 'config')
          }
        }
      )
    })

    Then('the deployed SSH survey page contains {string}', async (_ctx, expected) => {
      await waitForBodyContains(surveyUrls.publicUrl, expected)
    })

    When('I submit one survey response through the deployed SSH saver CGI', async () => {
      saverResponseBody = await fetchBody(surveyUrls.saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: 'associativeSurveyRespondentId=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        },
        body: 'favorite-color=blue&notes=SSH+note&matches=%5B%7B%22left%22%3A%221%22%2C%22right%22%3A%22A%22%7D%5D'
      })
    })

    Then('the deployed SSH saver response contains {string}', (_ctx, expected) => {
      expect(saverResponseBody).toContain(expected)
    })

    And('the deployed SSH report page contains {string}', async (_ctx, expected) => {
      const reportBody = await waitForBodyContains(surveyUrls.reportUrl, expected)

      expect(reportBody).toContain(expected)
    })

    And('the deployed SSH host has the public survey file', () => {
      runCommand('docker', ['exec', hostContainer, 'test', '-f', '/root/web-root/surveys/survey/index.html'])
    })

    And('the deployed SSH host has the saver CGI file', () => {
      runCommand('docker', ['exec', hostContainer, 'test', '-f', '/root/web-root/cgi-bin/survey/save.cgi'])
    })

    And('the deployed SSH host has the private survey file', () => {
      runCommand('docker', ['exec', hostContainer, 'test', '-f', '/root/private-data/survey/survey.json'])
    })
  })
})
