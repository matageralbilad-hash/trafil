// =================================================================
// 📺 نظام شاشة العرض المباشرة لصالة الانتظار - مكتب وفاء سيئون
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDG3sWbnHQe0CN1ivOZVTrryOI-H5w0Eao",
    authDomain: "travel-agency-app-95c51.firebaseapp.com",
    projectId: "travel-agency-app-95c51",
    storageBucket: "travel-agency-app-95c51.firebasestorage.app",
    messagingSenderId: "83193496753",
    appId: "1:83193496753:web:b79eba52db8bfd43374e90",
    measurementId: "G-803PP5Q1WT"
};

document.addEventListener('DOMContentLoaded', () => {
    startClock();
    initTVFirebase();
});

// 🕒 دالة تشغيل الساعة الحية بالثواني
function startClock() {
    function update() {
        const now = new Date();
        document.getElementById('tv-clock').textContent = now.toLocaleTimeString('ar-YE', { hour12: true });
        document.getElementById('tv-date').textContent = now.toLocaleDateString('ar-YE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    update();
    setInterval(update, 1000);
}

// 🔄 جلب البيانات المباشرة من Firebase
function initTVFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // جلب التذاكر
        onValue(ref(database, 'tickets'), (snapshot) => {
            const tbody = document.querySelector('#tv-tickets-table tbody');
            tbody.innerHTML = '';
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map(k => data[key = k]);
                
                document.getElementById('tv-tickets-count').textContent = `(${list.length} رحلة)`;

                list.slice(0, 10).forEach(t => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td style="color: #38bdf8;"><strong>${t.passenger_name}</strong></td>
                        <td><code style="background:#1e293b; padding:2px 6px; border-radius:4px;">${t.booking_code}</code></td>
                        <td>${t.from_location || ''} ➔ ${t.to_location || ''}</td>
                        <td style="color:#10b981;">${t.departure_date ? t.departure_date.replace('T', ' ') : '-'}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8;">لا توجد رحلات مجدولة حالياً.</td></tr>';
            }
        });

        // جلب العمرة
        onValue(ref(database, 'umrah'), (snapshot) => {
            const tbody = document.querySelector('#tv-umrah-table tbody');
            tbody.innerHTML = '';
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map(k => data[key = k]);

                document.getElementById('tv-umrah-count').textContent = `(${list.length} معتمر)`;

                list.slice(0, 10).forEach(u => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td style="color: #f59e0b;"><strong>${u.pilgrim_name}</strong></td>
                        <td>${u.entry_date || '-'}</td>
                        <td>${u.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
                        <td><span style="background:#334155; padding:2px 8px; border-radius:4px; font-size:0.85rem;">${u.agency_type || '-'}</span></td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #94a3b8;">لا توجد رحلات عمرة مسجلة.</td></tr>';
            }
        });

    } catch (e) {
        console.error("خطأ بتهيئة شاشة العرض:", e);
    }
}