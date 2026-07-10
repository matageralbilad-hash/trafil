// تغيير اسم الكاش إلى v2 لإجبار المتصفح على استقبال التعديلات الجديدة فوراً
const CACHE_NAME = 'travel-app-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// 1. حدث التثبيت
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 جاري حفظ ملفات النظام في الذاكرة المؤقتة...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // إجبار التحديث على العمل فوراً دون انتظار إغلاق المتصفح
});

// 2. حدث التشغيل وحذف الكاش القديم تلقائياً
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ تنظيف الكاش القديم:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. حدث جلب البيانات الذكي (معدل لحماية الـ Firebase)
self.addEventListener('fetch', (event) => {
  // 🔥 حماية حيوية: إذا كان الرابط يخص قاعدة بيانات Firebase، اتركه يذهب للإنترنت مباشرة ولا تخزنه بالكاش نهائياً
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('firebase')) {
    return; 
  }

  // للملفات الثابتة (الصور، الأكواد، التصميم): ابحث في الكاش أولاً، وإذا لم تجده اجلبه من الإنترنت
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// 4. حدث الضغط على الإشعار (معدل ليتوافق مع رابط Vercel)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // التحقق من الرابط الرئيسي للموقع /
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // فتح الرابط الرئيسي المرفوع على فيرسل مباشرة
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
