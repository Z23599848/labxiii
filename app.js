/* Shared navigation, appearance and enquiry controls. No network submission. */
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    let theme = 'light';
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') theme = saved;
    } catch (_) { /* Storage may be disabled by the browser. */ }
    function applyTheme(value) {
        root.setAttribute('data-theme', value);
        const sun = document.getElementById('sun-icon');
        const moon = document.getElementById('moon-icon');
        if (sun) sun.style.display = value === 'dark' ? 'block' : 'none';
        if (moon) moon.style.display = value === 'dark' ? 'none' : 'block';
        if (toggle) toggle.setAttribute('aria-label', 'Switch to ' + (value === 'dark' ? 'light' : 'dark') + ' mode');
    }
    applyTheme(theme);
    if (toggle) toggle.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        applyTheme(theme);
        try { localStorage.setItem('theme', theme); } catch (_) {}
    });
    const menu = document.getElementById('primary-navigation');
    const menuToggle = document.getElementById('menu-toggle');
    if (menu && menuToggle) {
        function closeMenu() {
            menu.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        menuToggle.hidden = false;
        menu.classList.add('menu-ready');
        menuToggle.addEventListener('click', () => {
            const open = menu.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', String(open));
        });
        menu.addEventListener('click', event => {
            if (event.target.closest('a')) closeMenu();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && menu.classList.contains('is-open')) {
                closeMenu();
                menuToggle.focus();
            }
        });
        document.addEventListener('click', event => {
            if (!event.target.closest('.navbar')) closeMenu();
        });
    }
});
let modalTrigger = null;
let previousOverflow = '';
let inertSiblings = [];
window.openPreorderModal = function(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('preorder-modal');
    if (!modal || modal.classList.contains('active')) return;
    modalTrigger = document.activeElement;
    previousOverflow = document.body.style.overflow;
    inertSiblings = Array.from(document.body.children)
        .filter(element => element !== modal && !element.inert);
    inertSiblings.forEach(element => { element.inert = true; });
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close-btn').focus();
};
window.closePreorderModal = function() {
    const modal = document.getElementById('preorder-modal');
    if (!modal || !modal.classList.contains('active')) return;
    modal.classList.remove('active');
    document.body.style.overflow = previousOverflow;
    inertSiblings.forEach(element => { element.inert = false; });
    inertSiblings = [];
    if (modalTrigger && modalTrigger.isConnected) modalTrigger.focus();
};
document.addEventListener('click', event => {
    if (event.target === document.getElementById('preorder-modal')) closePreorderModal();
});
document.addEventListener('keydown', event => {
    const modal = document.getElementById('preorder-modal');
    if (!modal || !modal.classList.contains('active')) return;
    if (event.key === 'Escape') {
        event.preventDefault();
        closePreorderModal();
    }
    if (event.key === 'Tab') {
        const focusable = Array.from(modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]'))
            .filter(element => !element.disabled && element.getClientRects().length);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});
window.handlePreorderSubmit = function(event) {
    event.preventDefault();
    const form = document.getElementById('preorder-form');
    if (!form.reportValidity()) return;
    const value = id => document.getElementById(id).value.trim();
    const subject = 'SRC enquiry — ' + value('po-org');
    const body = [
        'Hello LabXIII,', '', 'I would like to enquire about Semantic Remote Control.',
        'Name: ' + value('po-name'), 'Email: ' + value('po-email'),
        'Organization: ' + value('po-org'), 'Units: ' + value('po-units'),
        'Environment: ' + value('po-usecase'), 'Notes: ' + value('po-notes')
    ].join('\n');
    document.getElementById('email-confirmation-link').href =
        'mailto:aliganji@labxiii.org?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.getElementById('enquiry-copy').value = body;
    document.getElementById('preorder-form-container').style.display = 'none';
    document.getElementById('preorder-confirmation').style.display = 'block';
    document.getElementById('enquiry-ready-title').focus();
};
window.editEnquiry = function() {
    document.getElementById('preorder-confirmation').style.display = 'none';
    document.getElementById('preorder-form-container').style.display = 'block';
    document.getElementById('po-name').focus();
};
