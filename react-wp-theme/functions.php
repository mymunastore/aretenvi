<?php
/**
 * React WP Theme Functions
 *
 * Enqueues React build files and provides WordPress data to React app
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme Setup
 */
function react_wp_theme_setup() {
    // Add support for title tag
    add_theme_support('title-tag');

    // Add support for custom logo
    add_theme_support('custom-logo', array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
    ));

    // Add support for post thumbnails
    add_theme_support('post-thumbnails');

    // Add support for HTML5
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
}
add_action('after_setup_theme', 'react_wp_theme_setup');

/**
 * Enqueue React App Assets
 */
function react_wp_theme_enqueue_scripts() {
    // Dequeue default WordPress styles if needed
    // wp_dequeue_style('wp-block-library');

    // Get the React build files
    $theme_dir = get_template_directory_uri();

    // Enqueue React CSS
    wp_enqueue_style(
        'react-app-css',
        $theme_dir . '/react-app/assets/index-CJ7NuGfj.css',
        array(),
        '1.0',
        'all'
    );

    // Enqueue React JS (in footer)
    wp_enqueue_script(
        'react-app-js',
        $theme_dir . '/react-app/assets/index-e_LptW6c.js',
        array(),
        '1.0',
        true
    );

    // Add module type attribute to script tag
    add_filter('script_loader_tag', 'react_wp_theme_add_type_attribute', 10, 3);

    // Pass WordPress data to React
    wp_localize_script(
        'react-app-js',
        'wpData',
        array(
            'restUrl'     => esc_url_raw(rest_url()),
            'homeUrl'     => esc_url(home_url('/')),
            'siteUrl'     => esc_url(site_url()),
            'siteName'    => get_bloginfo('name'),
            'siteDesc'    => get_bloginfo('description'),
            'themeUrl'    => get_template_directory_uri(),
            'ajaxUrl'     => admin_url('admin-ajax.php'),
            'nonce'       => wp_create_nonce('wp_rest'),
            'isLoggedIn'  => is_user_logged_in(),
            'currentUser' => wp_get_current_user()->ID,
        )
    );
}
add_action('wp_enqueue_scripts', 'react_wp_theme_enqueue_scripts');

/**
 * Add type="module" attribute to React script
 */
function react_wp_theme_add_type_attribute($tag, $handle, $src) {
    if ('react-app-js' === $handle) {
        $tag = '<script type="module" crossorigin src="' . esc_url($src) . '" id="' . $handle . '-js"></script>';
    }
    return $tag;
}

/**
 * Remove emoji scripts (optional optimization)
 */
function react_wp_theme_disable_emojis() {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
}
add_action('init', 'react_wp_theme_disable_emojis');

/**
 * Enable REST API CORS (if needed for external requests)
 */
function react_wp_theme_rest_cors() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        return $value;
    });
}
add_action('rest_api_init', 'react_wp_theme_rest_cors', 15);

/**
 * Custom REST API endpoint example
 * Uncomment if you need custom endpoints for your React app
 */
/*
function react_wp_theme_register_routes() {
    register_rest_route('react-wp/v1', '/data', array(
        'methods'  => 'GET',
        'callback' => 'react_wp_theme_get_data',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'react_wp_theme_register_routes');

function react_wp_theme_get_data() {
    return array(
        'message' => 'Hello from WordPress REST API',
        'posts'   => get_posts(array('numberposts' => 5)),
    );
}
*/

/**
 * Add manifest and PWA support files
 */
function react_wp_theme_add_manifest() {
    $theme_url = get_template_directory_uri();
    echo '<link rel="manifest" href="' . esc_url($theme_url . '/react-app/manifest.webmanifest') . '">' . "\n";
    echo '<script id="vite-plugin-pwa:register-sw" src="' . esc_url($theme_url . '/react-app/registerSW.js') . '"></script>' . "\n";
}
add_action('wp_head', 'react_wp_theme_add_manifest');

/**
 * Remove unnecessary WordPress head elements (optional optimization)
 */
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'wp_shortlink_wp_head');

/**
 * Admin customization (optional)
 */
function react_wp_theme_admin_notice() {
    $screen = get_current_screen();
    if ($screen->id === 'themes') {
        echo '<div class="notice notice-info is-dismissible">';
        echo '<p><strong>React WP Theme:</strong> This theme wraps your React application. ';
        echo 'Make sure your Supabase environment variables are configured in your React app.</p>';
        echo '</div>';
    }
}
add_action('admin_notices', 'react_wp_theme_admin_notice');

/**
 * Disable WordPress theme file editor (security best practice)
 */
define('DISALLOW_FILE_EDIT', true);
