require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvnr2fqlk',
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Connected to Cloudinary successfully.');
} catch (error) {
    console.error('❌ Failed to connect to Cloudinary:', error);
}

// Dynamic Cloudinary storage configuration based on product ID
const createDynamicCloudinaryStorage = (folderBase) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const productId = req.params.id || 'default'; // Default folder if no ID is available
        return {
            folder: `${folderBase}/${productId}`, // Use dynamic folder naming
            allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
        };
    },
});

// Create specific storages for products and avatars
const storageProduct = createDynamicCloudinaryStorage('product_folder');
const storageAvatar = createDynamicCloudinaryStorage('user_folder');

// Initialize multer instances
const uploadProductImage = multer({ storage: storageProduct });
const uploadAvatar = multer({ storage: storageAvatar });

module.exports = { cloudinary, uploadProductImage, uploadAvatar };
