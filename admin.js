// G&G Admin Logic

// 1. GLOBAL VARIABLES
let currentUnsubscribe = null; // To store the active real-time listener

// 2. CHECK LOGIN STATE
auth.onAuthStateChanged(user => {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard-screen');
    
    if (user) {
        loginScreen.classList.remove('visible');
        dashboard.classList.add('visible');
        
        // Load initial data (default to Ghana or first option)
        const filterDropdown = document.getElementById('filterCountry');
        if (filterDropdown) {
            filterDropdown.value = 'ghana'; 
            loadAdminTours(); // Start the real-time listener
        }
    } else {
        dashboard.classList.remove('visible');
        loginScreen.classList.add('visible');
        
        // Stop listening to database if logged out
        if (currentUnsubscribe) currentUnsubscribe();
    }
});

// 3. LOGIN HANDLER
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    auth.signInWithEmailAndPassword(email, pass)
        .catch(error => alert("Login Failed: " + error.message));
});

// 4. LOGOUT HANDLER
window.logout = function() {
    auth.signOut();
}

// 5. ADD TOUR HANDLER
document.getElementById('addTourForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('loader').style.display = 'block';

    const newTour = {
        country: document.getElementById('tourCountry').value,
        title: document.getElementById('tourTitle').value,
        location: document.getElementById('tourLocation').value,
        price: document.getElementById('tourPrice').value,
        duration: document.getElementById('tourDuration').value,
        image: document.getElementById('tourImage').value,
        description: document.getElementById('tourDesc').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("tours").add(newTour)
        .then(() => {
            alert("Tour published successfully!");
            document.getElementById('addTourForm').reset();
            document.getElementById('loader').style.display = 'none';
        })
        .catch(err => {
            alert("Error: " + err.message);
            document.getElementById('loader').style.display = 'none';
        });
});

// 6. EVENT LISTENER FOR COUNTRY FILTER
const filterDropdown = document.getElementById('filterCountry');
if (filterDropdown) {
    filterDropdown.addEventListener('change', loadAdminTours);
}

// 7. REAL-TIME LOAD TOURS (UPDATED)
function loadAdminTours() {
    const country = document.getElementById('filterCountry').value;
    const list = document.getElementById('adminTourList');
    
    // Unsubscribe from previous listener to prevent duplicates
    if (currentUnsubscribe) {
        currentUnsubscribe();
    }

    list.innerHTML = '<p style="text-align:center; padding:20px;">Loading real-time data...</p>';

    // Start new listener (Removed orderBy to avoid index errors)
    currentUnsubscribe = db.collection("tours")
        .where("country", "==", country)
        .onSnapshot((querySnapshot) => {
            list.innerHTML = ''; 
            
            if(querySnapshot.empty) {
                list.innerHTML = '<p style="text-align:center; padding:20px;">No tours found for this country.</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                list.innerHTML += `
                    <div class="tour-list-item" id="item-${doc.id}">
                        <div class="tour-info">
                            <strong>${data.title}</strong><br>
                            <small>${data.location} | ${data.price}</small>
                        </div>
                        <button class="btn-delete" style="background:red; color:white; padding:5px 10px; border:none; cursor:pointer;" onclick="deleteTour('${doc.id}')">Delete</button>
                    </div>
                `;
            });
        }, (error) => {
            console.error("Real-time error:", error);
            list.innerHTML = `<p style="color:red; text-align:center;">Error: ${error.message}</p>`;
        });
}

// 8. DELETE TOUR HANDLER (GLOBAL)
window.deleteTour = function(id) {
    if(confirm("Are you sure you want to delete this tour? This cannot be undone.")) {
        // Optimistic UI update: Fade it out immediately
        const item = document.getElementById(`item-${id}`);
        if(item) item.style.opacity = '0.5';

        db.collection("tours").doc(id).delete()
            .then(() => {
                console.log("Document successfully deleted!");
            })
            .catch(error => {
                alert("Error removing document: " + error.message);
                if(item) item.style.opacity = '1';
            });
    }
}
