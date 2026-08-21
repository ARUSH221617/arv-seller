/**
 * ArvanCloud Reseller - Standard WordPress Internationalization (i18n) Toolchain
 *
 * Provides full GNU Gettext compliant tools:
 * 1. Source Code Extraction (Scans PHP, TS, TSX, JS for gettext functions & domain 'arv-seller')
 * 2. POT Catalog Generator (Generates languages/arv-seller.pot with file:line references)
 * 3. PO Translation Manager (Generates & syncs languages/arv-seller-{locale}.po with standard headers & Plural-Forms)
 * 4. MO Binary Compiler (Compiles binary .mo files with native GNU gettext binary specification)
 * 5. Runtime Dictionary Sync (Keeps src/i18n/index.ts and includes/class-arv-seller-i18n.php aligned)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LANG_DIR = path.resolve(ROOT_DIR, 'languages');

// Supported Languages Configuration
export const LANGUAGES_CONFIG = {
  fa_IR: {
    short: 'fa',
    name: 'Persian (Farsi)',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    dir: 'rtl',
    font: '"Vazirmatn", "Shabnam", Tahoma, sans-serif',
    pluralForms: 'nplurals=2; plural=(n > 1);',
  },
  en_US: {
    short: 'en',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    font: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
    pluralForms: 'nplurals=2; plural=(n != 1);',
  },
  ar: {
    short: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    font: '"Vazirmatn", "Dubai", "Segoe UI", Tahoma, sans-serif',
    pluralForms: 'nplurals=6; plural=(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);',
  },
  tr_TR: {
    short: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
    font: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
    pluralForms: 'nplurals=2; plural=(n > 1);',
  },
  zh_CN: {
    short: 'zh',
    name: 'Chinese Simplified',
    nativeName: '简体中文',
    flag: '🇨🇳',
    dir: 'ltr',
    font: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    pluralForms: 'nplurals=1; plural=0;',
  },
  ru_RU: {
    short: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
    font: '"Plus Jakarta Sans", "Roboto", "Inter", sans-serif',
    pluralForms: 'nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
  },
};

const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'languages', 'tests', 'vendor', 'coverage'];

/**
 * Recursively find all source files to scan.
 */
function findSourceFiles(dir, fileList = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(item)) {
        findSourceFiles(fullPath, fileList);
      }
    } else if (/\.(php|ts|tsx|js|jsx)$/i.test(item)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Scan source files and extract gettext strings with their file:line references.
 */
export function extractGettextStrings() {
  const files = findSourceFiles(ROOT_DIR);
  const stringMap = new Map(); // string -> Set of "file:line" references

  // Regex to match WordPress gettext function calls
  // e.g. __('Text', 'arv-seller'), _e("Text", "arv-seller"), esc_html__('Text', 'arv-seller')
  const gettextRegex = /(?:__|_e|_x|esc_html__|esc_html_e|esc_html_x|esc_attr__|esc_attr_e|esc_attr_x)\s*\(\s*(['"])(.+?)\1\s*,\s*(?:['"]arv-seller['"]|['"][^'"]*['"]\s*,\s*['"]arv-seller['"])/g;

  for (const file of files) {
    const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
      const lineText = lines[lineNum - 1];
      let match;
      while ((match = gettextRegex.exec(lineText)) !== null) {
        let msgid = match[2];
        // unescape quotes
        msgid = msgid.replace(/\\'/g, "'").replace(/\\"/g, '"');
        if (msgid && msgid.trim().length > 0) {
          if (!stringMap.has(msgid)) {
            stringMap.set(msgid, new Set());
          }
          stringMap.get(msgid).add(`${relPath}:${lineNum}`);
        }
      }
    }
  }

  return stringMap;
}

/**
 * Parse a standard .po file into a key-value dictionary.
 */
function parsePoContent(content) {
  const translations = {};
  const lines = content.split('\n');
  let currentMsgid = null;
  let currentMsgstr = null;
  let inMsgid = false;
  let inMsgstr = false;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith('#')) continue;

    if (line.startsWith('msgid ')) {
      if (currentMsgid !== null && currentMsgstr !== null && currentMsgid !== '') {
        translations[currentMsgid] = currentMsgstr;
      }
      currentMsgid = line.substring(6).replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      currentMsgstr = null;
      inMsgid = true;
      inMsgstr = false;
    } else if (line.startsWith('msgstr ')) {
      currentMsgstr = line.substring(7).replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      inMsgid = false;
      inMsgstr = true;
    } else if (line.startsWith('"') && line.endsWith('"')) {
      const continuation = line.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      if (inMsgid && currentMsgid !== null) {
        currentMsgid += continuation;
      } else if (inMsgstr && currentMsgstr !== null) {
        currentMsgstr += continuation;
      }
    }
  }

  if (currentMsgid !== null && currentMsgstr !== null && currentMsgid !== '') {
    translations[currentMsgid] = currentMsgstr;
  }

  return translations;
}

const SUPPLEMENTAL_TRANSLATIONS = {
  '1x Public IP (Included)': { fa: '۱ عدد آی‌پی اختصاصی (شامل شده)', ar: 'عنوان IP عام واحد (مشمول)', tr: '1x Genel IP (Dahil)', zh: '1个公网IP（包含）', ru: '1x Публичный IP (включен)' },
  'A minimum balance of %1$s %3$s (24 hours run cost) is required to deploy this server. Your balance is %2$s %3$s.': {
    fa: 'حداقل موجودی %1$s %3$s (هزینه کارکرد ۲۴ ساعت) برای ساخت این سرور لازم است. موجودی شما %2$s %3$s می‌باشد.',
    ar: 'مطلوب رصيد لا يقل عن %1$s %3$s (تكلفة تشغيل 24 ساعة) لإنشاء هذا الخادم. رصيدك الحالي %2$s %3$s.',
    tr: 'Bu sunucuyu dağıtmak için en az %1$s %3$s (24 saatlik çalışma maliyeti) bakiye gereklidir. Bakiyeniz: %2$s %3$s.',
    zh: '部署此服务器需要至少 %1$s %3$s 的余额（24小时运行成本）。您当前的余额为 %2$s %3$s。',
    ru: 'Для развертывания сервера требуется минимальный баланс %1$s %3$s (стоимость 24 часов работы). Ваш баланс: %2$s %3$s.'
  },
  'Accelerate your websites globally with edge caching, SSL termination, and Layer 7 DDoS mitigation across 40+ PoPs.': {
    fa: 'شتاب‌دهی وب‌سایت‌های شما در سراسر جهان با کشینگ لبه، مدیریت SSL و کاهش حملات DDoS لایه ۷ در بیش از ۴۰ پاپ‌سایت.',
    ar: 'تسريع مواقعك عالمياً مع التخزين المؤقت وإنهاء SSL وتخفيف هجمات DDoS للطبقة 7 عبر أكثر من 40 نقطة تواجد.',
    tr: '40+ PoP noktasında uç önbelleğe alma, SSL sonlandırma ve Katman 7 DDoS koruması ile web sitelerinizi küresel olarak hızlandırın.',
    zh: '通过遍布全球40多个节点的边缘缓存、SSL终止和第7层DDoS防护加速您的网站。',
    ru: 'Ускоряйте сайты по всему миру с помощью кэширования на edge-узлах, SSL-терминации и защиты от L7 DDoS на 40+ PoP.'
  },
  'Access Key ID:': { fa: 'شناسه کلید دسترسی (Access Key ID):', ar: 'معرف مفتاح الوصول:', tr: 'Erişim Anahtarı Kimliği:', zh: '访问密钥 ID：', ru: 'Access Key ID:' },
  'Access standalone storefront and customer portal pages:': { fa: 'دسترسی به صفحات فروشگاه اختصاصی و پرتال مشتریان:', ar: 'الوصول إلى متجر الخدمات وبوابة العملاء:', tr: 'Bağımsız mağaza ve müşteri portalı sayfalarına erişin:', zh: '访问独立商城与客户门户页面：', ru: 'Перейти к страницам витрины и клиентского портала:' },
  'Active Cloud Servers & Virtual Machines': { fa: 'سرورهای ابری و ماشین‌های مجازی فعال', ar: 'الخوادم السحابية والأجهزة الافتراضية النشطة', tr: 'Aktif Bulut Sunucuları ve Sanal Makineler', zh: '运行中的云服务器与虚拟机', ru: 'Активные облачные серверы и виртуальные машины' },
  'Adjust Wallet Balance: ': { fa: 'تغییر موجودی کیف پول: ', ar: 'تعديل رصيد المحفظة: ', tr: 'Cüzdan Bakiyesini Düzenle: ', zh: '调整钱包余额：', ru: 'Изменить баланс кошелька: ' },
  'Admin Adjustment: %1$s (by %2$s)': { fa: 'تعدیل مدیر: %1$s (توسط %2$s)', ar: 'تعديل الإدارة: %1$s (بواسطة %2$s)', tr: 'Yönetici Ayarlaması: %1$s (%2$s tarafından)', zh: '管理员调整：%1$s（操作者：%2$s）', ru: 'Корректировка администратора: %1$s (%2$s)' },
  'All Resources': { fa: 'همه منابع', ar: 'جميع الموارد', tr: 'Tüm Kaynaklar', zh: '所有资源', ru: 'Все ресурсы' },
  'Allocated NVMe Storage:': { fa: 'فضای ذخیره‌سازی NVMe تخصیص‌یافته:', ar: 'مساحة تخزين NVMe المخصصة:', tr: 'Tahsis Edilen NVMe Depolama:', zh: '已分配 NVMe 存储：', ru: 'Выделенное хранилище NVMe:' },
  'An error occurred during request.': { fa: 'خطایی در هنگام ارسال درخواست رخ داد.', ar: 'حدث خطأ أثناء معالجة الطلب.', tr: 'İstek sırasında bir hata oluştu.', zh: '请求过程中发生错误。', ru: 'Произошла ошибка при выполнении запроса.' },
  'Applying...': { fa: 'در حال اعمال...', ar: 'جاري التطبيق...', tr: 'Uygulanıyor...', zh: '正在应用...', ru: 'Применение...' },
  'Are you sure you want to permanently destroy this server?': { fa: 'آیا از حذف دائمی این سرور اطمینان دارید؟', ar: 'هل أنت متأكد من حذف هذا الخادم نهائياً؟', tr: 'Bu sunucuyu kalıcı olarak silmek istediğinizden emin misiniz?', zh: '您确定要永久销毁此服务器吗？', ru: 'Вы уверены, что хотите навсегда удалить этот сервер?' },
  'Arvan Reseller': { fa: 'نمایندگی ابر آروان', ar: 'وكالة آروان', tr: 'ArvanCloud Bayi', zh: 'ArvanCloud 分销系统', ru: 'Реселлинг ArvanCloud' },
  'ArvanCloud API key is not configured. Please configure your API key in WP Admin > Arvan Reseller > Settings.': {
    fa: 'کلید API ابر آروان تنظیم نشده است. لطفاً کلید API خود را در پیشخوان وردپرس > نمایندگی آروان > تنظیمات پیکربندی نمایید.',
    ar: 'لم يتم تكوين مفتاح API. يرجى تكوين المفتاح في لوحة التحكم > وكالة آروان > الإعدادات.',
    tr: 'ArvanCloud API anahtarı yapılandırılmamış. Lütfen WP Yöneticisi > Arvan Bayi > Ayarlar menüsünden yapılandırın.',
    zh: '未配置 ArvanCloud API 密钥。请在 WP 后台 > Arvan Reseller > 设置 中进行配置。',
    ru: 'API ключ ArvanCloud не настроен. Настройте его в панели управления WP > Arvan Reseller > Настройки.'
  },
  'Assigned IP': { fa: 'آی‌پی اختصاص‌یافته', ar: 'عنوان IP المخصص', tr: 'Atanan IP', zh: '分配的 IP', ru: 'Назначенный IP' },
  'Authentication Mode:': { fa: 'روش احراز هویت:', ar: 'طريقة المصادقة:', tr: 'Kimlik Doğrulama Yöntemi:', zh: '认证方式：', ru: 'Способ аутентификации:' },
  'AWS CLI & Rclone Configuration Example': { fa: 'نمونه پیکربندی AWS CLI و Rclone', ar: 'نموذج تكوين AWS CLI و Rclone', tr: 'AWS CLI ve Rclone Yapılandırma Örneği', zh: 'AWS CLI 和 Rclone 配置示例', ru: 'Пример конфигурации AWS CLI и Rclone' },
  'Bucket name must contain only lowercase letters, numbers, and hyphens.': { fa: 'نام باکت باید فقط شامل حروف کوچک، اعداد و خط تیره باشد.', ar: 'يجب أن يحتوي اسم الحاوية على أحرف صغيرة وأرقام وشرطات فقط.', tr: 'Paket adı yalnızca küçük harfler, rakamlar ve tire içermelidir.', zh: '存储桶名称只能包含小写字母、数字和连字符。', ru: 'Имя бакета должно содержать только строчные буквы, цифры и дефисы.' },
  'Buckets': { fa: 'باکت‌ها', ar: 'الحاويات', tr: 'Depolama Paketleri', zh: '存储桶', ru: 'Бакеты' },
  'Burn Rate:': { fa: 'نرخ مصرف:', ar: 'معدل الاستهلاك:', tr: 'Harcanma Oranı:', zh: '消耗速率：', ru: 'Расход в час:' },
  'Cannot power on server: Your wallet balance is zero or negative. Please top up your wallet first.': {
    fa: 'امکان روشن کردن سرور وجود ندارد: موجودی کیف پول شما صفر یا منفی است. لطفاً ابتدا کیف پول خود را شارژ نمایید.',
    ar: 'لا يمكن تشغيل الخادم: رصيد محفظتك صفر أو سالب. يرجى شحن المحفظة أولاً.',
    tr: 'Sunucu başlatılamıyor: Cüzdan bakiyeniz sıfır veya negatif. Lütfen önce cüzdanınızı doldurun.',
    zh: '无法开启服务器：您的钱包余额为零或负数。请先充值钱包。',
    ru: 'Невозможно запустить сервер: баланс вашего кошелька равен нулю или отрицательный. Пожалуйста, пополните кошелек.'
  },
  'CDN activated for "%s". Please set your nameservers.': { fa: 'شبکه CDN برای «%s» فعال شد. لطفاً نیم‌سرورهای خود را تنظیم نمایید.', ar: 'تم تفعيل CDN لـ "%s". يرجى ضبط خوادم الأسماء الخاصة بك.', tr: '"%s" için CDN etkinleştirildi. Lütfen ad sunucularınızı ayarlayın.', zh: '已为 "%s" 启用 CDN。请配置您的名称服务器。', ru: 'CDN активирован для «%s». Укажите ваши DNS-серверы.' },
  'CDN domain connected successfully.': { fa: 'دامنه با موفقیت به CDN متصل شد.', ar: 'تم ربط النطاق بـ CDN بنجاح.', tr: 'CDN alanı başarıyla bağlandı.', zh: 'CDN 域名连接成功。', ru: 'CDN домен успешно подключен.' },
  'Choose Datacenter Region': { fa: 'انتخاب دیتاسنتر و منطقه ابری', ar: 'اختيار مركز البيانات والمنطقة السحابية', tr: 'Veri Merkezi Bölgesini Seçin', zh: '选择数据中心区域', ru: 'Выберите регион дата-центра' },
  'Click to copy IP': { fa: 'برای کپی آدرس IP کلیک کنید', ar: 'انقر لنسخ عنوان IP', tr: 'IP kopyalamak için tıklayın', zh: '点击复制 IP', ru: 'Нажмите для копирования IP' },
  'Cloud Services Platform': { fa: 'سامانه خدمات ابری', ar: 'منصة الخدمات السحابية', tr: 'Bulut Hizmetleri Platformu', zh: '云服务平台', ru: 'Платформа облачных сервисов' },
  'Compute Specs:': { fa: 'مشخصات پردازشی:', ar: 'مواصفات المعالجة:', tr: 'Hesaplama Özellikleri:', zh: '计算规格：', ru: 'Характеристики вычислений:' },
  'Compute, NVMe & Dedicated IP': { fa: 'پردازنده، دیسک NVMe و IP اختصاصی', ar: 'المعالج والتخزين NVMe وعنوان IP مخصص', tr: 'İşlemci, NVMe ve Özel IP', zh: '计算资源、NVMe 及独立 IP', ru: 'Процессор, NVMe и выделенный IP' },
  'Deploy Cloud Server (IaaS)': { fa: 'سفارش سرور ابری (IaaS)', ar: 'إنشاء خادم سحابي (IaaS)', tr: 'Bulut Sunucu Başlat (IaaS)', zh: '部署云服务器 (IaaS)', ru: 'Создать облачный сервер (IaaS)' },
  'Instant provisioning on ArvanCloud infrastructure. High IOPS NVMe SSD, dedicated IPv4, sub-millisecond local network.': {
    fa: 'تحویل آنی بر روی زیرساخت ابر آروان. دیسک‌های NVMe پرسرعت، IPv4 اختصاصی و شبکه داخلی زیر میلی‌ثانیه.',
    ar: 'تهيئة فورية على بنية آروان التحتية. أقراص NVMe فائقة السرعة، IPv4 مخصص، وشبكة محلية فائقة السرعة.',
    tr: 'ArvanCloud altyapısında anında teslimat. Yüksek IOPS NVMe SSD, özel IPv4, milisaniyenin altında yerel ağ.',
    zh: '在 ArvanCloud 基础设施上即时开通。高 IOPS NVMe SSD、独立 IPv4 和亚毫秒级本地网络。',
    ru: 'Мгновенное развертывание на инфраструктуре ArvanCloud. Высокопроизводительные NVMe SSD, выделенный IPv4 и минимальные задержки.'
  },
  'Low Latency / IXP Direct': { fa: 'کمترین تاخیر / اتصال مستقیم IXP', ar: 'أقل زمن انتقال / اتصال مباشر بـ IXP', tr: 'Düşük Gecikme / Doğrudan IXP Bağlantısı', zh: '低延迟 / IXP 直连', ru: 'Низкая задержка / Прямое подключение к IXP' },
  'Tier III Enterprise DC': { fa: 'دیتاسنتر سازمانی استاندارد Tier III', ar: 'مركز بيانات مؤسسي من المستوى الثالث Tier III', tr: 'Tier III Kurumsal Veri Merkezi', zh: 'Tier III 级企业数据中心', ru: 'Корпоративный ЦОД уровня Tier III' },
  'Geo-Redundant Disaster Recovery': { fa: 'پایداری جغرافیایی و بازیابی فاجعه', ar: 'التعافي من الكوارث مع التكرار الجغرافي', tr: 'Coğrafi Yedekli Felaket Kurtarma', zh: '异地容灾与高可用', ru: 'Геораспределенное аварийное восстановление' },
  'Hardware Plan & Specifications': { fa: 'پلن سخت‌افزاری و مشخصات سرور', ar: 'باقة العتاد والمواصفات', tr: 'Donanım Planı ve Özellikleri', zh: '硬件配置与规格', ru: 'Конфигурация оборудования' },
  'Compute resources can be dynamically scaled anytime.': { fa: 'منابع پردازشی در هر زمان قابل تغییر و ارتقا هستند.', ar: 'يمكن ترقية الموارد الحسابية ديناميكياً في أي وقت.', tr: 'Hesaplama kaynakları istenildiği zaman dinamik olarak ölçeklendirilebilir.', zh: '计算资源可随时动态弹性调整。', ru: 'Вычислительные ресурсы можно масштабировать в любое время.' },
  'Processor': { fa: 'پردازنده', ar: 'المعالج', tr: 'İşlemci', zh: '处理器', ru: 'Процессор' },
  'RAM Memory': { fa: 'حافظه رم', ar: 'الذاكرة العشوائية', tr: 'RAM Bellek', zh: '内存', ru: 'Оперативная память' },
  'Managed Let\'s Encrypt (Active)': { fa: 'گواهی خودکار Let\'s Encrypt (فعال)', ar: 'شهادة Let\'s Encrypt تلقائية (نشطة)', tr: 'Yönetilen Let\'s Encrypt (Aktif)', zh: '托管 Let\'s Encrypt 证书（有效）', ru: 'Автоматический Let\'s Encrypt (Активен)' },
  'DNS Zone Editor': { fa: 'ویرایشگر رکوردهای DNS', ar: 'محرر سجلات DNS', tr: 'DNS Kayıt Düzenleyici', zh: 'DNS 记录编辑器', ru: 'Редактор DNS записей' },
  'DNS Zone Records:': { fa: 'رکوردهای منطقه DNS:', ar: 'سجلات منطقة DNS:', tr: 'DNS Bölge Kayıtları:', zh: 'DNS 区域记录：', ru: 'Записи зоны DNS:' },
  'Record Type': { fa: 'نوع رکورد', ar: 'نوع السجل', tr: 'Kayıt Türü', zh: '记录类型', ru: 'Тип записи' },
  'Target Value / IP': { fa: 'مقصد / آدرس IP', ar: 'الهدف / عنوان IP', tr: 'Hedef / IP', zh: '目标值 / IP', ru: 'Целевое значение / IP' },
  'Protected': { fa: 'محافظت‌شده', ar: 'محمي', tr: 'Korumalı', zh: '已受保护', ru: 'Защищено' },
  'Purge Edge Cache': { fa: 'پاکسازی کش لبه', ar: 'مسح التخزين المؤقت', tr: 'Uç Önbelleği Temizle', zh: '清理边缘缓存', ru: 'Очистить edge-кэш' },
  'No CDN domains configured yet': { fa: 'هنوز هیچ دامنه‌ای در CDN ثبت نشده است', ar: 'لم يتم تكوين أي نطاقات CDN بعد', tr: 'Henüz yapılandırılmış CDN alanı yok', zh: '尚未配置任何 CDN 域名', ru: 'CDN домены еще не настроены' },
  'Enter a domain name above to accelerate your traffic and protect from DDoS attacks.': {
    fa: 'نام دامنه خود را در بالا وارد نمایید تا ترافیک شتاب‌دهی شده و در برابر حملات DDoS محافظت گردد.',
    ar: 'أدخل اسم النطاق أعلاه لتسريع حركة المرور وحمايتها من هجمات DDoS.',
    tr: 'Trafiğinizi hızlandırmak ve DDoS saldırılarından korumak için yukarıya bir alan adı girin.',
    zh: '在上方输入域名以加速流量并防御 DDoS 攻击。',
    ru: 'Введите домен выше для ускорения трафика и защиты от DDoS-атак.'
  }
};

/**
 * Load existing translation dictionaries from src/i18n/index.ts, PO files, and supplementals.
 */
export function loadExistingDictionaries() {
  const dicts = { fa: {}, en: {}, ar: {}, tr: {}, zh: {}, ru: {} };

  // 1. Try loading from src/i18n/index.ts
  const tsPath = path.join(ROOT_DIR, 'src', 'i18n', 'index.ts');
  if (fs.existsSync(tsPath)) {
    try {
      const tsContent = fs.readFileSync(tsPath, 'utf8');
      const match = tsContent.match(/export const DICTIONARIES[^{]*(\{[\s\S]*?\n\};)/);
      if (match && match[1]) {
        const cleanObjStr = match[1].replace(/;\s*$/, '');
        const loaded = new Function(`return (${cleanObjStr});`)();
        for (const lang of Object.keys(dicts)) {
          if (loaded[lang] && typeof loaded[lang] === 'object') {
            Object.assign(dicts[lang], loaded[lang]);
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not parse src/i18n/index.ts, fallback to PO files:', e.message);
    }
  }

  // 2. Merge translations from supplemental dictionary
  for (const [key, transMap] of Object.entries(SUPPLEMENTAL_TRANSLATIONS)) {
    for (const [lang, val] of Object.entries(transMap)) {
      if (dicts[lang] && (!dicts[lang][key] || dicts[lang][key] === '')) {
        dicts[lang][key] = val;
      }
    }
  }

  // 3. Merge translations from existing .po files in languages/
  for (const [localeKey, localeMeta] of Object.entries(LANGUAGES_CONFIG)) {
    const langShort = localeMeta.short;
    const poFile = path.join(LANG_DIR, `arv-seller-${localeKey}.po`);
    if (fs.existsSync(poFile)) {
      const poContent = fs.readFileSync(poFile, 'utf8');
      const parsed = parsePoContent(poContent);
      for (const [key, val] of Object.entries(parsed)) {
        if (val && (!dicts[langShort][key] || dicts[langShort][key] === '')) {
          dicts[langShort][key] = val;
        }
      }
    }
  }

  return dicts;
}

/**
 * Escape string for PO/POT format.
 */
function escapePoString(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Format standard POT header.
 */
function getPotHeader() {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + '+0000';
  return `msgid ""
msgstr ""
"Project-Id-Version: ArvanCloud Reseller 1.0.0\\n"
"Report-Msgid-Bugs-To: https://arvancloud.ir\\n"
"POT-Creation-Date: ${now}\\n"
"PO-Revision-Date: ${now}\\n"
"Last-Translator: ArvanCloud Dev Team <support@arvancloud.ir>\\n"
"Language-Team: ArvanCloud Internationalization Team\\n"
"Language: en\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"
"X-Generator: ArvanCloud i18n Toolchain\\n"
"X-Domain: arv-seller\\n"
`;
}

/**
 * Format standard PO header for a specific locale.
 */
function getPoHeader(localeKey, localeMeta) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + '+0000';
  return `msgid ""
msgstr ""
"Project-Id-Version: ArvanCloud Reseller 1.0.0\\n"
"Report-Msgid-Bugs-To: https://arvancloud.ir\\n"
"POT-Creation-Date: ${now}\\n"
"PO-Revision-Date: ${now}\\n"
"Last-Translator: ArvanCloud Dev Team <support@arvancloud.ir>\\n"
"Language-Team: ArvanCloud ${localeMeta.name} Team\\n"
"Language: ${localeKey}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: ${localeMeta.pluralForms}\\n"
"X-Generator: ArvanCloud i18n Toolchain\\n"
"X-Domain: arv-seller\\n"
`;
}

/**
 * Compile PO entries into GNU gettext binary .mo file.
 *
 * @param {Array<{msgid: string, msgstr: string}>} entries
 * @param {string} headerString
 * @returns {Buffer}
 */
export function compilePoToMoBuffer(entries, headerString) {
  // Entry 0 is the PO header with empty msgid
  const allEntries = [{ msgid: '', msgstr: headerString }];

  for (const entry of entries) {
    if (entry.msgid && entry.msgid.length > 0) {
      allEntries.push({
        msgid: entry.msgid,
        msgstr: entry.msgstr || '',
      });
    }
  }

  // GNU Gettext requires strings to be sorted lexicographically by msgid in byte order
  allEntries.sort((a, b) => {
    const bufA = Buffer.from(a.msgid, 'utf8');
    const bufB = Buffer.from(b.msgid, 'utf8');
    return Buffer.compare(bufA, bufB);
  });

  const numStrings = allEntries.length;
  const headerSize = 28; // 7 uint32s = 28 bytes
  const origTableOffset = headerSize;
  const transTableOffset = origTableOffset + numStrings * 8;
  const stringsStartOffset = transTableOffset + numStrings * 8;

  // Prepare string buffers
  const origBuffers = [];
  const transBuffers = [];
  const origEntries = []; // { length, offset }
  const transEntries = []; // { length, offset }

  let currentOffset = stringsStartOffset;

  // Write all original strings
  for (let i = 0; i < numStrings; i++) {
    const buf = Buffer.from(allEntries[i].msgid, 'utf8');
    origEntries.push({ length: buf.length, offset: currentOffset });
    origBuffers.push(buf);
    origBuffers.push(Buffer.from([0])); // NUL terminator
    currentOffset += buf.length + 1;
  }

  // Write all translated strings
  for (let i = 0; i < numStrings; i++) {
    const buf = Buffer.from(allEntries[i].msgstr, 'utf8');
    transEntries.push({ length: buf.length, offset: currentOffset });
    transBuffers.push(buf);
    transBuffers.push(Buffer.from([0])); // NUL terminator
    currentOffset += buf.length + 1;
  }

  // Construct binary file
  const totalFileSize = currentOffset;
  const moBuffer = Buffer.alloc(totalFileSize);

  // 1. Header (28 bytes)
  moBuffer.writeUInt32LE(0x950412de, 0); // Magic number
  moBuffer.writeUInt32LE(0, 4); // Format revision
  moBuffer.writeUInt32LE(numStrings, 8); // Number of strings
  moBuffer.writeUInt32LE(origTableOffset, 12); // Offset of original strings table
  moBuffer.writeUInt32LE(transTableOffset, 16); // Offset of translation strings table
  moBuffer.writeUInt32LE(0, 20); // Hash table size
  moBuffer.writeUInt32LE(0, 24); // Hash table offset

  // 2. Original strings descriptor table
  for (let i = 0; i < numStrings; i++) {
    const pos = origTableOffset + i * 8;
    moBuffer.writeUInt32LE(origEntries[i].length, pos);
    moBuffer.writeUInt32LE(origEntries[i].offset, pos + 4);
  }

  // 3. Translation strings descriptor table
  for (let i = 0; i < numStrings; i++) {
    const pos = transTableOffset + i * 8;
    moBuffer.writeUInt32LE(transEntries[i].length, pos);
    moBuffer.writeUInt32LE(transEntries[i].offset, pos + 4);
  }

  // 4. String Data
  let writeOffset = stringsStartOffset;
  for (let i = 0; i < origBuffers.length; i++) {
    origBuffers[i].copy(moBuffer, writeOffset);
    writeOffset += origBuffers[i].length;
  }
  for (let i = 0; i < transBuffers.length; i++) {
    transBuffers[i].copy(moBuffer, writeOffset);
    writeOffset += transBuffers[i].length;
  }

  return moBuffer;
}

/**
 * Main generator execution.
 */
export async function runI18nToolchain() {
  console.log('===============================================================');
  console.log('  🌐 ARVANCLOUD RESELLER STANDARDIZED i18n BUILD PIPELINE');
  console.log('===============================================================\n');

  if (!fs.existsSync(LANG_DIR)) {
    fs.mkdirSync(LANG_DIR, { recursive: true });
  }

  // 1. Extract strings from source code
  console.log('🔍 [1/5] Scanning PHP, TS, TSX, JS files for gettext strings...');
  const extractedMap = extractGettextStrings();
  console.log(`   Found ${extractedMap.size} unique gettext strings in codebase.`);

  // 2. Load existing translation dictionaries
  console.log('📖 [2/5] Loading multi-language dictionaries...');
  const dicts = loadExistingDictionaries();
  const allKeys = new Set([...extractedMap.keys(), ...Object.keys(dicts.fa), ...Object.keys(dicts.en)]);
  console.log(`   Total catalog keys across all components: ${allKeys.size}`);

  // Sort keys for consistent output
  const sortedKeys = Array.from(allKeys).sort((a, b) => a.localeCompare(b, 'en'));

  // 3. Generate standard languages/arv-seller.pot
  console.log('📝 [3/5] Generating GNU Gettext template (languages/arv-seller.pot)...');
  let potContent = getPotHeader() + '\n';
  for (const key of sortedKeys) {
    const refs = extractedMap.get(key);
    if (refs && refs.size > 0) {
      potContent += `#: ${Array.from(refs).join(' ')}\n`;
    }
    potContent += `msgid "${escapePoString(key)}"\n`;
    potContent += `msgstr ""\n\n`;
  }
  const potPath = path.join(LANG_DIR, 'arv-seller.pot');
  fs.writeFileSync(potPath, potContent, 'utf8');
  console.log(`   ✅ Created ${path.relative(ROOT_DIR, potPath)} (${sortedKeys.length} strings)`);

  // 4. Generate & Sync PO catalogs and compile binary MO files
  console.log('🌍 [4/5] Generating PO catalogs & compiling binary MO files...');
  for (const [localeKey, localeMeta] of Object.entries(LANGUAGES_CONFIG)) {
    const langShort = localeMeta.short;
    const langDict = dicts[langShort] || {};
    const poHeader = getPoHeader(localeKey, localeMeta);

    let poContent = poHeader + '\n';
    const moEntries = [];

    for (const key of sortedKeys) {
      let translation = langDict[key];
      if (translation === undefined) {
        translation = langShort === 'en' ? key : '';
      }

      const refs = extractedMap.get(key);
      if (refs && refs.size > 0) {
        poContent += `#: ${Array.from(refs).join(' ')}\n`;
      }
      poContent += `msgid "${escapePoString(key)}"\n`;
      poContent += `msgstr "${escapePoString(translation)}"\n\n`;

      moEntries.push({ msgid: key, msgstr: translation });
    }

    // Write PO file
    const poFileName = `arv-seller-${localeKey}.po`;
    const poPath = path.join(LANG_DIR, poFileName);
    fs.writeFileSync(poPath, poContent, 'utf8');

    // Compile MO binary file
    const moBuffer = compilePoToMoBuffer(moEntries, poHeader);
    const moFileName = `arv-seller-${localeKey}.mo`;
    const moPath = path.join(LANG_DIR, moFileName);
    fs.writeFileSync(moPath, moBuffer);

    console.log(`   ✅ [${localeKey}] PO: ${poFileName} | MO: ${moFileName} (${moBuffer.length} bytes)`);
  }

  // 5. Update runtime caches
  console.log('🔄 [5/5] Synchronizing frontend and backend runtime caches...');

  // 5a. Update src/i18n/index.ts
  const tsPath = path.join(ROOT_DIR, 'src', 'i18n', 'index.ts');
  const tsContent = `import { SupportedLanguage } from '../types';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
];

export const DICTIONARIES: Record<SupportedLanguage, Record<string, string>> = ${JSON.stringify(dicts, null, 2)};

export function getTranslation(key: string, lang: SupportedLanguage = 'fa'): string {
  if (DICTIONARIES[lang] && DICTIONARIES[lang][key]) {
    return DICTIONARIES[lang][key];
  }
  if (DICTIONARIES['en'] && DICTIONARIES['en'][key]) {
    return DICTIONARIES['en'][key];
  }
  return key;
}
`;
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log(`   ✅ Updated ${path.relative(ROOT_DIR, tsPath)}`);

  // 5b. Update includes/class-arv-seller-i18n.php
  const phpPath = path.join(ROOT_DIR, 'includes', 'class-arv-seller-i18n.php');
  let phpDictArray = '';
  for (const lang of ['fa', 'en', 'ar', 'tr', 'zh', 'ru']) {
    phpDictArray += `\t\t'${lang}' => array(\n`;
    for (const key of sortedKeys) {
      const trans = dicts[lang][key] !== undefined ? dicts[lang][key] : (lang === 'en' ? key : '');
      phpDictArray += `\t\t\t'${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}' => '${trans.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',\n`;
    }
    phpDictArray += `\t\t),\n`;
  }

  const phpClassTemplate = `<?php
/**
 * Define the multi-language internationalization functionality.
 *
 * Provides runtime translation dictionaries, WordPress gettext filters, and language switching support for:
 * Persian (fa_IR), English (en_US), Arabic (ar), Turkish (tr_TR), Chinese (zh_CN), Russian (ru_RU).
 *
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */

if ( ! defined( 'WPINC' ) ) {
\tdie;
}

/**
 * Define the internationalization functionality.
 *
 * @since      1.0.0
 * @package    ArvanCloud_Reseller
 * @subpackage ArvanCloud_Reseller/includes
 */
class Arv_Seller_i18n {

\t/**
\t * Supported languages configuration.
\t */
\tconst LANGUAGES = array(
\t\t'fa' => array(
\t\t\t'code'      => 'fa_IR',
\t\t\t'short'     => 'fa',
\t\t\t'name'      => 'فارسی',
\t\t\t'flag'      => '🇮🇷',
\t\t\t'direction' => 'rtl',
\t\t\t'font'      => '"Vazirmatn", "Shabnam", Tahoma, sans-serif',
\t\t),
\t\t'en' => array(
\t\t\t'code'      => 'en_US',
\t\t\t'short'     => 'en',
\t\t\t'name'      => 'English',
\t\t\t'flag'      => '🇺🇸',
\t\t\t'direction' => 'ltr',
\t\t\t'font'      => '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
\t\t),
\t\t'ar' => array(
\t\t\t'code'      => 'ar',
\t\t\t'short'     => 'ar',
\t\t\t'name'      => 'العربية',
\t\t\t'flag'      => '🇸🇦',
\t\t\t'direction' => 'rtl',
\t\t\t'font'      => '"Vazirmatn", "Dubai", "Segoe UI", Tahoma, sans-serif',
\t\t),
\t\t'tr' => array(
\t\t\t'code'      => 'tr_TR',
\t\t\t'short'     => 'tr',
\t\t\t'name'      => 'Türkçe',
\t\t\t'flag'      => '🇹🇷',
\t\t\t'direction' => 'ltr',
\t\t\t'font'      => '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
\t\t),
\t\t'zh' => array(
\t\t\t'code'      => 'zh_CN',
\t\t\t'short'     => 'zh',
\t\t\t'name'      => '简体中文',
\t\t\t'flag'      => '🇨🇳',
\t\t\t'direction' => 'ltr',
\t\t\t'font'      => '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
\t\t),
\t\t'ru' => array(
\t\t\t'code'      => 'ru_RU',
\t\t\t'short'     => 'ru',
\t\t\t'name'      => 'Русский',
\t\t\t'flag'      => '🇷🇺',
\t\t\t'direction' => 'ltr',
\t\t\t'font'      => '"Plus Jakarta Sans", "Roboto", "Inter", sans-serif',
\t\t),
\t);

\t/**
\t * Complete Multi-Language Dictionary Matrix.
\t */
\tconst DICTIONARIES = array(
${phpDictArray}\t);

\t/**
\t * Active language key (e.g. 'fa', 'en', 'ar', 'tr', 'zh', 'ru').
\t *
\t * @var string
\t */
\tprotected static $active_lang = 'fa';

\t/**
\t * Initialize i18n hooks and language resolution.
\t *
\t * @since    1.0.0
\t */
\tpublic function init() {
\t\tself::resolve_active_language();

\t\t// Hook textdomain loader
\t\tadd_action( 'plugins_loaded', array( $this, 'load_plugin_textdomain' ) );

\t\t// Dynamic gettext filter for runtime translations
\t\tadd_filter( 'gettext', array( $this, 'filter_translations' ), 20, 3 );
\t\tadd_filter( 'gettext_with_context', array( $this, 'filter_translations_with_context' ), 20, 4 );
\t}

\t/**
\t * Determine the active language from WordPress locale (primary source of truth),
\t * with optional explicit cookie/query parameter override.
\t */
\tpublic static function resolve_active_language() {
\t\t// 1. Explicit Cookie Override
\t\tif ( isset( $_COOKIE['arvan_lang'] ) && isset( self::LANGUAGES[ sanitize_key( $_COOKIE['arvan_lang'] ) ] ) ) {
\t\t\tself::$active_lang = sanitize_key( $_COOKIE['arvan_lang'] );
\t\t\treturn self::$active_lang;
\t\t}

\t\t// 2. Synchronize directly with WordPress Site Locale
\t\t$wp_locale = function_exists( 'determine_locale' ) ? determine_locale() : ( function_exists( 'get_user_locale' ) ? get_user_locale() : ( function_exists( 'get_locale' ) ? get_locale() : 'fa_IR' ) );

\t\tif ( empty( $wp_locale ) ) {
\t\t\t$wp_locale = function_exists( 'get_locale' ) ? get_locale() : 'fa_IR';
\t\t}

\t\t$wp_locale = strtolower( str_replace( '-', '_', $wp_locale ) );

\t\tif ( 0 === strpos( $wp_locale, 'fa' ) || 0 === strpos( $wp_locale, 'pes' ) ) {
\t\t\tself::$active_lang = 'fa';
\t\t} elseif ( 0 === strpos( $wp_locale, 'ar' ) ) {
\t\t\tself::$active_lang = 'ar';
\t\t} elseif ( 0 === strpos( $wp_locale, 'tr' ) ) {
\t\t\tself::$active_lang = 'tr';
\t\t} elseif ( 0 === strpos( $wp_locale, 'zh' ) ) {
\t\t\tself::$active_lang = 'zh';
\t\t} elseif ( 0 === strpos( $wp_locale, 'ru' ) ) {
\t\t\tself::$active_lang = 'ru';
\t\t} elseif ( 0 === strpos( $wp_locale, 'en' ) ) {
\t\t\tself::$active_lang = 'en';
\t\t} else {
\t\t\tself::$active_lang = ( function_exists( 'is_rtl' ) && is_rtl() ) ? 'fa' : 'en';
\t\t}

\t\treturn self::$active_lang;
\t}

\t/**
\t * Get active language identifier ('fa', 'en', 'ar', 'tr', 'zh', 'ru').
\t *
\t * @return string
\t */
\tpublic static function get_active_language() {
\t\tif ( empty( self::$active_lang ) ) {
\t\t\tself::resolve_active_language();
\t\t}
\t\treturn self::$active_lang;
\t}

\t/**
\t * Get layout direction ('rtl' or 'ltr') for the active language.
\t *
\t * @return string
\t */
\tpublic static function get_direction() {
\t\t$lang = self::get_active_language();
\t\treturn isset( self::LANGUAGES[ $lang ]['direction'] ) ? self::LANGUAGES[ $lang ]['direction'] : 'rtl';
\t}

\t/**
\t * Alias for get_direction()
\t *
\t * @return string
\t */
\tpublic static function get_active_direction() {
\t\treturn self::get_direction();
\t}

\t/**
\t * Get all supported languages configuration.
\t *
\t * @return array
\t */
\tpublic static function get_supported_languages() {
\t\treturn self::LANGUAGES;
\t}

\t/**
\t * Get dictionary for a given language.
\t *
\t * @param string $lang Language short code.
\t * @return array
\t */
\tpublic static function get_dictionary( $lang = 'fa' ) {
\t\treturn isset( self::DICTIONARIES[ $lang ] ) ? self::DICTIONARIES[ $lang ] : self::DICTIONARIES['fa'];
\t}

\t/**
\t * Translate a string using the active dictionary.
\t *
\t * @param string $text Text string in English or Persian.
\t * @param string $lang Optional target language.
\t * @return string
\t */
\tpublic static function translate( $text, $lang = null ) {
\t\tif ( empty( $lang ) ) {
\t\t\t$lang = self::get_active_language();
\t\t}

\t\t$dict = self::get_dictionary( $lang );
\t\tif ( isset( $dict[ $text ] ) ) {
\t\t\treturn $dict[ $text ];
\t\t}

\t\treturn $text;
\t}

\t/**
\t * Load plugin textdomain for WordPress gettext system.
\t *
\t * @since    1.0.0
\t */
\tpublic function load_plugin_textdomain() {
\t\tload_plugin_textdomain(
\t\t\t'arv-seller',
\t\t\tfalse,
\t\t\tdirname( dirname( plugin_basename( __FILE__ ) ) ) . '/languages/'
\t\t);
\t}

\t/**
\t * Filter gettext calls for arv-seller domain to support runtime switching.
\t *
\t * @param string $translated_text
\t * @param string $text
\t * @param string $domain
\t * @return string
\t */
\tpublic function filter_translations( $translated_text, $text, $domain ) {
\t\tif ( 'arv-seller' !== $domain ) {
\t\t\treturn $translated_text;
\t\t}

\t\t$active_lang = self::get_active_language();
\t\t$dict        = self::get_dictionary( $active_lang );

\t\tif ( isset( $dict[ $text ] ) && '' !== $dict[ $text ] ) {
\t\t\treturn $dict[ $text ];
\t\t}

\t\treturn $translated_text;
\t}

\t/**
\t * Filter gettext_with_context calls for arv-seller domain.
\t *
\t * @param string $translated_text
\t * @param string $text
\t * @param string $context
\t * @param string $domain
\t * @return string
\t */
\tpublic function filter_translations_with_context( $translated_text, $text, $context, $domain ) {
\t\tif ( 'arv-seller' !== $domain ) {
\t\t\treturn $translated_text;
\t\t}

\t\treturn $this->filter_translations( $translated_text, $text, $domain );
\t}
}
`;

  fs.writeFileSync(phpPath, phpClassTemplate, 'utf8');
  console.log(`   ✅ Updated ${path.relative(ROOT_DIR, phpPath)}`);

  console.log('\n===============================================================');
  console.log('  🎉 i18n BUILD COMPLETED SUCCESSFULLY!');
  console.log('===============================================================\n');
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runI18nToolchain().catch((err) => {
    console.error('❌ i18n generation failed:', err);
    process.exit(1);
  });
}
