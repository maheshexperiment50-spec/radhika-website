const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dbDir = path.join(rootDir, 'data');
const dbPath = path.join(dbDir, 'radhika.db');

fs.mkdirSync(dbDir, { recursive: true });

// -----------------------------------------------------------------------------
// EMBEDDED FALLBACK ASSETS (Guarantees CSS & JS load even if folders were not pushed to Git)
// -----------------------------------------------------------------------------
const EMBEDDED_ASSETS = {
  css: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');\n\n/* CSS Variables for Colors and Transitions */\n:root {\n    --primary: #2563eb;\n    --primary-hover: #1d4ed8;\n    --secondary: #06b6d4;\n    --accent: #4f46e5;\n    --success: #10b981;\n    --danger: #ef4444;\n    --warning: #f59e0b;\n    --info: #3b82f6;\n    \n    /* Light Mode */\n    --bg-primary: #f8fafc;\n    --bg-secondary: #ffffff;\n    --border-color: #e2e8f0;\n    --text-primary: #0f172a;\n    --text-secondary: #475569;\n    --text-muted: #94a3b8;\n    --card-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.08), 0 2px 8px -1px rgba(148, 163, 184, 0.04);\n    --card-shadow-hover: 0 12px 24px -4px rgba(37, 99, 235, 0.12), 0 4px 12px -2px rgba(37, 99, 235, 0.04);\n    --sidebar-bg: #1e293b;\n    --sidebar-text: #94a3b8;\n    --sidebar-active-bg: #2563eb;\n    --sidebar-active-text: #ffffff;\n    --glass-bg: rgba(255, 255, 255, 0.7);\n    --glass-border: rgba(226, 232, 240, 0.8);\n    \n    --radius-sm: 6px;\n    --radius-md: 12px;\n    --radius-lg: 18px;\n    \n    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n/* Dark Mode Variables */\nbody.dark-mode {\n    --bg-primary: #0b0f19;\n    --bg-secondary: #151f32;\n    --border-color: #243049;\n    --text-primary: #f8fafc;\n    --text-secondary: #94a3b8;\n    --text-muted: #64748b;\n    --card-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3);\n    --card-shadow-hover: 0 12px 24px -4px rgba(37, 99, 235, 0.25);\n    --sidebar-bg: #0b0f19;\n    --sidebar-text: #64748b;\n    --glass-bg: rgba(21, 31, 50, 0.7);\n    --glass-border: rgba(36, 48, 73, 0.8);\n}\n\n/* General Reset & Layout */\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n    font-family: 'Outfit', sans-serif;\n    scroll-behavior: smooth;\n}\n\nbody {\n    background-color: var(--bg-primary);\n    color: var(--text-primary);\n    transition: var(--transition);\n    overflow-x: hidden;\n}\n\n/* Scrollbar styling */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n::-webkit-scrollbar-track {\n    background: var(--bg-primary);\n}\n::-webkit-scrollbar-thumb {\n    background: var(--border-color);\n    border-radius: var(--radius-sm);\n}\n::-webkit-scrollbar-thumb:hover {\n    background: var(--text-muted);\n}\n\n/* Helper Typography & Badges */\na {\n    color: inherit;\n    text-decoration: none;\n}\n\nbutton, input, select, textarea {\n    outline: none;\n    border: 1px solid var(--border-color);\n    background-color: var(--bg-secondary);\n    color: var(--text-primary);\n    border-radius: var(--radius-sm);\n    padding: 8px 12px;\n    transition: var(--transition);\n}\n\nbutton {\n    cursor: pointer;\n    font-weight: 500;\n}\n\n.badge {\n    padding: 4px 8px;\n    border-radius: 50px;\n    font-size: 0.75rem;\n    font-weight: 600;\n    display: inline-flex;\n    align-items: center;\n    gap: 4px;\n}\n.badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); }\n.badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }\n.badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }\n.badge-info { background: rgba(59, 130, 246, 0.1); color: var(--info); }\n.badge-primary { background: rgba(37, 99, 237, 0.1); color: var(--primary); }\n\n/* PUBLIC WEBSITE STYLING */\nheader.site-header {\n    position: sticky;\n    top: 0;\n    z-index: 100;\n    background: var(--glass-bg);\n    backdrop-filter: blur(12px);\n    border-bottom: 1px solid var(--glass-border);\n    padding: 15px 5%;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    transition: var(--transition);\n}\n\n.logo-container {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n}\n\n.logo-icon {\n    width: 45px;\n    height: 45px;\n    background: linear-gradient(135deg, var(--primary), var(--secondary));\n    border-radius: var(--radius-md);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: white;\n    font-size: 1.5rem;\n    font-weight: 800;\n    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);\n}\n\n.logo-text h1 {\n    font-size: 1.25rem;\n    font-weight: 700;\n    color: var(--primary);\n    line-height: 1.1;\n}\n\n.logo-text p {\n    font-size: 0.75rem;\n    color: var(--text-secondary);\n    letter-spacing: 1px;\n}\n\n.site-nav {\n    display: flex;\n    gap: 25px;\n    align-items: center;\n}\n\n.nav-link {\n    font-weight: 500;\n    color: var(--text-secondary);\n    position: relative;\n    padding: 5px 0;\n}\n.nav-link:after {\n    content: '';\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 0;\n    height: 2px;\n    background: var(--primary);\n    transition: var(--transition);\n}\n.nav-link:hover, .nav-link.active {\n    color: var(--primary);\n}\n.nav-link:hover:after, .nav-link.active:after {\n    width: 100%;\n}\n\n.btn-primary {\n    background: var(--primary);\n    color: white;\n    border: none;\n    border-radius: var(--radius-md);\n    padding: 10px 20px;\n    font-weight: 600;\n    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);\n}\n.btn-primary:hover {\n    background: var(--primary-hover);\n    transform: translateY(-2px);\n    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);\n}\n\n.btn-secondary {\n    background: transparent;\n    color: var(--text-primary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-md);\n    padding: 10px 20px;\n}\n.btn-secondary:hover {\n    background: var(--bg-primary);\n    border-color: var(--text-secondary);\n}\n\n/* Toggle Theme Button */\n.theme-btn {\n    background: transparent;\n    border: none;\n    font-size: 1.25rem;\n    color: var(--text-secondary);\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 38px;\n    height: 38px;\n    border-radius: 50%;\n}\n.theme-btn:hover {\n    background: var(--border-color);\n    color: var(--primary);\n}\n\n/* Home Hero Section */\n.hero-section {\n    padding: 80px 5% 60px;\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 40px;\n    align-items: center;\n    background: radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),\n                radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);\n}\n\n.hero-content h2 {\n    font-size: 3rem;\n    font-weight: 800;\n    line-height: 1.2;\n    margin-bottom: 20px;\n}\n.hero-content h2 span {\n    background: linear-gradient(to right, var(--primary), var(--secondary));\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n}\n\n.hero-content p {\n    font-size: 1.125rem;\n    color: var(--text-secondary);\n    margin-bottom: 30px;\n    line-height: 1.6;\n}\n\n.hero-cta {\n    display: flex;\n    gap: 15px;\n}\n\n.hero-illustration {\n    position: relative;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.hero-illustration svg {\n    width: 90%;\n    max-width: 500px;\n    animation: float 6s ease-in-out infinite;\n}\n\n@keyframes float {\n    0%, 100% { transform: translateY(0px); }\n    50% { transform: translateY(-15px); }\n}\n\n/* Statistics Ribbon */\n.stats-ribbon {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    gap: 20px;\n    padding: 40px 5%;\n    background: var(--bg-secondary);\n    border-top: 1px solid var(--border-color);\n    border-bottom: 1px solid var(--border-color);\n}\n\n.stat-item {\n    text-align: center;\n}\n.stat-num {\n    font-size: 2.5rem;\n    font-weight: 800;\n    color: var(--primary);\n}\n.stat-label {\n    color: var(--text-secondary);\n    font-size: 0.9rem;\n    font-weight: 500;\n    text-transform: uppercase;\n    letter-spacing: 1px;\n}\n\n/* Public Courses & About */\n.section {\n    padding: 80px 5%;\n}\n\n.section-title {\n    text-align: center;\n    margin-bottom: 50px;\n}\n.section-title h3 {\n    font-size: 2rem;\n    font-weight: 700;\n    margin-bottom: 10px;\n}\n.section-title p {\n    color: var(--text-muted);\n}\n\n.courses-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n    gap: 30px;\n}\n\n.course-card {\n    background: var(--bg-secondary);\n    border-radius: var(--radius-lg);\n    border: 1px solid var(--border-color);\n    padding: 30px;\n    box-shadow: var(--card-shadow);\n    transition: var(--transition);\n}\n.course-card:hover {\n    transform: translateY(-8px);\n    box-shadow: var(--card-shadow-hover);\n    border-color: var(--primary);\n}\n\n.course-icon {\n    font-size: 2.5rem;\n    color: var(--primary);\n    margin-bottom: 20px;\n}\n\n.course-card h4 {\n    font-size: 1.25rem;\n    font-weight: 700;\n    margin-bottom: 10px;\n}\n\n.course-card p {\n    color: var(--text-secondary);\n    font-size: 0.95rem;\n    line-height: 1.5;\n    margin-bottom: 20px;\n}\n\n.course-meta {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-top: 1px solid var(--border-color);\n    padding-top: 15px;\n    font-size: 0.85rem;\n    color: var(--text-muted);\n}\n\n/* Contact / Enquiry Section */\n.contact-container {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 50px;\n}\n\n.contact-info-list {\n    display: flex;\n    flex-direction: column;\n    gap: 30px;\n}\n\n.contact-info-item {\n    display: flex;\n    gap: 20px;\n    align-items: flex-start;\n}\n\n.contact-info-icon {\n    width: 48px;\n    height: 48px;\n    border-radius: 50%;\n    background: rgba(37, 99, 235, 0.1);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: var(--primary);\n    font-size: 1.25rem;\n    flex-shrink: 0;\n}\n\n.contact-info-text h5 {\n    font-size: 1.1rem;\n    font-weight: 600;\n    margin-bottom: 5px;\n}\n.contact-info-text p {\n    color: var(--text-secondary);\n    font-size: 0.95rem;\n}\n\n.enquiry-form-card {\n    background: var(--bg-secondary);\n    border-radius: var(--radius-lg);\n    border: 1px solid var(--border-color);\n    padding: 40px;\n    box-shadow: var(--card-shadow);\n}\n\n.form-group {\n    margin-bottom: 20px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n}\n.form-group label {\n    font-weight: 600;\n    font-size: 0.9rem;\n    color: var(--text-secondary);\n}\n\n.form-group input, .form-group select, .form-group textarea {\n    padding: 12px;\n    border-radius: var(--radius-md);\n}\n.form-group input:focus, .form-group select:focus, .form-group textarea:focus {\n    border-color: var(--primary);\n    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);\n}\n\n/* SECURE LOGIN PAGE STYLING */\n.login-wrapper {\n    min-height: 100vh;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: 20px;\n    background: radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 60%),\n                radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 60%);\n}\n\n.login-card {\n    background: var(--bg-secondary);\n    border-radius: var(--radius-lg);\n    border: 1px solid var(--border-color);\n    padding: 40px;\n    width: 100%;\n    max-width: 480px;\n    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.1);\n    position: relative;\n    overflow: hidden;\n}\n.login-card:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 4px;\n    background: linear-gradient(90deg, var(--primary), var(--secondary));\n}\n\n.login-header {\n    text-align: center;\n    margin-bottom: 30px;\n}\n.login-header h2 {\n    font-size: 1.75rem;\n    font-weight: 700;\n    margin-top: 15px;\n    margin-bottom: 5px;\n}\n.login-header p {\n    color: var(--text-secondary);\n    font-size: 0.9rem;\n}\n\n/* Autofill buttons for testing ERP roles quickly */\n.demo-accounts {\n    background: var(--bg-primary);\n    border-radius: var(--radius-md);\n    padding: 15px;\n    margin-bottom: 25px;\n    border: 1px dashed var(--border-color);\n}\n.demo-accounts p {\n    font-size: 0.8rem;\n    font-weight: 600;\n    color: var(--text-secondary);\n    margin-bottom: 10px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n}\n.demo-buttons {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 8px;\n}\n.demo-btn {\n    padding: 8px;\n    font-size: 0.75rem;\n    border-radius: var(--radius-sm);\n    text-align: center;\n    border: 1px solid var(--border-color);\n    background: var(--bg-secondary);\n    font-weight: 600;\n}\n.demo-btn:hover {\n    background: var(--primary);\n    color: white;\n    border-color: var(--primary);\n}\n\n.forgot-link {\n    font-size: 0.85rem;\n    color: var(--primary);\n    font-weight: 500;\n    text-align: right;\n    display: block;\n    margin-top: -10px;\n    margin-bottom: 20px;\n}\n.forgot-link:hover {\n    text-decoration: underline;\n}\n\n/* CORE ERP DASHBOARD LAYOUT */\n.dashboard-container {\n    min-height: 100vh;\n    display: grid;\n    grid-template-columns: 260px 1fr;\n    transition: var(--transition);\n}\n.dashboard-container.sidebar-collapsed {\n    grid-template-columns: 80px 1fr;\n}\n\n/* Sidebar Styling */\naside.sidebar {\n    background: var(--sidebar-bg);\n    color: var(--sidebar-text);\n    padding: 20px 15px;\n    display: flex;\n    flex-direction: column;\n    border-right: 1px solid var(--border-color);\n    position: sticky;\n    top: 0;\n    height: 100vh;\n    z-index: 50;\n    transition: var(--transition);\n}\n\n.sidebar-logo {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    padding-bottom: 20px;\n    border-bottom: 1px solid var(--border-color);\n    margin-bottom: 25px;\n    overflow: hidden;\n}\n\n.sidebar-logo h1 {\n    color: white;\n    font-size: 1.15rem;\n    font-weight: 700;\n    white-space: nowrap;\n    transition: var(--transition);\n}\n\n.dashboard-container.sidebar-collapsed .sidebar-logo h1 {\n    opacity: 0;\n    width: 0;\n}\n\n.sidebar-menu {\n    list-style: none;\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    flex-grow: 1;\n}\n\n.menu-item a {\n    display: flex;\n    align-items: center;\n    gap: 14px;\n    padding: 12px 16px;\n    border-radius: var(--radius-md);\n    color: var(--sidebar-text);\n    font-weight: 500;\n    transition: var(--transition);\n    white-space: nowrap;\n}\n\n.menu-item a i {\n    font-size: 1.2rem;\n    width: 20px;\n    text-align: center;\n}\n\n.menu-item a:hover, .menu-item.active a {\n    background: var(--sidebar-active-bg);\n    color: var(--sidebar-active-text);\n}\n\n.sidebar-user {\n    padding-top: 15px;\n    border-top: 1px solid var(--border-color);\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    overflow: hidden;\n}\n\n.user-avatar {\n    width: 40px;\n    height: 40px;\n    border-radius: 50%;\n    background: var(--primary);\n    color: white;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-weight: 700;\n    font-size: 1.1rem;\n    flex-shrink: 0;\n}\n\n.user-info {\n    transition: var(--transition);\n    overflow: hidden;\n}\n.user-info h5 {\n    color: white;\n    font-size: 0.9rem;\n    font-weight: 600;\n    white-space: nowrap;\n}\n.user-info p {\n    font-size: 0.75rem;\n    color: var(--text-muted);\n    white-space: nowrap;\n    text-transform: capitalize;\n}\n\n.dashboard-container.sidebar-collapsed .sidebar-user .user-info {\n    opacity: 0;\n    width: 0;\n}\n\n/* Main Dashboard Panel */\nmain.main-panel {\n    display: flex;\n    flex-direction: column;\n    min-height: 100vh;\n    overflow-x: hidden;\n}\n\n/* Dashboard Header */\nheader.panel-header {\n    background: var(--bg-secondary);\n    border-bottom: 1px solid var(--border-color);\n    padding: 15px 30px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    position: sticky;\n    top: 0;\n    z-index: 40;\n}\n\n.header-left {\n    display: flex;\n    align-items: center;\n    gap: 20px;\n}\n\n.sidebar-toggle {\n    background: transparent;\n    border: none;\n    font-size: 1.25rem;\n    cursor: pointer;\n    color: var(--text-secondary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.header-title h2 {\n    font-size: 1.35rem;\n    font-weight: 700;\n}\n\n.header-right {\n    display: flex;\n    align-items: center;\n    gap: 15px;\n}\n\n.search-bar {\n    position: relative;\n    width: 250px;\n}\n.search-bar input {\n    width: 100%;\n    padding: 8px 12px 8px 35px;\n    border-radius: 50px;\n}\n.search-bar i {\n    position: absolute;\n    left: 12px;\n    top: 50%;\n    transform: translateY(-50%);\n    color: var(--text-muted);\n}\n\n.notification-bell {\n    position: relative;\n}\n.bell-badge {\n    position: absolute;\n    top: -2px;\n    right: -2px;\n    width: 8px;\n    height: 8px;\n    background: var(--danger);\n    border-radius: 50%;\n}\n\n.notifications-dropdown {\n    position: absolute;\n    top: 50px;\n    right: -10px;\n    width: 320px;\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    box-shadow: var(--card-shadow-hover);\n    padding: 15px;\n    display: none;\n    z-index: 100;\n}\n.notifications-dropdown.active {\n    display: block;\n    animation: slideDown 0.2s ease-out;\n}\n.notif-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-bottom: 1px solid var(--border-color);\n    padding-bottom: 10px;\n    margin-bottom: 10px;\n}\n.notif-list {\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    max-height: 250px;\n    overflow-y: auto;\n}\n.notif-item {\n    padding: 8px;\n    border-radius: var(--radius-sm);\n    background: var(--bg-primary);\n    font-size: 0.85rem;\n}\n.notif-item p { margin-bottom: 3px; }\n.notif-time { font-size: 0.75rem; color: var(--text-muted); }\n\n/* Dashboard Body & Widgets */\n.panel-body {\n    padding: 30px;\n    flex-grow: 1;\n}\n\n.widgets-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n    gap: 20px;\n    margin-bottom: 30px;\n}\n\n.widget-card {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    padding: 24px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    box-shadow: var(--card-shadow);\n    transition: var(--transition);\n}\n.widget-card:hover {\n    transform: translateY(-4px);\n    box-shadow: var(--card-shadow-hover);\n    border-color: var(--primary);\n}\n\n.widget-info h4 {\n    font-size: 0.85rem;\n    font-weight: 600;\n    text-transform: uppercase;\n    color: var(--text-secondary);\n    letter-spacing: 0.5px;\n    margin-bottom: 6px;\n}\n.widget-info p {\n    font-size: 1.85rem;\n    font-weight: 800;\n}\n.widget-info span {\n    font-size: 0.75rem;\n    color: var(--text-muted);\n}\n\n.widget-icon {\n    width: 48px;\n    height: 48px;\n    border-radius: var(--radius-md);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 1.4rem;\n}\n.widget-icon.primary { background: rgba(37, 99, 235, 0.1); color: var(--primary); }\n.widget-icon.secondary { background: rgba(6, 182, 212, 0.1); color: var(--secondary); }\n.widget-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }\n.widget-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }\n.widget-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }\n\n/* Graphs Section */\n.charts-grid {\n    display: grid;\n    grid-template-columns: 2fr 1fr;\n    gap: 24px;\n    margin-bottom: 30px;\n}\n@media (max-width: 1024px) {\n    .charts-grid { grid-template-columns: 1fr; }\n}\n\n.chart-card {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    padding: 24px;\n    box-shadow: var(--card-shadow);\n}\n\n.chart-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 20px;\n}\n.chart-header h3 {\n    font-size: 1.1rem;\n    font-weight: 700;\n}\n\n/* Custom SVG Chart / SVG Styles */\n.chart-container {\n    height: 250px;\n    position: relative;\n    width: 100%;\n}\n\n/* Notice & Activity log widgets */\n.activity-list {\n    display: flex;\n    flex-direction: column;\n    gap: 15px;\n}\n.activity-item {\n    display: flex;\n    gap: 15px;\n    align-items: flex-start;\n}\n.activity-dot {\n    width: 10px;\n    height: 10px;\n    border-radius: 50%;\n    margin-top: 5px;\n    flex-shrink: 0;\n}\n.activity-content {\n    font-size: 0.9rem;\n}\n.activity-content p {\n    color: var(--text-secondary);\n}\n.activity-time {\n    font-size: 0.75rem;\n    color: var(--text-muted);\n}\n\n/* DATA TABLES */\n.table-container {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    box-shadow: var(--card-shadow);\n    overflow: hidden;\n    margin-top: 20px;\n    width: 100%;\n}\n\n.table-header-bar {\n    padding: 20px 24px;\n    border-bottom: 1px solid var(--border-color);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 15px;\n    flex-wrap: wrap;\n}\n\n.table-header-bar h3 {\n    font-size: 1.15rem;\n    font-weight: 700;\n}\n\n.table-actions {\n    display: flex;\n    gap: 12px;\n    align-items: center;\n    flex-wrap: wrap;\n}\n\n.table-responsive {\n    overflow-x: auto;\n    width: 100%;\n}\n\ntable.data-table {\n    width: 100%;\n    border-collapse: collapse;\n    text-align: left;\n}\n\ntable.data-table th, table.data-table td {\n    padding: 16px 24px;\n    border-bottom: 1px solid var(--border-color);\n    font-size: 0.925rem;\n    white-space: nowrap;\n}\n\ntable.data-table th {\n    background: var(--bg-primary);\n    color: var(--text-secondary);\n    font-weight: 600;\n}\n\ntable.data-table tbody tr:hover {\n    background: rgba(37, 99, 235, 0.02);\n}\n\n.actions-cell {\n    display: flex;\n    gap: 8px;\n}\n\n.btn-icon {\n    width: 32px;\n    height: 32px;\n    border-radius: var(--radius-sm);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: transparent;\n    color: var(--text-secondary);\n    border: 1px solid var(--border-color);\n    padding: 0;\n}\n.btn-icon:hover {\n    background: var(--bg-primary);\n    color: var(--primary);\n}\n.btn-icon.edit:hover { border-color: var(--primary); color: var(--primary); }\n.btn-icon.delete:hover { border-color: var(--danger); color: var(--danger); }\n.btn-icon.print:hover { border-color: var(--success); color: var(--success); }\n\n/* MODALS */\n.modal-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(15, 23, 42, 0.6);\n    backdrop-filter: blur(4px);\n    z-index: 1000;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    opacity: 0;\n    pointer-events: none;\n    transition: opacity 0.3s ease;\n}\n.modal-overlay.active {\n    opacity: 1;\n    pointer-events: auto;\n}\n\n.modal-content {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    width: 90%;\n    max-width: 550px;\n    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);\n    transform: scale(0.9);\n    transition: transform 0.3s ease;\n    overflow: hidden;\n}\n.modal-overlay.active .modal-content {\n    transform: scale(1);\n}\n\n.modal-header {\n    padding: 20px 24px;\n    border-bottom: 1px solid var(--border-color);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    background: var(--bg-primary);\n}\n.modal-header h3 {\n    font-size: 1.2rem;\n    font-weight: 700;\n}\n.close-modal {\n    background: transparent;\n    border: none;\n    font-size: 1.25rem;\n    cursor: pointer;\n    color: var(--text-muted);\n}\n\n.modal-body {\n    padding: 24px;\n    max-height: 70vh;\n    overflow-y: auto;\n}\n\n.modal-footer {\n    padding: 16px 24px;\n    border-top: 1px solid var(--border-color);\n    display: flex;\n    justify-content: flex-end;\n    gap: 12px;\n    background: var(--bg-primary);\n}\n\n/* ID Card Printing styles */\n.id-card-preview {\n    width: 320px;\n    height: 480px;\n    border-radius: var(--radius-md);\n    background: linear-gradient(135deg, #1e3a8a, #3b82f6);\n    color: white;\n    margin: 0 auto;\n    padding: 20px;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: space-between;\n    box-shadow: 0 10px 25px rgba(0,0,0,0.15);\n    position: relative;\n    overflow: hidden;\n}\n.id-card-preview:before {\n    content: '';\n    position: absolute;\n    bottom: -50px;\n    right: -50px;\n    width: 150px;\n    height: 150px;\n    background: rgba(255, 255, 255, 0.05);\n    border-radius: 50%;\n}\n.id-card-header {\n    text-align: center;\n    width: 100%;\n    border-bottom: 1px solid rgba(255,255,255,0.2);\n    padding-bottom: 10px;\n}\n.id-card-header h4 { font-size: 1.1rem; font-weight: 800; letter-spacing: 0.5px; }\n.id-card-header p { font-size: 0.65rem; opacity: 0.8; text-transform: uppercase; }\n\n.id-card-photo {\n    width: 90px;\n    height: 110px;\n    border: 3px solid white;\n    border-radius: var(--radius-sm);\n    background: white;\n    overflow: hidden;\n    margin: 15px 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: #1e3a8a;\n}\n.id-card-details {\n    width: 100%;\n    font-size: 0.8rem;\n    margin-bottom: 15px;\n}\n.id-card-details table {\n    width: 100%;\n}\n.id-card-details td {\n    padding: 4px 0;\n    vertical-align: top;\n}\n.id-card-details td:first-child {\n    font-weight: 600;\n    width: 100px;\n    opacity: 0.8;\n}\n\n.id-card-footer {\n    width: 100%;\n    border-top: 1px solid rgba(255,255,255,0.2);\n    padding-top: 10px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    font-size: 0.7rem;\n}\n.id-barcode {\n    height: 30px;\n    width: 100px;\n    background: white;\n}\n\n/* Toast styling */\n.toast-container {\n    position: fixed;\n    bottom: 25px;\n    right: 25px;\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    z-index: 10000;\n}\n.toast {\n    background: var(--bg-secondary);\n    color: var(--text-primary);\n    border-left: 4px solid var(--primary);\n    box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n    border-radius: var(--radius-sm);\n    padding: 16px 20px;\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    min-width: 280px;\n    max-width: 400px;\n    animation: slideIn 0.3s ease-out;\n}\n.toast.toast-success { border-left-color: var(--success); }\n.toast.toast-danger { border-left-color: var(--danger); }\n.toast.toast-warning { border-left-color: var(--warning); }\n\n@keyframes slideIn {\n    from { transform: translateX(100%); opacity: 0; }\n    to { transform: translateX(0); opacity: 1; }\n}\n\n@keyframes slideDown {\n    from { transform: translateY(-10px); opacity: 0; }\n    to { transform: translateY(0); opacity: 1; }\n}\n\n/* Attendance table special styling */\n.attendance-radio-group {\n    display: flex;\n    gap: 15px;\n}\n.attendance-label {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    cursor: pointer;\n    font-size: 0.9rem;\n}\n.attendance-label input {\n    margin: 0;\n}\n\n/* Certificate Layout Print View */\n.certificate-preview {\n    width: 100%;\n    max-width: 650px;\n    aspect-ratio: 1.414;\n    background: #fdfdfd;\n    border: 15px solid #1e3a8a;\n    padding: 30px;\n    position: relative;\n    margin: 0 auto;\n    box-shadow: 0 5px 15px rgba(0,0,0,0.08);\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    text-align: center;\n    color: #1e293b;\n}\n.cert-inner {\n    border: 2px solid #b45309;\n    height: 100%;\n    width: 100%;\n    padding: 20px;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n}\n.cert-header h4 { font-size: 1.5rem; color: #1e3a8a; font-weight: 800; }\n.cert-header p { font-size: 0.8rem; text-transform: uppercase; color: #b45309; font-weight: 700; letter-spacing: 1px; }\n.cert-title { font-size: 1rem; font-style: italic; margin: 10px 0; }\n.cert-name { font-size: 1.8rem; font-weight: 700; color: #1e3a8a; text-decoration: underline; margin: 5px 0; }\n.cert-text { font-size: 0.85rem; line-height: 1.6; }\n.cert-footer { display: flex; justify-content: space-between; padding-top: 15px; margin-top: 10px; }\n.cert-sign { text-align: center; font-size: 0.8rem; width: 150px; border-top: 1px solid #94a3b8; padding-top: 5px; }\n\n/* Responsive Media Queries */\n@media (max-width: 768px) {\n    header.site-header { padding: 15px 3%; }\n    .site-nav { display: none; } /* On mobile, we can toggle or simplify */\n    .hero-section { grid-template-columns: 1fr; text-align: center; padding-top: 40px; }\n    .hero-cta { justify-content: center; }\n    .stats-ribbon { grid-template-columns: repeat(2, 1fr); gap: 20px; }\n    .contact-container { grid-template-columns: 1fr; }\n    \n    .dashboard-container {\n        grid-template-columns: 1fr; /* Sidebar collapses to drawer */\n    }\n    aside.sidebar {\n        position: fixed;\n        left: -260px;\n        z-index: 1000;\n        box-shadow: 10px 0 30px rgba(0,0,0,0.15);\n    }\n    .dashboard-container.sidebar-active aside.sidebar {\n        left: 0;\n    }\n    header.panel-header { padding: 15px 15px; }\n    .panel-body { padding: 15px; }\n    .widgets-grid { grid-template-columns: 1fr; }\n    .header-left { gap: 10px; }\n    .search-bar { width: 140px; }\n    .search-bar input { padding-left: 28px; }\n    .search-bar i { left: 8px; }\n}\n\n/* Printing styles */\n@media print {\n    body * { visibility: hidden; }\n    .printable-area, .printable-area * { visibility: visible; }\n    .printable-area {\n        position: absolute;\n        left: 0;\n        top: 0;\n        width: 100%;\n        background: white !important;\n        color: black !important;\n    }\n    .modal-overlay { background: transparent !important; }\n}\n",
  dbJs: "/**\n * Radhika IT College Management System - Hybrid client/server database layer\n */\n\nconst DB_KEYS = {\n    CENTERS: 'centers',\n    STAFF: 'staff',\n    STUDENTS: 'students',\n    FEES: 'fees',\n    ATTENDANCE: 'attendance',\n    EXPENSES: 'expenses',\n    NOTICES: 'notices',\n    COURSES: 'courses',\n    CURRENT_USER: 'current_user'\n};\n\nconst SEED_DATA = {\n    centers: [\n        { id: 'C001', center_name: 'Main Campus (HQ)', center_code: 'MCHQ01', address: 'Civil Lines, Near Town Hall, District HQ', head_name: 'Dr. R. K. Sharma', contact: '9876543210' },\n        { id: 'C002', center_name: 'City Tech Center', center_code: 'CTC02', address: 'Station Road, Opp. Central Mall', head_name: 'Prof. Vinay Mishra', contact: '8765432109' },\n        { id: 'C003', center_name: 'Rural IT Development Wing', center_code: 'RIT03', address: 'NH-2 Bypass, Near Block Office', head_name: 'Er. Amit Patel', contact: '7654321098' }\n    ],\n    staff: [\n        { id: 'S001', name: 'Super Administrator', login_id: 'superadmin', password: '123', role: 'super_admin', center_id: '', status: 'active' },\n        { id: 'S002', name: 'Vinay Mishra (Center Head)', login_id: 'centerhead1', password: '123', role: 'center_admin', center_id: 'C002', status: 'active' },\n        { id: 'S003', name: 'Amit Patel (Center Head)', login_id: 'centerhead2', password: '123', role: 'center_admin', center_id: 'C003', status: 'active' },\n        { id: 'S004', name: 'Rita Sen (Senior Counselor)', login_id: 'staff1', password: '123', role: 'staff', center_id: 'C001', status: 'active' },\n        { id: 'S005', name: 'Rajesh Kumar (Office Assistant)', login_id: 'staff2', password: '123', role: 'staff', center_id: 'C002', status: 'active' },\n        { id: 'S006', name: 'Sunita Verma (System Operator)', login_id: 'staff3', password: '123', role: 'staff', center_id: 'C003', status: 'inactive' }\n    ],\n    students: [\n        { id: 'RAD-2026-001', student_name: 'Aditya Narayan', father_name: 'Surendra Prasad', course: 'ADCA', mobile: '9565123456', address: 'Gola Bazaar, Ward No 4', admission_date: '2026-01-10', fees: 15000, center_id: 'C001', status: 'active' },\n        { id: 'RAD-2026-002', student_name: 'Priya Singh', father_name: 'Ramesh Singh', course: 'DCA', mobile: '9988776655', address: 'Rampuri Colony, Lane 3', admission_date: '2026-02-15', fees: 8000, center_id: 'C001', status: 'active' },\n        { id: 'RAD-2026-003', student_name: 'Vikram Malhotra', father_name: 'K. P. Malhotra', course: 'PGDCA', mobile: '9123456789', address: 'Civil Lines Area', admission_date: '2026-03-05', fees: 18000, center_id: 'C002', status: 'active' },\n        { id: 'RAD-2026-004', student_name: 'Neha Gupta', father_name: 'M. L. Gupta', course: 'CCC', mobile: '9839401234', address: 'Shastri Nagar', admission_date: '2026-04-01', fees: 3500, center_id: 'C002', status: 'active' },\n        { id: 'RAD-2026-005', student_name: 'Sandeep Yadav', father_name: 'Ram Chandra Yadav', course: 'O-Level', mobile: '7309876543', address: 'Village Pipra, Post Harra', admission_date: '2026-01-22', fees: 12000, center_id: 'C003', status: 'active' },\n        { id: 'RAD-2026-006', student_name: 'Komal Preet Kaur', father_name: 'Gurmukh Singh', course: 'ADCA', mobile: '8127394850', address: 'Model Town Ext', admission_date: '2026-04-20', fees: 15000, center_id: 'C003', status: 'active' },\n        { id: 'RAD-2026-007', student_name: 'Rahul Verma', father_name: 'Satya Prakash Verma', course: 'PGDCA', mobile: '9450392817', address: 'Station Road, Gali 2', admission_date: '2026-02-18', fees: 18000, center_id: 'C002', status: 'completed' },\n        { id: 'RAD-2026-008', student_name: 'Sneha Tiwari', father_name: 'J. P. Tiwari', course: 'DCA', mobile: '9670394857', address: 'Vikas Nagar Sector A', admission_date: '2026-05-02', fees: 8000, center_id: 'C001', status: 'active' }\n    ],\n    fees: [\n        { id: 'INV-10001', student_id: 'RAD-2026-001', amount: 5000, payment_date: '2026-01-10', payment_mode: 'Cash', remark: 'Admission installment' },\n        { id: 'INV-10002', student_id: 'RAD-2026-001', amount: 5000, payment_date: '2026-03-15', payment_mode: 'UPI', remark: 'Second installment' },\n        { id: 'INV-10003', student_id: 'RAD-2026-002', amount: 4000, payment_date: '2026-02-15', payment_mode: 'Card', remark: '50% fees payment' },\n        { id: 'INV-10004', student_id: 'RAD-2026-003', amount: 10000, payment_date: '2026-03-05', payment_mode: 'UPI', remark: 'Admission payment' },\n        { id: 'INV-10005', student_id: 'RAD-2026-004', amount: 3500, payment_date: '2026-04-01', payment_mode: 'Cash', remark: 'Full fees paid' },\n        { id: 'INV-10006', student_id: 'RAD-2026-005', amount: 6000, payment_date: '2026-01-22', payment_mode: 'UPI', remark: 'First installment' },\n        { id: 'INV-10007', student_id: 'RAD-2026-006', amount: 7500, payment_date: '2026-04-20', payment_mode: 'Cash', remark: '50% course fee' },\n        { id: 'INV-10008', student_id: 'RAD-2026-007', amount: 18000, payment_date: '2026-02-18', payment_mode: 'UPI', remark: 'Full fees paid' }\n    ],\n    expenses: [\n        { id: 'EXP-5001', center_id: 'C001', title: 'Office Electricity Bill', amount: 3200, date: '2026-05-10', category: 'Electricity' },\n        { id: 'EXP-5002', center_id: 'C002', title: 'Whiteboard & Stationary purchase', amount: 850, date: '2026-05-15', category: 'Office Supplies' },\n        { id: 'EXP-5003', center_id: 'C001', title: 'Computer Lab Maintenance', amount: 4500, date: '2026-05-20', category: 'Others' },\n        { id: 'EXP-5004', center_id: 'C003', title: 'Center Rent (May 2026)', amount: 12000, date: '2026-06-01', category: 'Rent' }\n    ],\n    notices: [\n        { id: 'N001', title: 'Summer Vacation Announcement', message: 'Radhika IT College campuses will remain closed for summer vacation from June 15 to June 30. Regular online support will be available.', date: '2026-06-10', target: 'all' },\n        { id: 'N002', title: 'Super Admin Advisory on Fees Collection', message: 'All Center Admins are advised to follow up on pending fees collection before the vacation starts.', date: '2026-06-11', target: 'center_admin' }\n    ],\n    courses: [\n        { id: 'COURSE-001', code: 'DCA', name: 'Diploma in Computer Applications', duration: '6 Months', fee: 8000, description: 'Core computer fundamentals and office automation.' },\n        { id: 'COURSE-002', code: 'ADCA', name: 'Advanced Diploma in Computer Applications', duration: '12 Months', fee: 15000, description: 'Advanced software, web and accounting applications.' },\n        { id: 'COURSE-003', code: 'PGDCA', name: 'Post Graduate Diploma in Computer Applications', duration: '12 Months', fee: 18000, description: 'Professional-level programming and DBMS training.' },\n        { id: 'COURSE-004', code: 'O-Level', name: 'NIELIT O-Level', duration: '12 Months', fee: 12000, description: 'Foundation computing and ICT skill development.' },\n        { id: 'COURSE-005', code: 'CCC', name: 'Course on Computer Concepts', duration: '3 Months', fee: 3500, description: 'Short computer literacy and productivity course.' },\n        { id: 'COURSE-006', code: 'BA', name: 'Basic Accounting', duration: '6 Months', fee: 6500, description: 'Accounting principles and business entries.' }\n    ],\n    attendance: []\n};\n\nconst DB = {\n    init() {\n        Object.entries(SEED_DATA).forEach(([key, value]) => {\n            const storageKey = DB_KEYS[key.toUpperCase()] || key;\n            if (!localStorage.getItem(storageKey)) {\n                localStorage.setItem(storageKey, JSON.stringify(value));\n            }\n        });\n\n        if (!localStorage.getItem(DB_KEYS.COURSES)) {\n            localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(SEED_DATA.courses));\n        }\n\n        if (!localStorage.getItem(DB_KEYS.CURRENT_USER)) {\n            localStorage.removeItem(DB_KEYS.CURRENT_USER);\n        }\n\n        this.syncFromServer();\n    },\n\n    async syncFromServer() {\n        try {\n            const response = await fetch('/api/collections');\n            if (!response.ok) return;\n            const data = await response.json();\n            Object.entries(data).forEach(([key, value]) => {\n                if (key === 'current_user') return;\n                localStorage.setItem(key, JSON.stringify(value));\n            });\n        } catch (error) {\n            console.warn('Backend sync not available, using local data.', error.message);\n        }\n    },\n\n    getCenters() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.CENTERS)) || [];\n    },\n    getStaff() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.STAFF)) || [];\n    },\n    getStudents() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.STUDENTS)) || [];\n    },\n    getFees() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.FEES)) || [];\n    },\n    getExpenses() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.EXPENSES)) || [];\n    },\n    getNotices() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.NOTICES)) || [];\n    },\n    getCourses() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.COURSES)) || [];\n    },\n    getAttendance() {\n        return JSON.parse(localStorage.getItem(DB_KEYS.ATTENDANCE)) || [];\n    },\n    getCurrentUser() {\n        const rawUser = localStorage.getItem(DB_KEYS.CURRENT_USER);\n        if (!rawUser || rawUser === 'null' || rawUser === '[]') {\n            return null;\n        }\n\n        try {\n            const user = JSON.parse(rawUser);\n            return user && typeof user === 'object' && !Array.isArray(user) ? user : null;\n        } catch (error) {\n            return null;\n        }\n    },\n\n    async syncCollectionToServer(key, data) {\n        try {\n            await fetch('/api/data/' + encodeURIComponent(key), {\n                method: 'POST',\n                headers: { 'Content-Type': 'application/json' },\n                body: JSON.stringify(data)\n            });\n        } catch (e) {\n            console.warn('Sync to server failed for ' + key + ':', e.message);\n        }\n    },\n\n    saveCenters(data) {\n        localStorage.setItem(DB_KEYS.CENTERS, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.CENTERS, data);\n    },\n    saveStaff(data) {\n        localStorage.setItem(DB_KEYS.STAFF, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.STAFF, data);\n    },\n    saveStudents(data) {\n        localStorage.setItem(DB_KEYS.STUDENTS, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.STUDENTS, data);\n    },\n    saveFees(data) {\n        localStorage.setItem(DB_KEYS.FEES, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.FEES, data);\n    },\n    saveExpenses(data) {\n        localStorage.setItem(DB_KEYS.EXPENSES, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.EXPENSES, data);\n    },\n    saveNotices(data) {\n        localStorage.setItem(DB_KEYS.NOTICES, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.NOTICES, data);\n    },\n    saveCourses(data) {\n        localStorage.setItem(DB_KEYS.COURSES, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.COURSES, data);\n    },\n    saveAttendance(data) {\n        localStorage.setItem(DB_KEYS.ATTENDANCE, JSON.stringify(data));\n        this.syncCollectionToServer(DB_KEYS.ATTENDANCE, data);\n    },\n    setCurrentUser(user) {\n        if (user) {\n            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));\n        } else {\n            localStorage.removeItem(DB_KEYS.CURRENT_USER);\n        }\n    },\n\n    addCenter(center) {\n        const centers = this.getCenters();\n        centers.push(center);\n        this.saveCenters(centers);\n    },\n    updateCenter(updatedCenter) {\n        let centers = this.getCenters();\n        centers = centers.map(c => c.id === updatedCenter.id ? updatedCenter : c);\n        this.saveCenters(centers);\n    },\n    deleteCenter(centerId) {\n        let centers = this.getCenters();\n        centers = centers.filter(c => c.id !== centerId);\n        this.saveCenters(centers);\n    },\n    addStaff(member) {\n        const staff = this.getStaff();\n        staff.push(member);\n        this.saveStaff(staff);\n    },\n    updateStaff(updatedMember) {\n        let staff = this.getStaff();\n        staff = staff.map(s => s.id === updatedMember.id ? updatedMember : s);\n        this.saveStaff(staff);\n    },\n    toggleStaffStatus(staffId) {\n        let staff = this.getStaff();\n        staff = staff.map(s => {\n            if (s.id === staffId) {\n                s.status = s.status === 'active' ? 'inactive' : 'active';\n            }\n            return s;\n        });\n        this.saveStaff(staff);\n    },\n    addStudent(student) {\n        const students = this.getStudents();\n        students.push(student);\n        this.saveStudents(students);\n    },\n    updateStudent(updatedStudent) {\n        let students = this.getStudents();\n        students = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);\n        this.saveStudents(students);\n    },\n    deleteStudent(studentId) {\n        const currentUser = this.getCurrentUser();\n        if (!currentUser || currentUser.role !== 'super_admin') {\n            return false;\n        }\n        let students = this.getStudents();\n        students = students.filter(s => s.id !== studentId);\n        this.saveStudents(students);\n        return true;\n    },\n    addCourse(course) {\n        const courses = this.getCourses();\n        courses.push(course);\n        this.saveCourses(courses);\n    },\n    updateCourse(updatedCourse) {\n        let courses = this.getCourses();\n        courses = courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);\n        this.saveCourses(courses);\n    },\n    deleteCourse(courseId) {\n        const currentUser = this.getCurrentUser();\n        if (!currentUser || currentUser.role !== 'super_admin') {\n            return false;\n        }\n        let courses = this.getCourses();\n        courses = courses.filter(c => c.id !== courseId);\n        this.saveCourses(courses);\n        return true;\n    },\n    submitFee(feeRecord) {\n        const fees = this.getFees();\n        fees.push(feeRecord);\n        this.saveFees(fees);\n    },\n    addExpense(expense) {\n        const expenses = this.getExpenses();\n        expenses.push(expense);\n        this.saveExpenses(expenses);\n    },\n    addNotice(notice) {\n        const notices = this.getNotices();\n        notices.push(notice);\n        this.saveNotices(notices);\n    },\n    addAttendance(record) {\n        const attendanceList = this.getAttendance();\n        attendanceList.push(record);\n        this.saveAttendance(attendanceList);\n    },\n    updateUserCredentials(userId, { name, login_id, password }) {\n        const staff = this.getStaff();\n        const sessionUser = this.getCurrentUser();\n        let target = staff.find(member => member.id === userId);\n\n        if (!target && sessionUser && sessionUser.login_id) {\n            target = staff.find(member => member.login_id.toLowerCase() === String(sessionUser.login_id).toLowerCase());\n        }\n\n        if (!target) {\n            target = staff.find(member => member.role === 'super_admin');\n        }\n\n        if (!target) {\n            return { success: false, message: 'User record not found.' };\n        }\n\n        const targetId = target.id;\n        const trimmedName = String(name || '').trim();\n        const trimmedLogin = String(login_id || '').trim();\n        const trimmedPassword = String(password || '').trim();\n\n        if (!trimmedName || !trimmedLogin || !trimmedPassword) {\n            return { success: false, message: 'Name, username, and password are required.' };\n        }\n\n        const duplicate = staff.some(member => member.id !== targetId && member.login_id.toLowerCase() === trimmedLogin.toLowerCase());\n        if (duplicate) {\n            return { success: false, message: 'This username is already assigned to another account.' };\n        }\n\n        const updatedStaff = staff.map(member => {\n            if (member.id === targetId) {\n                return { ...member, name: trimmedName, login_id: trimmedLogin, password: trimmedPassword };\n            }\n            return member;\n        });\n\n        this.saveStaff(updatedStaff);\n        try {\n            fetch('/api/data/staff', {\n                method: 'POST',\n                headers: { 'Content-Type': 'application/json' },\n                body: JSON.stringify(updatedStaff)\n            }).catch(() => {});\n        } catch (error) {\n            console.warn('Staff sync to backend failed:', error);\n        }\n\n        const currentUser = this.getCurrentUser();\n        const updatedSessionUser = {\n            ...(currentUser || target),\n            id: targetId,\n            name: trimmedName,\n            login_id: trimmedLogin,\n            password: trimmedPassword,\n            role: target.role,\n            center_id: target.center_id || '',\n            status: target.status || 'active'\n        };\n\n        if (currentUser && (currentUser.id === targetId || currentUser.login_id?.toLowerCase() === target.login_id.toLowerCase())) {\n            this.setCurrentUser(updatedSessionUser);\n        } else if (target.role === 'super_admin') {\n            this.setCurrentUser(updatedSessionUser);\n        }\n\n        return { success: true, message: 'Credentials updated successfully.' };\n    },\n\n    async login(loginId, password) {\n        try {\n            const response = await fetch('/api/login', {\n                method: 'POST',\n                headers: { 'Content-Type': 'application/json' },\n                body: JSON.stringify({ loginId, password })\n            });\n\n            const result = await response.json();\n            if (!result.success) {\n                return { success: false, message: result.message || 'Invalid Login ID or Password.' };\n            }\n\n            this.setCurrentUser(result.user);\n            return { success: true, user: result.user };\n        } catch (error) {\n            const staffList = this.getStaff();\n            const user = staffList.find(s => s.login_id.toLowerCase() === String(loginId).toLowerCase() && s.password === String(password));\n            if (user) {\n                if (user.status !== 'active') {\n                    return { success: false, message: 'Your account is deactivated. Contact Super Admin.' };\n                }\n                this.setCurrentUser(user);\n                return { success: true, user };\n            }\n            return { success: false, message: 'Invalid Login ID or Password.' };\n        }\n    },\n\n    async submitEnquiry(enquiry) {\n        try {\n            const response = await fetch('/api/enquiries', {\n                method: 'POST',\n                headers: { 'Content-Type': 'application/json' },\n                body: JSON.stringify(enquiry)\n            });\n            if (response.ok) return await response.json();\n        } catch (e) {\n            console.warn('Backend enquiry submission failed, saving locally:', e);\n        }\n        const enquiries = JSON.parse(localStorage.getItem('enquiries') || '[]');\n        enquiries.push({ ...enquiry, id: 'ENQ-' + Date.now(), created_at: new Date().toISOString() });\n        localStorage.setItem('enquiries', JSON.stringify(enquiries));\n        return { success: true, message: 'Enquiry saved.' };\n    },\n\n    logout() {\n        this.setCurrentUser(null);\n        fetch('/api/logout', { method: 'POST' }).catch(() => {});\n    },\n\n    resetDatabase() {\n        localStorage.clear();\n        this.init();\n    }\n};\n\nDB.init();\n",
  mainJs: "/**\n * Radhika IT College Management System - Public Pages JavaScript\n */\n\ndocument.addEventListener('DOMContentLoaded', () => {\n    // 1. Dark Mode Management\n    const themeToggle = document.getElementById('theme-toggle');\n    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');\n    \n    // Check local storage for preference\n    const currentTheme = localStorage.getItem('theme') || 'light';\n    if (currentTheme === 'dark') {\n        document.body.classList.add('dark-mode');\n        updateThemeIcons(true);\n    }\n\n    function toggleTheme() {\n        const isDark = document.body.classList.toggle('dark-mode');\n        localStorage.setItem('theme', isDark ? 'dark' : 'light');\n        updateThemeIcons(isDark);\n    }\n\n    function updateThemeIcons(isDark) {\n        const iconClass = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';\n        if (themeToggle) themeToggle.innerHTML = `<i class=\"${iconClass}\"></i>`;\n        if (mobileThemeToggle) mobileThemeToggle.innerHTML = `<i class=\"${iconClass}\"></i>`;\n    }\n\n    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);\n    if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);\n\n    // 2. Responsive Header Elements Helper\n    function handleResize() {\n        const width = window.innerWidth;\n        const nav = document.querySelector('.site-nav');\n        if (width <= 768) {\n            if (mobileThemeToggle) mobileThemeToggle.style.display = 'flex';\n            const mobileLoginBtn = document.getElementById('mobile-login-btn');\n            if (mobileLoginBtn) mobileLoginBtn.style.display = 'inline-block';\n        } else {\n            if (mobileThemeToggle) mobileThemeToggle.style.display = 'none';\n            const mobileLoginBtn = document.getElementById('mobile-login-btn');\n            if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';\n        }\n    }\n    window.addEventListener('resize', handleResize);\n    handleResize();\n\n    // 3. Load Centers dynamically into preferred center dropdown\n    const centerSelect = document.getElementById('centerSelect');\n    if (centerSelect && typeof DB !== 'undefined') {\n        DB.ready.then(() => {\n            DB.getCenters().forEach(center => {\n                const option = document.createElement('option');\n                option.value = center.id;\n                option.textContent = `${center.center_name} (${center.center_code})`;\n                centerSelect.appendChild(option);\n            });\n        });\n    }\n\n    // 4. Smooth scroll & active navigation highlights\n    const navLinks = document.querySelectorAll('.nav-link');\n    window.addEventListener('scroll', () => {\n        let current = '';\n        const sections = document.querySelectorAll('section');\n        const scrollPosition = window.scrollY + 150;\n\n        sections.forEach(section => {\n            const sectionTop = section.offsetTop;\n            const sectionHeight = section.clientHeight;\n            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {\n                current = section.getAttribute('id');\n            }\n        });\n\n        navLinks.forEach(link => {\n            link.classList.remove('active');\n            if (link.getAttribute('href') === `#${current}`) {\n                link.classList.add('active');\n            }\n        });\n    });\n\n    // 5. Toast Notifications Helper\n    function showToast(message, type = 'success') {\n        const container = document.getElementById('toastContainer');\n        if (!container) return;\n\n        const toast = document.createElement('div');\n        toast.className = `toast toast-${type}`;\n        \n        let icon = '<i class=\"fa-solid fa-circle-check\" style=\"color: var(--success)\"></i>';\n        if (type === 'danger') icon = '<i class=\"fa-solid fa-circle-xmark\" style=\"color: var(--danger)\"></i>';\n        if (type === 'warning') icon = '<i class=\"fa-solid fa-triangle-exclamation\" style=\"color: var(--warning)\"></i>';\n\n        toast.innerHTML = `\n            ${icon}\n            <div>\n                <p style=\"font-weight: 600; font-size: 0.9rem;\">${type.toUpperCase()}</p>\n                <p style=\"font-size: 0.85rem; color: var(--text-secondary);\">${message}</p>\n            </div>\n        `;\n\n        container.appendChild(toast);\n        \n        // Remove toast after 4 seconds\n        setTimeout(() => {\n            toast.style.animation = 'slideIn 0.3s reverse forwards';\n            setTimeout(() => {\n                toast.remove();\n            }, 300);\n        }, 4000);\n    }\n\n    // 6. Enquiry Form Submission Logic\n    const enquiryForm = document.getElementById('enquiryForm');\n    if (enquiryForm) {\n        enquiryForm.addEventListener('submit', async (e) => {\n            e.preventDefault();\n            \n            const submitButton = enquiryForm.querySelector('button[type=\"submit\"]');\n            submitButton.disabled = true;\n            try {\n                await DB.submitEnquiry({\n                    student_name: document.getElementById('studentName').value,\n                    father_name: document.getElementById('fatherName').value,\n                    mobile: document.getElementById('mobileNo').value,\n                    course: document.getElementById('courseSelect').value,\n                    center_id: document.getElementById('centerSelect').value\n                });\n                showToast(`Inquiry submitted successfully! Our counselor will contact you soon.`, 'success');\n                enquiryForm.reset();\n            } catch (error) {\n                showToast(error.message || 'Could not submit your enquiry.', 'danger');\n            } finally {\n                submitButton.disabled = false;\n            }\n        });\n    }\n});\n",
  dashboardJs: "/**\n * Radhika IT College Management System - Core ERP Dashboard Controller\n */\n\ndocument.addEventListener('DOMContentLoaded', async () => {\n    await DB.ready;\n    // 1. Session & Auth Check\n    let currentUser = DB.getCurrentUser();\n    if (!currentUser) {\n        window.location.href = 'login.html';\n        return;\n    }\n\n    // Initialize user profile header details\n    const userNameEl = document.getElementById('userName');\n    const userRoleEl = document.getElementById('userRole');\n    const userAvatarEl = document.getElementById('userAvatar');\n\n    if (userNameEl) userNameEl.textContent = currentUser.name;\n    if (userRoleEl) {\n        const centerName = currentUser.center_id ? `(${getCenterCodeName(currentUser.center_id)})` : '';\n        userRoleEl.textContent = `${currentUser.role.replace('_', ' ')} ${centerName}`;\n    }\n    if (userAvatarEl) userAvatarEl.textContent = currentUser.name.charAt(0).toUpperCase();\n\n    const superAdminProfileBtn = document.getElementById('superAdminProfileBtn');\n    if (superAdminProfileBtn && currentUser.role === 'super_admin') {\n        superAdminProfileBtn.style.display = 'block';\n    }\n\n    // 2. Global State Variables\n    let currentView = currentUser.role === 'staff' ? 'students' : 'dashboard';\n    let globalSearchQuery = '';\n\n    // 3. Theme Manager\n    const themeToggle = document.getElementById('themeToggle');\n    const savedTheme = localStorage.getItem('theme') || 'light';\n    if (savedTheme === 'dark') {\n        document.body.classList.add('dark-mode');\n        updateThemeIcon(true);\n    }\n\n    if (themeToggle) {\n        themeToggle.addEventListener('click', () => {\n            const isDark = document.body.classList.toggle('dark-mode');\n            localStorage.setItem('theme', isDark ? 'dark' : 'light');\n            updateThemeIcon(isDark);\n            // Redraw charts if we are on dashboard view to adjust theme colors\n            if (currentView === 'dashboard') {\n                renderDashboardCharts();\n            }\n        });\n    }\n\n    function updateThemeIcon(isDark) {\n        if (themeToggle) {\n            themeToggle.innerHTML = isDark ? '<i class=\"fa-solid fa-sun\"></i>' : '<i class=\"fa-solid fa-moon\"></i>';\n        }\n    }\n\n    // 4. Sidebar Collapsible Controls\n    const sidebarToggle = document.getElementById('sidebarToggle');\n    const shell = document.getElementById('dashboardShell');\n    if (sidebarToggle && shell) {\n        sidebarToggle.addEventListener('click', () => {\n            const isMobile = window.innerWidth <= 768;\n            if (isMobile) {\n                shell.classList.toggle('sidebar-active');\n            } else {\n                shell.classList.toggle('sidebar-collapsed');\n            }\n        });\n    }\n\n    // 5. Notifications Dropdown Handler\n    const bellBtn = document.getElementById('bellBtn');\n    const notifDropdown = document.getElementById('notifDropdown');\n    const notifList = document.getElementById('notifList');\n    const bellBadge = document.getElementById('bellBadge');\n\n    if (bellBtn && notifDropdown) {\n        bellBtn.addEventListener('click', (e) => {\n            e.stopPropagation();\n            notifDropdown.classList.toggle('active');\n        });\n        document.addEventListener('click', () => {\n            notifDropdown.classList.remove('active');\n        });\n        notifDropdown.addEventListener('click', (e) => e.stopPropagation());\n    }\n\n    function loadNoticesDropdown() {\n        if (!notifList) return;\n        const notices = DB.getNotices();\n        // Filter notices based on user role\n        const filtered = notices.filter(n => {\n            if (n.target === 'all') return true;\n            if (n.target === 'center_admin' && currentUser.role === 'center_admin') return true;\n            if (n.target === 'staff' && currentUser.role === 'staff') return true;\n            if (n.target === 'super_admin' && currentUser.role === 'super_admin') return true;\n            return false;\n        }).reverse(); // Latest first\n\n        if (filtered.length === 0) {\n            notifList.innerHTML = '<p style=\"font-size:0.8rem; color:var(--text-muted); text-align:center; padding:10px;\">No alerts or notices.</p>';\n            if (bellBadge) bellBadge.style.display = 'none';\n        } else {\n            if (bellBadge) {\n                bellBadge.style.display = 'block';\n            }\n            notifList.innerHTML = filtered.map(n => `\n                <div class=\"notif-item\">\n                    <p style=\"font-weight:600; color:var(--primary);\">${escapeHTML(n.title)}</p>\n                    <p style=\"margin:2px 0;\">${escapeHTML(n.message)}</p>\n                    <div class=\"notif-time\"><i class=\"fa-regular fa-clock\"></i> ${n.date}</div>\n                </div>\n            `).join('');\n        }\n    }\n\n    const clearNotifBtn = document.getElementById('clearNotifBtn');\n    if (clearNotifBtn) {\n        clearNotifBtn.addEventListener('click', () => {\n            // Keep critical alerts but clear logs\n            const notices = DB.getNotices();\n            // Clear role specific notices\n            const kept = notices.filter(n => {\n                if (n.target === 'all') return false;\n                if (n.target === 'center_admin' && currentUser.role === 'center_admin') return false;\n                if (n.target === 'staff' && currentUser.role === 'staff') return false;\n                if (n.target === 'super_admin' && currentUser.role === 'super_admin') return false;\n                return true;\n            });\n            DB.saveNotices(kept);\n            loadNoticesDropdown();\n            showToast('Notices cleared locally.', 'info');\n        });\n    }\n\n    // 6. Navigation Sidebar items by Role\n    const menuItems = [\n        { id: 'dashboard', name: 'Dashboard', icon: 'fa-solid fa-chart-pie', roles: ['super_admin', 'center_admin'] },\n        { id: 'centers', name: 'Centers', icon: 'fa-solid fa-hotel', roles: ['super_admin'] },\n        { id: 'courses', name: 'Courses', icon: 'fa-solid fa-book-open', roles: ['super_admin'] },\n        { id: 'staff', name: 'Staff Management', icon: 'fa-solid fa-users-gear', roles: ['super_admin'] },\n        { id: 'staff_list', name: 'Branch Staff', icon: 'fa-solid fa-users', roles: ['center_admin'] },\n        { id: 'students', name: 'Student Admissions', icon: 'fa-solid fa-user-graduate', roles: ['super_admin', 'center_admin', 'staff'] },\n        { id: 'fees', name: 'Fees Portal', icon: 'fa-solid fa-indian-rupee-sign', roles: ['super_admin', 'center_admin', 'staff'] },\n        { id: 'attendance', name: 'Attendance System', icon: 'fa-regular fa-calendar-check', roles: ['super_admin', 'center_admin', 'staff'] },\n        { id: 'expenses', name: 'Expense Manager', icon: 'fa-solid fa-wallet', roles: ['super_admin', 'center_admin'] },\n        { id: 'notices', name: 'Notice Board', icon: 'fa-solid fa-bullhorn', roles: ['super_admin'] },\n        { id: 'backup', name: 'Backup & Utilities', icon: 'fa-solid fa-database', roles: ['super_admin'] }\n    ];\n\n    function renderSidebarMenu() {\n        const sidebarMenu = document.getElementById('sidebarMenu');\n        if (!sidebarMenu) return;\n\n        const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));\n        \n        sidebarMenu.innerHTML = filteredItems.map(item => `\n            <li class=\"menu-item ${item.id === currentView ? 'active' : ''}\" data-view=\"${item.id}\">\n                <a href=\"#\"><i class=\"${item.icon}\"></i> <span>${item.name}</span></a>\n            </li>\n        `).join('');\n\n        // Attach Click events\n        document.querySelectorAll('.menu-item').forEach(btn => {\n            btn.addEventListener('click', (e) => {\n                e.preventDefault();\n                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));\n                btn.classList.add('active');\n                \n                const targetView = btn.getAttribute('data-view');\n                loadView(targetView);\n                \n                // Hide sidebar drawer on mobile after clicking\n                if (window.innerWidth <= 768) {\n                    shell.classList.remove('sidebar-active');\n                }\n            });\n        });\n    }\n\n    // Set fallback default view if current role doesn't support dashboard\n    if (!menuItems.find(item => item.id === currentView && item.roles.includes(currentUser.role))) {\n        currentView = 'students'; // Staff starts at students page\n    }\n\n    // 7. Core View Router\n    function loadView(viewName) {\n        currentView = viewName;\n        const viewTitle = document.getElementById('viewTitle');\n        const viewBody = document.getElementById('viewBody');\n\n        if (!viewBody) return;\n\n        // Set Header Title\n        const selected = menuItems.find(item => item.id === viewName);\n        if (viewTitle && selected) {\n            viewTitle.textContent = selected.name;\n        }\n\n        // Search Bar Visibility (hide on settings/backup)\n        const searchBar = document.querySelector('.search-bar');\n        if (searchBar) {\n            if (['dashboard', 'backup', 'notices'].includes(viewName)) {\n                searchBar.style.visibility = 'hidden';\n            } else {\n                searchBar.style.visibility = 'visible';\n            }\n        }\n\n        // Render HTML based on view\n        switch (viewName) {\n            case 'dashboard':\n                renderDashboardView(viewBody);\n                break;\n            case 'centers':\n                renderCentersView(viewBody);\n                break;\n            case 'courses':\n                renderCoursesView(viewBody);\n                break;\n            case 'staff':\n                renderStaffView(viewBody);\n                break;\n            case 'staff_list':\n                renderBranchStaffView(viewBody);\n                break;\n            case 'students':\n                renderStudentsView(viewBody);\n                break;\n            case 'fees':\n                renderFeesView(viewBody);\n                break;\n            case 'attendance':\n                renderAttendanceView(viewBody);\n                break;\n            case 'expenses':\n                renderExpensesView(viewBody);\n                break;\n            case 'notices':\n                renderNoticesView(viewBody);\n                break;\n            case 'backup':\n                renderBackupView(viewBody);\n                break;\n            default:\n                viewBody.innerHTML = `<h3>Under Development</h3>`;\n        }\n    }\n\n    // 8. View Implementation Functions\n\n    // VIEW: DASHBOARD OVERVIEW\n    function renderDashboardView(container) {\n        // Collect metrics\n        const centers = DB.getCenters();\n        const staff = DB.getStaff();\n        const students = DB.getStudents();\n        const fees = DB.getFees();\n        const expenses = DB.getExpenses();\n\n        // Filters based on center admin assignment\n        let filteredStudents = students;\n        let filteredStaff = staff;\n        let filteredFees = fees;\n        let filteredExpenses = expenses;\n\n        if (currentUser.role === 'center_admin') {\n            filteredStudents = students.filter(s => s.center_id === currentUser.center_id);\n            filteredStaff = staff.filter(s => s.center_id === currentUser.center_id);\n            filteredFees = fees.filter(f => {\n                const std = students.find(s => s.id === f.student_id);\n                return std && std.center_id === currentUser.center_id;\n            });\n            filteredExpenses = expenses.filter(e => e.center_id === currentUser.center_id);\n        }\n\n        // Calculations\n        const totalCentersCount = centers.length;\n        const totalStudentsCount = filteredStudents.length;\n        const totalStaffCount = filteredStaff.length;\n\n        const totalFeesCollected = filteredFees.reduce((sum, f) => sum + f.amount, 0);\n        const totalExpensesPaid = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);\n\n        // Compute Pending Fees\n        const totalExpectedFees = filteredStudents.reduce((sum, s) => sum + s.fees, 0);\n        const pendingFeesCollection = totalExpectedFees - totalFeesCollected;\n\n        const netProfit = totalFeesCollected - totalExpensesPaid;\n\n        // Render dashboard grid & cards\n        let centerCountWidget = `\n            <div class=\"widget-card\">\n                <div class=\"widget-info\">\n                    <h4>Total Centers</h4>\n                    <p>${totalCentersCount}</p>\n                    <span>Registered branches</span>\n                </div>\n                <div class=\"widget-icon primary\"><i class=\"fa-solid fa-hotel\"></i></div>\n            </div>\n        `;\n\n        // Hide center counter widget for Center Admins, replace with Active Students count or Net Income\n        if (currentUser.role === 'center_admin') {\n            centerCountWidget = `\n                <div class=\"widget-card\">\n                    <div class=\"widget-info\">\n                        <h4>Net Income</h4>\n                        <p>₹${netProfit.toLocaleString('en-IN')}</p>\n                        <span>Collection - Expenses</span>\n                    </div>\n                    <div class=\"widget-icon primary\"><i class=\"fa-solid fa-sack-dollar\"></i></div>\n                </div>\n            `;\n        }\n\n        container.innerHTML = `\n            <!-- Stats Widgets -->\n            <div class=\"widgets-grid\">\n                ${centerCountWidget}\n                <div class=\"widget-card\">\n                    <div class=\"widget-info\">\n                        <h4>Total Students</h4>\n                        <p>${totalStudentsCount}</p>\n                        <span>Active Admissions</span>\n                    </div>\n                    <div class=\"widget-icon success\"><i class=\"fa-solid fa-user-graduate\"></i></div>\n                </div>\n                <div class=\"widget-card\">\n                    <div class=\"widget-info\">\n                        <h4>Staff Strength</h4>\n                        <p>${totalStaffCount}</p>\n                        <span>Assigned counselors</span>\n                    </div>\n                    <div class=\"widget-icon info\"><i class=\"fa-solid fa-users\"></i></div>\n                </div>\n                <div class=\"widget-card\">\n                    <div class=\"widget-info\">\n                        <h4>Fees Collected</h4>\n                        <p>₹${totalFeesCollected.toLocaleString('en-IN')}</p>\n                        <span>Total revenue received</span>\n                    </div>\n                    <div class=\"widget-icon warning\"><i class=\"fa-solid fa-indian-rupee-sign\"></i></div>\n                </div>\n                <div class=\"widget-card\">\n                    <div class=\"widget-info\">\n                        <h4>Pending Fees</h4>\n                        <p>₹${pendingFeesCollection > 0 ? pendingFeesCollection.toLocaleString('en-IN') : 0}</p>\n                        <span>Pending collection</span>\n                    </div>\n                    <div class=\"widget-icon danger\"><i class=\"fa-solid fa-circle-exclamation\"></i></div>\n                </div>\n            </div>\n\n            <!-- Dynamic SVGs Charts section -->\n            <div class=\"charts-grid\">\n                <div class=\"chart-card\">\n                    <div class=\"chart-header\">\n                        <h3>Monthly Collections & Growth</h3>\n                        <span class=\"badge badge-primary\"><i class=\"fa-solid fa-calendar-days\"></i> Calendar Year 2026</span>\n                    </div>\n                    <div class=\"chart-container\" id=\"monthlyFeesChartContainer\"></div>\n                </div>\n                \n                <div class=\"chart-card\">\n                    <div class=\"chart-header\">\n                        <h3>Center Enrollment Share</h3>\n                        <span class=\"badge badge-info\"><i class=\"fa-solid fa-chart-pie\"></i> Student Share</span>\n                    </div>\n                    <div class=\"chart-container\" id=\"centerShareChartContainer\"></div>\n                </div>\n            </div>\n\n            <div style=\"display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;\">\n                <!-- Recent notice updates -->\n                <div class=\"chart-card\">\n                    <div class=\"chart-header\">\n                        <h3>Notice Board Announcements</h3>\n                        <button class=\"btn-secondary\" style=\"padding: 4px 10px; font-size:0.8rem;\" id=\"quickNoticeBtn\">View Notice Board</button>\n                    </div>\n                    <div class=\"activity-list\" id=\"dashboardNotices\">\n                        <!-- notices loaded -->\n                    </div>\n                </div>\n                \n                <!-- Recent transaction history -->\n                <div class=\"chart-card\">\n                    <div class=\"chart-header\">\n                        <h3>Recent Fee Payments</h3>\n                    </div>\n                    <div class=\"table-responsive\">\n                        <table class=\"data-table\" style=\"font-size: 0.8rem;\">\n                            <thead>\n                                <tr>\n                                    <th>Receipt</th>\n                                    <th>Student</th>\n                                    <th>Amount</th>\n                                    <th>Mode</th>\n                                </tr>\n                            </thead>\n                            <tbody id=\"dashboardRecentFees\">\n                                <!-- loaded -->\n                            </tbody>\n                        </table>\n                    </div>\n                </div>\n            </div>\n        `;\n\n        // Attach Quick Board Button\n        document.getElementById('quickNoticeBtn').addEventListener('click', () => {\n            if (currentUser.role === 'super_admin') {\n                loadView('notices');\n            } else {\n                bellBtn.click(); // toggle dropdown list\n            }\n        });\n\n        // Seed details into home view lists\n        loadDashboardSubLists(filteredFees, filteredStudents);\n        \n        // Render Charts\n        renderDashboardCharts();\n    }\n\n    function loadDashboardSubLists(filteredFees, students) {\n        const dashboardRecentFees = document.getElementById('dashboardRecentFees');\n        const dashboardNotices = document.getElementById('dashboardNotices');\n\n        // Recent Payments\n        const recentPayments = filteredFees.slice(-5).reverse();\n        if (recentPayments.length === 0) {\n            dashboardRecentFees.innerHTML = '<tr><td colspan=\"4\" style=\"text-align:center;\">No recent payments.</td></tr>';\n        } else {\n            dashboardRecentFees.innerHTML = recentPayments.map(f => {\n                const s = students.find(std => std.id === f.student_id);\n                const sName = s ? s.student_name : 'Unknown Student';\n                return `\n                    <tr>\n                        <td style=\"font-weight:600;\">${f.id}</td>\n                        <td>${escapeHTML(sName)}</td>\n                        <td style=\"color:var(--success); font-weight:600;\">₹${f.amount}</td>\n                        <td><span class=\"badge badge-info\">${f.payment_mode}</span></td>\n                    </tr>\n                `;\n            }).join('');\n        }\n\n        // Notices\n        const notices = DB.getNotices();\n        const filteredNotices = notices.filter(n => {\n            if (n.target === 'all') return true;\n            if (n.target === 'center_admin' && currentUser.role === 'center_admin') return true;\n            if (n.target === 'staff' && currentUser.role === 'staff') return true;\n            return false;\n        }).slice(-3).reverse();\n\n        if (filteredNotices.length === 0) {\n            dashboardNotices.innerHTML = '<p style=\"color:var(--text-muted); font-size:0.85rem; text-align:center; padding:15px;\">No active announcements.</p>';\n        } else {\n            dashboardNotices.innerHTML = filteredNotices.map(n => `\n                <div class=\"activity-item\">\n                    <div class=\"activity-dot\" style=\"background:${n.target === 'all' ? 'var(--primary)' : 'var(--warning)'};\"></div>\n                    <div class=\"activity-content\">\n                        <p style=\"font-weight:600; color:var(--text-primary);\">${escapeHTML(n.title)}</p>\n                        <p style=\"font-size:0.8rem; margin:2px 0;\">${escapeHTML(n.message)}</p>\n                        <span class=\"activity-time\"><i class=\"fa-regular fa-clock\"></i> Published on ${n.date}</span>\n                    </div>\n                </div>\n            `).join('');\n        }\n    }\n\n    // DRAW HIGH-QUALITY RESPONSIVE SVG CHARTS\n    function renderDashboardCharts() {\n        // Collect monthly collection totals for Jan - June 2026\n        const fees = DB.getFees();\n        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];\n        const values = [0, 0, 0, 0, 0, 0];\n\n        // Filter based on role center\n        fees.forEach(f => {\n            const date = new Date(f.payment_date);\n            if (date.getFullYear() === 2026) {\n                const m = date.getMonth(); // 0 is Jan, 5 is Jun\n                if (m >= 0 && m <= 5) {\n                    if (currentUser.role === 'center_admin') {\n                        const std = DB.getStudents().find(s => s.id === f.student_id);\n                        if (std && std.center_id === currentUser.center_id) {\n                            values[m] += f.amount;\n                        }\n                    } else {\n                        values[m] += f.amount;\n                    }\n                }\n            }\n        });\n\n        // 1. Monthly Fees Collections (SVG Area Chart)\n        const collectionContainer = document.getElementById('monthlyFeesChartContainer');\n        if (collectionContainer) {\n            const width = collectionContainer.clientWidth || 500;\n            const height = 250;\n            const maxVal = Math.max(...values, 10000) * 1.1;\n            \n            // Generate coordinates for SVG polyline\n            const padding = 40;\n            const chartWidth = width - padding * 2;\n            const chartHeight = height - padding * 2;\n            \n            const points = values.map((val, idx) => {\n                const x = padding + (idx * (chartWidth / (values.length - 1)));\n                const y = padding + chartHeight - (val / maxVal * chartHeight);\n                return { x, y, val };\n            });\n\n            const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');\n            const areaPointsStr = `${points[0].x},${padding + chartHeight} ${pointsStr} ${points[points.length-1].x},${padding + chartHeight}`;\n\n            const strokeColor = 'var(--primary)';\n            const gridColor = 'var(--border-color)';\n            const textColor = 'var(--text-secondary)';\n\n            collectionContainer.innerHTML = `\n                <svg width=\"100%\" height=\"100%\" viewBox=\"0 0 ${width} ${height}\" preserveAspectRatio=\"none\">\n                    <defs>\n                        <linearGradient id=\"chartGrad\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n                            <stop offset=\"0%\" stop-color=\"var(--primary)\" stop-opacity=\"0.3\"/>\n                            <stop offset=\"100%\" stop-color=\"var(--primary)\" stop-opacity=\"0.0\"/>\n                        </linearGradient>\n                    </defs>\n                    <!-- Y Grid lines & Labels -->\n                    ${[0, 0.25, 0.5, 0.75, 1].map(r => {\n                        const y = padding + chartHeight * r;\n                        const labelVal = Math.round(maxVal * (1 - r));\n                        return `\n                            <line x1=\"${padding}\" y1=\"${y}\" x2=\"${width - padding}\" y2=\"${y}\" stroke=\"${gridColor}\" stroke-dasharray=\"4\" stroke-width=\"1\"/>\n                            <text x=\"${padding - 10}\" y=\"${y + 4}\" font-size=\"10\" fill=\"${textColor}\" text-anchor=\"end\">₹${labelVal >= 1000 ? (labelVal/1000) + 'k' : labelVal}</text>\n                        `;\n                    }).join('')}\n                    \n                    <!-- X Labels -->\n                    ${points.map((p, idx) => `\n                        <line x1=\"${p.x}\" y1=\"${padding}\" x2=\"${p.x}\" y2=\"${padding + chartHeight}\" stroke=\"${gridColor}\" stroke-width=\"0.5\" opacity=\"0.3\"/>\n                        <text x=\"${p.x}\" y=\"${padding + chartHeight + 15}\" font-size=\"10\" fill=\"${textColor}\" text-anchor=\"middle\">${months[idx]}</text>\n                    `).join('')}\n\n                    <!-- Area under curve -->\n                    <polygon points=\"${areaPointsStr}\" fill=\"url(#chartGrad)\"/>\n                    \n                    <!-- Smooth Line -->\n                    <polyline points=\"${pointsStr}\" fill=\"none\" stroke=\"${strokeColor}\" stroke-width=\"3\"/>\n                    \n                    <!-- Data Nodes -->\n                    ${points.map(p => `\n                        <circle cx=\"${p.x}\" cy=\"${p.y}\" r=\"5\" fill=\"var(--bg-secondary)\" stroke=\"${strokeColor}\" stroke-width=\"2\"/>\n                        <text x=\"${p.x}\" y=\"${p.y - 10}\" font-size=\"9\" font-weight=\"700\" fill=\"var(--text-primary)\" text-anchor=\"middle\">₹${p.val}</text>\n                    `).join('')}\n                </svg>\n            `;\n        }\n\n        // 2. Center Student Share (SVG Pie Chart / Donut Chart)\n        const centerShareContainer = document.getElementById('centerShareChartContainer');\n        if (centerShareContainer) {\n            const centers = DB.getCenters();\n            const students = DB.getStudents();\n            const shareData = [];\n\n            // Compute student count per center\n            centers.forEach(c => {\n                const count = students.filter(s => s.center_id === c.id).length;\n                shareData.push({ name: c.center_name, count });\n            });\n\n            const totalStuds = students.length || 1;\n            const width = centerShareContainer.clientWidth || 300;\n            const height = 250;\n            const centerX = width / 2;\n            const centerY = height / 2.3;\n            const radius = 60;\n            const innerRadius = 35; // donut layout\n\n            let currentAngle = 0;\n            const colors = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];\n            \n            const paths = shareData.map((d, idx) => {\n                if (d.count === 0) return '';\n                const percentage = d.count / totalStuds;\n                const angle = percentage * 360;\n                \n                // Calculate arc points\n                const x1 = centerX + radius * Math.cos((currentAngle - 90) * Math.PI / 180);\n                const y1 = centerY + radius * Math.sin((currentAngle - 90) * Math.PI / 180);\n                const x2 = centerX + radius * Math.cos((currentAngle + angle - 90) * Math.PI / 180);\n                const y2 = centerY + radius * Math.sin((currentAngle + angle - 90) * Math.PI / 180);\n\n                const ix1 = centerX + innerRadius * Math.cos((currentAngle - 90) * Math.PI / 180);\n                const iy1 = centerY + innerRadius * Math.sin((currentAngle - 90) * Math.PI / 180);\n                const ix2 = centerX + innerRadius * Math.cos((currentAngle + angle - 90) * Math.PI / 180);\n                const iy2 = centerY + innerRadius * Math.sin((currentAngle + angle - 90) * Math.PI / 180);\n\n                const largeArc = angle > 180 ? 1 : 0;\n                const color = colors[idx % colors.length];\n\n                // Path string for donut slice\n                const pathStr = `\n                    M ${x1} ${y1}\n                    A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}\n                    L ${ix2} ${iy2}\n                    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}\n                    Z\n                `;\n                currentAngle += angle;\n                return { pathStr, color, ...d };\n            }).filter(p => p !== '');\n\n            // Legend labels HTML\n            const legendHtml = shareData.map((d, idx) => `\n                <div style=\"display:flex; align-items:center; gap:8px; font-size:0.8rem; color:var(--text-secondary);\">\n                    <div style=\"width:12px; height:12px; border-radius:3px; background:${colors[idx % colors.length]};\"></div>\n                    <span>${escapeHTML(d.name)}: <strong>${d.count}</strong></span>\n                </div>\n            `).join('');\n\n            centerShareContainer.innerHTML = `\n                <div style=\"display:grid; grid-template-columns: 1fr; gap:10px; height:100%;\">\n                    <svg width=\"100%\" height=\"150\" viewBox=\"0 0 ${width} 150\">\n                        ${paths.map(p => `\n                            <path d=\"${p.pathStr}\" fill=\"${p.color}\" stroke=\"var(--bg-secondary)\" stroke-width=\"2\">\n                                <title>${escapeHTML(p.name)}: ${p.count} students</title>\n                            </path>\n                        `).join('')}\n                        <!-- Inner text -->\n                        <text x=\"${centerX}\" y=\"${centerY + 5}\" font-weight=\"800\" font-size=\"12\" fill=\"var(--text-primary)\" text-anchor=\"middle\">${totalStuds} Studs</text>\n                    </svg>\n                    <div style=\"display:flex; justify-content:center; gap:15px; flex-wrap:wrap; margin-top:-10px;\">\n                        ${legendHtml}\n                    </div>\n                </div>\n            `;\n        }\n    }\n\n    // VIEW: CENTERS MANAGEMENT\n    function renderCentersView(container) {\n        const centers = DB.getCenters();\n        const students = DB.getStudents();\n        const staff = DB.getStaff();\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3>Registered Study Centers</h3>\n                    <button class=\"btn-primary\" id=\"btnAddCenter\"><i class=\"fa-solid fa-plus mr-2\"></i> Register New Center</button>\n                </div>\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Code</th>\n                                <th>Center Name</th>\n                                <th>Director / Head</th>\n                                <th>Contact No</th>\n                                <th>Address</th>\n                                <th>Metrics</th>\n                                <th>Actions</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${centers.map(c => {\n                                const studCount = students.filter(s => s.center_id === c.id).length;\n                                const staffCount = staff.filter(s => s.center_id === c.id).length;\n                                return `\n                                    <tr>\n                                        <td style=\"font-weight:700;\">${c.center_code}</td>\n                                        <td style=\"font-weight:600; color:var(--primary);\">${escapeHTML(c.center_name)}</td>\n                                        <td>${escapeHTML(c.head_name)}</td>\n                                        <td>${c.contact}</td>\n                                        <td>${escapeHTML(c.address)}</td>\n                                        <td>\n                                            <span class=\"badge badge-primary\">${studCount} Students</span>\n                                            <span class=\"badge badge-info\">${staffCount} Staff</span>\n                                        </td>\n                                        <td>\n                                            <div class=\"actions-cell\">\n                                                <button class=\"btn-icon edit\" onclick=\"editCenterHandler('${c.id}')\" title=\"Edit Center\"><i class=\"fa-solid fa-pen\"></i></button>\n                                                <button class=\"btn-icon delete\" onclick=\"deleteCenterHandler('${c.id}')\" title=\"Remove Center\"><i class=\"fa-solid fa-trash\"></i></button>\n                                            </div>\n                                        </td>\n                                    </tr>\n                                `;\n                            }).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n\n        // Register button bindings\n        document.getElementById('btnAddCenter').addEventListener('click', () => {\n            openCenterModal();\n        });\n    }\n\n    // VIEW: STAFF MANAGEMENT (SUPER ADMIN)\n    function renderStaffView(container) {\n        const staff = DB.getStaff();\n        const centers = DB.getCenters();\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3>Administrative Office Staff</h3>\n                    <button class=\"btn-primary\" id=\"btnAddStaff\"><i class=\"fa-solid fa-plus-user mr-2\"></i> Add Office Staff</button>\n                </div>\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Name</th>\n                                <th>Login ID</th>\n                                <th>Role</th>\n                                <th>Assigned Center</th>\n                                <th>Account Status</th>\n                                <th>Password</th>\n                                <th>Actions</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${staff.map(s => {\n                                const centerName = s.center_id ? getCenterCodeName(s.center_id) : 'All Centers (HQ)';\n                                const isSuper = s.role === 'super_admin';\n                                const badgeClass = s.role === 'super_admin' ? 'badge-danger' : (s.role === 'center_admin' ? 'badge-primary' : 'badge-info');\n                                \n                                return `\n                                    <tr>\n                                        <td style=\"font-weight:600; color:var(--primary);\">${escapeHTML(s.name)}</td>\n                                        <td style=\"font-weight:500;\">${s.login_id}</td>\n                                        <td><span class=\"badge ${badgeClass}\">${s.role.replace('_', ' ').toUpperCase()}</span></td>\n                                        <td>${escapeHTML(centerName)}</td>\n                                        <td>\n                                            <button class=\"badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}\" \n                                                    style=\"border:none; cursor:pointer;\" \n                                                    onclick=\"toggleStaffStatusHandler('${s.id}')\">\n                                                ${s.status.toUpperCase()}\n                                            </button>\n                                        </td>\n                                        <td style=\"font-family: monospace;\">${s.password}</td>\n                                        <td>\n                                            <div class=\"actions-cell\">\n                                                <button class=\"btn-icon edit\" onclick=\"editStaffHandler('${s.id}')\" title=\"Edit Profile\"><i class=\"fa-solid fa-pen\"></i></button>\n                                                ${isSuper ? '' : `<button class=\"btn-icon delete\" onclick=\"deleteStaffHandler('${s.id}')\" title=\"Remove Profile\"><i class=\"fa-solid fa-user-slash\"></i></button>`}\n                                            </div>\n                                        </td>\n                                    </tr>\n                                `;\n                            }).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('btnAddStaff').addEventListener('click', () => {\n            openStaffModal();\n        });\n    }\n\n    // VIEW: BRANCH STAFF LIST (CENTER ADMIN SPECIFIC VIEW)\n    function renderBranchStaffView(container) {\n        const staff = DB.getStaff();\n        const centerStaff = staff.filter(s => s.center_id === currentUser.center_id);\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3>Staff Members at ${escapeHTML(getCenterCodeName(currentUser.center_id))}</h3>\n                </div>\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Name</th>\n                                <th>Login ID</th>\n                                <th>Role</th>\n                                <th>Status</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${centerStaff.map(s => `\n                                <tr>\n                                    <td style=\"font-weight:600; color:var(--primary);\">${escapeHTML(s.name)}</td>\n                                    <td>${s.login_id}</td>\n                                    <td><span class=\"badge badge-info\">${s.role.toUpperCase()}</span></td>\n                                    <td><span class=\"badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}\">${s.status.toUpperCase()}</span></td>\n                                </tr>\n                            `).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n    }\n\n    // VIEW: COURSE MANAGEMENT (SUPER ADMIN ONLY)\n    function renderCoursesView(container) {\n        const courses = DB.getCourses();\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3>Course Catalog Management</h3>\n                    <button class=\"btn-primary\" id=\"btnAddCourse\"><i class=\"fa-solid fa-plus mr-2\"></i> Add New Course</button>\n                </div>\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Code</th>\n                                <th>Course Name</th>\n                                <th>Duration</th>\n                                <th>Fee</th>\n                                <th>Description</th>\n                                <th>Actions</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${courses.map(course => `\n                                <tr>\n                                    <td style=\"font-weight:700;\">${escapeHTML(course.code)}</td>\n                                    <td style=\"font-weight:600; color:var(--primary);\">${escapeHTML(course.name)}</td>\n                                    <td>${escapeHTML(course.duration || 'N/A')}</td>\n                                    <td>₹${Number(course.fee || 0)}</td>\n                                    <td>${escapeHTML(course.description || '')}</td>\n                                    <td>\n                                        <div class=\"actions-cell\">\n                                            <button class=\"btn-icon edit\" onclick=\"editCourseHandler('${course.id}')\" title=\"Edit Course\"><i class=\"fa-solid fa-pen\"></i></button>\n                                            <button class=\"btn-icon delete\" onclick=\"deleteCourseHandler('${course.id}')\" title=\"Delete Course\"><i class=\"fa-solid fa-trash\"></i></button>\n                                        </div>\n                                    </td>\n                                </tr>\n                            `).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('btnAddCourse').addEventListener('click', () => {\n            openCourseModal();\n        });\n    }\n\n    // VIEW: STUDENT admissions DIRECTORY\n    function renderStudentsView(container) {\n        const students = DB.getStudents();\n        const centers = DB.getCenters();\n        const courses = DB.getCourses();\n        const courseOptions = courses.length ? courses : [\n            { code: 'DCA', name: 'DCA' },\n            { code: 'ADCA', name: 'ADCA' },\n            { code: 'PGDCA', name: 'PGDCA' },\n            { code: 'O-Level', name: 'O-Level' },\n            { code: 'CCC', name: 'CCC' },\n            { code: 'BA', name: 'BA' }\n        ];\n\n        // Check search & filters\n        const activeSearch = globalSearchQuery.toLowerCase();\n        const filterCourse = document.getElementById('filterCourse') ? document.getElementById('filterCourse').value : '';\n        const filterCenter = document.getElementById('filterCenter') ? document.getElementById('filterCenter').value : '';\n\n        let filtered = students;\n        \n        // Center restriction\n        if (currentUser.role !== 'super_admin') {\n            filtered = students.filter(s => s.center_id === currentUser.center_id);\n        }\n\n        // Apply filters\n        if (activeSearch) {\n            filtered = filtered.filter(s => \n                s.student_name.toLowerCase().includes(activeSearch) || \n                s.father_name.toLowerCase().includes(activeSearch) || \n                s.id.toLowerCase().includes(activeSearch) || \n                s.mobile.includes(activeSearch)\n            );\n        }\n\n        if (filterCourse) {\n            filtered = filtered.filter(s => s.course === filterCourse);\n        }\n\n        if (filterCenter && currentUser.role === 'super_admin') {\n            filtered = filtered.filter(s => s.center_id === filterCenter);\n        }\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3 style=\"flex-grow:1;\">Student Admission Directory</h3>\n                    \n                    <div class=\"table-actions\">\n                        <!-- Course Filter -->\n                        <select id=\"filterCourse\" style=\"padding: 6px 12px; font-size: 0.85rem;\">\n                            <option value=\"\">All Courses</option>\n                            ${courseOptions.map(course => `<option value=\"${course.code}\" ${filterCourse === course.code ? 'selected' : ''}>${course.code}</option>`).join('')}\n                        </select>\n\n                        <!-- Center Filter (Super Admin only) -->\n                        ${currentUser.role === 'super_admin' ? `\n                            <select id=\"filterCenter\" style=\"padding: 6px 12px; font-size: 0.85rem;\">\n                                <option value=\"\">All Branches</option>\n                                ${centers.map(c => `<option value=\"${c.id}\" ${filterCenter === c.id ? 'selected' : ''}>${c.center_name}</option>`).join('')}\n                            </select>\n                        ` : ''}\n\n                        <!-- Export Button -->\n                        <button class=\"btn-secondary\" id=\"btnExportStudents\" style=\"padding: 8px 12px; font-size: 0.85rem;\" title=\"Download CSV\"><i class=\"fa-solid fa-file-excel mr-1\"></i> Excel</button>\n                        \n                        <!-- Register Student -->\n                        <button class=\"btn-primary\" id=\"btnAddStudent\" style=\"padding: 8px 12px; font-size: 0.85rem;\"><i class=\"fa-solid fa-plus mr-1\"></i> New Admission</button>\n                    </div>\n                </div>\n\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Adm ID</th>\n                                <th>Student Name</th>\n                                <th>Father's Name</th>\n                                <th>Course</th>\n                                <th>Mobile</th>\n                                <th>Admission Date</th>\n                                <th>Branch Center</th>\n                                <th>Status</th>\n                                <th>Cards & Prints</th>\n                                <th>Actions</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${filtered.map(s => {\n                                const cName = getCenterCodeName(s.center_id);\n                                return `\n                                    <tr>\n                                        <td style=\"font-weight:700;\">${s.id}</td>\n                                        <td style=\"font-weight:600; color:var(--primary);\">${escapeHTML(s.student_name)}</td>\n                                        <td>${escapeHTML(s.father_name)}</td>\n                                        <td><span class=\"badge badge-info\">${s.course}</span></td>\n                                        <td>${s.mobile}</td>\n                                        <td>${s.admission_date}</td>\n                                        <td>${escapeHTML(cName)}</td>\n                                        <td>\n                                            <span class=\"badge ${s.status === 'active' ? 'badge-success' : (s.status === 'completed' ? 'badge-primary' : 'badge-danger')}\">\n                                                ${s.status.toUpperCase()}\n                                            </span>\n                                        </td>\n                                        <td>\n                                            <div style=\"display:flex; gap:5px;\">\n                                                <button class=\"btn-icon print\" onclick=\"printStudentIdCard('${s.id}')\" title=\"Print Student ID Card\"><i class=\"fa-solid fa-address-card\"></i></button>\n                                                ${s.status === 'completed' ? `<button class=\"btn-icon print\" onclick=\"printCourseCertificate('${s.id}')\" title=\"Generate Certificate\" style=\"color:var(--warning); border-color:var(--warning);\"><i class=\"fa-solid fa-award\"></i></button>` : ''}\n                                            </div>\n                                        </td>\n                                        <td>\n                                            <div class=\"actions-cell\">\n                                                <button class=\"btn-icon edit\" onclick=\"editStudentHandler('${s.id}')\" title=\"Edit Details\"><i class=\"fa-solid fa-pen\"></i></button>\n                                                ${currentUser.role === 'super_admin' ? `<button class=\"btn-icon delete\" onclick=\"deleteStudentHandler('${s.id}')\" title=\"Remove Record\"><i class=\"fa-solid fa-trash\"></i></button>` : ''}\n                                            </div>\n                                        </td>\n                                    </tr>\n                                `;\n                            }).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n\n        // Attach event listeners\n        document.getElementById('btnAddStudent').addEventListener('click', () => {\n            openStudentModal();\n        });\n\n        document.getElementById('filterCourse').addEventListener('change', () => {\n            loadView('students');\n        });\n\n        if (currentUser.role === 'super_admin') {\n            document.getElementById('filterCenter').addEventListener('change', () => {\n                loadView('students');\n            });\n        }\n\n        document.getElementById('btnExportStudents').addEventListener('click', () => {\n            exportToCSV(filtered, 'Radhika_Students_Report.csv', ['id', 'student_name', 'father_name', 'course', 'mobile', 'admission_date', 'center_id', 'status']);\n        });\n    }\n\n    // VIEW: FEES PORTAL\n    function renderFeesView(container) {\n        const fees = DB.getFees();\n        const students = DB.getStudents();\n\n        let filteredFees = fees;\n        let filteredStudents = students;\n\n        // Role restriction\n        if (currentUser.role !== 'super_admin') {\n            filteredStudents = students.filter(s => s.center_id === currentUser.center_id);\n            filteredFees = fees.filter(f => {\n                const s = students.find(std => std.id === f.student_id);\n                return s && s.center_id === currentUser.center_id;\n            });\n        }\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3 style=\"flex-grow:1;\">Fees Invoicing & Payments</h3>\n                    <div class=\"table-actions\">\n                        <button class=\"btn-secondary\" id=\"btnExportFees\" style=\"padding: 8px 12px; font-size: 0.85rem;\" title=\"Download CSV\"><i class=\"fa-solid fa-file-excel mr-1\"></i> Excel</button>\n                        <button class=\"btn-primary\" id=\"btnCollectFee\" style=\"padding: 8px 12px; font-size: 0.85rem;\"><i class=\"fa-solid fa-receipt mr-1\"></i> Receive Fee Payment</button>\n                    </div>\n                </div>\n\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Invoice No</th>\n                                <th>Student ID</th>\n                                <th>Student Name</th>\n                                <th>Branch Center</th>\n                                <th>Amount Paid</th>\n                                <th>Payment Date</th>\n                                <th>Payment Mode</th>\n                                <th>Description</th>\n                                <th>Invoice Receipt</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${filteredFees.map(f => {\n                                const s = students.find(std => std.id === f.student_id);\n                                const sName = s ? s.student_name : 'N/A';\n                                const cName = s ? getCenterCodeName(s.center_id) : 'N/A';\n                                return `\n                                    <tr>\n                                        <td style=\"font-weight:700;\">${f.id}</td>\n                                        <td style=\"font-family:monospace;\">${f.student_id}</td>\n                                        <td style=\"font-weight:600; color:var(--primary);\">${escapeHTML(sName)}</td>\n                                        <td>${escapeHTML(cName)}</td>\n                                        <td style=\"font-weight:700; color:var(--success);\">₹${f.amount}</td>\n                                        <td>${f.payment_date}</td>\n                                        <td><span class=\"badge badge-info\">${f.payment_mode}</span></td>\n                                        <td>${escapeHTML(f.remark)}</td>\n                                        <td>\n                                            <button class=\"btn-icon print\" onclick=\"printPaymentReceipt('${f.id}')\" title=\"Print Fee Invoice\"><i class=\"fa-solid fa-file-invoice-dollar\"></i></button>\n                                        </td>\n                                    </tr>\n                                `;\n                            }).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('btnCollectFee').addEventListener('click', () => {\n            openFeeModal();\n        });\n\n        document.getElementById('btnExportFees').addEventListener('click', () => {\n            exportToCSV(filteredFees, 'Radhika_Fees_Report.csv', ['id', 'student_id', 'amount', 'payment_date', 'payment_mode', 'remark']);\n        });\n    }\n\n    // VIEW: ATTENDANCE ENTRY SYSTEM\n    function renderAttendanceView(container) {\n        const centers = DB.getCenters();\n        const students = DB.getStudents();\n        const attendance = DB.getAttendance();\n\n        const today = new Date().toISOString().split('T')[0];\n        \n        // Filters state\n        const filterCourse = document.getElementById('attnCourse') ? document.getElementById('attnCourse').value : 'ADCA';\n        const filterCenter = document.getElementById('attnCenter') ? document.getElementById('attnCenter').value : (currentUser.role === 'super_admin' ? centers[0]?.id : currentUser.center_id);\n\n        const centerStuds = students.filter(s => s.center_id === filterCenter && s.course === filterCourse && s.status === 'active');\n\n        // Check if attendance already taken for today\n        const existingRecord = attendance.find(a => a.center_id === filterCenter && a.course === filterCourse && a.date === today);\n\n        container.innerHTML = `\n            <div style=\"display:grid; grid-template-columns: 1fr; gap: 24px;\">\n                <div class=\"chart-card\">\n                    <div style=\"display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; margin-bottom:15px;\">\n                        <h3>Batch Attendance Registry</h3>\n                        <div style=\"display:flex; gap:12px; align-items:center; flex-wrap:wrap;\">\n                            <div class=\"form-group\" style=\"margin-bottom:0; flex-direction:row; align-items:center; gap:5px;\">\n                                <label style=\"white-space:nowrap;\">Course:</label>\n                                <select id=\"attnCourse\" style=\"padding:6px; font-size:0.85rem;\">\n                                    <option value=\"ADCA\" ${filterCourse === 'ADCA' ? 'selected' : ''}>ADCA</option>\n                                    <option value=\"DCA\" ${filterCourse === 'DCA' ? 'selected' : ''}>DCA</option>\n                                    <option value=\"PGDCA\" ${filterCourse === 'PGDCA' ? 'selected' : ''}>PGDCA</option>\n                                    <option value=\"O-Level\" ${filterCourse === 'O-Level' ? 'selected' : ''}>O-Level</option>\n                                    <option value=\"CCC\" ${filterCourse === 'CCC' ? 'selected' : ''}>CCC</option>\n                                </select>\n                            </div>\n\n                            ${currentUser.role === 'super_admin' ? `\n                                <div class=\"form-group\" style=\"margin-bottom:0; flex-direction:row; align-items:center; gap:5px;\">\n                                    <label style=\"white-space:nowrap;\">Center Branch:</label>\n                                    <select id=\"attnCenter\" style=\"padding:6px; font-size:0.85rem;\">\n                                        ${centers.map(c => `<option value=\"${c.id}\" ${filterCenter === c.id ? 'selected' : ''}>${c.center_name}</option>`).join('')}\n                                    </select>\n                                </div>\n                            ` : ''}\n\n                            <div class=\"form-group\" style=\"margin-bottom:0; flex-direction:row; align-items:center; gap:5px;\">\n                                <label style=\"white-space:nowrap;\">Date:</label>\n                                <input type=\"date\" id=\"attnDate\" value=\"${today}\" disabled style=\"padding:6px; font-size:0.85rem;\">\n                            </div>\n                        </div>\n                    </div>\n\n                    ${existingRecord ? `\n                        <div class=\"badge badge-success\" style=\"padding:15px; border-radius:var(--radius-md); width:100%; justify-content:center; font-size:0.95rem; margin-bottom:20px;\">\n                            <i class=\"fa-solid fa-circle-check\"></i> Attendance sheet for this course branch has already been submitted for today (${today}).\n                        </div>\n                    ` : ''}\n\n                    <div class=\"table-responsive\">\n                        <table class=\"data-table\">\n                            <thead>\n                                <tr>\n                                    <th>Adm ID</th>\n                                    <th>Student Name</th>\n                                    <th>Father's Name</th>\n                                    <th>Status Option</th>\n                                </tr>\n                            </thead>\n                            <tbody>\n                                ${centerStuds.length === 0 ? `\n                                    <tr><td colspan=\"4\" style=\"text-align:center;\">No active students found in this program batch.</td></tr>\n                                ` : centerStuds.map(s => {\n                                    const statusVal = existingRecord ? (existingRecord.records[s.id] || 'present') : 'present';\n                                    return `\n                                        <tr>\n                                            <td style=\"font-weight:700;\">${s.id}</td>\n                                            <td style=\"font-weight:600; color:var(--primary);\">${escapeHTML(s.student_name)}</td>\n                                            <td>${escapeHTML(s.father_name)}</td>\n                                            <td>\n                                                <div class=\"attendance-radio-group\">\n                                                    <label class=\"attendance-label\">\n                                                        <input type=\"radio\" name=\"att-${s.id}\" value=\"present\" ${statusVal === 'present' ? 'checked' : ''} ${existingRecord ? 'disabled' : ''}>\n                                                        <span style=\"color:var(--success); font-weight:600;\">Present</span>\n                                                    </label>\n                                                    <label class=\"attendance-label\">\n                                                        <input type=\"radio\" name=\"att-${s.id}\" value=\"absent\" ${statusVal === 'absent' ? 'checked' : ''} ${existingRecord ? 'disabled' : ''}>\n                                                        <span style=\"color:var(--danger); font-weight:600;\">Absent</span>\n                                                    </label>\n                                                </div>\n                                            </td>\n                                        </tr>\n                                    `;\n                                }).join('')}\n                            </tbody>\n                        </table>\n                    </div>\n\n                    ${(centerStuds.length > 0 && !existingRecord) ? `\n                        <div style=\"margin-top:20px; text-align:right;\">\n                            <button class=\"btn-primary\" id=\"btnSubmitAttendance\"><i class=\"fa-solid fa-cloud-arrow-up mr-2\"></i> Submit Attendance Sheet</button>\n                        </div>\n                    ` : ''}\n                </div>\n            </div>\n        `;\n\n        // Event triggers\n        document.getElementById('attnCourse').addEventListener('change', () => {\n            loadView('attendance');\n        });\n        if (currentUser.role === 'super_admin') {\n            document.getElementById('attnCenter').addEventListener('change', () => {\n                loadView('attendance');\n            });\n        }\n\n        // Attendance Submission Logic\n        const btnSubmitAttendance = document.getElementById('btnSubmitAttendance');\n        if (btnSubmitAttendance) {\n            btnSubmitAttendance.addEventListener('click', () => {\n                const records = {};\n                centerStuds.forEach(s => {\n                    const selectedRad = document.querySelector(`input[name=\"att-${s.id}\"]:checked`);\n                    records[s.id] = selectedRad ? selectedRad.value : 'present';\n                });\n\n                const record = {\n                    id: 'ATT-' + Date.now(),\n                    center_id: filterCenter,\n                    course: filterCourse,\n                    date: today,\n                    records: records\n                };\n\n                DB.addAttendance(record);\n                showToast('Attendance recorded successfully!', 'success');\n                loadView('attendance');\n            });\n        }\n    }\n\n    // VIEW: EXPENSE MANAGER\n    function renderExpensesView(container) {\n        const expenses = DB.getExpenses();\n        const centers = DB.getCenters();\n\n        let filteredExpenses = expenses;\n        if (currentUser.role !== 'super_admin') {\n            filteredExpenses = expenses.filter(e => e.center_id === currentUser.center_id);\n        }\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3>Branch Petty Cash & Expenses</h3>\n                    <button class=\"btn-primary\" id=\"btnAddExpense\"><i class=\"fa-solid fa-hand-holding-dollar mr-2\"></i> Log Expense</button>\n                </div>\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Ref ID</th>\n                                <th>Description</th>\n                                <th>Category</th>\n                                <th>Charged Branch</th>\n                                <th>Amount</th>\n                                <th>Logged Date</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${filteredExpenses.map(e => `\n                                <tr>\n                                    <td style=\"font-weight:700;\">${e.id}</td>\n                                    <td style=\"font-weight:600; color:var(--text-primary);\">${escapeHTML(e.title)}</td>\n                                    <td><span class=\"badge badge-info\">${e.category}</span></td>\n                                    <td>${escapeHTML(getCenterCodeName(e.center_id))}</td>\n                                    <td style=\"font-weight:700; color:var(--danger);\">₹${e.amount}</td>\n                                    <td>${e.date}</td>\n                                </tr>\n                            `).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('btnAddExpense').addEventListener('click', () => {\n            openExpenseModal();\n        });\n    }\n\n    // VIEW: NOTICE BOARD (SUPER ADMIN ONLY)\n    function renderNoticesView(container) {\n        const notices = DB.getNotices();\n\n        container.innerHTML = `\n            <div class=\"table-container\">\n                <div class=\"table-header-bar\">\n                    <h3>Notice Board Announcements</h3>\n                    <button class=\"btn-primary\" id=\"btnPublishNotice\"><i class=\"fa-solid fa-bullhorn mr-2\"></i> Publish notice</button>\n                </div>\n                <div class=\"table-responsive\">\n                    <table class=\"data-table\">\n                        <thead>\n                            <tr>\n                                <th>Date</th>\n                                <th>Title / Subject</th>\n                                <th>Message Content</th>\n                                <th>Target Group</th>\n                                <th>Status</th>\n                            </tr>\n                        </thead>\n                        <tbody>\n                            ${notices.map(n => `\n                                <tr>\n                                    <td style=\"font-weight:500;\">${n.date}</td>\n                                    <td style=\"font-weight:700; color:var(--primary);\">${escapeHTML(n.title)}</td>\n                                    <td style=\"white-space:normal; max-width:400px; font-size:0.85rem;\">${escapeHTML(n.message)}</td>\n                                    <td><span class=\"badge badge-primary\">${n.target.toUpperCase()}</span></td>\n                                    <td><span class=\"badge badge-success\">ACTIVE</span></td>\n                                </tr>\n                            `).join('')}\n                        </tbody>\n                    </table>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('btnPublishNotice').addEventListener('click', () => {\n            openNoticeModal();\n        });\n    }\n\n    // VIEW: BACKUP & UTILITIES (SUPER ADMIN ONLY)\n    function renderBackupView(container) {\n        container.innerHTML = `\n            <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:24px;\">\n                <!-- Backup Panel -->\n                <div class=\"chart-card\">\n                    <div class=\"chart-header\">\n                        <h3>Database System Backup</h3>\n                    </div>\n                    <p style=\"font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px;\">\n                        Download a snapshot backup of your entire ERP college database (including students, fees, centers, staff). You can store this backup JSON file safely or restore it later.\n                    </p>\n                    <div style=\"display:flex; flex-direction:column; gap:12px;\">\n                        <button class=\"btn-primary\" id=\"btnDownloadBackup\"><i class=\"fa-solid fa-download mr-2\"></i> Download Database Backup (JSON)</button>\n                        \n                        <div style=\"margin-top:20px; border-top: 1px solid var(--border-color); padding-top:20px;\">\n                            <h4 style=\"margin-bottom:10px; font-size:0.95rem;\">Restore Database from Backup</h4>\n                            <p style=\"font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;\">Warning: This will overwrite all current settings and logs!</p>\n                            <input type=\"file\" id=\"backupFileSelector\" accept=\".json\" style=\"width:100%; padding:8px; border:1px dashed var(--border-color); margin-bottom:10px;\">\n                            <button class=\"btn-secondary\" id=\"btnUploadBackup\" style=\"width:100%; border-color:var(--danger); color:var(--danger);\"><i class=\"fa-solid fa-upload mr-2\"></i> Upload & Overwrite Restore</button>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- Diagnostics Panel -->\n                <div class=\"chart-card\">\n                    <div class=\"chart-header\">\n                        <h3>Reset & System Diagnostics</h3>\n                    </div>\n                    <p style=\"font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px;\">\n                        Reset the system database to initial clean seed records. This will clear any testing entries you have created and boot up the system with original configuration.\n                    </p>\n                    <button class=\"btn-secondary\" id=\"btnResetDatabase\" style=\"border-color:var(--danger); color:var(--danger);\"><i class=\"fa-solid fa-arrows-rotate mr-2\"></i> Factory Reset Database</button>\n                </div>\n            </div>\n        `;\n\n        // Event hooks\n        document.getElementById('btnDownloadBackup').addEventListener('click', () => {\n            const backupObj = {\n                centers: DB.getCenters(),\n                staff: DB.getStaff(),\n                students: DB.getStudents(),\n                fees: DB.getFees(),\n                expenses: DB.getExpenses(),\n                notices: DB.getNotices(),\n                attendance: DB.getAttendance()\n            };\n            const dataStr = \"data:text/json;charset=utf-8,\" + encodeURIComponent(JSON.stringify(backupObj, null, 2));\n            const downloadAnchor = document.createElement('a');\n            downloadAnchor.setAttribute(\"href\", dataStr);\n            downloadAnchor.setAttribute(\"download\", `radhika_erp_backup_${new Date().toISOString().split('T')[0]}.json`);\n            document.body.appendChild(downloadAnchor);\n            downloadAnchor.click();\n            downloadAnchor.remove();\n            showToast('Backup JSON downloaded successfully!', 'success');\n        });\n\n        document.getElementById('btnUploadBackup').addEventListener('click', () => {\n            const fileInput = document.getElementById('backupFileSelector');\n            if (fileInput.files.length === 0) {\n                showToast('Please select a valid JSON backup file first.', 'warning');\n                return;\n            }\n            const file = fileInput.files[0];\n            const reader = new FileReader();\n            reader.onload = async function(e) {\n                try {\n                    const parsed = JSON.parse(e.target.result);\n                    if (parsed.centers && parsed.staff && parsed.students && parsed.fees) {\n                        const updates = [\n                            DB.saveCenters(parsed.centers),\n                            DB.saveStaff(parsed.staff),\n                            DB.saveStudents(parsed.students),\n                            DB.saveFees(parsed.fees)\n                        ];\n                        if (parsed.expenses) updates.push(DB.saveExpenses(parsed.expenses));\n                        if (parsed.notices) updates.push(DB.saveNotices(parsed.notices));\n                        if (parsed.attendance) updates.push(DB.saveAttendance(parsed.attendance));\n                        const results = await Promise.all(updates);\n                        const failure = results.find(result => !result.success);\n                        if (failure) throw new Error(failure.message || 'Restore failed.');\n\n                        showToast('Database restored successfully! Reloading...', 'success');\n                        setTimeout(() => window.location.reload(), 1500);\n                    } else {\n                        showToast('Invalid backup file formatting details.', 'danger');\n                    }\n                } catch (err) {\n                    showToast(err.message || 'Failed to restore database backup.', 'danger');\n                }\n            };\n            reader.readAsText(file);\n        });\n\n        document.getElementById('btnResetDatabase').addEventListener('click', () => {\n            if (confirm('Are you sure you want to completely restore the database back to demo defaults? This will erase all custom additions!')) {\n                showToast('Factory reset is not available for the Firebase database. Create a backup before making changes in Firebase Console.', 'warning');\n            }\n        });\n    }\n\n    // 9. Modal UI Logic & Overlays\n\n    // MODAL: SUPER ADMIN PROFILE\n    const superAdminProfileModal = document.getElementById('superAdminProfileModal');\n    const superAdminProfileForm = document.getElementById('superAdminProfileForm');\n\n    function openSuperAdminProfileModal() {\n        if (!superAdminProfileModal || !superAdminProfileForm) return;\n        document.getElementById('superAdminId').value = currentUser.id;\n        document.getElementById('superAdminNameInput').value = currentUser.name;\n        document.getElementById('superAdminLoginInput').value = currentUser.login_id;\n        document.getElementById('superAdminPasswordInput').value = '';\n        superAdminProfileModal.classList.add('active');\n    }\n\n    if (superAdminProfileBtn) {\n        superAdminProfileBtn.addEventListener('click', openSuperAdminProfileModal);\n    }\n\n    if (superAdminProfileForm) {\n        superAdminProfileForm.addEventListener('submit', async (e) => {\n            e.preventDefault();\n            const name = document.getElementById('superAdminNameInput').value.trim();\n            const login_id = document.getElementById('superAdminLoginInput').value.trim();\n            const password = document.getElementById('superAdminPasswordInput').value.trim();\n\n            const result = await DB.updateUserCredentials(currentUser.id, { name, login_id, password });\n            if (!result.success) {\n                showToast(result.message, 'warning');\n                return;\n            }\n\n            currentUser = DB.getCurrentUser();\n            if (userNameEl) userNameEl.textContent = currentUser.name;\n            if (userRoleEl) {\n                const centerName = currentUser.center_id ? `(${getCenterCodeName(currentUser.center_id)})` : '';\n                userRoleEl.textContent = `${currentUser.role.replace('_', ' ')} ${centerName}`;\n            }\n            if (userAvatarEl) userAvatarEl.textContent = currentUser.name.charAt(0).toUpperCase();\n\n            superAdminProfileModal.classList.remove('active');\n            showToast('Super Admin account updated successfully.', 'success');\n        });\n    }\n\n    // MODAL: CENTERS\n    const centerModal = document.getElementById('centerModal');\n    const centerForm = document.getElementById('centerForm');\n\n    function openCenterModal(centerId = null) {\n        centerForm.reset();\n        document.getElementById('centerId').value = '';\n        document.getElementById('centerModalTitle').textContent = 'Register New Center';\n\n        if (centerId) {\n            const centers = DB.getCenters();\n            const c = centers.find(center => center.id === centerId);\n            if (c) {\n                document.getElementById('centerId').value = c.id;\n                document.getElementById('centerNameInput').value = c.center_name;\n                document.getElementById('centerCodeInput').value = c.center_code;\n                document.getElementById('centerHeadInput').value = c.head_name;\n                document.getElementById('centerContactInput').value = c.contact;\n                document.getElementById('centerAddressInput').value = c.address;\n                document.getElementById('centerModalTitle').textContent = 'Edit Center Branch';\n            }\n        }\n        centerModal.classList.add('active');\n    }\n\n    if (centerForm) {\n        centerForm.addEventListener('submit', (e) => {\n            e.preventDefault();\n            const id = document.getElementById('centerId').value;\n            const center_name = document.getElementById('centerNameInput').value;\n            const center_code = document.getElementById('centerCodeInput').value;\n            const head_name = document.getElementById('centerHeadInput').value;\n            const contact = document.getElementById('centerContactInput').value;\n            const address = document.getElementById('centerAddressInput').value;\n\n            if (id) {\n                // Update\n                DB.updateCenter({ id, center_name, center_code, head_name, contact, address });\n                showToast('Center updated successfully.', 'success');\n            } else {\n                // Insert\n                const newId = 'C' + String(DB.getCenters().length + 1).padStart(3, '0');\n                DB.addCenter({ id: newId, center_name, center_code, head_name, contact, address });\n                showToast('Center registered successfully.', 'success');\n            }\n\n            centerModal.classList.remove('active');\n            loadView('centers');\n        });\n    }\n\n    window.editCenterHandler = function(centerId) {\n        openCenterModal(centerId);\n    };\n\n    window.deleteCenterHandler = function(centerId) {\n        if (confirm('Are you sure you want to delete this study center? All linked staff and students data will remain orphan.')) {\n            DB.deleteCenter(centerId);\n            showToast('Center removed from register.', 'danger');\n            loadView('centers');\n        }\n    };\n\n    // MODAL: STAFF\n    const staffModal = document.getElementById('staffModal');\n    const staffForm = document.getElementById('staffForm');\n    const staffCenterInput = document.getElementById('staffCenterInput');\n\n    function openStaffModal(staffId = null) {\n        staffForm.reset();\n        const staffPasswordInput = document.getElementById('staffPassInput');\n        document.getElementById('staffId').value = '';\n        document.getElementById('staffModalTitle').textContent = 'Add Office Staff';\n        staffPasswordInput.required = !staffId;\n\n        // Load Center options\n        const centers = DB.getCenters();\n        staffCenterInput.innerHTML = `<option value=\"\">All Branches / HQ</option>` + \n            centers.map(c => `<option value=\"${c.id}\">${c.center_name}</option>`).join('');\n\n        if (staffId) {\n            const staff = DB.getStaff();\n            const s = staff.find(member => member.id === staffId);\n            if (s) {\n                document.getElementById('staffId').value = s.id;\n                document.getElementById('staffNameInput').value = s.name;\n                document.getElementById('staffLoginInput').value = s.login_id;\n                staffPasswordInput.value = '';\n                staffPasswordInput.required = s.status !== 'active';\n                document.getElementById('staffRoleInput').value = s.role;\n                document.getElementById('staffCenterInput').value = s.center_id;\n                document.getElementById('staffModalTitle').textContent = 'Edit Staff Member';\n            }\n        }\n        staffModal.classList.add('active');\n    }\n\n    if (staffForm) {\n        staffForm.addEventListener('submit', (e) => {\n            e.preventDefault();\n            const id = document.getElementById('staffId').value;\n            const name = document.getElementById('staffNameInput').value;\n            const login_id = document.getElementById('staffLoginInput').value.trim();\n            const password = document.getElementById('staffPassInput').value;\n            const role = document.getElementById('staffRoleInput').value;\n            const center_id = document.getElementById('staffCenterInput').value;\n\n            // Simple validation\n            const exist = DB.getStaff().find(s => s.login_id.toLowerCase() === login_id.toLowerCase() && s.id !== id);\n            if (exist) {\n                showToast('Login ID username already taken.', 'warning');\n                return;\n            }\n\n            if (id) {\n                const old = DB.getStaff().find(s => s.id === id);\n                DB.updateStaff({ id, name, login_id, password, role, center_id, status: old ? old.status : 'active' });\n                showToast('Staff profile updated.', 'success');\n            } else {\n                const newId = 'S' + String(DB.getStaff().length + 1).padStart(3, '0');\n                DB.addStaff({ id: newId, name, login_id, password, role, center_id, status: 'active' });\n                showToast('New staff registered.', 'success');\n            }\n\n            staffModal.classList.remove('active');\n            loadView('staff');\n        });\n    }\n\n    const generatePassBtn = document.getElementById('generatePassBtn');\n    if (generatePassBtn) {\n        generatePassBtn.addEventListener('click', () => {\n            const chars = \"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\";\n            let pass = \"\";\n            for (let i = 0; i < 12; i++) {\n                pass += chars.charAt(Math.floor(Math.random() * chars.length));\n            }\n            document.getElementById('staffPassInput').value = pass;\n            showToast('Generated random password: ' + pass, 'info');\n        });\n    }\n\n    window.editStaffHandler = function(staffId) {\n        openStaffModal(staffId);\n    };\n\n    window.deleteStaffHandler = function(staffId) {\n        if (confirm('Are you sure you want to remove this staff profile?')) {\n            let staff = DB.getStaff().filter(s => s.id !== staffId);\n            DB.saveStaff(staff);\n            showToast('Staff profile removed.', 'danger');\n            loadView('staff');\n        }\n    };\n\n    window.toggleStaffStatusHandler = function(staffId) {\n        DB.toggleStaffStatus(staffId);\n        showToast('Staff status updated.', 'info');\n        loadView('staff');\n    };\n\n    // MODAL: COURSES\n    const courseModal = document.getElementById('courseModal');\n    const courseForm = document.getElementById('courseForm');\n\n    function openCourseModal(courseId = null) {\n        courseForm.reset();\n        document.getElementById('courseId').value = '';\n        document.getElementById('courseModalTitle').textContent = 'Add New Course';\n\n        if (courseId) {\n            const courses = DB.getCourses();\n            const course = courses.find(c => c.id === courseId);\n            if (course) {\n                document.getElementById('courseId').value = course.id;\n                document.getElementById('courseNameInput').value = course.name;\n                document.getElementById('courseCodeInput').value = course.code;\n                document.getElementById('courseDurationInput').value = course.duration;\n                document.getElementById('courseFeeInput').value = course.fee;\n                document.getElementById('courseDescriptionInput').value = course.description;\n                document.getElementById('courseModalTitle').textContent = 'Edit Course';\n            }\n        }\n        courseModal.classList.add('active');\n    }\n\n    if (courseForm) {\n        courseForm.addEventListener('submit', (e) => {\n            e.preventDefault();\n            const id = document.getElementById('courseId').value;\n            const name = document.getElementById('courseNameInput').value.trim();\n            const code = document.getElementById('courseCodeInput').value.trim();\n            const duration = document.getElementById('courseDurationInput').value.trim();\n            const fee = Number(document.getElementById('courseFeeInput').value);\n            const description = document.getElementById('courseDescriptionInput').value.trim();\n\n            if (!name || !code) {\n                showToast('Course name and code are required.', 'warning');\n                return;\n            }\n\n            const existing = DB.getCourses().find(c => c.code.toLowerCase() === code.toLowerCase() && c.id !== id);\n            if (existing) {\n                showToast('This course code already exists. Use another code.', 'warning');\n                return;\n            }\n\n            if (id) {\n                DB.updateCourse({ id, code, name, duration, fee, description });\n                showToast('Course updated successfully.', 'success');\n            } else {\n                const newId = 'COURSE-' + String(DB.getCourses().length + 1).padStart(3, '0');\n                DB.addCourse({ id: newId, code, name, duration, fee, description });\n                showToast('Course added successfully.', 'success');\n            }\n\n            courseModal.classList.remove('active');\n            loadView('courses');\n        });\n    }\n\n    window.editCourseHandler = function(courseId) {\n        openCourseModal(courseId);\n    };\n\n    window.deleteCourseHandler = function(courseId) {\n        if (!currentUser || currentUser.role !== 'super_admin') {\n            showToast('Only Super Admin can delete courses.', 'danger');\n            return;\n        }\n        if (confirm('Are you sure you want to delete this course?')) {\n            const deleted = DB.deleteCourse(courseId);\n            if (deleted) {\n                showToast('Course deleted successfully.', 'danger');\n                loadView('courses');\n            } else {\n                showToast('Only Super Admin can delete courses.', 'danger');\n            }\n        }\n    };\n\n    // MODAL: STUDENTS\n    const studentModal = document.getElementById('studentModal');\n    const studentForm = document.getElementById('studentForm');\n    const studentCenterInput = document.getElementById('studentCenterInput');\n\n    function openStudentModal(studentId = null) {\n        studentForm.reset();\n        document.getElementById('studentId').value = '';\n        document.getElementById('studentModalTitle').textContent = 'Register New Admission';\n\n        const courseOptions = DB.getCourses();\n        const studentCourseInput = document.getElementById('studentCourseInput');\n        if (studentCourseInput) {\n            studentCourseInput.innerHTML = (courseOptions.length ? courseOptions : [\n                { code: 'DCA', name: 'DCA' },\n                { code: 'ADCA', name: 'ADCA' },\n                { code: 'PGDCA', name: 'PGDCA' },\n                { code: 'O-Level', name: 'O-Level' },\n                { code: 'CCC', name: 'CCC' },\n                { code: 'BA', name: 'BA' }\n            ]).map(course => `<option value=\"${course.code}\">${course.name} (₹${course.fee || 0})</option>`).join('');\n        }\n\n        // Load Center options\n        const centers = DB.getCenters();\n        \n        if (currentUser.role !== 'super_admin') {\n            const myCenter = centers.find(c => c.id === currentUser.center_id);\n            studentCenterInput.innerHTML = `<option value=\"${myCenter.id}\">${myCenter.center_name}</option>`;\n            studentCenterInput.disabled = true;\n        } else {\n            studentCenterInput.innerHTML = centers.map(c => `<option value=\"${c.id}\">${c.center_name}</option>`).join('');\n            studentCenterInput.disabled = false;\n        }\n\n        if (studentId) {\n            const students = DB.getStudents();\n            const s = students.find(std => std.id === studentId);\n            if (s) {\n                document.getElementById('studentId').value = s.id;\n                document.getElementById('studentNameInput').value = s.student_name;\n                document.getElementById('studentFatherInput').value = s.father_name;\n                document.getElementById('studentCourseInput').value = s.course;\n                document.getElementById('studentMobileInput').value = s.mobile;\n                document.getElementById('studentCenterInput').value = s.center_id;\n                document.getElementById('studentStatusInput').value = s.status;\n                document.getElementById('studentAddressInput').value = s.address;\n                document.getElementById('studentModalTitle').textContent = 'Edit Student Details';\n            }\n        }\n        studentModal.classList.add('active');\n    }\n\n    if (studentForm) {\n        studentForm.addEventListener('submit', (e) => {\n            e.preventDefault();\n            const id = document.getElementById('studentId').value;\n            const student_name = document.getElementById('studentNameInput').value;\n            const father_name = document.getElementById('studentFatherInput').value;\n            const course = document.getElementById('studentCourseInput').value;\n            const mobile = document.getElementById('studentMobileInput').value;\n            const center_id = document.getElementById('studentCenterInput').value;\n            const status = document.getElementById('studentStatusInput').value;\n            const address = document.getElementById('studentAddressInput').value;\n\n            // Course fee mappings\n            const feesMap = { DCA: 8000, ADCA: 15000, PGDCA: 18000, 'O-Level': 12000, BA: 3500 };\n            const fees = feesMap[course] || 5000;\n\n            if (id) {\n                // Update\n                const old = DB.getStudents().find(s => s.id === id);\n                DB.updateStudent({ \n                    id, student_name, father_name, course, mobile, address, \n                    admission_date: old ? old.admission_date : new Date().toISOString().split('T')[0], \n                    fees, center_id, status \n                });\n                showToast('Student details updated.', 'success');\n            } else {\n                // Admission Code format e.g. RAD-2026-009\n                const index = String(DB.getStudents().length + 1).padStart(3, '0');\n                const newId = `RAD-2026-${index}`;\n                DB.addStudent({ \n                    id: newId, student_name, father_name, course, mobile, address, \n                    admission_date: new Date().toISOString().split('T')[0], \n                    fees, center_id, status \n                });\n                showToast('Admission completed successfully. ID: ' + newId, 'success');\n                \n                // Trigger auto WhatsApp/SMS notification simulator\n                simulateNotifications(student_name, mobile, course, newId);\n            }\n\n            studentModal.classList.remove('active');\n            loadView('students');\n        });\n    }\n\n    function simulateNotifications(name, mobile, course, id) {\n        // Log to Activity/Notice Board representing the automated notification\n        const msg = `Notification Auto-Trigger: WhatsApp & SMS sent to student ${name} (${mobile}). Welcome to Radhika IT College for course ${course}. Admission ID: ${id}.`;\n        \n        DB.addNotice({\n            id: 'N-NOTIF-' + Date.now(),\n            title: `SMS/WA Alert sent to ${name}`,\n            message: msg,\n            date: new Date().toISOString().split('T')[0],\n            target: 'staff'\n        });\n    }\n\n    window.editStudentHandler = function(studentId) {\n        openStudentModal(studentId);\n    };\n\n    window.deleteStudentHandler = function(studentId) {\n        if (!currentUser || currentUser.role !== 'super_admin') {\n            showToast('Only Super Admin can delete student records.', 'danger');\n            return;\n        }\n\n        if (confirm('Are you sure you want to delete this student record? This will delete all fee details too.')) {\n            const deleted = DB.deleteStudent(studentId);\n            if (!deleted) {\n                showToast('Only Super Admin can delete student records.', 'danger');\n                return;\n            }\n\n            // Delete matching fees\n            let fees = DB.getFees().filter(f => f.student_id !== studentId);\n            DB.saveFees(fees);\n\n            showToast('Student and fee invoices removed.', 'danger');\n            loadView('students');\n        }\n    };\n\n    // MODAL: SUBMIT FEES\n    const feeModal = document.getElementById('feeModal');\n    const feeForm = document.getElementById('feeForm');\n    const feeStudentInput = document.getElementById('feeStudentInput');\n\n    function openFeeModal() {\n        feeForm.reset();\n        \n        // Load active students options\n        const students = DB.getStudents().filter(s => s.status === 'active');\n        let filtered = students;\n        \n        if (currentUser.role !== 'super_admin') {\n            filtered = students.filter(s => s.center_id === currentUser.center_id);\n        }\n\n        if (filtered.length === 0) {\n            showToast('No active students available for fees collection.', 'warning');\n            return;\n        }\n\n        feeStudentInput.innerHTML = filtered.map(s => {\n            const paid = DB.getFees().filter(f => f.student_id === s.id).reduce((sum, f) => sum + f.amount, 0);\n            const pend = s.fees - paid;\n            return `<option value=\"${s.id}\">${s.student_name} (${s.id}) - ${s.course} [Due: ₹${pend}]</option>`;\n        }).join('');\n\n        feeModal.classList.add('active');\n    }\n\n    if (feeForm) {\n        feeForm.addEventListener('submit', (e) => {\n            e.preventDefault();\n            const student_id = feeStudentInput.value;\n            const amount = parseInt(document.getElementById('feeAmountInput').value);\n            const payment_mode = document.getElementById('feeModeInput').value;\n            const remark = document.getElementById('feeRemarkInput').value;\n\n            // Validate due\n            const s = DB.getStudents().find(st => st.id === student_id);\n            const paid = DB.getFees().filter(f => f.student_id === student_id).reduce((sum, f) => sum + f.amount, 0);\n            const pend = s.fees - paid;\n            \n            if (amount > pend) {\n                showToast(`Payment amount (₹${amount}) exceeds pending balance (₹${pend}).`, 'warning');\n                return;\n            }\n\n            // Create Invoice ID\n            const newIndex = String(DB.getFees().length + 10001);\n            const newId = `INV-${newIndex}`;\n\n            const feeRecord = {\n                id: newId,\n                student_id,\n                amount,\n                payment_date: new Date().toISOString().split('T')[0],\n                payment_mode,\n                remark\n            };\n\n            DB.submitFee(feeRecord);\n            showToast('Receipt generated! Invoice: ' + newId, 'success');\n            \n            // Log notice alert for notification\n            DB.addNotice({\n                id: 'N-FEE-' + Date.now(),\n                title: `Fee Collected: ${s.student_name}`,\n                message: `Auto SMS receipt alert sent for payment of ₹${amount} via ${payment_mode}. Invoice: ${newId}.`,\n                date: new Date().toISOString().split('T')[0],\n                target: 'staff'\n            });\n\n            feeModal.classList.remove('active');\n            loadView('fees');\n        });\n    }\n\n    // MODAL: LOG EXPENSE\n    const expenseModal = document.getElementById('expenseModal');\n    const expenseForm = document.getElementById('expenseForm');\n    const expenseCenterInput = document.getElementById('expenseCenterInput');\n\n    function openExpenseModal() {\n        expenseForm.reset();\n        const centers = DB.getCenters();\n\n        if (currentUser.role !== 'super_admin') {\n            const myCenter = centers.find(c => c.id === currentUser.center_id);\n            expenseCenterInput.innerHTML = `<option value=\"${myCenter.id}\">${myCenter.center_name}</option>`;\n            expenseCenterInput.disabled = true;\n        } else {\n            expenseCenterInput.innerHTML = centers.map(c => `<option value=\"${c.id}\">${c.center_name}</option>`).join('');\n            expenseCenterInput.disabled = false;\n        }\n        \n        expenseModal.classList.add('active');\n    }\n\n    if (expenseForm) {\n        expenseForm.addEventListener('submit', (e) => {\n            e.preventDefault();\n            const title = document.getElementById('expenseTitleInput').value;\n            const amount = parseInt(document.getElementById('expenseAmountInput').value);\n            const category = document.getElementById('expenseCatInput').value;\n            const center_id = expenseCenterInput.value;\n\n            const nextIndex = DB.getExpenses().length + 5001;\n            const expense = {\n                id: 'EXP-' + nextIndex,\n                center_id,\n                title,\n                amount,\n                category,\n                date: new Date().toISOString().split('T')[0]\n            };\n\n            DB.addExpense(expense);\n            showToast('Expense recorded successfully.', 'success');\n            expenseModal.classList.remove('active');\n            loadView('expenses');\n        });\n    }\n\n    // MODAL: PUBLISH NOTICE\n    const noticeModal = document.getElementById('noticeModal');\n    const noticeForm = document.getElementById('noticeForm');\n\n    function openNoticeModal() {\n        noticeForm.reset();\n        noticeModal.classList.add('active');\n    }\n\n    if (noticeForm) {\n        noticeForm.addEventListener('submit', (e) => {\n            e.preventDefault();\n            const title = document.getElementById('noticeTitleInput').value;\n            const target = document.getElementById('noticeTargetInput').value;\n            const message = document.getElementById('noticeMsgInput').value;\n\n            const notice = {\n                id: 'N-' + Date.now(),\n                title,\n                target,\n                message,\n                date: new Date().toISOString().split('T')[0]\n            };\n\n            DB.addNotice(notice);\n            showToast('Notice published to target dashboard boards.', 'success');\n            noticeModal.classList.remove('active');\n            loadView('notices');\n            loadNoticesDropdown(); // reload list\n        });\n    }\n\n    // Close buttons for all modals\n    document.querySelectorAll('.close-modal').forEach(btn => {\n        btn.addEventListener('click', () => {\n            document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));\n        });\n    });\n\n    // 10. PRINT UTILITIES RENDERING\n\n    // PRINT: ID CARD\n    window.printStudentIdCard = function(studentId) {\n        const s = DB.getStudents().find(std => std.id === studentId);\n        if (!s) return;\n\n        const cName = getCenterCodeName(s.center_id);\n        const nameInitials = s.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();\n\n        const container = document.getElementById('idCardPrintContainer');\n        container.innerHTML = `\n            <div class=\"id-card-preview\" id=\"idCardElement\">\n                <div class=\"id-card-header\">\n                    <h4>RADHIKA IT COLLEGE</h4>\n                    <p>Student Identity Card</p>\n                </div>\n                <div class=\"id-card-photo\">\n                    <span style=\"font-size:2rem; font-weight:800;\">${nameInitials}</span>\n                </div>\n                <div class=\"id-card-details\">\n                    <table>\n                        <tr><td>ADM ID:</td><td style=\"font-weight:700;\">${s.id}</td></tr>\n                        <tr><td>NAME:</td><td style=\"font-weight:700; text-transform:uppercase;\">${escapeHTML(s.student_name)}</td></tr>\n                        <tr><td>FATHER:</td><td>${escapeHTML(s.father_name)}</td></tr>\n                        <tr><td>COURSE:</td><td><strong style=\"color:#f59e0b;\">${s.course}</strong></td></tr>\n                        <tr><td>BRANCH:</td><td>${escapeHTML(cName)}</td></tr>\n                        <tr><td>CONTACT:</td><td>+91 ${s.mobile}</td></tr>\n                    </table>\n                </div>\n                <div class=\"id-card-footer\">\n                    <span>Authorized Sign</span>\n                    <div style=\"text-align:right;\">\n                        <span style=\"display:block; font-size:9px; font-weight:bold;\">RADHIKA IT COGNIZANCE</span>\n                        <span style=\"opacity:0.7;\">ERP Verified ID</span>\n                    </div>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('printIdModal').classList.add('active');\n    };\n\n    // PRINT: INVOICE RECEIPT\n    window.printPaymentReceipt = function(invoiceId) {\n        const f = DB.getFees().find(fee => fee.id === invoiceId);\n        if (!f) return;\n\n        const s = DB.getStudents().find(std => std.id === f.student_id);\n        if (!s) return;\n\n        const c = DB.getCenters().find(center => center.id === s.center_id);\n        const centerName = c ? c.center_name : 'Main HQ';\n        const centerCode = c ? c.center_code : 'HQ';\n\n        // Compute balances\n        const paidTotal = DB.getFees().filter(fee => fee.student_id === s.id).reduce((sum, fee) => sum + fee.amount, 0);\n        const balancePending = s.fees - paidTotal;\n\n        const container = document.getElementById('receiptPrintContainer');\n        container.innerHTML = `\n            <div style=\"font-family: sans-serif; padding: 20px; border: 2px solid var(--border-color); background: white; border-radius: var(--radius-md);\">\n                <!-- Invoice Header -->\n                <div style=\"display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--primary); padding-bottom:15px; margin-bottom:20px;\">\n                    <div>\n                        <h2 style=\"color:var(--primary); font-size:1.5rem; font-weight:800; margin:0;\">RADHIKA IT COLLEGE</h2>\n                        <p style=\"font-size:0.75rem; color:var(--text-secondary); margin:3px 0;\">${escapeHTML(centerName)} (${centerCode})</p>\n                        <p style=\"font-size:0.7rem; color:var(--text-muted); margin:0;\">Address: ${escapeHTML(c ? c.address : 'HQ')}</p>\n                    </div>\n                    <div style=\"text-align:right;\">\n                        <h3 style=\"margin:0; font-size:1.1rem; color:var(--text-secondary);\">FEES INVOICE</h3>\n                        <p style=\"font-size:0.8rem; font-weight:700; margin:3px 0;\">Receipt: ${f.id}</p>\n                        <p style=\"font-size:0.75rem; color:var(--text-muted); margin:0;\">Date: ${f.payment_date}</p>\n                    </div>\n                </div>\n\n                <!-- Info Grid -->\n                <div style=\"display:grid; grid-template-columns: 1fr 1fr; gap:15px; font-size:0.8rem; margin-bottom:20px; border-bottom:1px solid #cbd5e1; padding-bottom:15px;\">\n                    <div>\n                        <p style=\"margin:0 0 5px; color:var(--text-muted);\">ADMITTED STUDENT</p>\n                        <h4 style=\"font-size:0.95rem; margin:0; text-transform:uppercase;\">${escapeHTML(s.student_name)}</h4>\n                        <p style=\"margin:2px 0;\">Father: ${escapeHTML(s.father_name)}</p>\n                        <p style=\"margin:2px 0;\">Adm ID: ${s.id}</p>\n                        <p style=\"margin:2px 0;\">Contact: ${s.mobile}</p>\n                    </div>\n                    <div style=\"text-align:right;\">\n                        <p style=\"margin:0 0 5px; color:var(--text-muted);\">PROGRAM DETAILS</p>\n                        <h4 style=\"font-size:0.95rem; margin:0; color:var(--primary);\">${s.course} Program</h4>\n                        <p style=\"margin:2px 0;\">Total Course Fee: ₹${s.fees}</p>\n                        <p style=\"margin:2px 0;\">Mode of Payment: ${f.payment_mode}</p>\n                    </div>\n                </div>\n\n                <!-- Payment Table -->\n                <table style=\"width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:30px;\">\n                    <thead>\n                        <tr style=\"background:#f1f5f9; text-align:left;\">\n                            <th style=\"padding:10px; border:1px solid #cbd5e1;\">Particulars</th>\n                            <th style=\"padding:10px; border:1px solid #cbd5e1; text-align:right;\">Amount Received</th>\n                        </tr>\n                    </thead>\n                    <tbody>\n                        <tr>\n                            <td style=\"padding:12px; border:1px solid #cbd5e1;\">\n                                <strong>Course Enrollment Fees</strong><br>\n                                <span style=\"font-size:0.75rem; color:var(--text-secondary);\">${escapeHTML(f.remark)}</span>\n                            </td>\n                            <td style=\"padding:12px; border:1px solid #cbd5e1; text-align:right; font-weight:700; color:var(--success);\">₹${f.amount}.00</td>\n                        </tr>\n                        <tr style=\"background:#f8fafc; font-weight:700;\">\n                            <td style=\"padding:10px; border:1px solid #cbd5e1; text-align:right;\">Paid So Far:</td>\n                            <td style=\"padding:10px; border:1px solid #cbd5e1; text-align:right;\">₹${paidTotal}.00</td>\n                        </tr>\n                        <tr style=\"background:#f8fafc; font-weight:700; color:var(--danger);\">\n                            <td style=\"padding:10px; border:1px solid #cbd5e1; text-align:right;\">Balance Pending:</td>\n                            <td style=\"padding:10px; border:1px solid #cbd5e1; text-align:right;\">₹${balancePending > 0 ? balancePending : 0}.00</td>\n                        </tr>\n                    </tbody>\n                </table>\n\n                <!-- Footer Sign & QR code -->\n                <div style=\"display:flex; justify-content:between; align-items:center;\">\n                    <!-- Simulated SVG QR Code -->\n                    <div style=\"width:70px; height:70px; border:1px solid #cbd5e1; padding:3px; border-radius:3px;\">\n                        <svg viewBox=\"0 0 100 100\" width=\"100%\" height=\"100%\">\n                            <!-- Mock QR code pattern -->\n                            <rect width=\"30\" height=\"30\" fill=\"black\"/>\n                            <rect x=\"70\" width=\"30\" height=\"30\" fill=\"black\"/>\n                            <rect y=\"70\" width=\"30\" height=\"30\" fill=\"black\"/>\n                            <rect x=\"10\" y=\"10\" width=\"10\" height=\"10\" fill=\"white\"/>\n                            <rect x=\"80\" y=\"10\" width=\"10\" height=\"10\" fill=\"white\"/>\n                            <rect x=\"10\" y=\"80\" width=\"10\" height=\"10\" fill=\"white\"/>\n                            <!-- random barcode lines -->\n                            <rect x=\"40\" y=\"10\" width=\"15\" height=\"5\" fill=\"black\"/>\n                            <rect x=\"45\" y=\"25\" width=\"20\" height=\"10\" fill=\"black\"/>\n                            <rect x=\"35\" y=\"40\" width=\"30\" height=\"30\" fill=\"black\"/>\n                            <rect x=\"40\" y=\"50\" width=\"10\" height=\"10\" fill=\"white\"/>\n                            <rect x=\"70\" y=\"50\" width=\"20\" height=\"40\" fill=\"black\"/>\n                        </svg>\n                    </div>\n                    <div style=\"flex-grow:1; text-align:right; font-size:0.8rem;\">\n                        <p style=\"margin:0 0 40px; opacity:0.8;\">Cashier / Staff Signature</p>\n                        <p style=\"margin:0; font-weight:700;\">Radhika IT College ERP</p>\n                        <p style=\"margin:0; font-size:0.7rem; color:var(--text-muted);\">This is a computer-generated invoice print receipt.</p>\n                    </div>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('printReceiptModal').classList.add('active');\n    };\n\n    // PRINT: COURSE COMPLETION CERTIFICATE\n    window.printCourseCertificate = function(studentId) {\n        const s = DB.getStudents().find(std => std.id === studentId);\n        if (!s) return;\n\n        const c = DB.getCenters().find(center => center.id === s.center_id);\n        const centerName = c ? c.center_name : 'Radhika IT Campus';\n\n        const container = document.getElementById('certificatePrintContainer');\n        container.innerHTML = `\n            <div class=\"certificate-preview\">\n                <div class=\"cert-inner\">\n                    <div class=\"cert-header\">\n                        <h4>RADHIKA IT COLLEGE OF TECHNOLOGY</h4>\n                        <p>Established under technical literacy program recognition</p>\n                    </div>\n                    \n                    <div class=\"cert-title\">This is to certify that</div>\n                    \n                    <div class=\"cert-name\">${escapeHTML(s.student_name)}</div>\n                    \n                    <p style=\"font-size:0.9rem; font-style:italic; margin: 10px 0;\">\n                        Son/Daughter of Shri <strong>${escapeHTML(s.father_name)}</strong> \n                        has successfully completed the professional certificate program in\n                    </p>\n                    \n                    <h3 style=\"font-size:1.6rem; color:#b45309; font-weight:800; margin:10px 0;\">\n                        ${s.course} (Diploma in Applications)\n                    </h3>\n                    \n                    <div class=\"cert-text\">\n                        conducted at our authorized learning center branch <strong>${escapeHTML(centerName)}</strong>.<br>\n                        The candidate was graded <strong>A+ (Distinction)</strong> in final term exams held in Year 2026.\n                    </div>\n                    \n                    <div class=\"cert-footer\">\n                        <div class=\"cert-sign\">\n                            <strong>${escapeHTML(c ? c.head_name : 'Center Head')}</strong>\n                            <p style=\"font-size:0.7rem; color:var(--text-muted);\">Center Superintendent</p>\n                        </div>\n                        <div class=\"cert-sign\">\n                            <strong>Dr. R. K. Sharma</strong>\n                            <p style=\"font-size:0.7rem; color:var(--text-muted);\">Director, Radhika Group</p>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        `;\n\n        document.getElementById('printCertModal').classList.add('active');\n    };\n\n    // 11. Global Helper Utilities\n\n    // Get Center Code / Name\n    function getCenterCodeName(centerId) {\n        const centers = DB.getCenters();\n        const c = centers.find(center => center.id === centerId);\n        return c ? c.center_name : 'Main HQ';\n    }\n\n    // Escape HTML strings for safety\n    function escapeHTML(str) {\n        if (!str) return '';\n        return str.replace(/[&<>'\"]/g, \n            tag => ({\n                '&': '&amp;',\n                '<': '&lt;',\n                '>': '&gt;',\n                \"'\": '&#39;',\n                '\"': '&quot;'\n            }[tag] || tag)\n        );\n    }\n\n    // CSV Data Exporter\n    function exportToCSV(dataList, filename, headersKeys) {\n        if (dataList.length === 0) {\n            showToast('No records available to export.', 'warning');\n            return;\n        }\n\n        const csvContent = [];\n        // Add Headers row\n        csvContent.push(headersKeys.map(k => `\"${k.toUpperCase()}\"`).join(','));\n\n        // Add Data rows\n        dataList.forEach(item => {\n            const row = headersKeys.map(k => {\n                const val = item[k] !== undefined ? item[k] : '';\n                return `\"${String(val).replace(/\"/g, '\"\"')}\"`;\n            });\n            csvContent.push(row.join(','));\n        });\n\n        // Trigger Download\n        const blob = new Blob([csvContent.join('\\n')], { type: 'text/csv;charset=utf-8;' });\n        const link = document.createElement(\"a\");\n        if (link.download !== undefined) {\n            const url = URL.createObjectURL(blob);\n            link.setAttribute(\"href\", url);\n            link.setAttribute(\"download\", filename);\n            link.style.visibility = 'hidden';\n            document.body.appendChild(link);\n            link.click();\n            document.body.removeChild(link);\n            showToast('Export successful! Download started.', 'success');\n        }\n    }\n\n    // Toast Generator\n    function showToast(message, type = 'success') {\n        const container = document.getElementById('toastContainer');\n        if (!container) return;\n\n        const toast = document.createElement('div');\n        toast.className = `toast toast-${type}`;\n        \n        let icon = '<i class=\"fa-solid fa-circle-check\" style=\"color: var(--success)\"></i>';\n        if (type === 'danger') icon = '<i class=\"fa-solid fa-circle-xmark\" style=\"color: var(--danger)\"></i>';\n        if (type === 'warning') icon = '<i class=\"fa-solid fa-triangle-exclamation\" style=\"color: var(--warning)\"></i>';\n        if (type === 'info') icon = '<i class=\"fa-solid fa-circle-info\" style=\"color: var(--info)\"></i>';\n\n        toast.innerHTML = `\n            ${icon}\n            <div>\n                <p style=\"font-weight: 600; font-size: 0.85rem; margin-bottom: 2px;\">${type.toUpperCase()}</p>\n                <p style=\"font-size: 0.8rem; color: var(--text-secondary);\">${message}</p>\n            </div>\n        `;\n\n        container.appendChild(toast);\n        \n        setTimeout(() => {\n            toast.style.animation = 'slideIn 0.3s reverse forwards';\n            setTimeout(() => {\n                toast.remove();\n            }, 300);\n        }, 4000);\n    }\n\n    // Search Engine Binding\n    const globalSearch = document.getElementById('globalSearch');\n    if (globalSearch) {\n        globalSearch.addEventListener('input', (e) => {\n            globalSearchQuery = e.target.value;\n            // Update the view if we are on student/fees list\n            if (['students', 'fees'].includes(currentView)) {\n                loadView(currentView);\n            }\n        });\n    }\n\n    // Logout Handler\n    const logoutBtn = document.getElementById('logoutBtn');\n    if (logoutBtn) {\n        logoutBtn.addEventListener('click', async () => {\n            showToast('Logging out...', 'info');\n            await DB.logout();\n            window.location.href = 'login.html';\n        });\n    }\n\n    // Load initial views & notification bells\n    renderSidebarMenu();\n    loadView(currentView);\n    loadNoticesDropdown();\n});\n"
};

// -----------------------------------------------------------------------------
// DATABASE SCHEMA & SEED DATA
// -----------------------------------------------------------------------------
const SEED = {
  centers: [
    {
      id: 'C001',
      center_code: 'MCHQ01',
      center_name: 'Main Campus (HQ)',
      address: 'Civil Lines, Near Town Hall, District HQ, Gorakhpur, UP',
      head_name: 'Dr. R. K. Sharma',
      contact: '9876543210',
      email: 'hq@radhikaitcollege.com',
      status: 'active'
    },
    {
      id: 'C002',
      center_code: 'CTC02',
      center_name: 'City Tech Center',
      address: 'Station Road, Opp. Central Mall, Golghar, Gorakhpur, UP',
      head_name: 'Prof. Vinay Mishra',
      contact: '8765432109',
      email: 'citytech@radhikaitcollege.com',
      status: 'active'
    },
    {
      id: 'C003',
      center_code: 'RIT03',
      center_name: 'Rural IT Development Wing',
      address: 'NH-2 Bypass, Near Block Development Office, Sahjanwa, UP',
      head_name: 'Er. Amit Patel',
      contact: '7654321098',
      email: 'rural@radhikaitcollege.com',
      status: 'active'
    },
    {
      id: 'C004',
      center_code: 'EBC04',
      center_name: 'East Branch Campus',
      address: 'Medical College Road, Asuran Chowk, Gorakhpur, UP',
      head_name: 'Mrs. Archana Singh',
      contact: '9450123456',
      email: 'eastbranch@radhikaitcollege.com',
      status: 'active'
    }
  ],

  courses: [
    {
      id: 'COURSE-001',
      code: 'DCA',
      name: 'Diploma in Computer Applications',
      duration: '6 Months',
      fee: 8000,
      description: 'Fundamentals of computers, Windows OS, MS Office suite (Word, Excel, PowerPoint), Internet technologies and basic IT tools.',
      eligibility: '10th Pass / High School',
      status: 'active'
    },
    {
      id: 'COURSE-002',
      code: 'ADCA',
      name: 'Advanced Diploma in Computer Applications',
      duration: '12 Months',
      fee: 15000,
      description: 'Comprehensive IT training covering Office Automation, DTP (Photoshop, PageMaker, CorelDraw), Web Designing (HTML/CSS), and Tally ERP/Prime accounting.',
      eligibility: '12th Pass / Intermediate',
      status: 'active'
    },
    {
      id: 'COURSE-003',
      code: 'PGDCA',
      name: 'Post Graduate Diploma in Computer Applications',
      duration: '12 Months',
      fee: 18000,
      description: 'Professional postgraduate diploma covering Object-Oriented Programming (C++/Java/Python), RDBMS & SQL, Software Engineering, and Web Development.',
      eligibility: 'Graduation in any stream',
      status: 'active'
    },
    {
      id: 'COURSE-004',
      code: 'O-Level',
      name: 'NIELIT O-Level IT Certification',
      duration: '12 Months',
      fee: 12000,
      description: 'Government recognised NIELIT foundation course covering IT Tools, Web Publishing, Python Programming, and Internet of Things (IoT).',
      eligibility: '12th Pass or ITI Certificate',
      status: 'active'
    },
    {
      id: 'COURSE-005',
      code: 'CCC',
      name: 'Course on Computer Concepts',
      duration: '3 Months',
      fee: 3500,
      description: 'Basic digital literacy program certified by NIELIT covering computer basics, GUI OS, LibreOffice, Digital Financial Services, and Cyber Security.',
      eligibility: 'No Minimum Qualification',
      status: 'active'
    },
    {
      id: 'COURSE-006',
      code: 'BA',
      name: 'Basic Accounting with Tally Prime',
      duration: '6 Months',
      fee: 6500,
      description: 'Modern computerized accounting with Tally Prime, GST filing, e-Way bills, TDS calculation, ledger management, and balance sheet preparation.',
      eligibility: '10th / 12th Commerce Preferred',
      status: 'active'
    },
    {
      id: 'COURSE-007',
      code: 'PY-FS',
      name: 'Python Full Stack Web Development',
      duration: '6 Months',
      fee: 16000,
      description: 'Complete web development boot-camp: Python, Django, REST APIs, HTML5, CSS3, JavaScript, SQLite/PostgreSQL, and Git version control.',
      eligibility: '12th Pass / Basic computer knowledge',
      status: 'active'
    },
    {
      id: 'COURSE-008',
      code: 'DTP',
      name: 'Desktop Publishing & Graphic Designing',
      duration: '4 Months',
      fee: 5500,
      description: 'Creative design training in Adobe Photoshop, CorelDRAW, Adobe Illustrator, banner design, magazine layout, and print media preparation.',
      eligibility: '10th Pass',
      status: 'active'
    }
  ],

  staff: [
    {
      id: 'S001',
      name: 'Super Administrator',
      login_id: 'superadmin',
      password: '123',
      role: 'super_admin',
      center_id: '',
      phone: '9876543200',
      email: 'admin@radhikaitcollege.com',
      designation: 'Managing Director / Super Admin',
      status: 'active'
    },
    {
      id: 'S002',
      name: 'Vinay Mishra (Center Head)',
      login_id: 'centerhead1',
      password: '123',
      role: 'center_admin',
      center_id: 'C002',
      phone: '8765432109',
      email: 'vinay@radhikaitcollege.com',
      designation: 'Center Director - City Branch',
      status: 'active'
    },
    {
      id: 'S003',
      name: 'Amit Patel (Center Head)',
      login_id: 'centerhead2',
      password: '123',
      role: 'center_admin',
      center_id: 'C003',
      phone: '7654321098',
      email: 'amit@radhikaitcollege.com',
      designation: 'Center Director - Rural Branch',
      status: 'active'
    },
    {
      id: 'S004',
      name: 'Rita Sen (Senior Counselor)',
      login_id: 'staff1',
      password: '123',
      role: 'staff',
      center_id: 'C001',
      phone: '9812345678',
      email: 'rita@radhikaitcollege.com',
      designation: 'Senior Academic Counselor & Admission In-charge',
      status: 'active'
    },
    {
      id: 'S005',
      name: 'Rajesh Kumar (Office Assistant)',
      login_id: 'staff2',
      password: '123',
      role: 'staff',
      center_id: 'C002',
      phone: '9123456780',
      email: 'rajesh@radhikaitcollege.com',
      designation: 'Office Executive & Fee Cashier',
      status: 'active'
    },
    {
      id: 'S006',
      name: 'Sunita Verma (System Operator)',
      login_id: 'staff3',
      password: '123',
      role: 'staff',
      center_id: 'C003',
      phone: '9988776611',
      email: 'sunita@radhikaitcollege.com',
      designation: 'Computer Lab Technician',
      status: 'inactive'
    },
    {
      id: 'S007',
      name: 'Pooja Tiwari (Faculty - Tally & Accounts)',
      login_id: 'faculty1',
      password: '123',
      role: 'staff',
      center_id: 'C001',
      phone: '9765432199',
      email: 'pooja@radhikaitcollege.com',
      designation: 'Senior Faculty - Accounting & Tally',
      status: 'active'
    },
    {
      id: 'S008',
      name: 'Archana Singh (Branch Head)',
      login_id: 'centerhead3',
      password: '123',
      role: 'center_admin',
      center_id: 'C004',
      phone: '9450123456',
      email: 'archana@radhikaitcollege.com',
      designation: 'Center Director - East Branch',
      status: 'active'
    }
  ],

  students: [
    {
      id: 'RAD-2026-001',
      student_name: 'Aditya Narayan',
      father_name: 'Surendra Prasad',
      mother_name: 'Kavita Devi',
      course: 'ADCA',
      mobile: '9565123456',
      email: 'aditya.n@gmail.com',
      address: 'Gola Bazaar, Ward No 4, Gorakhpur',
      admission_date: '2026-01-10',
      fees: 15000,
      center_id: 'C001',
      status: 'active'
    },
    {
      id: 'RAD-2026-002',
      student_name: 'Priya Singh',
      father_name: 'Ramesh Singh',
      mother_name: 'Anita Singh',
      course: 'DCA',
      mobile: '9988776655',
      email: 'priyasingh99@gmail.com',
      address: 'Rampuri Colony, Lane 3, Gorakhpur',
      admission_date: '2026-02-15',
      fees: 8000,
      center_id: 'C001',
      status: 'active'
    },
    {
      id: 'RAD-2026-003',
      student_name: 'Vikram Malhotra',
      father_name: 'K. P. Malhotra',
      mother_name: 'Sunita Malhotra',
      course: 'PGDCA',
      mobile: '9123456789',
      email: 'vikram.m@outlook.com',
      address: 'Civil Lines Area, Near Park, Gorakhpur',
      admission_date: '2026-03-05',
      fees: 18000,
      center_id: 'C002',
      status: 'active'
    },
    {
      id: 'RAD-2026-004',
      student_name: 'Neha Gupta',
      father_name: 'M. L. Gupta',
      mother_name: 'Reena Gupta',
      course: 'CCC',
      mobile: '9839401234',
      email: 'neha.gupta2026@gmail.com',
      address: 'Shastri Nagar, House 14, Gorakhpur',
      admission_date: '2026-04-01',
      fees: 3500,
      center_id: 'C002',
      status: 'active'
    },
    {
      id: 'RAD-2026-005',
      student_name: 'Sandeep Yadav',
      father_name: 'Ram Chandra Yadav',
      mother_name: 'Shanti Devi',
      course: 'O-Level',
      mobile: '7309876543',
      email: 'sandeep.yadav@gmail.com',
      address: 'Village Pipra, Post Harra, Sahjanwa',
      admission_date: '2026-01-22',
      fees: 12000,
      center_id: 'C003',
      status: 'active'
    },
    {
      id: 'RAD-2026-006',
      student_name: 'Komal Preet Kaur',
      father_name: 'Gurmukh Singh',
      mother_name: 'Harpreet Kaur',
      course: 'ADCA',
      mobile: '8127394850',
      email: 'komalpreet@gmail.com',
      address: 'Model Town Ext, Sector 2, Sahjanwa',
      admission_date: '2026-04-20',
      fees: 15000,
      center_id: 'C003',
      status: 'active'
    },
    {
      id: 'RAD-2026-007',
      student_name: 'Rahul Verma',
      father_name: 'Satya Prakash Verma',
      mother_name: 'Maya Verma',
      course: 'PGDCA',
      mobile: '9450392817',
      email: 'rahul.verma@gmail.com',
      address: 'Station Road, Gali 2, Gorakhpur',
      admission_date: '2026-02-18',
      fees: 18000,
      center_id: 'C002',
      status: 'completed'
    },
    {
      id: 'RAD-2026-008',
      student_name: 'Sneha Tiwari',
      father_name: 'J. P. Tiwari',
      mother_name: 'Geeta Tiwari',
      course: 'DCA',
      mobile: '9670394857',
      email: 'sneha.tiwari@gmail.com',
      address: 'Vikas Nagar Sector A, House 88',
      admission_date: '2026-05-02',
      fees: 8000,
      center_id: 'C001',
      status: 'active'
    },
    {
      id: 'RAD-2026-009',
      student_name: 'Amitabh Dubey',
      father_name: 'Dinesh Dubey',
      mother_name: 'Sushila Dubey',
      course: 'BA',
      mobile: '9335678901',
      email: 'amitabh.dubey@gmail.com',
      address: 'Betiahata, Near Hanuman Mandir',
      admission_date: '2026-05-15',
      fees: 6500,
      center_id: 'C001',
      status: 'active'
    },
    {
      id: 'RAD-2026-010',
      student_name: 'Anjali Maurya',
      father_name: 'Rajendra Maurya',
      mother_name: 'Kamla Maurya',
      course: 'PY-FS',
      mobile: '9140223344',
      email: 'anjali.m@gmail.com',
      address: 'Medical Enclave, Gorakhpur',
      admission_date: '2026-06-01',
      fees: 16000,
      center_id: 'C004',
      status: 'active'
    },
    {
      id: 'RAD-2026-011',
      student_name: 'Mohd Faisal',
      father_name: 'Abdul Kalam',
      mother_name: 'Naseem Bano',
      course: 'ADCA',
      mobile: '9889445566',
      email: 'faisal.it@gmail.com',
      address: 'Turab Nagar, Mohaddipur',
      admission_date: '2026-06-05',
      fees: 15000,
      center_id: 'C002',
      status: 'active'
    },
    {
      id: 'RAD-2026-012',
      student_name: 'Roshni Prajapati',
      father_name: 'Subhash Prajapati',
      mother_name: 'Malti Devi',
      course: 'CCC',
      mobile: '7890123456',
      email: 'roshni.p@gmail.com',
      address: 'Bichhiya, Campierganj Road',
      admission_date: '2026-06-12',
      fees: 3500,
      center_id: 'C003',
      status: 'active'
    }
  ],

  fees: [
    { id: 'INV-10001', student_id: 'RAD-2026-001', amount: 5000, payment_date: '2026-01-10', payment_mode: 'Cash', remark: 'Admission installment', receipt_no: 'RCP-2026-001' },
    { id: 'INV-10002', student_id: 'RAD-2026-001', amount: 5000, payment_date: '2026-03-15', payment_mode: 'UPI', remark: 'Second installment (PhonePe Ref #8892)', receipt_no: 'RCP-2026-002' },
    { id: 'INV-10003', student_id: 'RAD-2026-002', amount: 4000, payment_date: '2026-02-15', payment_mode: 'Card', remark: '50% fees payment via POS machine', receipt_no: 'RCP-2026-003' },
    { id: 'INV-10004', student_id: 'RAD-2026-003', amount: 10000, payment_date: '2026-03-05', payment_mode: 'UPI', remark: 'Admission payment (GPay Ref #4412)', receipt_no: 'RCP-2026-004' },
    { id: 'INV-10005', student_id: 'RAD-2026-004', amount: 3500, payment_date: '2026-04-01', payment_mode: 'Cash', remark: 'Full fees paid at counter', receipt_no: 'RCP-2026-005' },
    { id: 'INV-10006', student_id: 'RAD-2026-005', amount: 6000, payment_date: '2026-01-22', payment_mode: 'UPI', remark: 'First installment paid online', receipt_no: 'RCP-2026-006' },
    { id: 'INV-10007', student_id: 'RAD-2026-006', amount: 7500, payment_date: '2026-04-20', payment_mode: 'Cash', remark: '50% course fee installment', receipt_no: 'RCP-2026-007' },
    { id: 'INV-10008', student_id: 'RAD-2026-007', amount: 18000, payment_date: '2026-02-18', payment_mode: 'UPI', remark: 'Full fees paid - Certificate issued', receipt_no: 'RCP-2026-008' },
    { id: 'INV-10009', student_id: 'RAD-2026-008', amount: 8000, payment_date: '2026-05-02', payment_mode: 'Cash', remark: 'Full fees one-time payment with discount', receipt_no: 'RCP-2026-009' },
    { id: 'INV-10010', student_id: 'RAD-2026-009', amount: 3500, payment_date: '2026-05-15', payment_mode: 'UPI', remark: 'First installment of Basic Accounting', receipt_no: 'RCP-2026-010' },
    { id: 'INV-10011', student_id: 'RAD-2026-010', amount: 8000, payment_date: '2026-06-01', payment_mode: 'Net Banking', remark: 'Admission fee for Python Full Stack', receipt_no: 'RCP-2026-011' },
    { id: 'INV-10012', student_id: 'RAD-2026-011', amount: 5000, payment_date: '2026-06-05', payment_mode: 'Cash', remark: 'Initial admission fee', receipt_no: 'RCP-2026-012' },
    { id: 'INV-10013', student_id: 'RAD-2026-012', amount: 3500, payment_date: '2026-06-12', payment_mode: 'UPI', remark: 'CCC full course fees paid', receipt_no: 'RCP-2026-013' }
  ],

  expenses: [
    { id: 'EXP-5001', center_id: 'C001', title: 'Office Electricity Bill (May 2026)', amount: 3200, date: '2026-05-10', category: 'Electricity', payment_mode: 'Net Banking', bill_no: 'UPPCL-99881' },
    { id: 'EXP-5002', center_id: 'C002', title: 'Whiteboard & Stationery purchase', amount: 850, date: '2026-05-15', category: 'Office Supplies', payment_mode: 'Cash', bill_no: 'ST-441' },
    { id: 'EXP-5003', center_id: 'C001', title: 'Computer Lab Maintenance & Networking Cable', amount: 4500, date: '2026-05-20', category: 'Lab Maintenance', payment_mode: 'UPI', bill_no: 'INF-1029' },
    { id: 'EXP-5004', center_id: 'C003', title: 'Center Rent (May 2026)', amount: 12000, date: '2026-06-01', category: 'Rent', payment_mode: 'Cheque', bill_no: 'RENT-MAY' },
    { id: 'EXP-5005', center_id: 'C002', title: 'High-speed Fiber Broadband Bill', amount: 1499, date: '2026-06-02', category: 'Internet', payment_mode: 'UPI', bill_no: 'JIO-FIB-4412' },
    { id: 'EXP-5006', center_id: 'C004', title: 'New Branch Opening Marketing Pamphlets & Flex', amount: 6200, date: '2026-06-05', category: 'Marketing', payment_mode: 'Cash', bill_no: 'ADV-881' },
    { id: 'EXP-5007', center_id: 'C001', title: 'Water Dispenser Refill & Office Tea Supplies', amount: 1100, date: '2026-06-10', category: 'Office Supplies', payment_mode: 'Cash', bill_no: 'TEA-JUN' }
  ],

  notices: [
    {
      id: 'N001',
      title: 'Summer Vacation Announcement',
      message: 'Radhika IT College campuses will remain closed for summer vacation from June 15 to June 30. Regular online student support will be available.',
      date: '2026-06-10',
      target: 'all'
    },
    {
      id: 'N002',
      title: 'Super Admin Advisory on Fees Collection',
      message: 'All Center Admins are advised to follow up on pending student installments before the monthly closing on 25th of this month.',
      date: '2026-06-11',
      target: 'center_admin'
    },
    {
      id: 'N003',
      title: 'NIELIT CCC & O-Level Examination Form Submission',
      message: 'Students appearing for the upcoming NIELIT exam cycle must submit examination fees and photo ID proof by June 28 at the center office.',
      date: '2026-06-14',
      target: 'all'
    },
    {
      id: 'N004',
      title: 'New Batch Launch: Python Full Stack Development',
      message: 'Admission is now open for weekend batch of Python Full Stack Web Development starting from July 5. Limited 25 seats available per center.',
      date: '2026-06-18',
      target: 'staff'
    }
  ],

  attendance: [
    {
      id: 'ATT-1774000100',
      center_id: 'C001',
      course: 'ADCA',
      date: '2026-06-15',
      records: {
        'RAD-2026-001': 'present'
      }
    },
    {
      id: 'ATT-1774000200',
      center_id: 'C001',
      course: 'DCA',
      date: '2026-06-15',
      records: {
        'RAD-2026-002': 'present',
        'RAD-2026-008': 'present'
      }
    },
    {
      id: 'ATT-1774000300',
      center_id: 'C002',
      course: 'PGDCA',
      date: '2026-06-15',
      records: {
        'RAD-2026-003': 'present'
      }
    },
    {
      id: 'ATT-1774000400',
      center_id: 'C003',
      course: 'O-Level',
      date: '2026-06-15',
      records: {
        'RAD-2026-005': 'present'
      }
    }
  ]
};


const DDL = `
-- Drop existing views if any
DROP VIEW IF EXISTS v_student_fee_summary;
DROP VIEW IF EXISTS v_center_financial_summary;
DROP VIEW IF EXISTS v_course_enrollments;

-- Table 1: Centers
CREATE TABLE IF NOT EXISTS centers (
  id VARCHAR(50) PRIMARY KEY,
  center_code VARCHAR(50) NOT NULL UNIQUE,
  center_name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  head_name VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Courses
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  eligibility VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Staff
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  login_id VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK(role IN ('super_admin', 'center_admin', 'staff')),
  center_id VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  designation VARCHAR(150),
  status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE SET NULL
);

-- Table 4: Students
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(50) PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  mother_name VARCHAR(100),
  course VARCHAR(50) NOT NULL,
  mobile VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  admission_date DATE NOT NULL,
  fees DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  center_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'dropped')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE
);

-- Table 5: Fees (Fee Receipts & Installments)
CREATE TABLE IF NOT EXISTS fees (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_mode VARCHAR(30) DEFAULT 'Cash',
  remark TEXT,
  receipt_no VARCHAR(50),
  collected_by VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table 6: Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(50) PRIMARY KEY,
  center_id VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  payment_mode VARCHAR(30) DEFAULT 'Cash',
  bill_no VARCHAR(50),
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE
);

-- Table 7: Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(50) PRIMARY KEY,
  center_id VARCHAR(50) NOT NULL,
  course VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  student_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'present',
  records_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE
);

-- Table 8: Notices
CREATE TABLE IF NOT EXISTS notices (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  date DATE NOT NULL,
  target VARCHAR(50) DEFAULT 'all',
  center_id VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 9: Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  record_id VARCHAR(50),
  details TEXT,
  ip_address VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table 10: Legacy Key-Value Storage (Maintained for backward compatibility with frontend sync)
CREATE TABLE IF NOT EXISTS app_data (
  key VARCHAR(50) PRIMARY KEY,
  value LONGTEXT NOT NULL
);

-- Indexes for fast performance
CREATE INDEX IF NOT EXISTS idx_students_center ON students(center_id);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_date ON fees(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_center ON expenses(center_id);
CREATE INDEX IF NOT EXISTS idx_staff_login ON staff(login_id);
CREATE INDEX IF NOT EXISTS idx_attendance_lookup ON attendance(center_id, course, date);

-- -----------------------------------------------------------------------------
-- REPORTING VIEWS
-- -----------------------------------------------------------------------------

-- View 1: Student Fee Summary (Total Fee, Total Paid, Balance Due, Status)
CREATE VIEW v_student_fee_summary AS
SELECT 
  s.id AS student_id,
  s.student_name,
  s.father_name,
  s.mobile,
  s.course,
  s.center_id,
  c.center_name,
  s.admission_date,
  s.fees AS total_fee,
  COALESCE(SUM(f.amount), 0) AS total_paid,
  (s.fees - COALESCE(SUM(f.amount), 0)) AS balance_due,
  CASE 
    WHEN COALESCE(SUM(f.amount), 0) >= s.fees THEN 'Fully Paid'
    WHEN COALESCE(SUM(f.amount), 0) > 0 THEN 'Partial'
    ELSE 'Unpaid'
  END AS payment_status,
  s.status AS student_status
FROM students s
LEFT JOIN centers c ON s.center_id = c.id
LEFT JOIN fees f ON s.id = f.student_id
GROUP BY s.id;

-- View 2: Center Financial Summary (Center collection, expenses, and net profit)
CREATE VIEW v_center_financial_summary AS
SELECT 
  c.id AS center_id,
  c.center_code,
  c.center_name,
  c.head_name,
  COUNT(DISTINCT s.id) AS total_students,
  COALESCE(SUM(DISTINCT f.amount), 0) AS total_collections,
  COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.center_id = c.id), 0) AS total_expenses,
  (COALESCE(SUM(DISTINCT f.amount), 0) - COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.center_id = c.id), 0)) AS net_profit
FROM centers c
LEFT JOIN students s ON c.id = s.center_id
LEFT JOIN fees f ON s.id = f.student_id
GROUP BY c.id;

-- View 3: Course Enrollment Summary
CREATE VIEW v_course_enrollments AS
SELECT 
  cr.code AS course_code,
  cr.name AS course_name,
  cr.duration,
  cr.fee AS standard_fee,
  COUNT(s.id) AS enrolled_students,
  COALESCE(SUM(s.fees), 0) AS expected_revenue,
  COALESCE(SUM(f.amount), 0) AS actual_collected
FROM courses cr
LEFT JOIN students s ON cr.code = s.course
LEFT JOIN fees f ON s.id = f.student_id
GROUP BY cr.id;
`;

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database connection error:', err.message);
      else console.log('Connected to SQLite database at', dbPath);
    });
  }
  return dbInstance;
}

const run = (sql, params = []) => new Promise((resolve, reject) => {
  getDb().run(sql, params, function (err) {
    if (err) return reject(err);
    resolve({ id: this.lastID, changes: this.changes });
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  getDb().get(sql, params, (err, row) => {
    if (err) return reject(err);
    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  getDb().all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

const execSql = (sql) => new Promise((resolve, reject) => {
  getDb().exec(sql, (err) => {
    if (err) return reject(err);
    resolve();
  });
});

async function initializeDatabase() {
  try {
    // 1. Initialize schema
    await execSql(DDDL_CLEAN());

    // 2. Check if tables have records, if not, seed them
    const studentCountRow = await get('SELECT count(*) as count FROM students').catch(() => ({ count: 0 }));
    if (!studentCountRow || studentCountRow.count === 0) {
      console.log('Seeding initial data into database...');
      // Centers
      for (const c of SEED.centers) {
        await run(
          `INSERT INTO centers (id, center_code, center_name, address, head_name, contact, email, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET center_name=excluded.center_name`,
          [c.id, c.center_code, c.center_name, c.address, c.head_name, c.contact, c.email, c.status]
        );
      }
      // Courses
      for (const cr of SEED.courses) {
        await run(
          `INSERT INTO courses (id, code, name, duration, fee, description, eligibility, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET name=excluded.name`,
          [cr.id, cr.code, cr.name, cr.duration, cr.fee, cr.description, cr.eligibility, cr.status]
        );
      }
      // Staff
      for (const s of SEED.staff) {
        await run(
          `INSERT INTO staff (id, name, login_id, password, role, center_id, phone, email, designation, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET name=excluded.name`,
          [s.id, s.name, s.login_id, s.password, s.role, s.center_id || null, s.phone, s.email, s.designation, s.status]
        );
      }
      // Students
      for (const st of SEED.students) {
        await run(
          `INSERT INTO students (id, student_name, father_name, mother_name, course, mobile, email, address, admission_date, fees, center_id, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET student_name=excluded.student_name`,
          [st.id, st.student_name, st.father_name, st.mother_name, st.course, st.mobile, st.email, st.address, st.admission_date, st.fees, st.center_id, st.status]
        );
      }
      // Fees
      for (const f of SEED.fees) {
        await run(
          `INSERT INTO fees (id, student_id, amount, payment_date, payment_mode, remark, receipt_no)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET amount=excluded.amount`,
          [f.id, f.student_id, f.amount, f.payment_date, f.payment_mode, f.remark, f.receipt_no]
        );
      }
      // Expenses
      for (const e of SEED.expenses) {
        await run(
          `INSERT INTO expenses (id, center_id, title, amount, date, category, payment_mode, bill_no)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET amount=excluded.amount`,
          [e.id, e.center_id, e.title, e.amount, e.date, e.category, e.payment_mode, e.bill_no]
        );
      }
      // Notices
      for (const n of SEED.notices) {
        await run(
          `INSERT INTO notices (id, title, message, date, target)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET title=excluded.title`,
          [n.id, n.title, n.message, n.date, n.target]
        );
      }
      // Attendance
      for (const a of SEED.attendance) {
        await run(
          `INSERT INTO attendance (id, center_id, course, date, records_json)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET records_json=excluded.records_json`,
          [a.id, a.center_id, a.course, a.date, JSON.stringify(a.records)]
        );
      }
      console.log('Seeding completed successfully.');
    }

    // 3. Sync app_data
    const collectionsToSync = {
      centers: SEED.centers,
      courses: SEED.courses,
      staff: SEED.staff,
      students: SEED.students,
      fees: SEED.fees,
      expenses: SEED.expenses,
      notices: SEED.notices,
      attendance: SEED.attendance
    };
    for (const [key, value] of Object.entries(collectionsToSync)) {
      const existing = await get('SELECT value FROM app_data WHERE key = ?', [key]);
      if (!existing) {
        await run('INSERT INTO app_data (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
      }
    }
  } catch (error) {
    console.error('Database initialization warning:', error.message);
  }
}

function DDDL_CLEAN() {
  return `
  CREATE TABLE IF NOT EXISTS centers (
    id VARCHAR(50) PRIMARY KEY,
    center_code VARCHAR(50) NOT NULL UNIQUE,
    center_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    head_name VARCHAR(100) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active'
  );
  CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    eligibility VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active'
  );
  CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    login_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    center_id VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    designation VARCHAR(150),
    status VARCHAR(20) DEFAULT 'active'
  );
  CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    course VARCHAR(50) NOT NULL,
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    admission_date DATE NOT NULL,
    fees DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    center_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active'
  );
  CREATE TABLE IF NOT EXISTS fees (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(30) DEFAULT 'Cash',
    remark TEXT,
    receipt_no VARCHAR(50)
  );
  CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    center_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    payment_mode VARCHAR(30) DEFAULT 'Cash',
    bill_no VARCHAR(50)
  );
  CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(50) PRIMARY KEY,
    center_id VARCHAR(50) NOT NULL,
    course VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    records_json TEXT
  );
  CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    date DATE NOT NULL,
    target VARCHAR(50) DEFAULT 'all'
  );
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    record_id VARCHAR(50),
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS app_data (
    key VARCHAR(50) PRIMARY KEY,
    value LONGTEXT NOT NULL
  );
  `;
}

// -----------------------------------------------------------------------------
// EXPRESS CONFIGURATION & ASSET HANDLERS
// -----------------------------------------------------------------------------
app.use(express.json({ limit: '2mb' }));

// 1. Direct CSS Handler (Serves disk css/style.css if present, else embedded)
app.get(['/css/style.css', '/style.css'], (req, res) => {
  const diskCss = path.join(rootDir, 'css', 'style.css');
  res.setHeader('Content-Type', 'text/css');
  if (fs.existsSync(diskCss)) {
    return res.sendFile(diskCss);
  }
  res.send(EMBEDDED_ASSETS.css);
});

// 2. Direct JS Handlers (Serves disk js files if present, else embedded)
app.get(['/js/db.js', '/db.js'], (req, res) => {
  const diskFile = path.join(rootDir, 'js', 'db.js');
  res.setHeader('Content-Type', 'application/javascript');
  if (fs.existsSync(diskFile)) {
    return res.sendFile(diskFile);
  }
  res.send(EMBEDDED_ASSETS.dbJs);
});

app.get(['/js/main.js', '/main.js'], (req, res) => {
  const diskFile = path.join(rootDir, 'js', 'main.js');
  res.setHeader('Content-Type', 'application/javascript');
  if (fs.existsSync(diskFile)) {
    return res.sendFile(diskFile);
  }
  res.send(EMBEDDED_ASSETS.mainJs);
});

app.get(['/js/dashboard.js', '/dashboard.js'], (req, res) => {
  const diskFile = path.join(rootDir, 'js', 'dashboard.js');
  res.setHeader('Content-Type', 'application/javascript');
  if (fs.existsSync(diskFile)) {
    return res.sendFile(diskFile);
  }
  res.send(EMBEDDED_ASSETS.dashboardJs);
});

// Serve root static directory
app.use(express.static(rootDir));

// -----------------------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------------------
async function getCollection(key) {
  const row = await get('SELECT value FROM app_data WHERE key = ?', [key]);
  if (!row) return [];
  try {
    return JSON.parse(row.value);
  } catch (error) {
    return [];
  }
}

async function saveCollection(key, value) {
  const jsonValue = JSON.stringify(value);
  await run(
    `INSERT INTO app_data (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, jsonValue]
  );
  return value;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend is running', time: new Date().toISOString() });
});

app.get('/api/collections', async (req, res) => {
  try {
    const keys = ['centers', 'staff', 'students', 'fees', 'attendance', 'expenses', 'notices', 'courses'];
    const collections = {};
    for (const key of keys) {
      collections[key] = await getCollection(key);
    }
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: 'Failed to fetch collections' });
  }
});

app.get('/api/data/:key', async (req, res) => {
  try {
    const key = req.params.key.toLowerCase();
    const data = await getCollection(key);
    res.json(data);
  } catch (error) {
    console.error('Error reading collection:', error);
    res.status(500).json({ message: 'Failed to read dataset' });
  }
});

app.post('/api/data/:key', async (req, res) => {
  try {
    const key = req.params.key.toLowerCase();
    const value = req.body;
    const saved = await saveCollection(key, value);
    res.json({ success: true, key, data: saved });
  } catch (error) {
    console.error('Error saving collection:', error);
    res.status(500).json({ message: 'Failed to save dataset' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { loginId, password } = req.body || {};
    const staffList = await getCollection('staff');
    const user = staffList.find((s) => {
      return s.login_id.toLowerCase() === String(loginId || '').toLowerCase() && s.password === String(password || '');
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid Login ID or Password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact Super Admin.' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed due to server error.' });
  }
});

app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/enquiries', async (req, res) => {
  try {
    const enquiry = req.body || {};
    const id = 'ENQ-' + Date.now();
    await run(
      `INSERT INTO audit_logs (user_id, action, entity, record_id, details) VALUES (?, ?, ?, ?, ?)`,
      ['PUBLIC', 'STUDENT_ENQUIRY', 'enquiries', id, JSON.stringify(enquiry)]
    ).catch(() => {});
    res.json({ success: true, id, message: 'Enquiry received successfully.' });
  } catch (error) {
    console.error('Enquiry error:', error);
    res.status(500).json({ success: false, message: 'Failed to record enquiry.' });
  }
});

// HTML page routing
app.get('*', (req, res) => {
  const safePath = path.join(rootDir, req.path === '/' ? 'index.html' : req.path);
  if (safePath.startsWith(rootDir) && fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    return res.sendFile(safePath);
  }
  res.sendFile(path.join(rootDir, 'index.html'));
});

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Radhika backend running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
