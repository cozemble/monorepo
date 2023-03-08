export const config = {
  backendUrl: () => {
    const endpointType = localStorage.getItem('cozemble.config.endpoint') || 'prod'
    if (endpointType === 'local') {
      return 'http://localhost:3000'
    }
    return 'https://backend-tenanted-api-qwquwvrytq-nw.a.run.app'
  },
}
