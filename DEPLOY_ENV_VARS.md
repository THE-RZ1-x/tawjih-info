# متغيرات بيئة الإنتاج (لضبطها في منصة الاستضافة)

استخدم لوحة التحكم في مزود الاستضافة لإضافة هذه المتغيرات (Key/Value). لا تضع علامات اقتباس حول القيم. أعد تشغيل/إعادة نشر الخدمة بعد كل تعديل.

## المتغيرات المطلوبة

- JWT_SECRET
  - سر قوي (32+ بايت) لتوقيع JWT. مثال توليد (Windows/Node):
  ```powershell
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  - يُستخدم في: `src/lib/auth.ts`

- DATABASE_URL
  - رابط اتصال PostgreSQL (Neon). يجب أن يحوي `sslmode=require`، ويُفضّل إضافة `pgbouncer=true`.
  - صيغة نموذجية:
  ```env
  DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require&pgbouncer=true&connect_timeout=15
  ```
  - يُستخدم في: `prisma/schema.prisma`

- ALLOWED_ORIGINS
  - أصل واحد (Domain) يُضبط في ترويسة CORS للـ API.
  ```env
  ALLOWED_ORIGINS=https://yourdomain.com
  ```
  - يُستخدم في: `src/lib/middleware.ts`

- SOCKET_ORIGINS
  - أصول Socket.IO (مفصولة بفواصل).
  ```env
  SOCKET_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  ```
  - يُستخدم في: `server.ts`

- NEXT_PUBLIC_BASE_URL
  - الرابط الأساس للموقع لاستخدامه في SEO والروابط.
  ```env
  NEXT_PUBLIC_BASE_URL=https://yourdomain.com
  ```
  - يُستخدم في: `src/components/seo.tsx`

## متغيرات اختيارية/لأول تشغيل

- NODE_ENV
  ```env
  NODE_ENV=production
  ```

- ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD
  - لإنشاء حساب مدير عند أول زرع (seeding).
  ```env
  ADMIN_USERNAME=your_admin
  ADMIN_EMAIL=admin@yourdomain.com
  ADMIN_PASSWORD=SecurePassword123!
  ```
  - يُستخدم في: `prisma/seed.ts`

## ملاحظات مهمة

- لا تضع `/` في نهاية الدومين داخل `ALLOWED_ORIGINS`.
- إن كانت كلمة مرور قاعدة البيانات تحوي رموزًا خاصة، تأكد من ترميزها (URL-encoded).
- اذكر كل أصل تحتاجه في `SOCKET_ORIGINS` مفصولًا بفواصل.
- ميدلوير CORS يضبط `Access-Control-Allow-Origin` على قيمة واحدة؛ إن احتجت عدة أصول، عدّل الميدلوير لاختيار الـ Origin ديناميكيًا.
- يوصى بجعل الخادم يقرأ المنفذ من البيئة:
  - في `server.ts`: `const currentPort = Number(process.env.PORT) || 3001;`

## خطوات قاعدة البيانات (الإنتاج)

1) توليد عميل Prisma:
```bash
npm run db:generate
```
2) ترحيل المخطط:
```bash
npx prisma migrate deploy
# أو كخيار سريع (غير مفضل للإنتاج): npm run db:push
```
3) زرع بيانات المدير (اختياري):
```bash
npm run db:seed
```

## بناء وتشغيل

```bash
npm run build
npm start
```

## فحص الصحة

- `GET /api/health` يجب أن يعيد 200.
