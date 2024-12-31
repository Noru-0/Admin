// detail
document.addEventListener("DOMContentLoaded", () => {
    const descriptionTab = document.querySelector(".description-tab");
    const reviewsTab = document.querySelector(".review-tab");
    const descriptionContent = document.querySelector(".description-content");
    const reviewsContent = document.querySelector(".reviews-content");

    function showDescription() {
        descriptionContent.style.display = "block";
        reviewsContent.style.display = "none";
        descriptionTab.classList.add("active-tab");
        reviewsTab.classList.remove("active-tab");
    }

    function showReviews() {
        descriptionContent.style.display = "none";
        reviewsContent.style.display = "block";
        descriptionTab.classList.remove("active-tab");
        reviewsTab.classList.add("active-tab");
    }

    descriptionTab.addEventListener("click", (e) => {
        e.preventDefault(); // Ngăn không tải lại trang
        showDescription();
    });

    reviewsTab.addEventListener("click", (e) => {
        e.preventDefault(); // Ngăn không tải lại trang
        showReviews();
    });

    showReviews();

    // Rating
    const stars = document.querySelectorAll('#rating i');

    const setStars = (count) => {
        stars.forEach((s, index) => {
            if (index < count) {
                s.classList.remove('far');
                s.classList.add('fas');
            } else {
                s.classList.remove('fas');
                s.classList.add('far');
            }
        });
    };

    stars.forEach(star => {
        const starValue = star.getAttribute('data-value');

        // Click event
        star.addEventListener('click', () => {
            setStars(starValue);
        });

        // Hover events
        star.addEventListener('mouseover', () => {
            setStars(starValue);
        });

        star.addEventListener('mouseout', () => {
            const selectedStars = Array.from(stars).filter(s => s.classList.contains('fas')).length;
            setStars(selectedStars);
        });
    });



    // product
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", () => {
            window.location.href = "./detail.html";
        })
    })
})