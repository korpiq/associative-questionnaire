import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

function padToTarBlock(buffer: Buffer): Buffer {
  const remainder = buffer.length % 512

  if (remainder === 0) {
    return buffer
  }

  return Buffer.concat([buffer, Buffer.alloc(512 - remainder)])
}

function writeTarHeader(input: {
  name: string
  mode: number
  size: number
  mtime: number
  typeflag: '0' | '5'
}): Buffer {
  const header = Buffer.alloc(512, 0)
  const writeText = (value: string, offset: number, length: number) => {
    header.write(value.slice(0, length), offset, length, 'utf8')
  }
  const writeOctal = (value: number, offset: number, length: number) => {
    const encoded = value.toString(8).padStart(length - 1, '0')

    writeText(`${encoded}\0`, offset, length)
  }

  writeText(input.name, 0, 100)
  writeOctal(input.mode, 100, 8)
  writeOctal(0, 108, 8)
  writeOctal(0, 116, 8)
  writeOctal(input.size, 124, 12)
  writeOctal(input.mtime, 136, 12)
  writeText('        ', 148, 8)
  writeText(input.typeflag, 156, 1)
  writeText('ustar', 257, 6)
  writeText('00', 263, 2)

  let checksum = 0
  for (const byte of header.values()) {
    checksum += byte
  }

  writeText(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8)

  return header
}

export function createTarGzFromDirectory(input: {
  sourceDirectory: string
  tarballPath: string
}): void {
  const buffers: Buffer[] = []
  mkdirSync(resolve(input.tarballPath, '..'), { recursive: true })

  function appendEntry(absolutePath: string, relativePath: string): void {
    const stats = statSync(absolutePath)
    const tarPath = relativePath.startsWith('./') ? relativePath : `./${relativePath}`

    if (stats.isDirectory()) {
      const directoryPath = tarPath.endsWith('/') ? tarPath : `${tarPath}/`

      buffers.push(
        writeTarHeader({
          name: directoryPath,
          mode: 0o755,
          size: 0,
          mtime: Math.floor(stats.mtimeMs / 1000),
          typeflag: '5'
        })
      )

      readdirSync(absolutePath)
        .sort((left, right) => left.localeCompare(right))
        .forEach((entry) => {
          appendEntry(join(absolutePath, entry), `${relativePath}/${entry}`)
        })
      return
    }

    const fileContents = readFileSync(absolutePath)

    buffers.push(
      writeTarHeader({
        name: tarPath,
        mode: stats.mode & 0o777,
        size: fileContents.length,
        mtime: Math.floor(stats.mtimeMs / 1000),
        typeflag: '0'
      }),
      padToTarBlock(fileContents)
    )
  }

  readdirSync(input.sourceDirectory)
    .sort((left, right) => left.localeCompare(right))
    .forEach((entry) => {
      appendEntry(join(input.sourceDirectory, entry), entry)
    })

  buffers.push(Buffer.alloc(1024, 0))
  writeFileSync(input.tarballPath, gzipSync(Buffer.concat(buffers)))
}
