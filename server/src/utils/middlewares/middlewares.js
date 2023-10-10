const errorHandler = (error, req, res, next) => {
  console.log(`Status code: ${error.statusCode || 500}, Error message: ${error.message}, Url: ${req.url}, Method: ${req.method}`);
  res.status(error.statusCode || 500).json({message: error.message || 'Internal server error'});
}

module.exports = {
  errorHandler
}
