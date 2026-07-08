import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG3sWbnHQe0CN1ivOZVTrryOI-H5w0Eao",
  authDomain: "travel-agency-app-95c51.firebaseapp.com",
  projectId: "travel-agency-app-95c51",
  storageBucket: "travel-agency-app-95c51.firebasestorage.app",
  messagingSenderId: "83193496753",
  appId: "1:83193496753:web:b79eba52db8bfd43374e90",
  measurementId: "G-803PP5Q1WT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// حفظ التذاكر
document.getElementById("ticket-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await addDoc(collection(db, "tickets"), {
            passenger_name: document.getElementById("passenger_name").value,
            booking_code: document.getElementById("booking_code").value,
            departure_date: Timestamp.fromDate(new Date(document.getElementById("departure_date").value)),
            return_date: document.getElementById("return_date").value ? Timestamp.fromDate(new Date(document.getElementById("return_date").value)) : null,
            from_location: document.getElementById("from_location").value,
            to_location: document.getElementById("to_location").value,
            source: document.getElementById("source").value,
            destination_agency: document.getElementById("destination_agency").value,
            created_at: Timestamp.fromDate(new Date())
        });
        alert("✅ تم حفظ التذكرة بنجاح!");
        document.getElementById("ticket-form").reset();
    } catch (error) { alert("❌ خطأ أثناء الحفظ"); }
});

// حفظ العمرة بالحقول الجديدة
document.getElementById("umrah-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        await addDoc(collection(db, "umrah"), {
            pilgrim_name: document.getElementById("pilgrim_name").value,
            entry_date: Timestamp.fromDate(new Date(document.getElementById("entry_date").value)),
            exit_date: Timestamp.fromDate(new Date(document.getElementById("exit_date").value)),
            travel_type: document.getElementById("travel_type").value,
            source: document.getElementById("umrah_source").value,
            beneficiary: document.getElementById("beneficiary").value,
            agency_type: document.getElementById("agency_type").value,
            created_at: Timestamp.fromDate(new Date())
        });
        alert("🕋 تم حفظ معاملة العمرة بنجاح!");
        document.getElementById("umrah-form").reset();
    } catch (error) { alert("❌ خطأ أثناء الحفظ"); }
});

// عرض الكل في جدول الإدارة للحذف
const adminTableBody = document.querySelector("#admin-manage-table tbody");
function updateAdminTable() {
    adminTableBody.innerHTML = "";
    
    // جلب التذاكر
    onSnapshot(query(collection(db, "tickets"), orderBy("created_at", "desc")), (snap) => {
        snap.forEach(docSnap => {
            const data = docSnap.data();
            adminTableBody.innerHTML += `<tr>
                <td><strong>[تذكرة] ${data.passenger_name}</strong></td>
                <td>${data.booking_code}</td>
                <td>${data.departure_date?.toDate().toLocaleDateString('ar-YE')}</td>
                <td>${data.source}</td>
                <td><button class="delete-btn" onclick="deleteData('tickets', '${docSnap.id}')">❌ حذف</button></td>
            </tr>`;
        });
    });

    // جلب العمرة
    onSnapshot(query(collection(db, "umrah"), orderBy("created_at", "desc")), (snap) => {
        snap.forEach(docSnap => {
            const data = docSnap.data();
            adminTableBody.innerHTML += `<tr>
                <td><strong>[عمرة] ${data.pilgrim_name}</strong></td>
                <td>${data.travel_type}</td>
                <td>${data.agency_type}</td>
                <td>${data.source}</td>
                <td><button class="delete-btn" onclick="deleteData('umrah', '${docSnap.id}')">❌ حذف</button></td>
            </tr>`;
        });
    });
}

window.deleteData = async (coll, id) => {
    if (confirm("هل أنت متأكد من الحذف نهائياً؟")) {
        await deleteDoc(doc(db, coll, id));
        alert("🗑️ تم الحذف.");
    }
}
updateAdminTable();