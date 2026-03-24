function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderHtmlPage(input: {
  title: string
  message: string
  css?: string
}): string {
  const cssLink = input.css
    ? `<link rel="stylesheet" href="${escapeHtml(input.css)}">`
    : ''

  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    `<title>${escapeHtml(input.title)}</title>`,
    cssLink,
    '</head>',
    '<body>',
    `<h1>${escapeHtml(input.title)}</h1>`,
    `<p>${escapeHtml(input.message)}</p>`,
    '</body>',
    '</html>'
  ].join('')
}

export function renderSaverResultPage(input: {
  success: boolean
  message?: string
  css?: string
}): string {
  return renderHtmlPage({
    title: input.success ? 'Survey saved' : 'Survey save failed',
    message: input.message ?? (
      input.success ? 'Your answers have been stored.' : 'Your answers could not be stored.'
    ),
    ...(input.css ? { css: input.css } : {})
  })
}

export function renderSaverCgiResponse(input: {
  success: boolean
  message?: string
  ok?: string
  fail?: string
  setCookieHeader?: string
}): {
  statusCode: number
  headers: Record<string, string>
  body: string
} {
  if (input.success) {
    if (!input.ok) {
      throw new Error('Successful saver responses must include ok')
    }

    return {
      statusCode: 303,
      headers: {
        Location: input.ok,
        ...(input.setCookieHeader ? { 'Set-Cookie': input.setCookieHeader } : {})
      },
      body: ''
    }
  }

  if (!input.fail) {
    throw new Error('Failed saver responses must include fail')
  }

  return {
    statusCode: 303,
    headers: {
      Location: input.fail
    },
    body: ''
  }
}
