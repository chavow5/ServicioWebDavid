/**
 * Contrato de Servicios Web - David Ramirez
 * Generador de Contrato de Servicios Web para Freelance
 * Formato y cláusulas según requerimientos específicos
 */

// Storage Keys
const STORAGE_KEYS = {
  ISSUER: 'budget_issuer_profile_v1',
  CONTRACTS_HISTORY: 'budget_history_contracts_v1',
  PIN: 'budget_security_pin_v1',
  CURRENT_CONTRACT: 'budget_current_contract_draft_v1',
  LAST_CLIENT: 'budget_last_client_v1'
};

// Default Issuer Profile (El Desarrollador - David Ramirez)
const DEFAULT_ISSUER = {
  trade: 'CHAVO',
  name: 'David Ramirez',
  subtitle: 'Web Developer',
  phone: '+54 9 3804 201334',
  web: 'https://davidramirezweb.vercel.app/',
  location: 'La Rioja, Argentina',
  city: 'La Rioja',
  dni: '20-38491820-4',
  alias: 'chavo651',
  bank: 'Alias: chavo651\nBanco: Mercado Pago',
  logo: 'assets/logo.png',
  invertLogo: true
};

// Default Contract Template
const DEFAULT_CONTRACT = {
  id: 'contract_' + Date.now(),
  number: 'CONTR-2026-001',
  date: new Date().toISOString().split('T')[0],
  city: 'Buenos Aires',
  currency: '$',
  projectUrl: 'Sitio Web Comercial • https://davidramirezweb.vercel.app/',
  monthlyFee: 45000,
  payDay: 10,
  alias: 'chavo651',
  priceNoticeDays: 15,
  graceDays: 10,
  cancelDays: 30,
  buyoutMonths: 3,
  includeSignatures: true,
  signatureMode: 'dev', // 'dev' (solo emisor/desarrollador) | 'both' (ambos)
  client: {
    name: 'Castillo, Daniel',
    dni: '20-35890133-7',
    phone: '11 5544-3322',
    email: 'danielcastillo@gmail.com',
    city: 'Capital, La Rioja'
  },
  pageMargins: 'standard', // 'standard' (2.0cm sup/inf, 2.5cm lat), 'full25' (2.5cm all), 'compact' (1.8cm / 2.0cm)
  fontSize: '11pt', // '11pt', '12pt'
  lineHeight: '1.35', // '1.15', '1.35', '1.50'
  status: 'Vigente'
};

// Quick Presets
const CONTRACT_PRESETS = {
  'mantenimiento': {
    projectUrl: 'Sitio Web Comercial • Desarrollo y Mantenimiento Web',
    monthlyFee: 45000,
    currency: '$',
    payDay: 10,
    priceNoticeDays: 15,
    graceDays: 10,
    cancelDays: 30,
    buyoutMonths: 3
  },
  'mantenimiento-horas': {
    projectUrl: 'Plataforma Web Integral • Mantenimiento y Nuevas Funciones',
    monthlyFee: 85000,
    currency: '$',
    payDay: 10,
    priceNoticeDays: 15,
    graceDays: 10,
    cancelDays: 30,
    buyoutMonths: 3
  },
  'abono-usd': {
    projectUrl: 'Web Application & Cloud Retainer • https://davidramirezweb.vercel.app/',
    monthlyFee: 150,
    currency: 'USD $',
    payDay: 5,
    priceNoticeDays: 30,
    graceDays: 7,
    cancelDays: 30,
    buyoutMonths: 3
  },
  'hosting': {
    projectUrl: 'Alojamiento Cloud Administrado y Certificado SSL',
    monthlyFee: 30000,
    currency: '$',
    payDay: 10,
    priceNoticeDays: 15,
    graceDays: 10,
    cancelDays: 15,
    buyoutMonths: 2
  }
};

// App State
let issuerState = { ...DEFAULT_ISSUER };
let contractState = { ...DEFAULT_CONTRACT };
let isHistoryUnlocked = false;

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadSavedIssuer();
  loadSavedContract();
  setupEventListeners();
  renderContract();
  updateHistoryBadge();
  switchMobileTab('editor');
  setTimeout(updatePreviewScale, 100);
});

// Load Issuer Profile (Shared with Presupuestos)
function loadSavedIssuer() {
  const saved = localStorage.getItem(STORAGE_KEYS.ISSUER);
  if (saved) {
    try {
      issuerState = { ...DEFAULT_ISSUER, ...JSON.parse(saved) };
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
  setVal('input-dev-dni', issuerState.dni || '20-38491820-4');
  setVal('input-issuer-phone', issuerState.phone);
  setVal('input-dev-city', issuerState.city || 'La Rioja');
  setVal('input-dev-alias', issuerState.alias || 'chavo651');
  setVal('input-issuer-web', issuerState.web);

  const checkInvert = document.getElementById('check-invert-logo');
  if (checkInvert) checkInvert.checked = !!issuerState.invertLogo;
}

// Load Contract Draft or Default
function loadSavedContract() {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_CONTRACT);
  if (saved) {
    try {
      contractState = { ...DEFAULT_CONTRACT, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading contract draft:', e);
    }
  } else {
    // If there's an active client from Presupuestos, prefill it
    const lastClient = localStorage.getItem(STORAGE_KEYS.LAST_CLIENT);
    if (lastClient) {
      try {
        const clientObj = JSON.parse(lastClient);
        contractState.client = { ...contractState.client, ...clientObj };
      } catch (e) {
        // silent
      }
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
  setVal('input-client-name', contractState.client?.name || '');
  setVal('input-client-dni', contractState.client?.dni || '');
  setVal('input-client-phone', contractState.client?.phone || '');
  setVal('input-client-email', contractState.client?.email || '');
  setVal('input-client-city', contractState.client?.city || '');

  // Populate contract inputs
  setVal('input-contract-number', contractState.number || 'CONTR-2026-001');
  setVal('input-contract-date', contractState.date || new Date().toISOString().split('T')[0]);
  setVal('input-project-url', contractState.projectUrl || '');
  setVal('select-contract-currency', contractState.currency || '$');
  setVal('input-monthly-fee', contractState.monthlyFee || 45000);
  setVal('input-pay-day', contractState.payDay || 10);
  setVal('input-price-notice-days', contractState.priceNoticeDays || 15);
  setVal('input-grace-days', contractState.graceDays || 10);
  setVal('input-cancel-days', contractState.cancelDays || 30);
  setVal('input-buyout-months', contractState.buyoutMonths || 3);
  setVal('select-contract-margins', contractState.pageMargins || 'standard');
  setVal('select-contract-font-size', contractState.fontSize || '11pt');
  setVal('select-contract-line-height', contractState.lineHeight || '1.35');

  setChecked('check-contract-signatures', contractState.includeSignatures !== false);
  const sigMode = contractState.signatureMode || 'dev';
  const radioSig = document.querySelector(`input[name="radio-contract-sig"][value="${sigMode}"]`);
  if (radioSig) radioSig.checked = true;
  const boxSigMode = document.getElementById('box-contract-sig-mode');
  if (boxSigMode) {
    if (contractState.includeSignatures !== false) boxSigMode.classList.remove('hidden');
    else boxSigMode.classList.add('hidden');
  }
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

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function formatDateFull(isoStr) {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  const monthName = MONTHS_ES[parseInt(m, 10) - 1] || m;
  return `${parseInt(d, 10)} de ${monthName} de ${y}`;
}

// -------------------------------------------------------------
// Rendering
// -------------------------------------------------------------
function renderContract() {
  const currency = contractState.currency || '$';
  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '';
  };

  // Header Box
  setElText('contract-view-issuer-trade', issuerState.trade);
  setElText('contract-view-issuer-name', issuerState.name);
  setElText('contract-view-issuer-subtitle', issuerState.subtitle);
  setElText('contract-view-issuer-location', (issuerState.location || '').toUpperCase());
  setElText('contract-view-issuer-phone', 'TEL: ' + issuerState.phone);
  setElText('contract-view-issuer-web', issuerState.web);

  // Logo Preview
  const logoEl = document.getElementById('contract-view-issuer-logo');
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

  // Contract Number & Dates
  setElText('contract-view-number', contractState.number || 'CONTR-2026-001');
  setElText('contract-view-date-short', formatDate(contractState.date));

  // Intro Paragraph: "En [ciudad], a [fecha], entre [Tu nombre], DNI/CUIT [] y [Nombre del cliente], DNI/CUIT []"
  const devCity = issuerState.city || 'Buenos Aires';
  setElText('contract-view-city', devCity);
  setElText('contract-view-date-full', formatDateFull(contractState.date));
  setElText('contract-view-dev-name', issuerState.name || 'David Ramirez');
  setElText('contract-view-dev-dni', issuerState.dni || '20-38491820-4');

  const clientName = contractState.client?.name || 'Castillo, Daniel';
  const clientDni = contractState.client?.dni || '-';
  setElText('contract-view-client-name', clientName.toUpperCase());
  setElText('contract-view-client-dni', clientDni);

  // Clause 1: Servicio
  setElText('contract-view-project', contractState.projectUrl || 'Sitio Web Comercial');

  // Clause 2: Precio
  setElText('contract-view-fee', formatCurrency(contractState.monthlyFee, currency));
  setElText('contract-view-pay-day', contractState.payDay || '10');
  const aliasVal = issuerState.alias || contractState.alias || 'david.dev.mp';
  setElText('contract-view-alias', aliasVal);
  setElText('contract-view-price-notice', contractState.priceNoticeDays || '15');

  // Clause 3: Falta de pago
  setElText('contract-view-grace-days', contractState.graceDays || '10');

  // Clause 4: Baja
  setElText('contract-view-cancel-days', contractState.cancelDays || '30');

  // Clause 5: Propiedad y Traspaso
  const months = contractState.buyoutMonths || 3;
  setElText('contract-view-buyout', `${months} cuotas mensuales del servicio`);

  // Signatures Box & Closing Text
  const sigBox = document.getElementById('contract-view-signatures-box');
  const sigWrap = document.getElementById('contract-view-signatures-wrap');
  const sigDevCol = document.getElementById('contract-view-sig-dev-col');
  const sigClientCol = document.getElementById('contract-view-sig-client-col');
  const closingEl = document.getElementById('contract-view-closing');

  const sigMode = contractState.signatureMode || 'dev';

  if (sigBox) {
    if (contractState.includeSignatures) {
      sigBox.classList.remove('hidden');
      setElText('contract-view-sig-dev-name', (issuerState.name || 'DAVID RAMIREZ').toUpperCase());
      setElText('contract-view-sig-dev-dni', issuerState.dni || '20-38491820-4');

      if (sigMode === 'both') {
        if (sigWrap) sigWrap.className = 'grid grid-cols-2 gap-16';
        if (sigDevCol) sigDevCol.className = 'w-full text-center font-sans';
        if (sigClientCol) {
          sigClientCol.classList.remove('hidden');
          sigClientCol.className = 'w-full text-center font-sans';
          setElText('contract-view-sig-client-name', clientName.toUpperCase());
          setElText('contract-view-sig-client-dni', clientDni);
        }
        if (closingEl) closingEl.textContent = 'Firman dos ejemplares.';
      } else {
        // Solo Emisor / Desarrollador
        if (sigWrap) sigWrap.className = 'flex justify-end';
        if (sigDevCol) sigDevCol.className = 'w-72 text-center font-sans';
        if (sigClientCol) sigClientCol.classList.add('hidden');
        if (closingEl) closingEl.textContent = 'Firma en conformidad el desarrollador.';
      }
    } else {
      sigBox.classList.add('hidden');
    }
  }

  // Update mobile bottom bar total
  const mobileBarTotal = document.getElementById('mobile-bar-total');
  if (mobileBarTotal) {
    mobileBarTotal.textContent = formatCurrency(contractState.monthlyFee, currency);
  }

  // Apply Page Setup (A4 210x297mm, Margins, Arial, Font size, Line-height)
  const printArea = document.getElementById('print-area');
  const marginsMode = contractState.pageMargins || 'standard';
  const fontSize = contractState.fontSize || '11pt';
  const lineHeight = contractState.lineHeight || '1.35';

  if (printArea) {
    printArea.style.fontFamily = 'Arial, Helvetica, sans-serif';

    // Margins (Superior e inferior 2,0 a 2,5 cm; izquierdo y derecho 2,5 cm para encuadernación)
    let marginCss = '20mm 25mm 20mm 25mm';
    if (marginsMode === 'full25') {
      marginCss = '25mm 25mm 25mm 25mm';
    } else if (marginsMode === 'compact') {
      marginCss = '18mm 20mm 18mm 20mm';
    }
    printArea.style.padding = marginCss;

    // Apply font size and line height to body text & clauses (Arial 11-12pt, interlineado 1.15-1.5)
    const bodyElements = printArea.querySelectorAll('.contract-body-text, .contract-clause, #contract-view-intro, #contract-view-closing');
    bodyElements.forEach(el => {
      el.style.fontFamily = 'Arial, Helvetica, sans-serif';
      el.style.fontSize = fontSize;
      el.style.lineHeight = lineHeight;
    });

    // Update dynamic print @page margin rule
    const printStyle = document.getElementById('style-contract-print-page');
    if (printStyle) {
      printStyle.textContent = `@media print { @page { size: 210mm 297mm; margin: ${marginCss}; } }`;
    }
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
      tabEditor.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm transition text-center flex items-center justify-center gap-1.5';
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
      tabPreview.className = 'flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm transition text-center flex items-center justify-center gap-1.5';
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
      btnFit.className = 'px-2 py-1 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700 transition';
    }
    if (btn100) {
      btn100.className = 'px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition';
    }
  } else if (previewZoomMode === '100') {
    previewZoomLevel = 1.0;
    if (btn100) {
      btn100.className = 'px-2 py-1 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700 transition';
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
  if (btnMobileSaveShortcut) btnMobileSaveShortcut.addEventListener('click', saveCurrentContract);
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
        renderContract();
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
      renderContract();
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
      renderContract();
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
  const selCurrency = document.getElementById('select-contract-currency');
  if (selCurrency) {
    selCurrency.addEventListener('change', (e) => {
      contractState.currency = e.target.value;
      renderContract();
    });
  }

  // Client Inputs
  ['input-client-name', 'input-client-dni', 'input-client-phone', 'input-client-email', 'input-client-city'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const key = id.replace('input-client-', '');
      contractState.client[key] = el.value;
      localStorage.setItem(STORAGE_KEYS.LAST_CLIENT, JSON.stringify(contractState.client));
      renderContract();
    });
  });

  // Contract Terms Inputs
  const contractInputs = [
    { id: 'input-contract-number', key: 'number' },
    { id: 'input-contract-date', key: 'date' },
    { id: 'input-project-url', key: 'projectUrl' },
    { id: 'input-monthly-fee', key: 'monthlyFee', isNum: true },
    { id: 'input-pay-day', key: 'payDay', isNum: true },
    { id: 'input-price-notice-days', key: 'priceNoticeDays', isNum: true },
    { id: 'input-grace-days', key: 'graceDays', isNum: true },
    { id: 'input-cancel-days', key: 'cancelDays', isNum: true },
    { id: 'input-buyout-months', key: 'buyoutMonths', isNum: true }
  ];

  contractInputs.forEach(({ id, key, isNum }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        contractState[key] = isNum ? (Number(el.value) || 0) : el.value;
        renderContract();
      });
    }
  });

  // Checkbox signatures & Mode Toggle
  const checkSig = document.getElementById('check-contract-signatures');
  const boxSigMode = document.getElementById('box-contract-sig-mode');
  if (checkSig) {
    checkSig.addEventListener('change', (e) => {
      contractState.includeSignatures = e.target.checked;
      if (boxSigMode) {
        if (e.target.checked) boxSigMode.classList.remove('hidden');
        else boxSigMode.classList.add('hidden');
      }
      renderContract();
      autoSaveDraft();
    });
  }

  // Radio signature mode (dev vs both)
  document.querySelectorAll('input[name="radio-contract-sig"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      contractState.signatureMode = e.target.value;
      renderContract();
      autoSaveDraft();
    });
  });

  // Page Setup Controls (A4, Margins, Arial Size, Line-Height)
  const selMargins = document.getElementById('select-contract-margins');
  if (selMargins) {
    selMargins.addEventListener('change', (e) => {
      contractState.pageMargins = e.target.value;
      renderContract();
    });
  }

  const selFontSize = document.getElementById('select-contract-font-size');
  if (selFontSize) {
    selFontSize.addEventListener('change', (e) => {
      contractState.fontSize = e.target.value;
      renderContract();
    });
  }

  const selLineHeight = document.getElementById('select-contract-line-height');
  if (selLineHeight) {
    selLineHeight.addEventListener('change', (e) => {
      contractState.lineHeight = e.target.value;
      renderContract();
    });
  }

  // Presets
  document.querySelectorAll('.btn-preset-contract').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const preset = CONTRACT_PRESETS[presetKey];
      if (!preset) return;

      contractState.projectUrl = preset.projectUrl;
      contractState.monthlyFee = preset.monthlyFee;
      contractState.currency = preset.currency;
      contractState.payDay = preset.payDay;
      contractState.priceNoticeDays = preset.priceNoticeDays;
      contractState.graceDays = preset.graceDays;
      contractState.cancelDays = preset.cancelDays;
      contractState.buyoutMonths = preset.buyoutMonths;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };

      setVal('input-project-url', preset.projectUrl);
      setVal('input-monthly-fee', preset.monthlyFee);
      setVal('select-contract-currency', preset.currency);
      setVal('input-pay-day', preset.payDay);
      setVal('input-price-notice-days', preset.priceNoticeDays);
      setVal('input-grace-days', preset.graceDays);
      setVal('input-cancel-days', preset.cancelDays);
      setVal('input-buyout-months', preset.buyoutMonths);

      renderContract();
      showToast('Plantilla aplicada al contrato', 'success');
    });
  });

  // Action Buttons
  const btnPrintMain = document.getElementById('btn-print-main');
  const btnPrintSec = document.getElementById('btn-print-secondary');
  if (btnPrintMain) btnPrintMain.addEventListener('click', triggerPrint);
  if (btnPrintSec) btnPrintSec.addEventListener('click', triggerPrint);

  const btnNewContract = document.getElementById('btn-new-contract');
  if (btnNewContract) btnNewContract.addEventListener('click', createNewContract);

  const btnSaveContract = document.getElementById('btn-save-contract');
  if (btnSaveContract) btnSaveContract.addEventListener('click', saveCurrentContract);

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
// New Contract Handler
// -------------------------------------------------------------
function createNewContract() {
  if (confirm('¿Deseas iniciar un nuevo contrato de servicios web? Se generará un nuevo número correlativo.')) {
    const currentNum = contractState.number || 'CONTR-2026-001';
    let nextNum = 'CONTR-2026-002';
    const match = currentNum.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const seq = (parseInt(match[2], 10) + 1).toString().padStart(match[2].length, '0');
      nextNum = `${prefix}${seq}`;
    }

    contractState = {
      ...DEFAULT_CONTRACT,
      id: 'contract_' + Date.now(),
      number: nextNum,
      date: new Date().toISOString().split('T')[0],
      client: {
        name: '',
        dni: '',
        phone: '',
        email: '',
        city: ''
      }
    };

    loadSavedContract();
    renderContract();
    showToast('Nuevo contrato iniciado con Nº ' + nextNum, 'success');
  }
}

// -------------------------------------------------------------
// History & PIN Protection System
// -------------------------------------------------------------
function getSavedContracts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS_HISTORY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveContractsList(list) {
  localStorage.setItem(STORAGE_KEYS.CONTRACTS_HISTORY, JSON.stringify(list));
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const list = getSavedContracts();
  const badge = document.getElementById('badge-history-count');
  if (badge) badge.textContent = list.length;
}

function getStoredPin() {
  return localStorage.getItem(STORAGE_KEYS.PIN) || '1234';
}

function saveCurrentContract() {
  const list = getSavedContracts();
  const existingIdx = list.findIndex(item => item.id === contractState.id || item.number === contractState.number);

  const contractRecord = {
    ...contractState,
    savedAt: new Date().toISOString(),
    totalCalculated: contractState.monthlyFee
  };

  if (existingIdx >= 0) {
    list[existingIdx] = contractRecord;
    showToast(`Contrato ${contractState.number} actualizado`, 'success');
  } else {
    list.unshift(contractRecord);
    showToast(`Contrato ${contractState.number} guardado en el historial`, 'success');
  }

  saveContractsList(list);
  if (isHistoryUnlocked) renderHistoryList();
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

  const contracts = getSavedContracts();
  container.innerHTML = '';

  const q = filterQuery.toLowerCase().trim();
  const filtered = contracts.filter(item => {
    const clientName = (item.client?.name || '').toLowerCase();
    const num = (item.number || '').toLowerCase();
    const proj = (item.projectUrl || '').toLowerCase();
    return !q || clientName.includes(q) || num.includes(q) || proj.includes(q);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-slate-400">
        <p class="text-xs">No hay contratos guardados ${q ? 'que coincidan con la búsqueda' : 'aún'}.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(contract => {
    const div = document.createElement('div');
    div.className = 'w-full';

    let statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (contract.status === 'Pausado') statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
    if (contract.status === 'Finalizado') statusBadge = 'bg-blue-100 text-blue-800 border-blue-300';
    if (contract.status === 'Cancelado') statusBadge = 'bg-rose-100 text-rose-800 border-rose-300';

    const clientTitle = escapeHtml(contract.client?.name || 'Cliente');
    const projTitle = escapeHtml(contract.projectUrl || 'Proyecto Web');
    const displayTotal = formatCurrency(contract.monthlyFee || contract.totalCalculated || 0, contract.currency || '$');

    div.innerHTML = `
      <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-slate-50 transition rounded-xl gap-2 border sm:border-0 border-slate-100 mb-1.5 sm:mb-0">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">CONTRATO</span>
            <span class="font-mono font-bold text-xs text-slate-900">${contract.number}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusBadge}">${contract.status || 'Vigente'}</span>
            <span class="text-[10px] text-slate-400 font-mono">${formatDate(contract.date)}</span>
          </div>
          <p class="text-xs font-semibold text-slate-700 truncate mt-0.5">${clientTitle} • <span class="text-slate-500 font-normal">${projTitle}</span></p>
          <p class="text-[11px] font-bold text-slate-900 font-mono mt-0.5">
            ${displayTotal} / mes
          </p>
        </div>
        <div class="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0">
          <select class="history-status-select text-[11px] border border-slate-300 rounded-lg px-2 py-1 bg-white font-medium" data-id="${contract.id}">
            <option value="Vigente" ${contract.status === 'Vigente' ? 'selected' : ''}>Vigente</option>
            <option value="Pausado" ${contract.status === 'Pausado' ? 'selected' : ''}>Pausado</option>
            <option value="Finalizado" ${contract.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
            <option value="Cancelado" ${contract.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>

          <button type="button" class="btn-load-history px-3 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition" data-id="${contract.id}">
            Cargar
          </button>

          <button type="button" class="btn-delete-history p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50" data-id="${contract.id}" title="Eliminar">
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
      const contractId = btn.dataset.id;
      const allContracts = getSavedContracts();
      const target = allContracts.find(c => c.id === contractId);
      if (target) {
        contractState = JSON.parse(JSON.stringify(target));
        loadSavedContract();
        renderContract();
        document.getElementById('modal-history').classList.add('hidden');
        showToast(`Contrato ${target.number} cargado en el editor`, 'success');
      }
    });
  });

  container.querySelectorAll('.history-status-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const contractId = sel.dataset.id;
      const allContracts = getSavedContracts();
      const target = allContracts.find(c => c.id === contractId);
      if (target) {
        target.status = e.target.value;
        saveContractsList(allContracts);
        renderHistoryList(document.getElementById('input-search-history')?.value || '');
        showToast('Estado actualizado a ' + target.status, 'info');
      }
    });
  });

  container.querySelectorAll('.btn-delete-history').forEach(btn => {
    btn.addEventListener('click', () => {
      const contractId = btn.dataset.id;
      if (confirm('¿Seguro que deseas eliminar este contrato del historial?')) {
        let allContracts = getSavedContracts();
        allContracts = allContracts.filter(c => c.id !== contractId);
        saveContractsList(allContracts);
        renderHistoryList(document.getElementById('input-search-history')?.value || '');
        showToast('Contrato eliminado del historial', 'info');
      }
    });
  });
}

// -------------------------------------------------------------
// Autosave Draft
// -------------------------------------------------------------
function autoSaveDraft() {
  localStorage.setItem(STORAGE_KEYS.CURRENT_CONTRACT, JSON.stringify(contractState));
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
