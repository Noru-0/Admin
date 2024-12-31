document.addEventListener("DOMContentLoaded", () => {
    const menuData = {
        "Brand": ["Apple", "Samsung", "Oppo", "Xiaomi", "Nubia"],
        "Chipset": ["Snapdragon", "MediaTek Dimensity", "Apple", "Unisoc"],
        "OS": ["Android", "iOS", "Xiaomi HyperOS", "ColorOS", "One UI"],
        "RAM": ["4GB", "6GB", "8GB", "12GB", "16GB"],
        "Storage": ["64GB", "128GB", "256GB", "512GB", "1024GB"],
        "Refresh rate": ["60Hz", "90Hz", "120Hz", "144Hz"],
    };

    // Function to generate filter options
    const generateFilterOptions = () => {
        const filterContainer = document.getElementById("filter-container");
        if (!filterContainer) {
            console.error("Filter container element not found.");
            return;
        }

        // Clear existing content
        filterContainer.innerHTML = "";

        // Generate filter options based on menuData
        Object.keys(menuData).forEach(category => {
            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add("mb-4");

            const categoryTitle = document.createElement("p");
            categoryTitle.classList.add("font-medium", "mb-2");
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);

            menuData[category].forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.classList.add("flex", "justify-between", "items-center", "mb-1");

                const label = document.createElement("label");
                label.classList.add("flex", "items-center");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name =  + category;
                checkbox.value = item;
                checkbox.style.marginRight = "0.5rem";

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(item));
                itemDiv.appendChild(label);

                categoryDiv.appendChild(itemDiv);
            });

            filterContainer.appendChild(categoryDiv);
        });
    };

    // Generate filter options on page load
    generateFilterOptions();

    // Existing code for menu interaction
    document.querySelectorAll(".menu-item").forEach((item) => {
        item.addEventListener("click", (event) => {
            const category = event.target.getAttribute("data-category");
            const content = menuData[category] || [];
            const menuContent = document.getElementById("menu-content");

            // Clear existing highlight
            document.querySelectorAll(".menu-item").forEach((el) => {
                el.classList.remove("bg-amber-400");
                el.classList.add("hover:bg-neutral-100");
            });

            // Add highlight to clicked category
            event.currentTarget.classList.add("bg-amber-400");
            event.currentTarget.classList.remove("hover:bg-neutral-100");

            // Update content
            if (menuContent) {
                // Clear existing content
                menuContent.innerHTML = "<div class='flex gap-20'></div>";

                const container = menuContent.querySelector("div");

                // Calculate the number of columns
                const numColumns = Math.ceil(content.length / 3);

                // Create columns and distribute items
                for (let i = 0; i < numColumns; i++) {
                    const ul = document.createElement("ul");
                    ul.classList.add("text-sm", "leading-8");

                    // Get items for the current column
                    const columnItems = content.slice(i * 3, i * 3 + 3);
                    columnItems.forEach((item) => {
                        const li = document.createElement("li");
                        li.textContent = item;
                        ul.appendChild(li);
                    });

                    container.appendChild(ul);
                }
            } else {
                console.error("Menu content element not found.");
            }
        });
    });
});