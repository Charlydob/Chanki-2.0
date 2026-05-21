const firebaseConfig = {
  apiKey: "AIzaSyAV0zIiImJY-wR9wcvFINM1VdVq3CeKCNQ",
  authDomain: "chanki2.firebaseapp.com",
  databaseURL: "https://chanki2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chanki2",
  storageBucket: "chanki2.firebasestorage.app",
  messagingSenderId: "690330291980",
  appId: "1:690330291980:web:8c0308869135453d188329"
};

export function getFirebaseConfig() {
  return firebaseConfig;
}

export function isFirebaseReady(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL);
}
