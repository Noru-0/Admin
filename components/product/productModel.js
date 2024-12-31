var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

var getDescriptionByProductName = async (productName) => {
    try {
        return await prisma.product.findUnique({
          where: { lowercaseName: productName }
        });
    }   catch (error) {
        console.error("Error fetching description by product name:", error);
        throw new Error("Database error while fetching product description");
    }
};

var getRelevantProducts = async (category, excludeProductId, limit = 4) => {
    return prisma.product.findMany({
        where: {
            category: category, // Match the category
            NOT: { id: excludeProductId }, // Exclude the current product
        },
        take: limit, // Limit the results
    });
};

const findProducts = async (searchQuery, filters, excludeProductId, limit) => {
    try {
        const whereConditions = {};

        // Add search query condition
        if (searchQuery) {
            whereConditions.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { brand: { contains: searchQuery, mode: 'insensitive' } },
                { chipset: { contains: searchQuery, mode: 'insensitive' } },
                { os: { contains: searchQuery, mode: 'insensitive' } },
            ];
        }

        // Add price filter conditions
        if (filters.price && Array.isArray(filters.price)) {
            const priceConditions = filters.price.map(p => {
                const range = p.split('-');
                if (range.length === 1) {
                    if (p.startsWith('>')) {
                        return { price: { gt: parseFloat(p.slice(1)) } };
                    } else if (p.startsWith('<')) {
                        return { price: { lt: parseFloat(p.slice(1)) } };
                    }
                } else {
                    return { price: { gte: parseFloat(range[0]), lte: parseFloat(range[1]) } };
                }
            });
            whereConditions.OR = whereConditions.OR ? [...whereConditions.OR, ...priceConditions] : priceConditions;
        }

        // Add other filter conditions
        if (filters.brand && filters.brand.length > 0) {
            whereConditions.brand = { in: filters.brand };
        }

        if (filters.chipset && filters.chipset.length > 0) {
            const childMapping = {
                Apple: ["A18 Pro", "A17 Pro"],
                Snapdragon: ["8 Gen 3", "8 Gen 3 For Galaxy", "8 Gen 2"],
                MediaTek: ["Dimensity 9400", "Dimensity 7200 Ultra", "Dimensity 7300", "Dimensity 8300-Ultra", "Dimensity 6300"],
                Unisoc: ["T820"]
            };
        
            // Get all selected child values
            const selectedChildren = filters.chipset.filter(chipset =>
                Object.values(childMapping).flat().includes(chipset)
            );
        
            // Remove parent if corresponding child is selected
            const filteredChipsets = filters.chipset.filter(chipset => {
                if (childMapping[chipset]) {
                    // Remove parent if at least one child value is selected
                    return !selectedChildren.some(child => childMapping[chipset].includes(child));
                }
                return true;
            });
        
            const chipsetConditions = filteredChipsets.flatMap(chipset => {
                if (childMapping[chipset]) {
                    return childMapping[chipset].map(child => ({ chipset: child }));
                } else {
                    return { chipset: chipset };
                }
            });
        
            whereConditions.OR = whereConditions.OR ? [...whereConditions.OR, ...chipsetConditions] : chipsetConditions;
        }

        if (filters.os && filters.os.length > 0) {
            whereConditions.os = { in: filters.os };
        }

        if (filters.ram && filters.ram.length > 0) {
            whereConditions.ram = { in: filters.ram };
        }

        if (filters.disk && filters.disk.length > 0) {
            whereConditions.disk = { in: filters.disk };
        }

        if (filters.screenSize && filters.screenSize.length > 0) {
            whereConditions.screenSize = { in: filters.screenSize };
        }

        if (filters.refreshSize && filters.refreshSize.length > 0) {
            whereConditions.refreshSize = { in: filters.refreshSize };
        }

        // Exclude specific product
        if (excludeProductId) {
            whereConditions.NOT = { id: excludeProductId };
        }

        //console.log('whereConditions:', whereConditions);

        // Fetch products with the combined conditions
        const products = await prisma.product.findMany({
            where: whereConditions,
            take: limit,
        });

        return products;
    } catch (error) {
        console.error('Error finding products:', error);
        throw error;
    }
};


module.exports = { getDescriptionByProductName, getRelevantProducts, findProducts };
