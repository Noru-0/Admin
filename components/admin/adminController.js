var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();
const { cloudinary } = require('../../config/cloud');
const { parse } = require('dotenv');

const renderDashboard = (req, res) => {
  res.render('admin/dashboard', { title: 'Dashboard' });
};

const renderAccount = async (req, res) => {
  try {
    const users = await prisma.user.findMany(); // Lấy tất cả người dùng

    const filteredUsers = users.map(user => {
      const createdAtInVietnamTime = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Ho_Chi_Minh',  // Vietnam time zone (UTC+7)
      }).format(new Date(user.createdAt));

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        createdAt: createdAtInVietnamTime, // formatted date in Vietnam time
      };
    });

    res.render("admin/account", { users: filteredUsers }); // Trả về trang quản lý tài khoản với danh sách người dùng
  } catch (error) {
    console.error("Error loading account management page:", error);
    res.status(500).send("Error loading account management page.");
  }
};

const renderProduct = (req, res) => {
  res.render('admin/product', { title: 'Product' });
};

/* -----------------Users management----------------- */
// Controller to get users with pagination
const getUsers = async (req, res) => {
  try {
    const { username, email, role, sortBy, sortOrder, page = 1, pageSize = 6 } = req.query;

    // Build query filters
    const filter = {};
    if (username) filter.username = { contains: username, mode: 'insensitive' }; // Search username
    if (email) filter.email = { contains: email, mode: 'insensitive' };
    if (role && role !== "all") filter.role = { contains: role, mode: 'insensitive' };

    // Build sorting options
    const sort = sortBy
      ? { [sortBy]: sortOrder === "desc" ? 'desc' : 'asc' }
      : undefined;

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Fetch total count for pagination
    const totalCount = await prisma.user.count({ where: filter });

    // Fetch users for the current page
    const users = await prisma.user.findMany({
      where: filter,
      skip: parseInt(skip, 10),
      take: parseInt(pageSize, 10),
      orderBy: sort,
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    res.status(200).json({ users, totalPages });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block user
const blockUser = async (req, res) => {
  try {
    const { userIds } = req.body; // Get the userIds array from the request body

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Invalid userIds format' });
    }

    // Convert userIds to integers
    const userIdsInt = userIds.map(id => parseInt(id, 10));

    // Update the status of all selected users to false (blocked)
    await prisma.user.updateMany({
      where: {
        id: { in: userIdsInt }, // Block users whose IDs are in the userIds array
      },
      data: { status: false },
    });

    res.status(200).json({ message: 'Selected users have been blocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error blocking users' });
  }
};

// Unblock user
const unblockUser = async (req, res) => {
  try {
    const { userIds } = req.body; // Get the userIds array from the request body

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Invalid userIds format' });
    }

    // Convert userIds to integers
    const userIdsInt = userIds.map(id => parseInt(id, 10));

    // Update the status of all selected users to true (unblocked)
    await prisma.user.updateMany({
      where: {
        id: { in: userIdsInt }, // Unblock users whose IDs are in the userIds array
      },
      data: { status: true },
    });

    res.status(200).json({ message: 'Selected users have been unblocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unblocking users' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userIds } = req.body; // Get the userIds array from the request body

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Invalid userIds format' });
    }

    // Convert userIds to integers
    const userIdsInt = userIds.map(id => parseInt(id, 10));

    // Delete all selected users
    await prisma.user.deleteMany({
      where: {
        id: { in: userIdsInt }, // Delete users whose IDs are in the userIds array
      },
    });

    res.status(200).json({ message: 'Selected users have been deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting users' });
  }
};

// Lấy danh sách người dùng đã lọc và sắp xếp
const getFilteredAndSortedUsers = async (req, res) => {
  try {
    const { username, email, sortBy, sortOrder, role } = req.query;

    // Build query filters
    const filter = {};
    if (username) filter.username = { contains: username, mode: 'insensitive' }; // Search username
    if (email) filter.email = { contains: email, mode: 'insensitive' };
    if (role && role !== "all") filter.role = role;

    // Build sorting options
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? 'desc' : 'asc';
    }

    // Fetch users from the database
    const users = await prisma.user.findMany({
      where: filter,
      orderBy: sort
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* -----------------Products management----------------- */
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

module.exports = { renderDashboard, renderAccount, renderProduct, blockUser, unblockUser, deleteUser, getFilteredAndSortedUsers, getProducts, getProductById, createProduct, updateProduct, deleteProduct, getUsers, checkProductName };
