// تعريف اسم الذاكرة المؤقتة للتطبيق
const CACHE_NAME = 'travel-app-v1';
// الملفات التي نريد حفظها ليعمل التطبيق حتى لو انقطع الإنترنت
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// 1. حدث التثبيت: يتم استدعاؤه أول مرة يفتح فيها المستخدم الرابط
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 جاري حفظ ملفات النظام في الذاكرة المؤقتة...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. حدث التشغيل: لتنظيف أي كاش قديم إذا قمنا بتحديث التطبيق مستقبلاً
self.addEventListener('activate', (event) => {
  console.log('🚀 خادم الخلفية (Service Worker) نشط وجاهز الآن!');
});

// 3. حدث جلب البيانات: يجعل التطبيق سريع جداً لأنه يقرأ الملفات الثابتة من الجوال مباشرة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});