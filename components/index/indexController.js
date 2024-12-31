var {getFeaturedProducts} = require("./indexModel");

// var showFeaturedProducts = async (req, res) => {
//     try {
//         var featuredProducts = await getFeaturedProducts();

//         featuredProducts = featuredProducts.map(product => ({
//             ...product,
//             discountedPrice: product.promotion
//             ? (product.price * (1 - product.promotion / 100)).toFixed(2)
//             : null,
//         }));

//         res.render('index', {featuredProducts, title: "GA05 - Home"});
//     } catch (error) {
//         console.error(error);
//         res.status(500).render('error', { message: 'Something went wrong' });
//     }
// }

var showFeaturedProducts = async (req, res) => {
    try {
        // Find products where isFeatured is true
        const featuredProducts = await getFeaturedProducts();

        // Calculate discounted price (if any)
        const productsWithDiscount = featuredProducts.map(product => ({
            ...product,
            discountedPrice: product.promotion
                ? (product.price * (1 - product.promotion / 100))
                : null,
        }));

        res.render('index', { products: productsWithDiscount, title: 'Home' });
    } catch (err) {
        console.error("Error in showFeaturedProduct:", err);
        res.status(500).send("Error retrieving featured products");
    }
};

module.exports = {showFeaturedProducts};
