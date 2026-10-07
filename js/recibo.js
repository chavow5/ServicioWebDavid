/**
 * Recibos de Pago y Servicios Web - David Ramirez
 * Multi-page modular web application component
 */

// Storage keys (shared across modules)
const STORAGE_KEYS = {
  ISSUER: 'budget_issuer_profile_v1',
  PIN: 'budget_security_pin_v1',
  LAST_CLIENT: 'budget_last_client_v1',
  CURRENT_RECEIPT: 'receipt_current_draft_v1',
  RECEIPTS_HISTORY: 'receipts_history_v1'
};


// Default Issuer Profile
const DEFAULT_ISSUER = {
  trade: 'CHAVO',
  name: 'David Ramirez',
  subtitle: 'Web Developer',
  phone: '+54 9 3804 201334',
  location: 'La Rioja, Argentina',
  city: 'La Rioja',
  web: 'https://davidramirezweb.vercel.app/',
  dni: '43416310',
  alias: 'chavow5.bna',
  bank: 'Banco Nacion Argentina',
  logo: 'assets/logo.png',
  invertLogo: true
};

// Default Receipt Template
const DEFAULT_RECEIPT = {
  id: 'rec_' + Date.now(),
  number: 'REC-2026-001',
  date: new Date().toISOString().split('T')[0],
  currency: '$',
  concept: 'Abono Mensual de Mantenimiento y Hosting Web',
  conceptSub: 'Incluye actualización, hosting cloud, certificado SSL y soporte técnico.',
  period: 'Mes de Octubre 2026',
  monthsCount: 1,
  monthlyAmount: 45000,
  applyDiscount: false,
  discountVal: 0,
  discountReason: 'Bonificación especial',
  paymentMethod: 'Transferencia Bancaria',
  transactionRef: '',
  notes: 'Servicio de hosting y mantenimiento web al día sin deudas pendientes.',
  includeWords: true,
  includeStamp: true,
  includeSignatures: true,
  client: {
    name: '',
    dni: '',
    phone: '',
    email: '',
    city: ''
  },
  status: 'Cobrado'
};

// Quick Service Presets
const RECEIPT_PRESETS = {
  'mantenimiento': {
    concept: 'Abono Mensual de Mantenimiento y Hosting Web',
    conceptSub: 'Incluye actualización, hosting cloud, certificado SSL y soporte técnico.',
    period: 'Mes en curso',
    monthsCount: 1,
    monthlyAmount: 45000,
    currency: '$',
    applyDiscount: false,
    discountVal: 0
  },
  'trimestre': {
    concept: 'Abono Trimestral de Mantenimiento y Servidores (3 Meses)',
    conceptSub: 'Pago anticipado de trimestre completo con bonificación especial.',
    period: 'Próximos 3 meses',
    monthsCount: 3,
    monthlyAmount: 45000,
    currency: '$',
    applyDiscount: true,
    discountVal: 15000,
    discountReason: 'Bonificación por pago trimestral anticipado'
  },
  'hosting': {
    concept: 'Hosting Cloud Administrado y Certificado SSL Anual',
    conceptSub: 'Infraestructura de alta disponibilidad y renovación de certificados.',
    period: 'Servicio Anual',
    monthsCount: 1,
    monthlyAmount: 30000,
    currency: '$',
    applyDiscount: false,
    discountVal: 0
  },
  'desarrollo': {
    concept: 'Desarrollo y Publicación de Sitio Web Comercial',
    conceptSub: 'Desarrollo web a medida, responsive, optimización SEO y puesta en producción.',
    period: 'Pago Único',
    monthsCount: 1,
    monthlyAmount: 250000,
    currency: '$',
    applyDiscount: false,
    discountVal: 0
  }
};

// App State
let issuerState = { ...DEFAULT_ISSUER };
let receiptState = { ...DEFAULT_RECEIPT };
let isHistoryUnlocked = false;

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSavedIssuer();
  loadSavedReceipt();
  setupEventListeners();
  renderReceipt();
  updateHistoryBadge();
  switchMobileTab('editor');
  setTimeout(updatePreviewScale, 100);
});

// Load Issuer Profile (Shared with Presupuestos & Contratos)
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
  setVal('input-dev-dni', issuerState.dni || '43416310');
  setVal('input-issuer-phone', issuerState.phone);
  setVal('input-dev-city', issuerState.city || 'La Rioja, Argentina');
  setVal('input-dev-alias', issuerState.alias || 'chavow5.bna');
  setVal('input-issuer-web', issuerState.web);

  const checkInvert = document.getElementById('check-invert-logo');
  if (checkInvert) checkInvert.checked = !!issuerState.invertLogo;
}

// Load Current Receipt Draft
function loadSavedReceipt() {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_RECEIPT);
  if (saved) {
    try {
      receiptState = { ...DEFAULT_RECEIPT, ...JSON.parse(saved) };
      if (receiptState.client?.name === 'Castillo, Daniel') {
        receiptState.client = { name: '', dni: '', phone: '', email: '', city: '' };
      }
      if (receiptState.alias === 'chavo651' || receiptState.alias === 'david.dev.mp') {
        receiptState.alias = DEFAULT_RECEIPT.alias;
      }
    } catch (e) {
      console.error('Error loading receipt draft:', e);
    }
  } else {
    // If there's an active client from other modules, prefill it only if not dummy
    const lastClient = localStorage.getItem(STORAGE_KEYS.LAST_CLIENT);
    if (lastClient) {
      try {
        const clientObj = JSON.parse(lastClient);
        if (clientObj.name !== 'Castillo, Daniel') {
          receiptState.client = { ...receiptState.client, ...clientObj };
        }
      } catch (e) {}
    }
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? val : '';
  };

  const setChecked = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };

  // Populate client inputs
  setVal('input-client-name', receiptState.client?.name || '');
  setVal('input-client-dni', receiptState.client?.dni || '');
  setVal('input-client-phone', receiptState.client?.phone || '');
  setVal('input-client-email', receiptState.client?.email || '');
  setVal('input-client-city', receiptState.client?.city || '');

  // Populate receipt inputs
  setVal('input-receipt-number', receiptState.number || 'REC-2026-001');
  setVal('input-receipt-date', receiptState.date || new Date().toISOString().split('T')[0]);
  setVal('input-service-concept', receiptState.concept || '');
  setVal('input-period-description', receiptState.period || '');
  setVal('input-months-count', receiptState.monthsCount || 1);
  setVal('select-receipt-currency', receiptState.currency || '$');
  setVal('input-monthly-amount', receiptState.monthlyAmount || 45000);

  // Discount (Monto directo)
  setChecked('check-apply-discount', !!receiptState.applyDiscount);
  setVal('input-discount-val', receiptState.discountVal || 0);
  setVal('input-discount-reason', receiptState.discountReason || '');
  updateDiscountCurrencySymbol();

  // Payment method
  setVal('select-payment-method', receiptState.paymentMethod || 'Transferencia Bancaria');
  setVal('input-transaction-ref', receiptState.transactionRef || '');
  setVal('input-receipt-notes', receiptState.notes || '');

  // Formatting options
  setChecked('check-include-words-total', receiptState.includeWords !== false);
  setChecked('check-include-paid-stamp', receiptState.includeStamp !== false);
  setChecked('check-include-signatures', receiptState.includeSignatures !== false);

  // Toggle discount box visibility in editor
  const boxDiscount = document.getElementById('box-discount-inputs');
  if (boxDiscount) {
    if (receiptState.applyDiscount) {
      boxDiscount.classList.remove('hidden');
    } else {
      boxDiscount.classList.add('hidden');
    }
  }
}

function updateDiscountCurrencySymbol() {
  const symEl = document.getElementById('symbol-discount-currency');
  if (symEl) symEl.textContent = receiptState.currency || '$';
}

// -------------------------------------------------------------
// Formatters & Number to Words Converter (Spanish)
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

// Convert numbers to text in Spanish
function numeroALetras(amount, currency = '$') {
  const enteros = Math.floor(Math.abs(Number(amount) || 0));
  const decimales = Math.round((Math.abs(Number(amount) || 0) - enteros) * 100);
  const decStr = decimales < 10 ? '0' + decimales : '' + decimales;

  let unitName = 'pesos';
  if (currency.includes('USD')) unitName = 'dólares';
  else if (currency.includes('€')) unitName = 'euros';

  if (enteros === 0) return `Cero ${unitName} con ${decStr}/100`;

  function Unidades(num) {
    switch (num) {
      case 1: return 'un';
      case 2: return 'dos';
      case 3: return 'tres';
      case 4: return 'cuatro';
      case 5: return 'cinco';
      case 6: return 'seis';
      case 7: return 'siete';
      case 8: return 'ocho';
      case 9: return 'nueve';
    }
    return '';
  }

  function DecenasY(strSin, numUnidades) {
    if (numUnidades > 0) return strSin + ' y ' + Unidades(numUnidades);
    return strSin;
  }

  function Decenas(num) {
    const decena = Math.floor(num / 10);
    const unidad = num - (decena * 10);
    switch (decena) {
      case 1:
        switch (unidad) {
          case 0: return 'diez';
          case 1: return 'once';
          case 2: return 'doce';
          case 3: return 'trece';
          case 4: return 'catorce';
          case 5: return 'quince';
          default: return 'dieci' + Unidades(unidad);
        }
      case 2:
        switch (unidad) {
          case 0: return 'veinte';
          default: return 'veinti' + Unidades(unidad);
        }
      case 3: return DecenasY('treinta', unidad);
      case 4: return DecenasY('cuarenta', unidad);
      case 5: return DecenasY('cincuenta', unidad);
      case 6: return DecenasY('sesenta', unidad);
      case 7: return DecenasY('setenta', unidad);
      case 8: return DecenasY('ochenta', unidad);
      case 9: return DecenasY('noventa', unidad);
      case 0: return Unidades(unidad);
    }
    return '';
  }

  function Centenas(num) {
    const centenas = Math.floor(num / 100);
    const decenas = num - (centenas * 100);
    switch (centenas) {
      case 1:
        if (decenas > 0) return 'ciento ' + Decenas(decenas);
        return 'cien';
      case 2: return 'doscientos ' + Decenas(decenas);
      case 3: return 'trescientos ' + Decenas(decenas);
      case 4: return 'cuatrocientos ' + Decenas(decenas);
      case 5: return 'quinientos ' + Decenas(decenas);
      case 6: return 'seiscientos ' + Decenas(decenas);
      case 7: return 'setecientos ' + Decenas(decenas);
      case 8: return 'ochocientos ' + Decenas(decenas);
      case 9: return 'novecientos ' + Decenas(decenas);
    }
    return Decenas(decenas);
  }

  function Seccion(num, divisor, strSingular, strPlural) {
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    let letras = '';
    if (cientos > 0) {
      if (cientos > 1) letras = Centenas(cientos) + ' ' + strPlural;
      else letras = strSingular;
    }
    if (resto > 0) letras += '';
    return { letras, resto };
  }

  function Miles(num) {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    let strMiles = Seccion(num, divisor, 'un mil', 'mil');
    let strCentenas = Centenas(resto);
    if (strMiles.letras === '') return strCentenas;
    return (strMiles.letras + ' ' + strCentenas).trim();
  }

  function Millones(num) {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    let strMillones = Seccion(num, divisor, 'un millón', 'millones');
    let strMiles = Miles(resto);
    if (strMillones.letras === '') return strMiles;
    return (strMillones.letras + ' ' + strMiles).trim();
  }

  let resultado = Millones(enteros);
  resultado = resultado.charAt(0).toUpperCase() + resultado.slice(1);
  return `${resultado} ${unitName} con ${decStr}/100`;
}

// -------------------------------------------------------------
// Rendering Live Preview
// -------------------------------------------------------------
function renderReceipt() {
  const currency = receiptState.currency || '$';
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text !== undefined && text !== null ? text : '';
  };

  // Header Box
  setElText('receipt-view-issuer-trade', issuerState.trade);
  setElText('receipt-view-issuer-name', issuerState.name);
  setElText('receipt-view-issuer-location', (issuerState.location || '').toUpperCase());
  setElText('receipt-view-issuer-phone', 'TEL: ' + (issuerState.phone || '-'));
  setElText('receipt-view-issuer-dni', 'CUIT/DNI: ' + (issuerState.dni || '-'));
  setElText('receipt-view-issuer-web', issuerState.web || '');

  // Logo Preview
  const logoEl = document.getElementById('receipt-view-issuer-logo');
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

  // Receipt Number & Date
  setElText('receipt-view-number', receiptState.number || 'REC-2026-001');
  setElText('receipt-view-date', formatDate(receiptState.date));

  // Stamp Badge
  const stampEl = document.getElementById('receipt-view-stamp');
  if (stampEl) {
    if (receiptState.includeStamp) {
      stampEl.classList.remove('hidden');
    } else {
      stampEl.classList.add('hidden');
    }
  }

  // Client Information
  const clientName = receiptState.client?.name ? receiptState.client.name.toUpperCase() : '______________________';
  const clientDni = receiptState.client?.dni || '-';
  const clientCity = receiptState.client?.city || '-';
  const clientPhone = receiptState.client?.phone || '-';
  const clientEmail = receiptState.client?.email || '-';

  setElText('receipt-view-client-name', clientName);
  setElText('receipt-view-client-dni', clientDni);
  setElText('receipt-view-client-city', clientCity);
  setElText('receipt-view-client-phone', clientPhone);
  setElText('receipt-view-client-email', clientEmail);

  // Concept & Quantities
  const concept = receiptState.concept || 'Abono Mensual de Mantenimiento Web';
  const period = receiptState.period || 'Mes en curso';
  const monthsCount = Math.max(1, parseInt(receiptState.monthsCount, 10) || 1);
  const monthlyAmount = Number(receiptState.monthlyAmount) || 0;
  const subtotal = monthsCount * monthlyAmount;

  setElText('receipt-view-concept', concept);
  setElText('receipt-view-concept-sub', receiptState.conceptSub || 'Pago de servicios web profesionales.');
  setElText('receipt-view-period', period);
  setElText('receipt-view-months', `${monthsCount} ${monthsCount === 1 ? 'mes' : 'meses'}`);
  setElText('receipt-view-unit-price', formatCurrency(monthlyAmount, currency));
  setElText('receipt-view-row-subtotal', formatCurrency(subtotal, currency));
  setElText('field-subtotal-display', formatCurrency(subtotal, currency));
  setElText('receipt-view-total-months', `${monthsCount} ${monthsCount === 1 ? 'mes' : 'meses'}`);
  setElText('receipt-view-subtotal', formatCurrency(subtotal, currency));

  // ---------------------------------------------------------
  // DISCOUNT CALCULATION & VISIBILITY RULE (DIRECT MONETARY AMOUNT)
  // "y descuento que sea visible o no si en ese caso es 0 que no se vea"
  // "quiero que si aplico el desceutno sea en monto por ejemplo de tanta plata, si sale 110 que se descuenta 10 usd"
  // ---------------------------------------------------------
  updateDiscountCurrencySymbol();

  let discountAmount = 0;
  const rawDiscountVal = Number(receiptState.discountVal) || 0;

  if (receiptState.applyDiscount && rawDiscountVal > 0) {
    // Direct monetary amount subtracted from subtotal (e.g. 110 - 10 = 100)
    discountAmount = Math.min(subtotal, Math.max(0, rawDiscountVal));
  }

  const discountRow = document.getElementById('receipt-view-discount-row');
  const discountBadge = document.getElementById('receipt-view-discount-badge');
  const discountAmountEl = document.getElementById('receipt-view-discount-amount');

  if (discountRow) {
    // If discount is 0 or disabled, hide completely from the receipt
    if (discountAmount > 0 && receiptState.applyDiscount) {
      discountRow.classList.remove('hidden');
      discountRow.style.display = 'flex';
      if (discountBadge) {
        discountBadge.textContent = receiptState.discountReason
          ? `(${receiptState.discountReason})`
          : '';
      }
      if (discountAmountEl) {
        discountAmountEl.textContent = `- ${formatCurrency(discountAmount, currency)}`;
      }
    } else {
      discountRow.classList.add('hidden');
      discountRow.style.display = 'none';
    }
  }

  // Final Total Paid
  const totalPaid = Math.max(0, subtotal - discountAmount);
  setElText('receipt-view-total', formatCurrency(totalPaid, currency));

  // Words Total ("Son: ...")
  const wordsBox = document.getElementById('receipt-view-words-box');
  if (wordsBox) {
    if (receiptState.includeWords) {
      wordsBox.classList.remove('hidden');
      setElText('receipt-view-words', numeroALetras(totalPaid, currency));
    } else {
      wordsBox.classList.add('hidden');
    }
  }

  // Payment Method & Alias
  setElText('receipt-view-payment-method', receiptState.paymentMethod || 'Transferencia Bancaria');
  setElText('receipt-view-transaction-ref', receiptState.transactionRef || '-');
  
  const aliasVal = issuerState.alias || 'chavow5.bna';
  const bankVal = issuerState.bank || 'Banco Nacion Argentina';
  setElText('receipt-view-alias', aliasVal);
  setElText('receipt-view-bank', bankVal);

  const aliasBox = document.getElementById('receipt-view-alias-box');
  if (aliasBox) {
    if (receiptState.paymentMethod?.toLowerCase().includes('efectivo')) {
      aliasBox.classList.add('hidden');
    } else {
      aliasBox.classList.remove('hidden');
    }
  }

  // Notes Box
  const notesBox = document.getElementById('receipt-view-notes-box');
  const notesText = document.getElementById('receipt-view-notes');
  if (notesBox && notesText) {
    if (receiptState.notes && receiptState.notes.trim()) {
      notesBox.classList.remove('hidden');
      notesText.textContent = receiptState.notes;
    } else {
      notesBox.classList.add('hidden');
    }
  }

  // Signatures Box (Solo Emisor)
  const sigBox = document.getElementById('receipt-view-signatures-box');
  if (sigBox) {
    if (receiptState.includeSignatures) {
      sigBox.classList.remove('hidden');
      setElText('receipt-view-sig-dev-name', (issuerState.name || 'DAVID RAMIREZ').toUpperCase());
      setElText('receipt-view-sig-dev-dni', issuerState.dni || '43416310');
    } else {
      sigBox.classList.add('hidden');
    }
  }

  // Update mobile bottom bar total
  const mobileBarTotal = document.getElementById('mobile-bar-total');
  if (mobileBarTotal) {
    mobileBarTotal.textContent = formatCurrency(totalPaid, currency);
  }

  autoSaveDraft();
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
      tabEditor.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm transition text-center flex items-center justify-center gap-1.5';
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
      tabPreview.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm transition text-center flex items-center justify-center gap-1.5';
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
      btnFit.className = 'px-2 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 transition';
    }
    if (btn100) {
      btn100.className = 'px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition';
    }
  } else if (previewZoomMode === '100') {
    previewZoomLevel = 1.0;
    if (btn100) {
      btn100.className = 'px-2 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 transition';
    }
    if (btnFit) {
      btnFit.className = 'px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition';
    }
  }

  scaler.style.transform = `scale(${previewZoomLevel})`;

  const scaledHeight = sheetHeight * previewZoomLevel;
  scaler.style.height = `${scaledHeight}px`;

  if (previewZoomLevel < 1.0) {
    const scaledWidth = sheetWidth * previewZoomLevel;
    scaler.style.width = `${scaledWidth}px`;
    wrapper.classList.remove('overflow-x-auto');
    scaler.style.transformOrigin = 'top center';
  } else if (previewZoomLevel > 1.0) {
    const scaledWidth = sheetWidth * previewZoomLevel;
    scaler.style.width = `${scaledWidth}px`;
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
  // Mobile Tab Switching
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
  if (btnMobileSaveShortcut) btnMobileSaveShortcut.addEventListener('click', saveCurrentReceipt);
  if (btnPrintMobileView) btnPrintMobileView.addEventListener('click', triggerPrint);

  // Zoom & Scale Controls
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

  // Toggle Issuer Section
  const toggleIssuer = document.getElementById('toggle-issuer-section');
  const issuerContent = document.getElementById('issuer-content');
  const issuerArrow = document.getElementById('issuer-arrow');
  if (toggleIssuer && issuerContent) {
    toggleIssuer.addEventListener('click', () => {
      issuerContent.classList.toggle('hidden');
      if (issuerArrow) {
        issuerArrow.classList.toggle('rotate-180');
      }
    });
  }

  // Logo file upload
  const inputLogo = document.getElementById('input-logo-file');
  if (inputLogo) {
    inputLogo.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          issuerState.logo = evt.target.result;
          renderReceipt();
          showToast('Logo cargado correctamente', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Checkbox Invert Logo
  const checkInvert = document.getElementById('check-invert-logo');
  if (checkInvert) {
    checkInvert.addEventListener('change', (e) => {
      issuerState.invertLogo = e.target.checked;
      renderReceipt();
    });
  }

  // Issuer Inputs Live Update
  ['input-issuer-trade', 'input-issuer-name', 'input-dev-dni', 'input-issuer-phone', 'input-dev-city', 'input-dev-alias', 'input-issuer-web'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      issuerState.trade = document.getElementById('input-issuer-trade')?.value || '';
      issuerState.name = document.getElementById('input-issuer-name')?.value || '';
      issuerState.dni = document.getElementById('input-dev-dni')?.value || '';
      issuerState.phone = document.getElementById('input-issuer-phone')?.value || '';
      issuerState.city = document.getElementById('input-dev-city')?.value || '';
      issuerState.alias = document.getElementById('input-dev-alias')?.value || '';
      issuerState.web = document.getElementById('input-issuer-web')?.value || '';
      renderReceipt();
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
  const selCurrency = document.getElementById('select-receipt-currency');
  if (selCurrency) {
    selCurrency.addEventListener('change', (e) => {
      receiptState.currency = e.target.value;
      renderReceipt();
    });
  }

  // Client Inputs
  ['input-client-name', 'input-client-dni', 'input-client-phone', 'input-client-email', 'input-client-city'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const key = id.replace('input-client-', '');
      receiptState.client[key] = el.value;
      localStorage.setItem(STORAGE_KEYS.LAST_CLIENT, JSON.stringify(receiptState.client));
      renderReceipt();
    });
  });

  // Receipt Service Inputs
  const receiptInputs = [
    { id: 'input-receipt-number', key: 'number' },
    { id: 'input-receipt-date', key: 'date' },
    { id: 'input-service-concept', key: 'concept' },
    { id: 'input-period-description', key: 'period' },
    { id: 'input-months-count', key: 'monthsCount', isNum: true },
    { id: 'input-monthly-amount', key: 'monthlyAmount', isNum: true },
    { id: 'input-discount-val', key: 'discountVal', isNum: true },
    { id: 'input-discount-reason', key: 'discountReason' },
    { id: 'input-transaction-ref', key: 'transactionRef' },
    { id: 'input-receipt-notes', key: 'notes' }
  ];

  receiptInputs.forEach(({ id, key, isNum }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        receiptState[key] = isNum ? (Number(el.value) || 0) : el.value;
        renderReceipt();
      });
    }
  });

  // Payment Method Select
  const selPayMethod = document.getElementById('select-payment-method');
  if (selPayMethod) {
    selPayMethod.addEventListener('change', (e) => {
      receiptState.paymentMethod = e.target.value;
      renderReceipt();
    });
  }

  // Discount Toggle
  const checkDiscount = document.getElementById('check-apply-discount');
  const boxDiscount = document.getElementById('box-discount-inputs');

  if (checkDiscount) {
    checkDiscount.addEventListener('change', (e) => {
      receiptState.applyDiscount = e.target.checked;
      if (boxDiscount) {
        if (e.target.checked) boxDiscount.classList.remove('hidden');
        else boxDiscount.classList.add('hidden');
      }
      renderReceipt();
      autoSaveDraft();
    });
  }

  // Formatting Options Checkboxes
  const checkWords = document.getElementById('check-include-words-total');
  if (checkWords) {
    checkWords.addEventListener('change', (e) => {
      receiptState.includeWords = e.target.checked;
      renderReceipt();
    });
  }

  const checkStamp = document.getElementById('check-include-paid-stamp');
  if (checkStamp) {
    checkStamp.addEventListener('change', (e) => {
      receiptState.includeStamp = e.target.checked;
      renderReceipt();
    });
  }

  const checkSig = document.getElementById('check-include-signatures');
  if (checkSig) {
    checkSig.addEventListener('change', (e) => {
      receiptState.includeSignatures = e.target.checked;
      renderReceipt();
    });
  }

  // Presets
  document.querySelectorAll('.btn-preset-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const preset = RECEIPT_PRESETS[presetKey];
      if (!preset) return;

      receiptState.concept = preset.concept;
      receiptState.conceptSub = preset.conceptSub;
      receiptState.period = preset.period;
      receiptState.monthsCount = preset.monthsCount;
      receiptState.monthlyAmount = preset.monthlyAmount;
      receiptState.currency = preset.currency;
      receiptState.applyDiscount = !!preset.applyDiscount;
      receiptState.discountVal = preset.discountVal || 0;
      if (preset.discountReason) receiptState.discountReason = preset.discountReason;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };

      setVal('input-service-concept', receiptState.concept);
      setVal('input-period-description', receiptState.period);
      setVal('input-months-count', receiptState.monthsCount);
      setVal('input-monthly-amount', receiptState.monthlyAmount);
      setVal('select-receipt-currency', receiptState.currency);

      if (checkDiscount) checkDiscount.checked = receiptState.applyDiscount;
      if (boxDiscount) {
        if (receiptState.applyDiscount) boxDiscount.classList.remove('hidden');
        else boxDiscount.classList.add('hidden');
      }
      setVal('input-discount-val', receiptState.discountVal);
      if (preset.discountReason) setVal('input-discount-reason', preset.discountReason);

      updateDiscountCurrencySymbol();
      renderReceipt();
      showToast(`Plantilla "${btn.textContent.trim()}" aplicada`, 'info');
    });
  });

  // Top Buttons
  const btnNew = document.getElementById('btn-new-receipt');
  if (btnNew) btnNew.addEventListener('click', createNewReceipt);

  const btnSave = document.getElementById('btn-save-receipt');
  if (btnSave) btnSave.addEventListener('click', saveCurrentReceipt);

  const btnPrint = document.getElementById('btn-print');
  if (btnPrint) btnPrint.addEventListener('click', triggerPrint);

  const btnPrintSec = document.getElementById('btn-print-secondary');
  if (btnPrintSec) btnPrintSec.addEventListener('click', triggerPrint);

  // History Modal
  const btnOpenHistory = document.getElementById('btn-open-history');
  if (btnOpenHistory) btnOpenHistory.addEventListener('click', openHistoryModal);

  const btnCloseHistory = document.getElementById('btn-close-history');
  if (btnCloseHistory) btnCloseHistory.addEventListener('click', closeHistoryModal);

  const btnUnlock = document.getElementById('btn-unlock-history');
  if (btnUnlock) btnUnlock.addEventListener('click', unlockHistoryWithPin);

  const inputPin = document.getElementById('input-security-pin');
  if (inputPin) {
    inputPin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') unlockHistoryWithPin();
    });
  }

  const btnClearHistory = document.getElementById('btn-clear-history');
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      if (confirm('¿Seguro que deseás vaciar todo el historial de recibos? Esta acción no se puede deshacer.')) {
        localStorage.removeItem(STORAGE_KEYS.RECEIPTS_HISTORY);
        renderHistoryList();
        updateHistoryBadge();
        showToast('Historial de recibos vaciado', 'info');
      }
    });
  }
}

// -------------------------------------------------------------
// Actions & History Management
// -------------------------------------------------------------
function autoSaveDraft() {
  localStorage.setItem(STORAGE_KEYS.CURRENT_RECEIPT, JSON.stringify(receiptState));
}

function createNewReceipt() {
  if (confirm('¿Deseás crear un nuevo recibo en blanco? Se generará un nuevo número correlativo.')) {
    const nextNum = getNextReceiptNumber();
    receiptState = {
      ...DEFAULT_RECEIPT,
      id: 'rec_' + Date.now(),
      number: nextNum,
      date: new Date().toISOString().split('T')[0],
      client: { ...receiptState.client }
    };
    loadSavedReceipt();
    renderReceipt();
    showToast(`Nuevo recibo ${nextNum} iniciado`, 'success');
  }
}

function getNextReceiptNumber() {
  const history = getSavedReceipts();
  if (history.length === 0) return 'REC-2026-001';
  const highest = history.reduce((max, item) => {
    const match = (item.number || '').match(/REC-\d+-(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      return n > max ? n : max;
    }
    return max;
  }, 1);
  const next = highest + 1;
  const year = new Date().getFullYear();
  return `REC-${year}-${String(next).padStart(3, '0')}`;
}

function getSavedReceipts() {
  const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS_HISTORY);
  if (!data) return [];
  try {
    return JSON.parse(data) || [];
  } catch (e) {
    return [];
  }
}

function saveCurrentReceipt() {
  const history = getSavedReceipts();
  const existingIdx = history.findIndex(r => r.id === receiptState.id || r.number === receiptState.number);

  const toSave = {
    ...receiptState,
    savedAt: new Date().toISOString(),
    totalCalculated: calculateTotal(receiptState)
  };

  if (existingIdx >= 0) {
    history[existingIdx] = toSave;
    showToast(`Recibo ${receiptState.number} actualizado en el historial`, 'success');
  } else {
    history.unshift(toSave);
    showToast(`Recibo ${receiptState.number} guardado en el historial`, 'success');
  }

  localStorage.setItem(STORAGE_KEYS.RECEIPTS_HISTORY, JSON.stringify(history));
  updateHistoryBadge();
  if (isHistoryUnlocked) renderHistoryList();
}

function calculateTotal(state) {
  const months = Math.max(1, parseInt(state.monthsCount, 10) || 1);
  const subtotal = months * (Number(state.monthlyAmount) || 0);
  let discount = 0;
  if (state.applyDiscount && Number(state.discountVal) > 0) {
    discount = Math.min(subtotal, Math.max(0, Number(state.discountVal) || 0));
  }
  return Math.max(0, subtotal - discount);
}

function updateHistoryBadge() {
  const history = getSavedReceipts();
  const badge = document.getElementById('history-badge');
  if (badge) {
    badge.textContent = history.length;
  }
}

function openHistoryModal() {
  const modal = document.getElementById('modal-history');
  if (!modal) return;
  modal.classList.remove('hidden');

  const pinContainer = document.getElementById('history-pin-container');
  const listContainer = document.getElementById('history-list-container');
  const pinInput = document.getElementById('input-security-pin');

  if (isHistoryUnlocked) {
    if (pinContainer) pinContainer.classList.add('hidden');
    if (listContainer) listContainer.classList.remove('hidden');
    renderHistoryList();
  } else {
    if (pinContainer) pinContainer.classList.remove('hidden');
    if (listContainer) listContainer.classList.add('hidden');
    if (pinInput) {
      pinInput.value = '';
      setTimeout(() => pinInput.focus(), 100);
    }
  }
}

function closeHistoryModal() {
  const modal = document.getElementById('modal-history');
  if (modal) modal.classList.add('hidden');
}

function unlockHistoryWithPin() {
  const pinInput = document.getElementById('input-security-pin');
  const errorMsg = document.getElementById('pin-error-msg');
  const savedPin = localStorage.getItem(STORAGE_KEYS.PIN) || '1234';

  if (pinInput && pinInput.value.trim() === savedPin) {
    isHistoryUnlocked = true;
    if (errorMsg) errorMsg.classList.add('hidden');
    const pinContainer = document.getElementById('history-pin-container');
    const listContainer = document.getElementById('history-list-container');
    if (pinContainer) pinContainer.classList.add('hidden');
    if (listContainer) listContainer.classList.remove('hidden');
    renderHistoryList();
    showToast('Historial desbloqueado correctamente', 'success');
  } else {
    if (errorMsg) errorMsg.classList.remove('hidden');
    if (pinInput) {
      pinInput.value = '';
      pinInput.focus();
    }
  }
}

function renderHistoryList() {
  const history = getSavedReceipts();
  const listEl = document.getElementById('history-items-list');
  const countLabel = document.getElementById('history-count-label');

  if (countLabel) countLabel.textContent = `${history.length} recibos guardados`;
  if (!listEl) return;

  if (history.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-10 text-slate-400">
        <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/></svg>
        <p class="text-xs font-semibold">No hay recibos guardados aún.</p>
        <p class="text-[11px] text-slate-500 mt-0.5">Emití y guardá tu primer comprobante de cobro.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = history.map(item => {
    const total = calculateTotal(item);
    const curr = item.currency || '$';
    return `
      <div class="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm transition">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">${item.number || 'REC'}</span>
            <span class="text-xs font-bold text-slate-800 truncate">${item.client?.name || 'Cliente sin nombre'}</span>
            <span class="text-[10px] text-slate-400 font-mono">${formatDate(item.date)}</span>
          </div>
          <p class="text-[11px] text-slate-600 truncate mt-0.5">
            ${item.concept || 'Servicio'} • <span class="font-semibold">${item.period || 'Período'}</span> (${item.monthsCount || 1} ${item.monthsCount === 1 ? 'mes' : 'meses'})
          </p>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <span class="font-mono font-black text-sm text-black">${formatCurrency(total, curr)}</span>
          <div class="flex items-center gap-1">
            <button type="button" class="btn-load-receipt p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition" data-id="${item.id}" title="Cargar este recibo en el editor">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button type="button" class="btn-delete-receipt p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition" data-id="${item.id}" title="Eliminar recibo">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind Load / Delete
  listEl.querySelectorAll('.btn-load-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const found = history.find(r => r.id === id);
      if (found) {
        receiptState = { ...found };
        loadSavedReceipt();
        renderReceipt();
        closeHistoryModal();
        showToast(`Recibo ${found.number} cargado en el editor`, 'info');
      }
    });
  });

  listEl.querySelectorAll('.btn-delete-receipt').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (confirm('¿Eliminar este recibo del historial?')) {
        const updated = history.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.RECEIPTS_HISTORY, JSON.stringify(updated));
        renderHistoryList();
        updateHistoryBadge();
        showToast('Recibo eliminado', 'info');
      }
    });
  });
}

function triggerPrint() {
  window.print();
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-900 text-white'
  };

  toast.className = `${colors[type] || colors.info} px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 pointer-events-auto transform transition-all duration-200 translate-y-2 opacity-0`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}
