document.getElementById('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect selected filters
    const selectedFilters = {};
    document.querySelectorAll('.filter:checked').forEach(input => {
        const filterType = input.dataset.filter;
        const value = input.dataset.value;
        if (!selectedFilters[filterType]) {
            selectedFilters[filterType] = [];
        }
        selectedFilters[filterType].push(value);
    });

    console.log('Selected Filters:', selectedFilters);

    try {
        const response = await fetch('/product/get-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedFilters),
        });

        if (response.ok) {
            const products = await response.json();
            displayProducts(products);
        } else {
            console.error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
});

// Function to display products
function displayProducts(products) {
    const productContainer = document.getElementById('product-list');
    productContainer.innerHTML = '';        

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'bg-white rounded-lg shadow-2xl p-4 text-center';
        productElement.onclick = () => window.location.href = `/detail/${formatName(product.name)}`;

        productElement.innerHTML = `
            <img class="product-card mx-auto my-6 object-cover cursor-pointer" src="${product.imageUrl}" alt="${product.name}" >
            <h2 class="text-xl text-[#8c7a6b] m-3 cursor-pointer">${product.name}</h2>
            <p class="text-xl text-[#BD8256] mb-4 cursor-pointer">£${product.price}</p>
            <button class="bg-[#AC6F53] text-white py-3 px-16 rounded-3xl hover:bg-[#7a6c5b]">ADD TO CART</button>
        `;

        productContainer.appendChild(productElement);
    });
}

function formatName(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}
