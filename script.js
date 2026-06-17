'use strict';

/* ============================================================
   Invoice Generator — Full Application Logic
   ============================================================ */

// ─── Utilities ───────────────────────────────────────────────

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function generateId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  let counter = parseInt(localStorage.getItem('invCounter')) || 0;
  counter += 1;
  localStorage.setItem('invCounter', counter);
  return `INV-${year}-${String(counter).padStart(4, '0')}`;
}

function fmt(n) {
  return Number(n).toFixed(2);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ─── Default / State ────────────────────────────────────────

function freshInvoice() {
  return {
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: '',
    customerName: '',
    customerAddress: '',
    receiverName: '',
    items: [{ id: generateId(), description: '', quantity: 1, unitPrice: 0, fixedPrice: false, fixedAmount: 0 }],
    taxRate: 0,
    downPayment: 0,
  };
}

let data = freshInvoice();

// ─── DOM Cache ──────────────────────────────────────────────

const el = {};

function cacheDom() {
  el.companyName = $('#companyName');
  el.companyAddress = $('#companyAddress');
  el.companyPhone = $('#companyPhone');
  el.companyEmail = $('#companyEmail');
  el.invoiceNumber = $('#invoiceNumber');
  el.invoiceDate = $('#invoiceDate');
  el.customerName = $('#customerName');
  el.customerAddress = $('#customerAddress');
  el.receiverName = $('#receiverName');
  el.taxRate = $('#taxRate');
  el.downPayment = $('#downPayment');
  el.itemsBody = $('#itemsBody');
  el.addItemBtn = $('#addItemBtn');
  el.saveBtn = $('#saveBtn');
  el.loadBtn = $('#loadBtn');
  el.clearBtn = $('#clearBtn');
  el.printBtn = $('#printBtn');
  el.exportBtn = $('#exportBtn');
  el.preview = $('#invoicePreview');
  el.toast = $('#toast');
  el.displaySubtotal = $('#displaySubtotal');
  el.displayTax = $('#displayTax');
  el.displayDownPayment = $('#displayDownPayment');
  el.displayTotal = $('#displayTotal');

  el.formFields = [
    el.companyName, el.companyAddress, el.companyPhone, el.companyEmail,
    el.invoiceNumber, el.invoiceDate,
    el.customerName, el.customerAddress, el.receiverName, el.taxRate, el.downPayment,
  ];

  el.errorFields = {
    companyName: $('#companyNameError'),
    companyAddress: $('#companyAddressError'),
    companyPhone: $('#companyPhoneError'),
    companyEmail: $('#companyEmailError'),
    customerName: $('#customerNameError'),
    customerAddress: $('#customerAddressError'),
  };
}

// ─── Validation ─────────────────────────────────────────────

const VALIDATORS = {
  companyName:    v => (!v.trim() ? 'Company name is required.' : ''),
  companyAddress: v => (!v.trim() ? 'Company address is required.' : ''),
  companyPhone:   v => (!v.trim() ? 'Company phone is required.' : ''),
  companyEmail:   v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Valid email is required.'),
  customerName:   v => (!v.trim() ? 'Customer name is required.' : ''),
};

function validateForm() {
  let valid = true;
  for (const [id, fn] of Object.entries(VALIDATORS)) {
    const input = el[id];
    const errEl = el.errorFields[id];
    const msg = fn(input.value);
    errEl.textContent = msg;
    input.classList.toggle('input-error', !!msg);
    if (msg) valid = false;
  }

  let hasValidItem = false;
  $$('.item-desc', el.itemsBody).forEach(inp => {
    if (inp.value.trim()) hasValidItem = true;
  });
  if (!hasValidItem && data.items.length > 0) {
    valid = false;
  }

  return valid;
}

function clearValidation() {
  for (const errEl of Object.values(el.errorFields)) {
    errEl.textContent = '';
  }
  $$('.input-error').forEach(el => el.classList.remove('input-error'));
}

// ─── Read form → data ──────────────────────────────────────

function readForm() {
  data.companyName = el.companyName.value;
  data.companyAddress = el.companyAddress.value;
  data.companyPhone = el.companyPhone.value;
  data.companyEmail = el.companyEmail.value;
  data.invoiceNumber = el.invoiceNumber.value;
  data.invoiceDate = el.invoiceDate.value;
  data.customerName = el.customerName.value;
  data.customerAddress = el.customerAddress.value;
  data.receiverName = el.receiverName.value;
  data.taxRate = parseFloat(el.taxRate.value) || 0;
  data.downPayment = parseFloat(el.downPayment.value) || 0;
}

// ─── Write data → form ─────────────────────────────────────

function writeForm() {
  el.companyName.value = data.companyName;
  el.companyAddress.value = data.companyAddress;
  el.companyPhone.value = data.companyPhone;
  el.companyEmail.value = data.companyEmail;
  el.invoiceNumber.value = data.invoiceNumber;
  el.invoiceDate.value = new Date().toISOString().slice(0, 10);
  el.customerName.value = data.customerName;
  el.customerAddress.value = data.customerAddress;
  el.receiverName.value = data.receiverName;
  el.taxRate.value = data.taxRate;
  el.downPayment.value = fmt(data.downPayment || 0);
}

// ─── Items table (form) ────────────────────────────────────

function renderItems() {
  const tbody = el.itemsBody;
  tbody.innerHTML = '';
  data.items.forEach(item => {
    const tr = document.createElement('tr');
    tr.dataset.id = item.id;
    const isFixed = item.fixedPrice;
    const itemTotal = isFixed ? item.fixedAmount : item.quantity * item.unitPrice;
    tr.innerHTML = `
      <td><button type="button" class="btn-toggle-type${isFixed ? ' is-fixed' : ''}" data-id="${item.id}" title="${isFixed ? 'Fixed price (click for per-unit)' : 'Per-unit price (click for fixed)'}">${isFixed ? 'F' : 'U'}</button></td>
      <td><input type="text" class="item-desc"  value="${escapeHtml(item.description)}" placeholder="Item description"${isFixed ? '' : ''}></td>
      <td>${isFixed ? '<span class="fixed-label">—</span>' : '<input type="number" class="item-qty" value="' + item.quantity + '" min="0" step="1">'}</td>
      <td>${isFixed ? '<input type="number" class="item-fixed-amount" value="' + fmt(item.fixedAmount) + '" min="0" step="0.01">' : '<input type="number" class="item-price" value="' + item.unitPrice + '" min="0" step="0.01">'}</td>
      <td class="line-total" data-id="${item.id}">GH₵${fmt(itemTotal)}</td>
      <td><button type="button" class="btn-remove" data-id="${item.id}" title="Remove item">&times;</button></td>`;
    tbody.appendChild(tr);
  });
}

function addItem() {
  data.items.push({ id: generateId(), description: '', quantity: 1, unitPrice: 0, fixedPrice: false, fixedAmount: 0 });
  renderItems();
  calcAll();
}

function removeItem(id) {
  if (data.items.length <= 1) return;
  data.items = data.items.filter(it => it.id !== id);
  renderItems();
  calcAll();
}

function getItemTotal(item) {
  return item.fixedPrice ? item.fixedAmount : item.quantity * item.unitPrice;
}

function updateLineTotal(tr, item) {
  const total = getItemTotal(item);
  const td = tr.querySelector('.line-total');
  if (td) td.textContent = 'GH₵' + fmt(total);
}

function attachItemEvents() {
  el.itemsBody.addEventListener('input', onItemInput);
  el.itemsBody.addEventListener('focusout', onItemBlur);
  el.itemsBody.addEventListener('keydown', onItemKeydown);
  el.itemsBody.addEventListener('click', onItemClick);
}

function onItemInput(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = tr.dataset.id;
  const item = data.items.find(it => it.id === id);
  if (!item) return;

  if (e.target.classList.contains('item-desc')) {
    item.description = e.target.value;
  } else if (e.target.classList.contains('item-qty')) {
    item.quantity = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
  } else if (e.target.classList.contains('item-price')) {
    item.unitPrice = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
  } else if (e.target.classList.contains('item-fixed-amount')) {
    item.fixedAmount = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
  }

  updateLineTotal(tr, item);
  calcAll();
}

function onItemKeydown(e) {
  const isPrice = e.target.classList.contains('item-price');
  const isFixed = e.target.classList.contains('item-fixed-amount');
  const isDownPayment = e.target.id === 'downPayment';
  if (!isPrice && !isFixed && !isDownPayment) return;

  if (isDownPayment) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const cents = Math.round((data.downPayment || 0) * 100);
      const newCents = cents * 10 + parseInt(e.key);
      data.downPayment = newCents / 100;
      e.target.value = fmt(data.downPayment);
      calcAll();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const cents = Math.round((data.downPayment || 0) * 100);
      const newCents = Math.floor(cents / 10);
      data.downPayment = newCents / 100;
      e.target.value = fmt(data.downPayment);
      calcAll();
    }
    return;
  }

  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = tr.dataset.id;
  const item = data.items.find(it => it.id === id);
  if (!item) return;

  const prop = isFixed ? 'fixedAmount' : 'unitPrice';

  if (e.key >= '0' && e.key <= '9') {
    e.preventDefault();
    const cents = Math.round(item[prop] * 100);
    const newCents = cents * 10 + parseInt(e.key);
    item[prop] = newCents / 100;
    e.target.value = fmt(item[prop]);
    updateLineTotal(tr, item);
    calcAll();
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    const cents = Math.round(item[prop] * 100);
    const newCents = Math.floor(cents / 10);
    item[prop] = newCents / 100;
    e.target.value = fmt(item[prop]);
    updateLineTotal(tr, item);
    calcAll();
  }
}

function onItemBlur(e) {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = tr.dataset.id;
  const item = data.items.find(it => it.id === id);

  if (e.target.id === 'downPayment') {
    data.downPayment = Math.max(0, parseFloat(e.target.value) || 0);
    e.target.value = fmt(data.downPayment);
    calcAll();
    return;
  }

  if (!item) return;

  if (e.target.classList.contains('item-qty')) {
    item.quantity = Math.max(1, parseInt(e.target.value) || 1);
    e.target.value = item.quantity;
  } else if (e.target.classList.contains('item-price')) {
    item.unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
    e.target.value = fmt(item.unitPrice);
  } else if (e.target.classList.contains('item-fixed-amount')) {
    item.fixedAmount = Math.max(0, parseFloat(e.target.value) || 0);
    e.target.value = fmt(item.fixedAmount);
  }

  updateLineTotal(tr, item);
  calcAll();
}

function onItemClick(e) {
  if (e.target.classList.contains('btn-remove')) {
    removeItem(e.target.dataset.id);
  } else if (e.target.classList.contains('btn-toggle-type')) {
    togglePriceType(e.target.dataset.id);
  }
}

function togglePriceType(id) {
  const item = data.items.find(it => it.id === id);
  if (!item) return;
  item.fixedPrice = !item.fixedPrice;
  if (item.fixedPrice) {
    item.fixedAmount = item.quantity * item.unitPrice;
  }
  renderItems();
  calcAll();
}

// ─── Calculations ──────────────────────────────────────────

function calcAll() {
  readForm();
  const subtotal = data.items.reduce((sum, it) => sum + getItemTotal(it), 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const downPayment = data.downPayment || 0;
  const grandTotal = subtotal + taxAmount - downPayment;

  el.displaySubtotal.textContent = 'GH₵' + fmt(subtotal);
  el.displayTax.textContent = 'GH₵' + fmt(taxAmount);
  el.displayDownPayment.textContent = 'GH₵' + fmt(downPayment);
  el.displayTotal.textContent = 'GH₵' + fmt(Math.max(0, grandTotal));

  data.subtotal = subtotal;
  data.taxAmount = taxAmount;
  data.downPayment = downPayment;
  data.grandTotal = Math.max(0, grandTotal);

  renderPreview();
}

// ─── Preview ───────────────────────────────────────────────

function renderPreview() {
  readForm();

  if (!data.companyName && !data.customerName && data.items.every(i => !i.description)) {
    el.preview.innerHTML =
      '<div class="preview-placeholder"><p>Fill in the form to see a live preview of your invoice.</p></div>';
    return;
  }

  const subtotal = data.items.reduce((s, it) => s + getItemTotal(it), 0);
  const taxAmt = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmt;

  const dateStr = data.invoiceDate
    ? new Date(data.invoiceDate + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  const itemsHtml = data.items
    .filter(it => it.description)
    .map(it => {
      const lt = getItemTotal(it);
      if (it.fixedPrice) {
        return `<tr>
          <td>${escapeHtml(it.description)}</td>
          <td class="text-right">—</td>
          <td class="price-col">—</td>
          <td class="total-col">GH₵${fmt(lt)}</td>
        </tr>`;
      }
      return `<tr>
        <td>${escapeHtml(it.description)}</td>
        <td class="text-right">${it.quantity}</td>
        <td class="price-col">GH₵${fmt(it.unitPrice)}</td>
        <td class="total-col">GH₵${fmt(lt)}</td>
      </tr>`;
    })
    .join('');

  const emptyRows = data.items.filter(it => !it.description).length;
  let emptyHtml = '';
  if (data.items.length === 0 || (emptyRows === data.items.length && !data.customerName)) {
    emptyHtml = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1rem;">No items added yet.</td></tr>`;
  }

  const downPayment = data.downPayment || 0;
  const totalAfterDownPayment = Math.max(0, total - downPayment);

  el.preview.innerHTML = `
    <div class="invoice-doc">
      <div class="invoice-header">
        <div class="invoice-company">
          <h3>${escapeHtml(data.companyName || 'Your Company')}</h3>
          <p>${escapeHtml(data.companyAddress || '123 Business Street')}<br>
             ${data.companyPhone ? escapeHtml(data.companyPhone) + '<br>' : ''}
             ${data.companyEmail ? escapeHtml(data.companyEmail) : ''}</p>
        </div>
        <div class="invoice-meta">
          <span class="inv-number">${escapeHtml(data.invoiceNumber)}</span>
          <strong>Date:</strong> ${dateStr}
        </div>
      </div>

      <div class="invoice-bill-to">
        <h4>Bill To:</h4>
        <p>${escapeHtml(data.customerName || 'Customer Name')}<br>
           ${escapeHtml(data.customerAddress || 'Customer Address')}</p>
      </div>

      <div class="invoice-items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            ${emptyHtml}
          </tbody>
        </table>
      </div>

      <div class="invoice-summary">
        <div class="sum-row"><span>Subtotal</span><span>GH₵${fmt(subtotal)}</span></div>
        <div class="sum-row"><span>Tax (${fmt(data.taxRate)}%)</span><span>GH₵${fmt(taxAmt)}</span></div>
        ${downPayment > 0 ? `<div class="sum-row"><span>Down Payment</span><span>GH₵-${fmt(downPayment)}</span></div>` : ''}
        <div class="sum-row sum-grand"><span>Grand Total</span><span>GH₵${fmt(totalAfterDownPayment)}</span></div>
      </div>

      <div class="invoice-receiver">
        <div class="receiver-line">
          <span class="receiver-label">Received by:</span>
          <span class="receiver-name">${escapeHtml(data.receiverName || '_________________________')}</span>
        </div>
      </div>

      <div class="invoice-footer">
        Thank you for your business!
      </div>
    </div>`;
}

// ─── LocalStorage ──────────────────────────────────────────

function saveToStorage() {
  readForm();
  try {
    localStorage.setItem('invoiceData', JSON.stringify(data));
    showToast('Invoice saved!');
  } catch {
    showToast('Failed to save invoice.', true);
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('invoiceData');
    if (!raw) { showToast('No saved invoice found.', true); return; }
    const saved = JSON.parse(raw);
    saved.items = saved.items.map(it => ({ ...it, id: it.id || generateId() }));
    data = saved;
    writeForm();
    renderItems();
    calcAll();
    clearValidation();
    showToast('Invoice loaded!');
  } catch {
    showToast('Failed to load invoice.', true);
  }
}

function clearInvoice() {
  if (!confirm('Are you sure you want to clear the invoice?')) return;
  data = freshInvoice();
  writeForm();
  renderItems();
  calcAll();
  clearValidation();
  showToast('Invoice cleared.');
}

// ─── Print ─────────────────────────────────────────────────

function printInvoice() {
  readForm();
  if (!validateForm()) {
    showToast('Please fix errors before printing.', true);
    return;
  }
  window.print();
}

// ─── PDF Export ────────────────────────────────────────────

function exportPDF() {
  readForm();
  if (!validateForm()) {
    showToast('Please fix errors before exporting.', true);
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Colors
  const primaryClr = [37, 99, 235];
  const grayClr = [100, 116, 139];
  const darkClr = [15, 23, 42];

  // ── Header bar ──
  doc.setFillColor(...primaryClr);
  doc.rect(0, 0, pageWidth, 8, 'F');
  y += 4;

  // ── Company / Invoice meta ──
  doc.setFontSize(18);
  doc.setTextColor(...darkClr);
  doc.setFont(undefined, 'bold');
  doc.text(data.companyName || 'Your Company', margin, y);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayClr);
  doc.text('INVOICE', pageWidth - margin, y, { align: 'right' });

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...grayClr);
  const addrLines = [data.companyAddress, data.companyPhone, data.companyEmail].filter(Boolean);
  addrLines.forEach(line => {
    doc.text(line, margin, y);
    y += 4;
  });

  // Invoice number & date on the right
  const metaY = y - addrLines.length * 4;
  doc.setFontSize(9);
  doc.setTextColor(...darkClr);
  doc.setFont(undefined, 'bold');
  doc.text('Invoice #:', pageWidth - margin - 40, metaY, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayClr);
  doc.text(data.invoiceNumber, pageWidth - margin, metaY, { align: 'right' });

  const dateStr = data.invoiceDate
    ? new Date(data.invoiceDate + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkClr);
  doc.text('Date:', pageWidth - margin - 40, metaY + 5, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayClr);
  doc.text(dateStr, pageWidth - margin, metaY + 5, { align: 'right' });

  y += 4;

  // ── Separator line ──
  y += 2;
  doc.setDrawColor(...grayClr);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── Bill To ──
  doc.setFontSize(10);
  doc.setTextColor(...darkClr);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', margin, y);
  y += 5;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...grayClr);
  doc.text(data.customerName, margin, y);
  y += 4;
  doc.text(data.customerAddress, margin, y);
  y += 8;

  // ── Items table ──
  const tableHead = [['Description', 'Qty', 'Unit Price', 'Total']];
  const tableBody = data.items
    .filter(it => it.description)
    .map(it => [
      it.description,
      it.fixedPrice ? '—' : String(it.quantity),
      it.fixedPrice ? '—' : 'GHS ' + fmt(it.unitPrice),
      'GHS ' + fmt(getItemTotal(it)),
    ]);

  if (tableBody.length === 0) {
    tableBody.push(['No items', '', '', '']);
  }

  doc.autoTable({
    head: tableHead,
    body: tableBody,
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: darkClr,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: primaryClr,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── Summary ──
  const subtotal = data.items.reduce((s, it) => s + getItemTotal(it), 0);
  const taxAmt = subtotal * (data.taxRate / 100);
  const downPayment = data.downPayment || 0;
  const grandTotal = subtotal + taxAmt - downPayment;

  const summaryX = pageWidth - margin - 60;
  const summaryW = 60;

  doc.setFontSize(9);
  doc.setTextColor(...grayClr);
  doc.setFont(undefined, 'normal');

  doc.text('Subtotal:', summaryX, y);
  doc.text('GHS ' + fmt(subtotal), pageWidth - margin, y, { align: 'right' });
  y += 5;

  doc.text('Tax (' + fmt(data.taxRate) + '%):', summaryX, y);
  doc.text('GHS ' + fmt(taxAmt), pageWidth - margin, y, { align: 'right' });
  y += 5;

  if (downPayment > 0) {
    doc.text('Down Payment:', summaryX, y);
    doc.text('GHS -' + fmt(downPayment), pageWidth - margin, y, { align: 'right' });
    y += 5;
  }

  doc.setDrawColor(...darkClr);
  doc.setLineWidth(0.5);
  doc.line(summaryX, y, pageWidth - margin, y);
  y += 4;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...darkClr);
  doc.text('Grand Total:', summaryX, y);
  doc.text('GHS ' + fmt(Math.max(0, grandTotal)), pageWidth - margin, y, { align: 'right' });
  y += 10;

  // ── Receiver ──
  if (data.receiverName) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...grayClr);
    doc.text('Received by:', summaryX, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkClr);
    doc.text(data.receiverName, pageWidth - margin, y, { align: 'right' });
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(...grayClr);
  doc.setFont(undefined, 'normal');
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });

  doc.setDrawColor(...primaryClr);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.save(`invoice-${data.invoiceNumber}.pdf`);
  showToast('PDF exported successfully!');
}

// ─── Toast ─────────────────────────────────────────────────

let toastTimer = null;

function showToast(msg, isError = false) {
  clearTimeout(toastTimer);
  el.toast.textContent = msg;
  el.toast.className = 'toast' + (isError ? ' toast-error' : '') + ' show';
  toastTimer = setTimeout(() => {
    el.toast.classList.remove('show');
  }, 3000);
}

// ─── Init ──────────────────────────────────────────────────

function init() {
  cacheDom();

  const saved = localStorage.getItem('invoiceData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.items = parsed.items.map(it => ({ ...it, id: it.id || generateId(), fixedPrice: it.fixedPrice || false, fixedAmount: it.fixedAmount || 0 }));
      if (!parsed.receiverName) parsed.receiverName = '';
      if (parsed.downPayment === undefined) parsed.downPayment = 0;
      data = parsed;
    } catch { /* use defaults */ }
  }

  writeForm();
  renderItems();
  attachItemEvents();
  calcAll();

  // ── Down payment custom input handling ──
  el.downPayment.addEventListener('keydown', onItemKeydown);
  el.downPayment.addEventListener('focusout', onItemBlur);

  // ── Form input binding ──
  el.formFields.forEach(field => {
    field.addEventListener('input', calcAll);
  });

  // ── Add item ──
  el.addItemBtn.addEventListener('click', addItem);

  // ── Action buttons ──
  el.saveBtn.addEventListener('click', saveToStorage);
  el.loadBtn.addEventListener('click', loadFromStorage);
  el.clearBtn.addEventListener('click', clearInvoice);
  el.printBtn.addEventListener('click', printInvoice);
  el.exportBtn.addEventListener('click', exportPDF);
}

document.addEventListener('DOMContentLoaded', init);
