const validate = (schema, property = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[property], { abortEarly: false });
  if (error) {
    return res.status(400).json({
      status: 'failed',
      message: error.details.map((d) => d.message).join(', '),
    });
  }
  next();
};

module.exports = validate;
