// =================================================================
// 🎟️ سكريبت جلب وتوليد كروت الحجز الرسمية - مكتب وفاء سيئون
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'tickets';
    const id = urlParams.get('id');

    if (!id) {
        alert('❌ لم يتم العثور على المعاملة المطلوبة!');
        return;
    }

    loadTicketData(category, id);
});

async function loadTicketData(category, id) {
    try {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        const snapshot = await get(ref(database, `${category}/${id}`));

        if (!snapshot.exists()) {
            alert('❌ البيانات غير موجودة بالنظام!');
            return;
        }

        const data = snapshot.val();

        if (category === 'tickets') {
            document.getElementById('card-name').textContent = data.passenger_name || 'غير محدد';
            document.getElementById('card-pnr').textContent = data.booking_code || '---';
            document.getElementById('card-from').textContent = data.from_location || '-';
            document.getElementById('card-to').textContent = data.to_location || '-';
            document.getElementById('card-dep-date').textContent = formatDate(data.departure_date);
            document.getElementById('card-ret-date').textContent = data.return_date ? formatDate(data.return_date) : 'ذهاب فقط ✈️';
            document.getElementById('card-agency').textContent = data.destination_agency || 'مكتب وفاء';
            document.getElementById('card-source').textContent = data.source || 'المكتب الرئيسي';

            // توليد الـ QR Code لكود الحجز
            generateQRCode(`PNR: ${data.booking_code} | Name: ${data.passenger_name} | Wafaa Travel`);
        } 
        else if (category === 'umrah') {
            document.getElementById('card-name').textContent = data.pilgrim_name || 'غير محدد';
            document.getElementById('card-pnr').textContent = 'عمرة 🕋';
            document.getElementById('route-box').style.display = 'none'; // إخفاء مسار الطيران للعمرة
            document.getElementById('card-dep-date').textContent = data.entry_date || '-';
            document.getElementById('card-ret-date').textContent = data.exit_date || '-';
            document.getElementById('card-agency').textContent = data.agency_type || '-';
            document.getElementById('card-source').textContent = data.beneficiary || '-';

            generateQRCode(`Umrah Pilgrim: ${data.pilgrim_name} | Entry: ${data.entry_date}`);
        }
        else if (category === 'visas') {
            document.getElementById('card-name').textContent = data.visa_name || 'غير محدد';
            document.getElementById('card-pnr').textContent = 'تأشيرة 🛂';
            document.getElementById('route-box').style.display = 'none';
            document.getElementById('card-dep-date').textContent = data.visa_expiry_date || '-';
            document.getElementById('card-ret-date').textContent = 'تاريخ الانتهاء';
            document.getElementById('card-agency').textContent = data.visa_type || '-';
            document.getElementById('card-source').textContent = data.visa_agent || '-';

            generateQRCode(`Visa Name: ${data.visa_name} | Type: ${data.visa_type}`);
        }

    } catch (e) {
        console.error("خطأ في قراءة بيانات الكرت:", e);
    }
}

function generateQRCode(text) {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: text,
        width: 80,
        height: 80,
        colorDark : "#0f172a",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

function formatDate(dateTimeStr) {
    if (!dateTimeStr) return '-';
    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return dateTimeStr;
        return date.toLocaleDateString('ar-YE', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
               date.toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateTimeStr;
    }
}