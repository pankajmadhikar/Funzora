// pagination.js

const paginate = async (model, query, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const results = await model.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    return results;
  } catch (error) {
    throw new Error(`Pagination error: ${error.message}`);
  }
};

module.exports = paginate;
