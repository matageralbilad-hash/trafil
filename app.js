// استدعاء أو تهيئة قاعدة البيانات المحلية من المتصفح لضمان استقرار وحفظ البيانات
let ticketsData = JSON.parse(localStorage.getItem('ticketsData')) || [];
let umrahData = JSON.parse(localStorage.getItem('umrahData')) || [];
let visasData = JSON.parse(localStorage.getItem('visasData')) || [];

// الدالة الرئيسية لتشغيل الفلاتر وعرض البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderTickets();
    renderUmrah();
    renderVisas();
    setupSearchFilters();
});

// 🎟️ [قسم التذاكر] - جلب البيانات وتصفيتها بناءً على الزر الفرعي النشط
function renderTickets() {
    const tbody = document.querySelector('#all-tickets-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const selectedTab = window.currentAirlinesTab || 'yemenia';

    // فلترة التذاكر حسب الجهة/شركة الطيران المحددة
    const filtered = ticketsData.filter(ticket => {
        const agency = (ticket.destination_agency || '').toLowerCase();
        if (selectedTab === 'yemenia') return agency.includes('اليمنية') || agency.includes('yemenia');
        if (selectedTab === 'fly-aden') return agency.includes('عدن') || agency.includes('aden');
        if (selectedTab === 'arabia') return agency.includes('العربية') || agency.includes('arabia');
        if (selectedTab === 'other-airlines') {
            return !agency.includes('اليمنية') && !agency.includes('yemenia') &&
                   !agency.includes('عدن') && !agency.includes('aden') &&
                   !agency.includes('العربية') && !agency.includes('arabia');
        }
        return true; // كل التذاكر
    });

    filtered.forEach(ticket => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${ticket.passenger_name}</strong></td>
            <td><code class="pnr-code">${ticket.booking_code}</code></td>
            <td>${formatDate(ticket.departure_date)}</td>
            <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
            <td>${ticket.return_date ? formatDate(ticket.return_date) : '<span class="one-way">ذهاب فقط ✈️</span>'}</td>
            <td>${ticket.source}</td>
            <td><span class="agency-tag">${ticket.destination_agency}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// 🕋 [قسم جدول العمرة] - جلب البيانات وتصفيتها بناءً على الوكيل أو الجهة
function renderUmrah() {
    const tbody = document.querySelector('#all-umrah-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const selectedTab = window.currentUmrahTab || 'sanabel';

    const filtered = umrahData.filter(item => {
        const agency = (item.agency_type || '').toLowerCase();
        if (selectedTab === 'sanabel') return agency.includes('سنابل');
        if (selectedTab === 'ihram') return agency.includes('احرام') || agency.includes('إحرام');
        if (selectedTab === 'alamoudi') return agency.includes('العمودي');
        return true; // كل تأشيرات العمرة
    });

    filtered.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.pilgrim_name}</strong></td>
            <td>${item.entry_date}</td>
            <td>${item.exit_date}</td>
            <td>${item.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
            <td>${item.umrah_source}</td>
            <td>${item.beneficiary}</td>
            <td><span class="agency-tag">${item.agency_type}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// 🛂 [قسم التأشيرات الجديد] - جلب وعرض الموافقات ومرور عمان
function renderVisas() {
    const tbody = document.querySelector('#all-visas-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const selectedTab = window.currentVisasTab || 'security-approval';

    const filtered = visasData.filter(visa => {
        const type = (visa.visa_type || '');
        if (selectedTab === 'security-approval') return type.includes('موافقة أمنية');
        if (selectedTab === 'oman-transit') return type.includes('مرور عمان');
        if (selectedTab === 'other-visas') return type.includes('تأشيرات أخرى');
        return true;
    });

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

// تفعيل استماع الأحداث للتنقل الفرعي المباشر من واجهة الـ HTML
window.addEventListener('filter-tickets', renderTickets);
window.addEventListener('filter-umrah', renderUmrah);
window.addEventListener('filter-visas', renderVisas);

// 🔍 محرك البحث الفوري في الجداول
function setupSearchFilters() {
    setupTableSearch('tickets-search-input', 'all-tickets-table');
    setupTableSearch('umrah-search-input', 'all-umrah-table');
    setupTableSearch('visas-search-input', 'all-visas-table');
}

function setupTableSearch(inputId, tableId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('input', () => {
        const filter = input.value.toLowerCase();
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });
}

// دالة مساعدة لتنسيق وعرض التواريخ بشكل جميل وقصير
function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ar-YE')} ${d.toLocaleTimeString('ar-YE', {hour: '2-digit', minute:'2-digit'})}`;
}