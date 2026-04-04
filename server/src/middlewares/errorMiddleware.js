const errorHandler = (err, req, res, next) => {
  // always log the full error server-side
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  // normalise to a plain object we'll shape before sending
  let statusCode = err.statusCode ?? err.status ?? 500;
  let message = err.message || "Server Error";
  let code = err.code || "INTERNAL_ERROR";

  
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
    code = "INVALID_ID";
  }

  // Mongoose: schema validation failed 
  else if (err.name === "ValidationError") {
    statusCode = 422;
    code = "VALIDATION_ERROR";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // MongoDB: duplicate key (e.g. email already exists) 
  else if (err.name === "MongoServerError" && err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    message = `${field} already exists`;
  }

  // JWT: token malformed or signature invalid
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid token";
  }

  // JWT: token has expired
  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Token has expired";
  }

  const body = { code, message };

  // only include stack trace in development — never expose it in production
  if (process.env.NODE_ENV === "development") {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = errorHandler;