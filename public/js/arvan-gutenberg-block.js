/**
 * WordPress Gutenberg Native Block Editor Integration for ArvanCloud Reseller
 * Includes full customization controls: Colors, Typography, Layout, Corner Radius, Persian Digits, and Texts.
 */
(function (wp) {
  const { registerBlockType } = wp.blocks;
  const { createElement: el } = wp.element;
  const { InspectorControls } = wp.blockEditor || wp.editor;
  const { PanelBody, SelectControl, TextControl, TextareaControl, RangeControl, ToggleControl } = wp.components;

  const blockData = window.arvanBlockData || {
    regions: [
      { label: 'Tehran - Forough (ir-thr-c2)', value: 'ir-thr-c2' },
      { label: 'Tehran - Shahryar (ir-thr-sh1)', value: 'ir-thr-sh1' },
      { label: 'Tabriz - Northwest (ir-tbz-dc1)', value: 'ir-tbz-dc1' },
    ],
    flavors: [
      { label: 'Starter Eco (1 vCPU / 2 GB)', value: 'g1-1-2' },
      { label: 'Standard General (2 vCPU / 4 GB - Popular)', value: 'g1-2-4' },
      { label: 'Performance Pro (4 vCPU / 8 GB)', value: 'g1-4-8' },
      { label: 'Enterprise Ultra (8 vCPU / 16 GB)', value: 'g1-8-16' },
      { label: 'Compute Master (4 vCPU / 4 GB)', value: 'c1-4-4' },
      { label: 'Memory Master (2 vCPU / 8 GB)', value: 'm1-2-8' },
    ],
    images: [
      { label: 'Ubuntu 22.04 LTS (Recommended)', value: 'ubuntu-22.04' },
      { label: 'Ubuntu 24.04 LTS', value: 'ubuntu-24.04' },
      { label: 'Debian 12 Bookworm', value: 'debian-12' },
      { label: 'AlmaLinux 9 Enterprise', value: 'almalinux-9' },
      { label: 'Windows Server 2022 Standard', value: 'windows-2022' },
    ],
    fontFamilies: [
      { label: 'وزیرمتن (Vazirmatn - Standard)', value: 'vazirmatn' },
      { label: 'ساحل (Sahel)', value: 'sahel' },
      { label: 'صمیم (Samim)', value: 'samim' },
      { label: 'شبنم (Shabnam)', value: 'shabnam' },
      { label: 'Plus Jakarta Sans (Modern Latin)', value: 'jakarta' },
      { label: 'Inter (Clean Technical)', value: 'inter' },
      { label: 'System Default UI', value: 'system' },
    ],
    containerWidths: [
      { label: 'Boxed (1024px)', value: 'boxed' },
      { label: 'Standard (1200px - Recommended)', value: 'standard' },
      { label: 'Wide Screen (1400px)', value: 'wide' },
      { label: 'Full Width Fluid (100%)', value: 'fluid' },
    ],
    spacingDensities: [
      { label: 'Compact / Tight Padding', value: 'compact' },
      { label: 'Normal / Standard Balanced', value: 'normal' },
      { label: 'Spacious / Relaxed Air', value: 'spacious' },
    ],
    cardElevations: [
      { label: 'Flat (No Shadow)', value: 'none' },
      { label: 'Subtle (Clean Soft Shadow)', value: 'subtle' },
      { label: 'Elevated (Modern 3D Shadow)', value: 'elevated' },
      { label: 'Brand Neon Glow', value: 'glow' },
    ],
    defaultRegion: 'ir-thr-c2',
    primaryColor: '#008b8b',
    secondaryColor: '#0b3a42',
    colorSurface: '#ffffff',
    colorBackground: '#f8fafc',
    colorText: '#0f172a',
    colorBorder: '#e2e8f0',
    borderRadius: 16,
    baseFontSize: 14,
    persianDigits: true,
    storeName: 'ArvanCloud Reseller',
    i18n: {
      title: 'ArvanCloud Server Configurator',
      description: 'Interactive Cloud Server sizing, pricing calculator, and deployment widget with full customization.',
      dashboardTitle: 'ArvanCloud Customer Dashboard',
      dashboardDesc: 'Customer cloud server management and wallet billing dashboard.',
      panelDefaults: 'Default Pre-Selections',
      panelLayout: 'Layout, Radius & Elevation',
      panelColors: 'Brand Colors & Surfaces',
      panelTypography: 'Typography & Persian Digits',
      panelBranding: 'Text & Copywriting Overrides',
      panelCustomCss: 'Custom CSS Overrides',
      selectRegion: 'Default Datacenter Region',
      selectFlavor: 'Default Hardware Flavor',
      selectImage: 'Default OS Distribution',
      selectDisk: 'Initial Extra NVMe Disk (GB)',
      showHeader: 'Show Header Banner',
      showRegion: 'Show Region Selector',
      showStorage: 'Show Storage Slider',
      showOs: 'Show OS Selector',
      showHourlyPrice: 'Show Hourly & Monthly Rates',
      containerWidth: 'Container Max Width',
      spacingDensity: 'Spacing Density',
      borderRadius: 'Corner Border Radius (px)',
      cardElevation: 'Card Elevation & Shadows',
      accentColor: 'Primary Brand Color',
      secondaryColor: 'Secondary / Dark Accent',
      colorSurface: 'Card & Surface Background',
      colorBackground: 'App Canvas Background',
      colorText: 'Primary Text Color',
      colorBorder: 'Border Color',
      fontFamily: 'Font Family Stack',
      baseFontSize: 'Base Font Size (px)',
      persianDigits: 'Convert Digits to Persian (۰-۹)',
      ctaText: 'CTA Button Text',
      customTitle: 'Custom Header Title',
      customTagline: 'Custom Subtitle / Tagline',
      dashboardTitleText: 'Dashboard Header Title',
      dashboardDescText: 'Dashboard Description',
      walletTitleText: 'Wallet Section Title',
      customCssText: 'Custom CSS Code',
      previewNotice: 'Live interactive ArvanCloud Server Configurator will render here on the frontend.',
      previewSubtitle: 'Instant VM Provisioning • NVMe Storage • Pay-As-You-Go',
    },
  };

  const FLAVORS = blockData.flavors || [
    { label: 'Starter Eco (1 vCPU / 2 GB)', value: 'g1-1-2' },
    { label: 'Standard General (2 vCPU / 4 GB)', value: 'g1-2-4' },
    { label: 'Performance Pro (4 vCPU / 8 GB)', value: 'g1-4-8' },
    { label: 'Enterprise Ultra (8 vCPU / 16 GB)', value: 'g1-8-16' },
    { label: 'Compute Master (4 vCPU / 4 GB)', value: 'c1-4-4' },
    { label: 'Memory Master (2 vCPU / 8 GB)', value: 'm1-2-8' },
  ];

  const IMAGES = blockData.images || [
    { label: 'Ubuntu 22.04 LTS (Recommended)', value: 'ubuntu-22.04' },
    { label: 'Ubuntu 24.04 LTS', value: 'ubuntu-24.04' },
    { label: 'Debian 12 Bookworm', value: 'debian-12' },
    { label: 'AlmaLinux 9 Enterprise', value: 'almalinux-9' },
    { label: 'Windows Server 2022 Standard', value: 'windows-2022' },
  ];

  const FONTS = blockData.fontFamilies || [
    { label: 'وزیرمتن (Vazirmatn - Standard)', value: 'vazirmatn' },
    { label: 'ساحل (Sahel)', value: 'sahel' },
    { label: 'صمیم (Samim)', value: 'samim' },
    { label: 'شبنم (Shabnam)', value: 'shabnam' },
    { label: 'Plus Jakarta Sans', value: 'jakarta' },
    { label: 'Inter', value: 'inter' },
    { label: 'System UI', value: 'system' },
  ];

  const CONTAINER_WIDTHS = blockData.containerWidths || [
    { label: 'Boxed (1024px)', value: 'boxed' },
    { label: 'Standard (1200px)', value: 'standard' },
    { label: 'Wide Screen (1400px)', value: 'wide' },
    { label: 'Full Width Fluid (100%)', value: 'fluid' },
  ];

  const SPACING_DENSITIES = blockData.spacingDensities || [
    { label: 'Compact / Tight', value: 'compact' },
    { label: 'Normal / Standard', value: 'normal' },
    { label: 'Spacious / Relaxed', value: 'spacious' },
  ];

  const CARD_ELEVATIONS = blockData.cardElevations || [
    { label: 'Flat (No Shadow)', value: 'none' },
    { label: 'Subtle', value: 'subtle' },
    { label: 'Elevated', value: 'elevated' },
    { label: 'Brand Neon Glow', value: 'glow' },
  ];

  // ── 1. Register Server Configurator Block ──────────────────────────────────
  registerBlockType('arvan/server-configurator', {
    title: blockData.i18n.title,
    description: blockData.i18n.description,
    icon: 'cloud',
    category: 'arvan-cloud',
    keywords: ['arvan', 'cloud', 'server', 'vps', 'iaas', 'hosting', 'calculator'],
    attributes: {
      defaultRegion: { type: 'string', default: blockData.defaultRegion || 'ir-thr-c2' },
      defaultFlavor: { type: 'string', default: 'g1-2-4' },
      defaultImage: { type: 'string', default: 'ubuntu-22.04' },
      defaultDisk: { type: 'number', default: 40 },
      accentColor: { type: 'string', default: blockData.primaryColor || '#008b8b' },
      secondaryColor: { type: 'string', default: blockData.secondaryColor || '#0b3a42' },
      colorSurface: { type: 'string', default: blockData.colorSurface || '#ffffff' },
      colorBackground: { type: 'string', default: blockData.colorBackground || '#f8fafc' },
      colorText: { type: 'string', default: blockData.colorText || '#0f172a' },
      colorBorder: { type: 'string', default: blockData.colorBorder || '#e2e8f0' },
      borderRadius: { type: 'number', default: blockData.borderRadius || 16 },
      cardElevation: { type: 'string', default: 'subtle' },
      spacingDensity: { type: 'string', default: 'normal' },
      containerWidth: { type: 'string', default: 'standard' },
      fontFamily: { type: 'string', default: 'vazirmatn' },
      baseFontSize: { type: 'number', default: 14 },
      persianDigits: { type: 'boolean', default: true },
      ctaText: { type: 'string', default: '' },
      customTitle: { type: 'string', default: '' },
      customTagline: { type: 'string', default: '' },
      showHeader: { type: 'boolean', default: true },
      showRegionSelector: { type: 'boolean', default: true },
      showStorageSlider: { type: 'boolean', default: true },
      showOsSelector: { type: 'boolean', default: true },
      showHourlyPrice: { type: 'boolean', default: true },
      customCss: { type: 'string', default: '' },
    },

    edit: function (props) {
      const { attributes, setAttributes } = props;
      const accent = attributes.accentColor || '#008b8b';
      const radius = attributes.borderRadius !== undefined ? attributes.borderRadius : 16;

      return el(
        'div',
        { className: 'arvan-gutenberg-block-preview' },
        el(
          InspectorControls,
          {},
          // Panel 1: Pre-Selections
          el(
            PanelBody,
            { title: blockData.i18n.panelDefaults || 'Default Pre-Selections', initialOpen: true },
            el(SelectControl, {
              label: blockData.i18n.selectRegion || 'Default Datacenter Region',
              value: attributes.defaultRegion,
              options: blockData.regions,
              onChange: (val) => setAttributes({ defaultRegion: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.selectFlavor || 'Default Hardware Flavor',
              value: attributes.defaultFlavor,
              options: FLAVORS,
              onChange: (val) => setAttributes({ defaultFlavor: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.selectImage || 'Default OS Distribution',
              value: attributes.defaultImage,
              options: IMAGES,
              onChange: (val) => setAttributes({ defaultImage: val }),
            }),
            el(RangeControl, {
              label: blockData.i18n.selectDisk || 'Initial Extra NVMe Disk (GB)',
              value: attributes.defaultDisk,
              min: 25,
              max: 500,
              step: 5,
              onChange: (val) => setAttributes({ defaultDisk: val }),
            })
          ),

          // Panel 2: Layout, Radius & Elevation
          el(
            PanelBody,
            { title: blockData.i18n.panelLayout || 'Layout, Radius & Elevation', initialOpen: false },
            el(ToggleControl, {
              label: blockData.i18n.showHeader || 'Show Header Banner',
              checked: attributes.showHeader,
              onChange: (val) => setAttributes({ showHeader: val }),
            }),
            el(ToggleControl, {
              label: blockData.i18n.showRegion || 'Show Region Selector',
              checked: attributes.showRegionSelector,
              onChange: (val) => setAttributes({ showRegionSelector: val }),
            }),
            el(ToggleControl, {
              label: blockData.i18n.showStorage || 'Show Storage Slider',
              checked: attributes.showStorageSlider,
              onChange: (val) => setAttributes({ showStorageSlider: val }),
            }),
            el(ToggleControl, {
              label: blockData.i18n.showOs || 'Show OS Selector',
              checked: attributes.showOsSelector,
              onChange: (val) => setAttributes({ showOsSelector: val }),
            }),
            el(ToggleControl, {
              label: blockData.i18n.showHourlyPrice || 'Show Hourly & Monthly Rates',
              checked: attributes.showHourlyPrice,
              onChange: (val) => setAttributes({ showHourlyPrice: val }),
            }),
            el(RangeControl, {
              label: blockData.i18n.borderRadius || 'Corner Border Radius (px)',
              value: attributes.borderRadius,
              min: 0,
              max: 32,
              step: 2,
              onChange: (val) => setAttributes({ borderRadius: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.cardElevation || 'Card Elevation & Shadows',
              value: attributes.cardElevation,
              options: CARD_ELEVATIONS,
              onChange: (val) => setAttributes({ cardElevation: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.containerWidth || 'Container Max Width',
              value: attributes.containerWidth,
              options: CONTAINER_WIDTHS,
              onChange: (val) => setAttributes({ containerWidth: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.spacingDensity || 'Spacing Density',
              value: attributes.spacingDensity,
              options: SPACING_DENSITIES,
              onChange: (val) => setAttributes({ spacingDensity: val }),
            })
          ),

          // Panel 3: Brand Colors & Surfaces
          el(
            PanelBody,
            { title: blockData.i18n.panelColors || 'Brand Colors & Surfaces', initialOpen: false },
            el(TextControl, {
              label: blockData.i18n.accentColor || 'Primary Brand Color',
              value: attributes.accentColor,
              placeholder: '#008b8b',
              onChange: (val) => setAttributes({ accentColor: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.secondaryColor || 'Secondary / Dark Accent',
              value: attributes.secondaryColor,
              placeholder: '#0b3a42',
              onChange: (val) => setAttributes({ secondaryColor: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorSurface || 'Card & Surface Background',
              value: attributes.colorSurface,
              placeholder: '#ffffff',
              onChange: (val) => setAttributes({ colorSurface: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorBackground || 'App Canvas Background',
              value: attributes.colorBackground,
              placeholder: '#f8fafc',
              onChange: (val) => setAttributes({ colorBackground: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorText || 'Primary Text Color',
              value: attributes.colorText,
              placeholder: '#0f172a',
              onChange: (val) => setAttributes({ colorText: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorBorder || 'Border Color',
              value: attributes.colorBorder,
              placeholder: '#e2e8f0',
              onChange: (val) => setAttributes({ colorBorder: val }),
            })
          ),

          // Panel 4: Typography & Persian Digits
          el(
            PanelBody,
            { title: blockData.i18n.panelTypography || 'Typography & Persian Digits', initialOpen: false },
            el(SelectControl, {
              label: blockData.i18n.fontFamily || 'Font Family Stack',
              value: attributes.fontFamily,
              options: FONTS,
              onChange: (val) => setAttributes({ fontFamily: val }),
            }),
            el(RangeControl, {
              label: blockData.i18n.baseFontSize || 'Base Font Size (px)',
              value: attributes.baseFontSize,
              min: 12,
              max: 20,
              step: 1,
              onChange: (val) => setAttributes({ baseFontSize: val }),
            }),
            el(ToggleControl, {
              label: blockData.i18n.persianDigits || 'Convert Digits to Persian (۰-۹)',
              checked: attributes.persianDigits,
              onChange: (val) => setAttributes({ persianDigits: val }),
            })
          ),

          // Panel 5: Text & Microcopy Overrides
          el(
            PanelBody,
            { title: blockData.i18n.panelBranding || 'Text & Copywriting Overrides', initialOpen: false },
            el(TextControl, {
              label: blockData.i18n.customTitle || 'Custom Header Title',
              value: attributes.customTitle,
              placeholder: 'Deploy Cloud Server (IaaS)',
              onChange: (val) => setAttributes({ customTitle: val }),
            }),
            el(TextareaControl, {
              label: blockData.i18n.customTagline || 'Custom Subtitle / Tagline',
              value: attributes.customTagline,
              placeholder: 'Instant provisioning on ArvanCloud infrastructure...',
              onChange: (val) => setAttributes({ customTagline: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.ctaText || 'CTA Button Text',
              value: attributes.ctaText,
              placeholder: 'Deploy Server',
              onChange: (val) => setAttributes({ ctaText: val }),
            })
          ),

          // Panel 6: Custom CSS
          el(
            PanelBody,
            { title: blockData.i18n.panelCustomCss || 'Custom CSS Overrides', initialOpen: false },
            el(TextareaControl, {
              label: blockData.i18n.customCssText || 'Custom CSS Code',
              value: attributes.customCss,
              placeholder: '/* Custom CSS for this widget */',
              rows: 4,
              onChange: (val) => setAttributes({ customCss: val }),
            })
          )
        ),
        el(
          'div',
          {
            style: {
              background: attributes.colorBackground || '#f8fafc',
              border: '2px dashed ' + accent,
              borderRadius: radius + 'px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: attributes.cardElevation === 'glow' ? '0 4px 20px ' + accent + '25' : '0 4px 16px rgba(0,0,0,0.03)',
            },
          },
          el(
            'div',
            {
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: Math.max(8, radius * 0.75) + 'px',
                background: accent + '18',
                color: accent,
                marginBottom: '12px',
                fontSize: '24px',
              },
            },
            '⚡'
          ),
          el(
            'h3',
            {
              style: {
                margin: '0 0 6px 0',
                color: attributes.colorText || '#0f172a',
                fontSize: (attributes.baseFontSize ? attributes.baseFontSize + 4 : 18) + 'px',
                fontWeight: '800',
              },
            },
            attributes.customTitle || blockData.i18n.title
          ),
          el(
            'p',
            {
              style: {
                margin: '0 0 16px 0',
                color: '#64748b',
                fontSize: (attributes.baseFontSize ? attributes.baseFontSize - 1 : 13) + 'px',
                fontWeight: '500',
              },
            },
            attributes.customTagline || blockData.i18n.previewSubtitle
          ),
          el(
            'div',
            {
              style: {
                display: 'inline-flex',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '14px',
              },
            },
            el(
              'span',
              {
                style: {
                  background: attributes.colorSurface || '#ffffff',
                  border: '1px solid ' + (attributes.colorBorder || '#e2e8f0'),
                  borderRadius: radius + 'px',
                  padding: '4px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: accent,
                },
              },
              'Region: ' + attributes.defaultRegion
            ),
            el(
              'span',
              {
                style: {
                  background: attributes.colorSurface || '#ffffff',
                  border: '1px solid ' + (attributes.colorBorder || '#e2e8f0'),
                  borderRadius: radius + 'px',
                  padding: '4px 14px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#334155',
                },
              },
              'Plan: ' + attributes.defaultFlavor
            )
          ),
          el(
            'div',
            {},
            el(
              'button',
              {
                type: 'button',
                style: {
                  background: accent,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: Math.max(6, radius * 0.75) + 'px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px ' + accent + '40',
                },
              },
              attributes.ctaText || 'Deploy Server'
            )
          ),
          el(
            'p',
            {
              style: {
                margin: '16px 0 0 0',
                color: '#94a3b8',
                fontSize: '11px',
              },
            },
            blockData.i18n.previewNotice
          )
        )
      );
    },

    save: function () {
      return null;
    },
  });

  // ── 2. Register Customer Dashboard Block ────────────────────────────────────
  registerBlockType('arvan/customer-dashboard', {
    title: blockData.i18n.dashboardTitle,
    description: blockData.i18n.dashboardDesc,
    icon: 'dashboard',
    category: 'arvan-cloud',
    keywords: ['arvan', 'cloud', 'dashboard', 'wallet', 'billing'],
    attributes: {
      showBalanceCard: { type: 'boolean', default: true },
      accentColor: { type: 'string', default: blockData.primaryColor || '#008b8b' },
      secondaryColor: { type: 'string', default: blockData.secondaryColor || '#0b3a42' },
      colorSurface: { type: 'string', default: blockData.colorSurface || '#ffffff' },
      colorBackground: { type: 'string', default: blockData.colorBackground || '#f8fafc' },
      colorText: { type: 'string', default: blockData.colorText || '#0f172a' },
      colorBorder: { type: 'string', default: blockData.colorBorder || '#e2e8f0' },
      borderRadius: { type: 'number', default: blockData.borderRadius || 16 },
      cardElevation: { type: 'string', default: 'subtle' },
      spacingDensity: { type: 'string', default: 'normal' },
      containerWidth: { type: 'string', default: 'standard' },
      fontFamily: { type: 'string', default: 'vazirmatn' },
      baseFontSize: { type: 'number', default: 14 },
      persianDigits: { type: 'boolean', default: true },
      dashboardTitle: { type: 'string', default: '' },
      dashboardDescription: { type: 'string', default: '' },
      walletTitle: { type: 'string', default: '' },
      customCss: { type: 'string', default: '' },
    },

    edit: function (props) {
      const { attributes, setAttributes } = props;
      const accent = attributes.accentColor || '#008b8b';
      const radius = attributes.borderRadius !== undefined ? attributes.borderRadius : 16;

      return el(
        'div',
        { className: 'arvan-gutenberg-block-preview' },
        el(
          InspectorControls,
          {},
          // Panel 1: Layout & Visibility
          el(
            PanelBody,
            { title: blockData.i18n.panelLayout || 'Layout, Radius & Elevation', initialOpen: true },
            el(ToggleControl, {
              label: 'Show Wallet Balance Card',
              checked: attributes.showBalanceCard,
              onChange: (val) => setAttributes({ showBalanceCard: val }),
            }),
            el(RangeControl, {
              label: blockData.i18n.borderRadius || 'Corner Border Radius (px)',
              value: attributes.borderRadius,
              min: 0,
              max: 32,
              step: 2,
              onChange: (val) => setAttributes({ borderRadius: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.cardElevation || 'Card Elevation & Shadows',
              value: attributes.cardElevation,
              options: CARD_ELEVATIONS,
              onChange: (val) => setAttributes({ cardElevation: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.containerWidth || 'Container Max Width',
              value: attributes.containerWidth,
              options: CONTAINER_WIDTHS,
              onChange: (val) => setAttributes({ containerWidth: val }),
            }),
            el(SelectControl, {
              label: blockData.i18n.spacingDensity || 'Spacing Density',
              value: attributes.spacingDensity,
              options: SPACING_DENSITIES,
              onChange: (val) => setAttributes({ spacingDensity: val }),
            })
          ),

          // Panel 2: Brand Colors & Surfaces
          el(
            PanelBody,
            { title: blockData.i18n.panelColors || 'Brand Colors & Surfaces', initialOpen: false },
            el(TextControl, {
              label: blockData.i18n.accentColor || 'Primary Brand Color',
              value: attributes.accentColor,
              placeholder: '#008b8b',
              onChange: (val) => setAttributes({ accentColor: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.secondaryColor || 'Secondary / Dark Accent',
              value: attributes.secondaryColor,
              placeholder: '#0b3a42',
              onChange: (val) => setAttributes({ secondaryColor: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorSurface || 'Card & Surface Background',
              value: attributes.colorSurface,
              placeholder: '#ffffff',
              onChange: (val) => setAttributes({ colorSurface: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorBackground || 'App Canvas Background',
              value: attributes.colorBackground,
              placeholder: '#f8fafc',
              onChange: (val) => setAttributes({ colorBackground: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorText || 'Primary Text Color',
              value: attributes.colorText,
              placeholder: '#0f172a',
              onChange: (val) => setAttributes({ colorText: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.colorBorder || 'Border Color',
              value: attributes.colorBorder,
              placeholder: '#e2e8f0',
              onChange: (val) => setAttributes({ colorBorder: val }),
            })
          ),

          // Panel 3: Typography & Persian Digits
          el(
            PanelBody,
            { title: blockData.i18n.panelTypography || 'Typography & Persian Digits', initialOpen: false },
            el(SelectControl, {
              label: blockData.i18n.fontFamily || 'Font Family Stack',
              value: attributes.fontFamily,
              options: FONTS,
              onChange: (val) => setAttributes({ fontFamily: val }),
            }),
            el(RangeControl, {
              label: blockData.i18n.baseFontSize || 'Base Font Size (px)',
              value: attributes.baseFontSize,
              min: 12,
              max: 20,
              step: 1,
              onChange: (val) => setAttributes({ baseFontSize: val }),
            }),
            el(ToggleControl, {
              label: blockData.i18n.persianDigits || 'Convert Digits to Persian (۰-۹)',
              checked: attributes.persianDigits,
              onChange: (val) => setAttributes({ persianDigits: val }),
            })
          ),

          // Panel 4: Text Overrides
          el(
            PanelBody,
            { title: blockData.i18n.panelBranding || 'Text Overrides', initialOpen: false },
            el(TextControl, {
              label: blockData.i18n.dashboardTitleText || 'Dashboard Header Title',
              value: attributes.dashboardTitle,
              placeholder: 'ArvanCloud Customer Dashboard',
              onChange: (val) => setAttributes({ dashboardTitle: val }),
            }),
            el(TextareaControl, {
              label: blockData.i18n.dashboardDescText || 'Dashboard Description',
              value: attributes.dashboardDescription,
              placeholder: 'Manage your active cloud servers and transactions...',
              onChange: (val) => setAttributes({ dashboardDescription: val }),
            }),
            el(TextControl, {
              label: blockData.i18n.walletTitleText || 'Wallet Section Title',
              value: attributes.walletTitle,
              placeholder: 'Cloud Wallet & Credit Balance',
              onChange: (val) => setAttributes({ walletTitle: val }),
            })
          ),

          // Panel 5: Custom CSS
          el(
            PanelBody,
            { title: blockData.i18n.panelCustomCss || 'Custom CSS Overrides', initialOpen: false },
            el(TextareaControl, {
              label: blockData.i18n.customCssText || 'Custom CSS Code',
              value: attributes.customCss,
              placeholder: '/* Custom CSS for this dashboard */',
              rows: 4,
              onChange: (val) => setAttributes({ customCss: val }),
            })
          )
        ),
        el(
          'div',
          {
            style: {
              background: attributes.colorBackground || '#f8fafc',
              border: '2px dashed ' + accent,
              borderRadius: radius + 'px',
              padding: '32px 24px',
              textAlign: 'center',
            },
          },
          el(
            'div',
            {
              style: {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: Math.max(8, radius * 0.75) + 'px',
                background: accent + '18',
                color: accent,
                marginBottom: '12px',
                fontSize: '24px',
              },
            },
            '📊'
          ),
          el(
            'h3',
            {
              style: {
                margin: '0 0 6px 0',
                color: attributes.colorText || '#0f172a',
                fontSize: (attributes.baseFontSize ? attributes.baseFontSize + 4 : 18) + 'px',
                fontWeight: '800',
              },
            },
            attributes.dashboardTitle || blockData.i18n.dashboardTitle
          ),
          el(
            'p',
            {
              style: {
                margin: '0',
                color: '#64748b',
                fontSize: (attributes.baseFontSize ? attributes.baseFontSize - 1 : 13) + 'px',
              },
            },
            attributes.dashboardDescription || blockData.i18n.dashboardDesc
          )
        )
      );
    },

    save: function () {
      return null;
    },
  });
})(window.wp);
