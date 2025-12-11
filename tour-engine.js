/* G&G Customer Tour Engine
   Fetches tours from Firebase based on the current page.
*/

document.addEventListener('DOMContentLoaded', function() {
    initTourEngine();
});

function initTourEngine() {
    const container = document.getElementById('tour-display-area');
    // Exit if this page doesn't have a tour section
    if (!container) return;

    // 1. Determine Country from Filename (e.g., "ghana.html" -> "ghana")
    const path = window.location.pathname;
    const currentPage = path.split('/').pop().split('.')[0].toLowerCase();

    // 2. Fetch from Firebase
    db.collection("tours").where("country", "==", currentPage).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                container.innerHTML = `
                    <div class="no-tours-message">
                        <h3>Custom Packages Available</h3>
                        <p>We are currently curating exclusive experiences for this destination.</p>
                        <a href="index.html#contact" class="btn">Contact Us for a Quote</a>
                    </div>`;
                return;
            }

            let html = '<div class="tours-grid">';
            querySnapshot.forEach((doc) => {
                const tour = doc.data();
                html += `
                <div class="tour-card">
                    <div class="tour-img-wrapper">
                        <img src="${tour.image}" alt="${tour.title}" loading="lazy">
                        <span class="tour-duration"><i class="fas fa-clock"></i> ${tour.duration}</span>
                    </div>
                    <div class="tour-details">
                        <div class="tour-header">
                            <h3>${tour.title}</h3>
                            <span class="tour-price">${tour.price}</span>
                        </div>
                        <p class="tour-location"><i class="fas fa-map-marker-alt"></i> ${tour.location}</p>
                        <p class="tour-desc">${tour.description}</p>
                        <a href="index.html#contact" class="tour-btn">Book This Tour</a>
                    </div>
                </div>`;
            });
            html += '</div>';
            
            container.innerHTML = html;
        })
        .catch((error) => {
            console.error("Error getting tours: ", error);
            container.innerHTML = '<p class="error-msg">Unable to load tours. Please check your connection.</p>';
        });
}