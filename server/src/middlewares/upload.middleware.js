const multer = require('multer')
const ApiError = require('../utils/ApiError')

const storage = multer.memoryStorage()

const fileFilter = (allowed) => (req, file, cb) => {
  if (allowed.some((type) => file.mimetype.startsWith(type))) return cb(null, true)
  cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`), false)
}

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['image/']),
})

const audioUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: fileFilter(['audio/']),
})

// DM attachments: images render inline, anything else (pdf, docs, zips...)
// is stored as a generic file. 15MB cap keeps chat snappy.
const attachmentUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
})

module.exports = { imageUpload, audioUpload, attachmentUpload }
