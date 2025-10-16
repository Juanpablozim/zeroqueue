// Estado do carrinho
var cart = [];
var productsDatabase = {}; // Será preenchido a partir do localStorage

// Elementos DOM
var barcodeInput = document.getElementById('barcodeInput');
var btnAdd = document.getElementById('btnAdd');
var message = document.getElementById('message');
var totalValue = document.getElementById('totalValue');
var itemCount = document.getElementById('itemCount');
var emptyCart = document.getElementById('emptyCart');
var cartItems = document.getElementById('cartItems');
var checkoutSection = document.getElementById('checkoutSection');
var checkoutTotal = document.getElementById('checkoutTotal');
var btnCheckout = document.getElementById('btnCheckout');

// Carregar base de produtos do localStorage ou criar uma nova
function loadProductsFromStorage() {
    var stored = localStorage.getItem('autocart_products');
    var productsArray = [];

    if (stored) {
        var data = JSON.parse(stored);
        productsArray = data.products || [];
    } else {
        // Se não houver nada no storage, cria uma lista padrão
        productsArray = [
            { "barcode": "7891234567890", "name": "Arroz Tio João 5kg", "price": 25.90, "weight": 5.0, "category": "Alimentos", "image": "" },
            { "barcode": "7891234567891", "name": "Feijão Camil 1kg", "price": 8.50, "weight": 1.0, "category": "Alimentos", "image": "" },
            { "barcode": "7891234567892", "name": "Açucar União 1kg", "price": 4.20, "weight": 1.0, "category": "Alimentos", "image": "" },
            { "barcode": "7891234567893", "name": "Café Pilão 500g", "price": 12.80, "weight": 0.5, "category": "Bebidas", "image": "" },
            { "barcode": "7891234567894", "name": "Óleo de Soja 900ml", "price": 6.90, "weight": 0.9, "category": "Alimentos", "image": "" },
            { "barcode": "7891234567895", "name": "Macarrão Barilla 500g", "price": 7.50, "weight": 0.5, "category": "Alimentos", "image": "" },
            { "barcode": "7891234567896", "name": "Leite Integral 1L", "price": 5.80, "weight": 1.03, "category": "Laticinios", "image": "" },
            { "barcode": "7891234567897", "name": "Sabão em Po 1kg", "price": 11.90, "weight": 1.0, "category": "Limpeza", "image": "" },
            { "barcode": "7891234567898", "name": "Papel Higienico 12un", "price": 18.50, "weight": 2.0, "category": "Higiene", "image": "" },
            { "barcode": "7891234567899", "name": "Refrigerante 2L", "price": 8.90, "weight": 2.1, "category": "Bebidas", "image": "" }
        ];
        // Salva a lista padrão para futuras visitas
        localStorage.setItem('autocart_products', JSON.stringify({ products: productsArray }));
    }

    // Converte o array em um objeto indexado por barcode para busca rápida
    for (var i = 0; i < productsArray.length; i++) {
        var product = productsArray[i];
        productsDatabase[product.barcode] = product;
    }
    console.log('Base de produtos carregada:', Object.keys(productsDatabase).length, 'itens.');
}


// Adicionar produto por codigo de barras
function addProductByBarcode(code) {
    if (!code.trim()) return;

    var product = productsDatabase[code];

    if (!product) {
        showMessage('Produto nao encontrado', 'error');
        return;
    }

    addToCart(product);
    showMessage('Produto ' + product.name + ' adicionado!', 'success');
    barcodeInput.value = '';

    setTimeout(function() {
        showMessage('', '');
    }, 2000);
}

// Adicionar ao carrinho
function addToCart(product) {
    var existingItem = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].barcode === product.barcode) {
            existingItem = cart[i];
            break;
        }
    }

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            weight: product.weight,
            quantity: 1
        });
    }

    updateCartDisplay();
}

// Atualizar quantidade
function updateQuantity(barcode, change) {
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].barcode === barcode) {
            cart[i].quantity = Math.max(0, cart[i].quantity + change);
            if (cart[i].quantity === 0) {
                removeItem(barcode);
                return;
            }
            break;
        }
    }
    updateCartDisplay();
}

// Remover item
function removeItem(barcode) {
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].barcode !== barcode) {
            newCart.push(cart[i]);
        }
    }
    cart = newCart;
    updateCartDisplay();
}

// Atualizar exibicao do carrinho
function updateCartDisplay() {
    var total = 0;
    var totalItems = 0;

    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
        totalItems += cart[i].quantity;
    }

    totalValue.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    checkoutTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    itemCount.textContent = totalItems;

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.innerHTML = '';
        checkoutSection.style.display = 'none';
    } else {
        emptyCart.style.display = 'none';
        checkoutSection.style.display = 'block';
        renderCartItems();
    }
}

// Renderizar itens do carrinho
function renderCartItems() {
    var html = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var subtotal = item.price * item.quantity;
        html += '<div class="cart-item">';
        html += '<div class="item-info">';
        html += '<div class="item-name">' + item.name + '</div>';
        html += '<div class="item-code">Codigo: ' + item.barcode + '</div>';
        html += '<div class="item-price">';
        html += 'R$ ' + item.price.toFixed(2).replace('.', ',') + ' x ' + item.quantity + ' = ';
        html += 'R$ ' + subtotal.toFixed(2).replace('.', ',');
        html += '</div></div>';
        html += '<div class="item-controls">';
        html += '<button class="qty-btn" onclick="updateQuantity(\'' + item.barcode + '\', -1)">-</button>';
        html += '<div class="qty-display">' + item.quantity + '</div>';
        html += '<button class="qty-btn" onclick="updateQuantity(\'' + item.barcode + '\', 1)">+</button>';
        html += '<button class="btn-remove" onclick="removeItem(\'' + item.barcode + '\')">X</button>';
        html += '</div></div>';
    }
    cartItems.innerHTML = html;
}

// Mostrar mensagem
function showMessage(text, type) {
    message.textContent = text;
    message.className = 'message';
    if (type) {
        message.classList.add(type);
    }
}

// Handler para tecla Enter
function handleKeyPress(e) {
    var keycode = e.keyCode || e.which;
    if (keycode === 13) {
        addProductByBarcode(barcodeInput.value);
    }
}

// Handler para botao adicionar
function handleAddClick() {
    addProductByBarcode(barcodeInput.value);
}

// Handler para checkout
function handleCheckout() {
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
    }
    alert('Finalizando compra de R$ ' + total.toFixed(2));
}

// Event listeners
btnAdd.onclick = handleAddClick;
barcodeInput.onkeypress = handleKeyPress;
btnCheckout.onclick = handleCheckout;

// Inicializar a aplicação
loadProductsFromStorage();
barcodeInput.focus();