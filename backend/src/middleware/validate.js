import ApiError from "../utils/apiError.js";

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new ApiError(message, 400);
    }
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      throw new ApiError(message, 400);
    }
    next();
  };
};
