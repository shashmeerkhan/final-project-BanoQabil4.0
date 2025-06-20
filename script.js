document.addEventListener("DOMContentLoaded", function () {
        const menuToggle = document.getElementById("menu-toggle");
        const mainNav = document.getElementById("main-nav");

        if (menuToggle && mainNav) {
          menuToggle.addEventListener("click", function () {
            mainNav.classList.toggle("active");
            menuToggle.classList.toggle("active");
          });

          // Optional: Close menu when a link is clicked (useful for single-page apps)
          const navLinks = mainNav.querySelectorAll(".main-nav__link");
          navLinks.forEach((link) => {
            link.addEventListener("click", function () {
              // Ensure this only runs on mobile to avoid affecting desktop behavior
              if (window.innerWidth <= 900) {
                mainNav.classList.remove("active");
                menuToggle.classList.remove("active");
              }
            });
          });
        }
      });