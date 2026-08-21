/**
 * Comprehensive Multi-Language Dictionary Synchronizer
 * Updates src/i18n/index.ts and includes/class-arv-seller-i18n.php
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');

const ALL_TRANSLATIONS = {
  // WordPress Gettext Full Sentences & Test Keys
  'Deploy Cloud Server': {
    fa: 'سفارش سرور ابری',
    en: 'Deploy Cloud Server',
    ar: 'إنشاء خادم سحابي',
    tr: 'Bulut Sunucu Başlat',
    zh: '部署云服务器',
    ru: 'Создать облачный сервер',
  },
  'Available Wallet Balance': {
    fa: 'موجودی قابل استفاده کیف پول',
    en: 'Available Wallet Balance',
    ar: 'رصيد المحفظة المتاح',
    tr: 'Kullanılabilir Cüzdan Bakiyesi',
    zh: '当前可用钱包余额',
    ru: 'Доступный баланс кошелька',
  },
  'ArvanCloud Reseller Settings & Monetization': {
    fa: 'تنظیمات نمایندگی و درآمدزایی ابر آروان',
    en: 'ArvanCloud Reseller Settings & Monetization',
    ar: 'إعدادات وكالة وأرباح آروان كلاود',
    tr: 'ArvanCloud Bayi Ayarları ve Fiyatlandırma',
    zh: 'ArvanCloud 云分销商系统设置与加价引擎',
    ru: 'Настройки реселлинга ArvanCloud и наценки',
  },
  'Connected successfully to ArvanCloud infrastructure.': {
    fa: 'اتصال به زیرساخت ابر آروان با موفقیت برقرار شد.',
    en: 'Connected successfully to ArvanCloud infrastructure.',
    ar: 'تم الاتصال بالبنية التحتية لـ آروان كلاود بنجاح.',
    tr: 'ArvanCloud altyapısına başarıyla bağlanıldı.',
    zh: '已成功连接至 ArvanCloud 云基础设施。',
    ru: 'Успешное подключение к инфраструктуре ArvanCloud.',
  },
  'Loading ArvanCloud Services Canvas...': {
    fa: 'در حال بارگذاری سامانه خدمات ابری آروان...',
    en: 'Loading ArvanCloud Services Canvas...',
    ar: 'جارٍ تحميل منصة الخدمات السحابية لأروان...',
    tr: 'ArvanCloud Hizmetleri Paneli Yükleniyor...',
    zh: '正在载入 ArvanCloud 云服务平台...',
    ru: 'Загрузка панели облачных сервисов ArvanCloud...',
  },

  // Brand & Platform Names
  arvanCloud: {
    fa: 'ابر آروان',
    en: 'ArvanCloud',
    ar: 'آروان كلاود',
    tr: 'ArvanCloud',
    zh: 'ArvanCloud',
    ru: 'ArvanCloud',
  },
  'ArvanCloud': {
    fa: 'ابر آروان',
    en: 'ArvanCloud',
    ar: 'آروان كلاود',
    tr: 'ArvanCloud',
    zh: 'ArvanCloud',
    ru: 'ArvanCloud',
  },

  // Iranian Cities & Countries
  Tehran: {
    fa: 'تهران',
    en: 'Tehran',
    ar: 'طهران',
    tr: 'Tahran',
    zh: '德黑兰',
    ru: 'Тегеран',
  },
  'تهران': {
    fa: 'تهران',
    en: 'Tehran',
    ar: 'طهران',
    tr: 'Tahran',
    zh: '德黑兰',
    ru: 'Тегеран',
  },
  Tabriz: {
    fa: 'تبریز',
    en: 'Tabriz',
    ar: 'تبريز',
    tr: 'Tebriz',
    zh: '大不里士',
    ru: 'Тебриз',
  },
  'تبریز': {
    fa: 'تبریز',
    en: 'Tabriz',
    ar: 'تبريز',
    tr: 'Tebriz',
    zh: '大不里士',
    ru: 'Тебриز',
  },
  Iran: {
    fa: 'ایران',
    en: 'Iran',
    ar: 'إيران',
    tr: 'İran',
    zh: '伊朗',
    ru: 'Иран',
  },
  'ایران': {
    fa: 'ایران',
    en: 'Iran',
    ar: 'إيران',
    tr: 'İran',
    zh: '伊朗',
    ru: 'Иран',
  },
  Karaj: {
    fa: 'کرج',
    en: 'Karaj',
    ar: 'كرج',
    tr: 'Kerec',
    zh: '卡拉季',
    ru: 'Кередж',
  },
  Isfahan: {
    fa: 'اصفهان',
    en: 'Isfahan',
    ar: 'أصفهان',
    tr: 'İsfahan',
    zh: '伊斯法罕',
    ru: 'Исфахан',
  },
  Shiraz: {
    fa: 'شیراز',
    en: 'Shiraz',
    ar: 'شيراز',
    tr: 'Şiraz',
    zh: '设拉子',
    ru: 'Шираз',
  },
  Mashhad: {
    fa: 'مشهد',
    en: 'Mashhad',
    ar: 'مشهد',
    tr: 'Meşhed',
    zh: '马什哈德',
    ru: 'Мешхед',
  },
  Ahvaz: {
    fa: 'اهواز',
    en: 'Ahvaz',
    ar: 'الأهواز',
    tr: 'Ahvaz',
    zh: '阿瓦士',
    ru: 'Ахваз',
  },

  // Datacenter Regions & Pop Names
  'Tehran - Forough': {
    fa: 'تهران - فروغ',
    en: 'Tehran - Forough',
    ar: 'طهران - فروغ',
    tr: 'Tahran - Forough',
    zh: '德黑兰 - Forough',
    ru: 'Тегеран - Forough',
  },
  'Tehran (Forough)': {
    fa: 'تهران (فروغ)',
    en: 'Tehran (Forough)',
    ar: 'طهران (فروغ)',
    tr: 'Tahran (Forough)',
    zh: '德黑兰 (Forough)',
    ru: 'Тегеран (Forough)',
  },
  'Tehran - Shahryar': {
    fa: 'تهران - شهریار',
    en: 'Tehran - Shahryar',
    ar: 'طهران - شهريار',
    tr: 'Tahran - Şehriyar',
    zh: '德黑兰 - Shahryar',
    ru: 'Тегеран - Шахрияр',
  },
  'Tehran (Shahryar)': {
    fa: 'تهران (شهریار)',
    en: 'Tehran (Shahryar)',
    ar: 'طهران (شهريار)',
    tr: 'Tahran (Şehriyar)',
    zh: '德黑兰 (Shahryar)',
    ru: 'Тегеран (Шахрияр)',
  },
  'Tabriz - Northwest': {
    fa: 'تبریز - شمال‌غرب',
    en: 'Tabriz - Northwest',
    ar: 'تبريز - الشمال الغربي',
    tr: 'Tebriz - Kuzeybatı',
    zh: '大不里士 - 西北',
    ru: 'Тебриз - Северо-Запад',
  },
  'Tabriz (Northwest)': {
    fa: 'تبریز (شمال‌غرب)',
    en: 'Tabriz (Northwest)',
    ar: 'تبريز (الشمال الغربي)',
    tr: 'Tebriz (Kuzeybatı)',
    zh: '大不里士 (西北)',
    ru: 'Тебриз (Северо-Запад)',
  },
  Forough: {
    fa: 'فروغ',
    en: 'Forough',
    ar: 'فروغ',
    tr: 'Forough',
    zh: 'Forough',
    ru: 'Forough',
  },
  Shahryar: {
    fa: 'شهریار',
    en: 'Shahryar',
    ar: 'شهريار',
    tr: 'Şehriyar',
    zh: 'Shahryar',
    ru: 'Шахрияр',
  },
  Northwest: {
    fa: 'شمال‌غرب',
    en: 'Northwest',
    ar: 'الشمال الغربي',
    tr: 'Kuzeybatı',
    zh: '西北',
    ru: 'Северо-Запад',
  },

  // Hardware Flavors / Plan Names
  'Starter Eco': {
    fa: 'پایه اقتصادی (Starter Eco)',
    en: 'Starter Eco',
    ar: 'الأساسي الاقتصادي (Starter Eco)',
    tr: 'Başlangıç Eko (Starter Eco)',
    zh: '入门经济型 (Starter Eco)',
    ru: 'Стартовый Эко (Starter Eco)',
  },
  'Standard General': {
    fa: 'استاندارد عمومی (Standard General)',
    en: 'Standard General',
    ar: 'القياسي العام (Standard General)',
    tr: 'Standart Genel (Standard General)',
    zh: '通用标准型 (Standard General)',
    ru: 'Стандартный Общий (Standard General)',
  },
  'Performance Pro': {
    fa: 'حرفه‌ای پرسرعت (Performance Pro)',
    en: 'Performance Pro',
    ar: 'الاحترافي عالي الأداء (Performance Pro)',
    tr: 'Performans Pro (Performance Pro)',
    zh: '高性能专业型 (Performance Pro)',
    ru: 'Производительный Про (Performance Pro)',
  },
  'Enterprise Ultra': {
    fa: 'سازمانی اولترا (Enterprise Ultra)',
    en: 'Enterprise Ultra',
    ar: 'المؤسسي الفائق (Enterprise Ultra)',
    tr: 'Kurumsal Ultra (Enterprise Ultra)',
    zh: '企业旗舰型 (Enterprise Ultra)',
    ru: 'Корпоративный Ультра (Enterprise Ultra)',
  },
  'Compute Master': {
    fa: 'محاسباتی پیشرفته (Compute Master)',
    en: 'Compute Master',
    ar: 'الحسابي المتقدم (Compute Master)',
    tr: 'İşlemci Odaklı (Compute Master)',
    zh: '计算增强型 (Compute Master)',
    ru: 'Вычислительный Мастер (Compute Master)',
  },
  'Memory Master': {
    fa: 'حافظه پیشرفته (Memory Master)',
    en: 'Memory Master',
    ar: 'الذاكرة المتقدمة (Memory Master)',
    tr: 'Bellek Odaklı (Memory Master)',
    zh: '内存增强型 (Memory Master)',
    ru: 'Память Мастер (Memory Master)',
  },

  // Navigation & Common
  dashboard: {
    fa: 'داشبورد مدیریت',
    en: 'Dashboard',
    ar: 'لوحة التحكم',
    tr: 'Kontrol Paneli',
    zh: '控制台',
    ru: 'Панель управления',
  },
  deployServer: {
    fa: 'سفارش سرور ابری',
    en: 'Deploy Cloud Server',
    ar: 'إنشاء خادم سحابي',
    tr: 'Bulut Sunucu Başlat',
    zh: '部署云服务器',
    ru: 'Создать облачный сервер',
  },
  cdnDns: {
    fa: 'شبکه توزیع محتوا و DNS',
    en: 'CDN & DNS Management',
    ar: 'شبكة توصيل المحتوى و DNS',
    tr: 'CDN ve DNS Yönetimi',
    zh: 'CDN 与 DNS 管理',
    ru: 'Управление CDN и DNS',
  },
  objectStorage: {
    fa: 'فضای ذخیره‌سازی S3',
    en: 'Object Storage (S3)',
    ar: 'التخزين السحابي (S3)',
    tr: 'Nesne Depolama (S3)',
    zh: '对象存储 (S3)',
    ru: 'Объектное хранилище (S3)',
  },
  walletBalance: {
    fa: 'موجودی کیف پول',
    en: 'Wallet Balance',
    ar: 'رصيد المحفظة',
    tr: 'Cüzdan Bakiyesi',
    zh: '钱包余额',
    ru: 'Баланс кошелька',
  },
  availableBalance: {
    fa: 'موجودی در دسترس',
    en: 'Available Balance',
    ar: 'الرصيد المتاح',
    tr: 'Kullanılabilir Bakiye',
    zh: '可用余额',
    ru: 'Доступный баланс',
  },
  topUp: {
    fa: 'افزایش موجودی',
    en: 'Top Up',
    ar: 'شحن الرصيد',
    tr: 'Bakiye Yükle',
    zh: '充值',
    ru: 'Пополнить',
  },
  signIn: {
    fa: 'ورود / ثبت نام',
    en: 'Sign In / Register',
    ar: 'تسجيل الدخول / التسجيل',
    tr: 'Giriş Yap / Kaydol',
    zh: '登录 / 注册',
    ru: 'Вход / Регистрация',
  },
  logout: {
    fa: 'خروج از حساب',
    en: 'Logout',
    ar: 'تسجيل الخروج',
    tr: 'Çıkış Yap',
    zh: '退出登录',
    ru: 'Выйти',
  },
  cancel: {
    fa: 'انصراف',
    en: 'Cancel',
    ar: 'إلغاء',
    tr: 'İptal',
    zh: '取消',
    ru: 'Отмена',
  },
  confirm: {
    fa: 'تأیید',
    en: 'Confirm',
    ar: 'تأكيد',
    tr: 'Onayla',
    zh: '确认',
    ru: 'Подтвердить',
  },
  done: {
    fa: 'تأیید و بستن',
    en: 'Done',
    ar: 'تم',
    tr: 'Tamam',
    zh: '完成',
    ru: 'Готово',
  },
  save: {
    fa: 'ذخیره تنظیمات',
    en: 'Save Settings',
    ar: 'حفظ الإعدادات',
    tr: 'Ayarları Kaydet',
    zh: '保存设置',
    ru: 'Сохранить настройки',
  },
  copy: {
    fa: 'کپی',
    en: 'Copy',
    ar: 'نسخ',
    tr: 'Kopyala',
    zh: '复制',
    ru: 'Копировать',
  },
  copied: {
    fa: 'کپی شد!',
    en: 'Copied!',
    ar: 'تم النسخ!',
    tr: 'Kopyalandı!',
    zh: '已复制！',
    ru: 'Скопировано!',
  },
  generate: {
    fa: 'تولید',
    en: 'Generate',
    ar: 'توليد',
    tr: 'Oluştur',
    zh: '生成',
    ru: 'Сгенерировать',
  },
  status: {
    fa: 'وضعیت',
    en: 'Status',
    ar: 'الحالة',
    tr: 'Durum',
    zh: '状态',
    ru: 'Статус',
  },
  actions: {
    fa: 'عملیات',
    en: 'Actions',
    ar: 'الإجراءات',
    tr: 'İşlemler',
    zh: '操作',
    ru: 'Действия',
  },
  running: {
    fa: 'در حال اجرا',
    en: 'Running',
    ar: 'قيد التشغيل',
    tr: 'Çalışıyor',
    zh: '运行中',
    ru: 'Работает',
  },
  stopped: {
    fa: 'خاموش',
    en: 'Stopped',
    ar: 'متوقف',
    tr: 'Durduruldu',
    zh: '已关机',
    ru: 'Остановлен',
  },
  suspended: {
    fa: 'معلق',
    en: 'Suspended',
    ar: 'معلق',
    tr: 'Askıya Alındı',
    zh: '已暂停',
    ru: 'Приостановлен',
  },
  selectLanguage: {
    fa: 'انتخاب زبان',
    en: 'Select Language',
    ar: 'اختيار اللغة',
    tr: 'Dil Seçin',
    zh: '选择语言',
    ru: 'Выбрать язык',
  },
  cores: {
    fa: 'هسته',
    en: 'Core',
    ar: 'نواة',
    tr: 'Çekirdek',
    zh: '核',
    ru: 'Ядер',
  },
  total: {
    fa: 'مجموع',
    en: 'Total',
    ar: 'الإجمالي',
    tr: 'Toplam',
    zh: '总计',
    ru: 'Всего',
  },
  hours: {
    fa: 'ساعت',
    en: 'Hours',
    ar: 'ساعات',
    tr: 'Saat',
    zh: '小时',
    ru: 'Часов',
  },
  unlimited: {
    fa: 'نامحدود',
    en: 'Unlimited',
    ar: 'غير محدود',
    tr: 'Sınırsız',
    zh: '无限制',
    ru: 'Неограниченно',
  },
  copyIp: {
    fa: 'کپی آدرس IP',
    en: 'Copy IP',
    ar: 'نسخ عنوان IP',
    tr: 'IP Kopyala',
    zh: '复制 IP',
    ru: 'Копировать IP',
  },
  allocatingIp: {
    fa: 'در حال تخصیص IP...',
    en: 'Allocating IP...',
    ar: 'جاري تخصيص IP...',
    tr: 'IP Tahsis Ediliyor...',
    zh: '正在分配 IP...',
    ru: 'Выделение IP...',
  },
  backOffice: {
    fa: 'پنل مدیریت',
    en: 'Back-Office',
    ar: 'لوحة الإدارة',
    tr: 'Yönetim Paneli',
    zh: '管理后台',
    ru: 'Панель управления',
  },
  storefrontSubtitle: {
    fa: 'فروشگاه و سامانه اختصاصی زیرساخت ابری',
    en: 'Cloud Infrastructure Storefront',
    ar: 'بوابة خدمات البنية التحتية السحابية',
    tr: 'Bulut Altyapı Mağazası',
    zh: '云基础设施商城',
    ru: 'Витрина облачной инфраструктуры',
  },

  // Server Configurator
  nextGenCloudIaaS: {
    fa: 'زیرساخت ابری نسل جدید (IaaS)',
    en: 'Next-Gen Cloud Compute (IaaS)',
    ar: 'البنية التحتية السحابية المتقدمة (IaaS)',
    tr: 'Yeni Nesil Bulut Bilişim (IaaS)',
    zh: '下一代云基础设施 (IaaS)',
    ru: 'Облачная инфраструктура нового поколения (IaaS)',
  },
  configuratorHeroDesc: {
    fa: 'پیکربندی ماشین‌های مجازی ابری پرسرعت NVMe با سخت‌افزار دیتاسنتری ابر آروان و تحویل آنی.',
    en: 'Configure high-performance NVMe cloud virtual machines powered by ArvanCloud data center infrastructure with instant provisioning.',
    ar: 'إعداد خوادم افتراضية عالية الأداء بمحركات أقراص NVMe فائقة السرعة مع تسليم فوري.',
    tr: 'ArvanCloud veri merkezi altyapısıyla anında kullanıma hazır, yüksek performanslı NVMe bulut sanal sunucuları yapılandırın.',
    zh: '配置基于 ArvanCloud 数据中心基础设施的高性能 NVMe 云服务器，即买即用。',
    ru: 'Настройка высокопроизводительных виртуальных машин NVMe на базе дата-центров ArvanCloud с мгновенным запуском.',
  },
  step1Region: {
    fa: '۱. انتخاب دیتاسنتر و لوکیشن',
    en: '1. Select Datacenter Region',
    ar: '١. اختيار مركز البيانات',
    tr: '1. Veri Merkezi Bölgesi Seçin',
    zh: '1. 选择数据中心区域',
    ru: '1. Выберите регион дата-центра',
  },
  step2Flavor: {
    fa: '۲. مشخصات سخت‌افزاری سرور',
    en: '2. Hardware Specifications',
    ar: '٢. مواصفات الخادم',
    tr: '2. Donanım Özellikleri',
    zh: '2. 服务器硬件规格',
    ru: '2. Аппаратные характеристики',
  },
  step3Disk: {
    fa: '۳. فضای ذخیره‌سازی NVMe SSD',
    en: '3. NVMe Storage Disk',
    ar: '٣. مساحة التخزين NVMe SSD',
    tr: '3. NVMe Depolama Diski',
    zh: '3. NVMe 高速固态存储',
    ru: '3. Дисковое хранилище NVMe SSD',
  },
  step4Image: {
    fa: '۴. سیستم‌عامل و توزیع لینوکس / ویندوز',
    en: '4. Operating System Image',
    ar: '٤. نظام التشغيل',
    tr: '4. İşletim Sistemi İmajı',
    zh: '4. 操作系统与镜像',
    ru: '4. Образ операционной системы',
  },
  step5Auth: {
    fa: '۵. نام هاست و احراز هویت',
    en: '5. Hostname & Authentication',
    ar: '٥. اسم المضيف والمصادقة',
    tr: '5. Sunucu Adı ve Kimlik Doğrulama',
    zh: '5. 主机名与访问凭证',
    ru: '5. Имя хоста и аутентификация',
  },
  allPlans: {
    fa: 'همه پلن‌ها',
    en: 'All Plans',
    ar: 'جميع الباقات',
    tr: 'Tüm Planlar',
    zh: '全部套餐',
    ru: 'Все тарифы',
  },
  general: {
    fa: 'عمومی و استاندارد',
    en: 'General Purpose',
    ar: 'استخدام عام',
    tr: 'Genel Amaçlı',
    zh: '通用标准型',
    ru: 'Универсальные',
  },
  compute: {
    fa: 'پردازشی (High CPU)',
    en: 'Compute Optimized',
    ar: 'أداء معالج عالي',
    tr: 'İşlemci Odaklı',
    zh: '计算密集型',
    ru: 'Вычислительные',
  },
  memory: {
    fa: 'حافظه بالا (High RAM)',
    en: 'Memory Optimized',
    ar: 'ذاكرة عشوائية عالية',
    tr: 'Bellek Odaklı',
    zh: '高内存型',
    ru: 'С повышенной памятью',
  },
  mostPopular: {
    fa: 'پیشنهاد ویژه',
    en: 'Most Popular',
    ar: 'الأكثر طلباً',
    tr: 'En Popüler',
    zh: '最受欢迎',
    ru: 'Популярный выбор',
  },
  hourlyRate: {
    fa: 'هزینه ساعتی',
    en: 'Hourly Rate',
    ar: 'التكلفة بالساعة',
    tr: 'Saatlik Ücret',
    zh: '每小时费用',
    ru: 'Тариф в час',
  },
  hourlyBurn: {
    fa: 'مصرف ساعتی',
    en: 'Hourly Burn Rate',
    ar: 'معدل الاستهلاك بالساعة',
    tr: 'Saatlik Tüketim Oranı',
    zh: '每小时消耗率',
    ru: 'Расход в час',
  },
  monthlyEstimate: {
    fa: 'تخمین ماهانه (۷۲۰ ساعت)',
    en: 'Estimated Monthly (720 hrs)',
    ar: 'التقدير الشهري (٧٢٠ ساعة)',
    tr: 'Tahmini Aylık (720 saat)',
    zh: '月度预估 (720小时)',
    ru: 'Ориентировочно в месяц (720 ч)',
  },
  additionalStorage: {
    fa: 'فضای ذخیره‌سازی اضافه',
    en: 'Additional Storage',
    ar: 'مساحة تخزين إضافية',
    tr: 'Ek Depolama Alanı',
    zh: '额外存储空间',
    ru: 'Дополнительный объем',
  },
  instanceHostname: {
    fa: 'نام سرور (Hostname)',
    en: 'Instance Hostname',
    ar: 'اسم الخادم (Hostname)',
    tr: 'Sunucu Adı (Hostname)',
    zh: '实例主机名 (Hostname)',
    ru: 'Имя сервера (Hostname)',
  },
  authCredentials: {
    fa: 'روش احراز هویت و ورود:',
    en: 'Authentication Credentials:',
    ar: 'بيانات المصادقة:',
    tr: 'Kimlik Doğrulama Yöntemi:',
    zh: '登录认证方式:',
    ru: 'Способ аутентификации:',
  },
  password: {
    fa: 'رمز عبور',
    en: 'Password',
    ar: 'كلمة المرور',
    tr: 'Şifre',
    zh: '密码',
    ru: 'Пароль',
  },
  sshKey: {
    fa: 'کلید SSH',
    en: 'SSH Key',
    ar: 'مفتاح SSH',
    tr: 'SSH Anahtarı',
    zh: 'SSH 密钥',
    ru: 'SSH ключ',
  },
  orderSummary: {
    fa: 'خلاصه سفارش و مشخصات سرور',
    en: 'Order Summary & Specifications',
    ar: 'ملخص الطلب والمواصفات',
    tr: 'Sipariş Özeti ve Özellikler',
    zh: '订单明细与服务器配置',
    ru: 'Сводка заказа и параметры',
  },
  region: {
    fa: 'دیتاسنتر',
    en: 'Region',
    ar: 'المنطقة',
    tr: 'Bölge',
    zh: '数据中心区域',
    ru: 'Регион',
  },
  flavor: {
    fa: 'پلن سخت‌افزاری',
    en: 'Hardware Flavor',
    ar: 'الباقة',
    tr: 'Donanım Planı',
    zh: '硬件配置',
    ru: 'Тариф',
  },
  specs: {
    fa: 'مشخصات',
    en: 'Specifications',
    ar: 'المواصفات',
    tr: 'Özellikler',
    zh: '规格',
    ru: 'Характеристики',
  },
  storage: {
    fa: 'فضای دیسک',
    en: 'Storage',
    ar: 'التخزين',
    tr: 'Depolama',
    zh: '磁盘空间',
    ru: 'Диск',
  },
  os: {
    fa: 'سیستم‌عامل',
    en: 'Operating System',
    ar: 'نظام التشغيل',
    tr: 'İşletim Sistemi',
    zh: '操作系统',
    ru: 'ОС',
  },
  minRequired: {
    fa: 'حداقل موجودی (۲۴ ساعت)',
    en: 'Min Required (24h)',
    ar: 'الحد الأدنى المطلوب (٢٤ ساعة)',
    tr: 'Min. Gerekli Bakiye (24s)',
    zh: '最低起充要求 (24小时)',
    ru: 'Мин. баланс для старта (24ч)',
  },
  instantDeploy: {
    fa: 'ایجاد و تحویل آنی سرور',
    en: 'Instant Deploy',
    ar: 'إنشاء فوري للخادم',
    tr: 'Anında Dağıt',
    zh: '立即创建并交付',
    ru: 'Запустить сервер',
  },
  insufficientBalance: {
    fa: 'موجودی ناکافی (نیاز به شارژ)',
    en: 'Insufficient Balance (Recharge Needed)',
    ar: 'الرصيد غير كافٍ (يلزم الشحن)',
    tr: 'Yetersiz Bakiye (Yükleme Gerekli)',
    zh: '余额不足 (需要充值)',
    ru: 'Недостаточно средств (требуется пополнение)',
  },
  vcpu: {
    fa: 'پردازنده',
    en: 'vCPU',
    ar: 'المعالج',
    tr: 'İşlemci (vCPU)',
    zh: '虚拟处理器 (vCPU)',
    ru: 'vCPU',
  },
  ram: {
    fa: 'حافظه رم',
    en: 'RAM',
    ar: 'الذاكرة',
    tr: 'Bellek (RAM)',
    zh: '内存 (RAM)',
    ru: 'ОЗУ',
  },
  baseDiskLabel: {
    fa: 'پایه:',
    en: 'Base:',
    ar: 'الأساسي:',
    tr: 'Taban:',
    zh: '基础:',
    ru: 'Базовый:',
  },
  maxDiskLabel: {
    fa: 'حداکثر:',
    en: 'Max:',
    ar: 'الحد الأقصى:',
    tr: 'Maksimum:',
    zh: '最大:',
    ru: 'Макс:',
  },
  provisioningInstance: {
    fa: 'در حال راه‌اندازی و تحویل سرور...',
    en: 'Provisioning Instance...',
    ar: 'جاري تشغيل وتهيئة الخادم...',
    tr: 'Sunucu Kuruluyor...',
    zh: '正在创建云主机...',
    ru: 'Запуск и настройка сервера...',
  },
  provisionTimeNote: {
    fa: '⚡ تحویل آنی در کمتر از ۴۵ ثانیه بر روی هسته زیرساخت ابر آروان.',
    en: '⚡ Provisioned in < 45 seconds on ArvanCloud Core Infrastructure.',
    ar: '⚡ تسليم فوري في أقل من ٤٥ ثانية على البنية التحتية الأساسية لأروان كلاود.',
    tr: '⚡ ArvanCloud Çekirdek Altyapısında 45 saniyeden kısa sürede hazır.',
    zh: '⚡ 在 ArvanCloud 核心基础设施上 45 秒内即时交付。',
    ru: '⚡ Мгновенный запуск менее чем за 45 секунд на инфраструктуре ArvanCloud.',
  },

  // Customer Dashboard
  dashboardDesc: {
    fa: 'نظارت لحظه‌ای بر کیف پول اتمیک، مدیریت توان سرورها و پایش منابع ابری.',
    en: 'Real-time atomic wallet oversight, live server runtime controls, and resource telemetry.',
    ar: 'مراقبة فورية لمحفظة الحساب وإدارة دورة حياة الخوادم السحابية.',
    tr: 'Gerçek zamanlı atomik cüzdan denetimi, canlı sunucu çalışma kontrolleri ve kaynak telemetrisi.',
    zh: '原子钱包实时监控、服务器电源生命周期控制及资源遥测。',
    ru: 'Контроль баланса в реальном времени, управление питанием серверов и мониторинг ресурсов.',
  },
  suspensionNotice: {
    fa: 'اخطار: موجودی کیف پول به پایان رسیده است',
    en: 'Suspension Notice: Depleted Balance',
    ar: 'إشعار تعليق: نفاد الرصيد',
    tr: 'Askıya Alma Bildirimi: Bakiye Tükendi',
    zh: '暂停通知：钱包余额已耗尽',
    ru: 'Уведомление: Баланс исчерпан',
  },
  suspensionDesc: {
    fa: 'موجودی کیف پول شما به صفر رسیده است. کلیه سرورهای فعال جهت جلوگیری از بدهی خاموش شده‌اند. با افزایش موجودی، سرورها بلافاصله در دسترس خواهند بود.',
    en: 'Your wallet balance has depleted to 0. All running cloud server instances have been safely powered down. Top up your balance to immediately recover operation.',
    ar: 'وصل رصيد المحفظة إلى صفر وتم إيقاف الخوادم النشطة لتجنب المديونية. اشحن رصيدك لاستعادة التشغيل فوراً.',
    tr: 'Cüzdan bakiyeniz tükendi. Borçlanmayı önlemek için çalışan tüm bulut sunucuları güvenli şekilde durduruldu. Hemen bakiye yükleyerek hizmeti yeniden başlatın.',
    zh: '您的钱包余额已为0。为防止产生欠费，所有运行中的云服务器已安全关机。充值后可立即恢复服务。',
    ru: 'Ваш баланс равен нулю. Все активные серверы выключены для предотвращения задолженности. Пополните счет для возобновления работы.',
  },
  rechargeWalletNow: {
    fa: 'شارژ فوری کیف پول',
    en: 'Recharge Wallet Now',
    ar: 'شحن المحفظة الآن',
    tr: 'Hemen Bakiye Yükle',
    zh: '立即充值钱包',
    ru: 'Пополнить баланс сейчас',
  },
  lowBalanceAlert: {
    fa: 'هشدار: موجودی رو به اتمام است',
    en: 'Warning: Low Balance',
    ar: 'تحذير: انخفاض الرصيد',
    tr: 'Uyarı: Düşük Bakiye',
    zh: '警告：余额即将用尽',
    ru: 'Внимание: Низкий баланс',
  },
  lowBalanceDesc: {
    fa: 'با نرخ مصرف ساعتی فعلی، موجودی شما در کمتر از ۱۲ ساعت آینده به پایان می‌رسد.',
    en: 'At your current hourly burn rate, your balance will deplete in less than 12 hours.',
    ar: 'وفقاً لمعدل الاستهلاك الحالي، سينفد رصيدك خلال أقل من ١٢ ساعة.',
    tr: 'Mevcut saatlik tüketim hızınıza göre bakiyeniz 12 saatten kısa sürede tükenecektir.',
    zh: '按照您当前的每小时消耗速率，您的余额将在不到12小时内耗尽。',
    ru: 'При текущей скорости расхода средств баланс исчерпается менее чем через 12 часов.',
  },
  quickTopUp: {
    fa: 'شارژ سریع',
    en: 'Quick Top Up',
    ar: 'شحن سريع',
    tr: 'Hızlı Yükleme',
    zh: '快捷充值',
    ru: 'Быстрое пополнение',
  },
  estimatedRuntime: {
    fa: 'زمان باقیمانده تخمینی',
    en: 'Estimated Runtime',
    ar: 'الوقت المتبقي المقدر',
    tr: 'Tahmini Çalışma Süresi',
    zh: '预计可持续运行时间',
    ru: 'Осталось времени',
  },
  activeInstances: {
    fa: 'سرورهای فعال',
    en: 'Active Instances',
    ar: 'الخوادم النشطة',
    tr: 'Aktif Sunucular',
    zh: '运行中的实例',
    ru: 'Активные серверы',
  },
  activeCloudVms: {
    fa: 'ماشین‌های مجازی ابری فعال',
    en: 'Active Cloud Virtual Machines',
    ar: 'الخوادم الافتراضية النشطة',
    tr: 'Aktif Bulut Sanal Makineleri',
    zh: '活跃的云虚拟机',
    ru: 'Активные виртуальные машины',
  },
  noServers: {
    fa: 'هنوز هیچ سرور ابری ایجاد نکرده‌اید.',
    en: 'No cloud servers deployed yet.',
    ar: 'لم يتم إنشاء خوادم سحابية بعد.',
    tr: 'Henüz dağıtılmış bulut sunucusu yok.',
    zh: '暂无已部署的云服务器。',
    ru: 'Серверы еще не созданы.',
  },
  serverName: {
    fa: 'نام سرور',
    en: 'Server Name',
    ar: 'اسم الخادم',
    tr: 'Sunucu Adı',
    zh: '服务器名称',
    ru: 'Имя сервера',
  },
  ipAddress: {
    fa: 'آدرس آی‌پی (IP)',
    en: 'Public IP',
    ar: 'عنوان IP',
    tr: 'Genel IP',
    zh: '公网 IP',
    ru: 'IP адрес',
  },
  planSpecs: {
    fa: 'پلن و مشخصات',
    en: 'Plan Specs',
    ar: 'المواصفات',
    tr: 'Plan Özellikleri',
    zh: '套餐配置',
    ru: 'Конфигурация',
  },
  powerOn: {
    fa: 'روشن کردن',
    en: 'Power On',
    ar: 'تشغيل',
    tr: 'Aç',
    zh: '开机',
    ru: 'Включить',
  },
  powerOff: {
    fa: 'خاموش کردن',
    en: 'Power Off',
    ar: 'إيقاف التشغيل',
    tr: 'Kapat',
    zh: '关机',
    ru: 'Выключить',
  },
  reboot: {
    fa: 'راه‌اندازی مجدد',
    en: 'Reboot',
    ar: 'إعادة التشغيل',
    tr: 'Yeniden Başlat',
    zh: '重启',
    ru: 'Перезагрузить',
  },
  delete: {
    fa: 'حذف دائم',
    en: 'Delete',
    ar: 'حذف',
    tr: 'Sil',
    zh: '删除',
    ru: 'Удалить',
  },
  confirmDelete: {
    fa: 'آیا از حذف دائم این سرور اطمینان دارید؟ تمامی اطلاعات پاک خواهد شد.',
    en: 'Are you sure you want to permanently delete this server? All disk data will be erased.',
    ar: 'هل أنت متأكد من حذف هذا الخادم نهائياً؟ سيتم مسح كافة البيانات.',
    tr: 'Bu sunucuyu kalıcı olarak silmek istediğinizden emin misiniz? Tüm disk verileri silinecektir.',
    zh: '您确定要永久删除此服务器吗？磁盘中的所有数据将被清空。',
    ru: 'Вы уверены, что хотите удалить сервер безвозвратно? Все данные будут стерты.',
  },
  transactionHistory: {
    fa: 'ریز تراکنش‌ها و گردش حساب کیف پول',
    en: 'Wallet Transaction Ledger & Audit Logs',
    ar: 'سجل معاملات المحفظة والتدقيق',
    tr: 'Cüzdan İşlem Defteri ve Denetim Kayıtları',
    zh: '钱包交易流水与对账审计',
    ru: 'Журнал операций и история баланса',
  },
  timestamp: {
    fa: 'زمان تراکنش',
    en: 'Timestamp',
    ar: 'الوقت',
    tr: 'Zaman Damgası',
    zh: '交易时间',
    ru: 'Время',
  },
  type: {
    fa: 'نوع',
    en: 'Type',
    ar: 'النوع',
    tr: 'Tür',
    zh: '交易类型',
    ru: 'Тип',
  },
  description: {
    fa: 'توضیحات تراکنش',
    en: 'Transaction Description',
    ar: 'الوصف',
    tr: 'Açıklama',
    zh: '描述明细',
    ru: 'Описание операции',
  },
  amount: {
    fa: 'مبلغ',
    en: 'Amount',
    ar: 'المبلغ',
    tr: 'Tutar',
    zh: '金额',
    ru: 'Сумма',
  },
  balanceSnapshot: {
    fa: 'مانده موجودی',
    en: 'Balance Snapshot',
    ar: 'الرصيد بعد المعاملة',
    tr: 'Bakiye Özeti',
    zh: '结余余额',
    ru: 'Баланс после операции',
  },
  noTransactions: {
    fa: 'هنوز هیچ تراکنشی ثبت نشده است.',
    en: 'No transactions recorded yet.',
    ar: 'لم يتم تسجيل أي معاملات بعد.',
    tr: 'Henüz kaydedilmiş işlem yok.',
    zh: '暂无交易记录。',
    ru: 'Операций пока не зафиксировано.',
  },
  customAmount: {
    fa: 'مبلغ دلخواه',
    en: 'Custom Amount',
    ar: 'مبلغ مخصص',
    tr: 'Özel Tutar',
    zh: '自定义金额',
    ru: 'Своя сумма',
  },
  proceedPayment: {
    fa: 'پرداخت آنلاین و شارژ کیف پول',
    en: 'Proceed to Payment',
    ar: 'متابعة الدفع',
    tr: 'Ödemeye İlerle',
    zh: '前往在线充值',
    ru: 'Перейти к оплате',
  },
  txDeposit: {
    fa: 'شارژ آنلاین',
    en: 'Deposit',
    ar: 'إيداع',
    tr: 'Yatırma',
    zh: '充值',
    ru: 'Пополнение',
  },
  txMetered: {
    fa: 'مصرف ساعتی',
    en: 'Metered',
    ar: 'استهلاك ساعي',
    tr: 'Kullanım',
    zh: '按量计费',
    ru: 'Списание',
  },
  txAdjustment: {
    fa: 'تعدیل مالی',
    en: 'Adjustment',
    ar: 'تسوية',
    tr: 'Düzeltme',
    zh: '调账',
    ru: 'Корректировка',
  },

  // CDN & DNS
  cdnTitle: {
    fa: 'اتصال دامنه و مدیریت Anycast DNS',
    en: 'CDN Domain Connection & Anycast DNS',
    ar: 'ربط النطاق بشبكة CDN و Anycast DNS',
    tr: 'CDN Alan Adı Bağlantısı ve Anycast DNS',
    zh: 'CDN 域名接入与 Anycast DNS 解析',
    ru: 'Подключение домена к CDN и Anycast DNS',
  },
  cdnDesc: {
    fa: 'کشینگ سراسری محتوا (CDN)، محافظت در برابر حملات DDoS، شتاب‌دهی Anycast DNS و صدور خودکار گواهی SSL.',
    en: 'Global edge CDN caching, DDoS protection, Anycast DNS acceleration, and automated SSL certificate provisioning.',
    ar: 'تخزين مؤقت عالمي (CDN)، حماية من هجمات DDoS، تسريع Anycast DNS، وتوفير شهادات SSL تلقائياً.',
    tr: 'Küresel uç CDN önbelleğe alma, DDoS koruması, Anycast DNS hızlandırma ve otomatik SSL sertifikası sağlama.',
    zh: '全球边缘 CDN 缓存加速、DDoS 攻击防护、Anycast DNS 解析以及免费自动申请 SSL 证书。',
    ru: 'Глобальное кэширование (CDN), защита от DDoS-атак, ускорение Anycast DNS и автовыпуск SSL сертификатов.',
  },
  connectDomain: {
    fa: 'اتصال دامنه به CDN',
    en: 'Connect Domain to CDN',
    ar: 'ربط النطاق بـ CDN',
    tr: 'Alan Adını CDN\'e Bağla',
    zh: '接入域名至 CDN',
    ru: 'Подключить домен к CDN',
  },
  domainInput: {
    fa: 'نام دامنه شما (مثال: example.com)',
    en: 'Domain Name (e.g. example.com)',
    ar: 'اسم النطاق (مثال: example.com)',
    tr: 'Alan Adı (ör. example.com)',
    zh: '您的域名 (例如 example.com)',
    ru: 'Доменное имя (напр. example.com)',
  },
  activeCdnDomains: {
    fa: 'دامنه‌های متصل به CDN',
    en: 'Active CDN Edge Domains',
    ar: 'النطاقات المتصلة بـ CDN',
    tr: 'Aktif CDN Alan Adları',
    zh: '已接入 CDN 的域名列表',
    ru: 'Подключенные домены CDN',
  },
  assignedNameservers: {
    fa: 'نیم‌سرورهای اختصاصی شبکه ابر آروان:',
    en: 'Assigned ArvanCloud Anycast Nameservers:',
    ar: 'خوادم الأسماء Anycast المخصصة لأروان كلاود:',
    tr: 'Atanan ArvanCloud Anycast Ad Sunucuları:',
    zh: '分配的 ArvanCloud Anycast 权威域名服务器:',
    ru: 'Назначенные Anycast NS серверы:',
  },
  dnsRecords: {
    fa: 'رکوردهای DNS',
    en: 'DNS Records',
    ar: 'سجلات DNS',
    tr: 'DNS Kayıtları',
    zh: 'DNS 解析记录',
    ru: 'DNS записи',
  },
  purgeCache: {
    fa: 'پاکسازی کش',
    en: 'Purge Edge Cache',
    ar: 'مسح التخزين المؤقت',
    tr: 'Önbelleği Temizle',
    zh: '清除边缘缓存',
    ru: 'Очистить кэш CDN',
  },
  sslActive: {
    fa: 'گواهی امنیتی SSL فعال است',
    en: 'SSL Certificate Active',
    ar: 'شهادة SSL نشطة',
    tr: 'SSL Sertifikası Aktif',
    zh: 'SSL 安全证书已生效',
    ru: 'SSL сертификат активен',
  },
  activePops: {
    fa: 'فعال بر روی بیش از ۴۰ پاپ‌سایت جهانی',
    en: 'Active on 40+ Global PoPs',
    ar: 'نشط على أكثر من ٤٠ موقع حول العالم',
    tr: '40+ Küresel PoP Noktasında Aktif',
    zh: '已部署在全球 40 多个边缘节点',
    ru: 'Активно на 40+ глобальных точках PoP',
  },
  dnsDialogDesc: {
    fa: 'افزودن و مدیریت رکوردهای دامنه با انتشار آنی بر روی شبکه Anycast.',
    en: 'Add and manage DNS zone records with instant Anycast propagation.',
    ar: 'إضافة وإدارة سجلات DNS مع نشر فوري عبر شبكة Anycast.',
    tr: 'Anycast yayılımı ile anında DNS kayıtlarını ekleyin ve yönetin.',
    zh: '添加并管理 DNS 解析记录，享受 Anycast 全球即时生效。',
    ru: 'Добавление и управление записями DNS с мгновенным Anycast обновлением.',
  },
  dnsRecordNamePlaceholder: {
    fa: 'نام رکورد (@ یا ساب‌دامین)',
    en: 'Name (@ or sub)',
    ar: 'الاسم (@ أو النطاق الفرعي)',
    tr: 'Ad (@ veya alt alan)',
    zh: '主机记录 (@ 或 子域名)',
    ru: 'Имя (@ или поддомен)',
  },
  dnsRecordTargetPlaceholder: {
    fa: 'مقصد / آدرس IP',
    en: 'Target / IP',
    ar: 'الهدف / IP',
    tr: 'Hedef / IP',
    zh: '记录值 / IP地址',
    ru: 'Значение / IP',
  },
  addRecord: {
    fa: 'افزودن رکورد',
    en: 'Add Record',
    ar: 'إضافة سجل',
    tr: 'Kayıt Ekle',
    zh: '添加记录',
    ru: 'Добавить запись',
  },
  proxied: {
    fa: 'پراکسی فعال',
    en: 'Proxied',
    ar: 'محمي بالبروكسي',
    tr: 'Proxy Aktif',
    zh: '代理已开启',
    ru: 'Проксировано',
  },
  close: {
    fa: 'بستن',
    en: 'Close',
    ar: 'إغلاق',
    tr: 'Kapat',
    zh: '关闭',
    ru: 'Закрыть',
  },

  // S3 Storage
  storageTitle: {
    fa: 'فضای ذخیره‌سازی ابری S3 (Object Storage)',
    en: 'S3 Object Storage Buckets',
    ar: 'التخزين السحابي للكائنات S3',
    tr: 'S3 Nesne Depolama Paketleri',
    zh: 'S3 兼容对象存储',
    ru: 'Объектное хранилище S3',
  },
  storageDesc: {
    fa: 'فضای ذخیره‌سازی نامحدود سازگار با S3 با توان عملیاتی بالا، تکثیر در چندین دیتاسنتر و پشتیبانی از ابزارهای استاندارد.',
    en: 'Unlimited S3-compatible cloud object storage with high throughput, multi-region replication, and standard API interoperability.',
    ar: 'تخزين كائنات غير محدود متوافق مع S3 بأداء عالي وتكرار عبر مراكز بيانات متعددة.',
    tr: 'Yüksek verimlilik, çoklu bölge çoğaltma ve standart API uyumluluğu ile sınırsız S3 uyumlu bulut nesne depolama.',
    zh: '无限量 S3 兼容对象存储，具备高吞吐量、多可用区容灾复制和标准 API 兼容能力。',
    ru: 'Высокоскоростное хранилище S3 с репликацией между дата-центрами и поддержкой стандартных API.',
  },
  createBucket: {
    fa: 'ایجاد باکت جدید',
    en: 'Create New Bucket',
    ar: 'إنشاء حاوية جديدة',
    tr: 'Yeni Paket Oluştur',
    zh: '创建新存储桶',
    ru: 'Создать бакет',
  },
  bucketName: {
    fa: 'نام باکت (فقط حروف کوچک و اعداد)',
    en: 'Bucket Name (lowercase & numbers only)',
    ar: 'اسم الحاوية (أحرف صغيرة وأرقام فقط)',
    tr: 'Paket Adı (yalnızca küçük harfler ve sayılar)',
    zh: '存储桶名称 (仅支持小写字母与数字)',
    ru: 'Имя бакета (только строчные буквы и цифры)',
  },
  existingBuckets: {
    fa: 'باکت‌های ذخیره‌سازی موجود',
    en: 'Existing Storage Buckets',
    ar: 'حاويات التخزين الحالية',
    tr: 'Mevcut Depolama Paketleri',
    zh: '现有存储桶列表',
    ru: 'Созданные бакеты',
  },
  viewApiKeys: {
    fa: 'مشاهده کلیدهای اتصال API',
    en: 'View S3 API Credentials',
    ar: 'عرض بيانات اعتماد S3 API',
    tr: 'S3 API Kimlik Bilgilerini Görüntüle',
    zh: '查看 S3 API 访问凭据',
    ru: 'Ключи доступа S3 API',
  },
  endpointUrl: {
    fa: 'آدرس Endpoint',
    en: 'Endpoint URL',
    ar: 'عنوان نقطة النهاية (Endpoint)',
    tr: 'Uç Nokta (Endpoint) URL',
    zh: '终端节点 URL (Endpoint)',
    ru: 'Endpoint URL',
  },
  accessKey: {
    fa: 'شناسه دسترسی (Access Key)',
    en: 'Access Key ID',
    ar: 'معرف مفتاح الوصول',
    tr: 'Erişim Anahtarı (Access Key)',
    zh: '访问密钥 ID (Access Key)',
    ru: 'Access Key ID',
  },
  secretKey: {
    fa: 'کلید امنیتی (Secret Key)',
    en: 'Secret Access Key',
    ar: 'المفتاح السري للوصول',
    tr: 'Gizli Anahtar (Secret Key)',
    zh: '安全密钥 (Secret Key)',
    ru: 'Secret Access Key',
  },
  bucketIdentifier: {
    fa: 'شناسه باکت',
    en: 'Bucket Identifier',
    ar: 'معرف الحاوية',
    tr: 'Paket Tanımlayıcı',
    zh: '存储桶名称',
    ru: 'Идентификатор бакета',
  },
  s3EndpointUrl: {
    fa: 'آدرس S3 Endpoint',
    en: 'S3 Endpoint URL',
    ar: 'عنوان نقطة نهاية S3',
    tr: 'S3 Uç Nokta URL',
    zh: 'S3 终端节点 URL',
    ru: 'URL эндпоинта S3',
  },
  clusterRegion: {
    fa: 'منطقه کلاستر',
    en: 'Cluster Region',
    ar: 'منطقة المجموعة',
    tr: 'Küme Bölgesi',
    zh: '集群区域',
    ru: 'Регион кластера',
  },
  rateMonthly: {
    fa: 'تعرفه ماهانه',
    en: 'Rate (Monthly)',
    ar: 'التكلفة الشهرية',
    tr: 'Aylık Ücret',
    zh: '月度资费',
    ru: 'Тариф (ежемесячно)',
  },
  action: {
    fa: 'عملیات',
    en: 'Action',
    ar: 'الإجراء',
    tr: 'İşlem',
    zh: '操作',
    ru: 'Действие',
  },
  credentials: {
    fa: 'اطلاعات اتصال',
    en: 'Credentials',
    ar: 'بيانات الاعتماد',
    tr: 'Kimlik Bilgileri',
    zh: '访问凭据',
    ru: 'Реквизиты доступа',
  },
  s3CredsDesc: {
    fa: 'از این اطلاعات برای اتصال AWS CLI، Rclone، S3cmd یا افزونه‌های بکاپ وردپرس استفاده نمایید.',
    en: 'Use these credentials to authenticate with AWS CLI, Rclone, S3cmd, or WordPress backup plugins.',
    ar: 'استخدم بيانات الاعتماد هذه للاتصال عبر AWS CLI أو Rclone أو S3cmd أو إضافات النسخ الاحتياطي.',
    tr: 'Bu kimlik bilgilerini AWS CLI, Rclone, S3cmd veya WordPress yedekleme eklentileriyle kullanın.',
    zh: '使用此凭据通过 AWS CLI、Rclone、S3cmd 或 WordPress 备份插件进行连接。',
    ru: 'Используйте эти данные для подключения через AWS CLI, Rclone, S3cmd или плагины бэкапа.',
  },
  awsCliExample: {
    fa: 'نمونه پیکربندی AWS CLI:',
    en: 'AWS CLI Configuration Example:',
    ar: 'مثال على تكوين AWS CLI:',
    tr: 'AWS CLI Yapılandırma Örneği:',
    zh: 'AWS CLI 配置示例:',
    ru: 'Пример конфигурации AWS CLI:',
  },

  // Quick Deposit Modal
  quickDepositDesc: {
    fa: 'افزایش آنی موجودی از طریق درگاه پرداخت بانکی / حالت شبیه‌ساز.',
    en: 'Instant wallet recharge via online gateway / sandbox demo.',
    ar: 'شحن فوري للمحفظة عبر بوابة الدفع الإلكتروني / الوضع التجريبي.',
    tr: 'Çevrimiçi ödeme / demo modu ile anında cüzdan yükleme.',
    zh: '通过在线网关 / 沙盒演示即时充值钱包。',
    ru: 'Мгновенное пополнение кошелька через онлайн-шлюз / демо-режим.',
  },
  selectPresetAmount: {
    fa: 'انتخاب مبالغ پیشنهادی:',
    en: 'Select Preset Amount:',
    ar: 'اختر المبلغ المقترح:',
    tr: 'Önceden Tanımlı Tutar Seçin:',
    zh: '选择预设充值金额:',
    ru: 'Выберите фиксированную сумму:',
  },
  totalDepositAmount: {
    fa: 'مبلغ قابل پرداخت:',
    en: 'Total Deposit Amount:',
    ar: 'إجمالي مبلغ الإيداع:',
    tr: 'Toplam Yatırılacak Tutar:',
    zh: '充值总额:',
    ru: 'Итого к пополнению:',
  },
  processing: {
    fa: 'در حال پردازش...',
    en: 'Processing...',
    ar: 'جاري المعالجة...',
    tr: 'İşleniyor...',
    zh: '处理中...',
    ru: 'Обработка...',
  },

  // Admin Back-Office
  'ArvanCloud Reseller': {
    fa: 'مدیریت نمایندگی ابر آروان',
    en: 'ArvanCloud Reseller',
    ar: 'لوحة موزع أروان كلاود',
    tr: 'ArvanCloud Bayi Paneli',
    zh: 'ArvanCloud 分销商管理中心',
    ru: 'Панель реселлера ArvanCloud',
  },
  'Settings & API': {
    fa: 'تنظیمات و ارتباط API',
    en: 'Settings & API',
    ar: 'الإعدادات والـ API',
    tr: 'Ayarlar ve API',
    zh: '系统设置与 API',
    ru: 'Настройки и API',
  },
  'Cloud Resources': {
    fa: 'منابع ابری و سرورها',
    en: 'Cloud Resources',
    ar: 'الموارد السحابية',
    tr: 'Bulut Kaynakları',
    zh: '云端资源监控',
    ru: 'Облачные ресурсы',
  },
  'Wallets & Ledger': {
    fa: 'کیف پول و دفترکل مالی',
    en: 'Wallets & Ledger',
    ar: 'المحافظ ودفتر الأستاذ',
    tr: 'Cüzdanlar ve Muhasebe',
    zh: '客户钱包与财务台账',
    ru: 'Кошельки и баланс',
  },
  '1. ArvanCloud API Authentication': {
    fa: '۱. احراز هویت API ابر آروان',
    en: '1. ArvanCloud API Authentication',
    ar: '١. مصادقة API أروان كلاود',
    tr: '1. ArvanCloud API Kimlik Doğrulaması',
    zh: '1. ArvanCloud API 认证配置',
    ru: '1. Авторизация ArvanCloud API',
  },
  'Enter your master ArvanCloud Machine User API Key. All downstream customer resources will be provisioned under this account.': {
    fa: 'کلید API کاربر ماشینی ابر آروان خود را وارد نمایید. کلیه سفارشات مشتریان بر روی این حساب مادر ایجاد می‌شوند.',
    en: 'Enter your master ArvanCloud Machine User API Key. All downstream customer resources will be provisioned under this account.',
    ar: 'أدخل مفتاح API لحساب Machine User الخاص بك. سيتم إنشاء جميع موارد العملاء ضمن هذا الحساب.',
    tr: 'Ana ArvanCloud Machine User API anahtarınızı girin. Tüm müşteri kaynakları bu hesap altında sağlanacaktır.',
    zh: '输入您的主 ArvanCloud Machine User API 密钥。所有下级客户资源都将在此母账号下开通。',
    ru: 'Введите главный API ключ Machine User ArvanCloud. Все ресурсы клиентов будут создаваться на этом аккаунте.',
  },
  'ArvanCloud API Key': {
    fa: 'کلید ارتباطی API ابر آروان',
    en: 'ArvanCloud API Key',
    ar: 'مفتاح API أروان كلاود',
    tr: 'ArvanCloud API Anahtarı',
    zh: 'ArvanCloud API 密钥',
    ru: 'Ключ ArvanCloud API',
  },
  'Test Connection': {
    fa: 'تست اتصال به API',
    en: 'Test Connection',
    ar: 'اختبار الاتصال',
    tr: 'Bağlantıyı Test Et',
    zh: '测试 API 连接',
    ru: 'Проверить соединение',
  },
  'Obtain your API Key from ArvanCloud User Panel > User Profile > API Keys / Machine Users.': {
    fa: 'کلید API را از پنل کاربری ابر آروان > پروفایل > کلیدهای API / کاربران ماشینی دریافت نمایید.',
    en: 'Obtain your API Key from ArvanCloud User Panel > User Profile > API Keys / Machine Users.',
    ar: 'احصل على مفتاح API من لوحة تحكم أروان كلاود > الملف الشخصي > مفاتيح API.',
    tr: 'API Anahtarınızı ArvanCloud Kullanıcı Paneli > Profil > API Anahtarları bölümünden alın.',
    zh: '从 ArvanCloud 用户控制台 > 个人资料 > API 密钥 / 机器用户 中获取您的 API 密钥。',
    ru: 'Получите API ключ в панели ArvanCloud > Профиль пользователя > API Keys.',
  },
  'Sandbox / Demo Mode': {
    fa: 'حالت آزمایشی (Sandbox / Demo)',
    en: 'Sandbox / Demo Mode',
    ar: 'الوضع التجريبي (Sandbox / Demo)',
    tr: 'Sandbox / Demo Modu',
    zh: '沙盒测试 / 演示模式 (Sandbox)',
    ru: 'Режим песочницы (Sandbox / Demo)',
  },
  'When enabled, allows instantaneous testing, mock provisioning, and demo top-ups without connecting to live ArvanCloud infrastructure.': {
    fa: 'در صورت فعال‌سازی، امکان تست آنی و شبیه‌سازی ساخت سرورها بدون اتصال به حساب تجاری آروان فراهم می‌شود.',
    en: 'When enabled, allows instantaneous testing, mock provisioning, and demo top-ups without connecting to live ArvanCloud infrastructure.',
    ar: 'عند التفعيل، يتيح الاختبار الفوري وإنشاء الخوادم التجريبية وعمليات الشحن دون الاتصال بالبنية الحية.',
    tr: 'Etkinleştirildiğinde, canlı altyapıya bağlanmadan anında test, sahte dağıtım ve demo bakiye yüklemelerine izin verir.',
    zh: '启用后，允许在不连接真实生产环境的情况下进行即时测试、模拟开通和演示充值。',
    ru: 'Позволяет тестировать создание серверов и платежи без подключения к живой инфраструктуре.',
  },
  '2. Dynamic Pricing & Reseller Markup Engine': {
    fa: '۲. موتور قیمت‌گذاری پویا و تعیین حاشیه سود',
    en: '2. Dynamic Pricing & Reseller Markup Engine',
    ar: '٢. محرك التسعير الديناميكي وهامش ربح الموزع',
    tr: '2. Dinamik Fiyatlandırma ve Bayi Kâr Marjı Motoru',
    zh: '2. 动态定价与分销商利润加价引擎',
    ru: '2. Модуль динамического ценообразования и наценки',
  },
  'Configure profit margins automatically calculated on top of wholesale ArvanCloud infrastructure rates.': {
    fa: 'تنظیم درصد و مبالغ سودی که به صورت خودکار به تعرفه‌های پایه ابر آروان اضافه می‌شود.',
    en: 'Configure profit margins automatically calculated on top of wholesale ArvanCloud infrastructure rates.',
    ar: 'تكوين هوامش الربح المحسوبة تلقائياً فوق أسعار الجملة لأروان كلاود.',
    tr: 'Toptan ArvanCloud altyapı oranlarının üzerine otomatik olarak hesaplanan kâr marjlarını yapılandırın.',
    zh: '设置自动计算在 ArvanCloud 批发成本之上的利润百分比与固定加价。',
    ru: 'Настройте торговую наценку, автоматически добавляемую к оптовым тарифам ArvanCloud.',
  },
  'Markup Percentage (%)': {
    fa: 'درصد سود نمایندگی (%)',
    en: 'Markup Percentage (%)',
    ar: 'نسبة هامش الربح (%)',
    tr: 'Kâr Marjı Yüzdesi (%)',
    zh: '加价百分比 (%)',
    ru: 'Процент наценки (%)',
  },
  'e.g. 20% markup turns wholesale 450 IRT/hr into 540 IRT/hr customer retail price.': {
    fa: 'برای مثال: سود ۲۰٪ هزینه عمده‌فروشی ۴۵۰ تومان را به ۵۴۰ تومان/ساعت تبدیل می‌کند.',
    en: 'e.g. 20% markup turns wholesale 450 IRT/hr into 540 IRT/hr customer retail price.',
    ar: 'مثال: هامش ربح ٢٠٪ يحول سعر الجملة ٤٥٠ تومان إلى ٥٤٠ تومان كسعر تجزئة للعميل.',
    tr: 'ör. %20 kâr marjı, 450 Toman toptan fiyatı müşteri için 540 Toman/saat perakende fiyatına dönüştürür.',
    zh: '例如：20% 加价将每小时 450 托曼的批发成本转化为 540 托曼的零售价。',
    ru: 'напр. Наценка 20% превращает оптовую цену 450 томан/час в 540 томан/час для клиента.',
  },
  'Fixed Margin Addition (Toman)': {
    fa: 'مبلغ ثابت افزوده (تومان)',
    en: 'Fixed Margin Addition (Toman)',
    ar: 'الهامش الثابت المضاف (تومان)',
    tr: 'Sabit Kâr İlavesi (Toman)',
    zh: '固定利润加价 (托曼)',
    ru: 'Фиксированная надбавка (Томан)',
  },
  'Optional fixed addition added after percentage markup calculation.': {
    fa: 'مبلغ ثابتی که پس از اعمال درصد سود به قیمت ساعتی اضافه می‌گردد.',
    en: 'Optional fixed addition added after percentage markup calculation.',
    ar: 'إضافة ثابتة اختيارية تتم إضافتها بعد حساب النسبة المئوية.',
    tr: 'Yüzde marjı hesaplamasından sonra eklenen isteğe bağlı sabit tutar.',
    zh: '在百分比加价计算之后额外累加的固定金额。',
    ru: 'Необязательная фиксированная надбавка, начисляемая после процентной наценки.',
  },
  'Store Currency': {
    fa: 'واحد پولی سامانه',
    en: 'Store Currency',
    ar: 'عملة المتجر',
    tr: 'Mağaza Para Birimi',
    zh: '商城结算货币',
    ru: 'Валюта магазина',
  },
  'Default Datacenter Region': {
    fa: 'دیتاسنتر پیش‌فرض',
    en: 'Default Datacenter Region',
    ar: 'مركز البيانات الافتراضي',
    tr: 'Varsayılan Veri Merkezi Bölgesi',
    zh: '默认数据中心区域',
    ru: 'Основной дата-центр',
  },
  '3. Storefront White-Label Branding': {
    fa: '۳. برندسازی و مشخصات پشتیبانی',
    en: '3. Storefront White-Label Branding',
    ar: '٣. العلامة التجارية البيضاء للمتجر',
    tr: '3. Mağaza Beyaz Etiket Markalama',
    zh: '3. 商城白标自定义品牌',
    ru: '3. Брендинг и контакты поддержки',
  },
  'Customization parameters injected into the standalone virtual canvas header and footer.': {
    fa: 'اطلاعاتی که در هدر، فوتر و بخش‌های اختصاصی فروشگاه سرور ابری نمایش داده می‌شوند.',
    en: 'Customization parameters injected into the standalone virtual canvas header and footer.',
    ar: 'معلمات التخصيص التي تظهر في ترويسة وتذييل المتجر الافتراضي المستقل.',
    tr: 'Bağımsız sanal tuval başlığına ve altbilgisine eklenen özelleştirme parametreleri.',
    zh: '注入到独立虚拟云商城页头与页脚的自定义品牌参数。',
    ru: 'Параметры кастомизации, отображаемые в шапке и подвале витрины.',
  },
  'Reseller Brand / Store Name': {
    fa: 'نام برند / عنوان فروشگاه',
    en: 'Reseller Brand / Store Name',
    ar: 'اسم العلامة التجارية للموزع / المتجر',
    tr: 'Bayi Markası / Mağaza Adı',
    zh: '分销商品牌 / 商城名称',
    ru: 'Название бренда / магазина',
  },
  'Support Contact Email': {
    fa: 'ایمیل پشتیبانی مشتریان',
    en: 'Support Contact Email',
    ar: 'بريد الدعم الفني',
    tr: 'Destek İletişim E-postası',
    zh: '客户服务与技术支持邮箱',
    ru: 'Email техподдержки',
  },
  'Support Phone Number': {
    fa: 'شماره تماس پشتیبانی',
    en: 'Support Phone Number',
    ar: 'رقم هاتف الدعم',
    tr: 'Destek Telefon Numarası',
    zh: '技术支持服务电话',
    ru: 'Телефон поддержки',
  },
  'Virtual Storefront Quick Links (Theme Isolated)': {
    fa: 'دسترسی سریع به صفحات فروشگاه ابری (ایزوله از پوسته)',
    en: 'Virtual Storefront Quick Links (Theme Isolated)',
    ar: 'روابط المتجر السحابي السريعة (معزول عن القالب)',
    tr: 'Sanal Mağaza Hızlı Bağlantıları (Temadan İzole)',
    zh: '虚拟云商城快捷入口 (独立主题隔离模式)',
    ru: 'Быстрый переход к витрине (изолированно от темы)',
  },
  'Save All Reseller Settings': {
    fa: 'ذخیره کلیه تنظیمات نمایندگی',
    en: 'Save All Reseller Settings',
    ar: 'حفظ جميع إعدادات الموزع',
    tr: 'Tüm Bayi Ayarlarını Kaydet',
    zh: '保存全部代理商设置',
    ru: 'Сохранить все настройки',
  },
  'All Provisioned Cloud Resources': {
    fa: 'کلیه منابع ابری ایجاد شده مشتریان',
    en: 'All Provisioned Cloud Resources',
    ar: 'جميع الموارد السحابية المنشأة',
    tr: 'Tüm Sağlanan Bulut Kaynakları',
    zh: '全部已开通的客户云端资源',
    ru: 'Все созданные облачные ресурсы',
  },
  'Master oversight and lifecycle controls across all customer cloud instances, domains, and buckets.': {
    fa: 'نظارت جامع، پایش مصرف و اعمال کنترل‌های اضطراری بر سرورها، دامنه‌ها و باکت‌های مشتریان.',
    en: 'Master oversight and lifecycle controls across all customer cloud instances, domains, and buckets.',
    ar: 'إشراف شامل وضوابط دورة الحياة لجميع خوادم العملاء ونطاقاتهم وحاوياتهم.',
    tr: 'Tüm müşteri bulut sunucuları, alan adları ve paketleri üzerinde genel denetim ve yaşam döngüsü kontrolleri.',
    zh: '对所有客户的云服务器、CDN 域名及 S3 存储桶进行统一全生命周期监管与应急控制。',
    ru: 'Полный мониторинг и управление жизненным циклом серверов, доменов и бакетов клиентов.',
  },
  'Run Metering Cycle Now': {
    fa: 'اجرای فوری چرخه محاسبه مصرف (Metering)',
    en: 'Run Metering Cycle Now',
    ar: 'تشغيل دورة الفوترة الآن',
    tr: 'Faturalandırma Döngüsünü Şimdi Çalıştır',
    zh: '立即执行按量计费结算',
    ru: 'Запустить биллинг-цикл сейчас',
  },
  'Total Cloud Instances': {
    fa: 'کل ماشین‌های مجازی',
    en: 'Total Cloud Instances',
    ar: 'إجمالي الخوادم السحابية',
    tr: 'Toplam Bulut Sunucu',
    zh: '云服务器实例总数',
    ru: 'Всего серверов',
  },
  'Active / Running': {
    fa: 'سرورهای فعال در حال اجرا',
    en: 'Active / Running',
    ar: 'نشط / قيد التشغيل',
    tr: 'Aktif / Çalışıyor',
    zh: '正常运行中',
    ru: 'Активных серверов',
  },
  'Suspended (0 Balance)': {
    fa: 'سرورهای معلق (موجودی صفر)',
    en: 'Suspended (0 Balance)',
    ar: 'معلق (رصيد صفر)',
    tr: 'Askıda (0 Bakiye)',
    zh: '欠费暂停 (余额为0)',
    ru: 'Приостановлено (нет средств)',
  },
  'Monthly Run Rate (MRR)': {
    fa: 'درآمد ناخالص ماهانه تخمینی (MRR)',
    en: 'Monthly Run Rate (MRR)',
    ar: 'الإيرادات الشهرية المقدرة (MRR)',
    tr: 'Aylık Tahmini Gelir (MRR)',
    zh: '预估月度经常性收入 (MRR)',
    ru: 'Ориентировочная выручка (MRR)',
  },
  'No resources deployed yet.': {
    fa: 'هنوز هیچ منبع ابری ایجاد نشده است.',
    en: 'No resources deployed yet.',
    ar: 'لم يتم إنشاء أي موارد بعد.',
    tr: 'Henüz dağıtılmış kaynak yok.',
    zh: '暂无开通的资源。',
    ru: 'Ресурсы еще не созданы.',
  },
  Customer: {
    fa: 'مشتری',
    en: 'Customer',
    ar: 'العميل',
    tr: 'Müşteri',
    zh: '所属客户',
    ru: 'Клиент',
  },
  'Resource Name': {
    fa: 'نام منبع',
    en: 'Resource Name',
    ar: 'اسم المورد',
    tr: 'Kaynak Adı',
    zh: '资源名称',
    ru: 'Имя ресурса',
  },
  Service: {
    fa: 'نوع سرویس',
    en: 'Service',
    ar: 'الخدمة',
    tr: 'Hizmet',
    zh: '服务类型',
    ru: 'Услуга',
  },
  'Arvan UUID / Identifier': {
    fa: 'شناسه اختصاصی آروان',
    en: 'Arvan UUID / Identifier',
    ar: 'معرف أروان UUID',
    tr: 'Arvan UUID / Tanımlayıcı',
    zh: 'Arvan UUID / 资源标识符',
    ru: 'Arvan UUID',
  },
  'Hourly Rate': {
    fa: 'تعرفه ساعتی',
    en: 'Hourly Rate',
    ar: 'التكلفة بالساعة',
    tr: 'Saatlik Ücret',
    zh: '每小时资费',
    ru: 'Тариф в час',
  },
  'Emergency Actions': {
    fa: 'کنترل‌های اضطراری',
    en: 'Emergency Actions',
    ar: 'إجراءات الطوارئ',
    tr: 'Acil Durum İşlemleri',
    zh: '管理应急操作',
    ru: 'Действия',
  },
  'Power Off': {
    fa: 'خاموش کردن',
    en: 'Power Off',
    ar: 'إيقاف التشغيل',
    tr: 'Kapat',
    zh: '强制关机',
    ru: 'Выключить',
  },
  Purge: {
    fa: 'حذف کامل',
    en: 'Purge',
    ar: 'حذف نهائي',
    tr: 'Tamamen Sil',
    zh: '彻底销毁',
    ru: 'Удалить',
  },
  'Are you sure you want to permanently delete this resource from ArvanCloud?': {
    fa: 'آیا از حذف دائمی این منبع از زیرساخت ابر آروان اطمینان دارید؟',
    en: 'Are you sure you want to permanently delete this resource from ArvanCloud?',
    ar: 'هل أنت متأكد من حذف هذا المورد نهائياً من بنية أروان كلاود؟',
    tr: 'Bu kaynağı ArvanCloud altyapısından kalıcı olarak silmek istediğinizden emin misiniz?',
    zh: '您确定要从 ArvanCloud 基础设施中永久删除此资源吗？',
    ru: 'Вы уверены, что хотите окончательно удалить этот ресурс из ArvanCloud?',
  },
  'Customer Wallets & Ledger Audit': {
    fa: 'دفترکل و حسابرسی کیف پول مشتریان',
    en: 'Customer Wallets & Ledger Audit',
    ar: 'محافظ العملاء وتدقيق دفتر الأستاذ',
    tr: 'Müşteri Cüzdanları ve Muhasebe Denetimi',
    zh: '客户钱包与原子财务台账审计',
    ru: 'Кошельки клиентов и аудит транзакций',
  },
  'Real-time atomic ledger oversight, balance snapshots, and manual balance adjustment tools.': {
    fa: 'نظارت اتمیک بر موجودی‌ها، تراکنش‌ها و ابزار دستی افزایش/کاهش موجودی کاربران.',
    en: 'Real-time atomic ledger oversight, balance snapshots, and manual balance adjustment tools.',
    ar: 'إشراف فوري على دفتر الأستاذ ولقطات الرصيد وأدوات تعديل الرصيد يدوياً.',
    tr: 'Gerçek zamanlı atomik defter denetimi, bakiye anlık görüntüleri ve manuel bakiye ayarlama araçları.',
    zh: '实时原子对账台账监管、余额快照以及管理员手动调账工具。',
    ru: 'Аудит реестра в реальном времени, снимки баланса и ручная корректировка счетов.',
  },
  'Total Active Wallets': {
    fa: 'تعداد کیف پول‌های فعال',
    en: 'Total Active Wallets',
    ar: 'إجمالي المحافظ النشطة',
    tr: 'Toplam Aktif Cüzdan',
    zh: '活跃钱包总数',
    ru: 'Всего активных кошельков',
  },
  'Total Outstanding Credit': {
    fa: 'مجموع بستانکاری مشتریان',
    en: 'Total Outstanding Credit',
    ar: 'إجمالي الرصيد الدائن للعملاء',
    tr: 'Toplam Müşteri Alacağı',
    zh: '客户未消耗总充值余额',
    ru: 'Общий баланс клиентов',
  },
  'Cumulative Deposits': {
    fa: 'مجموع کل واریزی‌ها',
    en: 'Cumulative Deposits',
    ar: 'إجمالي الإيداعات التراكمية',
    tr: 'Kümülatif Yatırımlar',
    zh: '累计入金总额',
    ru: 'Всего пополнений',
  },
  'Total Metered Burn': {
    fa: 'مجموع مصرف ساعتی محاسبه‌شده',
    en: 'Total Metered Burn',
    ar: 'إجمالي الاستهلاك المحتسب',
    tr: 'Toplam Faturalandırılan Tüketim',
    zh: '累计按量计费结算总额',
    ru: 'Всего списано биллингом',
  },
  'No customer wallets initialized yet.': {
    fa: 'هنوز کیف پولی ثبت نشده است.',
    en: 'No customer wallets initialized yet.',
    ar: 'لم يتم تهيئة محافظ للعملاء بعد.',
    tr: 'Henüz başlatılmış müşteri cüzdanı yok.',
    zh: '暂无已初始化的客户钱包。',
    ru: 'Кошельки клиентов пока не созданы.',
  },
  'Wallet ID': {
    fa: 'شناسه کیف پول',
    en: 'Wallet ID',
    ar: 'معرف المحفظة',
    tr: 'Cüzdan Kimliği',
    zh: '钱包 ID',
    ru: 'ID кошелька',
  },
  'Customer Name': {
    fa: 'نام کاربر',
    en: 'Customer Name',
    ar: 'اسم العميل',
    tr: 'Müşteri Adı',
    zh: '客户姓名',
    ru: 'Имя клиента',
  },
  Email: {
    fa: 'پست الکترونیک',
    en: 'Email',
    ar: 'البريد الإلكتروني',
    tr: 'E-posta',
    zh: '电子邮箱',
    ru: 'Email',
  },
  'Hourly Burn Rate': {
    fa: 'نرخ مصرف ساعتی',
    en: 'Hourly Burn Rate',
    ar: 'معدل الاستهلاك بالساعة',
    tr: 'Saatlik Tüketim Oranı',
    zh: '每小时扣费速率',
    ru: 'Расход в час',
  },
  'Created At': {
    fa: 'تاریخ ایجاد',
    en: 'Created At',
    ar: 'تاريخ الإنشاء',
    tr: 'Oluşturulma Tarihi',
    zh: '注册时间',
    ru: 'Дата создания',
  },
  'Ledger Actions': {
    fa: 'عملیات مالی',
    en: 'Ledger Actions',
    ar: 'إجراءات الدفتر',
    tr: 'Defter İşlemleri',
    zh: '财务操作',
    ru: 'Финансовые действия',
  },
  'Adjust Balance': {
    fa: 'تغییر موجودی',
    en: 'Adjust Balance',
    ar: 'تعديل الرصيد',
    tr: 'Bakiye Ayarla',
    zh: '调整余额',
    ru: 'Изменить баланс',
  },
  'Manual Ledger Adjustment': {
    fa: 'تعدیل دستی موجودی کیف پول',
    en: 'Manual Ledger Adjustment',
    ar: 'تعديل رصيد المحفظة يدوياً',
    tr: 'Manuel Cüzdan Bakiyesi Düzeltmesi',
    zh: '管理员手动调账',
    ru: 'Ручная корректировка баланса',
  },
  'Adjustment Type:': {
    fa: 'نوع عملیات مالی:',
    en: 'Adjustment Type:',
    ar: 'نوع العملية:',
    tr: 'İşlem Türü:',
    zh: '调账类型:',
    ru: 'Тип операции:',
  },
  'Credit (+ Deposit Funds)': {
    fa: 'بستانکار (+ افزایش موجودی)',
    en: 'Credit (+ Deposit Funds)',
    ar: 'دائن (+ إضافة رصيد)',
    tr: 'Alacak (+ Bakiye Ekle)',
    zh: '入账 (+ 增加余额)',
    ru: 'Начисление (+ Пополнить)',
  },
  'Debit (- Deduct Funds)': {
    fa: 'بدهکار (- کسر از موجودی)',
    en: 'Debit (- Deduct Funds)',
    ar: 'مدين (- خصم رصيد)',
    tr: 'Borç (- Bakiye Düş)',
    zh: '扣款 (- 扣减余额)',
    ru: 'Списание (- Списать)',
  },
  'Amount (Toman):': {
    fa: 'مبلغ تعدیل (تومان):',
    en: 'Amount (Toman):',
    ar: 'المبلغ (تومان):',
    tr: 'Tutar (Toman):',
    zh: '金额 (托曼):',
    ru: 'Сумма (Томан):',
  },
  'Reason / Audit Note:': {
    fa: 'دلیل / یادداشت حسابرسی:',
    en: 'Reason / Audit Note:',
    ar: 'السبب / ملاحظة التدقيق:',
    tr: 'Neden / Denetim Notu:',
    zh: '调账原因 / 审计备注:',
    ru: 'Причина / Примечание:',
  },
  'Apply Adjustment': {
    fa: 'ثبت تراکنش در دفترکل',
    en: 'Apply Adjustment',
    ar: 'تطبيق التعديل',
    tr: 'Düzeltmeyi Uygula',
    zh: '提交并记入台账',
    ru: 'Применить корректировку',
  },
  Cancel: {
    fa: 'انصراف',
    en: 'Cancel',
    ar: 'إلغاء',
    tr: 'İptal',
    zh: '取消',
    ru: 'Отмена',
  },
  'Connected successfully to ArvanCloud infrastructure.': {
    fa: 'اتصال به زیرساخت ابر آروان با موفقیت برقرار شد.',
    en: 'Connected successfully to ArvanCloud infrastructure.',
    ar: 'تم الاتصال بالبنية التحتية لـ آروان كلاود بنجاح.',
    tr: 'ArvanCloud altyapısına başarıyla bağlanıldı.',
    zh: '已成功连接至 ArvanCloud 云基础设施。',
    ru: 'Успешное подключение к инфраструктуре ArvanCloud.',
  },
  'All Cloud Datacenter Regions Operational (99.99% SLA)': {
    fa: 'تمامی دیتاسنترها و مناطق ابری فعال هستند (SLA ۹۹.۹۹٪)',
    en: 'All Cloud Datacenter Regions Operational (99.99% SLA)',
    ar: 'جميع مناطق مراكز البيانات السحابية تعمل بشكل طبيعي (SLA 99.99%)',
    tr: 'Tüm Bulut Veri Merkezi Bölgeleri Çalışıyor (%99,99 SLA)',
    zh: '所有云数据中心区域正常运行中 (99.99% SLA 保证)',
    ru: 'Все дата-центры и облачные регионы работают штатно (SLA 99.99%)',
  },
  'Powered by ArvanCloud Infrastructure Reseller Engine': {
    fa: 'طراحی‌شده با موتور نمایندگی زیرساخت ابری ابر آروان',
    en: 'Powered by ArvanCloud Infrastructure Reseller Engine',
    ar: 'مدعوم بمحرك موزع البنية التحتية لأروان كلاود',
    tr: 'ArvanCloud Altyapı Bayi Motoru ile Güçlendirilmiştir',
    zh: '由 ArvanCloud 云基础设施转售引擎提供支持',
    ru: 'Работает на базе платформы реселлера инфраструктуры ArvanCloud',
  },
  'Enterprise Multi-Tenant Infrastructure Management & Monetization': {
    fa: 'مدیریت زیرساخت چندمستأجری و کسب درآمد نمایندگی ابری',
    en: 'Enterprise Multi-Tenant Infrastructure Management & Monetization',
    ar: 'إدارة البنية التحتية متعددة المستأجرين وتحقيق الدخل',
    tr: 'Kurumsal Çok Kiracılı Altyapı Yönetimi ve Para Kazanma',
    zh: '企业级多租户基础设施管理与转售盈利平台',
    ru: 'Корпоративное управление мультитенантной инфраструктурой и монетизация',
  },
  connectedSuccessfully: {
    fa: 'اتصال به زیرساخت ابر آروان با موفقیت برقرار شد.',
    en: 'Connected successfully to ArvanCloud infrastructure.',
    ar: 'تم الاتصال بالبنية التحتية لأروان كلاود بنجاح.',
    tr: 'ArvanCloud altyapısına başarıyla bağlanıldı.',
    zh: '已成功连接至 ArvanCloud 基础设施。',
    ru: 'Соединение с инфраструктурой ArvanCloud успешно установлено.',
  },
  connectionFailed: {
    fa: 'برقراری ارتباط با زیرساخت ابر آروان ناموفق بود.',
    en: 'Connection to ArvanCloud infrastructure failed.',
    ar: 'فشل الاتصال بالبنية التحتية لأروان كلاود.',
    tr: 'ArvanCloud altyapısına bağlantı başarısız oldu.',
    zh: '连接 ArvanCloud 基础设施失败。',
    ru: 'Ошибка подключения к инфраструктуре ArvanCloud.',
  },
  activeMockFallback: {
    fa: 'فعال (شبیه‌ساز آزمایشی)',
    en: 'Active (Mock Fallback)',
    ar: 'نشط (وضع تجريبي)',
    tr: 'Aktif (Demo Modu)',
    zh: '已激活 (沙盒模拟)',
    ru: 'Активен (Демо-режим)',
  },
  liveInfrastructureOnly: {
    fa: 'فقط زیرساخت تجاری لایو',
    en: 'Live Infrastructure Only',
    ar: 'البنية التحتية الحية فقط',
    tr: 'Yalnızca Canlı Altyapı',
    zh: '仅真实生产环境',
    ru: 'Только живая инфраструктура',
  },
  searchResourcesPlaceholder: {
    fa: 'جستجو بر اساس نام مشتری، نام سرور یا شناسه آروان...',
    en: 'Search by customer, resource name, or Arvan UUID...',
    ar: 'البحث عن طريق العميل أو اسم الخادم أو UUID...',
    tr: 'Müşteri, kaynak adı veya Arvan UUID ile arayın...',
    zh: '按客户、资源名称或 Arvan UUID 搜索...',
    ru: 'Поиск по клиенту, имени сервера или Arvan UUID...',
  },
  searchWalletsPlaceholder: {
    fa: 'جستجو بر اساس نام، ایمیل یا شناسه مشتری...',
    en: 'Search by customer name, email, or user ID...',
    ar: 'البحث عن طريق اسم العميل أو البريد أو المعرف...',
    tr: 'Müşteri adı, e-posta veya kullanıcı kimliği ile arayın...',
    zh: '按客户姓名、邮箱或用户ID搜索...',
    ru: 'Поиск по имени клиента, email или ID пользователя...',
  },
  adjustBalanceDesc: {
    fa: 'تعدیل دستی بستانکاری یا بدهکاری کاربر. رکورد تغییرات به صورت تغییرناپذیر در دفترکل ثبت می‌شود.',
    en: 'Directly debit or credit customer balance. An immutable audit record will be logged.',
    ar: 'خصم أو إضافة رصيد للعميل مباشرة مع تسجيل قيد دائم في دفتر الأستاذ.',
    tr: 'Müşteri bakiyesini doğrudan borçlandırın veya alacaklandırın. Değiştirilemez denetim kaydı tutulur.',
    zh: '直接对客户余额进行增加或扣减，系统将记录不可篡改的审计日志。',
    ru: 'Прямое списание или начисление на баланс клиента с внесением неизменяемой записи в реестр.',
  },
  adjustReasonPlaceholder: {
    fa: 'مثال: شارژ اهدایی پشتیبانی / اصلاح دستی',
    en: 'e.g. Compensation credit / Manual topup',
    ar: 'مثال: تعويض دعم فني / شحن يدوي',
    tr: 'ör. Destek telafisi / Manuel yükleme',
    zh: '例如：工单补偿 / 人工手动充值',
    ru: 'напр. Компенсация техподдержки / Ручное пополнение',
  },
  manualAdjustmentDefaultReason: {
    fa: 'تعدیل دستی توسط مدیر سامانه',
    en: 'Manual administrative adjustment',
    ar: 'تعديل إداري يدوي',
    tr: 'Manuel yönetici düzeltmesi',
    zh: '管理员手动调账',
    ru: 'Ручная корректировка администратора',
  },
  all: {
    fa: 'همه',
    en: 'All',
    ar: 'الكل',
    tr: 'Tümü',
    zh: '全部',
    ru: 'Все',
  },
  active: {
    fa: 'فعال',
    en: 'Active',
    ar: 'نشط',
    tr: 'Aktif',
    zh: '活跃',
    ru: 'Активен',
  },
  serverConfiguratorLink: {
    fa: '🚀 سفارش سرور ابری',
    en: '🚀 Server Configurator',
    ar: '🚀 تهيئة الخادم السحابي',
    tr: '🚀 Sunucu Yapılandırıcısı',
    zh: '🚀 云服务器配置中心',
    ru: '🚀 Конфигуратор серверов',
  },
  customerDashboardLink: {
    fa: '📊 داشبورد مشتری',
    en: '📊 Customer Dashboard',
    ar: '📊 لوحة تحكم العميل',
    tr: '📊 Müşteri Paneli',
    zh: '📊 客户控制台',
    ru: '📊 Панель клиента',
  },
  cdnManagerLink: {
    fa: '🌐 مدیریت CDN و DNS',
    en: '🌐 CDN & DNS Manager',
    ar: '🌐 إدارة CDN و DNS',
    tr: '🌐 CDN ve DNS Yöneticisi',
    zh: '🌐 CDN与DNS管理',
    ru: '🌐 Управление CDN и DNS',
  },
  s3StorageLink: {
    fa: '📦 ذخیره‌سازی S3',
    en: '📦 S3 Object Storage',
    ar: '📦 تخزين الكائنات S3',
    tr: '📦 S3 Nesne Depolama',
    zh: '📦 S3 对象存储',
    ru: '📦 Объектное хранилище S3',
  },
  'Action completed successfully.': {
    fa: 'عملیات با موفقیت انجام شد.',
    en: 'Action completed successfully.',
    ar: 'تم تنفيذ العملية بنجاح.',
    tr: 'İşlem başarıyla tamamlandı.',
    zh: '操作成功完成。',
    ru: 'Действие успешно выполнено.',
  },
  'Manual metering cycle completed.': {
    fa: 'چرخه محاسبه مصرف ساعتی با موفقیت انجام شد.',
    en: 'Manual metering cycle completed.',
    ar: 'تم اكتمال دورة احتساب الاستهلاك بنجاح.',
    tr: 'Manuel faturalandırma döngüsü tamamlandı.',
    zh: '按量计费结算周期已手动执行完毕。',
    ru: 'Цикл расчета биллинга успешно завершен.',
  },
  'Instance purged by administrator.': {
    fa: 'سرور توسط مدیر سامانه به طور کامل حذف شد.',
    en: 'Instance purged by administrator.',
    ar: 'تم حذف الخادم نهائياً بواسطة المسؤول.',
    tr: 'Sunucu yönetici tarafından tamamen silindi.',
    zh: '云主机已被管理员彻底删除。',
    ru: 'Сервер безвозвратно удален администратором.',
  },
  'Instance powered off by administrator.': {
    fa: 'سرور توسط مدیر سامانه خاموش شد.',
    en: 'Instance powered off by administrator.',
    ar: 'تم إيقاف تشغيل الخادم بواسطة المسؤول.',
    tr: 'Sunucu yönetici tarafından kapatıldı.',
    zh: '云主机已被管理员关机。',
    ru: 'Сервер выключен администратором.',
  },
  'Balance adjusted successfully.': {
    fa: 'موجودی کیف پول با موفقیت تغییر یافت.',
    en: 'Balance adjusted successfully.',
    ar: 'تم تعديل الرصيد بنجاح.',
    tr: 'Bakiye başarıyla güncellendi.',
    zh: '钱包余额调整成功。',
    ru: 'Баланс успешно обновлен.',
  },
  'Failed to deploy server.': {
    fa: 'خطا در ساخت سرور ابری.',
    en: 'Failed to deploy server.',
    ar: 'فشل في إنشاء الخادم السحابي.',
    tr: 'Sunucu dağıtımı başarısız oldu.',
    zh: '创建云服务器失败。',
    ru: 'Не удалось развернуть сервер.',
  },
};

// 1. Generate src/i18n/index.ts
function generateTsIndex() {
  const languages = ['fa', 'en', 'ar', 'tr', 'zh', 'ru'];
  let code = `import { SupportedLanguage } from '../types';

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

export const DICTIONARIES: Record<SupportedLanguage, Record<string, string>> = {
`;

  for (const lang of languages) {
    code += `  ${lang}: {\n`;
    for (const [key, map] of Object.entries(ALL_TRANSLATIONS)) {
      const val = map[lang] || map['en'] || key;
      const formattedKey = /^[a-zA-Z0-9_]+$/.test(key) ? key : JSON.stringify(key);
      code += `    ${formattedKey}: ${JSON.stringify(val)},\n`;
    }
    code += `  },\n`;
  }

  code += `};

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

  const targetPath = path.join(ROOT_DIR, 'src', 'i18n', 'index.ts');
  fs.writeFileSync(targetPath, code, 'utf8');
  console.log(`Updated ${targetPath} successfully.`);
}

// 2. Generate includes/class-arv-seller-i18n.php
function generatePhpClass() {
  const phpPath = path.join(ROOT_DIR, 'includes', 'class-arv-seller-i18n.php');
  const languages = ['fa', 'en', 'ar', 'tr', 'zh', 'ru'];

  let dictArrayPhp = `\t/**
\t * Complete Multi-Language Dictionary Matrix.
\t */
\tconst DICTIONARIES = array(
`;

  for (const lang of languages) {
    dictArrayPhp += `\t\t'${lang}' => array(\n`;
    for (const [key, map] of Object.entries(ALL_TRANSLATIONS)) {
      const val = map[lang] || map['en'] || key;
      dictArrayPhp += `\t\t\t'${key.replace(/'/g, "\\'")}' => '${val.replace(/'/g, "\\'")}',\n`;
    }
    dictArrayPhp += `\t\t),\n`;
  }
  dictArrayPhp += `\t);\n`;

  const phpTemplate = `<?php
/**
 * Define the multi-language internationalization functionality.
 *
 * Provides runtime translation dictionaries and language switching support for:
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

${dictArrayPhp}
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
\t * with optional explicit query parameter override.
\t */
\tpublic static function resolve_active_language() {
\t\t// Synchronize directly with WordPress Site Language (determine_locale / get_user_locale / get_locale)
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
\t\t\t// Fallback: check if site is RTL or LTR
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

\t\tif ( isset( $dict[ $text ] ) ) {
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

  fs.writeFileSync(phpPath, phpTemplate, 'utf8');
  console.log(`Updated ${phpPath} successfully.`);
}

generateTsIndex();
generatePhpClass();
console.log(`Completed synchronizing ${Object.keys(ALL_TRANSLATIONS).length} keys across all 6 languages.`);
