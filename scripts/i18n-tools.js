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
  },
  'serverConfiguratorLink': { fa: 'سفارش سرور ابری', en: 'Server Configurator', ar: 'تهيئة الخادم السحابي', tr: 'Sunucu Yapılandırıcısı', zh: '云服务器配置中心', ru: 'Конфигуратор серверов' },
  'customerDashboardLink': { fa: 'داشبورد مشتری', en: 'Customer Dashboard', ar: 'لوحة تحكم العميل', tr: 'Müşteri Paneli', zh: '客户控制台', ru: 'Панель клиента' },
  'cdnManagerLink': { fa: 'مدیریت CDN و DNS', en: 'CDN & DNS Manager', ar: 'إدارة CDN و DNS', tr: 'CDN ve DNS Yöneticisi', zh: 'CDN 与 DNS 管理器', ru: 'Управление CDN и DNS' },
  's3StorageLink': { fa: 'ذخیره‌سازی S3', en: 'S3 Object Storage', ar: 'تخزين الكائنات S3', tr: 'S3 Nesne Depolama', zh: 'S3 对象存储', ru: 'Объектное хранилище S3' },
  'Customization & Branding': { fa: 'سفارشی‌سازی و ظاهر', ar: 'التخصيص والهوية البصرية', tr: 'Özelleştirme ve Markalama', zh: '自定义与品牌外观', ru: 'Кастомизация и брендинг' },
  'Customization': { fa: 'سفارشی‌سازی', ar: 'التخصيص', tr: 'Özelleştirme', zh: '自定义', ru: 'Кастомизация' },
  'Storefront Branding & Visual Customization': { fa: 'شخصی‌سازی برند و ظاهر ویترین', ar: 'تخصيص الهوية البصرية والمتجر', tr: 'Vitrin Markalama ve Görsel Özelleştirme', zh: '商城品牌与视觉自定义', ru: 'Брендинг витрины и визуальная настройка' },
  'Personalize brand colors, typography, logos, and integrate native WordPress Gutenberg blocks or shortcodes anywhere on your site.': {
    fa: 'رنگ‌های برند، تایپوگرافی، لوگو و بلوک‌های اختصاصی گوتنبرگ و شورت‌کدها را برای استفاده در سراسر سایت سفارشی‌سازی کنید.',
    ar: 'قم بتخصيص ألوان علامتك التجارية والخطوط والشعارات ودمج مكونات غوتنبرغ المدمجة في أي مكان بموقعك.',
    tr: 'Marka renklerinizi, tipografinizi, logolarınızı kişiselleştirin ve yerel WordPress Gutenberg bloklarını veya kısa kodları sitenizin herhangi bir yerine entegre edin.',
    zh: '个性化定制品牌色彩、字体排版、Logo，并可在网站任意位置嵌入原生 WordPress Gutenberg 区块或短代码。',
    ru: 'Настройте фирменные цвета, типографику, логотипы и интегрируйте нативные блоки Gutenberg или шорткоды в любом месте вашего сайта.'
  },
  'Save Customization': { fa: 'ذخیره تنظیمات ظاهر', ar: 'حفظ التخصيص', tr: 'Özelleştirmeyi Kaydet', zh: '保存自定义配置', ru: 'Сохранить настройки' },
  'Brand Color Palette': { fa: 'پالت رنگ‌های برند', ar: 'لوحة ألوان العلامة التجارية', tr: 'Marka Renk Paleti', zh: '品牌色彩调色板', ru: 'Фирменная цветовая палитра' },
  'Color Presets': { fa: 'پالت‌های رنگی آماده', ar: 'الأنماط اللونية الجاهزة', tr: 'Hazır Renk Şablonları', zh: '预设配色方案', ru: 'Готовые цветовые схемы' },
  'Primary Brand Color': { fa: 'رنگ اصلی برند', ar: 'اللون الأساسي للعلامة', tr: 'Birincil Marka Rengi', zh: '品牌主色调', ru: 'Основной цвет бренда' },
  'Secondary / Dark Accent': { fa: 'رنگ ثانویه / مکمل', ar: 'اللون الثانوي / الداكن', tr: 'İkincil / Koyu Vurgu Rengi', zh: '辅助色 / 深色强调', ru: 'Вторичный / темный акцент' },
  'Live Theme Preview': { fa: 'پیش‌نمایش زنده قالب', ar: 'معاينة القالب المباشرة', tr: 'Canlı Tema Önizlemesi', zh: '实时主题预览', ru: 'Живой предпросмотр темы' },
  'Brand Identity & Logo Assets': { fa: 'هویت بصری، نام و لوگو', ar: 'الهوية البصرية وأصول الشعار', tr: 'Marka Kimliği ve Logo Varlıkları', zh: '品牌标识与 Logo 资产', ru: 'Фирменный стиль и логотипы' },
  'Store Brand Name': { fa: 'عنوان برند فروشگاه', ar: 'اسم متجر السحابة', tr: 'Mağaza Marka Adı', zh: '商城品牌名称', ru: 'Название магазина' },
  'Brand Tagline / Subtitle': { fa: 'شعار یا زیرعنوان فروشگاه', ar: 'شعار العلامة التجارية الفرعي', tr: 'Marka Sloganı / Alt Başlık', zh: '品牌标语 / 副标题', ru: 'Слоган / подзаголовок' },
  'Custom Store Logo URL': { fa: 'آدرس اینترنتی لوگوی اختصاصی', ar: 'رابط الشعار المخصص (URL)', tr: 'Özel Logo Bağlantısı (URL)', zh: '自定义 Logo 链接', ru: 'URL пользовательского логотипа' },
  'Custom Favicon URL': { fa: 'آدرس اینترنتی فاوآیکون (Favicon)', ar: 'رابط أيقونة الموقع Favicon', tr: 'Özel Favicon Bağlantısı', zh: '自定义 Favicon 链接', ru: 'URL пользовательского Favicon' },
  'Custom Footer Notice / Copyright Text': { fa: 'متن حق‌نشر یا اعلان پاورقی', ar: 'إشعار التذييل / نص حقوق النشر', tr: 'Özel Altbilgi / Telif Hakkı Metni', zh: '自定义页脚声明 / 版权文本', ru: 'Текст в подвале / авторские права' },
  'Typography & Font Family Stack': { fa: 'تایپوگرافی و فونت پیش‌فرض', ar: 'الخطوط ومجموعة الطباعة', tr: 'Tipografi ve Yazı Tipi Ailesi', zh: '排版与字体系列', ru: 'Типографика и шрифты' },
  'WordPress Gutenberg Block & Shortcodes Integration': { fa: 'یکپارچه‌سازی با بلوک گوتنبرگ و شورت‌کدها', ar: 'التكامل مع بلوكات غوتنبرغ والأكواد القصيرة', tr: 'WordPress Gutenberg Bloğu ve Kısa Kod Entegrasyonu', zh: 'WordPress Gutenberg 区块与短代码集成', ru: 'Интеграция с блоками Gutenberg и шорткодами' },
  'Gutenberg Ready': { fa: 'آماده گوتنبرگ', ar: 'جاهز لـ Gutenberg', tr: 'Gutenberg Uyumlu', zh: '完美适配 Gutenberg', ru: 'Поддержка Gutenberg' },
  'Native Gutenberg Block: "ArvanCloud Server Configurator"': { fa: 'بلوک بومی گوتنبرگ: «کانفیگوراتور سرور ابری آروان»', ar: 'بلوك غوتنبرغ المدمج: "أداة تكوين خوادم آروان"', tr: 'Yerel Gutenberg Bloğu: "ArvanCloud Sunucu Yapılandırıcı"', zh: '原生 Gutenberg 区块："ArvanCloud 云服务器配置器"', ru: 'Нативный блок Gutenberg: «Конфигуратор серверов ArvanCloud»' },
  'Cloud Server Configurator Shortcode (Elementor / Divi / Classic)': { fa: 'شورت‌کد سفارش سرور ابری (المنتور، دیوی، کلاسیک)', ar: 'كود قصير لتكوين الخوادم (Elementor / Divi / Classic)', tr: 'Bulut Sunucu Kısa Kodu (Elementor / Divi / Classic)', zh: '云服务器配置器短代码（支持 Elementor / Divi / 经典编辑器）', ru: 'Шорткод конфигуратора серверов (Elementor / Divi / Classic)' },
  'Customer Dashboard Shortcode': { fa: 'شورت‌کد داشبورد مشتریان', ar: 'كود قصير لبوابة العملاء', tr: 'Müşteri Paneli Kısa Kodu', zh: '客户仪表盘短代码', ru: 'Шорткод панели клиента' },
  'Copy Shortcode': { fa: 'کپی شورت‌کد', ar: 'نسخ الكود القصير', tr: 'Kısa Kodu Kopyala', zh: '复制短代码', ru: 'Копировать шорткод' },
  'Copied': { fa: 'کپی شد', ar: 'تم النسخ', tr: 'Kopyalandı', zh: '已复制', ru: 'Скопировано' },
  'Custom CSS Style Overrides': { fa: 'کدهای CSS اختصاصی', ar: 'تجاوزات أنماط CSS المخصصة', tr: 'Özel CSS Stil Geçersiz Kılmaları', zh: '自定义 CSS 样式覆盖', ru: 'Пользовательские CSS стили' },
  'Custom CSS will be injected into both the isolated standalone canvas and all embedded Gutenberg blocks/shortcodes.': {
    fa: 'کدهای CSS به صورت خودکار به صفحه تمام‌صفحه و تمامی بلوک‌های گوتنبرگ و شورت‌کدها تزریق خواهند شد.',
    ar: 'سيتم حقن كود CSS المخصص تلقائياً في صفحة المتجر المستقلة وجميع بلوكات غوتنبرغ المدمجة.',
    tr: 'Özel CSS, hem bağımsız vitrin tuvaline hem de tüm gömülü Gutenberg bloklarına ve kısa kodlara otomatik olarak eklenecektir.',
    zh: '自定义 CSS 将自动注入到独立全屏页面以及所有嵌入的 Gutenberg 区块和短代码中。',
    ru: 'Пользовательский CSS будет автоматически внедрен как в полноэкранную витрину, так и во все блоки Gutenberg и шорткоды.'
  },
  'ArvanCloud Services': { fa: 'خدمات ابر آروان', ar: 'خدمات آروان السحابية', tr: 'ArvanCloud Hizmetleri', zh: 'ArvanCloud 云服务', ru: 'Сервисы ArvanCloud' },
  'ArvanCloud Server Configurator': { fa: 'کانفیگوراتور سرور ابری آروان', ar: 'أداة تكوين خادم آروان السحابي', tr: 'ArvanCloud Bulut Sunucu Yapılandırıcı', zh: 'ArvanCloud 云服务器配置器', ru: 'Конфигуратор облачного сервера ArvanCloud' },
  'Interactive Cloud Server sizing, pricing calculator, and deployment widget.': {
    fa: 'ویجت تعاملی انتخاب منابع سرور ابری، محاسبه‌گر زنده قیمت و ساخت آنی ماشین مجازی.',
    ar: 'أداة تفاعلية لتحديد أحجام الخوادم السحابية وحساب الأسعار فورياً والإنشاء السريع.',
    tr: 'Etkileşimli bulut sunucu boyutlandırma, canlı fiyat hesaplayıcı ve dağıtım bileşeni.',
    zh: '交互式云服务器配置选择、实时价格计算器和即时部署小组件。',
    ru: 'Интерактивный конфигуратор облачных серверов, калькулятор цен и виджет развертывания.'
  },
  'ArvanCloud Customer Dashboard': { fa: 'داشبورد مشتریان ابر آروان', ar: 'لوحة تحكم عملاء آروان', tr: 'ArvanCloud Müşteri Kontrol Paneli', zh: 'ArvanCloud 客户仪表盘', ru: 'Панель управления клиента ArvanCloud' },
  'Customer cloud server management and wallet billing dashboard.': {
    fa: 'داشبورد مدیریت سرورهای ابری، عملیات برق و مدیریت کیف پول و تراکنش‌های مشتریان.',
    ar: 'لوحة إدارة الخوادم السحابية للعملاء وإدارة الفواتير والمحفظة.',
    tr: 'Müşteri bulut sunucusu yönetimi ve cüzdan faturalandırma kontrol paneli.',
    zh: '客户云服务器运维管理与钱包账单仪表盘。',
    ru: 'Панель управления облачными серверами клиента и биллинг кошелька.'
  },
  'Server Configurator Settings': { fa: 'تنظیمات کانفیگوراتور سرور', ar: 'إعدادات تكوين الخادم', tr: 'Sunucu Yapılandırıcı Ayarları', zh: '服务器配置器设置', ru: 'Настройки конфигуратора серверов' },
  'Default Datacenter Region': { fa: 'منطقه دیتاسنتر پیش‌فرض', ar: 'منطقة مركز البيانات الافتراضية', tr: 'Varsayılan Veri Merkezi Bölgesi', zh: '默认数据中心区域', ru: 'Регион дата-центра по умолчанию' },
  'Brand Accent Color': { fa: 'رنگ شاخص برند', ar: 'لون تمييز العلامة التجارية', tr: 'Marka Vurgu Rengi', zh: '品牌强调色', ru: 'Акцентный цвет бренда' },
  'Show Hourly & Monthly Rates': { fa: 'نمایش نرخ ساعتی و ماهانه', ar: 'عرض الأسعار بالساعة والشهري', tr: 'Saatlik ve Aylık Fiyatları Göster', zh: '显示小时与月度费率', ru: 'Показывать почасовые и месячные тарифы' },
  'Live ArvanCloud Server Configurator will render here on the frontend.': {
    fa: 'کانفیگوراتور زنده سرور ابری آروان در این بخش در سایت نمایش داده خواهد شد.',
    ar: 'سيتم عرض أداة تكوين الخوادم المباشرة هنا في واجهة الموقع.',
    tr: 'Canlı ArvanCloud Sunucu Yapılandırıcı ön yüzde burada görüntülenecektir.',
    zh: '实时 ArvanCloud 云服务器配置器将在前端此处渲染呈现。',
    ru: 'Живой конфигуратор серверов ArvanCloud будет отображаться здесь на сайте.'
  },
  'Instant VM Provisioning • NVMe Storage • Pay-As-You-Go': {
    fa: 'تحویل آنی ماشین مجازی • ذخیره‌سازی NVMe • پرداخت به میزان مصرف',
    ar: 'إنشاء فوري للأجهزة الافتراضية • تخزين NVMe • الدفع حسب الاستخدام',
    tr: 'Anında Sanal Makine Dağıtımı • NVMe Depolama • Kullandıkça Öde',
    zh: '秒级虚拟机交付 • 高性能 NVMe 存储 • 按量计费',
    ru: 'Мгновенное развертывание ВМ • Хранилище NVMe • Оплата по факту'
  },
  'Loading Cloud Services...': { fa: 'در حال بارگذاری خدمات ابری...', ar: 'جاري تحميل الخدمات السحابية...', tr: 'Bulut Hizmetleri Yükleniyor...', zh: '正在加载云服务...', ru: 'Загрузка облачных сервисов...' },
  'Visual Customization & Theming Studio': {
    fa: 'استودیوی شخصی‌سازی و تم‌بندی بصری',
    ar: 'استوديو التخصيص البصري وتصميم القوالب',
    tr: 'Görsel Özelleştirme ve Tema Stüdyosu',
    zh: '可视化外观定制与主题工作室',
    ru: 'Студия визуальной кастомизации и тем'
  },
  'Fully customize brand colors, typography, font sizes, layouts, and texts with 1-click presets and granular manual editing.': {
    fa: 'شخصی‌سازی کامل رنگ‌های برند، تایپوگرافی، اندازه فونت‌ها، چیدمان و متون با پریست‌های ۱-کلیکه و ویرایشگر دستی پیشرفته.',
    ar: 'تخصيص كامل لألوان العلامة التجارية والخطوط وأحجامها والتخطيطات والنصوص مع قوالب جاهزة بنقرة واحدة وتعديل يدوي دقيق.',
    tr: '1 tıklamalı hazır ayarlar ve ayrıntılı manuel düzenleme ile marka renklerini, tipografiyi, yazı tipi boyutlarını, düzenleri ve metinleri tamamen özelleştirin.',
    zh: '通过一键预设和精细的手动编辑，全面自定义品牌色彩、排版、字号、布局及文本内容。',
    ru: 'Полная настройка цветов бренда, типографики, размеров шрифтов, макетов и текстов с помощью пресетов в 1 клик и ручного редактирования.'
  },
  'Reset Defaults': {
    fa: 'بازنشانی به پیش‌فرض',
    ar: 'استعادة الافتراضيات',
    tr: 'Varsayılanlara Sıfırla',
    zh: '恢复默认设置',
    ru: 'Сбросить по умолчанию'
  },
  'Save All Customizations': {
    fa: 'ذخیره تمام تنظیمات شخصی‌سازی',
    ar: 'حفظ جميع التخصيصات',
    tr: 'Tüm Özelleştirmeleri Kaydet',
    zh: '保存所有自定义设置',
    ru: 'Сохранить все настройки'
  },
  '1-Click Master Themes': {
    fa: 'تم‌های جامع ۱-کلیکه',
    ar: 'قوالب شاملة بنقرة واحدة',
    tr: '1-Tıklamalı Ana Temalar',
    zh: '一键大师主题',
    ru: 'Мастер-темы в 1 клик'
  },
  'Colors & Palettes': {
    fa: 'رنگ‌ها و پالت‌ها',
    ar: 'الألوان واللوحات',
    tr: 'Renkler ve Paletler',
    zh: '色彩与调色板',
    ru: 'Цвета и палитры'
  },
  'Typography & Font Sizes': {
    fa: 'تایپوگرافی و اندازه فونت‌ها',
    ar: 'الخطوط وأحجام النصوص',
    tr: 'Tipografi ve Yazı Boyutları',
    zh: '排版与字号大小',
    ru: 'Типографика и размеры шрифтов'
  },
  'Layout, Radius & Shapes': {
    fa: 'چیدمان، گوشه‌ها و فرم‌ها',
    ar: 'التخطيط والزوايا والأشكال',
    tr: 'Düzen, Köşeler ve Şekiller',
    zh: '布局、圆角与形态',
    ru: 'Макет, скругления и формы'
  },
  'Texts & Copywriting': {
    fa: 'متون و عنوان‌های سیستم',
    ar: 'النصوص وصياغة المحتوى',
    tr: 'Metinler ve Metin Yazarlığı',
    zh: '文案与界面文本',
    ru: 'Тексты и формулировки'
  },
  'Custom CSS Overrides': {
    fa: 'کدهای CSS سفارشی',
    ar: 'تجاوزات CSS المخصصة',
    tr: 'Özel CSS Geçersiz Kılmaları',
    zh: '自定义 CSS 覆盖',
    ru: 'Пользовательские CSS стили'
  },
  'Gutenberg & Shortcodes': {
    fa: 'بلوک گوتنبرگ و کدکوتاه',
    ar: 'غوتنبرغ والأكواد القصيرة',
    tr: 'Gutenberg ve Kısa Kodlar',
    zh: 'Gutenberg 区块与短代码',
    ru: 'Gutenberg и шорткоды'
  },
  'High-impact large typography with 18px base font.': {
    fa: 'تایپوگرافی بزرگ و برجسته با فونت پایه ۱۸ پیکسلی.',
    ar: 'خطوط كبيرة ذات تأثير بصري عالي بحجم أساسي 18 بكسل.',
    tr: '18px temel yazı tipiyle yüksek etkili büyük tipografi.',
    zh: '视觉冲击力强烈的 18px 大号字体排版。',
    ru: 'Крупная выразительная типографика с базовым шрифтом 18px.'
  },
  'According to ArvanCloud legal termination terms, active virtual instances have been powered off and controls locked to Read-Only mode. Please top up your wallet to restore access immediately.': {
    fa: 'طبق قوانین و شرایط پایان سرویس ابر آروان، به دلیل اتمام موجودی، سرورهای ابری فعال خاموش شده و دسترسی مدیریتی آنها در حالت فقط‌خواندنی (Read-Only) قرار گرفته است. لطفاً برای بازیابی دسترسی و روشن‌کردن سرورها، کیف پول خود را شارژ نمایید.',
    ar: 'وفقاً لشروط الإنهاء القانونية لـ ArvanCloud، تم إيقاف تشغيل الخوادم الافتراضية النشطة وقفل أدوات التحكم في وضع القراءة فقط. يرجى شحن محفظتك لاستعادة الوصول فوراً.',
    tr: 'ArvanCloud yasal fesih koşulları uyarınca, aktif sanal sunucular kapatılmış ve kontroller Salt Okunur moduna kilitlenmiştir. Erişimi hemen geri yüklemek için lütfen cüzdanınıza bakiye yükleyin.',
    zh: '根据 ArvanCloud 法律终止条款，由于余额不足，活跃的虚拟机实例已被关机，操作权限已锁定为只读模式。请立即充值钱包以恢复使用。',
    ru: 'В соответствии с условиями обслуживания ArvanCloud, активные виртуальные серверы были выключены, а управление заблокировано в режиме «только чтение». Пожалуйста, пополните кошелек для немедленного восстановления доступа.'
  },
  'Services Suspended Due to Zero Wallet Balance': {
    fa: 'سرویس‌ها به دلیل اتمام موجودی کیف پول معلق شدند',
    ar: 'تم تعليق الخدمات بسبب نفاد رصيد المحفظة',
    tr: 'Sıfır Cüzdan Bakiyesi Nedeniyle Hizmetler Askıya Alındı',
    zh: '因钱包余额不足服务已被暂停',
    ru: 'Услуги приостановлены из-за нулевого баланса кошелька'
  },
  'Low Balance Warning': {
    fa: 'هشدار کمبود موجودی کیف پول',
    ar: 'تحذير انخفاض الرصيد',
    tr: 'Düşük Bakiye Uyarısı',
    zh: '低余额预警',
    ru: 'Предупреждение о низком балансе'
  },
  'Your available wallet balance will only support active services for approximately %s hours. Please top up your wallet to prevent automated service interruption.': {
    fa: 'موجودی کیف پول شما تنها برای حدود %s ساعت دیگر پاسخگوی سرویس‌های فعال خواهد بود. لطفاً برای جلوگیری از قطع خودکار سرویس‌ها، کیف پول خود را شارژ کنید.',
    ar: 'رصيد محفظتك المتاح سيدعم الخدمات النشطة لمدة %s ساعات تقريباً. يرجى شحن محفظتك لمنع انقطاع الخدمة تلقائياً.',
    tr: 'Mevcut cüzdan bakiyeniz, aktif servisleri yalnızca yaklaşık %s saat destekleyecektir. Otomatik hizmet kesintisini önlemek için lütfen cüzdanınıza bakiye yükleyin.',
    zh: '您当前的可用钱包余额预计仅能维持活跃服务运行约 %s 小时。请及时充值以避免服务被自动中断。',
    ru: 'Вашего доступного баланса хватит для работы активных сервисов примерно на %s ч. Пожалуйста, пополните кошелек во избежание автоматической приостановки услуг.'
  },
  '1-Click Master Theme Packs': {
    fa: 'پک‌های تم جامع ۱-کلیکه',
    ar: 'حزم القوالب الشاملة بنقرة واحدة',
    tr: '1-Tıklamalı Ana Tema Paketleri',
    zh: '一键大师主题套件',
    ru: 'Пакеты мастер-тем в 1 клик'
  },
  'Ready Presets': {
    fa: 'پریست آماده',
    ar: 'قوالب جاهزة',
    tr: 'Hazır Şablon',
    zh: '个预设模板',
    ru: 'готовых пресетов'
  },
  'Master themes instantly configure harmonious brand colors, Persian/Latin fonts, scale sizes, border radius, and copywriting terminology in one click.': {
    fa: 'تم‌های جامع فوراً رنگ‌های متناسب، فونت‌های فارسی و لاتین، مقیاس اندازه، انحنای گوشه‌ها و لحن نگارش را با یک کلیک ست می‌کنند.',
    ar: 'تضبط القوالب الشاملة فوراً الألوان المتناسقة والخطوط الفارسية/اللاتينية وأحجام المقاييس وانحناءات الحواف والمصطلحات بنقرة واحدة.',
    tr: 'Ana temalar, tek bir tıklamayla uyumlu marka renklerini, Farsça/Latince yazı tiplerini, ölçek boyutlarını, kenarlık yarıçapını ve metin terminolojisini anında yapılandırır.',
    zh: '大师主题可在一次点击中即刻配置协调的品牌色彩、波斯语/拉丁语字体、比例尺寸、边框圆角以及文案术语。',
    ru: 'Мастер-темы в один клик гармонично настраивают фирменные цвета, персидские/латинские шрифты, масштабирование, радиус скругления и терминологию.'
  },
  'Active': {
    fa: 'فعال',
    ar: 'نشط',
    tr: 'Aktif',
    zh: '已启用',
    ru: 'Активно'
  },
  'Save All Customizations': {
    fa: 'ذخیره تمام تنظیمات سفارشی‌سازی',
    ar: 'حفظ جميع التخصيصات',
    tr: 'Tüm Özelleştirmeleri Kaydet',
    zh: '保存所有自定义设置',
    ru: 'Сохранить все настройки'
  },
  'applying': {
    fa: 'در حال ذخیره و اعمال...',
    ar: 'جارٍ الحفظ والتطبيق...',
    tr: 'Kaydediliyor ve Uygulanıyor...',
    zh: '正在保存并应用...',
    ru: 'Сохранение и применение...'
  },
  'Reset Defaults': {
    fa: 'بازنشانی به پیش‌فرض',
    ar: 'إعادة ضبط للافتراضي',
    tr: 'Varsayılanlara Sıfırla',
    zh: '重置为默认值',
    ru: 'Сбросить настройки'
  },
  'Visual Customization & Theming Studio': {
    fa: 'استودیو طراحی بصری و شخصی‌سازی ظاهر',
    ar: 'استوديو التخصيص والتصميم البصري',
    tr: 'Görsel Özelleştirme ve Tema Stüdyosu',
    zh: '可视化定制与主题工作室',
    ru: 'Студия визуальной настройки и тем'
  },
  'Fully customize brand colors, typography, font sizes, layouts, and texts with 1-click presets and granular manual editing.': {
    fa: 'شخصی‌سازی کامل رنگ‌های برند، تایپوگرافی، اندازه فونت، چیدمان و متون با پریست‌های ۱-کلیکه و ویرایش دستی دقیق.',
    ar: 'تخصيص كامل لألوان العلامة والطباعة وأحجام الخطوط والتخطيطات والنصوص مع إعدادات بنقرة واحدة وتعديل يدوي دقيق.',
    tr: '1-tıklamalı hazır şablonlar ve ayrıntılı manuel düzenleme ile marka renklerini, tipografiyi, yazı tipi boyutlarını, düzenleri ve metinleri tamamen özelleştirin.',
    zh: '通过一键预设和精细的手动编辑，全面自定义品牌颜色、排版、字号、布局和文本。',
    ru: 'Полная настройка цветов бренда, типографики, размеров шрифтов, макетов и текстов с помощью пресетов в один клик и ручного редактирования.'
  },
  'All customizations apply universally across Admin and Customer Storefront views.': {
    fa: 'تمامی تنظیمات سفارشی‌سازی به صورت سراسری بر روی پنل مدیریت و فروشگاه مشتریان اعمال می‌شوند.',
    ar: 'تُطبق جميع التخصيصات عالمياً عبر واجهات الإدارة والمتجر للعملاء.',
    tr: 'Tüm özelleştirmeler hem Yönetici hem de Müşteri Vitrin görünümlerinde evrensel olarak uygulanır.',
    zh: '所有自定义设置将通用应用于管理后台与客户前台界面。',
    ru: 'Все настройки применяются глобально в панели администратора и на витрине клиента.'
  },
  'Live real-time preview updating instantly across all sliders & controls.': {
    fa: 'پیش‌نمایش زنده و لحظه‌ای با تغییر اسلایدرها و گزینه‌های ظاهری به‌روزرسانی می‌شود.',
    ar: 'يتم تحديث المعاينة المباشرة فوراً عبر جميع أشرطة التمرير وعناصر التحكم.',
    tr: 'Canlı önizleme tüm kaydırıcılar ve kontroller boyunca anında güncellenir.',
    zh: '实时预览会在调整滑块和控件时即刻更新。',
    ru: 'Интерактивный предварительный просмотр обновляется мгновенно при изменении любых параметров.'
  },
  '1-Click Master Themes': {
    fa: 'تم‌های جامع ۱-کلیکه',
    ar: 'القوالب الشاملة بنقرة واحدة',
    tr: '1-Tıklamalı Ana Temalar',
    zh: '一键大师主题',
    ru: 'Мастер-темы в 1 клик'
  },
  'Colors & Palettes': {
    fa: 'رنگ‌ها و پالت‌ها',
    ar: 'الألوان واللوحات',
    tr: 'Renkler ve Paletler',
    zh: '色彩与调色板',
    ru: 'Цвета и палитры'
  },
  'Typography & Persian Digits': {
    fa: 'تایپوگرافی و ارقام فارسی',
    ar: 'الطباعة والأرقام الفارسية',
    tr: 'Tipografi ve Farsça Rakamlar',
    zh: '排版与波斯数字',
    ru: 'Типографика и персидские цифры'
  },
  'Layout & Radii Architecture': {
    fa: 'معماری چیدمان، انحنا و فواصل',
    ar: 'هندسة التخطيط وانحناء الحواف',
    tr: 'Düzen ve Kenarlık Mimarisi',
    zh: '布局与圆角架构',
    ru: 'Архитектура макета и скруглений'
  },
  'Microcopy & String Overrides': {
    fa: 'جدول بازنویسی ریز متون و ترجمه‌ها',
    ar: 'جدول تجاوز النصوص الدقيقة والترجمات',
    tr: 'Mikro Metinler ve Çeviri Geçersiz Kılmaları',
    zh: '微文案与翻译重写表',
    ru: 'Таблица переопределения микротекстов'
  },
  'Custom CSS Studio': {
    fa: 'استودیو CSS اختصاصی',
    ar: 'استوديو CSS المخصص',
    tr: 'Özel CSS Stüdyosu',
    zh: '自定义 CSS 工作室',
    ru: 'Студия пользовательского CSS'
  },
  'Gutenberg Block, Elementor Widget & Shortcodes': {
    fa: 'بلوک‌های گوتنبرگ، ویجت‌های المنتور و شورت‌کدها',
    ar: 'مكونات غوتنبرغ وودجات إلمنتور والأكواد القصيرة',
    tr: 'Gutenberg Blokları, Elementor Widgetları ve Kısa Kodlar',
    zh: 'Gutenberg 区块、Elementor 小部件与短代码',
    ru: 'Блоки Gutenberg, виджеты Elementor и шорткоды'
  },
  'Native Gutenberg Blocks': {
    fa: 'بلوک‌های بومی گوتنبرگ',
    ar: 'مكونات غوتنبرغ الأصلية',
    tr: 'Yerel Gutenberg Blokları',
    zh: '原生 Gutenberg 区块',
    ru: 'Нативные блоки Gutenberg'
  },
  'Elementor Page Builder Widgets': {
    fa: 'ویجت‌های صفحه‌ساز المنتور',
    ar: 'عناصر منشئ صفحات إلمنتور',
    tr: 'Elementor Sayfa Oluşturucu Widgetları',
    zh: 'Elementor 页面构建器小部件',
    ru: 'Виджеты конструктора Elementor'
  },
  'Insert "arvan/server-configurator" or "arvan/customer-dashboard" anywhere in the WordPress Block Editor with full sidebar controls for colors, radius, fonts, Persian digits, and layouts.': {
    fa: 'بلوک‌های «arvan/server-configurator» یا «arvan/customer-dashboard» را در ویرایشگر گوتنبرگ با کنترل‌های کامل سایدبار برای رنگ‌ها، انحنا، فونت، ارقام فارسی و چیدمان درج کنید.',
    ar: 'أدرج "arvan/server-configurator" أو "arvan/customer-dashboard" في أي مكان بمحرر غوتنبرغ مع عناصر تحكم كاملة بالألوان والخطوط والأرقام الفارسية والتخطيطات.',
    tr: 'Renkler, yarıçap, yazı tipleri, Farsça rakamlar ve düzenler için tam kenar çubuğu kontrolleriyle Gutenberg Düzenleyicisine ekleyin.',
    zh: '在 WordPress 区块编辑器中任意插入服务器配置器或客户仪表盘，并在侧边栏全面自定义颜色、圆角、字体、波斯数字与布局。',
    ru: 'Вставляйте блоки в редакторе Gutenberg с полным набором настроек цветов, скруглений, шрифтов и макета в боковой панели.'
  },
  'Drag & drop "ArvanCloud Server Configurator" and "ArvanCloud Customer Dashboard" from the Elementor widget panel under "ArvanCloud Services" category with live preview.': {
    fa: 'ویجت‌های «کانفیگوراتور سرور ابر آروان» و «داشبورد مشتریان آروان» را از پنل ویجت‌های المنتور در دسته‌بندی «خدمات ابر آروان» با پیش‌نمایش زنده بکشید و رها کنید.',
    ar: 'اسحب وأفلت أدوات خادم ولوحة تحكم ArvanCloud من لوحة إلمنتور تحت فئة "خدمات ArvanCloud" مع معاينة مباشرة.',
    tr: 'Canlı önizleme ile Elementor widget panelindeki "ArvanCloud Services" kategorisinden sürükleyip bırakın.',
    zh: '从 Elementor 小部件面板的“ArvanCloud Services”分类中拖放服务器配置器和客户仪表盘，支持实时预览。',
    ru: 'Перетаскивайте виджеты конфигуратора и панели клиента из категории ArvanCloud в Elementor с живым предпросмотром.'
  },
  'Dashboard Settings & Layout': {
    fa: 'تنظیمات داشبورد و معماری چیدمان',
    ar: 'إعدادات لوحة التحكم والتخطيط',
    tr: 'Panel Ayarları ve Düzen',
    zh: '仪表盘设置与布局',
    ru: 'Настройки панели и макет'
  },
  'Layout, Radius & Elevation': {
    fa: 'چیدمان، انحنای گوشه و سایه‌ها',
    ar: 'التخطيط وانحناء الحواف والظلال',
    tr: 'Düzen, Yarıçap ve Gölgeler',
    zh: '布局、圆角与阴影层级',
    ru: 'Макет, радиус и тени'
  },
  'Brand Colors & Surfaces': {
    fa: 'رنگ‌های برند و پس‌زمینه سطوح',
    ar: 'ألوان العلامة والأسطح',
    tr: 'Marka Renkleri ve Yüzeyler',
    zh: '品牌色彩与界面层',
    ru: 'Цвета бренда и поверхности'
  },
  'Text & Copywriting Overrides': {
    fa: 'بازنویسی متون و عناوین',
    ar: 'تجاوز النصوص والعناوين',
    tr: 'Metin ve Başlık Geçersiz Kılmaları',
    zh: '文本与文案重写',
    ru: 'Переопределение текстов'
  },
  'Brand Color Palette & Surfaces': {
    fa: 'پالت رنگ برند و سطوح',
    ar: 'لوحة ألوان العلامة والأسطح',
    tr: 'Marka Renk Paleti ve Yüzeyler',
    zh: '品牌调色板与界面层',
    ru: 'Палитра бренда и поверхности'
  },
  'Curated Color Presets': {
    fa: 'پالت‌های رنگی منتخب',
    ar: 'أنماط ألوان مختارة',
    tr: 'Seçilmiş Renk Şablonları',
    zh: '精选配色预设',
    ru: 'Подобранные цветовые пре赛ты'
  },
  'Manual Color Customization': {
    fa: 'شخصی‌سازی دستی رنگ‌ها',
    ar: 'تخصيص الألوان يدوياً',
    tr: 'Manuel Renk Özelleştirme',
    zh: '手动颜色定制',
    ru: 'Ручная настройка цветов'
  },
  'Card Surface Background': {
    fa: 'پس‌زمینه سطوح و کارت‌ها',
    ar: 'خلفية أسطح البطاقات',
    tr: 'Kart Yüzey Arka Planı',
    zh: '卡片与面板背景色',
    ru: 'Фон карточек и поверхностей'
  },
  'App Canvas Background': {
    fa: 'پس‌زمینه کل بوم برنامه',
    ar: 'خلفية مساحة التطبيق',
    tr: 'Uygulama Tuval Arka Planı',
    zh: '应用主画布背景色',
    ru: 'Фон основного холста'
  },
  'Primary Text Color': {
    fa: 'رنگ متن اصلی',
    ar: 'لون النص الأساسي',
    tr: 'Birincil Metin Rengi',
    zh: '主文本颜色',
    ru: 'Основной цвет текста'
  },
  'Border & Line Divider Color': {
    fa: 'رنگ خطوط حاشیه و جداکننده‌ها',
    ar: 'لون الحدود والفواصل',
    tr: 'Kenarlık ve Ayırıcı Çizgi Rengi',
    zh: '边框与分割线颜色',
    ru: 'Цвет границ и разделителей'
  },
  'Typography, Web Fonts & Size Hierarchy': {
    fa: 'تایپوگرافی، وب‌فونت‌ها و مقیاس اندازه',
    ar: 'الخطوط وخطوط الويب والتسلسل الهرمي للحجم',
    tr: 'Tipografi, Web Yazı Tipleri ve Boyut Hiyerarşisi',
    zh: '排版、网络字体与字号层级',
    ru: 'Типографика, веб-шрифты и иерархия размеров'
  },
  'Select Font Family Stack': {
    fa: 'انتخاب فونت اصلی',
    ar: 'اختر مجموعة الخطوط',
    tr: 'Yazı Tipi Ailesini Seçin',
    zh: '选择字体系列',
    ru: 'Выберите семейство шрифтов'
  },
  'Custom External Web Font Configuration': {
    fa: 'پیکربندی وب‌فونت سفارشی خارجی',
    ar: 'تكوين خط ويب خارجي مخصص',
    tr: 'Özel Harici Web Yazı Tipi Yapılandırması',
    zh: '自定义外部 Web 字体配置',
    ru: 'Настройка внешнего веб-шрифта'
  },
  'Font Family Name': {
    fa: 'نام خانواده فونت',
    ar: 'اسم عائلة الخط',
    tr: 'Yazı Tipi Ailesi Adı',
    zh: '字体家族名称',
    ru: 'Название семейства шрифтов'
  },
  'Web Font CSS URL (Google Fonts / CDN)': {
    fa: 'آدرس اینترنتی فایل CSS فونت (Google Fonts / CDN)',
    ar: 'رابط CSS لخط الويب (Google Fonts / CDN)',
    tr: 'Web Yazı Tipi CSS URL (Google Fonts / CDN)',
    zh: 'Web 字体 CSS 链接 (Google Fonts / CDN)',
    ru: 'URL CSS файла веб-шрифта (Google Fonts / CDN)'
  },
  'Font Size & Density Presets': {
    fa: 'پریست‌های اندازه فونت و تراکم',
    ar: 'أنماط أحجام الخطوط والكثافة',
    tr: 'Yazı Tipi Boyutu ve Yoğunluk Şablonları',
    zh: '字号大小与密度预设',
    ru: 'Пресеты размеров шрифта и плотности'
  },
  'Manual Typography Scale Sliders': {
    fa: 'اسلایدرهای دستی مقیاس تایپوگرافی',
    ar: 'أشرطة تمرير مقياس الخط اليدوي',
    tr: 'Manuel Tipografi Ölçeği Kaydırıcıları',
    zh: '手动字体缩放滑块',
    ru: 'Ползунки ручного масштабирования шрифтов'
  },
  'Base Body Font Size': {
    fa: 'اندازه فونت پایه متن',
    ar: 'حجم الخط الأساسي للنص',
    tr: 'Temel Gövde Yazı Tipi Boyutu',
    zh: '正文基准字号大小',
    ru: 'Базовый размер шрифта'
  },
  'Heading Scale Multiplier': {
    fa: 'ضریب مقیاس عناوین و تیترها',
    ar: 'معامل مقياس العناوين',
    tr: 'Başlık Ölçeği Çarpanı',
    zh: '标题缩放倍率',
    ru: 'Множитель масштаба заголовков'
  },
  'Layout Architecture, Border Radius & Spacing': {
    fa: 'معماری چیدمان، انحنای گوشه و فواصل',
    ar: 'بنية التخطيط وانحناء الحواف والمسافات',
    tr: 'Düzen Mimarisi, Kenarlık Yarıçapı ve Boşluklar',
    zh: '布局架构、边框圆角与间距',
    ru: 'Архитектура макета, радиус скругления и отступы'
  },
  'Layout & Shape Presets': {
    fa: 'پریست‌های چیدمان و فرم',
    ar: 'أنماط التخطيط والأشكال',
    tr: 'Düzen ve Şekil Şablonları',
    zh: '布局与形态预设',
    ru: 'Пресеты макета и формы'
  },
  'Manual Shape & Elevation Adjustments': {
    fa: 'تنظیمات دستی فرم و سایه',
    ar: 'تعديلات الشكل والارتفاع اليدوية',
    tr: 'Manuel Şekil ve Yükseklik Ayarları',
    zh: '手动形态与投影调节',
    ru: 'Ручная настройка формы и теней'
  },
  'Corner Border Radius': {
    fa: 'میزان انحنای گوشه‌ها (Border Radius)',
    ar: 'نصف قطر انحناء الزوايا',
    tr: 'Köşe Kenarlık Yarıçapı',
    zh: '边框圆角半径',
    ru: 'Радиус скругления углов'
  },
  'Card Elevation': {
    fa: 'سبک سایه و برجستگی کارت‌ها',
    ar: 'ارتفاع وبروز البطاقات',
    tr: 'Kart Yüksekliği / Gölgesi',
    zh: '卡片层级与阴影风格',
    ru: 'Стиль тени и возвышения карточек'
  },
  'Flat / No Shadow': {
    fa: 'تخت / بدون سایه',
    ar: 'مسطح / بدون ظل',
    tr: 'Düz / Gölgesiz',
    zh: '扁平 / 无阴影',
    ru: 'Плоский / без тени'
  },
  'Subtle M3 Elevation': {
    fa: 'سایه ملایم متریال ۳',
    ar: 'ارتفاع خفيف بنمط M3',
    tr: 'Hafif M3 Yüksekliği',
    zh: '轻微 M3 层级阴影',
    ru: 'Мягкая тень Material 3'
  },
  'High 3D Elevation': {
    fa: 'برجستگی سه‌بعدی قوی',
    ar: 'ارتفاع ثلاثي الأبعاد بارز',
    tr: 'Yüksek 3D Yüksekliği',
    zh: '立体高投影效果',
    ru: 'Выраженная 3D тень'
  },
  'Brand Colored Glow': {
    fa: 'درخشش با رنگ برند',
    ar: 'توهج بلون العلامة التجارية',
    tr: 'Marka Renginde Parlama',
    zh: '品牌色发光光晕',
    ru: 'Фирменное цветное свечение'
  },
  'Spacing Density': {
    fa: 'تراکم فواصل و فاصله‌گذاری',
    ar: 'كثافة المسافات والتباعد',
    tr: 'Aralık Yoğunluğu',
    zh: '间距紧凑度与密度',
    ru: 'Плотность отступов'
  },
  'Compact (Tighter)': {
    fa: 'فشرده (فاصله کمتر)',
    ar: 'مضغوط (مسافات أقل)',
    tr: 'Kompakt (Daha Sıkı)',
    zh: '紧凑 (较小间距)',
    ru: 'Компактный (плотный)'
  },
  'Standard / Balanced': {
    fa: 'استاندارد / متعادل',
    ar: 'قياسي / متوازن',
    tr: 'Standart / Dengeli',
    zh: '标准 / 均衡',
    ru: 'Стандартный / сбалансированный'
  },
  'Spacious / Roomy': {
    fa: 'باز و جادار',
    ar: 'فسيح / مساحات واسعة',
    tr: 'Geniş / Ferah',
    zh: '宽松 / 大间距',
    ru: 'Просторный / свободный'
  },
  'Container Max Width': {
    fa: 'حداکثر عرض کانتینر',
    ar: 'أقصى عرض للحاوية',
    tr: 'Kapsayıcı Maksimum Genişliği',
    zh: '容器最大宽度',
    ru: 'Максимальная ширина контейнера'
  },
  'Boxed (1120px)': {
    fa: 'باکسی (۱۱۲۰ پیکسل)',
    ar: 'صندوقي (1120 بكسل)',
    tr: 'Kutulu (1120px)',
    zh: '盒装 (1120px)',
    ru: 'В рамке (1120px)'
  },
  'Standard (1280px)': {
    fa: 'استاندارد (۱۲۸۰ پیکسل)',
    ar: 'قياسي (1280 بكسل)',
    tr: 'Standart (1280px)',
    zh: '标准 (1280px)',
    ru: 'Стандартный (1280px)'
  },
  'Wide (1480px)': {
    fa: 'عریض (۱۴۸۰ پیکسل)',
    ar: 'عريض (1480 بكسل)',
    tr: 'Geniş (1480px)',
    zh: '加宽 (1480px)',
    ru: 'Широкий (1480px)'
  },
  'Full Width (100%)': {
    fa: 'تمام‌صفحه (۱۰۰٪)',
    ar: 'عرض كامل (100%)',
    tr: 'Tam Genişlik (%100)',
    zh: '全宽 (100%)',
    ru: 'На всю ширину (100%)'
  },
  'Copywriting Presets & Core Storefront Texts': {
    fa: 'پریست‌های ادبیات و متون اصلی فروشگاه',
    ar: 'أنماط صياغة النصوص ونصوص المتجر الأساسية',
    tr: 'Metin Yazarlığı Şablonları ve Temel Mağaza Metinleri',
    zh: '文案预设与核心商城文本',
    ru: 'Пресеты формулировок и основные тексты витрины'
  },
  'Copywriting & Terminology Presets': {
    fa: 'پریست‌های ادبیات و اصطلاحات',
    ar: 'أنماط الصياغة والمصطلحات',
    tr: 'Metin Yazarlığı ve Terminoloji Şablonları',
    zh: '文案风格与术语预设',
    ru: 'Пресеты терминологии и стилистики'
  },
  'Main Brand & Action Texts': {
    fa: 'متون اصلی برند و دکمه‌های اقدام',
    ar: 'نصوص العلامة التجارية وإجراءات المستخدم',
    tr: 'Ana Marka ve Eylem Metinleri',
    zh: '主要品牌与操作文本',
    ru: 'Основные тексты бренда и действий'
  },
  'Brand Tagline': {
    fa: 'شعار تبلیغاتی برند',
    ar: 'شعار العلامة التجارية',
    tr: 'Marka Sloganı',
    zh: '品牌标语口号',
    ru: 'Слоган бренда'
  },
  'Configurator Hero Title': {
    fa: 'تیتر اصلی صفحه سفارش سرور',
    ar: 'العنوان الرئيسي لصفحة تهيئة الخادم',
    tr: 'Yapılandırıcı Başlık Metni',
    zh: '配置器主标题',
    ru: 'Главный заголовок конфигуратора'
  },
  'Deploy CTA Button Label': {
    fa: 'متن دکمه ثبت سفارش سرور',
    ar: 'نص زر إنشاء الخادم',
    tr: 'Sunucu Başlat Butonu Metni',
    zh: '部署操作按钮文字',
    ru: 'Текст кнопки создания сервера'
  },
  'Dashboard Title': {
    fa: 'عنوان داشبورد مشتری',
    ar: 'عنوان لوحة التحكم',
    tr: 'Panel Başlığı',
    zh: '控制台主标题',
    ru: 'Заголовок панели управления'
  },
  'Wallet & Credit Label': {
    fa: 'عنوان کیف پول و اعتبار',
    ar: 'عنوان المحفظة والرصيد',
    tr: 'Cüzdan ve Kredi Başlığı',
    zh: '钱包与余额标签',
    ru: 'Заголовок кошелька и баланса'
  },
  'Custom Footer Notice / SLA Guarantee Text': {
    fa: 'متن کپی‌رایت / ضمانت آپ‌تایم و SLA فوتر',
    ar: 'إشعار التذييل / ضمان مستوى الخدمة SLA',
    tr: 'Özel Altbilgi / SLA Garanti Metni',
    zh: '自定义页脚声明 / SLA 保障文本',
    ru: 'Текст подвала / гарантия SLA'
  },
  'High-impact large typography with 18px base font.': {
    fa: 'تایپوگرافی بزرگ و برجسته با فونت پایه ۱۸ پیکسلی.',
    ar: 'خطوط كبيرة ذات تأثير بصري عالي بحجم أساسي 18 بكسل.',
    tr: '18px temel yazı tipiyle yüksek etkili büyük tipografi.',
    zh: '视觉冲击力强烈的 18px 大号字体排版。',
    ru: 'Крупная выразительная типографика с базовым шрифтом 18px.'
  },
  'Live real-time preview updating instantly across all sliders & controls.': {
    fa: 'پیش‌نمایش زنده بلادرنگ همزمان با تغییر اسلایدرها و گزینه‌ها.',
    ar: 'معاينة حية ومباشرة تتحدث فوراً مع تحريك أشرطة التمرير والخيارات.',
    tr: 'Tüm kaydırıcılar ve kontrollerde anında güncellenen canlı gerçek zamanlı önizleme.',
    zh: '所有滑块与控件修改后即刻同步的实时动态预览。',
    ru: 'Живой предпросмотр в реальном времени, мгновенно обновляющийся при любых изменениях.'
  },
  'All customizations apply universally across Admin and Customer Storefront views.': {
    fa: 'تمامی تنظیمات به صورت یکپارچه بر روی پنل ادمین و پرتال مشتریان اعمال می‌شود.',
    ar: 'تطبق جميع التخصيصات بشكل شامل عبر لوحة الإدارة وواجهة متجر العملاء.',
    tr: 'Tüm özelleştirmeler hem Yönetici hem de Müşteri Vitrin görünümlerinde evrensel olarak uygulanır.',
    zh: '所有自定义配置将全局应用至管理员后台与客户商城界面。',
    ru: 'Все настройки универсально применяются как в панели администратора, так и на витрине клиента.'
  },
  'Standard General (g1-2-4)': {
    fa: 'استاندارد عمومی (g1-2-4)',
    ar: 'قياسي عام (g1-2-4)',
    tr: 'Standart Genel (g1-2-4)',
    zh: '标准通用型 (g1-2-4)',
    ru: 'Стандартный общий (g1-2-4)'
  },
  '2 vCPU • 4 GB RAM • 40 GB NVMe': {
    fa: '۲ پردازنده • ۴ گیگابایت رم • ۴۰ گیگابایت NVMe',
    ar: '2 معالج • 4 جيجابايت رام • 40 جيجابايت NVMe',
    tr: '2 vCPU • 4 GB RAM • 40 GB NVMe',
    zh: '2 核 vCPU • 4 GB 内存 • 40 GB NVMe',
    ru: '2 vCPU • 4 ГБ ОЗУ • 40 ГБ NVMe'
  },
  '540 Toman/hr': {
    fa: '۵۴۰ تومان/ساعت',
    ar: '540 تومان/ساعة',
    tr: '540 Tümen/saat',
    zh: '540 图曼/小时',
    ru: '540 туманов/час'
  },
  '92.5 hours runtime remaining': {
    fa: '۹۲.۵ ساعت زمان کارکرد باقی‌مانده اعتبار',
    ar: '92.5 ساعة تشغيل متبقية من الرصيد',
    tr: '92.5 saat kalan çalışma süresi',
    zh: '剩余运行时间：92.5 小时',
    ru: 'Осталось 92.5 часа работы'
  },
  '250,000 Toman': {
    fa: '۲۵۰,۰۰۰ تومان',
    ar: '250,000 تومان',
    tr: '250.000 Tümen',
    zh: '250,000 图曼',
    ru: '250 000 туманов'
  },
  'Total Active VMs': {
    fa: 'کل سرورهای فعال',
    ar: 'إجمالي الخوادم النشطة',
    tr: 'Toplam Aktif Sunucu',
    zh: '活跃虚拟机总数',
    ru: 'Всего активных ВМ'
  },
  '12 Instances': {
    fa: '۱۲ ماشین ابری',
    ar: '12 خادم سحابي',
    tr: '12 Sanal Sunucu',
    zh: '12 台云实例',
    ru: '12 инстансов'
  },
  'MRR Revenue': {
    fa: 'درآمد ماهانه (MRR)',
    ar: 'الإيراد الشهري المتكرر (MRR)',
    tr: 'Aylık Düzenli Gelir (MRR)',
    zh: '月度经常性收入 (MRR)',
    ru: 'Ежемесячный доход (MRR)'
  },
  '3,450,000 T': {
    fa: '۳,۴۵۰,۰۰۰ تومان',
    ar: '3,450,000 تومان',
    tr: '3.450.000 T',
    zh: '3,450,000 图曼',
    ru: '3 450 000 Т'
  },
  'Default': {
    fa: 'پیش‌فرض',
    ar: 'الافتراضي',
    tr: 'Varsayılan',
    zh: '默认',
    ru: 'По умолчанию'
  },
  'Desktop': {
    fa: 'نمای دسکتاپ',
    ar: 'عرض سطح المكتب',
    tr: 'Masaüstü Görünümü',
    zh: '桌面端视图',
    ru: 'Десктопный вид'
  },
  'Mobile': {
    fa: 'نمای موبایل',
    ar: 'عرض الهاتف',
    tr: 'Mobil Görünüm',
    zh: '移动端视图',
    ru: 'Мобильный вид'
  },
  'Search translation keys or texts...': {
    fa: 'جستجو در کلیدها یا متون فارسی...',
    ar: 'البحث في مفاتيح أو نصوص الترجمة...',
    tr: 'Çeviri anahtarlarında veya metinlerde ara...',
    zh: '搜索翻译键名或文本内容...',
    ru: 'Поиск по ключам или текстам...'
  },
  'Override text for this language': {
    fa: 'متن سفارشی جایگزین برای این زبان',
    ar: 'تجاوز النص لهذه اللغة',
    tr: 'Bu dil için metin geçersiz kılma',
    zh: '替换当前语言的文本',
    ru: 'Переопределить текст для этого языка'
  },
  'Current Value': {
    fa: 'مقدار فعلی',
    ar: 'القيمة الحالية',
    tr: 'Mevcut Değer',
    zh: '当前取值',
    ru: 'Текущее значение'
  },
  'Granular UI Translation & String Overrides': {
    fa: 'جدول بازنویسی ریز متون و ترجمه‌های رابط کاربری',
    ar: 'تجاوزات النصوص وترجمات واجهة المستخدم الدقيقة',
    tr: 'Ayrıntılı Kullanıcı Arayüzü Çeviri ve Metin Geçersiz Kılmaları',
    zh: '精细化 UI 翻译与文本字符串替换表',
    ru: 'Таблица точечной замены строк и переводов UI'
  },
  'Search translation keys...': {
    fa: 'جستجو در کلیدهای ترجمه...',
    ar: 'البحث في مفاتيح الترجمة...',
    tr: 'Çeviri anahtarlarında ara...',
    zh: '搜索翻译键名...',
    ru: 'Поиск по ключам перевода...'
  },
  'Customize any specific button, label, or tooltip across the customer canvas and admin portal.': {
    fa: 'شخصی‌سازی هر دکمه، برچسب یا راهنمای خاص در بوم مشتری و پرتال مدیریت.',
    ar: 'تخصيص أي زر أو تسمية أو تلميح محدد في واجهة العميل ولوحة الإدارة.',
    tr: 'Müşteri tuvalindeki ve yönetici portalındaki herhangi bir düğmeyi, etiketi veya ipucunu özelleştirin.',
    zh: '自定义客户商城画布与管理后台中的任意特定按钮、标签或工具提示。',
    ru: 'Настройте любую отдельную кнопку, надпись или подсказку на витрине и в админ-панели.'
  },
  'Native Gutenberg Block: "arvan/server-configurator"': {
    fa: 'بلوک اختصاصی گوتنبرگ: "arvan/server-configurator"',
    ar: 'مكون غوتنبرغ الأصلي: "arvan/server-configurator"',
    tr: 'Yerel Gutenberg Bloğu: "arvan/server-configurator"',
    zh: '原生 Gutenberg 区块："arvan/server-configurator"',
    ru: 'Нативный блок Gutenberg: «arvan/server-configurator»'
  },
  'Open any WordPress Page or Post in the Block Editor, click (+) Add Block, search for "ArvanCloud", and insert the Server Configurator with visual sidebar inspector settings.': {
    fa: 'در ویرایشگر گوتنبرگ وردپرس روی (+) افزودن بلوک کلیک کرده، "ابر آروان" را جستجو نمایید و بلوک را با پنل تنظیمات سایدبار اضافه کنید.',
    ar: 'افتح أي صفحة أو مقال في محرر المكونات، انقر على (+) إضافة مكون، وابحث عن "ArvanCloud" لإدراج أداة تكوين الخوادم مع إعدادات الشريط الجانبي.',
    tr: 'Blok Düzenleyicide herhangi bir WordPress Sayfasını veya Yazısını açın, (+) Blok Ekle\'ye tıklayın, "ArvanCloud" araması yapın ve görsel kenar çubuğu ayarlarıyla Sunucu Yapılandırıcısını ekleyin.',
    zh: '在区块编辑器中打开任意 WordPress 页面或文章，点击 (+) 添加区块，搜索 "ArvanCloud"，即可插入带有可视化侧边栏检查器设置的服务器配置器。',
    ru: 'Откройте любую страницу WordPress в редакторе блоков, нажмите (+) Добавить блок, найдите «ArvanCloud» и вставьте конфигуратор с настройками в боковой панели.'
  },
  'Configurator Shortcode (Elementor / Classic Editor)': {
    fa: 'کدکوتاه سفارش‌دهنده سرور (المنتور / ویرایشگر کلاسیک)',
    ar: 'كود قصير لأداة تكوين الخوادم (Elementor / المحرر التقليدي)',
    tr: 'Yapılandırıcı Kısa Kodu (Elementor / Klasik Düzenleyici)',
    zh: '服务器配置器短代码（Elementor / 经典编辑器）',
    ru: 'Шорткод конфигуратора (Elementor / классический редактор)'
  },
  'Configurator': {
    fa: 'سفارش سرور',
    ar: 'تهيئة الخادم',
    tr: 'Yapılandırıcı',
    zh: '配置器',
    ru: 'Конфигуратор'
  },
  'Dashboard': {
    fa: 'داشبورد',
    ar: 'لوحة التحكم',
    tr: 'Panel',
    zh: '控制台',
    ru: 'Панель'
  },
  'Admin Hub': {
    fa: 'پنل مدیریت',
    ar: 'مركز الإدارة',
    tr: 'Yönetim Merkezi',
    zh: '管理中枢',
    ru: 'Админ-панель'
  },
  'Arvan Sorkhab Teal': { fa: 'آروان سرخ‌آب (فیروزه‌ای)', ar: 'آروان سرخ آب (فيروزي)', tr: 'Arvan Sorkhab Camgöbeği', zh: 'Arvan 经典青绿', ru: 'Arvan Бирюзовый' },
  'Royal Sapphire Blue': { fa: 'یاقوت کبود سلطنتی (آبی)', ar: 'الياقوت الأزرق الملكي', tr: 'Kraliyet Safir Mavisi', zh: '皇家蓝宝石', ru: 'Королевский сапфир' },
  'Emerald Forest DevOps': { fa: 'زمردین دوآپس (سبز)', ar: 'زمرد ديف أوبس (أخضر)', tr: 'Zümrüt Yeşili DevOps', zh: '翡翠绿 DevOps', ru: 'Изумрудный DevOps' },
  'Midnight Dark Obsidian': { fa: 'ابسیدین تیره شب (بنفش)', ar: 'حجر السج الداكن (أرجواني)', tr: 'Gece Obsidyeni (Mor)', zh: '暗夜黑曜石 (紫)', ru: 'Полуночный обсидиан' },
  'Crimson Ember Studio': { fa: 'استودیو شراره زرشکی (قرمز)', ar: 'جمر قرمزي (أحمر)', tr: 'Kızıl Köz Stüdyosu', zh: '深红余烬工作室', ru: 'Багровый уголь' },
  'Nordic Slate Monochrome': { fa: 'طوسی نوردیک مینیمال', ar: 'رمادي أردوازي نورديك', tr: 'Nordik Arduvaz Monokrom', zh: '北欧板岩单色', ru: 'Скандинавский серый' },
  'Warm Sunset Amber': { fa: 'غروب گرم کهربایی (عسلی)', ar: 'كهرمان الغروب الدافئ', tr: 'Sıcak Gün Batımı Kehribarı', zh: '温暖日落琥珀', ru: 'Теплый янтарный закат' },
  'Official ArvanCloud signature teal aesthetic with balanced curves & Persian typography.': {
    fa: 'تم رسمی و اصیل ابر آروان با رنگ فیروزه‌ای، انحناهای چشم‌نواز و فونت استاندارد وزیرمتن.',
    ar: 'جمالية فيروزية رسمية لآروان كلاود مع منحنيات متوازنة وخط فارسي أنيق.',
    tr: 'Dengeli kavisler ve Farsça tipografi ile resmi ArvanCloud imzalı camgöbeği estetiği.',
    zh: '官方 ArvanCloud 标志性青绿色美学，具有平衡的弧线与波斯语排版。',
    ru: 'Официальный бирюзовый стиль ArvanCloud со сбалансированными скруглениями и персидской типографикой.'
  },
  'Deep cobalt sapphire palette with sleek high-tech curves & corporate precision.': {
    fa: 'پالت آبی کبالت لوکس سازمانی با انحناهای مدرن و ساختار دقیق شرکتی.',
    ar: 'لوحة زرقاء داكنة مع منحنيات تقنية متطورة ودقة مؤسسية.',
    tr: 'Şık yüksek teknoloji kavisleri ve kurumsal hassasiyet ile derin kobalt safir paleti.',
    zh: '深钴蓝蓝宝石配色，搭配流畅的高科技弧度与企业级严谨结构。',
    ru: 'Глубокая палитра цвета кобальтового сапфира со строгими корпоративными линиями.'
  },
  'Modern developer-centric green palette with high-density layout & rapid VM terminology.': {
    fa: 'پالت سبز توسعه‌دهندگان با چیدمان با تراکم بالا و اصطلاحات تخصصی ماشین ابری.',
    ar: 'لوحة خضراء مخصصة للمطورين مع تخطيط عالي الكثافة ومصطلحات الحوسبة السريعة.',
    tr: 'Yüksek yoğunluklu düzen ve hızlı sanal makine terminolojisi ile geliştirici odaklı yeşil palet.',
    zh: '以开发者为中心的现代绿色调色板，具有高密度布局和快速虚拟机术语。',
    ru: 'Современная зеленая палитра для разработчиков с компактным макетом и терминами облачных ВМ.'
  },
  'High-contrast cyberpunk purple & dark luxury surfaces for modern cloud dashboards.': {
    fa: 'کنتراست بنفش سایبرپانک با سطوح لوکس تیره مناسب کنسول‌های مدرن ابری.',
    ar: 'تباين عالٍ مع أسطح بنفسجية داكنة فخمة للوحات التحكم السحابية الحديثة.',
    tr: 'Modern bulut panelleri için yüksek kontrastlı siberpunk mor ve koyu lüks yüzeyler.',
    zh: '高对比度赛博朋克紫色与奢华深色界面，专为现代化云控制台打造。',
    ru: 'Высококонтрастный киберпанк-фиолетовый с темными премиальными поверхностями.'
  },
  'Energetic crimson red accent with warm surfaces & dynamic conversion focus.': {
    fa: 'رنگ قرمز زرشکی پویا با سطوح گرم و تمرکز بالا بر افزایش فروش و تبدیل کاربر.',
    ar: 'لون أحمر قرمزي مفعم بالحيوية مع أسطح دافئة وتركيز على تحويل المبيعات.',
    tr: 'Sıcak yüzeyler ve dinamik dönüşüm odağı ile enerjik kızıl kırmızı vurgu.',
    zh: '充满活力的深红强调色，搭配温暖质感的界面与转化率聚焦设计。',
    ru: 'Энергичный багрово-красный акцент с теплыми поверхностями и фокусом на конверсию.'
  },
  'Razor-sharp minimal dark slate palette with flat elevation & high precision.': {
    fa: 'طراحی مینی‌مال تخت با رنگ طوسی نوردیک، گوشه‌های تیز و نهایت دقت مهندسی.',
    ar: 'لوحة رمادية بسيطة بحدة شفرة مع ارتفاع مسطح ودقة عالية.',
    tr: 'Düz yükseklik ve yüksek hassasiyet ile jilet gibi keskin minimal koyu arduvaz paleti.',
    zh: '利落极简的深灰板岩调色板，采用扁平无阴影层级与高精度排版。',
    ru: 'Минималистичная монохромная серая палитра с плоским стилем и максимальной четкостью.'
  },
  'Warm golden honey & amber tones with generous curvature and friendly aesthetics.': {
    fa: 'تناژ گرم عسلی و کهربایی با انحناهای نرم و جذابیت بصری دوستانه و صمیمی.',
    ar: 'تدرجات عسلية وكهرمانية دافئة مع انحناءات سخية ولمسات ودية.',
    tr: 'Cömert kavisler ve samimi estetik ile sıcak altın bal ve kehribar tonları.',
    zh: '温暖的金色蜂蜜与琥珀色调，搭配大圆角与亲切友好的视觉体验。',
    ru: 'Теплые янтарно-медовые тона с мягкими скруглениями и дружелюбной эстетикой.'
  },
  'Standard Cloud (balanced)': { fa: 'ابر استاندارد (متعادل)', ar: 'سحابة قياسية (متوازنة)', tr: 'Standart Bulut (Dengeli)', zh: '标准云服务 (均衡)', ru: 'Стандартное облако' },
  'Agency White-Label': { fa: 'آژانسی و نمایندگی وایت‌لیبل', ar: 'وكالة العلامة البيضاء', tr: 'Ajans Beyaz Etiket', zh: '代理商白标定制', ru: 'White-Label для агентств' },
  'DevOps Platform': { fa: 'پلتفرم دوآپس و توسعه‌دهندگان', ar: 'منصة ديف أوبس للمطورين', tr: 'DevOps Platformu', zh: 'DevOps 开发者平台', ru: 'Платформа DevOps' },
  'Enterprise B2B': { fa: 'سازمانی و شرکتی B2B', ar: 'مؤسسي B2B', tr: 'Kurumsal B2B', zh: '企业级 B2B', ru: 'Корпоративный B2B' },
  'General purpose hosting, cloud servers, and everyday terminology.': {
    fa: 'اصطلاحات استاندارد هاستینگ، سرورهای ابری و ادبیات عمومی مشتریان.',
    ar: 'استضافة عامة، خوادم سحابية، ومصطلحات يومية واضحة.',
    tr: 'Genel amaçlı barındırma, bulut sunucuları ve günlük terminoloji.',
    zh: '通用型托管、云服务器及日常通俗化术语。',
    ru: 'Универсальный хостинг, облачные серверы и понятная терминология.'
  },
  'Boutique infrastructure, high-tier servers, and client portal language.': {
    fa: 'ادبیات حرفه‌ای متناسب با شرکت‌های طراحی سایت، نمایندگی‌ها و پرتال اختصاصی مشتریان.',
    ar: 'بنية تحتية ممتازة، خوادم عالية المستوى، ولغة بوابة العملاء الراقية.',
    tr: 'Özel altyapı, üst düzey sunucular ve müşteri portalı dili.',
    zh: '精品云基础设施、高阶服务器与客户门户专属用语。',
    ru: 'Премиальная инфраструктура, серверы высшего класса и язык клиентского портала.'
  },
  'KVM virtual machines, root access, sub-millisecond network, and dev terms.': {
    fa: 'ماشین‌های مجازی KVM، دسترسی روت کامل، پورت پرسرعت و ادبیات فنی مهندسان زیرساخت.',
    ar: 'أجهزة افتراضية KVM، وصول كامل للجذر Root، شبكة سريعة ومصطلحات المطورين.',
    tr: 'KVM sanal makineleri, root erişimi, milisaniyenin altında ağ ve geliştirici terimleri.',
    zh: 'KVM 虚拟机、Root 完全控制权、极低延迟网络及开发工程师专用术语。',
    ru: 'Виртуальные машины KVM, root-доступ, сверхбыстрая сеть и технические термины.'
  },
  'Mission-critical compute, high SLA, enterprise telemetry, and SLAs.': {
    fa: 'پردازش مأموریت‌های حیاتی، ضمانت SLA سازمانی، پایش بلادرنگ و امنیت بالا.',
    ar: 'حوسبة للمهام الحرجة، ضمان SLA عالٍ، ومراقبة عن بعد للمؤسسات.',
    tr: 'Görev açısından kritik bilgi işlem, yüksek SLA, kurumsal telemetri ve SLA garantisi.',
    zh: '关键业务计算节点、高可用 SLA 保障、企业级遥测与合规架构。',
    ru: 'Критически важные вычисления, высокий уровень SLA и корпоративная надежность.'
  },
  'Modern Rounded': { fa: 'مدرن با انحنای استاندارد (۱۶px)', ar: 'دائري حديث (16 بكسل)', tr: 'Modern Yuvarlak (16px)', zh: '现代圆角 (16px)', ru: 'Современный скругленный (16px)' },
  'Sharp Minimal': { fa: 'تیز و مینیمال (۴px)', ar: 'بسيط حاد (4 بكسل)', tr: 'Keskin Minimal (4px)', zh: '利落极简 (4px)', ru: 'Четкий минимал (4px)' },
  'Ultra Curved (Pill)': { fa: 'فوق انحنا / کپسولی (۲۶px)', ar: 'منحنٍ للغاية (26 بكسل)', tr: 'Ultra Kavisli (26px)', zh: '超大圆角 / 胶囊形 (26px)', ru: 'Ультра-скругленный (26px)' },
  'Compact Density': { fa: 'تراکم بالا (۱۰px)', ar: 'كثافة مدمجة (10 بكسل)', tr: 'Kompakt Yoğunluk (10px)', zh: '紧凑高密 (10px)', ru: 'Компактная плотность (10px)' },
  'Fluid Full-Width': { fa: 'شناور تمام‌صفحه (۱۴px)', ar: 'مرن كامل العرض (14 بكسل)', tr: 'Akıcı Tam Genişlik (14px)', zh: '流体全宽 (14px)', ru: 'Плавный на всю ширину (14px)' },
  'Balanced curves for contemporary SaaS aesthetics.': {
    fa: 'انحناهای متعادل و چشم‌نواز مطابق با استانداردهای مدرن روز دنیا.',
    ar: 'منحنيات متوازنة لتصميم برمجيات SaaS المعاصرة.',
    tr: 'Çağdaş SaaS estetiği için dengeli kavisler.',
    zh: '适合现代 SaaS 产品的均衡优雅圆角美学。',
    ru: 'Сбалансированные скругления в стиле современных SaaS сервисов.'
  },
  'Technical, engineering-focused look with crisp 4px edges.': {
    fa: 'ظاهر فنی و دقیق مهندسی با گوشه‌های ۴ پیکسلی شارپ.',
    ar: 'مظهر تقني يركز على الهندسة مع حواف واضحة بدقة 4 بكسل.',
    tr: 'Net 4 piksellik kenarlarla teknik, mühendislik odaklı görünüm.',
    zh: '带有清晰 4px 边缘的技术与工程风范外观。',
    ru: 'Техничный инженерный стиль с четкими гранями 4px.'
  },
  'Soft and playful with high-radius pill surfaces.': {
    fa: 'فرم نرم، دلنشین و ارگونومیک با انحنای بالا.',
    ar: 'ناعم وجذاب مع أسطح كبسولية ذات نصف قطر كبير.',
    tr: 'Yüksek yarıçaplı hap yüzeyleriyle yumuşak ve şık.',
    zh: '柔和且富有亲和力的高半径胶囊形界面。',
    ru: 'Мягкие формы с выраженными скруглениями поверхностей.'
  },
  'Optimized for data-dense admin portals and high information velocity.': {
    fa: 'بهینه‌شده برای داشبوردهای پر از اطلاعات و سرعت بالای مشاهده داده‌ها.',
    ar: 'محسن لبوابات الإدارة الكثيفة بالبيانات وسرعة تدفق المعلومات.',
    tr: 'Veri açısından yoğun yönetim panelleri ve yüksek bilgi akışı için optimize edilmiştir.',
    zh: '专为高密度数据控制台与快速信息览阅优化。',
    ru: 'Оптимизирован для насыщенных данными панелей управления.'
  },
  'Maximum horizontal real estate for expansive setups.': {
    fa: 'حداکثر بهره‌وری از عرض صفحه نمایش برای فضاهای وسیع.',
    ar: 'أقصى استفادة من المساحة الأفقية للإعدادات الواسعة.',
    tr: 'Kapsamlı kurulumlar için maksimum yatay alan.',
    zh: '充分利用屏幕水平空间，适合宽屏与全尺寸展示。',
    ru: 'Максимальное использование ширины экрана для просторных макетов.'
  },
  'Compact': { fa: 'فشرده', ar: 'مدمج', tr: 'Kompakt', zh: '紧凑', ru: 'Компактный' },
  'Standard': { fa: 'استاندارد', ar: 'قياسي', tr: 'Standart', zh: '标准', ru: 'Стандартный' },
  'Spacious': { fa: 'جادار', ar: 'فسيح', tr: 'Geniş', zh: '宽松', ru: 'Просторный' },
  'Extra Large': { fa: 'خیلی بزرگ', ar: 'كبير جداً', tr: 'Ekstra Büyük', zh: '特大号', ru: 'Очень большой' },
  'Tight line heights & 13px base body font.': {
    fa: 'فاصله خطوط متراکم و فونت پایه ۱۳ پیکسلی.',
    ar: 'ارتفاع أسطر متقارب وحجم خط أساسي 13 بكسل.',
    tr: 'Sıkı satır yükseklikleri ve 13px temel gövde yazı tipi.',
    zh: '紧凑行高与 13px 正文基准字号。',
    ru: 'Компактный межстрочный интервал и базовый шрифт 13px.'
  },
  'Optimal readability with 14px base body font.': {
    fa: 'خوانایی بهینه و استاندارد با فونت پایه ۱۴ پیکسلی.',
    ar: 'قراءة مثالية مع حجم خط أساسي 14 بكسل.',
    tr: '14px temel gövde yazı tipiyle optimum okunabilirlik.',
    zh: '最具可读性的 14px 正文基准字号。',
    ru: 'Оптимальная читаемость с базовым шрифтом 14px.'
  },
  'Enhanced comfortable reading with 16px base body font.': {
    fa: 'مطالعه راحت و رسا با فونت پایه ۱۶ پیکسلی.',
    ar: 'قراءة مريحة معززة بحجم خط أساسي 16 بكسل.',
    tr: '16px temel gövde yazı tipiyle gelişmiş rahat okuma.',
    zh: '舒适大气的 16px 正文基准字号。',
    ru: 'Повышенный комфорт чтения с базовым шрифтом 16px.'
  },
  'High-impact large typography with 18px base font.': {
    fa: 'تایپوگرافی بزرگ و برجسته با فونت پایه ۱۸ پیکسلی.',
    ar: 'خطوط كبيرة ذات تأثير بصري عالي بحجم أساسي 18 بكسل.',
    tr: '18px temel yazı tipiyle yüksek etkili büyük tipografi.',
    zh: '视觉冲击力强烈的 18px 大号字体排版。',
    ru: 'Крупная выразительная типографика с базовым шрифтом 18px.'
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

  // 2. Merge translations from supplemental dictionary (takes precedence over old cached strings)
  for (const [key, transMap] of Object.entries(SUPPLEMENTAL_TRANSLATIONS)) {
    for (const [lang, val] of Object.entries(transMap)) {
      if (dicts[lang]) {
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

  // 4. Sanitize quick link entries to remove any remaining emojis
  const linkKeys = ['serverConfiguratorLink', 'customerDashboardLink', 'cdnManagerLink', 's3StorageLink'];
  for (const lang of Object.keys(dicts)) {
    for (const lk of linkKeys) {
      if (dicts[lang][lk]) {
        dicts[lang][lk] = dicts[lang][lk].replace(/^[🚀📊🌐📦⚡🔒☁️🔑🇮🇷\s]+/u, '');
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

export interface CustomizableKey {
  key: string;
  defaultFa: string;
  defaultEn: string;
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

export function getTranslation(
  key: string,
  lang: SupportedLanguage = 'fa',
  customOverrides?: Record<string, string>
): string {
  // 1. Custom administrator overrides take highest precedence
  if (customOverrides && customOverrides[key] && customOverrides[key].trim() !== '') {
    return customOverrides[key];
  }

  // 2. Active target language dictionary
  if (DICTIONARIES[lang] && DICTIONARIES[lang][key] && DICTIONARIES[lang][key] !== '') {
    return DICTIONARIES[lang][key];
  }

  // 3. Persian fallback for RTL contexts
  if (DICTIONARIES['fa'] && DICTIONARIES['fa'][key] && DICTIONARIES['fa'][key] !== '') {
    return DICTIONARIES['fa'][key];
  }

  // 4. English fallback
  if (DICTIONARIES['en'] && DICTIONARIES['en'][key] && DICTIONARIES['en'][key] !== '') {
    return DICTIONARIES['en'][key];
  }

  return key;
}

export interface CustomizableKey {
  key: string;
  defaultFa: string;
  defaultEn: string;
  defaultCurrent: string;
}

export function getCustomizableKeys(activeLang: SupportedLanguage = 'fa'): CustomizableKey[] {
  const faDict = DICTIONARIES.fa || {};
  const enDict = DICTIONARIES.en || {};
  const currentDict = DICTIONARIES[activeLang] || faDict;
  const allKeys = Array.from(new Set([...Object.keys(faDict), ...Object.keys(enDict), ...Object.keys(currentDict)])).sort();

  return allKeys.map((key) => ({
    key,
    defaultFa: faDict[key] || key,
    defaultEn: enDict[key] || key,
    defaultCurrent: currentDict[key] || faDict[key] || enDict[key] || key,
  }));
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
