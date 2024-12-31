document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.ct-top-menu-item');
    const searchIcon = document.getElementById('search-icon');

    // Xử lý sự kiện khi bấm vào mục cha (ví dụ: Kind, Price)
    menuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            // Ngừng sự kiện bấm khi bấm vào checkbox (ngăn không ẩn menu)
            if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
                return;
            }

            const subMenu = item.querySelector('ul');  // Lấy menu con của mục hiện tại
            if (subMenu) {
                event.preventDefault();
                if (subMenu.classList.contains('hidden')) {
                    subMenu.classList.remove('hidden');  // Hiển thị menu con
                } else {
                    subMenu.classList.add('hidden');  // Ẩn menu con
                }
            }
        });

        // Xử lý sự kiện bấm vào mục con (menu con của các mục như "Kind" có các mục con)
        const subSubMenuItems = item.querySelectorAll('ul > li > ul'); // Lấy menu con của các mục con
        subSubMenuItems.forEach(subSubMenu => {
            subSubMenu.previousElementSibling.addEventListener('click', (event) => {
                // Ngừng sự kiện bấm khi bấm vào checkbox (ngăn không ẩn menu)
                if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
                    return;
                }

                event.stopPropagation(); // Ngăn không cho sự kiện bấm của menu cha
                if (subSubMenu.classList.contains('hidden')) {
                    subSubMenu.classList.remove('hidden');  // Hiển thị menu con của mục con
                } else {
                    subSubMenu.classList.add('hidden');  // Ẩn menu con của mục con
                }
            });
        });
    });

    // Xử lý sự kiện khi nhấn vào icon tìm kiếm
    let isMenuVisible = false;  // Biến để theo dõi trạng thái hiển thị của các menu

    searchIcon.addEventListener('click', () => {
        menuItems.forEach(item => {
            const subMenu = item.querySelector('ul');
            if (subMenu) {
                if (isMenuVisible) {
                    subMenu.classList.add('hidden');  // Ẩn tất cả menu con nếu menu đang hiển thị
                } else {
                    subMenu.classList.remove('hidden');  // Hiển thị tất cả menu con
                }
            }
        });
        
        // Đảo ngược trạng thái hiển thị menu
        isMenuVisible = !isMenuVisible;

        // Cuộn trang xuống một khoảng sau khi click vào icon
        smoothScroll(240);
    });         

    function smoothScroll(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 500; // Thời gian cuộn (ms)
        let startTime;

        function scrollStep(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            window.scrollTo(0, startPosition + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(scrollStep);
            }
        }

        requestAnimationFrame(scrollStep);
    }
});
