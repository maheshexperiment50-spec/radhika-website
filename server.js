const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;

// -----------------------------------------------------------------------------
// MONGODB CONNECTION
// -----------------------------------------------------------------------------
const MONGODB_URI = process.env.MONGODB_URI || '';
let mongoClient = null;
let mongoDB = null;
const localDataDir = path.join(rootDir, 'data');
const localCollectionsFile = path.join(localDataDir, 'collections.json');
let useLocalFileStorage = false;

function readLocalCollections() {
  try {
    if (!fs.existsSync(localDataDir)) fs.mkdirSync(localDataDir, { recursive: true });
    if (!fs.existsSync(localCollectionsFile)) return {};
    const raw = fs.readFileSync(localCollectionsFile, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    return {};
  }
}

function writeLocalCollections(data) {
  try {
    if (!fs.existsSync(localDataDir)) fs.mkdirSync(localDataDir, { recursive: true });
    fs.writeFileSync(localCollectionsFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write local collections:', e);
  }
}

async function connectMongo() {
  if (!MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI set nahi hai — Local permanent file database (data/collections.json) activate ho gaya.');
    useLocalFileStorage = true;
    return null;
  }
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
    await mongoClient.connect();
    mongoDB = mongoClient.db('radhika_college');
    console.log('✅ MongoDB Atlas se connect ho gaya!');
    return mongoDB;
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connect nahi hua, Local permanent file database pe fallback kar raha hun:', err.message);
    useLocalFileStorage = true;
    return null;
  }
}

function getDb() {
  if (!mongoDB && !useLocalFileStorage) throw new Error('Database connected nahi hai');
  return mongoDB;
}

// -----------------------------------------------------------------------------
// EMBEDDED FALLBACK ASSETS (Guarantees CSS & JS load even if folders were not pushed to Git)
// -----------------------------------------------------------------------------
const EMBEDDED_ASSETS = {
  css: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');\n\n/* CSS Variables for Colors and Transitions */\n:root {\n    --primary: #2563eb;\n    --primary-hover: #1d4ed8;\n    --secondary: #06b6d4;\n    --accent: #4f46e5;\n    --success: #10b981;\n    --danger: #ef4444;\n    --warning: #f59e0b;\n    --info: #3b82f6;\n    \n    /* Light Mode */\n    --bg-primary: #f8fafc;\n    --bg-secondary: #ffffff;\n    --border-color: #e2e8f0;\n    --text-primary: #0f172a;\n    --text-secondary: #475569;\n    --text-muted: #94a3b8;\n    --card-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.08), 0 2px 8px -1px rgba(148, 163, 184, 0.04);\n    --card-shadow-hover: 0 12px 24px -4px rgba(37, 99, 235, 0.12), 0 4px 12px -2px rgba(37, 99, 235, 0.04);\n    --sidebar-bg: #1e293b;\n    --sidebar-text: #94a3b8;\n    --sidebar-active-bg: #2563eb;\n    --sidebar-active-text: #ffffff;\n    --glass-bg: rgba(255, 255, 255, 0.7);\n    --glass-border: rgba(226, 232, 240, 0.8);\n    \n    --radius-sm: 6px;\n    --radius-md: 12px;\n    --radius-lg: 18px;\n    \n    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n/* Dark Mode Variables */\nbody.dark-mode {\n    --bg-primary: #0b0f19;\n    --bg-secondary: #151f32;\n    --border-color: #243049;\n    --text-primary: #f8fafc;\n    --text-secondary: #94a3b8;\n    --text-muted: #64748b;\n    --card-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3);\n    --card-shadow-hover: 0 12px 24px -4px rgba(37, 99, 235, 0.25);\n    --sidebar-bg: #0b0f19;\n    --sidebar-text: #64748b;\n    --glass-bg: rgba(21, 31, 50, 0.7);\n    --glass-border: rgba(36, 48, 73, 0.8);\n}\n\n/* General Reset & Layout */\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n    font-family: 'Outfit', sans-serif;\n    scroll-behavior: smooth;\n}\n\nbody {\n    background-color: var(--bg-primary);\n    color: var(--text-primary);\n    transition: var(--transition);\n    overflow-x: hidden;\n}\n\n/* Scrollbar styling */\n::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n::-webkit-scrollbar-track {\n    background: var(--bg-primary);\n}\n::-webkit-scrollbar-thumb {\n    background: var(--border-color);\n    border-radius: var(--radius-sm);\n}\n::-webkit-scrollbar-thumb:hover {\n    background: var(--text-muted);\n}\n\n/* Helper Typography & Badges */\na {\n    color: inherit;\n    text-decoration: none;\n}\n\nbutton, input, select, textarea {\n    outline: none;\n    border: 1px solid var(--border-color);\n    background-color: var(--bg-secondary);\n    color: var(--text-primary);\n    border-radius: var(--radius-sm);\n    padding: 8px 12px;\n    transition: var(--transition);\n}\n\nbutton {\n    cursor: pointer;\n    font-weight: 500;\n}\n\n.badge {\n    padding: 4px 8px;\n    border-radius: 50px;\n    font-size: 0.75rem;\n    font-weight: 600;\n    display: inline-flex;\n    align-items: center;\n    gap: 4px;\n}\n.badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); }\n.badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }\n.badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }\n.badge-info { background: rgba(59, 130, 246, 0.1); color: var(--info); }\n.badge-primary { background: rgba(37, 99, 237, 0.1); color: var(--primary); }\n\n/* PUBLIC WEBSITE STYLING */\nheader.site-header {\n    position: sticky;\n    top: 0;\n    z-index: 100;\n    background: var(--glass-bg);\n    backdrop-filter: blur(12px);\n    border-bottom: 1px solid var(--glass-border);\n    padding: 15px 5%;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    transition: var(--transition);\n}\n\n.logo-container {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n}\n\n.logo-icon {\n    width: 45px;\n    height: 45px;\n    background: linear-gradient(135deg, var(--primary), var(--secondary));\n    border-radius: var(--radius-md);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: white;\n    font-size: 1.5rem;\n    font-weight: 800;\n    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);\n}\n\n.logo-text h1 {\n    font-size: 1.25rem;\n    font-weight: 700;\n    color: var(--primary);\n    line-height: 1.1;\n}\n\n.logo-text p {\n    font-size: 0.75rem;\n    color: var(--text-secondary);\n    letter-spacing: 1px;\n}\n\n.site-nav {\n    display: flex;\n    gap: 25px;\n    align-items: center;\n}\n\n.nav-link {\n    font-weight: 500;\n    color: var(--text-secondary);\n    position: relative;\n    padding: 5px 0;\n}\n.nav-link:after {\n    content: '';\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    width: 0;\n    height: 2px;\n    background: var(--primary);\n    transition: var(--transition);\n}\n.nav-link:hover, .nav-link.active {\n    color: var(--primary);\n}\n.nav-link:hover:after, .nav-link.active:after {\n    width: 100%;\n}\n\n.btn-primary {\n    background: var(--primary);\n    color: white;\n    border: none;\n    border-radius: var(--radius-md);\n    padding: 10px 20px;\n    font-weight: 600;\n    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);\n}\n.btn-primary:hover {\n    background: var(--primary-hover);\n    transform: translateY(-2px);\n    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);\n}\n\n.btn-secondary {\n    background: transparent;\n    color: var(--text-primary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-md);\n    padding: 10px 20px;\n}\n.btn-secondary:hover {\n    background: var(--bg-primary);\n    border-color: var(--text-secondary);\n}\n\n/* Toggle Theme Button */\n.theme-btn {\n    background: transparent;\n    border: none;\n    font-size: 1.25rem;\n    color: var(--text-secondary);\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    width: 38px;\n    height: 38px;\n    border-radius: 50%;\n}\n.theme-btn:hover {\n    background: var(--border-color);\n    color: var(--primary);\n}\n\n/* Home Hero Section */\n.hero-section {\n    padding: 80px 5% 60px;\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 40px;\n    align-items: center;\n    background: radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),\n                radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);\n}\n\n.hero-content h2 {\n    font-size: 3rem;\n    font-weight: 800;\n    line-height: 1.2;\n    margin-bottom: 20px;\n}\n.hero-content h2 span {\n    background: linear-gradient(to right, var(--primary), var(--secondary));\n    -webkit-background-clip: text;\n    -webkit-text-fill-color: transparent;\n}\n\n.hero-content p {\n    font-size: 1.125rem;\n    color: var(--text-secondary);\n    margin-bottom: 30px;\n    line-height: 1.6;\n}\n\n.hero-cta {\n    display: flex;\n    gap: 15px;\n}\n\n.hero-illustration {\n    position: relative;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n.hero-illustration svg {\n    width: 90%;\n    max-width: 500px;\n    animation: float 6s ease-in-out infinite;\n}\n\n@keyframes float {\n    0%, 100% { transform: translateY(0px); }\n    50% { transform: translateY(-15px); }\n}\n\n/* Statistics Ribbon */\n.stats-ribbon {\n    display: grid;\n    grid-template-columns: repeat(4, 1fr);\n    gap: 20px;\n    padding: 40px 5%;\n    background: var(--bg-secondary);\n    border-top: 1px solid var(--border-color);\n    border-bottom: 1px solid var(--border-color);\n}\n\n.stat-item {\n    text-align: center;\n}\n.stat-num {\n    font-size: 2.5rem;\n    font-weight: 800;\n    color: var(--primary);\n}\n.stat-label {\n    color: var(--text-secondary);\n    font-size: 0.9rem;\n    font-weight: 500;\n    text-transform: uppercase;\n    letter-spacing: 1px;\n}\n\n/* Public Courses & About */\n.section {\n    padding: 80px 5%;\n}\n\n.section-title {\n    text-align: center;\n    margin-bottom: 50px;\n}\n.section-title h3 {\n    font-size: 2rem;\n    font-weight: 700;\n    margin-bottom: 10px;\n}\n.section-title p {\n    color: var(--text-muted);\n}\n\n.courses-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n    gap: 30px;\n}\n\n.course-card {\n    background: var(--bg-secondary);\n    border-radius: var(--radius-lg);\n    border: 1px solid var(--border-color);\n    padding: 30px;\n    box-shadow: var(--card-shadow);\n    transition: var(--transition);\n}\n.course-card:hover {\n    transform: translateY(-8px);\n    box-shadow: var(--card-shadow-hover);\n    border-color: var(--primary);\n}\n\n.course-icon {\n    font-size: 2.5rem;\n    color: var(--primary);\n    margin-bottom: 20px;\n}\n\n.course-card h4 {\n    font-size: 1.25rem;\n    font-weight: 700;\n    margin-bottom: 10px;\n}\n\n.course-card p {\n    color: var(--text-secondary);\n    font-size: 0.95rem;\n    line-height: 1.5;\n    margin-bottom: 20px;\n}\n\n.course-meta {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-top: 1px solid var(--border-color);\n    padding-top: 15px;\n    font-size: 0.85rem;\n    color: var(--text-muted);\n}\n\n/* Contact / Enquiry Section */\n.contact-container {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 50px;\n}\n\n.contact-info-list {\n    display: flex;\n    flex-direction: column;\n    gap: 30px;\n}\n\n.contact-info-item {\n    display: flex;\n    gap: 20px;\n    align-items: flex-start;\n}\n\n.contact-info-icon {\n    width: 48px;\n    height: 48px;\n    border-radius: 50%;\n    background: rgba(37, 99, 235, 0.1);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: var(--primary);\n    font-size: 1.25rem;\n    flex-shrink: 0;\n}\n\n.contact-info-text h5 {\n    font-size: 1.1rem;\n    font-weight: 600;\n    margin-bottom: 5px;\n}\n.contact-info-text p {\n    color: var(--text-secondary);\n    font-size: 0.95rem;\n}\n\n.enquiry-form-card {\n    background: var(--bg-secondary);\n    border-radius: var(--radius-lg);\n    border: 1px solid var(--border-color);\n    padding: 40px;\n    box-shadow: var(--card-shadow);\n}\n\n.form-group {\n    margin-bottom: 20px;\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n}\n.form-group label {\n    font-weight: 600;\n    font-size: 0.9rem;\n    color: var(--text-secondary);\n}\n\n.form-group input, .form-group select, .form-group textarea {\n    padding: 12px;\n    border-radius: var(--radius-md);\n}\n.form-group input:focus, .form-group select:focus, .form-group textarea:focus {\n    border-color: var(--primary);\n    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);\n}\n\n/* SECURE LOGIN PAGE STYLING */\n.login-wrapper {\n    min-height: 100vh;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    padding: 20px;\n    background: radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 60%),\n                radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 60%);\n}\n\n.login-card {\n    background: var(--bg-secondary);\n    border-radius: var(--radius-lg);\n    border: 1px solid var(--border-color);\n    padding: 40px;\n    width: 100%;\n    max-width: 480px;\n    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.1);\n    position: relative;\n    overflow: hidden;\n}\n.login-card:before {\n    content: '';\n    position: absolute;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 4px;\n    background: linear-gradient(90deg, var(--primary), var(--secondary));\n}\n\n.login-header {\n    text-align: center;\n    margin-bottom: 30px;\n}\n.login-header h2 {\n    font-size: 1.75rem;\n    font-weight: 700;\n    margin-top: 15px;\n    margin-bottom: 5px;\n}\n.login-header p {\n    color: var(--text-secondary);\n    font-size: 0.9rem;\n}\n\n/* Autofill buttons for testing ERP roles quickly */\n.demo-accounts {\n    background: var(--bg-primary);\n    border-radius: var(--radius-md);\n    padding: 15px;\n    margin-bottom: 25px;\n    border: 1px dashed var(--border-color);\n}\n.demo-accounts p {\n    font-size: 0.8rem;\n    font-weight: 600;\n    color: var(--text-secondary);\n    margin-bottom: 10px;\n    text-transform: uppercase;\n    letter-spacing: 0.5px;\n}\n.demo-buttons {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 8px;\n}\n.demo-btn {\n    padding: 8px;\n    font-size: 0.75rem;\n    border-radius: var(--radius-sm);\n    text-align: center;\n    border: 1px solid var(--border-color);\n    background: var(--bg-secondary);\n    font-weight: 600;\n}\n.demo-btn:hover {\n    background: var(--primary);\n    color: white;\n    border-color: var(--primary);\n}\n\n.forgot-link {\n    font-size: 0.85rem;\n    color: var(--primary);\n    font-weight: 500;\n    text-align: right;\n    display: block;\n    margin-top: -10px;\n    margin-bottom: 20px;\n}\n.forgot-link:hover {\n    text-decoration: underline;\n}\n\n/* CORE ERP DASHBOARD LAYOUT */\n.dashboard-container {\n    min-height: 100vh;\n    display: grid;\n    grid-template-columns: 260px 1fr;\n    transition: var(--transition);\n}\n.dashboard-container.sidebar-collapsed {\n    grid-template-columns: 80px 1fr;\n}\n\n/* Sidebar Styling */\naside.sidebar {\n    background: var(--sidebar-bg);\n    color: var(--sidebar-text);\n    padding: 20px 15px;\n    display: flex;\n    flex-direction: column;\n    border-right: 1px solid var(--border-color);\n    position: sticky;\n    top: 0;\n    height: 100vh;\n    z-index: 50;\n    transition: var(--transition);\n}\n\n.sidebar-logo {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    padding-bottom: 20px;\n    border-bottom: 1px solid var(--border-color);\n    margin-bottom: 25px;\n    overflow: hidden;\n}\n\n.sidebar-logo h1 {\n    color: white;\n    font-size: 1.15rem;\n    font-weight: 700;\n    white-space: nowrap;\n    transition: var(--transition);\n}\n\n.dashboard-container.sidebar-collapsed .sidebar-logo h1 {\n    opacity: 0;\n    width: 0;\n}\n\n.sidebar-menu {\n    list-style: none;\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n    flex-grow: 1;\n}\n\n.menu-item a {\n    display: flex;\n    align-items: center;\n    gap: 14px;\n    padding: 12px 16px;\n    border-radius: var(--radius-md);\n    color: var(--sidebar-text);\n    font-weight: 500;\n    transition: var(--transition);\n    white-space: nowrap;\n}\n\n.menu-item a i {\n    font-size: 1.2rem;\n    width: 20px;\n    text-align: center;\n}\n\n.menu-item a:hover, .menu-item.active a {\n    background: var(--sidebar-active-bg);\n    color: var(--sidebar-active-text);\n}\n\n.sidebar-user {\n    padding-top: 15px;\n    border-top: 1px solid var(--border-color);\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    overflow: hidden;\n}\n\n.user-avatar {\n    width: 40px;\n    height: 40px;\n    border-radius: 50%;\n    background: var(--primary);\n    color: white;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-weight: 700;\n    font-size: 1.1rem;\n    flex-shrink: 0;\n}\n\n.user-info {\n    transition: var(--transition);\n    overflow: hidden;\n}\n.user-info h5 {\n    color: white;\n    font-size: 0.9rem;\n    font-weight: 600;\n    white-space: nowrap;\n}\n.user-info p {\n    font-size: 0.75rem;\n    color: var(--text-muted);\n    white-space: nowrap;\n    text-transform: capitalize;\n}\n\n.dashboard-container.sidebar-collapsed .sidebar-user .user-info {\n    opacity: 0;\n    width: 0;\n}\n\n/* Main Dashboard Panel */\nmain.main-panel {\n    display: flex;\n    flex-direction: column;\n    min-height: 100vh;\n    overflow-x: hidden;\n}\n\n/* Dashboard Header */\nheader.panel-header {\n    background: var(--bg-secondary);\n    border-bottom: 1px solid var(--border-color);\n    padding: 15px 30px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    position: sticky;\n    top: 0;\n    z-index: 40;\n}\n\n.header-left {\n    display: flex;\n    align-items: center;\n    gap: 20px;\n}\n\n.sidebar-toggle {\n    background: transparent;\n    border: none;\n    font-size: 1.25rem;\n    cursor: pointer;\n    color: var(--text-secondary);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.header-title h2 {\n    font-size: 1.35rem;\n    font-weight: 700;\n}\n\n.header-right {\n    display: flex;\n    align-items: center;\n    gap: 15px;\n}\n\n.search-bar {\n    position: relative;\n    width: 250px;\n}\n.search-bar input {\n    width: 100%;\n    padding: 8px 12px 8px 35px;\n    border-radius: 50px;\n}\n.search-bar i {\n    position: absolute;\n    left: 12px;\n    top: 50%;\n    transform: translateY(-50%);\n    color: var(--text-muted);\n}\n\n.notification-bell {\n    position: relative;\n}\n.bell-badge {\n    position: absolute;\n    top: -2px;\n    right: -2px;\n    width: 8px;\n    height: 8px;\n    background: var(--danger);\n    border-radius: 50%;\n}\n\n.notifications-dropdown {\n    position: absolute;\n    top: 50px;\n    right: -10px;\n    width: 320px;\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    box-shadow: var(--card-shadow-hover);\n    padding: 15px;\n    display: none;\n    z-index: 100;\n}\n.notifications-dropdown.active {\n    display: block;\n    animation: slideDown 0.2s ease-out;\n}\n.notif-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-bottom: 1px solid var(--border-color);\n    padding-bottom: 10px;\n    margin-bottom: 10px;\n}\n.notif-list {\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    max-height: 250px;\n    overflow-y: auto;\n}\n.notif-item {\n    padding: 8px;\n    border-radius: var(--radius-sm);\n    background: var(--bg-primary);\n    font-size: 0.85rem;\n}\n.notif-item p { margin-bottom: 3px; }\n.notif-time { font-size: 0.75rem; color: var(--text-muted); }\n\n/* Dashboard Body & Widgets */\n.panel-body {\n    padding: 30px;\n    flex-grow: 1;\n}\n\n.widgets-grid {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n    gap: 20px;\n    margin-bottom: 30px;\n}\n\n.widget-card {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    padding: 24px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    box-shadow: var(--card-shadow);\n    transition: var(--transition);\n}\n.widget-card:hover {\n    transform: translateY(-4px);\n    box-shadow: var(--card-shadow-hover);\n    border-color: var(--primary);\n}\n\n.widget-info h4 {\n    font-size: 0.85rem;\n    font-weight: 600;\n    text-transform: uppercase;\n    color: var(--text-secondary);\n    letter-spacing: 0.5px;\n    margin-bottom: 6px;\n}\n.widget-info p {\n    font-size: 1.85rem;\n    font-weight: 800;\n}\n.widget-info span {\n    font-size: 0.75rem;\n    color: var(--text-muted);\n}\n\n.widget-icon {\n    width: 48px;\n    height: 48px;\n    border-radius: var(--radius-md);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 1.4rem;\n}\n.widget-icon.primary { background: rgba(37, 99, 235, 0.1); color: var(--primary); }\n.widget-icon.secondary { background: rgba(6, 182, 212, 0.1); color: var(--secondary); }\n.widget-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--success); }\n.widget-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); }\n.widget-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }\n\n/* Graphs Section */\n.charts-grid {\n    display: grid;\n    grid-template-columns: 2fr 1fr;\n    gap: 24px;\n    margin-bottom: 30px;\n}\n@media (max-width: 1024px) {\n    .charts-grid { grid-template-columns: 1fr; }\n}\n\n.chart-card {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    padding: 24px;\n    box-shadow: var(--card-shadow);\n}\n\n.chart-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 20px;\n}\n.chart-header h3 {\n    font-size: 1.1rem;\n    font-weight: 700;\n}\n\n/* Custom SVG Chart / SVG Styles */\n.chart-container {\n    height: 250px;\n    position: relative;\n    width: 100%;\n}\n\n/* Notice & Activity log widgets */\n.activity-list {\n    display: flex;\n    flex-direction: column;\n    gap: 15px;\n}\n.activity-item {\n    display: flex;\n    gap: 15px;\n    align-items: flex-start;\n}\n.activity-dot {\n    width: 10px;\n    height: 10px;\n    border-radius: 50%;\n    margin-top: 5px;\n    flex-shrink: 0;\n}\n.activity-content {\n    font-size: 0.9rem;\n}\n.activity-content p {\n    color: var(--text-secondary);\n}\n.activity-time {\n    font-size: 0.75rem;\n    color: var(--text-muted);\n}\n\n/* DATA TABLES */\n.table-container {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    box-shadow: var(--card-shadow);\n    overflow: hidden;\n    margin-top: 20px;\n    width: 100%;\n}\n\n.table-header-bar {\n    padding: 20px 24px;\n    border-bottom: 1px solid var(--border-color);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    gap: 15px;\n    flex-wrap: wrap;\n}\n\n.table-header-bar h3 {\n    font-size: 1.15rem;\n    font-weight: 700;\n}\n\n.table-actions {\n    display: flex;\n    gap: 12px;\n    align-items: center;\n    flex-wrap: wrap;\n}\n\n.table-responsive {\n    overflow-x: auto;\n    width: 100%;\n}\n\ntable.data-table {\n    width: 100%;\n    border-collapse: collapse;\n    text-align: left;\n}\n\ntable.data-table th, table.data-table td {\n    padding: 16px 24px;\n    border-bottom: 1px solid var(--border-color);\n    font-size: 0.925rem;\n    white-space: nowrap;\n}\n\ntable.data-table th {\n    background: var(--bg-primary);\n    color: var(--text-secondary);\n    font-weight: 600;\n}\n\ntable.data-table tbody tr:hover {\n    background: rgba(37, 99, 235, 0.02);\n}\n\n.actions-cell {\n    display: flex;\n    gap: 8px;\n}\n\n.btn-icon {\n    width: 32px;\n    height: 32px;\n    border-radius: var(--radius-sm);\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: transparent;\n    color: var(--text-secondary);\n    border: 1px solid var(--border-color);\n    padding: 0;\n}\n.btn-icon:hover {\n    background: var(--bg-primary);\n    color: var(--primary);\n}\n.btn-icon.edit:hover { border-color: var(--primary); color: var(--primary); }\n.btn-icon.delete:hover { border-color: var(--danger); color: var(--danger); }\n.btn-icon.print:hover { border-color: var(--success); color: var(--success); }\n\n/* MODALS */\n.modal-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: rgba(15, 23, 42, 0.6);\n    backdrop-filter: blur(4px);\n    z-index: 1000;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    opacity: 0;\n    pointer-events: none;\n    transition: opacity 0.3s ease;\n}\n.modal-overlay.active {\n    opacity: 1;\n    pointer-events: auto;\n}\n\n.modal-content {\n    background: var(--bg-secondary);\n    border: 1px solid var(--border-color);\n    border-radius: var(--radius-lg);\n    width: 90%;\n    max-width: 550px;\n    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);\n    transform: scale(0.9);\n    transition: transform 0.3s ease;\n    overflow: hidden;\n}\n.modal-overlay.active .modal-content {\n    transform: scale(1);\n}\n\n.modal-header {\n    padding: 20px 24px;\n    border-bottom: 1px solid var(--border-color);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    background: var(--bg-primary);\n}\n.modal-header h3 {\n    font-size: 1.2rem;\n    font-weight: 700;\n}\n.close-modal {\n    background: transparent;\n    border: none;\n    font-size: 1.25rem;\n    cursor: pointer;\n    color: var(--text-muted);\n}\n\n.modal-body {\n    padding: 24px;\n    max-height: 70vh;\n    overflow-y: auto;\n}\n\n.modal-footer {\n    padding: 16px 24px;\n    border-top: 1px solid var(--border-color);\n    display: flex;\n    justify-content: flex-end;\n    gap: 12px;\n    background: var(--bg-primary);\n}\n\n/* ID Card Printing styles */\n.id-card-preview {\n    width: 320px;\n    height: 480px;\n    border-radius: var(--radius-md);\n    background: linear-gradient(135deg, #1e3a8a, #3b82f6);\n    color: white;\n    margin: 0 auto;\n    padding: 20px;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    justify-content: space-between;\n    box-shadow: 0 10px 25px rgba(0,0,0,0.15);\n    position: relative;\n    overflow: hidden;\n}\n.id-card-preview:before {\n    content: '';\n    position: absolute;\n    bottom: -50px;\n    right: -50px;\n    width: 150px;\n    height: 150px;\n    background: rgba(255, 255, 255, 0.05);\n    border-radius: 50%;\n}\n.id-card-header {\n    text-align: center;\n    width: 100%;\n    border-bottom: 1px solid rgba(255,255,255,0.2);\n    padding-bottom: 10px;\n}\n.id-card-header h4 { font-size: 1.1rem; font-weight: 800; letter-spacing: 0.5px; }\n.id-card-header p { font-size: 0.65rem; opacity: 0.8; text-transform: uppercase; }\n\n.id-card-photo {\n    width: 90px;\n    height: 110px;\n    border: 3px solid white;\n    border-radius: var(--radius-sm);\n    background: white;\n    overflow: hidden;\n    margin: 15px 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    color: #1e3a8a;\n}\n.id-card-details {\n    width: 100%;\n    font-size: 0.8rem;\n    margin-bottom: 15px;\n}\n.id-card-details table {\n    width: 100%;\n}\n.id-card-details td {\n    padding: 4px 0;\n    vertical-align: top;\n}\n.id-card-details td:first-child {\n    font-weight: 600;\n    width: 100px;\n    opacity: 0.8;\n}\n\n.id-card-footer {\n    width: 100%;\n    border-top: 1px solid rgba(255,255,255,0.2);\n    padding-top: 10px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    font-size: 0.7rem;\n}\n.id-barcode {\n    height: 30px;\n    width: 100px;\n    background: white;\n}\n\n/* Toast styling */\n.toast-container {\n    position: fixed;\n    bottom: 25px;\n    right: 25px;\n    display: flex;\n    flex-direction: column;\n    gap: 10px;\n    z-index: 10000;\n}\n.toast {\n    background: var(--bg-secondary);\n    color: var(--text-primary);\n    border-left: 4px solid var(--primary);\n    box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n    border-radius: var(--radius-sm);\n    padding: 16px 20px;\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    min-width: 280px;\n    max-width: 400px;\n    animation: slideIn 0.3s ease-out;\n}\n.toast.toast-success { border-left-color: var(--success); }\n.toast.toast-danger { border-left-color: var(--danger); }\n.toast.toast-warning { border-left-color: var(--warning); }\n\n@keyframes slideIn {\n    from { transform: translateX(100%); opacity: 0; }\n    to { transform: translateX(0); opacity: 1; }\n}\n\n@keyframes slideDown {\n    from { transform: translateY(-10px); opacity: 0; }\n    to { transform: translateY(0); opacity: 1; }\n}\n\n/* Attendance table special styling */\n.attendance-radio-group {\n    display: flex;\n    gap: 15px;\n}\n.attendance-label {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    cursor: pointer;\n    font-size: 0.9rem;\n}\n.attendance-label input {\n    margin: 0;\n}\n\n/* Certificate Layout Print View */\n.certificate-preview {\n    width: 100%;\n    max-width: 650px;\n    aspect-ratio: 1.414;\n    background: #fdfdfd;\n    border: 15px solid #1e3a8a;\n    padding: 30px;\n    position: relative;\n    margin: 0 auto;\n    box-shadow: 0 5px 15px rgba(0,0,0,0.08);\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    text-align: center;\n    color: #1e293b;\n}\n.cert-inner {\n    border: 2px solid #b45309;\n    height: 100%;\n    width: 100%;\n    padding: 20px;\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n}\n.cert-header h4 { font-size: 1.5rem; color: #1e3a8a; font-weight: 800; }\n.cert-header p { font-size: 0.8rem; text-transform: uppercase; color: #b45309; font-weight: 700; letter-spacing: 1px; }\n.cert-title { font-size: 1rem; font-style: italic; margin: 10px 0; }\n.cert-name { font-size: 1.8rem; font-weight: 700; color: #1e3a8a; text-decoration: underline; margin: 5px 0; }\n.cert-text { font-size: 0.85rem; line-height: 1.6; }\n.cert-footer { display: flex; justify-content: space-between; padding-top: 15px; margin-top: 10px; }\n.cert-sign { text-align: center; font-size: 0.8rem; width: 150px; border-top: 1px solid #94a3b8; padding-top: 5px; }\n\n/* Responsive Media Queries */\n@media (max-width: 768px) {\n    header.site-header { padding: 15px 3%; }\n    .site-nav { display: none; } /* On mobile, we can toggle or simplify */\n    .hero-section { grid-template-columns: 1fr; text-align: center; padding-top: 40px; }\n    .hero-cta { justify-content: center; }\n    .stats-ribbon { grid-template-columns: repeat(2, 1fr); gap: 20px; }\n    .contact-container { grid-template-columns: 1fr; }\n    \n    .dashboard-container {\n        grid-template-columns: 1fr; /* Sidebar collapses to drawer */\n    }\n    aside.sidebar {\n        position: fixed;\n        left: -260px;\n        z-index: 1000;\n        box-shadow: 10px 0 30px rgba(0,0,0,0.15);\n    }\n    .dashboard-container.sidebar-active aside.sidebar {\n        left: 0;\n    }\n    header.panel-header { padding: 15px 15px; }\n    .panel-body { padding: 15px; }\n    .widgets-grid { grid-template-columns: 1fr; }\n    .header-left { gap: 10px; }\n    .search-bar { width: 140px; }\n    .search-bar input { padding-left: 28px; }\n    .search-bar i { left: 8px; }\n}\n\n/* Printing styles */\n@media print {\n    body * { visibility: hidden; }\n    .printable-area, .printable-area * { visibility: visible; }\n    .printable-area {\n        position: absolute;\n        left: 0;\n        top: 0;\n        width: 100%;\n        background: white !important;\n        color: black !important;\n    }\n    .modal-overlay { background: transparent !important; }\n}\n",
  dbJs: "/**\n * Radhika IT College Management System - Hybrid client/server database layer\n */\n\nconst DB_KEYS = {\n    CENTERS: 'centers',\n    STAFF: 'staff',\n    STUDENTS: 'students',\n    FEES: 'fees',\n    ATTENDANCE: 'attendance',\n    EXPENSES: 'expenses',\n    NOTICES: 'notices',\n    COURSES: 'courses',\n    CURRENT_USER: 'current_user'\n};\n\nconst SEED_DATA = {\n    centers: [\n        { id: 'C001', center_name: 'Main Campus (HQ)', center_code: 'MCHQ01', address: 'Civil Lines, Near Town Hall, District HQ', head_name: 'Dr. R. K. Sharma', contact: '9876543210' },\n        { id: 'C002', center_name: 'City Tech Center', center_code: 'CTC02', address: 'Station Road, Opp. Central Mall', head_name: 'Prof. Vinay Mishra', contact: '8765432109' },\n        { id: 'C003', center_name: 'Rural IT Development Wing', center_code: 'RIT03', address: 'NH-2 Bypass, Near Block Office', head_name: 'Er. Amit Patel', contact: '7654321098' }\n    ],\n    staff: [
    {
      id: 'S001',
      name: 'Super Administrator',
      login_id: 'superadmin',
      password: '123',
      role: 'super_admin',
      center_id: 'C001',
      phone: '9876543200',
      email: 'admin@radhikaitcollege.com',
      designation: 'Managing Director / Super Admin',
      status: 'active'
    }
  ],

  students: [],
  fees: [],
  expenses: [],
  notices: [],
  attendance: []
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

// -----------------------------------------------------------------------------
// DATABASE HELPER FUNCTIONS (MongoDB Atlas + Local File Storage Fallback)
// -----------------------------------------------------------------------------

async function getCollection(key) {
  try {
    if (useLocalFileStorage) {
      const data = readLocalCollections();
      return data[key] || [];
    }
    const db = getDb();
    const col = db.collection('app_data');
    const doc = await col.findOne({ key });
    return doc ? doc.value : [];
  } catch (error) {
    console.error('getCollection error for', key, ':', error.message);
    if (!useLocalFileStorage) {
      const local = readLocalCollections();
      return local[key] || [];
    }
    return [];
  }
}

async function saveCollection(key, value) {
  try {
    if (useLocalFileStorage) {
      const data = readLocalCollections();
      data[key] = value;
      writeLocalCollections(data);
      return value;
    }
    const db = getDb();
    const col = db.collection('app_data');
    await col.updateOne(
      { key },
      { $set: { key, value, updated_at: new Date() } },
      { upsert: true }
    );
    // Also keep local copy updated as backup
    const local = readLocalCollections();
    local[key] = value;
    writeLocalCollections(local);
    return value;
  } catch (error) {
    console.error('saveCollection error for', key, ':', error.message);
    // Fallback to local storage on error
    const local = readLocalCollections();
    local[key] = value;
    writeLocalCollections(local);
    return value;
  }
}

async function initializeDatabase() {
  try {
    const collectionsToSeed = {
      centers: SEED.centers,
      courses: SEED.courses,
      staff: SEED.staff,
      students: SEED.students,
      fees: SEED.fees,
      expenses: SEED.expenses,
      notices: SEED.notices,
      attendance: SEED.attendance
    };

    if (useLocalFileStorage) {
      const local = readLocalCollections();
      if (!local.students || !Array.isArray(local.students) || local.students.length === 0) {
        console.log('📦 Local storage mein pehli baar seed data save ho raha hai...');
        writeLocalCollections(collectionsToSeed);
        console.log('✅ Local seed data successfully save ho gaya!');
      } else {
        console.log('✅ Local database mein data pehle se maujood hai — seed skip kar raha hun.');
      }
      return;
    }

    const db = getDb();
    const col = db.collection('app_data');

    // Sirf tab seed karo jab 'students' collection bilkul empty ho
    const initDoc = await col.findOne({ key: '_db_initialized' });
    if (!initDoc) {
      console.log('📦 MongoDB mein pehli baar seed data daal raha hun...');
      for (const [key, value] of Object.entries(collectionsToSeed)) {
        await col.updateOne(
          { key },
          { $setOnInsert: { key, value, updated_at: new Date() } },
          { upsert: true }
        );
      }
      await col.updateOne({ key: '_db_initialized' }, { $set: { value: true, date: new Date() } }, { upsert: true });
      console.log('✅ Fresh clean database successfully initialized!');
    } else {
      console.log('✅ MongoDB mein data pehle se hai — seed skip kar raha hun.');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
}

// MongoDB mein DDL/Schema ki zaroorat nahi hoti — collections auto-create ho jaate hain

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
async function getCollectionRoute(key) {
  return await getCollection(key);
}

async function saveCollectionRoute(key, value) {
  return await saveCollection(key, value);
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
    // Enquiry MongoDB mein audit_logs collection mein save karo
    try {
      const db = getDb();
      await db.collection('audit_logs').insertOne({
        user_id: 'PUBLIC',
        action: 'STUDENT_ENQUIRY',
        entity: 'enquiries',
        record_id: id,
        details: JSON.stringify(enquiry),
        created_at: new Date()
      });
    } catch (logErr) {
      console.warn('Enquiry log save nahi hua:', logErr.message);
    }
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
  await connectMongo();       // Pehle MongoDB se connect karo
  await initializeDatabase(); // Phir seed data check karo
  app.listen(PORT, () => {
    console.log(`🚀 Radhika backend running on http://localhost:${PORT}`);
    console.log(`🗄️  Database: MongoDB Atlas (Permanent Storage)`);
  });
}

startServer().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});
