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

// حاويات تخزين البيانات محلياً (Offline Cache)
let ticketsData = [];
let umrahData = [];
let visasData = [];

// 👈 تحديث التبويب الافتراضي ليكون عالم الطويلة بدلاً من اليمنية
window.currentAirlinesTab = 'tawilat';
window.currentUmrahTab = 'sanabel';
window.currentVisasTab = 'security-approval';
window.currentMainTab = 'table-section';

// =================================================================
// 1️⃣ بدء التطبيق بمجرد تحميل واجهة الصفحة
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupSearchFilters(); // تفعيل محرك البحث السريع

    // استرجاع التبويب النشط بذكاء عند الرجوع من صفحة التعديل
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('activeTab');
    const activeSub = urlParams.get('activeSub');

    if (activeTab) {
        setTimeout(() => {
            const targetBtn = document.querySelector(`.tabs-navigation .tab-btn[onclick*="${activeTab}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
            
            if (activeSub) {
                const subBtns = document.querySelectorAll('.sub-tabs .sub-tab-btn');
                subBtns.forEach(btn => {
                    if (btn.getAttribute('onclick').includes(activeSub)) {
                        btn.click();
                    }
                });
            }
        }, 200); 
    }

    initializeFirebase();
});

// =================================================================
// 2️⃣ تهيئة قاعدة بيانات Firebase وجلب التحديثات فوراً
// =================================================================
function initializeFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        onValue(ref(database, 'tickets'), (snapshot) => {
            ticketsData = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                ticketsData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            }
            renderTickets();
            renderReports();
        }, (error) => {
            console.error("خطأ في مزامنة التذاكر:", error);
        });

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
// 3️⃣ دوال العرض ورسم الجداول التفاعلية
// =================================================================

// 🎟️ [عرض وتصفية التذاكر المحدثة لشركات الطيران الجديدة]
window.renderTickets = function() {
    const tbody = document.querySelector('#all-tickets-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (ticketsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد تذاكر مسجلة حالياً في النظام.</td></tr>';
        return;
    }

    const selectedTab = window.currentAirlinesTab;

    // 👈 منطق الفلترة والفرز الجديد
    const filtered = ticketsData.filter(ticket => {
        if (selectedTab === 'all-tickets') return true; 
        
        const agency = (ticket.destination_agency || '').toLowerCase();
        
        if (selectedTab === 'tawilat') {
            return agency.includes('طويلة') || agency.includes('طويله') || agency.includes('tawila') || agency.includes('tawilat');
        }
        if (selectedTab === 'arab-sky') {
            return agency.includes('عرب سكاي') || agency.includes('عرب') || agency.includes('arab sky') || agency.includes('sky');
        }
        if (selectedTab === 'arabia') {
            return agency.includes('العربية') || agency.includes('العربيه') || agency.includes('arabia');
        }
        if (selectedTab === 'other-airlines') {
            const isTawilat = agency.includes('طويلة') || agency.includes('طويله') || agency.includes('tawila') || agency.includes('tawilat');
            const isArabSky = agency.includes('عرب سكاي') || agency.includes('عرب') || agency.includes('arab sky') || agency.includes('sky');
            const isArabia = agency.includes('العربية') || agency.includes('العربيه') || agency.includes('arabia');
            
            return !isTawilat && !isArabSky && !isArabia;
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
        
        row.onclick = () => {
            window.location.href = `edit.html?category=tickets&id=${ticket.id}&backTab=table-section&backSub=${selectedTab}`;
        };

        row.innerHTML = `
            <td><strong>${ticket.passenger_name}</strong></td>
            <td><code class="pnr-code" style="color: #38bdf8; font-weight: bold; font-family: monospace;">${ticket.booking_code}</code></td>
            <td>${formatDate(ticket.departure_date)}</td>
            <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
            <td>${ticket.return_date ? formatDate(ticket.return_date) : '<span style="color: #ef4444; font-size: 11px;">ذهاب فقط ✈️</span>'}</td>
            <td>${ticket.source}</td>
            <td><span class="agency-tag">${ticket.destination_agency || 'غير محدد'}</span></td>
        `;
        tbody.appendChild(row);
    });
};

// 🕋 [عرض وتصفية العمرة]
window.renderUmrah = function() {
    const tbody = document.querySelector('#all-umrah-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const selectedTab = window.currentUmrahTab;
    const showAllColumns = (selectedTab === 'all-umrah');

    const extraHeaders = document.querySelectorAll('#all-umrah-table .umrah-extra-col');
    extraHeaders.forEach(th => {
        th.style.display = showAllColumns ? '' : 'none';
    });

    if (umrahData.length === 0) {
        const colSpan = showAllColumns ? 6 : 4;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد معاملات عمرة مسجلة.</td></tr>`;
        return;
    }

    const filtered = umrahData.filter(item => {
        if (selectedTab === 'all-umrah') return true;
        const agency = (item.agency_type || '').toLowerCase();
        if (selectedTab === 'sanabel') return agency.includes('سنابل');
        if (selectedTab === 'ihram') return agency.includes('احرام') || agency.includes('إحرام');
        if (selectedTab === 'alamoudi') return agency.includes('العمودي');
        return true; 
    });

    if (filtered.length === 0) {
        const colSpan = showAllColumns ? 6 : 4;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; color:#94a3b8; padding:15px;">لا توجد بيانات متوفرة لهذا التصنيف.</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.title = "اضغط لتعديل أو حذف المعاملة ✏️";

        row.onclick = () => {
            window.location.href = `edit.html?category=umrah&id=${item.id}&backTab=umrah-table-section&backSub=${selectedTab}`;
        };

        if (showAllColumns) {
            row.innerHTML = `
                <td><strong>${item.pilgrim_name}</strong></td>
                <td>${item.entry_date || '-'}</td>
                <td>${item.exit_date || '-'}</td>
                <td>${item.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
                <td>${item.beneficiary || '-'}</td>
                <td><span class="agency-tag">${item.agency_type || '-'}</span></td>
            `;
        } else {
            row.innerHTML = `
                <td><strong>${item.pilgrim_name}</strong></td>
                <td>${item.entry_date || '-'}</td>
                <td>${item.exit_date || '-'}</td>
                <td>${item.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
            `;
        }
        tbody.appendChild(row);
    });
};
// 🛂 [عرض وتصفية التأشيرات]
window.renderVisas = function() {
    const tbody = document.querySelector('#all-visas-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (visasData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد تأشيرات مسجلة.</td></tr>';
        return;
    }

    const selectedTab = window.currentVisasTab;

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
            window.location.href = `edit.html?category=visas&id=${visa.id}&backTab=visas-section&backSub=${selectedTab}`;
        };

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

// =================================================================
// 4️⃣ محركات البحث الفورية والفلترة
// =================================================================
function setupSearchFilters() {
    const searchTicketInput = document.getElementById('tickets-search-input');
    if (searchTicketInput) {
        searchTicketInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#all-tickets-table tbody', query);
        });
    }

    const searchUmrahInput = document.getElementById('umrah-search-input');
    if (searchUmrahInput) {
        searchUmrahInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#all-umrah-table tbody', query);
        });
    }

    const searchVisaInput = document.getElementById('visas-search-input');
    if (searchVisaInput) {
        searchVisaInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#all-visas-table tbody', query);
        });
    }

    const searchDepInput = document.getElementById('departure-search-input');
    if (searchDepInput) {
        searchDepInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#departure-table tbody', query);
        });
    }

    const searchRetInput = document.getElementById('return-search-input');
    if (searchRetInput) {
        searchRetInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterTableRows('#return-table tbody', query);
        });
    }
}

function filterTableRows(tbodySelector, query) {
    const rows = document.querySelectorAll(`${tbodySelector} tr`);
    rows.forEach(row => {
        if (row.cells.length <= 1 && row.textContent.includes('لا توجد')) return;
        const textContent = row.textContent.toLowerCase();
        row.style.display = textContent.includes(query) ? '' : 'none';
    });
}

// =================================================================
// 5️⃣ نظام التنقل بين التبويبات
// =================================================================

window.switchTab = function(tabId) {
    document.querySelectorAll('.tabs-navigation .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active-content');
    });
    
    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active-content');
        window.currentMainTab = tabId;
    }
};

window.switchSubTab = function(category, subTabName) {
    let subTabButtonsSelector = '';
    
    if (category === 'tickets') {
        window.currentAirlinesTab = subTabName;
        subTabButtonsSelector = '#table-section .sub-tab-btn';
        renderTickets();
    } else if (category === 'umrah') {
        window.currentUmrahTab = subTabName;
        subTabButtonsSelector = '#umrah-table-section .sub-tab-btn';
        renderUmrah();
    } else if (category === 'visas') {
        window.currentVisasTab = subTabName;
        subTabButtonsSelector = '#visas-section .sub-tab-btn';
        renderVisas();
    }

    if (subTabButtonsSelector) {
        document.querySelectorAll(subTabButtonsSelector).forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick').includes(subTabName)) {
                btn.classList.add('active');
            }
        });
    }
};

// =================================================================
// 6️⃣ التقارير الذكية
// =================================================================

window.openDetailedReport = function(type) {
    if (type === 'departure') {
        document.getElementById('departure-report-view').style.display = 'block';
        document.getElementById('return-report-view').style.display = 'none';
    } else if (type === 'return') {
        document.getElementById('return-report-view').style.display = 'block';
        document.getElementById('departure-report-view').style.display = 'none';
    }
};

window.closeDetailedReport = function(type) {
    if (type === 'departure') {
        document.getElementById('departure-report-view').style.display = 'none';
    } else if (type === 'return') {
        document.getElementById('return-report-view').style.display = 'none';
    }
};

function renderReports() {
    const depTbody = document.querySelector('#departure-table tbody');
    const retTbody = document.querySelector('#return-table tbody');
    if (!depTbody || !retTbody) return;

    const now = new Date();
    const limitDeparture = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    const limitReturn = new Date(now.getTime() + (72 * 60 * 60 * 1000));

    const departures = ticketsData.filter(ticket => {
        if (!ticket.departure_date) return false;
        const depDate = new Date(ticket.departure_date);
        return depDate >= now && depDate <= limitDeparture;
    });

    depTbody.innerHTML = '';
    if (departures.length === 0) {
        depTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:15px;">لا توجد رحلات مغادرة مجدولة خلال الـ 48 ساعة القادمة.</td></tr>';
    } else {
        departures.forEach(ticket => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => {
                window.location.href = `edit.html?category=tickets&id=${ticket.id}&backTab=reports-section`;
            };
            row.innerHTML = `
                <td><strong>${ticket.passenger_name}</strong></td>
                <td><code class="pnr-code">${ticket.booking_code}</code></td>
                <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
                <td>${formatDate(ticket.departure_date)}</td>
            `;
            depTbody.appendChild(row);
        });
    }

    const returns = ticketsData.filter(ticket => {
        if (!ticket.return_date) return false;
        const retDate = new Date(ticket.return_date);
        return retDate >= now && retDate <= limitReturn;
    });

    retTbody.innerHTML = '';
    if (returns.length === 0) {
        retTbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:15px;">لا توجد رحلات عودة قادمة خلال الـ 72 ساعة القادمة.</td></tr>';
    } else {
        returns.forEach(ticket => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.onclick = () => {
                window.location.href = `edit.html?category=tickets&id=${ticket.id}&backTab=reports-section`;
            };
            row.innerHTML = `
                <td><strong>${ticket.passenger_name}</strong></td>
                <td><code class="pnr-code">${ticket.booking_code}</code></td>
                <td>${ticket.source}</td>
                <td>${formatDate(ticket.return_date)}</td>
            `;
            retTbody.appendChild(row);
        });
    }
}

// =================================================================
// 7️⃣ معالج الطباعة المحدث
// =================================================================

window.openPrintWizard = function(categoryType) {
    const modal = document.getElementById('printWizardModal');
    if (!modal) return;

    modal.dataset.category = categoryType;
    modal.style.display = 'flex';

    const titleElement = document.getElementById('wizard-modal-title');
    if (categoryType === 'tickets') {
        titleElement.innerText = "🖨️ طباعة وتصدير تقرير تذاكر السفر المفلترة";
    } else if (categoryType === 'umrah') {
        titleElement.innerText = "🖨️ طباعة وتصدير كشف المعتمرين والوكلاء";
    } else if (categoryType === 'visas') {
        titleElement.innerText = "🖨️ طباعة وتصدير مستندات كشف التأشيرات";
    } else if (categoryType === 'departure') {
        titleElement.innerText = "🖨️ طباعة تقرير المغادرة السريع (48 ساعة)";
    } else if (categoryType === 'return') {
        titleElement.innerText = "🖨️ طباعة تقرير العودة السريع (72 ساعة)";
    }

    document.getElementById('filter-date-type').value = 'all';
    toggleDateInputs();
    
    generatePrintPreview();
};

window.closePrintWizard = function() {
    const modal = document.getElementById('printWizardModal');
    if (modal) modal.style.display = 'none';
};

window.toggleDateInputs = function() {
    const dateType = document.getElementById('filter-date-type').value;
    const inputs = document.querySelectorAll('.date-input-group');
    inputs.forEach(el => {
        el.style.display = (dateType === 'range') ? 'block' : 'none';
    });
};

window.generatePrintPreview = function() {
    const modal = document.getElementById('printWizardModal');
    const category = modal.dataset.category;
    const dateType = document.getElementById('filter-date-type').value;

    let startMonthStr = document.getElementById('filter-start-month').value;
    let endMonthStr = document.getElementById('filter-end-month').value;

    let recordsToPrint = [];
    let reportTitle = 'تقرير عام';

    // 1️⃣ تصفية التذاكر المحدثة لطباعة المعاينة
    if (category === 'tickets') {
        const agencyNameMap = {
            'tawilat': 'عالم الطويلة',
            'arab-sky': 'عرب سكاي',
            'arabia': 'العربية',
            'other-airlines': 'شركات أخرى',
            'all-tickets': 'كل الشركات'
        };
        const selectedTab = window.currentAirlinesTab;
        
        reportTitle = `تقرير تذاكر السفر لـ (${agencyNameMap[selectedTab] || selectedTab})`;

        recordsToPrint = ticketsData.filter(ticket => {
            const agency = (ticket.destination_agency || '').toLowerCase();
            
            if (selectedTab === 'tawilat' && !(agency.includes('طويلة') || agency.includes('طويله') || agency.includes('tawila') || agency.includes('tawilat'))) return false;
            if (selectedTab === 'arab-sky' && !(agency.includes('عرب سكاي') || agency.includes('عرب') || agency.includes('arab sky') || agency.includes('sky'))) return false;
            if (selectedTab === 'arabia' && !(agency.includes('العربية') || agency.includes('العربيه') || agency.includes('arabia'))) return false;
            if (selectedTab === 'other-airlines') {
                const isTawilat = agency.includes('طويلة') || agency.includes('طويله') || agency.includes('tawila') || agency.includes('tawilat');
                const isArabSky = agency.includes('عرب سكاي') || agency.includes('عرب') || agency.includes('arab sky') || agency.includes('sky');
                const isArabia = agency.includes('العربية') || agency.includes('العربيه') || agency.includes('arabia');
                if (isTawilat || isArabSky || isArabia) return false;
            }

            if (dateType === 'range' && ticket.departure_date) {
                const depDate = ticket.departure_date.substring(0, 7);
                if (startMonthStr && depDate < startMonthStr) return false;
                if (endMonthStr && depDate > endMonthStr) return false;
            }
            return true;
        });
    } 
    else if (category === 'umrah') {
        const selectedTab = window.currentUmrahTab;
        
        const agencyTitleMap = {
            'sanabel': 'سنابل الخير',
            'ihram': 'إحرام',
            'alamoudi': 'العمودي',
            'all-umrah': 'كل الوكلاء'
        };
        
        reportTitle = `كشف المعتمرين - وكالة (${agencyTitleMap[selectedTab] || selectedTab})`;

        recordsToPrint = umrahData.filter(item => {
            const agency = (item.agency_type || '').toLowerCase();
            if (selectedTab === 'sanabel' && !agency.includes('سنابل')) return false;
            if (selectedTab === 'ihram' && (!agency.includes('إحرام') && !agency.includes('احرام'))) return false;
            if (selectedTab === 'alamoudi' && !agency.includes('العمودي')) return false;

            if (dateType === 'range' && item.entry_date) {
                const entDate = item.entry_date.substring(0, 7);
                if (startMonthStr && entDate < startMonthStr) return false;
                if (endMonthStr && entDate > endMonthStr) return false;
            }
            return true;
        });
    } 
    else if (category === 'visas') {
        reportTitle = `تقرير مستندات التأشيرات للملف (${window.currentVisasTab})`;
        recordsToPrint = visasData.filter(visa => {
            const type = (visa.visa_type || '');
            const selectedTab = window.currentVisasTab;
            if (selectedTab === 'security-approval' && !type.includes('موافقة أمنية')) return false;
            if (selectedTab === 'oman-transit' && !type.includes('مرور عمان')) return false;
            if (selectedTab === 'other-visas' && !type.includes('تأشيرات أخرى')) return false;

            if (dateType === 'range' && visa.visa_expiry_date) {
                const expDate = visa.visa_expiry_date.substring(0, 7);
                if (startMonthStr && expDate < startMonthStr) return false;
                if (endMonthStr && expDate > endMonthStr) return false;
            }
            return true;
        });
    }
    else if (category === 'departure') {
        reportTitle = "🛫 تقرير رحلات المغادرة السريعة خلال 48 ساعة";
        const now = new Date();
        const limitDeparture = new Date(now.getTime() + (48 * 60 * 60 * 1000));
        recordsToPrint = ticketsData.filter(ticket => {
            if (!ticket.departure_date) return false;
            const depDate = new Date(ticket.departure_date);
            return depDate >= now && depDate <= limitDeparture;
        });
    }
    else if (category === 'return') {
        reportTitle = "🛬 تقرير رحلات العودة غير المفتوحة خلال 72 ساعة";
        const now = new Date();
        const limitReturn = new Date(now.getTime() + (72 * 60 * 60 * 1000));
        recordsToPrint = ticketsData.filter(ticket => {
            if (!ticket.return_date) return false;
            const retDate = new Date(ticket.return_date);
            return retDate >= now && retDate <= limitReturn;
        });
    }

    const previewArea = document.getElementById('print-preview-container');
    if (!previewArea) return;

    if (recordsToPrint.length === 0) {
        previewArea.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 30px; font-weight: bold;">⚠️ لا توجد أي كشوفات أو بيانات مطابقة لشروط الفرز!</p>';
        return;
    }

    const showAllUmrahCols = (category === 'umrah' && window.currentUmrahTab === 'all-umrah');

    let printTableHtml = `
        <div style="background: white; color: black; padding: 20px; border-radius: 4px; box-shadow: inset 0 0 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 15px; direction: rtl;">
                <div style="flex: 1; text-align: right;">
                    <img src="icon-512.png" alt="شعار المكتب" style="max-height: 75px; width: auto;" onerror="this.style.display='none'">
                </div>
                <div style="flex: 2; text-align: center;">
                    <h2 style="margin: 0; color: #0f172a; font-size: 1.25rem; font-weight: bold;">مكتب وفاء سيئون للسفريات والسياحة</h2>
                    <h3 style="margin: 5px 0 0 0; font-size: 1rem; font-weight: 600; color: #334155;">${reportTitle}</h3>
                    <span style="font-size: 11px; color: #475569; display: block; margin-top: 4px;">تاريخ إصدار التقرير: ${new Date().toLocaleDateString('ar-YE')}</span>
                </div>
                <div style="flex: 1;"></div>
            </div>
            <table class="preview-print-table" style="width: 100%; border-collapse: collapse; color: black;">
                <thead>
                    <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
    `;

    if (category === 'tickets' || category === 'departure' || category === 'return') {
        printTableHtml += `
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">الاسم بالكامل</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">رقم الحجز (PNR)</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">الرحلة</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">تاريخ الإقلاع</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">العودة</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">المصدر</th>
        `;
    } else if (category === 'umrah') {
        printTableHtml += `
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">اسم المعتمر</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">تاريخ الدخول</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">تاريخ الخروج</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">طريقة السفر</th>
        `;
       if (showAllUmrahCols) {
    printTableHtml += `
        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">المستفيد</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">الجهة التابع لها</th>
    `;
}
    } else if (category === 'visas') {
        printTableHtml += `
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">اسم المعني</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">صلاحية التأشيرة</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">نوع التأشيرة</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">المصدر</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">الوكيل</th>
        `;
    }

    printTableHtml += `
                    </tr>
                </thead>
                <tbody>
    `;

    recordsToPrint.forEach(item => {
        printTableHtml += `<tr style="border-bottom: 1px solid #e2e8f0;">`;
        if (category === 'tickets' || category === 'departure' || category === 'return') {
            printTableHtml += `
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;"><strong>${item.passenger_name}</strong></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace;">${item.booking_code}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.from_location} ➔ ${item.to_location}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px;">${formatDate(item.departure_date)}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px;">${item.return_date ? formatDate(item.return_date) : 'ذهاب فقط'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.source}</td>
            `;
        } else if (category === 'umrah') {
            printTableHtml += `
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;"><strong>${item.pilgrim_name}</strong></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.entry_date || '-'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.exit_date || '-'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.travel_type === 'جو' ? 'جو ✈️' : 'بر 🚌'}</td>
            `;
           if (showAllUmrahCols) {
    printTableHtml += `
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.beneficiary || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.agency_type || '-'}</td>
    `;
}
        } else if (category === 'visas') {
            printTableHtml += `
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;"><strong>${item.visa_name}</strong></td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.visa_expiry_date || '-'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.visa_type || '-'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.visa_source || '-'}</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${item.visa_agent || '-'}</td>
            `;
        }
        printTableHtml += `</tr>`;
    });

    printTableHtml += `
                </tbody>
            </table>
        </div>
    `;

    previewArea.innerHTML = printTableHtml;
};

window.executeFinalPDF = function() {
    const previewContent = document.getElementById('print-preview-container').innerHTML;
    if (!previewContent || previewContent.includes('تحديث وتجهيز')) {
        alert('❌ فضلاً، قم بتجهيز المعاينة أولاً قبل الضغط على التصدير!');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html lang="ar" dir="rtl">
        <head>
            <title>طباعة تقرير الكشف - مكتب وفاء</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 10mm;
                }
                body { font-family: 'Cairo', system-ui, -apple-system, sans-serif; background: #fff; color: #000; padding: 10px; direction: rtl; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { border: 1px solid #94a3b8; padding: 8px 10px; text-align: right; font-size: 12px; color: #000; }
                th { background-color: #f1f5f9; font-weight: bold; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${previewContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => { window.close(); }, 500);
                }
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
};
// =================================================================
// 8️⃣ مصنع تنسيق التواريخ
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

        return `${datePart} - ${formattedHours}:${minutes} ${period}`;
    } catch {
        return dateTimeStr;
    }
}
