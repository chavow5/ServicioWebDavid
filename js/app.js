/**
 * Generador de Presupuestos Pro - David Ramirez
 * Adaptado al formato de Comprobante Tipo X y optimizado para impresión A4
 */

// Storage Keys
const STORAGE_KEYS = {
  ISSUER: 'budget_issuer_profile_v1',
  HISTORY: 'budget_history_quotes_v1',
  PIN: 'budget_security_pin_v1',
  CURRENT: 'budget_current_draft_v1',
  LAST_CLIENT: 'budget_last_client_v1'
};

// Default Issuer Profile (David Ramirez)
const DEFAULT_ISSUER = {
  trade: 'CHAVO',
  name: 'David Ramirez',
  subtitle: 'Web Developer',
  phone: '+54 9 3804 201334',
  dni: '43416310',
  web: 'https://davidramirezweb.vercel.app/',
  location: 'La Rioja, Argentina',
  city: 'La Rioja',
  alias: 'chavow5.bna',
  bank: 'Alias: chavow5.bna\nBanco: Banco Nacion Argentina',
  logo: 'assets/logo.png',
  invertLogo: true
};

// Default Quote Template matching reference
const DEFAULT_QUOTE = {
  id: 'quote_' + Date.now(),
  number: '00005-00001601',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
  currency: '$',
  paymentCond: '50% Anticipo - Saldo contra entrega',
  client: {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  },
  notes: 'Desarrollo de sitio web responsive y optimización general para comercio.',
  items: [
    {
      id: 1,
      description: 'MDO - DESARROLLO DE SITIO WEB RESPONSIVE (REACT + TAILWIND CSS) Y DEPLOY',
      quantity: 1,
      unitPrice: 207332,
      discount: 0
    }
  ],
  globalDiscount: 0,
  advancePct: 50,
  showAdvance: true,
  status: 'Pendiente'
};

// App State
let issuerState = { ...DEFAULT_ISSUER };
let quoteState = { ...DEFAULT_QUOTE };
let isHistoryUnlocked = false;

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSavedIssuer();
  loadSavedDraft();
  setupEventListeners();
  renderAll();
  updateHistoryBadge();
  switchMobileTab('editor');
  setTimeout(updatePreviewScale, 100);
});

// Load Issuer Profile from LocalStorage (Shared with Contratos)
function loadSavedIssuer() {
  const saved = localStorage.getItem(STORAGE_KEYS.ISSUER);
  if (saved) {
    try {
      issuerState = { ...DEFAULT_ISSUER, ...JSON.parse(saved) };
      if (issuerState.phone?.includes('0000-0000') || issuerState.phone === '5493804201' || !issuerState.phone) issuerState.phone = DEFAULT_ISSUER.phone;
      if (issuerState.dni === '20-38491820-4' || !issuerState.dni) issuerState.dni = DEFAULT_ISSUER.dni;
      if (issuerState.alias === 'david.dev.mp' || issuerState.alias === 'chavo651' || !issuerState.alias) issuerState.alias = DEFAULT_ISSUER.alias;
      if (issuerState.bank?.includes('Mercado Pago') || !issuerState.bank) issuerState.bank = DEFAULT_ISSUER.bank;
      if (issuerState.location?.includes('Buenos Aires') || issuerState.location?.includes('Capital') || !issuerState.location) issuerState.location = DEFAULT_ISSUER.location;
      if (issuerState.city?.includes('Buenos Aires') || issuerState.city?.includes('Capital') || !issuerState.city) issuerState.city = DEFAULT_ISSUER.city;
    } catch (e) {
      console.error('Error reading issuer storage:', e);
    }
  }
  
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  };

  setVal('input-issuer-trade', issuerState.trade);
  setVal('input-issuer-name', issuerState.name);
  setVal('input-issuer-subtitle', issuerState.subtitle);
  setVal('input-issuer-phone', issuerState.phone);
  setVal('input-issuer-web', issuerState.web);
  setVal('input-issuer-location', issuerState.location);
  setVal('input-issuer-bank', issuerState.bank);
  
  const checkInvert = document.getElementById('check-invert-logo');
  if (checkInvert) checkInvert.checked = !!issuerState.invertLogo;
}

// Load draft or default
function loadSavedDraft() {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT);
  if (saved) {
    try {
      quoteState = { ...DEFAULT_QUOTE, ...JSON.parse(saved) };
      if (quoteState.client?.name === 'Castillo, Daniel') {
        quoteState.client = { name: '', phone: '', email: '', address: '', city: '' };
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
  } else {
    quoteState = { ...DEFAULT_QUOTE };
  }
  
  const lastClient = localStorage.getItem(STORAGE_KEYS.LAST_CLIENT);
  if (lastClient && lastClient.includes('Castillo, Daniel')) {
    localStorage.removeItem(STORAGE_KEYS.LAST_CLIENT);
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  };

  setVal('input-quote-number', quoteState.number || '00005-00001601');
  setVal('input-quote-date', quoteState.date || new Date().toISOString().split('T')[0]);
  setVal('input-quote-due-date', quoteState.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  setVal('select-currency', quoteState.currency || '$');
  setVal('input-quote-payment-condition', quoteState.paymentCond || '50% Anticipo - Saldo contra entrega');
  
  setVal('input-client-name', quoteState.client?.name || '');
  setVal('input-client-phone', quoteState.client?.phone || '');
  setVal('input-client-email', quoteState.client?.email || '');
  setVal('input-client-address', quoteState.client?.address || '');
  setVal('input-client-city', quoteState.client?.city || '');
  setVal('input-quote-notes', quoteState.notes || '');

  setVal('input-global-discount', quoteState.globalDiscount || 0);
  setVal('input-advance-percentage', quoteState.advancePct || 50);

  const checkAdv = document.getElementById('check-show-advance');
  if (checkAdv) checkAdv.checked = quoteState.showAdvance !== false;
}

// -------------------------------------------------------------
// Formatters
// -------------------------------------------------------------
function formatCurrency(amount, symbol = '$') {
  const num = Number(amount) || 0;
  const parts = num.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1];
  return `${symbol} ${intPart},${decPart}`;
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
}

// -------------------------------------------------------------
// Rendering Functions
// -------------------------------------------------------------
function renderAll() {
  renderIssuerSection();
  renderQuoteHeader();
  renderClientSection();
  renderItemsTable();
  renderTotals();
  autoSaveDraft();
  updatePreviewScale();
}

function renderIssuerSection() {
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };

  setElText('view-issuer-trade', issuerState.trade);
  setElText('view-issuer-name', issuerState.name);
  setElText('view-issuer-subtitle', issuerState.subtitle);
  setElText('view-issuer-phone', 'TEL: ' + issuerState.phone);
  setElText('view-issuer-web', issuerState.web);
  setElText('view-issuer-location', (issuerState.location || '').toUpperCase());
  setElText('view-issuer-contact-name', issuerState.name);
  setElText('view-bank-details', issuerState.bank);

  // Logo Previews
  const logoEl = document.getElementById('view-issuer-logo');
  const logoPreview = document.getElementById('logo-img-preview');
  if (logoEl) logoEl.src = issuerState.logo;
  if (logoPreview) logoPreview.src = issuerState.logo;

  [logoEl, logoPreview].forEach(el => {
    if (!el) return;
    if (issuerState.invertLogo) {
      el.classList.add('filter-dark');
    } else {
      el.classList.remove('filter-dark');
    }
  });
}

function renderQuoteHeader() {
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };
  setElText('view-quote-number', `Nº ${quoteState.number}`);
  setElText('view-quote-date', formatDate(quoteState.date));
  setElText('view-quote-due-date', formatDate(quoteState.dueDate));
  setElText('view-payment-cond', quoteState.paymentCond);
}

function renderClientSection() {
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };
  setElText('view-client-name', quoteState.client.name ? quoteState.client.name.toUpperCase() : '');
  setElText('view-client-phone', quoteState.client.phone || '-');
  setElText('view-client-email', quoteState.client.email || '-');
  setElText('view-client-address', quoteState.client.address || '-');
  setElText('view-client-city', quoteState.client.city || '-');
  setElText('view-quote-notes', quoteState.notes || '-');
}

function renderItemsTable() {
  // 1. Render in Editor list
  const editorContainer = document.getElementById('items-editor-container');
  if (!editorContainer) return;
  editorContainer.innerHTML = '';

  quoteState.items.forEach((item, index) => {
    const rowSubtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 - (Number(item.discount) || 0) / 100);

    const div = document.createElement('div');
    div.className = 'p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative group hover:border-slate-300 transition';
    div.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ítem #${index + 1}</span>
        <button type="button" class="btn-delete-item text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition" data-index="${index}" title="Eliminar ítem">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
      <div>
        <input type="text" value="${escapeHtml(item.description)}" class="item-desc-input w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium" data-index="${index}" placeholder="Descripción del servicio o producto...">
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-end">
        <div class="col-span-1 sm:col-span-3">
          <label class="block text-[10px] font-medium text-slate-500 mb-0.5">Cant.</label>
          <input type="number" step="0.5" min="0" inputmode="decimal" value="${item.quantity}" class="item-qty-input w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg text-center" data-index="${index}">
        </div>
        <div class="col-span-1 sm:col-span-2">
          <label class="block text-[10px] font-medium text-slate-500 mb-0.5">% Desc</label>
          <input type="number" step="1" min="0" max="100" inputmode="numeric" value="${item.discount || 0}" class="item-disc-input w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg text-center" data-index="${index}">
        </div>
        <div class="col-span-1 sm:col-span-4">
          <label class="block text-[10px] font-medium text-slate-500 mb-0.5">Precio Uni.</label>
          <input type="number" step="100" min="0" inputmode="decimal" value="${item.unitPrice}" class="item-price-input w-full text-xs px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-right" data-index="${index}">
        </div>
        <div class="col-span-1 sm:col-span-3 text-right bg-slate-100/70 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
          <label class="block text-[10px] font-medium text-slate-500 mb-0.5">Subtotal</label>
          <span class="text-xs font-mono font-bold text-slate-800 leading-tight block truncate">${formatCurrency(rowSubtotal, quoteState.currency)}</span>
        </div>
      </div>
    `;
    editorContainer.appendChild(div);
  });

  // 2. Render in Printed Sheet Table
  const tbody = document.getElementById('view-items-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (quoteState.items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-4 text-center text-slate-400 italic">No hay ítems agregados al presupuesto.</td>
      </tr>
    `;
    return;
  }

  quoteState.items.forEach((item) => {
    const rowSubtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 - (Number(item.discount) || 0) / 100);
    const tr = document.createElement('tr');
    tr.className = 'border-b border-black text-[11px]';
    tr.innerHTML = `
      <td class="py-1 px-2.5 text-left border-r border-black font-medium leading-tight">${escapeHtml(item.description)}</td>
      <td class="py-1 px-2 text-center border-r border-black font-mono">${Number(item.quantity).toFixed(2).replace('.', ',')}</td>
      <td class="py-1 px-2.5 text-right border-r border-black font-mono">${formatCurrency(item.unitPrice, '').trim()}</td>
      <td class="py-1 px-2 text-center border-r border-black font-mono">${item.discount ? Number(item.discount).toFixed(2).replace('.', ',') : '0,00'}</td>
      <td class="py-1 px-2.5 text-right font-mono font-bold">${formatCurrency(rowSubtotal, '').trim()}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTotals() {
  const currency = quoteState.currency || '$';
  
  // Calculate Subtotal from items
  let subtotal = 0;
  quoteState.items.forEach(item => {
    subtotal += (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 - (Number(item.discount) || 0) / 100);
  });

  // Global Discount
  const discountPct = Number(quoteState.globalDiscount) || 0;
  const discountAmount = subtotal * (discountPct / 100);
  const total = Math.max(0, subtotal - discountAmount);

  // Advance / Seña
  const advancePct = Number(quoteState.advancePct) || 50;
  const advanceAmount = total * (advancePct / 100);
  const balanceAmount = total - advanceAmount;

  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };

  setElText('view-subtotal-val', formatCurrency(subtotal, currency));
  setElText('view-discount-val', formatCurrency(discountAmount, currency));
  setElText('view-total-val', formatCurrency(total, currency));

  // Update Mobile Sticky Bottom Bar Total
  const mobileBarTotal = document.getElementById('mobile-bar-total');
  if (mobileBarTotal) {
    mobileBarTotal.textContent = formatCurrency(total, currency);
  }

  // Advance Breakdown Box
  const advanceBox = document.getElementById('view-advance-box');
  if (advanceBox) {
    if (quoteState.showAdvance) {
      advanceBox.classList.remove('hidden');
      setElText('view-advance-pct', advancePct);
      setElText('view-advance-val', formatCurrency(advanceAmount, currency));
      setElText('view-balance-val', formatCurrency(balanceAmount, currency));
    } else {
      advanceBox.classList.add('hidden');
    }
  }

  updatePreviewScale();
}

// -------------------------------------------------------------
// Responsive Mobile Navigation & A4 Preview Scaling
// -------------------------------------------------------------
let previewZoomMode = 'fit'; // 'fit' | '100' | 'custom'
let previewZoomLevel = 1.0;
let currentMobileTab = 'editor'; // 'editor' | 'preview'

function switchMobileTab(tab) {
  currentMobileTab = tab;
  const tabEditor = document.getElementById('tab-btn-editor');
  const tabPreview = document.getElementById('tab-btn-preview');
  const panelEditor = document.getElementById('panel-editor');
  const panelPreview = document.getElementById('panel-preview');
  const mobileBottomBar = document.getElementById('mobile-bottom-bar');

  if (tab === 'editor') {
    if (tabEditor) {
      tabEditor.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 shadow-sm transition text-center flex items-center justify-center gap-1.5';
    }
    if (tabPreview) {
      tabPreview.className = 'flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-center flex items-center justify-center gap-1.5';
    }
    if (panelEditor) panelEditor.classList.remove('mobile-hidden');
    if (panelPreview) panelPreview.classList.add('mobile-hidden');
    if (mobileBottomBar) mobileBottomBar.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    if (tabPreview) {
      tabPreview.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200 shadow-sm transition text-center flex items-center justify-center gap-1.5';
    }
    if (tabEditor) {
      tabEditor.className = 'flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-center flex items-center justify-center gap-1.5';
    }
    if (panelEditor) panelEditor.classList.add('mobile-hidden');
    if (panelPreview) panelPreview.classList.remove('mobile-hidden');
    if (mobileBottomBar) mobileBottomBar.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(updatePreviewScale, 60);
  }
}

function updatePreviewScale() {
  const wrapper = document.getElementById('preview-wrapper');
  const scaler = document.getElementById('preview-scaler');
  const printArea = document.getElementById('print-area');
  const btnFit = document.getElementById('btn-zoom-fit');
  const btn100 = document.getElementById('btn-zoom-100');

  if (!wrapper || !scaler || !printArea) return;

  const sheetWidth = 794;
  const sheetHeight = printArea.offsetHeight || 1123;
  const availableWidth = wrapper.clientWidth - 16;

  if (previewZoomMode === 'fit') {
    const fitScale = Math.min(1.0, Math.max(0.25, availableWidth / sheetWidth));
    previewZoomLevel = fitScale;

    if (btnFit) {
      btnFit.className = 'px-2 py-1 rounded text-[11px] font-bold bg-sky-100 text-sky-700 transition';
    }
    if (btn100) {
      btn100.className = 'px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition';
    }
  } else if (previewZoomMode === '100') {
    previewZoomLevel = 1.0;
    if (btn100) {
      btn100.className = 'px-2 py-1 rounded text-[11px] font-bold bg-sky-100 text-sky-700 transition';
    }
    if (btnFit) {
      btnFit.className = 'px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition';
    }
  } else {
    if (btnFit) {
      btnFit.className = 'px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition';
    }
    if (btn100) {
      btn100.className = 'px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition';
    }
  }

  scaler.style.transform = `scale(${previewZoomLevel})`;

  const scaledHeight = Math.ceil(sheetHeight * previewZoomLevel);
  wrapper.style.height = `${scaledHeight + 20}px`;

  if (previewZoomLevel * sheetWidth > availableWidth + 8) {
    wrapper.classList.add('overflow-x-auto');
    scaler.style.transformOrigin = 'top left';
  } else {
    wrapper.classList.remove('overflow-x-auto');
    scaler.style.transformOrigin = 'top center';
  }
}

// -------------------------------------------------------------
// Event Listeners Setup
// -------------------------------------------------------------
function setupEventListeners() {
  // Mobile Tab Switching & View Toggles
  const tabEditor = document.getElementById('tab-btn-editor');
  const tabPreview = document.getElementById('tab-btn-preview');
  const btnBackToEditor = document.getElementById('btn-back-to-editor');
  const btnMobilePreviewShortcut = document.getElementById('btn-mobile-preview-shortcut');
  const btnMobileSaveShortcut = document.getElementById('btn-mobile-save-shortcut');
  const btnPrintMobileView = document.getElementById('btn-print-mobile-view');

  if (tabEditor) tabEditor.addEventListener('click', () => switchMobileTab('editor'));
  if (tabPreview) tabPreview.addEventListener('click', () => switchMobileTab('preview'));
  if (btnBackToEditor) btnBackToEditor.addEventListener('click', () => switchMobileTab('editor'));
  if (btnMobilePreviewShortcut) btnMobilePreviewShortcut.addEventListener('click', () => switchMobileTab('preview'));
  if (btnMobileSaveShortcut) btnMobileSaveShortcut.addEventListener('click', saveCurrentQuote);
  if (btnPrintMobileView) btnPrintMobileView.addEventListener('click', triggerPrint);

  // Preview Zoom & Scale Controls
  const btnZoomFit = document.getElementById('btn-zoom-fit');
  const btnZoom100 = document.getElementById('btn-zoom-100');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');

  if (btnZoomFit) {
    btnZoomFit.addEventListener('click', () => {
      previewZoomMode = 'fit';
      updatePreviewScale();
      showToast('Vista ajustada al ancho de pantalla', 'info');
    });
  }

  if (btnZoom100) {
    btnZoom100.addEventListener('click', () => {
      previewZoomMode = '100';
      updatePreviewScale();
      showToast('Zoom al 100% (tamaño real A4)', 'info');
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      previewZoomMode = 'custom';
      previewZoomLevel = Math.min(1.5, Math.round((previewZoomLevel + 0.1) * 10) / 10);
      updatePreviewScale();
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      previewZoomMode = 'custom';
      previewZoomLevel = Math.max(0.25, Math.round((previewZoomLevel - 0.1) * 10) / 10);
      updatePreviewScale();
    });
  }

  window.addEventListener('resize', () => {
    if (previewZoomMode === 'fit') updatePreviewScale();
  });

  const previewWrapper = document.getElementById('preview-wrapper');
  if (previewWrapper && window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      if (previewZoomMode === 'fit') updatePreviewScale();
    });
    resizeObserver.observe(previewWrapper);
  }

  // Toggle Issuer Section
  const toggleIssuer = document.getElementById('toggle-issuer-section');
  const issuerContent = document.getElementById('issuer-content');
  const issuerArrow = document.getElementById('issuer-arrow');
  if (toggleIssuer) {
    toggleIssuer.addEventListener('click', () => {
      issuerContent.classList.toggle('hidden');
      issuerArrow.classList.toggle('rotate-180');
    });
  }

  // Logo File Upload
  const logoInput = document.getElementById('input-logo-file');
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        issuerState.logo = event.target.result;
        renderIssuerSection();
        showToast('Logo cargado correctamente', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Logo Invert Checkbox
  const checkInvertLogo = document.getElementById('check-invert-logo');
  if (checkInvertLogo) {
    checkInvertLogo.addEventListener('change', (e) => {
      issuerState.invertLogo = e.target.checked;
      renderIssuerSection();
    });
  }

  // Issuer Inputs Live Update
  ['input-issuer-trade', 'input-issuer-name', 'input-issuer-subtitle', 'input-issuer-phone', 'input-issuer-web', 'input-issuer-location', 'input-issuer-bank'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      issuerState.trade = document.getElementById('input-issuer-trade')?.value || '';
      issuerState.name = document.getElementById('input-issuer-name')?.value || '';
      issuerState.subtitle = document.getElementById('input-issuer-subtitle')?.value || '';
      issuerState.phone = document.getElementById('input-issuer-phone')?.value || '';
      issuerState.web = document.getElementById('input-issuer-web')?.value || '';
      issuerState.location = document.getElementById('input-issuer-location')?.value || '';
      issuerState.bank = document.getElementById('input-issuer-bank')?.value || '';
      renderIssuerSection();
    });
  });

  // Save Default Issuer Button
  const btnSaveIssuer = document.getElementById('btn-save-issuer-defaults');
  if (btnSaveIssuer) {
    btnSaveIssuer.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEYS.ISSUER, JSON.stringify(issuerState));
      showToast('Tus datos fijos fueron guardados con éxito', 'success');
    });
  }

  // Currency
  const selCurrency = document.getElementById('select-currency');
  if (selCurrency) {
    selCurrency.addEventListener('change', (e) => {
      quoteState.currency = e.target.value;
      renderItemsTable();
      renderTotals();
    });
  }

  const quoteInputs = [
    { id: 'input-quote-number', key: 'number', fn: renderQuoteHeader },
    { id: 'input-quote-date', key: 'date', fn: renderQuoteHeader },
    { id: 'input-quote-due-date', key: 'dueDate', fn: renderQuoteHeader },
    { id: 'input-quote-payment-condition', key: 'paymentCond', fn: renderQuoteHeader },
    { id: 'input-quote-notes', key: 'notes', fn: renderClientSection }
  ];

  quoteInputs.forEach(({ id, key, fn }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        quoteState[key] = e.target.value;
        fn();
      });
    }
  });

  // Client Inputs
  ['input-client-name', 'input-client-phone', 'input-client-email', 'input-client-address', 'input-client-city'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      quoteState.client = {
        name: document.getElementById('input-client-name')?.value || '',
        phone: document.getElementById('input-client-phone')?.value || '',
        email: document.getElementById('input-client-email')?.value || '',
        address: document.getElementById('input-client-address')?.value || '',
        city: document.getElementById('input-client-city')?.value || ''
      };
      // Keep last client saved for cross-page sync with Contratos
      localStorage.setItem(STORAGE_KEYS.LAST_CLIENT, JSON.stringify(quoteState.client));
      renderClientSection();
    });
  });

  // Discount & Advance inputs
  const inputDiscount = document.getElementById('input-global-discount');
  if (inputDiscount) {
    inputDiscount.addEventListener('input', (e) => {
      quoteState.globalDiscount = Number(e.target.value) || 0;
      renderTotals();
    });
  }

  const inputAdvance = document.getElementById('input-advance-percentage');
  if (inputAdvance) {
    inputAdvance.addEventListener('input', (e) => {
      quoteState.advancePct = Number(e.target.value) || 50;
      renderTotals();
    });
  }

  const checkAdvance = document.getElementById('check-show-advance');
  if (checkAdvance) {
    checkAdvance.addEventListener('change', (e) => {
      quoteState.showAdvance = e.target.checked;
      renderTotals();
    });
  }

  // Add Item Button
  const btnAddItem = document.getElementById('btn-add-item');
  if (btnAddItem) {
    btnAddItem.addEventListener('click', () => {
      quoteState.items.push({
        id: Date.now(),
        description: 'Nuevo servicio / ítem',
        quantity: 1,
        unitPrice: 0,
        discount: 0
      });
      renderItemsTable();
      renderTotals();
    });
  }

  // Item Presets
  document.querySelectorAll('.btn-preset-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const desc = btn.dataset.desc;
      const price = Number(btn.dataset.price);
      quoteState.items.push({
        id: Date.now(),
        description: desc,
        quantity: 1,
        unitPrice: price,
        discount: 0
      });
      renderItemsTable();
      renderTotals();
      showToast(`Ítem "${desc}" agregado`, 'info');
    });
  });

  // Dynamic Item List Delegation
  const editorContainer = document.getElementById('items-editor-container');
  if (editorContainer) {
    editorContainer.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.index);
      if (isNaN(idx) || !quoteState.items[idx]) return;

      if (e.target.classList.contains('item-desc-input')) {
        quoteState.items[idx].description = e.target.value;
      } else if (e.target.classList.contains('item-qty-input')) {
        quoteState.items[idx].quantity = Number(e.target.value) || 0;
      } else if (e.target.classList.contains('item-price-input')) {
        quoteState.items[idx].unitPrice = Number(e.target.value) || 0;
      } else if (e.target.classList.contains('item-disc-input')) {
        quoteState.items[idx].discount = Number(e.target.value) || 0;
      }

      renderItemsTable();
      renderTotals();
    });

    editorContainer.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete-item');
      if (!deleteBtn) return;
      const idx = Number(deleteBtn.dataset.index);
      if (isNaN(idx)) return;
      
      quoteState.items.splice(idx, 1);
      renderItemsTable();
      renderTotals();
    });
  }

  // Header action buttons
  const btnPrintMain = document.getElementById('btn-print-main');
  const btnPrintSec = document.getElementById('btn-print-secondary');
  if (btnPrintMain) btnPrintMain.addEventListener('click', triggerPrint);
  if (btnPrintSec) btnPrintSec.addEventListener('click', triggerPrint);

  const btnNewQuote = document.getElementById('btn-new-quote');
  if (btnNewQuote) btnNewQuote.addEventListener('click', createNewQuote);

  const btnSaveQuote = document.getElementById('btn-save-quote');
  if (btnSaveQuote) btnSaveQuote.addEventListener('click', saveCurrentQuote);

  // History & PIN Modal
  setupHistoryModal();
}

// -------------------------------------------------------------
// Print Action
// -------------------------------------------------------------
function triggerPrint() {
  window.print();
}

// -------------------------------------------------------------
// New Quote Handler
// -------------------------------------------------------------
function createNewQuote() {
  if (confirm('¿Deseas iniciar un nuevo presupuesto? Se generará un nuevo número correlativo y se limpiará la lista de ítems.')) {
    const currentNum = quoteState.number || '00005-00001601';
    let nextNum = '00005-00001602';
    const match = currentNum.match(/^(\d{5})-(\d{8})$/);
    if (match) {
      const pos = match[1];
      const seq = (parseInt(match[2], 10) + 1).toString().padStart(8, '0');
      nextNum = `${pos}-${seq}`;
    }

    quoteState = {
      ...DEFAULT_QUOTE,
      id: 'quote_' + Date.now(),
      number: nextNum,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      client: {
        name: '',
        phone: '',
        email: '',
        address: '',
        city: ''
      },
      notes: '',
      items: [
        {
          id: Date.now(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0
        }
      ]
    };

    loadSavedDraft();
    renderAll();
    showToast('Nuevo presupuesto iniciado con Nº ' + nextNum, 'success');
  }
}

// -------------------------------------------------------------
// History & PIN Protection System
// -------------------------------------------------------------
function getSavedQuotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveQuotesList(list) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list));
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const list = getSavedQuotes();
  const badge = document.getElementById('badge-history-count');
  if (badge) badge.textContent = list.length;
}

function getStoredPin() {
  return localStorage.getItem(STORAGE_KEYS.PIN) || '1234';
}

function saveCurrentQuote() {
  const list = getSavedQuotes();
  const existingIdx = list.findIndex(q => q.id === quoteState.id || q.number === quoteState.number);

  const quoteRecord = {
    ...quoteState,
    savedAt: new Date().toISOString(),
    totalCalculated: calculateTotalNumber()
  };

  if (existingIdx >= 0) {
    list[existingIdx] = quoteRecord;
    showToast(`Presupuesto ${quoteState.number} actualizado`, 'success');
  } else {
    list.unshift(quoteRecord);
    showToast(`Presupuesto ${quoteState.number} guardado en el historial`, 'success');
  }

  saveQuotesList(list);
  if (isHistoryUnlocked) renderHistoryList();
}

function calculateTotalNumber() {
  let subtotal = 0;
  quoteState.items.forEach(item => {
    subtotal += (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (1 - (Number(item.discount) || 0) / 100);
  });
  const discountAmount = subtotal * ((Number(quoteState.globalDiscount) || 0) / 100);
  return Math.max(0, subtotal - discountAmount);
}

function setupHistoryModal() {
  const modal = document.getElementById('modal-history');
  const btnOpen = document.getElementById('btn-open-history');
  const btnClose = document.getElementById('btn-close-history-modal');
  const lockedView = document.getElementById('history-locked-view');
  const unlockedView = document.getElementById('history-unlocked-view');
  const inputPin = document.getElementById('input-pin-auth');
  const btnSubmitPin = document.getElementById('btn-submit-pin');
  const pinErrorMsg = document.getElementById('pin-error-msg');
  const btnLock = document.getElementById('btn-lock-history');
  const btnChangePin = document.getElementById('btn-change-pin');
  const searchInput = document.getElementById('input-search-history');

  if (!modal || !btnOpen || !btnClose) return;

  btnOpen.addEventListener('click', () => {
    modal.classList.remove('hidden');
    if (isHistoryUnlocked) {
      if (lockedView) lockedView.classList.add('hidden');
      if (unlockedView) unlockedView.classList.remove('hidden');
      renderHistoryList();
    } else {
      if (lockedView) lockedView.classList.remove('hidden');
      if (unlockedView) unlockedView.classList.add('hidden');
      if (inputPin) {
        inputPin.value = '';
        setTimeout(() => inputPin.focus(), 150);
      }
      if (pinErrorMsg) pinErrorMsg.classList.add('hidden');
    }
  });

  btnClose.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Unlock with PIN
  function tryUnlock() {
    if (!inputPin) return;
    const entered = inputPin.value.trim();
    const stored = getStoredPin();

    if (entered === stored) {
      isHistoryUnlocked = true;
      if (lockedView) lockedView.classList.add('hidden');
      if (unlockedView) unlockedView.classList.remove('hidden');
      if (pinErrorMsg) pinErrorMsg.classList.add('hidden');
      renderHistoryList();
      showToast('Acceso concedido al historial', 'success');
    } else {
      if (pinErrorMsg) pinErrorMsg.classList.remove('hidden');
      inputPin.value = '';
      inputPin.focus();
    }
  }

  if (btnSubmitPin) btnSubmitPin.addEventListener('click', tryUnlock);
  if (inputPin) {
    inputPin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') tryUnlock();
    });
  }

  // Lock button
  if (btnLock) {
    btnLock.addEventListener('click', () => {
      isHistoryUnlocked = false;
      if (lockedView) lockedView.classList.remove('hidden');
      if (unlockedView) unlockedView.classList.add('hidden');
      if (inputPin) inputPin.value = '';
      showToast('Historial bloqueado', 'info');
    });
  }

  // Change PIN
  if (btnChangePin) {
    btnChangePin.addEventListener('click', () => {
      const currentPin = prompt('Ingresa tu PIN actual:');
      if (currentPin !== getStoredPin()) {
        alert('PIN actual incorrecto.');
        return;
      }
      const newPin = prompt('Ingresa tu NUEVO PIN (4 a 6 dígitos):');
      if (!newPin || newPin.length < 4) {
        alert('El PIN debe tener al menos 4 caracteres.');
        return;
      }
      localStorage.setItem(STORAGE_KEYS.PIN, newPin);
      alert('¡PIN actualizado correctamente!');
      showToast('Nuevo PIN guardado', 'success');
    });
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderHistoryList(searchInput.value);
    });
  }
}

function renderHistoryList(filterQuery = '') {
  const container = document.getElementById('history-items-list');
  if (!container) return;

  const quotes = getSavedQuotes();
  container.innerHTML = '';

  const q = filterQuery.toLowerCase().trim();
  const filtered = quotes.filter(item => {
    const clientName = (item.client?.name || '').toLowerCase();
    const num = (item.number || '').toLowerCase();
    return !q || clientName.includes(q) || num.includes(q);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-slate-400">
        <p class="text-xs">No hay presupuestos guardados ${q ? 'que coincidan con la búsqueda' : 'aún'}.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(quote => {
    const div = document.createElement('div');
    div.className = 'w-full';

    let statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
    if (quote.status === 'Aprobado') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (quote.status === 'Cobrado') statusBadge = 'bg-blue-100 text-blue-800 border-blue-300';
    if (quote.status === 'Cancelado') statusBadge = 'bg-rose-100 text-rose-800 border-rose-300';

    div.innerHTML = `
      <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-slate-50 transition rounded-xl gap-2 border sm:border-0 border-slate-100 mb-1.5 sm:mb-0">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-700 border border-sky-200">PRESUPUESTO</span>
            <span class="font-mono font-bold text-xs text-slate-900">${quote.number}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusBadge}">${quote.status || 'Pendiente'}</span>
            <span class="text-[10px] text-slate-400 font-mono">${formatDate(quote.date)}</span>
          </div>
          <p class="text-xs font-semibold text-slate-700 truncate mt-0.5">${escapeHtml(quote.client?.name || 'Consumidor Final')}</p>
          <p class="text-[11px] font-bold text-slate-900 font-mono mt-0.5">
            ${formatCurrency(quote.totalCalculated || 0, quote.currency || '$')}
          </p>
        </div>
        <div class="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
          <select class="history-status-select text-[11px] border border-slate-300 rounded-lg px-2 py-1 bg-white font-medium" data-id="${quote.id}">
            <option value="Pendiente" ${quote.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="Aprobado" ${quote.status === 'Aprobado' ? 'selected' : ''}>Aprobado</option>
            <option value="Cobrado" ${quote.status === 'Cobrado' ? 'selected' : ''}>Cobrado</option>
            <option value="Cancelado" ${quote.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>

          <button type="button" class="btn-load-history px-3 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition" data-id="${quote.id}">
            Cargar
          </button>

          <button type="button" class="btn-delete-history p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50" data-id="${quote.id}" title="Eliminar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    `;

    container.appendChild(div);
  });

  // Attach history actions
  container.querySelectorAll('.btn-load-history').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.dataset.id;
      const quotes = getSavedQuotes();
      const target = quotes.find(q => q.id === qId);
      if (target) {
        quoteState = JSON.parse(JSON.stringify(target));
        loadSavedDraft();
        renderAll();
        document.getElementById('modal-history').classList.add('hidden');
        showToast(`Presupuesto ${target.number} cargado en el editor`, 'success');
      }
    });
  });

  container.querySelectorAll('.history-status-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const qId = sel.dataset.id;
      const quotes = getSavedQuotes();
      const target = quotes.find(q => q.id === qId);
      if (target) {
        target.status = e.target.value;
        saveQuotesList(quotes);
        renderHistoryList(document.getElementById('input-search-history')?.value || '');
        showToast('Estado actualizado a ' + target.status, 'info');
      }
    });
  });

  container.querySelectorAll('.btn-delete-history').forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = btn.dataset.id;
      if (confirm('¿Seguro que deseas eliminar este presupuesto del historial?')) {
        let quotes = getSavedQuotes();
        quotes = quotes.filter(q => q.id !== qId);
        saveQuotesList(quotes);
        renderHistoryList(document.getElementById('input-search-history')?.value || '');
        showToast('Presupuesto eliminado del historial', 'info');
      }
    });
  });
}

// -------------------------------------------------------------
// Autosave Draft
// -------------------------------------------------------------
function autoSaveDraft() {
  localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(quoteState));
}

// -------------------------------------------------------------
// Toast Notifications
// -------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');

  const bgStyles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-800 text-white'
  };

  toast.className = `px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 pointer-events-auto ${bgStyles[type] || bgStyles.info} animate-fade-in`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
