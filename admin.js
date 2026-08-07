// 1. استيراد مكتبات Firebase الحديثة التي تحتاجها فقط للإضافة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// إعدادات Firebase الخاصة بمشروعك (مكتب السفريات)
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

document.addEventListener('DOMContentLoaded', () => {
    setupFormSubmit();
});

// 2. معالجة إرسال النماذج وحفظها في Firebase
function setupFormSubmit() {
    // إرسال تذكرة جديدة
    const ticketForm = document.getElementById('ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newTicket = {
            passenger_name: document.getElementById('passenger_name').value.trim(),
            booking_code: document.getElementById('booking_code').value.trim().toUpperCase(),
            departure_date: document.getElementById('departure_date').value,
            from_location: document.getElementById('from_location').value.trim(),
            to_location: document.getElementById('to_location').value.trim(),
            return_date: document.getElementById('return_date').value || null,
            source: document.getElementById('source').value.trim(),
            destination_agency: document.getElementById('destination_agency').value.trim(),
            created_at: new Date().toISOString()
        };

            push(ref(database, 'tickets'), newTicket)
                .then(() => {
                    alert('✅ تم حفظ التذكرة بنجاح في سيرفر Firebase!');
                    ticketForm.reset();
                })
                .catch(err => alert('❌ خطأ في الحفظ: ' + err.message));
        });
    }
// إرسال معاملة عمرة جديدة
    const umrahForm = document.getElementById('umrah-form');
    if (umrahForm) {
        umrahForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
const newUmrah = {
            pilgrim_name: document.getElementById('pilgrim_name').value.trim(),
            entry_date: document.getElementById('entry_date').value,
            exit_date: document.getElementById('exit_date').value,
            travel_type: document.getElementById('travel_type').value,
            beneficiary: document.getElementById('beneficiary').value.trim(),
            agency_type: document.getElementById('agency_type').value,
            created_at: new Date().toISOString()
        };
            push(ref(database, 'umrah'), newUmrah)
                .then(() => {
                    alert('🕋 تم تسجيل معاملة العمرة في سيرفر Firebase!');
                    umrahForm.reset();
                })
                .catch(err => alert('❌ خطأ في الحفظ: ' + err.message));
        });
    }
    // إرسال تأشيرة جديدة
    const visaForm = document.getElementById('visa-form');
    if (visaForm) {
        visaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newVisa = {
            visa_name: document.getElementById('visa_name').value.trim(),
            visa_expiry_date: document.getElementById('visa_expiry_date').value,
            visa_type: document.getElementById('visa_type').value,
            visa_source: document.getElementById('visa_source').value.trim(),
            visa_agent: document.getElementById('visa_agent').value.trim(),
            created_at: new Date().toISOString()
        };
            push(ref(database, 'visas'), newVisa)
                .then(() => {
                    alert('🛂 تم حفظ التأشيرة الجديدة في سيرفر Firebase!');
                    visaForm.reset();
                })
                .catch(err => alert('❌ خطأ في الحفظ: ' + err.message));
        });
    }
}

// =================================================================
// 🤖 نظام المساعد الذكي (Gemini AI) لفك النصوص والصور - مخفي ومحمي
// =================================================================

window.openAIModal = function() {
    document.getElementById('aiWizardModal').style.display = 'flex';
};

window.closeAIModal = function() {
    document.getElementById('aiWizardModal').style.display = 'none';
    document.getElementById('ai-text-input').value = '';
    document.getElementById('ai-image-input').value = '';
    document.getElementById('ai-loading').style.display = 'none';
};

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

window.processAI = async function() {
    const textVal = document.getElementById('ai-text-input').value.trim();
    const fileInput = document.getElementById('ai-image-input').files[0];

    if (!textVal && !fileInput) {
        alert('⚠️ يرجى إدخال نص الحجز أو رفع صورة/PDF أولاً!');
        return;
    }

    document.getElementById('ai-loading').style.display = 'block';

    try {
        let parts = [];
        
        const systemPrompt = `
        أنت مساعد بيانات ذكي لمكتب سفريات يمني اسمه مكتب وفاء سيئون.
        المطلوب: استخراج البيانات من النص المدخل أو الملف المرفق، وإرجاعها بصيغة JSON نظيفة فقط.
        
        تعليمات صارمة (CRITICAL RULE):
        يُمنع منعاً باتاً استخراج أي بيانات تخص (الوكيل، المصدر، الجهة، أو المستفيد)، يجب ترك هذه البيانات للموظف ليعبئها يدوياً.
        
        صيغة JSON الإلزامية:
        {
          "category": "استنتج الفئة: 'tickets' لتذاكر الطيران، 'umrah' للعمرة، أو 'visas' لأي تأشيرة أخرى",
          "name": "الاسم الكامل للمسافر أو المعتمر",
          "pnr": "رقم الحجز PNR (إذا كان تذكرة، مثال: XZ98LL)",
          "date_1": "لتذاكر الطيران استخرج وقت وتاريخ الإقلاع بصيغة YYYY-MM-DDTHH:MM، للعمرة والتأشيرات استخرج تاريخ الدخول/الصلاحية بصيغة YYYY-MM-DD",
          "date_2": "تاريخ العودة أو الخروج بصيغة YYYY-MM-DDTHH:MM للطيران (إن وجد)، أو YYYY-MM-DD للعمرة",
          "from": "مدينة المغادرة (للتذاكر)",
          "to": "مدينة الوصول (للتذاكر)",
          "travel_type": "استنتج وسيلة السفر للعمرة: 'جو' أو 'بر'",
          "visa_type": "استنتج نوع التأشيرة: 'موافقة أمنية' أو 'مرور عمان' (إن وجد)"
        }
        `;

        parts.push({ text: systemPrompt });

        if (textVal) {
            parts.push({ text: `النص للتحليل:\n${textVal}` });
        }

        if (fileInput) {
            const base64Data = await fileToBase64(fileInput);
            
            // تحديد نوع الملف بذكاء (صورة أو PDF)
            let fileMimeType = fileInput.type;
            if (fileInput.name.toLowerCase().endsWith('.pdf')) {
                fileMimeType = 'application/pdf';
            } else if (!fileMimeType) {
                fileMimeType = 'image/jpeg'; // كقيمة افتراضية للطوارئ
            }

            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: fileMimeType
                }
            });
        }

        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: parts }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const result = await response.json();
        
        if (result.error) {
            console.error("API Error:", result.error);
            alert("❌ حدث خطأ من سيرفر الذكاء الاصطناعي: \n" + (result.error.message || "حجم الملف كبير جداً أو غير مدعوم."));
            document.getElementById('ai-loading').style.display = 'none';
            return;
        }

        const rawJsonText = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(rawJsonText);

        fillAdminFormWithAI(parsedData);

    } catch (error) {
        console.error("Parsing Error:", error);
        alert("❌ تعذر قراءة البيانات. أو أن الاتصال بالخادم فشل.");
    } finally {
        document.getElementById('ai-loading').style.display = 'none';
    }
};

function fillAdminFormWithAI(data) {
    if (!data.category) return;

    if (data.category.includes('ticket')) {
        const ticketBtn = document.querySelector('.tabs-navigation .tab-btn[onclick="switchTab(\'add-ticket-section\')"]');
        if(ticketBtn) ticketBtn.click();
        else switchTab('add-ticket-section');

        document.getElementById('passenger_name').value = data.name || '';
        document.getElementById('booking_code').value = data.pnr || '';
        document.getElementById('departure_date').value = data.date_1 || '';
        document.getElementById('return_date').value = data.date_2 || '';
        document.getElementById('from_location').value = data.from || '';
        document.getElementById('to_location').value = data.to || '';
        
        document.getElementById('source').value = '';
        document.getElementById('destination_agency').value = '';

    } else if (data.category.includes('umrah')) {
        const umrahBtn = document.querySelector('.tabs-navigation .tab-btn[onclick="switchTab(\'add-umrah-section\')"]');
        if(umrahBtn) umrahBtn.click();
        else switchTab('add-umrah-section');

        document.getElementById('pilgrim_name').value = data.name || '';
        document.getElementById('entry_date').value = data.date_1 || '';
        document.getElementById('exit_date').value = data.date_2 || '';
        document.getElementById('travel_type').value = data.travel_type || '';
        
        document.getElementById('beneficiary').value = '';
        document.getElementById('agency_type').value = '';

    } else if (data.category.includes('visa')) {
        const visaBtn = document.querySelector('.tabs-navigation .tab-btn[onclick="switchTab(\'add-visa-section\')"]');
        if(visaBtn) visaBtn.click();
        else switchTab('add-visa-section');

        document.getElementById('visa_name').value = data.name || '';
        document.getElementById('visa_expiry_date').value = data.date_1 || '';
        
        const vTypeSelect = document.getElementById('visa_type');
        let matched = false;
        for (let i = 0; i < vTypeSelect.options.length; i++) {
            if (data.visa_type && vTypeSelect.options[i].text.includes(data.visa_type)) {
                vTypeSelect.selectedIndex = i;
                matched = true;
                break;
            }
        }
        if(!matched && data.visa_type) vTypeSelect.value = "تأشيرات أخرى";

        document.getElementById('visa_source').value = '';
        document.getElementById('visa_agent').value = '';
    }

    closeAIModal();
    alert('✨ أتم الذكاء الاصطناعي تعبئة البيانات المتاحة!\n⚠️ الرجاء استكمال الحقول الإدارية (المصدر / الوكيل) يدوياً قبل الضغط على حفظ.');
}
