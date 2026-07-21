// Generic CRUD repository — the Repository Pattern layer sitting between
// services (business logic) and Mongoose models (data access). Every
// resource-specific repository extends this instead of re-implementing
// find/create/update/delete boilerplate.
class BaseRepository {
  constructor(model) {
    this.model = model
  }

  async create(data) {
    return this.model.create(data)
  }

  async findById(id, populate = []) {
    let query = this.model.findById(id)
    populate.forEach((p) => { query = query.populate(p) })
    return query
  }

  async findOne(filter = {}, populate = []) {
    let query = this.model.findOne(filter)
    populate.forEach((p) => { query = query.populate(p) })
    return query
  }

  async find(filter = {}, { sort = '-createdAt', skip = 0, limit = 20, populate = [] } = {}) {
    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit)
    populate.forEach((p) => { query = query.populate(p) })
    return query
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter)
  }

  async updateById(id, update, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, update, options)
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id)
  }

  async exists(filter) {
    return this.model.exists(filter)
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline)
  }
}

module.exports = BaseRepository
