import gutil from 'gulp-util'
import notify from 'gulp-notify'

export default (err) => {
  gutil.log(err)
  gutil.beep()

  // Keep gulp from hanging on this task
  this.emit('end')
}
