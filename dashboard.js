import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

// عناصر الواجهة المستهدفة
const ticketsJulyEl = document.getElementById("tickets-july");
const umrahAugustEl = document.getElementById("umrah-august");
const threeMonthsComparisonEl = document.getElementById("three-months-comparison");
const topTicketAgenciesEl = document.getElementById("top-ticket-agencies");
const topUmrahSourcesEl = document.getElementById("top-umrah-sources");
const summaryTableBody = document.querySelector("#summary-agencies-table tbody");

// متغيرات حفظ البيانات الأساسية للتحليل المشترك
let allTickets = [];
let allUmrah = [];

// دالة التحليل الكلي والمتقدم (يتم استدعاؤها تلقائياً عند تحديث الفايربيس)
function runAdvancedAnalytics() {
    const currentYear = new Date().getFullYear(); // 2026

    // --- 1️⃣ فلترة مخصصة لشهر 7 (تذاكر) وشهر 8 (عمرة) ---
    let julyTicketsCount = 0;
    allTickets.forEach(t => {
        if(t.created_at) {
            const date = t.created_at.toDate();
            if(date.getFullYear() === currentYear && date.getMonth() === 6) { // 6 تعني شهر يوليو في JS
                julyTicketsCount++;
            }
        }
    });
    ticketsJulyEl.textContent = julyTicketsCount;

    let augustUmrahCount = 0;
    allUmrah.forEach(u => {
        if(u.created_at) {
            const date = u.created_at.toDate();
            if(date.getFullYear() === currentYear && date.getMonth() === 7) { // 7 تعني شهر أغسطس في JS
                augustUmrahCount++;
            }
        }
    });
    umrahAugustEl.textContent = augustUmrahCount;


    // --- 2️⃣ مقارنة أداء آخر 3 أشهر ديناميكياً ---
    threeMonthsComparisonEl.innerHTML = "";
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const now = new Date();

    for (let i = 2; i >= 0; i--) {
        let checkDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        let targetMonth = checkDate.getMonth();
        let targetYear = checkDate.getFullYear();

        let tCount = allTickets.filter(t => t.created_at && t.created_at.toDate().getMonth() === targetMonth && t.created_at.toDate().getFullYear() === targetYear).length;
        let uCount = allUmrah.filter(u => u.created_at && u.created_at.toDate().getMonth() === targetMonth && u.created_at.toDate().getFullYear() === targetYear).length;

        threeMonthsComparisonEl.innerHTML += `
            <div style="margin-bottom: 12px; border-bottom: 1px dashed #1e293b; padding-bottom: 6px;">
                <span style="font-weight: bold; color:#f59e0b;">📊 شهر ${monthNames[targetMonth]}:</span>
                <div class="compare-row" style="padding: 2px 0;">
                    <span style="font-size:0.9rem;">🎟️ تذاكر: <strong style="color:#38bdf8">${tCount}</strong></span>
                    <span style="font-size:0.9rem;">🕋 عمرة: <strong style="color:#10b981">${uCount}</strong></span>
                </div>
            </div>`;
    }


    // --- 3️⃣ أكثر جهات ومصادر يذكر منها الحجز والعمرة ---
    // تجميع جهات التذاكر الأعلى
    let ticketAgenciesMap = {};
    allTickets.forEach(t => { if(t.destination_agency) ticketAgenciesMap[t.destination_agency] = (ticketAgenciesMap[t.destination_agency] || 0) + 1; });
    
    let sortedTicketAgencies = Object.entries(ticketAgenciesMap).sort((a,b) => b[1] - a[1]).slice(0, 3);
    topTicketAgenciesEl.innerHTML = sortedTicketAgencies.map(([name, count]) => `
        <div class="compare-row">
            <span>✈️ ${name}</span>
            <span class="badge sky">${count} حجز</span>
        </div>
    `).join('') || "<div style='color:#64748b'>لا توجد بيانات كافية</div>";

    // تجميع جهات ومصادر العمرة الأعلى
    let umrahAgencyMap = {};
    allUmrah.forEach(u => { if(u.agency_type) umrahAgencyMap[u.agency_type] = (umrahAgencyMap[u.agency_type] || 0) + 1; });

    let sortedUmrahAgencies = Object.entries(umrahAgencyMap).sort((a,b) => b[1] - a[1]).slice(0, 3);
    topUmrahSourcesEl.innerHTML = sortedUmrahAgencies.map(([name, count]) => `
        <div class="compare-row">
            <span>🕋 شركة ${name}</span>
            <span class="badge emerald">${count} معاملة</span>
        </div>
    `).join('') || "<div style='color:#64748b'>لا توجد بيانات كافية</div>";


    // --- 4️⃣ بناء الجدول الشامل والملخص للمساهمة ---
    summaryTableBody.innerHTML = "";
    let totalTransactions = allTickets.length + allUmrah.length;

    sortedTicketAgencies.forEach(([name, count]) => {
        let percent = totalTransactions > 0 ? ((count / totalTransactions) * 100).toFixed(1) : 0;
        summaryTableBody.innerHTML += `<tr>
            <td><strong>${name}</strong></td>
            <td><span class="badge sky">حجوزات طيران</span></td>
            <td>${count} تذكرة</td>
            <td style="color:#38bdf8; font-weight:700;">${percent}%</td>
        </tr>`;
    });

    sortedUmrahAgencies.forEach(([name, count]) => {
        let percent = totalTransactions > 0 ? ((count / totalTransactions) * 100).toFixed(1) : 0;
        summaryTableBody.innerHTML += `<tr>
            <td><strong>شركة ${name}</strong></td>
            <td><span class="badge emerald">معاملات عمرة</span></td>
            <td>${count} معتمر</td>
            <td style="color:#10b981; font-weight:700;">${percent}%</td>
        </tr>`;
    });
}

// السحب والمزامنة الفورية للتذاكر من فايربيس
onSnapshot(collection(db, "tickets"), (snapshot) => {
    allTickets = [];
    snapshot.forEach(doc => allTickets.push(doc.data()));
    runAdvancedAnalytics();
});

// السحب والمزامنة الفورية للعمرة من فايربيس
onSnapshot(collection(db, "umrah"), (snapshot) => {
    allUmrah = [];
    snapshot.forEach(doc => allUmrah.push(doc.data()));
    runAdvancedAnalytics();
});