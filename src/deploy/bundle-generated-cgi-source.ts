import { buildSync, type BuildOptions } from 'esbuild'
import { resolve } from 'node:path'

function splitShebang(source: string): {
  shebang: string
  body: string
} {
  if (!source.startsWith('#!')) {
    return {
      shebang: '',
      body: source
    }
  }

  const newlineIndex = source.indexOf('\n')
  if (newlineIndex === -1) {
    return {
      shebang: source,
      body: ''
    }
  }

  return {
    shebang: source.slice(0, newlineIndex),
    body: source.slice(newlineIndex + 1)
  }
}

export function bundleGeneratedCgiSource(source: string): string {
  const { shebang, body } = splitShebang(source)
  const options: BuildOptions = {
    stdin: {
      contents: body,
      resolveDir: resolve(process.cwd(), 'src', 'deploy'),
      sourcefile: 'generated-cgi-entry.ts'
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    target: 'node20'
  }

  if (shebang) {
    options.banner = { js: shebang }
  }

  const result = buildSync(options)

  const output = result.outputFiles?.[0]?.text
  if (!output) {
    throw new Error('Expected esbuild to produce one bundled CGI output')
  }

  return output
}
