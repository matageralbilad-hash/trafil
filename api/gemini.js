// هذا الملف يعمل في سيرفرات Vercel بشكل مخفي وآمن (Backend)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // قراءة المفتاح السري من متغيرات Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        
        // 👈 تم مطابقة اسم النموذج تماماً مع كود الـ cURL الناجح الخاص بك (gemini-flash-latest)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        // إرجاع النتيجة
        res.status(200).json(data);
    } catch (error) {
        console.error("Vercel Server Error:", error);
        res.status(500).json({ error: { message: 'Internal Server Error' } });
    }
}
