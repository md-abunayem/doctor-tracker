export const getPagination = ({ page, limit }) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});


export const getPaginationData = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});