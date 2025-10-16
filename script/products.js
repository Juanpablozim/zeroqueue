// Estado da aplicacao
var products = [];
var allProducts = [];

// Elementos DOM
var productForm = document.getElementById('productForm');
var formMessage = document.getElementById('formMessage');
var productsList = document.getElementById('productsList');
var productCount = document.getElementById('productCount');
var searchInput = document.getElementById('searchInput');
var btnClear = document.getElementById('btnClear');

// Renderizar lista de produtos
function renderProducts() {
    if (products.length === 0) {
        productsList.innerHTML = '<p class="empty-state">Nenhum produto cadastrado</p>';
        return;
    }

    var html = '';
    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        html += '<div class="product-card">';
        html += '<div class="product-info">';
        html += '<div class="product-name">' + product.name + '</div>';
        html += '<div class="product-details">Codigo: ' + product.barcode + '</div>';
        html += '<div class="product-details">Peso: ' + product.weight + 'kg | Categoria: ' + product.category + '</div>';
        html += '<div class="product-price">R$ ' + product.price.toFixed(2) + '</div>';
        html += '</div>';
        html += '<div class="product-actions">';
        html += '<button class="btn-edit" onclick="editProduct(\'' + product.barcode + '\')">✏️</button>';
        html += '<button class="btn-delete" onclick="deleteProduct(\'' + product.barcode + '\')">🗑️</button>';
        html += '</div>';
        html += '</div>';
    }
    productsList.innerHTML = html;
}

// Atualizar contador
function updateProductCount() {
    productCount.textContent = products.length;
}

// Adicionar novo produto
function addProduct(event) {
    event.preventDefault();

    var barcode = document.getElementById('barcode').value.trim();
    var name = document.getElementById('name').value.trim();
    var price = parseFloat(document.getElementById('price').value);
    var weight = parseFloat(document.getElementById('weight').value);
    var category = document.getElementById('category').value;
    var image = document.getElementById('image').value.trim();

    var exists = false;
    for (var i = 0; i < products.length; i++) {
        if (products[i].barcode === barcode) {
            exists = true;
            break;
        }
    }

    if (exists) {
        showMessage('Codigo de barras ja cadastrado!', 'error');
        return;
    }

    var newProduct = {
        barcode: barcode,
        name: name,
        price: price,
        weight: weight,
        category: category,
        image: image
    };

    products.push(newProduct);
    allProducts = products.slice();

    saveProducts();

    renderProducts();
    updateProductCount();
    productForm.reset();
    showMessage('Produto adicionado com sucesso!', 'success');

    setTimeout(function() {
        hideMessage();
    }, 3000);
}

// Editar produto
function editProduct(barcode) {
    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].barcode === barcode) {
            product = products[i];
            break;
        }
    }

    if (!product) return;

    document.getElementById('barcode').value = product.barcode;
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('weight').value = product.weight;
    document.getElementById('category').value = product.category;
    document.getElementById('image').value = product.image;

    deleteProduct(barcode, true);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Deletar produto
function deleteProduct(barcode, silent) {
    if (!silent) {
        var confirmDelete = confirm('Deseja realmente excluir este produto?');
        if (!confirmDelete) return;
    }

    var newProducts = [];
    for (var i = 0; i < products.length; i++) {
        if (products[i].barcode !== barcode) {
            newProducts.push(products[i]);
        }
    }

    products = newProducts;
    allProducts = products.slice();

    saveProducts();
    renderProducts();
    updateProductCount();

    if (!silent) {
        showMessage('Produto excluido com sucesso!', 'success');
        setTimeout(function() {
            hideMessage();
        }, 3000);
    }
}

// Buscar produtos
function searchProducts() {
    var query = searchInput.value.toLowerCase().trim();

    if (!query) {
        products = allProducts.slice();
        renderProducts();
        return;
    }

    var filtered = [];
    for (var i = 0; i < allProducts.length; i++) {
        var product = allProducts[i];
        if (product.name.toLowerCase().indexOf(query) !== -1 ||
            product.barcode.indexOf(query) !== -1 ||
            product.category.toLowerCase().indexOf(query) !== -1) {
            filtered.push(product);
        }
    }

    products = filtered;
    renderProducts();
}

// Salvar produtos no localStorage
function saveProducts() {
    var data = {
        products: products
    };
    localStorage.setItem('autocart_products', JSON.stringify(data));
}

// Carregar produtos do localStorage
function loadFromLocalStorage() {
    var stored = localStorage.getItem('autocart_products');
    if (stored) {
        var data = JSON.parse(stored);
        products = data.products || [];
    } else {
        products = [
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
        saveProducts();
    }
    allProducts = products.slice();
    renderProducts();
    updateProductCount();
}


// Exportar JSON
function exportJSON() {
    var data = {
        products: products
    };
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'products-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Backup JSON exportado com sucesso!', 'success');
    setTimeout(function() {
        hideMessage();
    }, 3000);
}

// Limpar formulario
function clearForm() {
    productForm.reset();
    hideMessage();
}

// Mostrar mensagem
function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = 'message ' + type;
}

// Esconder mensagem
function hideMessage() {
    formMessage.className = 'message';
}

// Event listeners
productForm.onsubmit = addProduct;
btnClear.onclick = clearForm;
searchInput.oninput = searchProducts;

// Inicializar
loadFromLocalStorage();