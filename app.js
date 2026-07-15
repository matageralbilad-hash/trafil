// =================================================================
// 🌟 نظام إدارة الحجوزات والمعاملات - لوحة التحكم التفاعلية المحدثة
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// إعدادات اتصال قاعدة بيانات Firebase لمكتب وفاء سيئون
const firebaseConfig = {
    apiKey: "AIzaSyDG3sWbnHQe0CN1ivOZVTrryOI-H5w0Eao",
    authDomain: "travel-agency-app-95c51.firebaseapp.com",
    projectId: "travel-agency-app-95c51",
    storageBucket: "travel-agency-app-95c51.firebasestorage.app",
    messagingSenderId: "83193496753",
    appId: "1:83193496753:web:b79eba52db8bfd43374e90",
    measurementId: "G-803PP5Q1WT"
};

// حاويات تخزين البيانات محلياً (Offline Cache) لسرعة استجابة فورية
let ticketsData = [];
let umrahData = [];
let visasData = [];

// =================================================================
// 1️⃣ بدء التطبيق بمجرد تحميل واجهة الصفحة
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFilters(); // تفعيل محرك البحث والفرز الداخلي الفوري

    // 👈 استرجاع موقع المستخدم القديم وتبويباته السابقة بذكاء عند الرجوع من صفحة التعديل
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('activeTab');
    const activeSub = urlParams.get('activeSub');

    if (activeTab) {
        setTimeout(() => {
            const targetBtn = document.querySelector(`.tabs-navigation .tab-btn[onclick*="${activeTab}"]`);
            if (targetBtn) {
                targetBtn.click();
                
                // إذا وجد تبويب فرعي نشط نقم بالانتقال إليه
                if (activeSub) {
                    const subBtn = document.querySelector(`.sub-tabs .sub-tab-btn[onclick*="${activeSub}"]`);
                    if (subBtn) subBtn.click();
                }
            }
        }, 150); 
    }

    initializeFirebase(); // بدء الاتصال بالخادم والتحميل الحسابي
});

// =================================================================
// 2️⃣ تهيئة قاعدة بيانات Firebase وجلب التحديثات فوراً
// =================================================================
function initializeFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // أ) مراقبة تذاكر الطيران وجلبها تلقائياً عند أي تعديل
        onValue(ref(database, 'tickets'), (snapshot) => {
            ticketsData = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                ticketsData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            }
            renderTickets();
        }, (error) => {
            console.error("خطأ في مزامنة التذاكر:", error);
        });

        // ب) مراقبة معاملات العمرة
        onValue(ref(database, 'umrah'), (snapshot) => {
            umrahData = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                umrahData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            }
            renderUmrah();
        }, (error) => {
            console.error("خطأ في مزامنة العمرة:", error);
        });

        // ج) مراقبة مستندات التأشيرات
        onValue(ref(database, 'visas'), (snapshot) => {
            visasData = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                visasData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            }
            renderVisas();
        }, (error) => {
            console.error("خطأ في مزامنة التأشيرات:", error);
        });

    } catch (e) {
        console.error("تعذر تهيئة Firebase المباشر، تحقق من اتصال الشبكة.", e);
    }
}

// =================================================================
// 3️⃣ دوال العرض الذكية ورسم الجداول التفاعلية (مع إضافة روابط النقر للتعديل)
// =================================================================

// 🎟️ [عرض وتصفية التذاكر]
window.renderTickets = function() {
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
        row.style.cursor = 'pointer'; 
        row.title = "اضغط لتعديل أو حذف التذكرة ✏️";
        
        // عند النقر يتم الانتقال لصفحة التعديل مع إرسال القسم والمعرف وموقع الرجوع الذكي
        row.onclick = () => {
            window.location.href = `edit.html?category=tickets&id=${ticket.id}&backTab=tickets&backSub=${selectedTab}`;
        };

        row.innerHTML = `
            <td><strong>${ticket.passenger_name}</strong></td>
            <td><code class="pnr-code" style="color: #38bdf8; font-weight: bold; font-family: monospace;">${ticket.booking_code}</code></td>
            <td>${formatDate(ticket.departure_date)}</td>
            <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
            <td>${ticket.return_date ? formatDate(ticket.return_date) : '<span style="color: #ef4444; font-size: 11px;">ذهاب فقط ✈️</span>'}</td>
            <td>${ticket.source}</td>
            <td><span class="agency-tag" style="background:#151f32; padding:4px 8px; border-radius:6px; border:1px solid #334155; font-size:12px;">${ticket.destination_agency || 'غير محدد'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// 🕋 [عرض وتصفية العمرة]
window.renderUmrah = function() {
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
        row.style.cursor = 'pointer';
        row.title = "اضغط لتعديل أو حذف المعاملة ✏️";
        
        row.onclick = () => {
            window.location.href = `edit.html?category=umrah&id=${item.id}&backTab=umrah&backSub=${selectedTab}`;
        };

        row.innerHTML = `
            <td><strong>${item.pilgrim_name}</strong></td>
            <td>${item.entry_date}</td>
            <td>${item.exit_date}</td>
            <td>${item.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
            <td class="umrah-source-col">${item.umrah_source}</td>
            <td>${item.beneficiary}</td>
            <td><span class="agency-tag" style="background:#151f32; padding:4px 8px; border-radius:6px; border:1px solid #334155; font-size:12px;">${item.agency_type}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// 🛂 [عرض وتصفية التأشيرات]
window.renderVisas = function() {
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
        row.style.cursor = 'pointer';
        row.title = "اضغط لتعديل أو حذف التأشيرة ✏️";
        
        row.onclick = () => {
            window.location.href = `edit.html?category=visas&id=${visa.id}&backTab=visas&backSub=${selectedTab}`;
        };

        row.innerHTML = `
            <td><strong>${visa.visa_name}</strong></td>
            <td>${visa.visa_expiry_date}</td>
            <td><span class="agency-tag" style="background:#151f32; padding:4px 8px; border-radius:6px; border:1px solid #334155; font-size:12px;">${visa.visa_type}</span></td>
            <td>${visa.visa_source}</td>
            <td>${visa.visa_agent}</td>
        `;
        tbody.appendChild(row);
    });
}

// =================================================================
// 4️⃣ محركات البحث الفورية والفلترة بالوقت الحقيقي للجداول
// =================================================================
function setupSearchFilters() {
    // محرك البحث لتذاكر الطيران
    const searchTicketInput = document.getElementById('search-ticket-input');
    if (searchTicketInput) {
        searchTicketInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#all-tickets-table tbody', query);
        });
    }

    // محرك البحث لمعاملات العمرة
    const searchUmrahInput = document.getElementById('search-umrah-input');
    if (searchUmrahInput) {
        searchUmrahInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#all-umrah-table tbody', query);
        });
    }

    // محرك البحث للتأشيرات
    const searchVisaInput = document.getElementById('search-visa-input');
    if (searchVisaInput) {
        searchVisaInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#all-visas-table tbody', query);
        });
    }
}

// دالة الفرز السريع للأسطر بناءً على قيمة حقل المدخل
function filterTableRows(tbodySelector, query) {
    const rows = document.querySelectorAll(`${tbodySelector} tr`);
    rows.forEach(row => {
        if (row.cells.length <= 1 && row.textContent.includes('لا توجد')) return;
        const textContent = row.textContent.toLowerCase();
        row.style.display = textContent.includes(query) ? '' : 'none';
    });
}

// =================================================================
// 5️⃣ نظام التنقل الأساسي والفرعي بين التبويبات (Tabs Navigation)
// =================================================================

// تغيير التبويب الرئيسي
window.switchTab = function(tabName, btnElement) {
    // تحديث أزرار التنقل الرئيسية
    document.querySelectorAll('.tabs-navigation .tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // تفعيل نافذة المحتوى المطلوبة وإخفاء الأخريات
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active-content'));
    const targetContent = document.getElementById(`${tabName}-tab`);
    if (targetContent) targetContent.classList.add('active-content');
};

// تصفية شركات الطيران (تذاكر)
window.filterAirlines = function(subTabName, btnElement) {
    const parentContainer = btnElement.parentElement;
    parentContainer.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    window.currentAirlinesTab = subTabName;
    renderTickets();
};

// تصفية وكلاء العمرة (سنابل، إحرام، العمودي)
window.filterUmrah = function(subTabName, btnElement) {
    const parentContainer = btnElement.parentElement;
    parentContainer.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    window.currentUmrahTab = subTabName;
    renderUmrah();
};

// تصفية أنواع التأشيرات
window.filterVisas = function(subTabName, btnElement) {
    const parentContainer = btnElement.parentElement;
    parentContainer.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    window.currentVisasTab = subTabName;
    renderVisas();
};

// =================================================================
// 6️⃣ مصنع تنسيق التواريخ والجماليات
// =================================================================
function formatDate(dateTimeStr) {
    if (!dateTimeStr) return '';
    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return dateTimeStr;

        const datePart = date.toLocaleDateString('ar-YE', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? 'م' : 'ص';
        const formattedHours = hours % 12 || 12;

        // إرجاع التاريخ والوقت بتنسيق عربي فاخر وسهل القراءة
        return `${datePart} - ${formattedHours}:${minutes} ${period}`;
    } catch {
        return dateTimeStr;
    }
}

// =================================================================
// 7️⃣ معالج الطباعة الاحترافي وإنشاء تقارير الـ PDF المفلترة
// =================================================================

// فتح موديول الطباعة
window.openPrintWizard = function(categoryType) {
    const modal = document.getElementById('print-modal-wizard');
    if (!modal) return;

    modal.dataset.category = categoryType;
    modal.style.display = 'flex';

    const selectElement = document.getElementById('wizard-sub-category');
    selectElement.innerHTML = '';

    // بناء خيارات التصفية للمصادر تلقائياً بناء على الفئات المحددة
    if (categoryType === 'tickets') {
        document.getElementById('wizard-modal-title').innerText = "🖨️ طباعة تقرير تذاكر الطيران المخصص";
        selectElement.innerHTML = `
            <option value="all">كل طيران الشركات المتوفرة</option>
            <option value="yemenia">طيران اليمنية فقط</option>
            <option value="fly-aden">طيران الملكة بلقيس (عدن) فقط</option>
            <option value="arabia">طيران العربية فقط</option>
            <option value="other">شركات طيران أخرى</option>
        `;
    } else if (categoryType === 'umrah') {
        document.getElementById('wizard-modal-title').innerText = "🖨️ طباعة تقارير وكالات العمرة والمقاولين";
        selectElement.innerHTML = `
            <option value="all">كل الوكلاء والمسجلين</option>
            <option value="sanabel">وكالة السنابل</option>
            <option value="ihram">وكالة الإحرام</option>
            <option value="alamoudi">وكالة العمودي</option>
        `;
    } else if (categoryType === 'visas') {
        document.getElementById('wizard-modal-title').innerText = "🖨️ طباعة وتنسيق قائمة مستندات التأشيرات";
        selectElement.innerHTML = `
            <option value="all">كل التأشيرات المتوفرة</option>
            <option value="security-approval">موافقات أمنية</option>
            <option value="oman-transit">مرور سلطنة عمان</option>
            <option value="other-visas">تأشيرات المعاملات الأخرى</option>
        `;
    }

    // تصفير مدخلات التواريخ والمعاينة السابقة
    document.getElementById('wizard-start-date').value = '';
    document.getElementById('wizard-end-date').value = '';
    document.getElementById('wizard-print-preview-area').innerHTML = '<p style="text-align: center; color: #64748b; padding: 30px;">اضغط على "تحديث وتجهيز المعاينة ⚡" لإظهار ورقة الطباعة البيضاء قبل سحبها</p>';
};

// إغلاق موديول الطباعة والمعاينة
window.closePrintWizard = function() {
    const modal = document.getElementById('print-modal-wizard');
    if (modal) modal.style.display = 'none';
};

// توليد صفحة المعاينة المباشرة (الورقة البيضاء الفخمة) بناءً على الفلاتر المدخلة
window.generateLivePrintPreview = function() {
    const modal = document.getElementById('print-modal-wizard');
    const category = modal.dataset.category;
    const subCategory = document.getElementById('wizard-sub-category').value;
    const startDateVal = document.getElementById('wizard-start-date').value;
    const endDateVal = document.getElementById('wizard-end-date').value;

    const startDate = startDateVal ? new Date(startDateVal) : null;
    const endDate = endDateVal ? new Date(endDateVal) : null;

    let recordsToPrint = [];
    let titleReport = 'تقرير عام';

    // 1. فلاتر التصفية والتصنيف بناء على التذاكر
    if (category === 'tickets') {
        titleReport = '📄 تقرير تذاكر الطيران';
        recordsToPrint = ticketsData.filter(ticket => {
            // تصفية الشركات والناقلين
            const agency = (ticket.destination_agency || '').toLowerCase();
            if (subCategory === 'yemenia' && !(agency.includes('اليمنية') || agency.includes('yemenia'))) return false;
            if (subCategory === 'fly-aden' && !(agency.includes('عدن') || agency.includes('aden'))) return false;
            if (subCategory === 'arabia' && !(agency.includes('العربية') || agency.includes('arabia'))) return false;
            if (subCategory === 'other' && (agency.includes('اليمنية') || agency.includes('عدن') || agency.includes('العربية'))) return false;

            // التصفية التاريخية
            if (ticket.departure_date) {
                const depDate = new Date(ticket.departure_date);
                if (startDate && depDate < startDate) return false;
                if (endDate && depDate > endDate) return false;
            }
            return true;
        });
    } 
    // 2. فلاتر التصفية للعمرة
    else if (category === 'umrah') {
        titleReport = '🕋 بيان وتفاصيل كشوفات المعتمرين';
        recordsToPrint = umrahData.filter(item => {
            const agency = (item.agency_type || '').toLowerCase();
            if (subCategory === 'sanabel' && !agency.includes('سنابل')) return false;
            if (subCategory === 'ihram' && !agency.includes('إحرام')) return false;
            if (subCategory === 'alamoudi' && !agency.includes('العمودي')) return false;

            if (item.entry_date) {
                const entDate = new Date(item.entry_date);
                if (startDate && entDate < startDate) return false;
                if (endDate && entDate > endDate) return false;
            }
            return true;
        });
    } 
    // 3. فلاتر التصفية للتأشيرات
    else if (category === 'visas') {
        titleReport = '🛂 تقرير قائمة معاملات التأشيرات';
        recordsToPrint = visasData.filter(visa => {
            const type = (visa.visa_type || '');
            if (subCategory === 'security-approval' && !type.includes('موافقة أمنية')) return false;
            if (subCategory === 'oman-transit' && !type.includes('مرور عمان')) return false;
            if (subCategory === 'other-visas' && !type.includes('تأشيرات أخرى')) return false;

            if (visa.visa_expiry_date) {
                const expDate = new Date(visa.visa_expiry_date);
                if (startDate && expDate < startDate) return false;
                if (endDate && expDate > endDate) return false;
            }
            return true;
        });
    }

    // عرض مخرجات المعاينة
    const previewContainer = document.getElementById('wizard-print-preview-area');
    if (recordsToPrint.length === 0) {
        previewContainer.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 30px; font-weight: bold;">⚠️ لا توجد أي نتائج مطابقة للشروط والتواريخ المحددة!</p>';
        return;
    }

    // بناء هيكل ورقة الطباعة البيضاء A4
    let tableHtml = `
        <div class="preview-title">${titleReport}</div>
        <p style="text-align: center; margin-bottom: 20px; font-size: 11px; color: #475569;">طبعت في: ${new Date().toLocaleDateString('ar-YE')} | لوحة مكتب وفاء سيئون</p>
        <table>
    `;

    if (category === 'tickets') {
        tableHtml += `
            <thead>
                <tr>
                    <th>اسم الراكب</th>
                    <th>رقم الحجز (PNR)</th>
                    <th>تاريخ المغادرة</th>
                    <th>مسار الرحلة</th>
                    <th>تاريخ العودة</th>
                    <th>المصدر</th>
                    <th>الشركة الناقلة</th>
                </tr>
            </thead>
            <tbody>
                ${recordsToPrint.map(ticket => `
                    <tr>
                        <td><strong>${ticket.passenger_name}</strong></td>
                        <td>${ticket.booking_code}</td>
                        <td>${formatDate(ticket.departure_date)}</td>
                        <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
                        <td>${ticket.return_date ? formatDate(ticket.return_date) : 'ذهاب فقط'}</td>
                        <td>${ticket.source}</td>
                        <td>${ticket.destination_agency || 'غير محدد'}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    } else if (category === 'umrah') {
        tableHtml += `
            <thead>
                <tr>
                    <th>اسم المعتمر</th>
                    <th>تاريخ الدخول</th>
                    <th>تاريخ الخروج</th>
                    <th>السفر</th>
                    <th class="hide-source-col">المصدر</th>
                    <th>المستفيد</th>
                    <th>الوكالة</th>
                </tr>
            </thead>
            <tbody>
                ${recordsToPrint.map(item => `
                    <tr>
                        <td><strong>${item.pilgrim_name}</strong></td>
                        <td>${item.entry_date}</td>
                        <td>${item.exit_date}</td>
                        <td>${item.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
                        <td class="hide-source-col">${item.umrah_source}</td>
                        <td>${item.beneficiary}</td>
                        <td>${item.agency_type}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    } else if (category === 'visas') {
        tableHtml += `
            <thead>
                <tr>
                    <th>الاسم الكريم</th>
                    <th>تاريخ الانتهاء</th>
                    <th>نوع التأشيرة</th>
                    <th>المصدر</th>
                    <th>الوكيل المسئول</th>
                </tr>
            </thead>
            <tbody>
                ${recordsToPrint.map(visa => `
                    <tr>
                        <td><strong>${visa.visa_name}</strong></td>
                        <td>${visa.visa_expiry_date}</td>
                        <td>${visa.visa_type}</td>
                        <td>${visa.visa_source}</td>
                        <td>${visa.visa_agent}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
    }

    tableHtml += `</table>`;
    previewContainer.innerHTML = tableHtml;
};

// استدعاء نظام الطباعة الأصلي للمتصفح
window.executePrintJob = function() {
    window.print();
};