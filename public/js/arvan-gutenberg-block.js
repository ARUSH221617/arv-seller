/**
 * WordPress Gutenberg Native Block Editor Integration for ArvanCloud Reseller
 */
(function (wp) {
  const { registerBlockType } = wp.blocks;
  const { createElement: el } = wp.element;
  const { InspectorControls } = wp.blockEditor || wp.editor;
  const { PanelBody, SelectControl, TextControl, ToggleControl } = wp.components;

  const blockData = window.arvanBlockData || {
    regions: [
      { label: 'Tehran - Forough (ir-thr-c2)', value: 'ir-thr-c2' },
      { label: 'Tehran - Shahryar (ir-thr-sh1)', value: 'ir-thr-sh1' },
      { label: 'Tabriz - Northwest (ir-tbz-dc1)', value: 'ir-tbz-dc1' },
    ],
    defaultRegion: 'ir-thr-c2',
    primaryColor: '#008b8b',
    storeName: 'ArvanCloud Reseller',
    i18n: {
      title: 'ArvanCloud Server Configurator',
      description: 'Interactive Cloud Server sizing, pricing calculator, and deployment widget.',
      dashboardTitle: 'ArvanCloud Customer Dashboard',
      dashboardDesc: 'Customer cloud server management and wallet billing dashboard.',
      blockSettings: 'Server Configurator Settings',
      selectRegion: 'Default Datacenter Region',
      accentColor: 'Brand Accent Color',
      showHourlyPrice: 'Show Hourly & Monthly Rates',
      previewNotice: 'Live ArvanCloud Server Configurator will render here on the frontend.',
      previewSubtitle: 'Instant VM Provisioning • NVMe Storage • Pay-As-You-Go',
    },
  };

  // 1. Register Server Configurator Block
  registerBlockType('arvan/server-configurator', {
    title: blockData.i18n.title,
    description: blockData.i18n.description,
    icon: 'cloud',
    category: 'arvan-cloud',
    keywords: ['arvan', 'cloud', 'server', 'vps', 'iaas', 'hosting'],
    attributes: {
      defaultRegion: {
        type: 'string',
        default: blockData.defaultRegion,
      },
      accentColor: {
        type: 'string',
        default: blockData.primaryColor,
      },
      showHourlyPrice: {
        type: 'boolean',
        default: true,
      },
    },

    edit: function (props) {
      const { attributes, setAttributes } = props;

      return el(
        'div',
        { className: 'arvan-gutenberg-block-preview' },
        el(
          InspectorControls,
          {},
          el(
            PanelBody,
            { title: blockData.i18n.blockSettings, initialOpen: true },
            el(SelectControl, {
              label: blockData.i18n.selectRegion,
              value: attributes.defaultRegion,
              options: blockData.regions,
              onChange: function (val) {
                setAttributes({ defaultRegion: val });
              },
            }),
            el(TextControl, {
              label: blockData.i18n.accentColor,
              value: attributes.accentColor,
              placeholder: '#008b8b',
              onChange: function (val) {
                setAttributes({ accentColor: val });
              },
            }),
            el(ToggleControl, {
              label: blockData.i18n.showHourlyPrice,
              checked: attributes.showHourlyPrice,
              onChange: function (val) {
                setAttributes({ showHourlyPrice: val });
              },
            })
          )
        ),
        el(
          'div',
          {
            style: {
              background: '#f8fafc',
              border: '2px dashed ' + (attributes.accentColor || '#008b8b'),
              borderRadius: '16px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
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
                borderRadius: '14px',
                background: (attributes.accentColor || '#008b8b') + '15',
                color: attributes.accentColor || '#008b8b',
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
                color: '#0f172a',
                fontSize: '18px',
                fontWeight: '800',
              },
            },
            blockData.i18n.title
          ),
          el(
            'p',
            {
              style: {
                margin: '0 0 16px 0',
                color: '#64748b',
                fontSize: '13px',
                fontWeight: '500',
              },
            },
            blockData.i18n.previewSubtitle
          ),
          el(
            'div',
            {
              style: {
                display: 'inline-block',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: '700',
                color: attributes.accentColor || '#008b8b',
              },
            },
            'Region: ' + attributes.defaultRegion
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
      // Dynamic rendering on server
      return null;
    },
  });

  // 2. Register Customer Dashboard Block
  registerBlockType('arvan/customer-dashboard', {
    title: blockData.i18n.dashboardTitle,
    description: blockData.i18n.dashboardDesc,
    icon: 'dashboard',
    category: 'arvan-cloud',
    keywords: ['arvan', 'cloud', 'dashboard', 'wallet', 'billing'],
    attributes: {
      showBalanceCard: {
        type: 'boolean',
        default: true,
      },
    },

    edit: function () {
      return el(
        'div',
        {
          style: {
            background: '#f8fafc',
            border: '2px dashed #008b8b',
            borderRadius: '16px',
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
              borderRadius: '14px',
              background: '#008b8b15',
              color: '#008b8b',
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
              color: '#0f172a',
              fontSize: '18px',
              fontWeight: '800',
            },
          },
          blockData.i18n.dashboardTitle
        ),
        el(
          'p',
          {
            style: {
              margin: '0',
              color: '#64748b',
              fontSize: '13px',
            },
          },
          blockData.i18n.dashboardDesc
        )
      );
    },

    save: function () {
      return null;
    },
  });
})(window.wp);
