require('coffee-script/register');

var requireDir = require('require-dir');

// Recursively require all tasks in ./gulp/tasks
requireDir('./gulp_tasks/tasks', {
  recurse: true
});
