import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file, folder = 'chatwave') {
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'auto',
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  }
}

export async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

export default cloudinary
