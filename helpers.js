module.exports.required = function (argumentNames) {
  return function (req, res, next) {
    if (typeof argumentNames !== 'object') {
      argumentNames = [argumentNames]
    }
    for (var argumentName in argumentName) {
      if (!req.body[argumentName]) {
        res.send(500, 'Missing argument ' + argumentName)
      }
    }
    next()
  }
}

module.exports.respondWithError = function (res, error) {
  return function () {
    res.send(500, error)
  }
}

module.exports.respondWithResult = function (res) {
  return function (result) {
    res.send(result)
  }
}
