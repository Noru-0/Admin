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

        let imageUrl = null;
        const lowercaseName = name.toLowerCase().replace(/ /g, "-");  // Convert all spaces to hyphens and name to lowercase for search
        const release_time = new Date();

        const newProduct = {
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
                imageUrl,
                shortDescription,
                longDescription,
                promotion: parseFloat(promotion),
                number: parseInt(number),
                lowercaseName: lowercaseName,
                release_time: release_time
            },
        };

        if (req.file) {
            try {
                // Upload the image to Cloudinary
                const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'product_folder', // Specify the folder name on Cloudinary
                    allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
                });

                // Add the Cloudinary image URL to the newProduct data
                newProduct.data.imageUrl = cloudinaryResponse.secure_url;
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ message: 'Error uploading image to Cloudinary.' });
            }
        }

        const createdProduct = await prisma.product.create(newProduct);

        res.status(201).json(createdProduct);
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

        let imageUrl = null;  // Initialize imageUrl to null in case no image is uploaded
        const lowercaseName = name.toLowerCase().replace(/ /g, "-");  // Convert all spaces to hyphens and name to lowercase for search

        // If a file is uploaded, upload to Cloudinary
        if (req.file) {
            try {
                const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'product_folder',
                    allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
                });
                imageUrl = cloudinaryResponse.secure_url;  // Set the image URL from Cloudinary
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ message: 'Error uploading image to Cloudinary.' });
            }
        }

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
                ...(imageUrl && { imageUrl }),
                shortDescription,
                longDescription,
                promotion: parseFloat(promotion),
                number: parseInt(number),
                lowercaseName
            },
        });

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
            res.status(404).json({ isDuplicate: false });
        }
    } catch (error) {
        console.error('Error checking product name:', error);
        res.status(500).json({ message: 'Error checking product name' });
    }
}

module.exports = { renderProduct, getProducts, getProductById, createProduct, updateProduct, deleteProduct, checkProductName };