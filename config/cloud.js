// module.exports = cloudinary;
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvnr2fqlk',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Connected to Cloudinary successfully.');

// Multer storage configuration for Cloudinary
const createCloudinaryStorage = (folder) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: folder,
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
    },
});

const storageMovie = createCloudinaryStorage('product_folder');
const storageAvatar = createCloudinaryStorage('user_folder');

const uploadProductImage = multer({ storage: storageMovie });
const uploadAvatar = multer({ storage: storageAvatar });

module.exports = { cloudinary, uploadProductImage, uploadAvatar };
