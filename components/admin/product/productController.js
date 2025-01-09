var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
const { cloudinary } = require('../../../config/cloud');
const { parse } = require('dotenv');

// Controller to render the product management page
const renderProduct = (req, res) => {
    res.render('admin/product', { title: 'Product' });
};

// Controller to get filtered and sorted products
const getProducts = async (req, res) => {
    try {
        const { name, category, subcategory, brand, sortBy, sortOrder, page = 1, pageSize = 5 } = req.query;

        // Prepare filters for Prisma query
        const filters = {};

        // Filtering by name (if provided)
        if (name) {
            filters.name = { contains: name, mode: 'insensitive' };
        }

        // Filter by subcategory (if provided)
        if (subcategory && subcategory !== 'all') {
            if (category !== 'ram' && category !== 'disk') {
                filters[category] = { contains: subcategory, mode: 'insensitive' };
            } else {
                filters[category] = parseInt(subcategory);  // Convert subcategory to number for ram and disk
            }
        }

        // Filtering by brand (if provided)
        if (brand && brand !== 'all') {
            filters.brand = { contains: brand, mode: 'insensitive' };
        }

        const sort = sortBy
            ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' }
            : undefined;

        const skip = (page - 1) * pageSize;

        const totalCount = await prisma.product.count({ where: filters });

        // Fetch products from Prisma
        const products = await prisma.product.findMany({
            where: filters,
            skip: parseInt(skip, 10),
            take: parseInt(pageSize, 10),
            orderBy: sort,
        });

        const totalPages = Math.ceil(totalCount / pageSize);

        res.status(200).json({ products, totalPages });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Controller to get a product by id
const getProductById = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// Controller to create a new product
const createProduct = async (req, res) => {
    try {
        const { name, brand, price, chipset, os, ram, disk, screenSize, refreshRate, isFeatured, shortDescription, longDescription, promotion, number } = req.body;

        const lowercaseName = name.toLowerCase().replace(/ /g, "-");  // Convert all spaces to hyphens and name to lowercase for search
        const release_time = new Date();

        const newProduct = await prisma.product.create({
            data: {
                name,
                brand,
                price: parseFloat(price),
                chipset,
                os,
                ram: parseInt(ram),
                disk: parseInt(disk),
                screenSize: parseFloat(screenSize),
                refreshRate: parseInt(refreshRate),
                isFeatured: isFeatured === 'on',
                shortDescription,
                longDescription,
                promotion: parseFloat(promotion),
                number: parseInt(number),
                lowercaseName: lowercaseName,
                release_time: release_time,
                images: [], // Empty array to store image URLs
                imageUrl: '', // Store the first image URL as the main image
            },
        });

        const productId = newProduct.id;
        let imageUrls = [];
        // Upload ảnh lên thư mục tạm "default"
        if (req.files?.length) {
            for (const file of req.files) {
                try {
                    const uploadResponse = await cloudinary.uploader.upload(file.path, {
                        folder: `product_folder/${productId}`, // Thư mục tạm
                        allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
                    });

                    // Thêm URL ảnh mới vào mảng imageUrls
                    imageUrls.push(uploadResponse.secure_url);
                } catch (uploadError) {
                    console.error('Error uploading or moving image:', uploadError);
                    return res.status(500).json({ message: 'Error uploading images.' });
                }
            }
        }

        // Update product with image URLs
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                images: imageUrls, // Lưu danh sách ảnh
                imageUrl: imageUrls[0], // Ảnh đại diện (nếu có)
            },
        });

        res.status(201).json(updatedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

// Controller to update a product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, brand, price, chipset, os, ram, disk, screenSize, refreshRate, isFeatured, shortDescription, longDescription, promotion, number } = req.body;

        const lowercaseName = name.toLowerCase().replace(/ /g, "-");  // Convert all spaces to hyphens and name to lowercase for search

        // Handle new image uploads
        // Parse removedImages (Array of URLs)
        const removedImages = Array.isArray(req.body.removedImages)
            ? req.body.removedImages
            : [req.body.removedImages]; // Convert single string to array if needed        

        let newImages = [];
        if (req.files?.length) {
            for (const file of req.files) {
                newImages.push(file.path); // File paths are automatically uploaded via multer-storage-cloudinary
            }
        }

        // Fetch the current product to get the existing images
        const currentProduct = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
            select: { images: true } // Assume "images" is an array of image URLs
        });

        if (!currentProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Handle removed images
        const updatedImages = (currentProduct.images || []).filter(image =>
            !removedImages.includes(image)
        );

        // Final list of images after adding new ones
        const finalImages = [...updatedImages, ...newImages];

        // Update product in the database
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(productId) },
            data: {
                name,
                brand,
                price: parseFloat(price),
                chipset,
                os,
                ram: parseInt(ram),
                disk: parseInt(disk),
                screenSize: parseFloat(screenSize),
                refreshRate: parseInt(refreshRate),
                isFeatured: isFeatured === 'on',
                shortDescription,
                longDescription,
                promotion: parseFloat(promotion),
                number: parseInt(number),
                lowercaseName,
                images: finalImages,
            },
        });

        // Delete removed images from Cloudinary
        for (const imageUrl of removedImages) {
            const publicId = imageUrl.split('/').slice(-1)[0]?.split('.')[0]; // Safer extraction of publicId
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(`product_folder/${publicId}`);
                } catch (error) {
                    console.error(`Error deleting image ${publicId} from Cloudinary:`, error);
                }
            } else {
                console.warn(`Public ID not found for URL: ${imageUrl}`);
            }
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
};

// Controller to delete a product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        await prisma.product.delete({
            where: { id: parseInt(productId) },
        });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};

const checkProductName = async (req, res) => {
    try {
        const { name } = req.query;
        const product = await prisma.product.findFirst({
            where: {
                lowercaseName: name,
            },
        });

        if (product) {
            res.status(200).json({ isDuplicate: true });
        } else {
            res.status(200).json({ isDuplicate: false });
        }
    } catch (error) {
        console.error('Error checking product name:', error);
        res.status(500).json({ message: 'Error checking product name' });
    }
}

module.exports = { renderProduct, getProducts, getProductById, createProduct, updateProduct, deleteProduct, checkProductName };