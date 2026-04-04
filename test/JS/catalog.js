function showmenu() {
  document.getElementById('menu').classList.toggle('open');
}

var choicecategory = 1;
function categorybtn(clicked, num) {
  document.querySelectorAll('.filter-category button').forEach(btn => {
    btn.classList.remove('active');
  });
  clicked.classList.add('active');
  choicecategory = num;
  filtertable();
}

function filtertable() {
  document.querySelectorAll('.catalog-table tbody').forEach(tb => {
    tb.classList.remove('show');
  });
  switch (choicecategory) {
    case 1: document.querySelector('#men').classList.add('show'); break;
    case 2: document.querySelector('#women').classList.add('show'); break;
    case 3: document.querySelector('#kids').classList.add('show'); break;
    case 4: document.querySelector('#babies').classList.add('show'); break;
  }
}

function getAddedIds() {
  return JSON.parse(localStorage.getItem('addedProducts') || '[]');
}

function saveAddedIds(ids) {
  localStorage.setItem('addedProducts', JSON.stringify(ids));
}

function savePreview() {
  const preview = document.getElementById('preview');
  localStorage.setItem('previewProducts', preview.innerHTML);
}

function removeFromPreview(productId) {
  const preview = document.getElementById('preview');

  // find and remove the tr in preview that matches this productId
  preview.querySelectorAll('tr').forEach(tr => {
    const idEl = tr.querySelector('.prod-id');
    if (idEl && idEl.innerText === productId) {
      tr.remove();
    }
  });

  // remove from localStorage
  const addedIds = getAddedIds();
  const idx = addedIds.indexOf(productId);
  if (idx > -1) addedIds.splice(idx, 1);
  saveAddedIds(addedIds);

  // reset catalog button back to ADD
  Array.from(document.querySelectorAll('.prod-id'))
    .filter(s => s.innerText === productId)
    .forEach(s => {
      const btn = s.closest('.products').querySelector('button');
      if (btn) {
        btn.textContent = 'ADD';
        btn.disabled = false;
      }
    });

  savePreview();
}

function addProduct(btn) {
  const productDiv = btn.closest('.products');
  const productId = productDiv.querySelector('.prod-id').innerText;

  const addedIds = getAddedIds();
  if (addedIds.includes(productId)) return; // no duplicates

  // clone for preview
  const productClone = productDiv.cloneNode(true);

  // change clone's button to REMOVE
  const removeBtn = productClone.querySelector('button');
  removeBtn.textContent = 'X';
  removeBtn.disabled = false;
  removeBtn.setAttribute('onclick', `removeFromPreview('${productId}')`);

  // add to preview
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.appendChild(productClone);
  tr.appendChild(td);
  document.getElementById('preview').appendChild(tr);

  // mark catalog button as ADDED
  btn.textContent = 'ADDED';
  btn.disabled = true;

  // save
  addedIds.push(productId);
  saveAddedIds(addedIds);
  savePreview();
}

function loadPreview() {
  const preview = document.getElementById('preview');
  const saved = localStorage.getItem('previewProducts');
  if (saved) preview.innerHTML = saved;

  // force all preview buttons to REMOVE regardless of what was saved
  preview.querySelectorAll('.products button').forEach(btn => {
    const productId = btn.closest('.products').querySelector('.prod-id').innerText;
    btn.textContent = 'X';
    btn.disabled = false;
    btn.setAttribute('onclick', `removeFromPreview('${productId}')`);
  });

  // mark catalog buttons as ADDED
  getAddedIds().forEach(productId => {
    Array.from(document.querySelectorAll('#men, #women, #kids, #babies')
    [0].closest('table').querySelectorAll('.prod-id'))
      .filter(s => s.innerText === productId)
      .forEach(s => {
        const btn = s.closest('.products').querySelector('button');
        if (btn) {
          btn.textContent = 'ADDED';
          btn.disabled = true;
        }
      });
  });
}

window.onload = function () {
  loadPreview();
  document.querySelector('.filter-category button').classList.add('active');
  filtertable();
};