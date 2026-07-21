const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const searchService = require('../services/search.service')

const search = asyncHandler(async (req, res) => res.json(new ApiResponse(200, await searchService.globalSearch(req.query.q, Number(req.query.limit) || 6))))

module.exports = { search }
