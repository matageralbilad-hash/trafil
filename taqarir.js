import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// إعدادات اتصال قاعدة بيانات Firebase
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
const database = getDatabase(app);

// حاويات البيانات
let allTickets = [];
let allUmrah = [];
let allVisas = [];

// مصفوفة الأشهر المطلوبة (من يوليو 2026 إلى ديسمبر 2027 كمثال واسع)
const monthsList = [
    { value: '2026-08', label: 'أغسطس 2026' }, { value: '2026-09', label: 'سبتمبر 2026' },
    { value: '2026-10', label: 'أكتوبر 2026' }, { value: '2026-11', label: 'نوفمبر 2026' },
    { value: '2026-12', label: 'ديسمبر 2026' }, { value: '2027-01', label: 'يناير 2027' },
    { value: '2027-02', label: 'فبراير 2027' }, { value: '2027-03', label: 'مارس 2027' },
    { value: '2027-04', label: 'أبريل 2027' }, { value: '2027-05', label: 'مايو 2027' },
    { value: '2027-06', label: 'يونيو 2027' }, { value: '2027-07', label: 'يوليو 2027' },
    { value: '2027-08', label: 'أغسطس 2027' }
];
document.addEventListener('DOMContentLoaded', async () => {
    generateMonthFolders();
    await fetchAllData();
});

// 1️⃣ بناء شبكة مجلدات الأشهر
function generateMonthFolders() {
    const grid = document.getElementById('months-grid');
    grid.innerHTML = '';
    
    monthsList.forEach(month => {
        const folder = document.createElement('div');
        folder.className = 'month-folder';
        folder.onclick = () => openReportForMonth(month.value, month.label);
        folder.innerHTML = `
            <div class="folder-icon">📂</div>
            <div class="folder-title">${month.label}</div>
        `;
        grid.appendChild(folder);
    });
}

// 2️⃣ جلب كل البيانات مرة واحدة لتسريع الفلترة
async function fetchAllData() {
    try {
        const [tickSnap, umrahSnap, visaSnap] = await Promise.all([
            get(ref(database, 'tickets')),
            get(ref(database, 'umrah')),
            get(ref(database, 'visas'))
        ]);

        if (tickSnap.exists()) {
            const raw = tickSnap.val();
            allTickets = Object.keys(raw).map(k => raw[k]);
        }
        if (umrahSnap.exists()) {
            const raw = umrahSnap.val();
            allUmrah = Object.keys(raw).map(k => raw[k]);
        }
        if (visaSnap.exists()) {
            const raw = visaSnap.val();
            allVisas = Object.keys(raw).map(k => raw[k]);
        }
        document.getElementById('loading-text').style.display = 'none';
    } catch (e) {
        document.getElementById('loading-text').innerText = '❌ حدث خطأ في جلب البيانات!';
    }
}

// دالة مساعدة لاستخراج العنصر الأكثر تكراراً
function getMostFrequent(array, key) {
    if (!array || array.length === 0) return 'غير متوفر';
    const counts = {};
    let maxCount = 0;
    let mostFrequent = 'غير متوفر';

    array.forEach(item => {
        const val = item[key];
        if (val) {
            counts[val] = (counts[val] || 0) + 1;
            if (counts[val] > maxCount) {
                maxCount = counts[val];
                mostFrequent = val;
            }
        }
    });
    return mostFrequent;
}

// 3️⃣ توليد التقرير عند الضغط على شهر معين
window.openReportForMonth = function(monthValue, monthLabel) {
    document.getElementById('report-title').innerText = `التقرير الإحصائي الشامل - ${monthLabel}`;
    document.getElementById('report-timestamp').innerText = `تاريخ استخراج التقرير: ${new Date().toLocaleString('ar-YE')}`;

    // فلترة بيانات الشهر بناءً على تاريخ الإدخال الفعلي للنظام حصراً
const tMonth = allTickets.filter(t => t.created_at && t.created_at.startsWith(monthValue));
const uMonth = allUmrah.filter(u => u.created_at && u.created_at.startsWith(monthValue));
const vMonth = allVisas.filter(v => v.created_at && v.created_at.startsWith(monthValue));
    // الإحصائيات والأرقام
    const tCount = tMonth.length;
    const uCount = uMonth.length;
    const omanVisas = vMonth.filter(v => v.visa_type && v.visa_type.includes('عمان')).length;
    const secVisas = vMonth.filter(v => v.visa_type && v.visa_type.includes('أمنية')).length;

    // استخراج الأكثر تكراراً
    const topAgency = getMostFrequent(tMonth, 'destination_agency');
    const topDestination = getMostFrequent(tMonth, 'to_location');
    
    // أكثر مستفيد للحجوزات (المصدر في التذاكر والتأشيرات)
    const allSources = [...tMonth.map(t => ({src: t.source})), ...vMonth.map(v => ({src: v.visa_source}))];
    const topBeneficiarySource = getMostFrequent(allSources, 'src');

    // أكثر مستفيد وجهة في العمرة
    const topUmrahBeneficiary = getMostFrequent(uMonth, 'beneficiary');
    const topUmrahAgency = getMostFrequent(uMonth, 'agency_type');

    // إجمالي العمليات
    const totalOps = tCount + uCount + vMonth.length;

    // حقن البيانات في الواجهة
    const content = document.getElementById('report-content');
    content.innerHTML = `
        <div class="stat-box highlight">
            <h4>إجمالي العمليات المنجزة</h4>
            <p>${totalOps} <span>عملية</span></p>
        </div>
        <div class="stat-box">
            <h4>إجمالي التذاكر (خلال الشهر)</h4>
            <p>${tCount} <span>تذكرة</span></p>
        </div>
        <div class="stat-box">
            <h4>إجمالي تأشيرات العمرة</h4>
            <p>${uCount} <span>معتمر</span></p>
        </div>
        <div class="stat-box">
            <h4>تأشيرات مرور عمان</h4>
            <p>${omanVisas} <span>تأشيرة</span></p>
        </div>
        <div class="stat-box warning">
            <h4>الموافقات الأمنية</h4>
            <p>${secVisas} <span>موافقة</span></p>
        </div>
        <div class="stat-box">
            <h4>أكثر مستفيد (مكاتب/مصادر)</h4>
            <p style="font-size:1.1rem;">${topBeneficiarySource}</p>
        </div>
        <div class="stat-box highlight">
            <h4>أكثر جهة تم الحجز منها (طيران)</h4>
            <p style="font-size:1.1rem;">${topAgency}</p>
        </div>
        <div class="stat-box">
            <h4>الوجهة الأكثر طلباً (طيران)</h4>
            <p style="font-size:1.1rem;">${topDestination}</p>
        </div>
        <div class="stat-box highlight">
            <h4>أكثر مستفيد من العمرة</h4>
            <p style="font-size:1.1rem;">${topUmrahBeneficiary}</p>
        </div>
        <div class="stat-box warning">
            <h4>أكثر جهة تابع لها (عمرة)</h4>
            <p style="font-size:1.1rem;">${topUmrahAgency}</p>
        </div>
    `;

    document.getElementById('reportModal').style.display = 'block';
};

window.closeReport = function() {
    document.getElementById('reportModal').style.display = 'none';
};

// 4️⃣ وظيفة التقاط الشاشة (حفظ كصورة)
window.saveAsImage = function() {
    const reportElement = document.getElementById('printable-report');
    
    // إضافة لون خلفية أبيض مؤقت لضمان خروج الصورة نظيفة
    reportElement.style.backgroundColor = "#ffffff";
    
    html2canvas(reportElement, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `تقرير_مكتب_وفاء_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        alert("حدث خطأ أثناء التقاط الصورة!");
        console.error(err);
    });
};
