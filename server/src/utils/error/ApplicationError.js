class ApplicationError extends Error {
  constructor(statusCode, message) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.message = message;
    Error.captureStackTrace(this);
  }
}

module.exports = ApplicationError;
