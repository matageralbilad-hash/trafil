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
// 4. حدث الضغط على الإشعار: يتم استدعاؤه عندما ينقر المستخدم على التنبيه أعلى الشاشة
self.addEventListener('notificationclick', (event) => {
  // إغلاق نافذة الإشعار بمجرد الضغط عليها
  event.notification.close();

  // إخبار الجوال بفتح التطبيق أو الانتقال إليه إذا كان مفتوحاً في الخلفية
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // إذا كان التطبيق مفتوحاً بالفعل في الخلفية، قم بالتركيز عليه وإظهاره
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // إذا كان التطبيق مغلقاً تماماً، قم بفتحه من جديد
      if (clients.openWindow) {
        return clients.openWindow('/index.html');
      }
    })
  );
});