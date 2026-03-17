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

function renderRedirectPage(location: string): string {
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<title>Redirecting</title>',
    `<meta http-equiv="refresh" content="0;url=${escapeHtml(location)}">`,
    '</head>',
    '<body>',
    `<p>Redirecting to <a href="${escapeHtml(location)}">${escapeHtml(location)}</a>.</p>`,
    '</body>',
    '</html>'
  ].join('')
}

export function renderSaverCgiResponse(input: {
  success: boolean
  message?: string
  ok?: string
  fail?: string
  css?: string
}): {
  statusCode: number
  headers: Record<string, string>
  body: string
} {
  if (input.success && input.ok) {
    return {
      statusCode: 303,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        Location: input.ok
      },
      body: renderRedirectPage(input.ok)
    }
  }

  if (!input.success && input.fail) {
    return {
      statusCode: 303,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        Location: input.fail
      },
      body: renderRedirectPage(input.fail)
    }
  }

  if (input.success) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      },
      body: renderHtmlPage({
        title: 'Survey saved',
        message: input.message ?? 'Your answers have been stored.',
        ...(input.css ? { css: input.css } : {})
      })
    }
  }

  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    },
    body: renderHtmlPage({
      title: 'Survey save failed',
      message: input.message ?? 'Your answers could not be stored.',
      ...(input.css ? { css: input.css } : {})
    })
  }
}
