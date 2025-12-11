// G&G Admin Logic

// 1. Check Login State
auth.onAuthStateChanged(user => {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard-screen');
    
    if (user) {
        loginScreen.classList.remove('visible');
        dashboard.classList.add('visible');
        // Load initial data (default to Ghana)
        document.getElementById('filterCountry').value = 'ghana';
        loadAdminTours();
    } else {
        dashboard.classList.remove('visible');
        loginScreen.classList.add('visible');
    }
});

// 2. Login Handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    
    auth.signInWithEmailAndPassword(email, pass)
        .catch(error => alert("Login Failed: " + error.message));
});

// 3. Logout Handler
function logout() {
    auth.signOut();
}

// 4. Add Tour Handler
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
            // If the filter matches the added tour, refresh list
            if(document.getElementById('filterCountry').value === newTour.country) {
                loadAdminTours();
            }
            document.getElementById('loader').style.display = 'none';
        })
        .catch(err => {
            alert("Error: " + err.message);
            document.getElementById('loader').style.display = 'none';
        });
});

// 5. Load Tours for Admin List
function loadAdminTours() {
    const country = document.getElementById('filterCountry').value;
    const list = document.getElementById('adminTourList');
    list.innerHTML = '<p style="text-align:center; padding:20px;">Loading...</p>';

    db.collection("tours").where("country", "==", country).get()
        .then((querySnapshot) => {
            list.innerHTML = '';
            if(querySnapshot.empty) {
                list.innerHTML = '<p style="text-align:center; padding:20px;">No tours found for this country.</p>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                list.innerHTML += `
                    <div class="tour-list-item">
                        <div class="tour-info">
                            <strong>${data.title}</strong><br>
                            <small>${data.location} | ${data.price}</small>
                        </div>
                        <button class="btn-delete" onclick="deleteTour('${doc.id}')">Delete</button>
                    </div>
                `;
            });
        });
}

// 6. Delete Tour Handler
function deleteTour(id) {
    if(confirm("Are you sure you want to delete this tour? This cannot be undone.")) {
        db.collection("tours").doc(id).delete()
            .then(() => {
                loadAdminTours();
            })
            .catch(error => {
                alert("Error removing document: ", error);
            });
    }
}