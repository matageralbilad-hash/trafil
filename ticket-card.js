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

// دالة فصل التاريخ والوقت الذكية
function extractDateTime(dateTimeStr) {
    if (!dateTimeStr) return { date: '-', time: '-' };
    const cleanStr = dateTimeStr.replace('T', ' ');
    const parts = cleanStr.split(' ');
    return {
        date: parts[0] || '-',
        time: parts.slice(1).join(' ') || '-'
    };
}

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
            
            const depParts = extractDateTime(data.departure_date);
            document.getElementById('card-date').textContent = depParts.date;
            document.getElementById('card-time').textContent = depParts.time;
            
            document.getElementById('card-ret-date').textContent = data.return_date ? extractDateTime(data.return_date).date : 'ذهاب فقط ✈️';
            
            // الطيران افتراضياً اليمنية (قابل للتعديل عبر الـ HTML)
            document.getElementById('card-airline').textContent = 'اليمنية';
            
            document.getElementById('notes-content').textContent = 'يرجى التواجد في المطار قبل موعد الرحلة بثلاث ساعات ، والتأكد من حمل أصل الوثائق الشخصية والجوازات المعتمدة. نتمنى لكم رحلة سعيدة';

            generateQRCode(`PNR: ${data.booking_code} | Name: ${data.passenger_name} | Wafaa Travel`);
        } 
        else if (category === 'umrah') {
            document.getElementById('card-name').textContent = data.pilgrim_name || 'غير محدد';
            
            // إخفاء الـ PNR والملاحظات ومسار الطيران والطيران
            document.getElementById('pnr-container').style.display = 'none';
            document.getElementById('route-box').style.display = 'none';
            document.getElementById('card-notes').style.display = 'none';
            document.getElementById('grid-time').style.display = 'none';
            document.getElementById('grid-airline').style.display = 'none';

            document.getElementById('lbl-date').textContent = 'تاريخ الدخول:';
            document.getElementById('card-date').textContent = data.entry_date || '-';
            
            document.getElementById('lbl-ret').textContent = 'تاريخ الخروج:';
            document.getElementById('card-ret-date').textContent = data.exit_date || '-';

            generateQRCode(`Umrah Pilgrim: ${data.pilgrim_name} | Entry: ${data.entry_date}`);
        }
        else if (category === 'visas') {
            document.getElementById('card-name').textContent = data.visa_name || 'غير محدد';
            
            // تغيير الـ PNR إلى نوع التأشيرة
            document.getElementById('pnr-title').textContent = 'نوع التأشيرة';
            document.getElementById('card-pnr').textContent = data.visa_type || 'تأشيرة';
            document.getElementById('card-pnr').style.fontSize = '1.1rem'; // تصغير الخط قليلاً ليتسع
            
            document.getElementById('route-box').style.display = 'none';
            document.getElementById('grid-time').style.display = 'none';
            document.getElementById('grid-ret').style.display = 'none';
            document.getElementById('grid-airline').style.display = 'none';

            document.getElementById('lbl-date').textContent = 'تاريخ الانتهاء:';
            document.getElementById('card-date').textContent = data.visa_expiry_date || '-';

            document.getElementById('notes-content').textContent = 'يرجى التأكد من صلاحية التأشيرة ومطابقتها لجواز السفر قبل المغادرة. نتمنى لكم رحلة موفقة وآمنة!';

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

// دالة تصدير الكرت إلى صورة بجودة عالية وحفظها
window.exportToImage = function() {
    const card = document.getElementById('printable-card');
    
    // إخفاء التلميح الخاص بالتعديل قبل أخذ الصورة حتى لا يظهر للعميل
    const lblAirline = document.getElementById('lbl-airline');
    const originalLbl = lblAirline.textContent;
    lblAirline.textContent = 'الطيران:';
    
    html2canvas(card, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Wafaa_Ticket.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // إرجاع التلميح بعد أخذ الصورة
        lblAirline.textContent = originalLbl;
    });
};