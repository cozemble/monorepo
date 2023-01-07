export function getQueryParams(url: string): { [key: string]: string } {
  let queryParams: { [key: string]: string } = {}
  let anchor = document.createElement('a')
  anchor.href = url
  let queryStrings = anchor.search.substring(1)
  let params = queryStrings.split('&')

  for (let i = 0; i < params.length; i++) {
    let pair = params[i].split('=')
    queryParams[pair[0]] = decodeURIComponent(pair[1])
  }
  return queryParams
}
