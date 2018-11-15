const stringify = require('json-stringify-safe')

class Error {
  constructor() {
  }

  /**
   * Wrapper for middleware and handlers for routes which wrap calls in a try/catch to ensure all errors are caught and handled
   * @param {*} callback The function to handle middeware/handler functions
   */
  handleErrorsFor(callback) {
    return (req, res, next) => {
      try {
        callback(req, res, next)
      }
      catch(err) {
        this.handleError(req, res, err)
      }
    }
  }

  /**
   * Handler exceptions by logging and returning errors
   * @param {*} err
   */
  handleError(req, res, err) {
    const errorMessage = `Request to ${req.path} has thrown an unhandled exception.`
    const errorString = typeof(err) === 'object' ? stringify(err, null, '\t') : err
    const contentType = req.headers['Content-Type']
    console.error(`${errorMessage}. Error = ${errorString}`)
    console.trace()
    res.setHeader('Content-Type', contentType ? contentType : 'application/json');
    res.status(500).send(stringify({
      error: errorMessage,
      exception: err.message || err,
      stack: err.stack || [],
      type: 'UNHANDLED_EXCEPTION'
    }))
  }
}

module.exports = Error
