import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const departureTableBody = document.querySelector("#departure-table tbody");
const returnTableBody = document.querySelector("#return-table tbody");
const allTicketsTableBody = document.querySelector("#all-tickets-table tbody");
const allUmrahTableBody = document.querySelector("#all-umrah-table tbody"); // مستهدف جدول العمرة الجديد

const weeklyTicketsCountEl = document.getElementById("weekly-tickets-count");
const topDestinationEl = document.getElementById("top-destination");
const topSourceEl = document.getElementById("top-source");
const countIhramEl = document.getElementById("count-ihram");
const countAlAmoudiEl = document.getElementById("count-alamoudi");
const countSanabelEl = document.getElementById("count-sanabel");

function processTickets(tickets) {
    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    const seventyTwoHoursLater = new Date(now.getTime() + (72 * 60 * 60 * 1000));
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);

    let weeklyCount = 0;
    let destinationsMap = {};
    let sourcesMap = {};

    departureTableBody.innerHTML = "";
    returnTableBody.innerHTML = "";
    allTicketsTableBody.innerHTML = "";

    tickets.forEach(ticket => {
        const depDate = ticket.departure_date ? ticket.departure_date.toDate() : null;
        const retDate = ticket.return_date ? ticket.return_date.toDate() : null;
        const createdAt = ticket.created_at ? ticket.created_at.toDate() : null;

        const formattedDep = depDate ? depDate.toLocaleString('ar-YE', { day:'2-digit', month:'2-digit', hour: '2-digit', minute:'2-digit' }) : '-';
        const formattedRet = retDate ? retDate.toLocaleString('ar-YE', { day:'2-digit', month:'2-digit', hour: '2-digit', minute:'2-digit' }) : '-';

        if (depDate && depDate >= now && depDate <= fortyEightHoursLater) {
            departureTableBody.innerHTML += `<tr>
                <td><strong>${ticket.passenger_name}</strong></td>
                <td><span style="color: #38bdf8;">${ticket.booking_code}</span></td>
                <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
                <td>${formattedDep}</td>
            </tr>`;
        }

        if (retDate && retDate >= now && retDate <= seventyTwoHoursLater) {
            returnTableBody.innerHTML += `<tr>
                <td><strong>${ticket.passenger_name}</strong></td>
                <td><span style="color: #10b981;">${ticket.booking_code}</span></td>
                <td>${ticket.source}</td>
                <td>${formattedRet}</td>
            </tr>`;
        }

        allTicketsTableBody.innerHTML += `<tr>
            <td><strong>${ticket.passenger_name}</strong></td>
            <td><span style="color: #f59e0b; font-weight: bold;">${ticket.booking_code}</span></td>
            <td>${formattedDep}</td>
            <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
            <td>${formattedRet}</td>
            <td>${ticket.source}</td>
            <td>${ticket.destination_agency}</td>
        </tr>`;

        if (createdAt && createdAt >= startOfWeek && createdAt <= now) weeklyCount++;
        if (ticket.to_location) destinationsMap[ticket.to_location] = (destinationsMap[ticket.to_location] || 0) + 1;
        if (ticket.source) sourcesMap[ticket.source] = (sourcesMap[ticket.source] || 0) + 1;
    });

    weeklyTicketsCountEl.textContent = weeklyCount;
    const topDestination = Object.keys(destinationsMap).reduce((a, b) => destinationsMap[a] > destinationsMap[b] ? a : b, "-");
    topDestinationEl.textContent = topDestination;
    const topSource = Object.keys(sourcesMap).reduce((a, b) => sourcesMap[a] > sourcesMap[b] ? a : b, "-");
    topSourceEl.textContent = topSource;

    // تشغيل الفحص التلقائي للإشعارات
    checkTicketsForNotifications(tickets);
}
// ==========================================
// 💡 نظام الفحص الذكي للإشعارات الفورية (المرحلة الثالثة)
// ==========================================

// دالة عامة لإطلاق الإشعار الفوري لأي مسافر أو عائد
function triggerDeviceNotification(title, message) {
    // التأكد أولاً من أن المستخدم أعطى الصلاحية وأن خادم الخلفية جاهز
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                vibrate: [300, 150, 300], // اهتزاز أقوى للتنبيهات المهمة
                tag: title + message, // منع تكرار نفس الإشعار إذا تم تحديث الصفحة
                requireInteraction: true // يجعل الإشعار يظل ثابتاً أعلى الشاشة حتى يضغط عليه المدير
            });
        });
    }
}

// دالة فحص التذاكر بذكاء (المسافرون في 48 ساعة والعائدون في 72 ساعة)
export function checkTicketsForNotifications(ticketsList) {
    const now = new Date();
    
    ticketsList.forEach(ticket => {
        // --- 1. فحص المغادرين (48 ساعة قادمة) ---
        if (ticket.departure_date) {
            const departureTime = ticket.departure_date.toDate(); 
            const timeDifference = departureTime - now; 
            const hoursLeft = timeDifference / (1000 * 60 * 60);

            if (hoursLeft > 0 && hoursLeft <= 48) {
                const title = `🛫 تذكير إقلاع: ${ticket.passenger_name}`;
                const message = `الرحلة من [${ticket.from_location}] إلى [${ticket.to_location}] خلال ${Math.round(hoursLeft)} ساعة. رقم الحجز: ${ticket.booking_code}`;
                
                triggerDeviceNotification(title, message);
            }
        }

        // --- 2. فحص العائدين (72 ساعة قادمة) ---
        if (ticket.return_date) {
            const returnTime = ticket.return_date.toDate(); 
            const timeDifference = returnTime - now;
            const hoursLeft = timeDifference / (1000 * 60 * 60);

            if (hoursLeft > 0 && hoursLeft <= 72) {
                const title = `🛬 تذكير عودة: ${ticket.passenger_name}`;
                const message = `ميعاد العودة المفترض خلال ${Math.round(hoursLeft)} ساعة عبر مصدر: ${ticket.source}. رقم الحجز: ${ticket.booking_code}`;
                
                triggerDeviceNotification(title, message);
            }
        }
    });
}
function processUmrah(umrahList) {
    let ihram = 0, alamoudi = 0, sanabel = 0;
    allUmrahTableBody.innerHTML = ""; // تفريغ جدول العمرة

    umrahList.forEach(p => {
        if (p.agency_type === "احرام") ihram++;
        else if (p.agency_type === "العمودي") alamoudi++;
        else if (p.agency_type === "سنابل الخير") sanabel++;

        const entryStr = p.entry_date ? p.entry_date.toDate().toLocaleDateString('ar-YE') : '-';
        const exitStr = p.exit_date ? p.exit_date.toDate().toLocaleDateString('ar-YE') : '-';

        // ملء جدول العمرة بالبيانات الستة المطلوبة كاملة
        allUmrahTableBody.innerHTML += `<tr>
            <td><strong>${p.pilgrim_name}</strong></td>
            <td>${entryStr}</td>
            <td>${exitStr}</td>
            <td><span style="color: #38bdf8;">${p.travel_type || '-'}</span></td>
            <td>${p.source || '-'}</td>
            <td>${p.beneficiary || '-'}</td>
            <td><span style="font-weight:600;">${p.agency_type}</span></td>
        </tr>`;
    });

    countIhramEl.textContent = ihram;
    countAlAmoudiEl.textContent = alamoudi;
    countSanabelEl.textContent = sanabel;
}

const ticketsQuery = query(collection(db, "tickets"), orderBy("created_at", "desc"));
onSnapshot(ticketsQuery, snapshot => {
    const tickets = [];
    snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));
    processTickets(tickets);
});

const umrahQuery = query(collection(db, "umrah"), orderBy("created_at", "desc"));
onSnapshot(umrahQuery, snapshot => {
    const umrahList = [];
    snapshot.forEach(doc => umrahList.push({ id: doc.id, ...doc.data() }));
    processUmrah(umrahList);
});