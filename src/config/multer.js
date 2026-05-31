// src/config/multer.js
// Upload des photos vers Cloudinary

const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const limits = {
  fileSize: 15 * 1024 * 1024,
  files:    10,
};

const limitsConfig = {
  maxFileMb: Math.round(limits.fileSize / (1024 * 1024)),
  maxFiles: limits.files,
};

const uploadListing = multer({
  storage: createStorage('terra/listings'),
  limits,
});

const uploadCar = multer({
  storage: createStorage('terra/cars'),
  limits,
});

module.exports = { uploadListing, uploadCar, cloudinary, limitsConfig };
