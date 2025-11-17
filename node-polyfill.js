// Полифилл для os.availableParallelism для старых версий Node.js
const os = require('os');

if (!os.availableParallelism) {
  os.availableParallelism = function() {
    return os.cpus().length;
  };
}
