import gulp from 'gulp'
import browsersync from 'browser-sync'
import ngrok from 'ngrok'

import config from '../config/dev'

export const server = browsersync.create()

gulp.task('browser_sync', () => {
  const bsOptions = Object.assign({}, config.browsersync, {
    callbacks: {
      ready: async (err, bs) => {
        const url = await ngrok.connect(bs.options.get('port'))
        console.log(`Your ngrok URL is: ${url}`)
      }
    }
  })
  server.init(bsOptions)
})
