const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQ5sgpHobtzwslsvSF3nOOkIu434L9Km7ghZd6B5nTF3GyaYsaHQDXPP9S-xbB-msfSg/exec';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdMxdZYZrksdU6ycO6XtxvUhGuh8K2ksPehsN9yZLYqjqPIKzNjPqeNiV_Nqb3OxHrVnAMMCOqM-Bp/pub?output=csv';

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('product.html')) {
    initProductPage();
  } else if (path.includes('order.html')) {
    initOrderPage();
  } else if (path.includes('admin.html')) {
    initAdminPage();
  }
});

function initProductPage() {
  const productList = document.getElementById('product-list');
  const filterBar = document.getElementById('filter-bar');

  if (!productList) return;

  fetch('products.json')
    .then(res => res.json())
    .then(products => {
      const urlParams = new URLSearchParams(window.location.search);
      const selectedMood = urlParams.get('mood') || 'all';

      renderProducts(products, selectedMood);

      if (filterBar) {
        filterBar.addEventListener('click', (e) => {
          if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            renderProducts(products, e.target.dataset.mood);
          }
        });
      }
    });
}

function renderProducts(products, mood) {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  const filtered = mood === 'all' ? products : products.filter(p => p.mood === mood);

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
      </div>
      <div>
        <div class="price">${p.price} บาท</div>
        <a href="order.html?item=${encodeURIComponent(p.name)}&price=${p.price}" class="btn-primary" style="display:block; text-align:center;">สั่งซื้อเมนูนี้</a>
      </div>
    `;
    productList.appendChild(card);
  });
}

function initOrderPage() {
  const form = document.getElementById('orderForm');
  const itemsInput = document.getElementById('items');
  const totalInput = document.getElementById('total');

  const urlParams = new URLSearchParams(window.location.search);
  const itemParam = urlParams.get('item');
  const priceParam = urlParams.get('price');

  if (itemParam && itemsInput) itemsInput.value = itemParam;
  if (priceParam && totalInput) totalInput.value = priceParam;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const payload = {
        customerName: document.getElementById('customerName').value,
        contact: document.getElementById('contact').value,
        items: document.getElementById('items').value,
        total: document.getElementById('total').value,
        note: document.getElementById('note').value
      };

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      .then(() => {
        window.location.href = 'thankyou.html';
      })
      .catch(error => {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
      });
    });
  }
}

function initAdminPage() {
  const tbody = document.querySelector('#ordersTable tbody');
  if (!tbody) return;

  fetch(CSV_URL)
    .then(res => res.text())
    .then(csvText => {
      const rows = parseCSV(csvText);
      tbody.innerHTML = '';
      
      const dataRows = rows.slice(1).reverse();

      dataRows.forEach(row => {
        if (row.length >= 5) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${row[0] || ''}</td>
            <td>${row[1] || ''}</td>
            <td>${row[2] || ''}</td>
            <td>${row[3] || ''}</td>
            <td>${row[4] || ''}</td>
            <td>${row[5] || ''}</td>
          `;
          tbody.appendChild(tr);
        }
      });
    });
}

function parseCSV(text) {
  const lines = text.split('\n');
  return lines.map(line => {
    const values = [];
    let insideQuote = false;
    let val = '';
    for (let char of line) {
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(val.trim());
        val = '';
      } else {
        val += char;
      }
    }
    values.push(val.trim());
    return values;
  });
}