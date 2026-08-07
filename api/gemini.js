// هذا الملف يعمل في سيرفرات Vercel بشكل مخفي وآمن (Backend)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // قراءة المفتاح السري من متغيرات Vercel التي قمت بإضافتها
        const apiKey = process.env.GEMINI_API_KEY;
        
        // إرسال الطلب إلى جوجل بشكل آمن ومخفي عن المتصفح
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}