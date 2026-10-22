export const notFound = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) return next(err);

  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  const message = status === 500 ? 'Something went wrong. Please try again.' : err.message;

  return res.status(status).json({ message });
};
