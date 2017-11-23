import gulp from 'gulp'
import browsersync from 'browser-sync'
import ngrok from 'ngrok'

import config from '../config/dev'

gulp.task('browser-sync', () => {
  browsersync(
    config.browsersync,
    (err, bs) => {
      ngrok.connect(
        bs.options.get('port'),
        (err, url) => {
          console.log(`Your ngrok URL is: ${url}`)
        }
      )
    }
  )
})
