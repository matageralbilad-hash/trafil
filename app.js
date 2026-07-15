// =================================================================
// 1️⃣ استيراد مكتبات Firebase الحديثة بنظام الـ Modules
// =================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// =================================================================
// 2️⃣ إعدادات Firebase الخاصة بمشروعك
// =================================================================
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

// مصفوفات فارغة لتخزين البيانات القادمة حياً من السيرفر
let ticketsData = [];
let umrahData = [];
let visasData = [];

// متغيرات عامة لحفظ التبويبات النشطة (لتصفية البيانات)
window.currentAirlinesTab = 'yemenia';
window.currentUmrahTab = 'sanabel';
window.currentVisasTab = 'security-approval';
let activePrintCategory = ''; // لتحديد القسم المراد طباعته حالياً

// =================================================================
// 3️⃣ الاتصال بقاعدة البيانات والانتظار الفوري للتحديثات
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFilters(); // تشغيل محرك البحث الفوري

    // 👈 استماع فوري للتذاكر
    const ticketsRef = ref(database, 'tickets');
    onValue(ticketsRef, (snapshot) => {
        ticketsData = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                ticketsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
        }
        renderTickets();
        updateSmartReports(); // تحديث تقارير الـ 48 والـ 72 ساعة فوراً
    });

    // 👈 استماع فوري لمعاملات العمرة
    const umrahRef = ref(database, 'umrah');
    onValue(umrahRef, (snapshot) => {
        umrahData = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                umrahData.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
        }
        renderUmrah();
    });

    // 👈 استماع فوري للتأشيرات
    const visasRef = ref(database, 'visas');
    onValue(visasRef, (snapshot) => {
        visasData = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                visasData.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
        }
        renderVisas();
    });
});

// =================================================================
// 4️⃣ دوال المعالجة والعرض في الجداول (Rendering)
// =================================================================

// 🎟️ [عرض وتصفية التذاكر]
function renderTickets() {
    const tbody = document.querySelector('#all-tickets-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (ticketsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد تذاكر مسجلة حالياً في النظام.</td></tr>';
        return;
    }

    const selectedTab = window.currentAirlinesTab || 'yemenia';

    const filtered = ticketsData.filter(ticket => {
        if (selectedTab === 'all-tickets') return true; 
        
        const agency = (ticket.destination_agency || '').toLowerCase();
        if (selectedTab === 'yemenia') return agency.includes('اليمنية') || agency.includes('yemenia');
        if (selectedTab === 'fly-aden') return agency.includes('عدن') || agency.includes('aden');
        if (selectedTab === 'arabia') return agency.includes('العربية') || agency.includes('arabia');
        if (selectedTab === 'other-airlines') {
            return !agency.includes('اليمنية') && !agency.includes('yemenia') &&
                   !agency.includes('عدن') && !agency.includes('aden') &&
                   !agency.includes('العربية') && !agency.includes('arabia');
        }
        return true; 
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:15px;">لا توجد بيانات متوفرة لهذا التصنيف.</td></tr>';
        return;
    }

    filtered.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${ticket.passenger_name}</strong></td>
            <td><code class="pnr-code">${ticket.booking_code}</code></td>
            <td>${formatDate(ticket.departure_date)}</td>
            <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
            <td>${ticket.return_date ? formatDate(ticket.return_date) : '<span class="one-way">ذهاب فقط ✈️</span>'}</td>
            <td>${ticket.source}</td>
            <td><span class="agency-tag">${ticket.destination_agency || 'غير محدد'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// 🕋 [عرض وتصفية العمرة]
function renderUmrah() {
    const tbody = document.querySelector('#all-umrah-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (umrahData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد معاملات عمرة مسجلة.</td></tr>';
        return;
    }

    const selectedTab = window.currentUmrahTab || 'sanabel';

    const filtered = umrahData.filter(item => {
        if (selectedTab === 'all-umrah') return true;
        const agency = (item.agency_type || '').toLowerCase();
        if (selectedTab === 'sanabel') return agency.includes('سنابل');
        if (selectedTab === 'ihram') return agency.includes('احرام') || agency.includes('إحرام');
        if (selectedTab === 'alamoudi') return agency.includes('العمودي');
        return true; 
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:15px;">لا توجد بيانات متوفرة لهذا التصنيف.</td></tr>';
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.pilgrim_name}</strong></td>
            <td>${item.entry_date}</td>
            <td>${item.exit_date}</td>
            <td>${item.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
            <td class="umrah-source-col">${item.umrah_source}</td>
            <td>${item.beneficiary}</td>
            <td><span class="agency-tag">${item.agency_type}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// 🛂 [عرض وتصفية التأشيرات]
function renderVisas() {
    const tbody = document.querySelector('#all-visas-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (visasData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد تأشيرات مسجلة.</td></tr>';
        return;
    }

    const selectedTab = window.currentVisasTab || 'security-approval';

    const filtered = visasData.filter(visa => {
        const type = (visa.visa_type || '');
        if (selectedTab === 'security-approval') return type.includes('موافقة أمنية');
        if (selectedTab === 'oman-transit') return type.includes('مرور عمان');
        if (selectedTab === 'other-visas') return type.includes('تأشيرات أخرى');
        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:15px;">لا توجد بيانات متوفرة لهذا التصنيف.</td></tr>';
        return;
    }

    filtered.forEach(visa => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${visa.visa_name}</strong></td>
            <td>${visa.visa_expiry_date}</td>
            <td><span class="agency-tag">${visa.visa_type}</span></td>
            <td>${visa.visa_source}</td>
            <td>${visa.visa_agent}</td>
        `;
        tbody.appendChild(row);
    });
}

// 📋 [تقارير ذكية تلقائية] - حساب الرحلات والعودة تلقائياً
function updateSmartReports() {
    const departureTbody = document.querySelector('#departure-table tbody');
    const returnTbody = document.querySelector('#return-table tbody');
    if (!departureTbody || !returnTbody) return;

    departureTbody.innerHTML = '';
    returnTbody.innerHTML = '';

    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    const seventyTwoHoursLater = new Date(now.getTime() + (72 * 60 * 60 * 1000));

    let departureCount = 0;
    let returnCount = 0;

    ticketsData.forEach(ticket => {
        if (ticket.departure_date) {
            const depDate = new Date(ticket.departure_date);
            if (depDate >= now && depDate <= fortyEightHoursLater) {
                departureCount++;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${ticket.passenger_name}</strong></td>
                    <td><code>${ticket.booking_code}</code></td>
                    <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
                    <td>${formatDate(ticket.departure_date)}</td>
                `;
                departureTbody.appendChild(row);
            }
        }

        if (ticket.return_date) {
            const retDate = new Date(ticket.return_date);
            if (retDate >= now && retDate <= seventyTwoHoursLater) {
                returnCount++;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${ticket.passenger_name}</strong></td>
                    <td><code>${ticket.booking_code}</code></td>
                    <td>${ticket.source}</td>
                    <td>${formatDate(ticket.return_date)}</td>
                `;
                returnTbody.appendChild(row);
            }
        }
    });

    if (departureCount === 0) departureTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">لا توجد رحلات مغادرة قريبة.</td></tr>';
    if (returnCount === 0) returnTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">لا توجد رحلات عودة قريبة مسجلة.</td></tr>';

    const depCardTitle = document.querySelector('.departure-card h3');
    const retCardTitle = document.querySelector('.return-card h3');
    
    if (depCardTitle) depCardTitle.innerHTML = `رحلات مغادرة خلال الـ 48 ساعة القادمة (<span style="color: #38bdf8; font-weight: bold;">${departureCount}</span>)`;
    if (retCardTitle) retCardTitle.innerHTML = `تذاكر العودة غير المفتوحة (خلال الـ 72 ساعة القادمة) (<span style="color: #10b981; font-weight: bold;">${returnCount}</span>)`;
}

// =================================================================
// 5️⃣ دوال التحكم وربطها بـ window لتعمل في الـ HTML الرئيسي
// =================================================================

// 📱 التبديل بين التبويبات الكبرى (تذاكر / عمرة / تأشيرات / تقارير)
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));
    document.querySelectorAll('.tabs-navigation .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active-content');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    window.closeDetailedReport('departure');
    window.closeDetailedReport('return');
};

// 📂 التبديل بين التبويبات الفرعية الداخلية وتصفية الجداول فوراً
window.switchSubTab = function(section, subTabId) {
    const btnContainer = event.currentTarget.parentElement;
    btnContainer.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (section === 'tickets') {
        window.currentAirlinesTab = subTabId;
        renderTickets();
    } else if (section === 'umrah') {
        window.currentUmrahTab = subTabId;
        renderUmrah();
    } else if (section === 'visas') {
        window.currentVisasTab = subTabId;
        renderVisas();
    }
};

// 📋 فتح تفاصيل تقارير المغادرة والعودة القريبة
window.openDetailedReport = function(type) {
    document.querySelector('.reports-summary-grid').style.display = 'none';
    document.getElementById(`${type}-report-view`).style.display = 'block';
};

// ↩️ إغلاق تفاصيل التقارير والعودة للقائمة الرئيسية للتقارير
window.closeDetailedReport = function(type) {
    const reportView = document.getElementById(`${type}-report-view`);
    if(reportView) reportView.style.display = 'none';
    const summaryGrid = document.querySelector('.reports-summary-grid');
    if(summaryGrid) summaryGrid.style.display = 'grid';
    
    const searchInput = document.getElementById(`${type}-search-input`);
    if (searchInput) {
        searchInput.value = '';
        document.querySelectorAll(`#${type}-table tbody tr`).forEach(row => row.style.display = "");
    }
};

// =================================================================
// 6️⃣ نظام الفلترة الذكية وتجهيز معاينة الـ PDF قبل الطباعة
// =================================================================

// فتح نافذة منسق الطباعة والـ PDF
window.openPrintWizard = function(category) {
    activePrintCategory = category;
    document.getElementById('filter-date-type').value = 'all';
    document.getElementById('filter-start-month').value = '';
    document.getElementById('filter-end-month').value = '';
    window.toggleDateInputs();
    
    const titleMap = {
        'tickets': 'طباعة تقرير تذاكر الطيران المنسقة',
        'umrah': 'طباعة كشف تأشيرات المعتمرين المسجلة',
        'visas': 'طباعة سجل التأشيرات المعالجة',
        'departure': 'طباعة تقرير الرحلات المغادرة القريبة',
        'return': 'طباعة تقرير رحلات العودة القادمة'
    };
    document.getElementById('wizard-modal-title').innerText = `🖨️ ${titleMap[category] || 'طباعة التقارير'}`;
    window.generatePrintPreview();
    document.getElementById('printWizardModal').style.display = 'flex';
};

// إغلاق نافذة الطباعة
window.closePrintWizard = function() {
    document.getElementById('printWizardModal').style.display = 'none';
};

// إخفاء/إظهار حقول اختيار الشهر عند الطباعة
window.toggleDateInputs = function() {
    const type = document.getElementById('filter-date-type').value;
    const inputs = document.querySelectorAll('.date-input-group');
    inputs.forEach(el => {
        el.style.display = (type === 'range') ? 'flex' : 'none';
    });
};

// إنشاء المعاينة المباشرة لجدول الطباعة
window.generatePrintPreview = function() {
    const previewContainer = document.getElementById('print-preview-container');
    const dateType = document.getElementById('filter-date-type').value;
    const startMonthVal = document.getElementById('filter-start-month').value; 
    const endMonthVal = document.getElementById('filter-end-month').value;     
    
    let sourceTableId = '';
    let titleText = '';
    let dateColumnIndex = -1; 

    if (activePrintCategory === 'tickets') {
        sourceTableId = 'all-tickets-table';
        titleText = 'تقرير تذاكر السفر المعتمدة';
        dateColumnIndex = 2; 
    } else if (activePrintCategory === 'umrah') {
        sourceTableId = 'all-umrah-table';
        titleText = 'كشف تأشيرات العمرة للمعتمرين';
        dateColumnIndex = 1; 
    } else if (activePrintCategory === 'visas') {
        sourceTableId = 'all-visas-table';
        titleText = 'بيان التأشيرات والموافقات الأمنية';
        dateColumnIndex = 1; 
    } else if (activePrintCategory === 'departure') {
        sourceTableId = 'departure-table';
        titleText = 'كشف الرحلات المغادرة (خلال 48 ساعة)';
        dateColumnIndex = 3; 
    } else if (activePrintCategory === 'return') {
        sourceTableId = 'return-table';
        titleText = 'كشف رحلات العودة المستحقة (خلال 72 ساعة)';
        dateColumnIndex = 3; 
    }

    const originalTable = document.getElementById(sourceTableId);
    if (!originalTable) {
        previewContainer.innerHTML = '<p style="color:red; text-align:center;">تعذر العثور على جدول البيانات النشط.</p>';
        return;
    }

    // استنساخ الجدول الأصلي لكي نعدل عليه في المعاينة دون التأثير على الجدول الفعلي في الصفحة
    const tableCloned = originalTable.cloneNode(true);
    tableCloned.removeAttribute('id');
    
    const rows = tableCloned.