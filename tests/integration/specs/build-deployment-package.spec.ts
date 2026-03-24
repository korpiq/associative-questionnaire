import { existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { afterAll, expect } from 'vitest'

import { buildDeploymentPackage } from '../../../src/deploy/build-deployment-package'

const feature = await loadFeature('tests/integration/build-deployment-package.feature')

describeFeature(feature, ({ Scenario }) => {
  const createdWorkspaceDirectories: string[] = []
  let workspaceDirectory = ''
  let targetName = ''
  let result: ReturnType<typeof buildDeploymentPackage>

  const surveyJson = JSON.stringify(
    {
      title: 'Test survey',
      sections: {
        basics: {
          title: 'Basics',
          questions: {
            color: {
              title: 'Color',
              type: 'single-choice',
              content: { blue: 'Blue' }
            }
          }
        }
      }
    },
    null,
    2
  )

  function writeTemplates(): void {
    const templateDirectory = join(workspaceDirectory, 'deploy', 'templates')

    mkdirSync(templateDirectory, { recursive: true })
    writeFileSync(
      join(templateDirectory, 'save-survey.js'),
      '#!/usr/local/bin/node\nexport const kind = "save";\n'
    )
    writeFileSync(
      join(templateDirectory, 'report-survey.template.js'),
      '#!/usr/local/bin/node\nexport const kind = "report";\n'
    )
  }

  function writeSurvey(targetDirectory: string, surveyName: string): void {
    const surveyDirectory = join(targetDirectory, 'surveys', surveyName)

    mkdirSync(surveyDirectory, { recursive: true })
    writeFileSync(join(surveyDirectory, 'survey.json'), surveyJson)
    writeFileSync(join(surveyDirectory, 'template.html'), '{{> root}}')
  }

  function writeContainerTarget(name: string): void {
    const targetDirectory = join(workspaceDirectory, 'targets', name)

    mkdirSync(targetDirectory, { recursive: true })
    writeFileSync(
      join(targetDirectory, 'target.json'),
      JSON.stringify(
        {
          type: 'container',
          containerName: 'test-container',
          publicDir: '/app/surveys',
          cgiDir: '/app/cgi-bin',
          dataDir: '/app/data',
          baseUrl: 'https://example.test',
          staticUriPath: '/surveys',
          cgiUriPath: '/cgi-bin',
          nodeExecutable: '/usr/bin/node',
          cgiExtension: '.cgi'
        },
        null,
        2
      )
    )
    writeSurvey(targetDirectory, 'basic')
  }

  function writeSshTarget(name: string): void {
    const targetDirectory = join(workspaceDirectory, 'targets', name)

    mkdirSync(targetDirectory, { recursive: true })
    writeFileSync(
      join(targetDirectory, 'target.json'),
      JSON.stringify(
        {
          type: 'ssh',
          sshTarget: 'deploy@example.test',
          publicDir: 'sites/example.test/www/surveys',
          cgiDir: 'sites/example.test/www/cgi-bin',
          dataDir: 'sites/example.test/www/data',
          baseUrl: 'https://example.test',
          staticUriPath: '/surveys',
          cgiUriPath: '/cgi-bin',
          nodeExecutable: '/usr/bin/node',
          cgiExtension: '.cgi'
        },
        null,
        2
      )
    )
    writeSurvey(targetDirectory, 'basic')
  }

  function writeSshTargetWithContainerPaths(name: string): void {
    const targetDirectory = join(workspaceDirectory, 'targets', name)

    mkdirSync(targetDirectory, { recursive: true })
    writeFileSync(
      join(targetDirectory, 'target.json'),
      JSON.stringify(
        {
          type: 'ssh',
          sshTarget: 'deploy@example.test',
          publicDir: '/app/surveys',
          cgiDir: '/app/cgi-bin',
          dataDir: '/app/data',
          baseUrl: 'https://example.test',
          staticUriPath: '/surveys',
          cgiUriPath: '/cgi-bin',
          nodeExecutable: '/usr/bin/node',
          cgiExtension: '.cgi'
        },
        null,
        2
      )
    )
    writeSurvey(targetDirectory, 'basic')
  }

  function listFilesUnder(directory: string): string[] {
    const entries: string[] = []

    function recurse(dir: string): void {
      if (!existsSync(dir)) {
        return
      }

      readdirSync(dir).forEach((entry) => {
        const fullPath = join(dir, entry)

        if (statSync(fullPath).isDirectory()) {
          recurse(fullPath)
        } else {
          entries.push(relative(directory, fullPath))
        }
      })
    }

    recurse(directory)
    return entries.sort()
  }

  afterAll(() => {
    createdWorkspaceDirectories.forEach((directory) => {
      rmSync(directory, { recursive: true, force: true })
    })
  })

  Scenario('Absolute target paths write files under files/root', ({ Given, And, When, Then }) => {
    Given('an isolated workspace for v3 deployment package building', () => {
      workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-deploy-pkg-'))
      createdWorkspaceDirectories.push(workspaceDirectory)
      targetName = 'container-target'
    })

    And('the isolated workspace has a container target with absolute paths and one survey', () => {
      writeTemplates()
      writeContainerTarget(targetName)
    })

    When('I build the deployment package for that target', () => {
      result = buildDeploymentPackage({ workspaceDirectory, targetName })
    })

    Then('the deployment package has a public survey file under files/root', () => {
      expect(existsSync(join(result.filesRootDirectory, 'app', 'surveys', 'basic', 'index.html'))).toBe(true)
    })

    And('the deployment package has a CGI survey file under files/root', () => {
      expect(existsSync(join(result.filesRootDirectory, 'app', 'cgi-bin', 'basic', 'save.cgi'))).toBe(true)
    })

    And('the deployment package has a private survey file under files/root', () => {
      expect(existsSync(join(result.filesRootDirectory, 'app', 'data', 'basic', 'survey.json'))).toBe(true)
    })
  })

  Scenario('Relative target paths write files under files/home', ({ Given, And, When, Then }) => {
    Given('an isolated workspace for v3 deployment package building', () => {
      workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-deploy-pkg-'))
      createdWorkspaceDirectories.push(workspaceDirectory)
      targetName = 'ssh-target'
    })

    And('the isolated workspace has an SSH target with relative paths and one survey', () => {
      writeTemplates()
      writeSshTarget(targetName)
    })

    When('I build the deployment package for that target', () => {
      result = buildDeploymentPackage({ workspaceDirectory, targetName })
    })

    Then('the deployment package has a public survey file under files/home', () => {
      expect(
        existsSync(join(result.filesHomeDirectory, 'sites', 'example.test', 'www', 'surveys', 'basic', 'index.html'))
      ).toBe(true)
    })

    And('the deployment package has a CGI survey file under files/home', () => {
      expect(
        existsSync(join(result.filesHomeDirectory, 'sites', 'example.test', 'www', 'cgi-bin', 'basic', 'save.cgi'))
      ).toBe(true)
    })

    And('the deployment package has a private survey file under files/home', () => {
      expect(
        existsSync(join(result.filesHomeDirectory, 'sites', 'example.test', 'www', 'data', 'basic', 'survey.json'))
      ).toBe(true)
    })
  })

  Scenario(
    'SSH and container targets produce identical local file lists for the same paths',
    ({ Given, And, When, Then }) => {
      let sshFileList: string[] = []
      let containerFileList: string[] = []

      Given('an isolated workspace for v3 deployment package building', () => {
        workspaceDirectory = mkdtempSync(join(process.cwd(), '.test-deploy-pkg-'))
        createdWorkspaceDirectories.push(workspaceDirectory)
      })

      And('the isolated workspace has an SSH target with relative paths and one survey', () => {
        writeTemplates()
        writeSshTargetWithContainerPaths('ssh-target')
        writeContainerTarget('container-target')
      })

      When('I build the deployment package for that target', () => {
        result = buildDeploymentPackage({ workspaceDirectory, targetName: 'ssh-target' })
        sshFileList = listFilesUnder(join(result.packageDirectory, 'files'))
      })

      And(
        'I also build the deployment package for a container target with identical paths and the same survey',
        () => {
          const containerResult = buildDeploymentPackage({ workspaceDirectory, targetName: 'container-target' })

          containerFileList = listFilesUnder(join(containerResult.packageDirectory, 'files'))
        }
      )

      Then('both deployment packages contain the same relative file paths under files/', () => {
        expect(sshFileList).toEqual(containerFileList)
      })
    }
  )
})
