import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });
 
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.slice(1).join("."),
      message: issue.message,
    }));
    return next(new ApiError(400, "Validation failed", errors));
  }
 
  const { body, params, query } = result.data;
  if (body) req.body = body;
  if (params) req.params = params;
  if (query) req.validatedQuery = query;

  next();
};