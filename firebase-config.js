// firebase-config.js
// COPY THESE VALUES FROM YOUR FIREBASE CONSOLE
const firebaseConfig = {
    apiKey: "AIzaSyDXYKu_fdIeebV2YJtDZZh5NAQW4XQLXEw",
    authDomain: "gng-travel-and-tours.firebaseapp.com",
    projectId: "gng-travel-and-tours",
    storageBucket: "gng-travel-and-tours.firebasestorage.app",
    messagingSenderId: "889438104478",
    appId: "1:889438104478:web:bdd6e62eb624149876c48f",
    measurementId: "G-H4WZNXL2YW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();