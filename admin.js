// تهيئة واستدعاء المصفوفات من السيرفر المحلي المتصفحي
let ticketsData = JSON.parse(localStorage.getItem('ticketsData')) || [];
let umrahData = JSON.parse(localStorage.getItem('umrahData')) || [];
let visasData = JSON.parse(localStorage.getItem('visasData')) || [];

document.addEventListener('DOMContentLoaded', () => {
    setupFormSubmit();
    renderAdminManageTable();
});

// إدارة حفظ النماذج (التذاكر - العمرة - التأشيرات الجديدة)
function setupFormSubmit() {
    // 1. تذكرة جديدة
    const ticketForm = document.getElementById('ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTicket = {
                id: 'ticket_' + Date.now(),
                passenger_name: document.getElementById('passenger_name').value.trim(),
                booking_code: document.getElementById('booking_code').value.trim().toUpperCase(),
                departure_date: document.getElementById('departure_date').value,
                from_location: document.getElementById('from_location').value.trim(),
                to_location: document.getElementById('to_location').value.trim(),
                return_date: document.getElementById('return_date').value || null,
                source: document.getElementById('source').value.trim(),
                destination_agency: document.getElementById('destination_agency').value.trim()
            };
            ticketsData.push(newTicket);
            localStorage.setItem('ticketsData', JSON.stringify(ticketsData));
            alert('✅ تم حفظ التذكرة بنجاح في قاعدة البيانات!');
            ticketForm.reset();
            renderAdminManageTable();
        });
    }

    // 2. عمرة جديدة
    const umrahForm = document.getElementById('umrah-form');
    if (umrahForm) {
        umrahForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUmrah = {
                id: 'umrah_' + Date.now(),
                pilgrim_name: document.getElementById('pilgrim_name').value.trim(),
                entry_date: document.getElementById('entry_date').value,
                exit_date: document.getElementById('exit_date').value,
                travel_type: document.getElementById('travel_type').value,
                umrah_source: document.getElementById('umrah_source').value.trim(),
                beneficiary: document.getElementById('beneficiary').value.trim(),
                agency_type: document.getElementById('agency_type').value
            };
            umrahData.push(newUmrah);
            localStorage.setItem('umrahData', JSON.stringify(umrahData));
            alert('🕋 تم تسجيل معاملة العمرة بنجاح!');
            umrahForm.reset();
            renderAdminManageTable();
        });
    }

    // 3. تأشيرة جديدة (القسم الجديد والمطلوب)
    const visaForm = document.getElementById('visa-form');
    if (visaForm) {
        visaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newVisa = {
                id: 'visa_' + Date.now(),
                visa_name: document.getElementById('visa_name').value.trim(),
                visa_expiry_date: document.getElementById('visa_expiry_date').value,
                visa_type: document.getElementById('visa_type').value,
                visa_source: document.getElementById('visa_source').value.trim(),
                visa_agent: document.getElementById('visa_agent').value.trim()
            };
            visasData.push(newVisa);
            localStorage.setItem('visasData', JSON.stringify(visasData));
            alert('🛂 تم حفظ التأشيرة الجديدة بنجاح في النظام!');
            visaForm.reset();
            renderAdminManageTable();
        });
    }
}

// عرض وإدارة جميع البيانات المدخلة في جدول الإدارة الموحد مع خيار الحذف ذكي
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
            <td><button class="delete-btn" onclick="deleteItem('${ticket.id}', 'ticket')">حذف ❌</button></td>
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
            <td><button class="delete-btn" onclick="deleteItem('${umrah.id}', 'umrah')">حذف ❌</button></td>
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
            <td><button class="delete-btn" onclick="deleteItem('${visa.id}', 'visa')">حذف ❌</button></td>
        `;
        tbody.appendChild(row);
    });
}

// دالة الحذف الذكية من قاعدة البيانات
window.deleteItem = function(id, type) {
    if (!confirm('هل أنت متأكد تماماً من حذف هذا السجل نهائياً من النظام؟')) return;

    if (type === 'ticket') {
        ticketsData = ticketsData.filter(t => t.id !== id);
        localStorage.setItem('ticketsData', JSON.stringify(ticketsData));
    } else if (type === 'umrah') {
        umrahData = umrahData.filter(u => u.id !== id);
        localStorage.setItem('umrahData', JSON.stringify(umrahData));
    } else if (type === 'visa') {
        visasData = visasData.filter(v => v.id !== id);
        localStorage.setItem('visasData', JSON.stringify(visasData));
    }

    renderAdminManageTable();
};