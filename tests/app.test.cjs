// Run with: node --test tests/app.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
function setup(options = {}) {
    const events = {};
    const elements = {};
    const document = {
        addEventListener(type, fn) { (events[type] ||= []).push(fn); },
        getElementById(id) { return elements[id] || null; },
        body: { style: { overflow: 'auto' }, children: [] }
    };
    function element(id) {
        const classes = new Set();
        const handlers = {};
        return elements[id] = {
            style: {}, attrs: {}, value: '', inert: false, isConnected: true,
            classList: {
                add: x => classes.add(x), remove: x => classes.delete(x),
                contains: x => classes.has(x),
                toggle(x) { if (classes.has(x)) { classes.delete(x); return false; } classes.add(x); return true; }
            },
            setAttribute(k, v) { this.attrs[k] = v; },
            addEventListener(k, v) { handlers[k] = v; },
            fire(k, v = {}) { handlers[k]?.(v); },
            focus() { document.activeElement = this; },
            getClientRects() { return [1]; },
            reportValidity() { return !options.invalid; }
        };
    }
    document.documentElement = element('root');
    const storage = new Map(options.theme ? [['theme', options.theme]] : []);
    const localStorage = {
        getItem(k) { if (options.blocked) throw Error('Storage blocked'); return storage.get(k); },
        setItem(k, v) { if (options.blocked) throw Error('Storage blocked'); storage.set(k, v); }
    };
    const context = { document, localStorage };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(source, context);
    function fire(type, event = {}) { for (const fn of events[type] || []) fn(event); }
    return { context, document, element, elements, storage, fire };
}
test('product page works without optional theme controls or graphics libraries', () => {
    const t = setup(); t.fire('DOMContentLoaded');
    assert.equal(t.document.documentElement.attrs['data-theme'], 'dark');
});
test('blocked storage does not break theme switching', () => {
    const t = setup({ blocked: true });
    const toggle = t.element('theme-toggle');
    t.fire('DOMContentLoaded'); toggle.fire('click');
    assert.equal(t.document.documentElement.attrs['data-theme'], 'light');
});
test('invalid stored themes fall back to dark', () => {
    const t = setup({ theme: 'invalid' }); t.fire('DOMContentLoaded');
    assert.equal(t.document.documentElement.attrs['data-theme'], 'dark');
});
test('mobile menu opens and closes with Escape', () => {
    const t = setup();
    const menu = t.element('primary-navigation');
    const toggle = t.element('menu-toggle');
    t.fire('DOMContentLoaded'); toggle.fire('click');
    assert.equal(toggle.attrs['aria-expanded'], 'true');
    assert.equal(menu.classList.contains('is-open'), true);
    t.fire('keydown', { key: 'Escape' });
    assert.equal(toggle.attrs['aria-expanded'], 'false');
    assert.equal(t.document.activeElement, toggle);
});
function enquirySetup(options) {
    const t = setup(options);
    for (const id of ['preorder-form', 'po-name', 'po-email', 'po-org', 'po-units', 'po-usecase', 'po-notes', 'email-confirmation-link', 'enquiry-copy', 'preorder-form-container', 'preorder-confirmation', 'enquiry-ready-title']) t.element(id);
    t.elements['po-name'].value = '<img src=x onerror=alert(1)>';
    t.elements['po-org'].value = 'A & B';
    t.elements['po-email'].value = 'visitor@example.com';
    return t;
}
test('enquiry prepares encoded email without storing personal data or confirming delivery', () => {
    const t = enquirySetup();
    t.context.handlePreorderSubmit({ preventDefault() {} });
    const url = new URL(t.elements['email-confirmation-link'].href);
    assert.equal(url.pathname, 'aliganji@labxiii.org');
    assert.equal(url.searchParams.get('subject'), 'SRC enquiry — A & B');
    assert.match(url.searchParams.get('body'), /<img src=x onerror=alert\(1\)>/);
    assert.equal(t.storage.size, 0);
    assert.equal(t.elements['preorder-confirmation'].style.display, 'block');
    t.context.editEnquiry();
    assert.equal(t.elements['preorder-confirmation'].style.display, 'none');
    assert.equal(t.document.activeElement, t.elements['po-name']);
});
test('invalid enquiry cannot advance', () => {
    const t = enquirySetup({ invalid: true });
    t.context.handlePreorderSubmit({ preventDefault() {} });
    assert.equal(t.elements['email-confirmation-link'].href, undefined);
});
test('modal restores focus and overflow, preserves already inert elements, and wraps Tab', () => {
    const t = setup();
    const trigger = t.element('trigger');
    const modal = t.element('preorder-modal');
    const close = t.element('close');
    const last = t.element('last');
    const background = t.element('background');
    const alreadyInert = t.element('already-inert'); alreadyInert.inert = true;
    modal.querySelector = () => close;
    modal.querySelectorAll = () => [close, last];
    t.document.body.children = [background, alreadyInert, modal];
    trigger.focus();
    t.context.openPreorderModal({ preventDefault() {} });
    assert.equal(background.inert, true);
    assert.equal(t.document.activeElement, close);
    t.fire('keydown', { key: 'Tab', shiftKey: true, preventDefault() {} });
    assert.equal(t.document.activeElement, last);
    t.fire('keydown', { key: 'Tab', shiftKey: false, preventDefault() {} });
    assert.equal(t.document.activeElement, close);
    t.fire('keydown', { key: 'Escape', preventDefault() {} });
    assert.equal(t.document.activeElement, trigger);
    assert.equal(background.inert, false);
    assert.equal(alreadyInert.inert, true);
    assert.equal(t.document.body.style.overflow, 'auto');
});
