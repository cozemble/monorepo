export function getQueryParams(url: string): { [key: string]: string } {
  const queryParams: { [key: string]: string } = {}
  const anchor = document.createElement('a')
  anchor.href = url
  const queryStrings = anchor.search.substring(1)
  const params = queryStrings.split('&')

  for (let i = 0; i < params.length; i++) {
    const pair = params[i].split('=')
    queryParams[pair[0]] = decodeURIComponent(pair[1])
  }
  return queryParams
}
