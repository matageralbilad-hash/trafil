// =================================================================
// 📂 سكريبت إدارة وتفتيش سجل الأرشيف التاريخي - مكتب وفاء سيئون
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

let rawArchiveData = [];

document.addEventListener('DOMContentLoaded', () => {
    initHistoryFirebase();
});

function initHistoryFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // جلب إحصائيات العدادات العامة للأرشيف
        onValue(ref(database, 'tickets'), snap => {
            document.getElementById('stat-tickets').textContent = snap.exists() ? Object.keys(snap.val()).length : 0;
        });
        onValue(ref(database, 'umrah'), snap => {
            document.getElementById('stat-umrah').textContent = snap.exists() ? Object.keys(snap.val()).length : 0;
        });
        onValue(ref(database, 'visas'), snap => {
            document.getElementById('stat-visas').textContent = snap.exists() ? Object.keys(snap.val()).length : 0;
        });

        window.historyDatabase = database;
        loadArchiveData();

    } catch (e) {
        console.error("خطأ بتهيئة سجل الأرشيف:", e);
    }
}

window.loadArchiveData = function() {
    const category = document.getElementById('archive-category-select').value;
    const database = window.historyDatabase;
    if (!database) return;

    onValue(ref(database, category), (snapshot) => {
        rawArchiveData = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            rawArchiveData = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        }
        renderArchiveTable(category, rawArchiveData);
    });
};

function renderArchiveTable(category, dataList) {
    const headerRow = document.getElementById('archive-table-header');
    const tbody = document.querySelector('#archive-table tbody');
    tbody.innerHTML = '';

    if (category === 'tickets') {
        headerRow.innerHTML = `
            <th>اسم المسافر</th>
            <th>رقم الحجز (PNR)</th>
            <th>تاريخ الإقلاع</th>
            <th>خط السير</th>
            <th>الجهة / الطيران</th>
            <th>طباعة</th>
        `;

        if (dataList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد سجلات تذاكر بأرشيف النظام.</td></tr>';
            return;
        }

        dataList.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${t.passenger_name}</strong></td>
                <td><code style="color:#38bdf8; font-weight:bold;">${t.booking_code}</code></td>
                <td>${t.departure_date ? t.departure_date.replace('T', ' ') : '-'}</td>
                <td>${t.from_location} ➔ ${t.to_location}</td>
                <td><span class="agency-tag">${t.destination_agency || '-'}</span></td>
                <td><button class="restore-btn" onclick="window.location.href='ticket-card.html?category=tickets&id=${t.id}'">🎫 كرت</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
    else if (category === 'umrah') {
        headerRow.innerHTML = `
            <th>اسم المعتمر</th>
            <th>تاريخ الدخول</th>
            <th>تاريخ الخروج</th>
            <th>طريقة السفر</th>
            <th>الجهة التابع لها</th>
            <th>طباعة</th>
        `;

        if (dataList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد سجلات عمرة بأرشيف النظام.</td></tr>';
            return;
        }

        dataList.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${u.pilgrim_name}</strong></td>
                <td>${u.entry_date || '-'}</td>
                <td>${u.exit_date || '-'}</td>
                <td>${u.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
                <td><span class="agency-tag">${u.agency_type || '-'}</span></td>
                <td><button class="restore-btn" onclick="window.location.href='ticket-card.html?category=umrah&id=${u.id}'">🎫 كرت</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
    else if (category === 'visas') {
        headerRow.innerHTML = `
            <th>اسم المتقدم</th>
            <th>نوع التأشيرة</th>
            <th>تاريخ الصلاحية</th>
            <th>المصدر</th>
            <th>الوكيل</th>
            <th>طباعة</th>
        `;

        if (dataList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد سجلات تأشيرات بأرشيف النظام.</td></tr>';
            return;
        }

        dataList.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${v.visa_name}</strong></td>
                <td><span class="agency-tag">${v.visa_type || '-'}</span></td>
                <td>${v.visa_expiry_date || '-'}</td>
                <td>${v.visa_source || '-'}</td>
                <td>${v.visa_agent || '-'}</td>
                <td><button class="restore-btn" onclick="window.location.href='ticket-card.html?category=visas&id=${v.id}'">🎫 كرت</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

window.filterArchiveRows = function() {
    const searchText = document.getElementById('archive-search-input').value.toLowerCase().trim();
    const monthVal = document.getElementById('archive-month-input').value;
    const category = document.getElementById('archive-category-select').value;

    const filtered = rawArchiveData.filter(item => {
        const fullText = JSON.stringify(item).toLowerCase();
        const matchesText = !searchText || fullText.includes(searchText);

        let matchesMonth = true;
        if (monthVal) {
            const dateStr = item.departure_date || item.entry_date || item.visa_expiry_date || '';
            matchesMonth = dateStr.startsWith(monthVal);
        }

        return matchesText && matchesMonth;
    });

    renderArchiveTable(category, filtered);
};