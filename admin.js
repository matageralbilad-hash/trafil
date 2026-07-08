import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات مفاتيحك الخاصة
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

// === 1️⃣ فورم إدخال التذاكر ===
document.getElementById("ticket-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // جلب القيم من المدخلات
    const passengerName = document.getElementById("passenger_name").value;
    const bookingCode = document.getElementById("booking_code").value;
    const departureDateVal = document.getElementById("departure_date").value;
    const returnDateVal = document.getElementById("return_date").value;
    const fromLocation = document.getElementById("from_location").value;
    const toLocation = document.getElementById("to_location").value;
    const source = document.getElementById("source").value;
    const destinationAgency = document.getElementById("destination_agency").value;

    try {
        // تجهيز البيانات وتحويل التاريخ المدخل إلى Firebase Timestamp
        const ticketData = {
            passenger_name: passengerName,
            booking_code: bookingCode,
            departure_date: Timestamp.fromDate(new Date(departureDateVal)),
            return_date: returnDateVal ? Timestamp.fromDate(new Date(returnDateVal)) : null, // اختياري
            from_location: fromLocation,
            to_location: toLocation,
            source: source,
            destination_agency: destinationAgency,
            created_at: Timestamp.fromDate(new Date()) // تاريخ الإدخال الآن لحساب عداد الأسبوع
        };

        // إرسال البيانات إلى مجموعة tickets في Firestore
        await addDoc(collection(db, "tickets"), ticketData);
        alert("✅ تم حفظ التذكرة بنجاح في النظام!");
        document.getElementById("ticket-form").reset(); // تفريغ الفورم
    } catch (error) {
        console.error("خطأ أثناء الحفظ: ", error);
        alert("❌ حدث خطأ أثناء الحفظ، يرجى المحاولة مجدداً.");
    }
});

// === 2️⃣ فورم إدخال العمرة ===
document.getElementById("umrah-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const pilgrimName = document.getElementById("pilgrim_name").value;
    const agencyType = document.getElementById("agency_type").value;

    try {
        await addDoc(collection(db, "umrah"), {
            pilgrim_name: pilgrimName,
            agency_type: agencyType,
            created_at: Timestamp.fromDate(new Date())
        });
        alert("🕋 تم حفظ معاملة العمرة بنجاح!");
        document.getElementById("umrah-form").reset();
    } catch (error) {
        console.error("خطأ أثناء الحفظ: ", error);
    }
});

// === 3️⃣ جدول إدارة الحجوزات مع خاصية الحذف الفوري (CRUD) ===
const adminTableBody = document.querySelector("#admin-manage-table tbody");

const q = query(collection(db, "tickets"), orderBy("created_at", "desc"));
onSnapshot(q, (snapshot) => {
    adminTableBody.innerHTML = ""; // تفريغ لمنع التكرار
    snapshot.forEach((snapshotDoc) => {
        const ticket = snapshotDoc.data();
        const ticketId = snapshotDoc.id;
        const depDate = ticket.departure_date ? ticket.departure_date.toDate().toLocaleDateString('ar-YE') : '-';

        const row = `<tr>
            <td><strong>${ticket.passenger_name}</strong></td>
            <td>${ticket.booking_code}</td>
            <td>${depDate}</td>
            <td>${ticket.source}</td>
            <td>
                <button class="delete-btn" data-id="${ticketId}">❌ حذف</button>
            </td>
        </tr>`;
        adminTableBody.innerHTML += row;
    });

    // ربط أزرار الحذف بالدالة الخاصة بها برمجياً
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            if (confirm("هل أنت متأكد من حذف هذا الحجز نهائياً من النظام؟")) {
                await deleteDoc(doc(db, "tickets", id));
                alert("🗑️ تم حذف الحجز بنجاح.");
            }
        });
    });
});