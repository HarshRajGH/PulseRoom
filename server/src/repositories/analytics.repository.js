const BaseRepository = require('./BaseRepository')
const { Analytics } = require('../models')

class AnalyticsRepository extends BaseRepository {
  constructor() { super(Analytics) }

  upsertDaily(scope, refId, date, increments) {
    return this.model.findOneAndUpdate(
      { scope, refId, date },
      { $inc: increments },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )
  }

  rangeFor(scope, refId, fromDate, toDate) {
    return this.model.find({ scope, refId, date: { $gte: fromDate, $lte: toDate } }).sort('date')
  }
}

module.exports = new AnalyticsRepository()
