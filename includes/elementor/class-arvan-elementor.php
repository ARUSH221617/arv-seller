<?php
/**
 * Elementor Page Builder Integration for ArvanCloud Reseller
 *
 * @package Arvan_Reseller
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Arvan_Elementor
 */
class Arvan_Elementor {

	/**
	 * Plugin name.
	 *
	 * @var string
	 */
	protected $plugin_name;

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	protected $version;

	/**
	 * Constructor.
	 *
	 * @param string $plugin_name Plugin identifier.
	 * @param string $version     Plugin version.
	 */
	public function __construct( $plugin_name, $version ) {
		$this->plugin_name = $plugin_name;
		$this->version     = $version;
	}

	/**
	 * Initialize Elementor hooks.
	 */
	public function init() {
		// Register custom widget category
		add_action( 'elementor/elements/categories_registered', array( $this, 'register_category' ) );

		// Register widgets (Elementor 3.5.0+)
		add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );

		// Backwards compatibility for older Elementor versions
		add_action( 'elementor/widgets/widgets_registered', array( $this, 'register_widgets_legacy' ) );
	}

	/**
	 * Register ArvanCloud Category in Elementor panel.
	 *
	 * @param \Elementor\Elements_Manager $elements_manager Elements manager instance.
	 */
	public function register_category( $elements_manager ) {
		$elements_manager->add_category(
			'arvan-cloud',
			array(
				'title' => __( 'ArvanCloud Services', 'arv-seller' ),
				'icon'  => 'eicon-cloud',
			)
		);
	}

	/**
	 * Register modern Elementor Widgets (Elementor 3.5+).
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Widgets manager.
	 */
	public function register_widgets( $widgets_manager ) {
		require_once plugin_dir_path( __FILE__ ) . 'widgets/class-arvan-elementor-server-configurator.php';
		require_once plugin_dir_path( __FILE__ ) . 'widgets/class-arvan-elementor-customer-dashboard.php';

		$widgets_manager->register( new Arvan_Elementor_Server_Configurator_Widget() );
		$widgets_manager->register( new Arvan_Elementor_Customer_Dashboard_Widget() );
	}

	/**
	 * Register legacy Elementor Widgets (< 3.5).
	 *
	 * @param \Elementor\Widgets_Manager $widgets_manager Widgets manager.
	 */
	public function register_widgets_legacy( $widgets_manager ) {
		if ( method_exists( $widgets_manager, 'register' ) ) {
			return; // Handled by modern hook
		}

		require_once plugin_dir_path( __FILE__ ) . 'widgets/class-arvan-elementor-server-configurator.php';
		require_once plugin_dir_path( __FILE__ ) . 'widgets/class-arvan-elementor-customer-dashboard.php';

		$widgets_manager->register_widget_type( new Arvan_Elementor_Server_Configurator_Widget() );
		$widgets_manager->register_widget_type( new Arvan_Elementor_Customer_Dashboard_Widget() );
	}
}
