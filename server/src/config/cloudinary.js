const cloudinary = require('cloudinary').v2
const env = require('./env')

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
})

async function uploadBuffer(buffer, folder = 'syncwave', resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => (error ? reject(error) : resolve(result)),
    )
    stream.end(buffer)
  })
}

async function destroyAsset(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

module.exports = { cloudinary, uploadBuffer, destroyAsset }
