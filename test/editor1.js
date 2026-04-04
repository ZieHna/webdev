// ── MENU ──
function showmenu() {
    document.getElementById('menu').classList.toggle('open');
}
document.addEventListener('click', e => {
    if (!e.target.closest('.catandmenu')) {
        document.getElementById('menu').classList.remove('open');
    }
});

// ── PANEL TOGGLE ──
const PANELS = ['products', 'elements', 'text', 'tools', 'upload'];
let activePanel = null;

function toggle(name) {
    if (activePanel === name) {
        document.getElementById('panel-' + name).classList.remove('open');
        document.getElementById('btn-' + name).classList.remove('active');
        activePanel = null;
        return;
    }
    PANELS.forEach(p => {
        document.getElementById('panel-' + p).classList.remove('open');
        document.getElementById('btn-' + p).classList.remove('active');
    });
    document.getElementById('panel-' + name).classList.add('open');
    document.getElementById('btn-' + name).classList.add('active');
    activePanel = name;
}

// ── TOAST ──
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1800);
}

// ── FABRIC CANVAS ──
const wrap = document.getElementById('canvas-wrap');
const canvas = new fabric.Canvas('c', {
    width: wrap.clientWidth - 32,
    height: wrap.clientHeight - 32,
    backgroundColor: '#ffffff'
});
canvas.freeDrawingBrush.color = '#000000';
canvas.freeDrawingBrush.width = 6;

// ── COLORS ──
let currentColor = '#000000';
const colors = ['#000000', '#ffffff', '#E24B4A', '#378ADD', '#5DCAA5', '#EF9F27', '#D85A30', '#534AB7', '#ED93B1', '#639922', '#888888', '#ffdd57'];
const colorRow = document.getElementById('color-row');
colors.forEach(c => {
    const s = document.createElement('div');
    s.className = 'color-swatch' + (c === currentColor ? ' selected' : '');
    s.style.background = c;
    if (c === '#ffffff') s.style.outline = '1px solid #444';
    s.onclick = () => {
        currentColor = c;
        canvas.freeDrawingBrush.color = c;
        document.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
        s.classList.add('selected');
        const sel = canvas.getActiveObject();
        if (sel) { sel.set('fill', c); canvas.renderAll(); }
    };
    colorRow.appendChild(s);
});

// ── TOOLS ──
let currentTool = 'select';
function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('active'));
    if (tool === 'draw') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = currentColor;
        canvas.freeDrawingBrush.width = parseInt(document.getElementById('brush-size').value);
        document.getElementById('tool-draw').classList.add('active');
        showToast('Draw mode — drag to draw');
    } else if (tool === 'erase') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = '#ffffff';
        canvas.freeDrawingBrush.width = 20;
        document.getElementById('tool-erase').classList.add('active');
        showToast('Erase mode');
    } else {
        canvas.isDrawingMode = false;
        document.getElementById('tool-select').classList.add('active');
        showToast('Select mode');
    }
}

function updateBrush() {
    const v = document.getElementById('brush-size').value;
    document.getElementById('brush-val').textContent = v;
    if (canvas.isDrawingMode) canvas.freeDrawingBrush.width = parseInt(v);
}

function deleteSelected() {
    const obj = canvas.getActiveObject();
    if (obj) { canvas.remove(obj); canvas.discardActiveObject(); canvas.renderAll(); }
}

function clearCanvas() {
    if (confirm('Clear everything?')) {
        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();
    }
}

// ── SHAPES ──
function addShape(type) {
    canvas.isDrawingMode = false;
    const cx = canvas.width / 2 - 40, cy = canvas.height / 2 - 40;
    const base = { fill: currentColor, stroke: '#888', strokeWidth: 1, left: cx, top: cy, selectable: true };
    let obj;
    if (type === 'rect') obj = new fabric.Rect({ ...base, width: 80, height: 80, rx: 4 });
    else if (type === 'circle') obj = new fabric.Circle({ ...base, radius: 45 });
    else if (type === 'triangle') obj = new fabric.Triangle({ ...base, width: 80, height: 80 });
    else if (type === 'ellipse') obj = new fabric.Ellipse({ ...base, rx: 60, ry: 35 });
    else if (type === 'line') obj = new fabric.Line([0, 0, 120, 0], { stroke: currentColor, strokeWidth: 3, left: cx, top: cy });
    else if (type === 'diamond') obj = new fabric.Polygon([{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }], { ...base });
    else if (type === 'star') {
        const pts = [];
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? 50 : 22;
            const a = (Math.PI / 5) * i - Math.PI / 2;
            pts.push({ x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) });
        }
        obj = new fabric.Polygon(pts, { ...base });
    } else if (type === 'heart') {
        obj = new fabric.Path('M 50 80 C 10 60,0 30,20 15 C 35 5,50 15,50 25 C 50 15,65 5,80 15 C 100 30,90 60,50 80 Z', { ...base });
    }
    if (obj) { canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll(); showToast('Shape added'); }
}

// ── TEXT ──
function addText(type) {
    canvas.isDrawingMode = false;
    const map = {
        heading: { text: 'Heading Text', fontSize: 32, fontWeight: 'bold' },
        subheading: { text: 'Subheading Text', fontSize: 20, fontWeight: '600' },
        body: { text: 'Body text here', fontSize: 14, fontWeight: 'normal' }
    };
    const c = map[type];
    const obj = new fabric.IText(c.text, {
        left: canvas.width / 2 - 80,
        top: canvas.height / 2 - 20,
        fontSize: c.fontSize,
        fontWeight: c.fontWeight,
        fill: currentColor,
        fontFamily: 'Courier New, monospace',
        editable: true
    });
    canvas.add(obj); canvas.setActiveObject(obj); canvas.renderAll();
    showToast('Double click text to edit');
    toggle('text');
}

// ── UPLOAD IMAGE ──
function uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = f => {
        fabric.Image.fromURL(f.target.result, img => {
            const scale = Math.min((canvas.width * 0.6) / img.width, (canvas.height * 0.6) / img.height);
            img.set({
                left: canvas.width / 2 - (img.width * scale) / 2,
                top: canvas.height / 2 - (img.height * scale) / 2,
                scaleX: scale, scaleY: scale
            });
            canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
            showToast('Image uploaded!');
            toggle('upload');
        });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

// ── DRAG & DROP ──
wrap.addEventListener('dragover', e => e.preventDefault());
wrap.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = f => {
        fabric.Image.fromURL(f.target.result, img => {
            const scale = Math.min((canvas.width * 0.6) / img.width, (canvas.height * 0.6) / img.height);
            img.set({
                left: canvas.width / 2 - (img.width * scale) / 2,
                top: canvas.height / 2 - (img.height * scale) / 2,
                scaleX: scale, scaleY: scale
            });
            canvas.add(img); canvas.setActiveObject(img); canvas.renderAll();
            showToast('Image dropped!');
        });
    };
    reader.readAsDataURL(file);
});

// ── KEYBOARD DELETE ──
document.addEventListener('keydown', e => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && !canvas.isEditing) deleteSelected();
});

// ── ADD PRODUCT IMAGE TO CANVAS (click on product card in panel) ──
// Uses a plain HTMLImageElement to bypass file:// CORS restrictions that
// block fabric.Image.fromURL on local pages.
function addProductToCanvas(imgSrc, productName) {
    canvas.isDrawingMode = false;

    const htmlImg = new Image();
    htmlImg.onload = function () {
        const fabricImg = new fabric.Image(htmlImg);
        const maxW = canvas.width * 0.5;
        const maxH = canvas.height * 0.5;
        const scale = Math.min(maxW / fabricImg.width, maxH / fabricImg.height);
        fabricImg.set({
            left: canvas.width / 2 - (fabricImg.width * scale) / 2,
            top: canvas.height / 2 - (fabricImg.height * scale) / 2,
            scaleX: scale,
            scaleY: scale,
            selectable: true
        });
        fabricImg.productName = productName;
        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
        showToast(productName + ' added to canvas!');
        setTool('select');
        toggle('products');
    };
    htmlImg.onerror = function () {
        showToast('Could not load image — check asset path');
    };
    // Setting crossOrigin before src is fine for relative paths;
    // for file:// it just falls back silently since we're using the element directly.
    htmlImg.src = imgSrc;
}

// ── LOAD PRODUCTS FROM LOCALSTORAGE ──
window.onload = function () {
    const preview = document.getElementById('preview');
    const saved = localStorage.getItem('previewProducts');

    if (saved) {
        const temp = document.createElement('table');
        temp.innerHTML = saved;
        const products = temp.querySelectorAll('.products');
        const itemsPerRow = 2;
        let tr;

        products.forEach((product, index) => {
            if (index % itemsPerRow === 0) {
                tr = document.createElement('tr');
                preview.appendChild(tr);
            }
            const td = document.createElement('td');

            // hide the X button in the panel view
            const btn = product.querySelector('button');
            if (btn) btn.style.display = 'none';

            const clone = product.cloneNode(true);

            // get image src from the ORIGINAL product node (not clone) so src is intact
            const origImg = product.querySelector('img');
            const imgSrc = origImg ? origImg.getAttribute('src') || origImg.src : '';

            // get product name — use textContent which works on detached nodes
            const nameEl = product.querySelector('span:not(.prod-id)');
            // strip out the hidden prod-id text if it got mixed in
            let productName = 'Product';
            if (nameEl) {
                const prodIdEl = nameEl.querySelector('.prod-id');
                if (prodIdEl) prodIdEl.remove();
                productName = nameEl.textContent.trim() || 'Product';
            }

            // make the whole card clickable to add image to canvas
            clone.style.cursor = 'pointer';
            clone.title = 'Click to add to canvas';
            clone.addEventListener('click', function () {
                if (imgSrc) {
                    addProductToCanvas(imgSrc, productName);
                }
            });

            td.appendChild(clone);
            tr.appendChild(td);
        });
    }

    setTool('select');

    // ── ADD CHECKOUT BUTTON ──
    const checkoutBtn = document.createElement('button');
    checkoutBtn.className = 'checkout-btn';
    checkoutBtn.textContent = 'CHECKOUT →';
    checkoutBtn.onclick = goToCheckout;
    document.body.appendChild(checkoutBtn);
};

// ── SAVE CANVAS STATE & GO TO CHECKOUT ──
function goToCheckout() {
    // Save canvas as image data URLs and product info to localStorage
    const canvasDataURL = canvas.toDataURL({ format: 'png', multiplier: 1 });

    // Try to collect product names from canvas objects
    const products = [];
    canvas.getObjects().forEach(obj => {
        if (obj.productName) {
            products.push(obj.productName);
        }
    });

    const checkoutData = {
        canvasImage: canvasDataURL,
        products: products,
        timestamp: Date.now()
    };

    // Save to localStorage for checkout page
    const existing = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
    existing.push(checkoutData);
    localStorage.setItem('checkoutItems', JSON.stringify(existing));

    window.location.href = 'checkout.html';
}
