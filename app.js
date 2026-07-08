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

// عناصر الواجهة
const departureTableBody = document.querySelector("#departure-table tbody");
const returnTableBody = document.querySelector("#return-table tbody");
const allTicketsTableBody = document.querySelector("#all-tickets-table tbody");

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

    // تفريغ الجداول الثلاثة لمنع التكرار عند التحديث التلقائي
    departureTableBody.innerHTML = "";
    returnTableBody.innerHTML = "";
    allTicketsTableBody.innerHTML = "";

    tickets.forEach(ticket => {
        const depDate = ticket.departure_date ? ticket.departure_date.toDate() : null;
        const retDate = ticket.return_date ? ticket.return_date.toDate() : null;
        const createdAt = ticket.created_at ? ticket.created_at.toDate() : null;

        const formattedDep = depDate ? depDate.toLocaleString('ar-YE', { day:'2-digit', month:'2-digit', hour: '2-digit', minute:'2-digit' }) : '-';
        const formattedRet = retDate ? retDate.toLocaleString('ar-YE', { day:'2-digit', month:'2-digit', hour: '2-digit', minute:'2-digit' }) : '-';

        // 1️⃣ تحديث التقارير الذكية (48 ساعة مغادرة)
        if (depDate && depDate >= now && depDate <= fortyEightHoursLater) {
            departureTableBody.innerHTML += `<tr>
                <td><strong>${ticket.passenger_name}</strong></td>
                <td><span style="color: #38bdf8;">${ticket.booking_code}</span></td>
                <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
                <td>${formattedDep}</td>
            </tr>`;
        }

        // 2️⃣ تحديث التقارير الذكية (72 ساعة عودة)
        if (retDate && retDate >= now && retDate <= seventyTwoHoursLater) {
            returnTableBody.innerHTML += `<tr>
                <td><strong>${ticket.passenger_name}</strong></td>
                <td><span style="color: #10b981;">${ticket.booking_code}</span></td>
                <td>${ticket.source}</td>
                <td>${formattedRet}</td>
            </tr>`;
        }

        // 3️⃣ بناء الجدول العام الشامل لتدقيق البيانات بالكامل
        allTicketsTableBody.innerHTML += `<tr>
            <td><strong>${ticket.passenger_name}</strong></td>
            <td><span style="color: #f59e0b; font-weight: bold;">${ticket.booking_code}</span></td>
            <td>${formattedDep}</td>
            <td>${ticket.from_location} ➔ ${ticket.to_location}</td>
            <td>${formattedRet}</td>
            <td>${ticket.source}</td>
            <td>${ticket.destination_agency}</td>
        </tr>`;

        // الحسابات الإحصائية
        if (createdAt && createdAt >= startOfWeek && createdAt <= now) weeklyCount++;
        if (ticket.to_location) destinationsMap[ticket.to_location] = (destinationsMap[ticket.to_location] || 0) + 1;
        if (ticket.source) sourcesMap[ticket.source] = (sourcesMap[ticket.source] || 0) + 1;
    });

    weeklyTicketsCountEl.textContent = weeklyCount;
    const topDestination = Object.keys(destinationsMap).reduce((a, b) => destinationsMap[a] > destinationsMap[b] ? a : b, "-");
    topDestinationEl.textContent = topDestination;
    const topSource = Object.keys(sourcesMap).reduce((a, b) => sourcesMap[a] > sourcesMap[b] ? a : b, "-");
    topSourceEl.textContent = topSource;
}

function processUmrah(umrahList) {
    let ihram = 0, alamoudi = 0, sanabel = 0;
    umrahList.forEach(p => {
        if (p.agency_type === "احرام") ihram++;
        else if (p.agency_type === "العمودي") alamoudi++;
        else if (p.agency_type === "سنابل الخير") sanabel++;
    });
    countIhramEl.textContent = ihram;
    countAlAmoudiEl.textContent = alamoudi;
    countSanabelEl.textContent = sanabel;
}

// مراقبة حية للتذاكر مرتبة من الأحدث إدخالاً إلى الأقدم لمراجعة أسرع
const ticketsQuery = query(collection(db, "tickets"), orderBy("created_at", "desc"));
onSnapshot(ticketsQuery, snapshot => {
    const tickets = [];
    snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));
    processTickets(tickets);
});

onSnapshot(collection(db, "umrah"), snapshot => {
    const umrahList = [];
    snapshot.forEach(doc => umrahList.push({ id: doc.id, ...doc.data() }));
    processUmrah(umrahList);
});