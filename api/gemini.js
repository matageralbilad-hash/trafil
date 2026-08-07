// هذا الملف يعمل في سيرفرات Vercel بشكل مخفي وآمن (Backend)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // قراءة المفتاح السري من متغيرات Vercel
        const apiKey = process.env.GEMINI_API_KEY;
        
        // 👈 تم تحديث اسم النموذج هنا إلى gemini-1.5-flash-latest ليتوافق مع API جوجل
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        // إرجاع النتيجة كما هي إلى المتصفح
        res.status(200).json(data);
    } catch (error) {
        console.error("Vercel Server Error:", error);
        res.status(500).json({ error: { message: 'Internal Server Error' } });
    }
}
