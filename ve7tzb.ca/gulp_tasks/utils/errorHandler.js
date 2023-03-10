export default function(err) {
  // Send error to notification center with gulp-notify
  console.error(err.message, `\n  Filename: ${err.fileName}`)

  // Keep gulp from hanging on this task
  this.emit('end')
}
