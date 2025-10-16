// Configuracao da API
var API_URL = 'http://192.168.1.100:5000/api';
var jsonName = 'bd/products.json';
var USE_LOCAL_JSON = true; // true = usa products.json, false = usa API


// Estado do carrinho
var cart = [];
var productsDatabase = {};

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

// Carregar produtos do arquivo JSON
function loadProducts() {
    fetch(jsonName)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            // Converter array em objeto indexado por barcode
            for (var i = 0; i < data.products.length; i++) {
                var product = data.products[i];
                productsDatabase[product.barcode] = product;
            }
            console.log('Produtos carregados:', Object.keys(productsDatabase).length);
        })
        .catch(function(error) {
            console.error('Erro ao carregar produtos:', error);
            showMessage('Erro ao carregar base de produtos', 'error');
        });
}

// Inicializar: carregar produtos
loadProducts();

// Adicionar produto por codigo de barras
function addProductByBarcode(code) {
    if (!code.trim()) return;

    btnAdd.disabled = true;
    btnAdd.textContent = 'Buscando...';
    showMessage('', '');

    if (USE_LOCAL_JSON) {
        // Modo local: busca no JSON carregado
        setTimeout(function() {
            var product = productsDatabase[code];
            if (!product) {
                showMessage('Produto nao encontrado', 'error');
                btnAdd.disabled = false;
                btnAdd.textContent = 'Adicionar';
                return;
            }

            addToCart(product);
            showMessage('Produto ' + product.name + ' adicionado!', 'success');
            barcodeInput.value = '';

            setTimeout(function() {
                showMessage('', '');
            }, 3000);

            btnAdd.disabled = false;
            btnAdd.textContent = 'Adicionar';
        }, 300);
    } else {
        // Modo API: busca no backend
        fetch(API_URL + '/product/' + code)
            .then(function(response) {
                if (!response.ok) throw new Error('Produto nao encontrado');
                return response.json();
            })
            .then(function(product) {
                addToCart(product);
                showMessage('Produto ' + product.name + ' adicionado!', 'success');
                barcodeInput.value = '';
                setTimeout(function() { showMessage('', ''); }, 3000);
            })
            .catch(function(error) {
                showMessage('Produto nao encontrado', 'error');
            })
            .finally(function() {
                btnAdd.disabled = false;
                btnAdd.textContent = 'Adicionar';
            });
    }
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
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].quantity;
    }

    totalValue.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    checkoutTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    itemCount.textContent = cart.length;

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
        html += 'R$ ' + item.price.toFixed(2) + ' x ' + item.quantity + ' = ';
        html += 'R$ ' + subtotal.toFixed(2);
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
    // Aqui voce implementaria a logica de checkout real
}

// Event listeners
btnAdd.onclick = handleAddClick;
barcodeInput.onkeypress = handleKeyPress;
btnCheckout.onclick = handleCheckout;

// Auto-focus no input ao carregar
barcodeInput.focus();