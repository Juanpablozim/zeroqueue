// Estado da aplicacao
var products = [];
var allProducts = [];
var jsonName = 'bd/products.json';

// Elementos DOM
var productForm = document.getElementById('productForm');
var formMessage = document.getElementById('formMessage');
var productsList = document.getElementById('productsList');
var productCount = document.getElementById('productCount');
var searchInput = document.getElementById('searchInput');
var btnClear = document.getElementById('btnClear');
var btnExport = document.getElementById('btnExport');

// Carregar produtos do JSON
function loadProducts() {
    fetch(jsonName)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            products = data.products || [];
            allProducts = products.slice(); // copia para busca
            renderProducts();
            updateProductCount();
        })
        .catch(function(error) {
            console.error('Erro ao carregar produtos:', error);
            productsList.innerHTML = '<p class="empty-state">Erro ao carregar produtos</p>';
        });
}

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

    // Verificar se codigo ja existe
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

    // Criar novo produto
    var newProduct = {
        barcode: barcode,
        name: name,
        price: price,
        weight: weight,
        category: category,
        image: image
    };

    // Adicionar ao array
    products.push(newProduct);
    allProducts = products.slice();

    // Salvar no localStorage (simulacao)
    saveProducts();

    // Atualizar interface
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

    // Preencher formulario
    document.getElementById('barcode').value = product.barcode;
    document.getElementById('name').value = product.name;
    document.getElementById('price').value = product.price;
    document.getElementById('weight').value = product.weight;
    document.getElementById('category').value = product.category;
    document.getElementById('image').value = product.image;

    // Remover produto (sera re-adicionado ao salvar)
    deleteProduct(barcode, true);

    // Scroll para o formulario
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
        allProducts = products.slice();
        renderProducts();
        updateProductCount();
    } else {
        loadProducts();
    }
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
    a.download = jsonName;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('JSON exportado com sucesso!', 'success');
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
btnExport.onclick = exportJSON;
searchInput.oninput = searchProducts;

// Inicializar
loadFromLocalStorage();