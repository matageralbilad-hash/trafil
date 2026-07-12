// 1. استيراد مكتبات Firebase الحديثة التي تحتاجها
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// إعدادات Firebase الخاصة بمشروعك (مكتب السفريات)
const firebaseConfig = {
  apiKey: "AIzaSyDG3sWbnHQe0CN1ivOZVTrryOI-H5w0Eao",
  authDomain: "travel-agency-app-95c51.firebaseapp.com",
  projectId: "travel-agency-app-95c51",
  storageBucket: "travel-agency-app-95c51.firebasestorage.app",
  messagingSenderId: "83193496753",
  appId: "1:83193496753:web:b79eba52db8bfd43374e90",
  measurementId: "G-803PP5Q1WT"
};

// تهيئة Firebase وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// مصفوفات التخزين المؤقتة للعرض الداخلي في الجدول
let ticketsData = [];
let umrahData = [];
let visasData = [];

document.addEventListener('DOMContentLoaded', () => {
    setupFormSubmit();
    listenToFirebaseData();
});

// 2. الاستماع الفوري والتلقائي للتغيرات في Firebase لربط الجدول
function listenToFirebaseData() {
    // جلب واستماع التذاكر
    onValue(ref(database, 'tickets'), (snapshot) => {
        ticketsData = [];
        snapshot.forEach((childSnapshot) => {
            ticketsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        renderAdminManageTable();
    });

    // جلب واستماع بيانات العمرة
    onValue(ref(database, 'umrah'), (snapshot) => {
        umrahData = [];
        snapshot.forEach((childSnapshot) => {
            umrahData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        renderAdminManageTable();
    });

    // جلب واستماع التأشيرات الأخرى
    onValue(ref(database, 'visas'), (snapshot) => {
        visasData = [];
        snapshot.forEach((childSnapshot) => {
            visasData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        renderAdminManageTable();
    });
}

// 3. معالجة إرسال النماذج وحفظها في Firebase
function setupFormSubmit() {
    // إرسال تذكرة جديدة
    const ticketForm = document.getElementById('ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTicket = {
                passenger_name: document.getElementById('passenger_name').value.trim(),
                booking_code: document.getElementById('booking_code').value.trim().toUpperCase(),
                departure_date: document.getElementById('departure_date').value,
                from_location: document.getElementById('from_location').value.trim(),
                to_location: document.getElementById('to_location').value.trim(),
                return_date: document.getElementById('return_date').value || null,
                source: document.getElementById('source').value.trim(),
                destination_agency: document.getElementById('destination_agency').value.trim()
            };

            push(ref(database, 'tickets'), newTicket)
                .then(() => {
                    alert('✅ تم حفظ التذكرة بنجاح في سيرفر Firebase!');
                    ticketForm.reset();
                })
                .catch(err => alert('❌ خطأ في الحفظ: ' + err.message));
        });
    }

    // إرسال معاملة عمرة جديدة
    const umrahForm = document.getElementById('umrah-form');
    if (umrahForm) {
        umrahForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUmrah = {
                pilgrim_name: document.getElementById('pilgrim_name').value.trim(),
                entry_date: document.getElementById('entry_date').value,
                exit_date: document.getElementById('exit_date').value,
                travel_type: document.getElementById('travel_type').value,
                umrah_source: document.getElementById('umrah_source').value.trim(),
                beneficiary: document.getElementById('beneficiary').value.trim(),
                agency_type: document.getElementById('agency_type').value
            };

            push(ref(database, 'umrah'), newUmrah)
                .then(() => {
                    alert('🕋 تم تسجيل معاملة العمرة في سيرفر Firebase!');
                    umrahForm.reset();
                })
                .catch(err => alert('❌ خطأ في الحفظ: ' + err.message));
        });
    }

    // إرسال تأشيرة جديدة
    const visaForm = document.getElementById('visa-form');
    if (visaForm) {
        visaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newVisa = {
                visa_name: document.getElementById('visa_name').value.trim(),
                visa_expiry_date: document.getElementById('visa_expiry_date').value,
                visa_type: document.getElementById('visa_type').value,
                visa_source: document.getElementById('visa_source').value.trim(),
                visa_agent: document.getElementById('visa_agent').value.trim()
            };

            push(ref(database, 'visas'), newVisa)
                .then(() => {
                    alert('🛂 تم حفظ التأشيرة الجديدة في سيرفر Firebase!');
                    visaForm.reset();
                })
                .catch(err => alert('❌ خطأ في الحفظ: ' + err.message));
        });
    }
}

// 4. عرض البيانات الموحدة داخل جدول الإدارة
function renderAdminManageTable() {
    const tbody = document.querySelector('#admin-manage-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // عرض التذاكر
    ticketsData.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>🎟️ ${ticket.passenger_name}</strong></td>
            <td>تذكرة حجز (PNR: ${ticket.booking_code})</td>
            <td>${ticket.destination_agency}</td>
            <td>${ticket.source}</td>
            <td><button class="delete-btn" data-id="${ticket.id}" data-type="tickets">حذف ❌</button></td>
        `;
        tbody.appendChild(row);
    });

    // عرض العمرة
    umrahData.forEach(umrah => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>🕋 ${umrah.pilgrim_name}</strong></td>
            <td>معاملة عمرة (${umrah.travel_type})</td>
            <td>جهة: ${umrah.agency_type}</td>
            <td>${umrah.umrah_source}</td>
            <td><button class="delete-btn" data-id="${umrah.id}" data-type="umrah">حذف ❌</button></td>
        `;
        tbody.appendChild(row);
    });

    // عرض التأشيرات
    visasData.forEach(visa => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>🛂 ${visa.visa_name}</strong></td>
            <td>${visa.visa_type}</td>
            <td>الوكيل: ${visa.visa_agent} | انتهاء: ${visa.visa_expiry_date}</td>
            <td>${visa.visa_source}</td>
            <td><button class="delete-btn" data-id="${visa.id}" data-type="visas">حذف ❌</button></td>
        `;
        tbody.appendChild(row);
    });

    // ربط أحداث الحذف بأزرار الحذف بشكل آمن داخل الـ Module
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const type = e.target.getAttribute('data-type');
            deleteItem(id, type);
        });
    });
}

// 5. دالة الحذف المباشر من قاعدة بيانات Firebase
function deleteItem(id, nodeName) {
    if (!confirm('هل أنت متأكد تماماً من حذف هذا السجل نهائياً من سيرفر Firebase؟')) return;

    remove(ref(database, `${nodeName}/${id}`))
        .then(() => {
            alert('🗑️ تم حذف السجل بنجاح من السيرفر!');
        })
        .catch(err => alert('❌ فشل الحذف: ' + err.message));
}