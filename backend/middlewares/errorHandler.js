module.exports = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'An internal server error occurred',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  };
  