const {
    createProduct,
    findProductById,
    findProducts,
    countProducts,
    updateProduct,
    deleteProduct,
    checkProductNameExists
} = require('./productModel');
const { cloudinary } = require('../../../config/cloud');

// Render the product management page
const renderProduct = (req, res) => {
    res.render('admin/product', { title: 'Product' });
};

// Get filtered and sorted products
const getProducts = async (req, res) => {
    try {
        const { name, category, subcategory, brand, sortBy, sortOrder, page = 1, pageSize = 5 } = req.query;

        const filters = {};
        if (name) filters.name = { contains: name, mode: 'insensitive' };
        if (subcategory && subcategory !== 'all') {
            filters[category] = category === 'ram' || category === 'disk'
                ? parseInt(subcategory)
                : { contains: subcategory, mode: 'insensitive' };
        }
        if (brand && brand !== 'all') filters.brand = { contains: brand, mode: 'insensitive' };

        const sort = sortBy ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' } : undefined;
        const skip = (page - 1) * pageSize;

        const [products, totalCount] = await Promise.all([
            findProducts(filters, sort, parseInt(skip, 10), parseInt(pageSize, 10)),
            countProducts(filters),
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);
        res.status(200).json({ products, totalPages });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

// Get a product by ID
const getProductById = async (req, res) => {
    try {
        const product = await findProductById(req.params.id);
        if (product) res.status(200).json(product);
        else res.status(404).json({ message: 'Product not found' });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product' });
    }
};

// Create a new product
const createProductController = async (req, res) => {
    try {
        const { name, brand, price, chipset, os, ram, disk, screenSize, refreshRate, isFeatured, shortDescription, longDescription, promotion, number } = req.body;

        const lowercaseName = name.toLowerCase().replace(/ /g, "-");
        const release_time = new Date();

        const newProductData = {
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
        };
        const newProduct = await createProduct(newProductData);

        const imageUrls = [];
        if (req.files?.length) {
            for (const file of req.files) {
                const uploadResponse = await cloudinary.uploader.upload(file.path, {
                    folder: `product_folder/${newProduct.id}`,
                    allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
                });
                imageUrls.push(uploadResponse.secure_url);
            }
        }

        const updatedProduct = await updateProduct(newProduct.id, {
            images: imageUrls,
            imageUrl: imageUrls[0] || '',
        });

        res.status(201).json(updatedProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

// Update a product
const updateProductController = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, brand, price, chipset, os, ram, disk, screenSize, refreshRate, isFeatured, shortDescription, longDescription, promotion, number } = req.body;
        const lowercaseName = name.toLowerCase().replace(/ /g, "-");  // Convert all spaces to hyphens and name to lowercase for search

        // Parse removedImages (Array of URLs)
        const removedImages = Array.isArray(req.body.removedImages)
            ? req.body.removedImages
            : [req.body.removedImages]; // Convert single string to array if needed        

        let newImages = [];
        if (req.files?.length) {
            for (const file of req.files) {
                newImages.push(file.path);
            }
        }

        const currentProduct = await findProductById(productId);
        if (!currentProduct) return res.status(404).json({ message: 'Product not found.' });

        const updatedImages = (currentProduct.images || []).filter(image =>
            !removedImages.includes(image)
        );

        const finalImages = [...updatedImages, ...newImages];

        const data = {
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
        }

        const updatedProduct = await updateProduct(productId, data);

        for (const imageUrl of removedImages) {
            if (typeof imageUrl === 'string') {
                const publicId = imageUrl.split('/').slice(-1)[0]?.split('.')[0];
                if (publicId) await cloudinary.uploader.destroy(`product_folder/${publicId}`);
            }
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
};

// Delete a product
const deleteProductController = async (req, res) => {
    try {
        await deleteProduct(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};

// Check if a product name exists
const checkProductName = async (req, res) => {
    try {
        const product = await checkProductNameExists(req.query.name);
        res.status(200).json({ isDuplicate: !!product });
    } catch (error) {
        console.error('Error checking product name:', error);
        res.status(500).json({ message: 'Error checking product name' });
    }
};

module.exports = {
    renderProduct,
    getProducts,
    getProductById,
    createProductController,
    updateProductController,
    deleteProductController,
    checkProductName,
};
