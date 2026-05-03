// Data menu
const menuItems = [
    {
        id: 1,
        name: "Espresso",
        category: "coffee",
        price: 15000,
        description: "Kopi espresso klasik yang kental dan intens",
        image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300"
    },
    {
        id: 2,
        name: "Cappuccino",
        category: "coffee",
        price: 25000,
        description: "Espresso dengan susu foam yang lembut",
        image: "https://images.unsplash.com/photo-1572442388296-5fd2f1f8f7be?w=300"
    },
    {
        id: 3,
        name: "Caffe Latte",
        category: "coffee",
        price: 28000,
        description: "Espresso dengan susu panas yang creamy",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300"
    },
    {
        id: 4,
        name: "Americano",
        category: "coffee",
        price: 20000,
        description: "Espresso dengan air panas, less intense",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300"
    },
    {
        id: 5,
        name: "Mocha",
        category: "coffee",
        price: 30000,
        description: "Espresso dengan coklat dan susu",
        image: "https://images.unsplash.com/photo-1564900205-ae2c9508b4f8?w=300"
    },
    {
        id: 6,
        name: "Vanilla Latte",
        category: "coffee",
        price: 32000,
        description: "Latte dengan sentuhan vanilla yang manis",
        image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cda9?w=300"
    },
    {
        id: 7,
        name: "Green Tea Latte",
        category: "noncoffee",
        price: 28000,
        description: "Matcha dengan susu yang creamy",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300"
    },
    {
        id: 8,
        name: "Chocolate Milk",
        category: "noncoffee",
        price: 22000,
        description: "Susu coklat premium yang hangat",
        image: "https://images.unsplash.com/photo-1564900205-ae2c9508b4f8?w=300"
    },
    {
        id: 9,
        name: "Orange Juice",
        category: "noncoffee",
        price: 18000,
        description: "Jus jeruk segar 100%",
        image: "https://images.unsplash.com/photo-1600271886742-f049f45450ea?w=300"
    },
    {
        id: 10,
        name: "Lemon Tea",
        category: "noncoffee",
        price: 15000,
        description: "Teh dengan lemon yang segar",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300"
    },
    {
        id: 11,
        name: "Croissant",
        category: "food",
        price: 18000,
        description: "Croissant butter yang renyah",
        image: "https://images.unsplash.com/photo-1555507036-a1e8e1a47338?w=300"
    },
    {
        id: 12,
        name: "Sandwich",
        category: "food",
        price: 35000,
        description: "Sandwich dengan sayuran dan daging pilihan",
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300"
    },
    {
        id: 13,
        name: "Donut",
        category: "food",
        price: 12000,
        description: "Donut glazed yang manis",
        image: "https://images.unsplash.com/photo-1558962536-f91c82c25ac7?w=300"
    },
    {
        id: 14,
        name: "Muffin",
        category: "food",
        price: 15000,
        description: "Muffin blueberry yang lembut",
        image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cda9?w=300"
    }
];

// Keranjang
let cart = [];
let currentCategory = 'all';

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    renderMenu();
    updateCartUI();
    
    // Set waktu minimum pesanan
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimal 30 menit
    document.getElementById('orderTime').min = now.toISOString().slice(0, 16);
    
    // Inisialisasi fitur dengan gambar dan teks pertama
    updateFeatureText();
});

// Menu terpilih untuk modal
let currentMenuItem = null;
let modalQuantity = 1;

// Render menu
function renderMenu(category = 'all') {
    const menuGrid = document.getElementById('menuGrid');
    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    menuGrid.innerHTML = filteredItems.map(item => `
        <div class="menu-item" data-category="${item.category}" onclick="showMenuModal(${item.id})">
            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <h3 class="menu-item-title">${item.name}</h3>
                <div class="menu-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
            </div>
        </div>
    `).join('');
}

// Filter menu
function filterMenu(category) {
    currentCategory = category;
    
    // Update tombol aktif
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderMenu(category);
}

// Tambah ke keranjang
async function addToCart(itemId) {
    const closed = await isTodayClosed();
    if (closed) {
        showHolidayModal();
        return;
    }

    const item = menuItems.find(i => i.id === itemId);
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification(`${item.name} ditambahkan ke keranjang`, 'success');
}

// Hapus dari keranjang
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
}

// Update jumlah
function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartUI();
        }
    }
}

// Update UI keranjang
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update jumlah keranjang
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update item keranjang
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Keranjang masih kosong</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }
    
    // Update total keranjang
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Toggle sidebar keranjang
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('active');
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Keranjang masih kosong', 'error');
        return;
    }
    
    // Generate ID transaksi
    const transactionId = 'TRX-' + Date.now();
    document.getElementById('transactionIdCheckout').value = transactionId;
    
    // Isi tabel ringkasan pesanan
    const tableBody = document.getElementById('checkoutOrderTableBody');
    const orderTotal = document.getElementById('checkoutOrderTotal');
    
    let tableHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        tableHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    orderTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    
    // Tutup keranjang dan tampilkan modal checkout
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.remove('active');
    
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.remove('active');
}

function processCheckout(event) {
    event.preventDefault();
    
    const transactionId = document.getElementById('transactionIdCheckout').value;
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerPhone = document.getElementById('customerPhone').value;
    
    // Kirim data ke backend
    console.log('Processing order:', {
        transactionId,
        customerName,
        customerAddress,
        customerPhone,
        cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
    
    showNotification(`Pesanan berhasil! ID: ${transactionId}`, 'success');
    
    // Kosongkan keranjang dan tutup modal
    cart = [];
    updateCartUI();
    closeCheckoutModal();
    
    // Reset form
    document.getElementById('customerName').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerPhone').value = '';
}

// Tutup modal checkout saat klik di luar
const checkoutModalElement = document.getElementById('checkoutModal');
if (checkoutModalElement) {
    checkoutModalElement.addEventListener('click', function(e) {
        if (e.target === this) {
            closeCheckoutModal();
        }
    });
}

// Handle order form submission
document.getElementById('orderForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        orderType: document.getElementById('orderType').value,
        orderTime: document.getElementById('orderTime').value,
        notes: document.getElementById('notes').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // Kirim data ke server
    console.log('Order data:', formData);
    
    // Tampilkan pesan sukses
    showNotification('Pesanan berhasil dikirim! Kami akan menghubungi Anda segera.', 'success');
    
    // Kosongkan keranjang dan tutup modal
    cart = [];
    updateCartUI();
    closeOrderModal();
    
    // Reset form
    this.reset();
});

// Tutup modal pesanan
function closeOrderModal() {
    document.getElementById('orderModal')?.classList.remove('active');
}

// Handle order form submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        orderType: document.getElementById('orderType').value,
        orderTime: document.getElementById('orderTime').value,
        notes: document.getElementById('notes').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
    
    // Kirim data ke server
    console.log('Order data:', formData);
    
    // Tampilkan pesan sukses
    showNotification('Pesanan berhasil dikirim! Kami akan menghubungi Anda segera.', 'success');
    
    // Kosongkan keranjang dan tutup modal
    cart = [];
    updateCartUI();
    closeOrderModal();
    
    // Reset form
    this.reset();
});

// Tampilkan notifikasi
function showNotification(message, type = 'info') {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#6f4e37'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    // Tambah animasi
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Scroll ke menu
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// Tampilkan modal pesanan langsung
function showOrderModal() {
    if (cart.length === 0) {
        showNotification('Silakan pilih menu terlebih dahulu dengan mengklik item menu', 'error');
        return;
    }
    
    // Update ringkasan pesanan
    const orderSummary = document.getElementById('orderSummary');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    orderSummary.innerHTML = `
        <h4>Ringkasan Pesanan:</h4>
        ${cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.name} x ${item.quantity}</span>
                <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
            </div>
        `).join('')}
        <hr style="margin: 1rem 0;">
        <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total:</span>
            <span>Rp ${total.toLocaleString('id-ID')}</span>
        </div>
    `;
    
    // Show modal
    document.getElementById('orderModal').classList.add('active');
}

// Tampilkan modal menu
function showMenuModal(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    currentMenuItem = item;
    modalQuantity = 1;
    
    // Update konten modal
    document.getElementById('menuModalTitle').textContent = 'Detail Menu';
    document.getElementById('menuModalImage').src = item.image;
    document.getElementById('menuModalImage').alt = item.name;
    document.getElementById('menuModalName').textContent = item.name;
    document.getElementById('menuModalDescription').textContent = item.description;
    document.getElementById('menuModalPrice').textContent = `Rp ${item.price.toLocaleString('id-ID')}`;
    document.getElementById('modalQuantity').textContent = modalQuantity;
    
    // Show modal
    document.getElementById('menuModal').classList.add('active');
}

// Close menu modal
function closeMenuModal() {
    document.getElementById('menuModal').classList.remove('active');
    currentMenuItem = null;
    modalQuantity = 1;
}

// Tambah jumlah modal
function increaseModalQuantity() {
    modalQuantity++;
    document.getElementById('modalQuantity').textContent = modalQuantity;
}

// Kurang jumlah modal
function decreaseModalQuantity() {
    if (modalQuantity > 1) {
        modalQuantity--;
        document.getElementById('modalQuantity').textContent = modalQuantity;
    }
}

// Tambah ke keranjang dari modal
async function addToCartFromModal() {
    if (!currentMenuItem) return;
    
    const closed = await isTodayClosed();
    if (closed) {
        showHolidayModal();
        return;
    }
    
    for (let i = 0; i < modalQuantity; i++) {
        await addToCart(currentMenuItem.id);
    }
    
    closeMenuModal();
    showNotification(`${currentMenuItem.name} x${modalQuantity} ditambahkan ke keranjang`, 'success');
}

// Tampilkan info
function showInfo() {
    showNotification('Nerai Coffee - Kopi premium untuk hari Anda. Pesan online dan nikmati kesegaran kopi terbaik!', 'info');
}

// Link footer
function showPrivacyPolicy() {
    showNotification('Kebijakan Privasi: Data pribadi Anda kami lindungi dan tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda.', 'info');
}

function showTerms() {
    showNotification('Syarat & Ketentuan: Pesanan yang telah dikonfirmasi tidak dapat dibatalkan. Pembayaran dilakukan saat pengambilan pesanan.', 'info');
}

function showDeveloper() {
    showNotification('Developed with ❤️ for Nerai Coffee', 'info');
}

// Fungsi modal login
function showLogin() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Validasi ke Supabase
    validateLogin(username, password);
}

// Konfigurasi Supabase
const supabaseUrl = 'https://fzrmhmedruvzyvyvgudw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cm1obWVkcnV2enl2eXZndWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDkzODUsImV4cCI6MjA5MzMyNTM4NX0.0HNIWfahho-IswD2xUDcsADo6GgtN7DgBJj-SlznXNE';
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch(e) {
    console.error('Supabase init error:', e);
}

// Load data navbar dari Supabase
async function loadNavbarData() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('identitas')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('Load navbar error:', error);
            return;
        }
        
        if (data && data.length > 0) {
            const row = data[0];
            const namaUsaha = row.nama_usaha || '';
            const shortName = namaUsaha.split(' ')[0] || '';
            const logoUrl = row.logo_usaha;
            const ownerUrl = row.photo_owner;
            const ownerName = row.owner || '';
            const alamat = row.alamat || '';
            const tlp = row.tlp || '';
            const email = row.email || '';

            // Logo
            if (logoUrl) {
                const navLogo = document.getElementById('navLogo');
                const aboutLogo = document.getElementById('aboutLogo');
                if (navLogo) navLogo.src = logoUrl;
                if (aboutLogo) aboutLogo.src = logoUrl;
            }

            // Nama Usaha
            if (namaUsaha) {
                const navBrand = document.getElementById('navBrand');
                const heroBrand = document.getElementById('heroBrand');
                const aboutBrand = document.getElementById('aboutBrand');
                const footerBrand = document.getElementById('footerBrand');
                const footerCopyBrand = document.getElementById('footerCopyBrand');
                const pageTitle = document.getElementById('pageTitle');
                if (navBrand) navBrand.textContent = namaUsaha;
                if (heroBrand) heroBrand.textContent = namaUsaha;
                if (aboutBrand) aboutBrand.textContent = shortName;
                if (footerBrand) footerBrand.textContent = namaUsaha;
                if (footerCopyBrand) footerCopyBrand.textContent = namaUsaha;
                if (pageTitle) pageTitle.textContent = namaUsaha + ' - Pesan Online & Take Away';
            }

            // Span brand di teks about
            const brandNames = document.querySelectorAll('.brand-name');
            brandNames.forEach(el => el.textContent = namaUsaha);
            const brandShorts = document.querySelectorAll('.brand-short');
            brandShorts.forEach(el => el.textContent = shortName);

            // Foto dan nama owner
            if (ownerUrl) {
                const ownerPhoto = document.getElementById('ownerPhoto');
                if (ownerPhoto) ownerPhoto.src = ownerUrl;
            }
            if (ownerName) {
                const ownerLabel = document.querySelector('.owner-label');
                if (ownerLabel) ownerLabel.textContent = ownerName;
            }

            // Alamat & Kontak
            if (alamat) {
                const locationAddress = document.getElementById('locationAddress');
                if (locationAddress) locationAddress.textContent = alamat;
            }
            if (tlp) {
                const phoneEls = document.querySelectorAll('.footer-section p');
                phoneEls.forEach(el => {
                    if (el.querySelector('.fa-phone')) el.innerHTML = `<i class="fas fa-phone"></i> ${tlp}`;
                });
                // Update link WhatsApp
                const waLink = document.getElementById('waLink');
                if (waLink) {
                    const cleanPhone = tlp.replace(/[^0-9]/g, '');
                    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
                    const waText = encodeURIComponent(`Halo ${namaUsaha}, saya tertarik untuk pesanan besar event`);
                    waLink.href = `https://wa.me/${waPhone}?text=${waText}`;
                }
            }
            if (email) {
                const emailEls = document.querySelectorAll('.footer-section p');
                emailEls.forEach(el => {
                    if (el.querySelector('.fa-envelope')) el.innerHTML = `<i class="fas fa-envelope"></i> ${email}`;
                });
            }
        }
    } catch(e) {
        console.error('Load navbar error:', e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadNavbarData();
    checkHolidayStatus();
    loadCurrentLocation();
    loadPaymentAccountsForCheckout();
});

// Matikan klik kanan
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Load lokasi saat ini dari Supabase
async function loadCurrentLocation() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('lokasisekarang')
            .select('nama_lokasi, koordinat')
            .limit(1);
        
        if (error) {
            console.error('Load current location error:', error);
            document.getElementById('locationName').textContent = 'Lokasi tidak tersedia';
            return;
        }
        
        if (data && data.length > 0) {
            const location = data[0];
            console.log('Location data from Supabase:', location);
            document.getElementById('locationName').textContent = location.nama_lokasi;
            
            // Pastikan container terlihat
            const mapContainer = document.getElementById('locationMap');
            if (mapContainer) {
                console.log('Map container height:', mapContainer.offsetHeight);
            }
            
            // Delay untuk pastikan container terlihat
            setTimeout(() => {
                initLocationMap(location.koordinat);
            }, 1000);
        } else {
            document.getElementById('locationName').textContent = 'Belum ada lokasi yang dipilih';
        }
    } catch(e) {
        console.error('Load current location error:', e);
        document.getElementById('locationName').textContent = 'Lokasi tidak tersedia';
    }
}

// Inisialisasi map lokasi
let locationMap;
let locationMarker;

function initLocationMap(koordinat) {
    console.log('initLocationMap called with:', koordinat);
    
    if (typeof L === 'undefined') {
        console.error('Leaflet not loaded');
        return;
    }

    const coords = koordinat.split(',').map(c => parseFloat(c.trim()));
    console.log('Parsed coordinates:', coords);
    
    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        console.error('Invalid coordinates format:', koordinat);
        return;
    }

    const [lat, lng] = coords;
    console.log('Final coordinates - Lat:', lat, 'Lng:', lng);

    const mapContainer = document.getElementById('locationMap');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    // Hapus map jika ada
    if (locationMap) {
        locationMap.remove();
        locationMap = null;
    }

    // Buat map baru
    locationMap = L.map('locationMap').setView([lat, lng], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(locationMap);

    // Tambah marker
    locationMarker = L.marker([lat, lng]).addTo(locationMap)
        .bindPopup(document.getElementById('locationName').textContent)
        .openPopup();

    // Invalidate size setelah marker ditambah
    setTimeout(() => {
        if (locationMap) {
            locationMap.invalidateSize();
            console.log('Map size invalidated');
        }
    }, 200);
        
    console.log('Map initialized successfully');
}

// Cek status libur hari ini
async function checkHolidayStatus() {
    if (!supabaseClient) return;
    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        const { data, error } = await supabaseClient
            .from('libur')
            .select('status')
            .eq('tanggal', dateStr)
            .limit(1);
        
        if (error) {
            console.error('Check holiday error:', error);
            return;
        }
        
        if (data && data.length > 0 && data[0].status === 'Tutup') {
            const modal = document.getElementById('holidayModal');
            if (modal) {
                modal.classList.add('active');
            }
        }
    } catch(e) {
        console.error('Check holiday error:', e);
    }
}

// Tutup modal libur
function closeHolidayModal() {
    const modal = document.getElementById('holidayModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Cek apakah hari ini tutup
async function isTodayClosed() {
    if (!supabaseClient) return false;
    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        const { data, error } = await supabaseClient
            .from('libur')
            .select('status')
            .eq('tanggal', dateStr)
            .limit(1);
        
        if (error) {
            console.error('Check closed error:', error);
            return false;
        }
        
        return data && data.length > 0 && data[0].status === 'Tutup';
    } catch(e) {
        console.error('Check closed error:', e);
        return false;
    }
}

// Tampilkan modal libur
function showHolidayModal() {
    const modal = document.getElementById('holidayModal');
    if (modal) {
        modal.classList.add('active');
    }
}

async function validateLogin(username, password) {
    if (!supabaseClient) {
        showNotification('Gagal terhubung ke server!', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('identitas')
            .select('username, password, owner')
            .eq('username', username)
            .eq('password', password)
            .limit(1);
        
        if (error) {
            console.error('Login error:', error);
            showNotification('Terjadi kesalahan saat login!', 'error');
            return;
        }
        
        if (data && data.length > 0) {
            const adminName = data[0].owner || 'Admin';
            showNotification(`Selamat datang, ${adminName}!`, 'success');
            closeLoginModal();
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showNotification('Username atau Password salah!', 'error');
        }
    } catch(e) {
        console.error('Login error:', e);
        showNotification('Terjadi kesalahan saat login!', 'error');
    }
}

// Tutup modal login saat klik di luar
const loginModal = document.getElementById('loginModal');
if (loginModal) {
    loginModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLoginModal();
        }
    });
}

// Fungsi modal pesanan
function showOrders() {
    const modal = document.getElementById('ordersModal');
    modal.classList.add('active');
}

function closeOrdersModal() {
    const modal = document.getElementById('ordersModal');
    modal.classList.remove('active');
}

// Data akun pembayaran dari Supabase
let paymentAccounts = [];

// Load akun pembayaran dari Supabase untuk checkout
async function loadPaymentAccountsForCheckout() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('akunpembayaran')
            .select('*')
            .order('no', { ascending: true });
        
        if (error) {
            console.error('Load payment accounts error:', error);
            return;
        }
        
        if (data) {
            paymentAccounts = data;
            populatePaymentDropdown(data);
        }
    } catch(e) {
        console.error('Load payment accounts error:', e);
    }
}

// Isi dropdown pembayaran
function populatePaymentDropdown(accounts) {
    const select = document.getElementById('paymentMethod');
    if (!select) return;
    
    // Pertahankan opsi pertama dan cash, hapus lainnya
    select.innerHTML = `
        <option value="">-- Pilih Metode Pembayaran --</option>
        <option value="cash">Bayar Di tempat</option>
    `;
    
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.no;
        option.textContent = account.nama_akun;
        option.dataset.norek = account.norek;
        option.dataset.pemilik = account.nama_pemilik;
        select.appendChild(option);
    });
}

// Tampilkan detail pembayaran
function showPaymentDetails() {
    const select = document.getElementById('paymentMethod');
    const paymentMethod = select.value;
    const detailsBox = document.getElementById('paymentDetailsBox');
    const selectedOption = select.options[select.selectedIndex];
    
    if (paymentMethod === 'cash') {
        // Bayar Di tempat - tampilkan notifikasi
        showNotification('Anda memilih jenis pembayaran dengan metode Bayar Ditempat. pesanan anda akan di proses saat anda sampai di lokasi. Terimakasih', 'info');
        detailsBox.innerHTML = '';
        detailsBox.classList.remove('active');
    } else if (paymentMethod && selectedOption && selectedOption.dataset.norek) {
        // Tampilkan detail dari Supabase
        const namaAkun = selectedOption.textContent;
        const norek = selectedOption.dataset.norek;
        const pemilik = selectedOption.dataset.pemilik;
        
        detailsBox.innerHTML = `
            <h5>${namaAkun}</h5>
            <p>No. Rekening/Referensi: ${norek}<br>Atas Nama: ${pemilik}</p>
            <div class="payment-btn-wrapper">
                <button type="button" class="upload-btn" onclick="uploadPaymentProof()">
                    <i class="fas fa-camera"></i> Kirim Bukti/Screenshot Pembayaran
                </button>
            </div>
        `;
        detailsBox.classList.add('active');
    } else {
        detailsBox.innerHTML = '';
        detailsBox.classList.remove('active');
    }
}

// Upload bukti pembayaran
function uploadPaymentProof() {
    // Buat input file tersembunyi
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                // Tampilkan preview
                const previewContainer = document.getElementById('paymentProofPreview');
                if (!previewContainer) {
                    // Buat container preview jika belum ada
                    const detailsBox = document.getElementById('paymentDetailsBox');
                    const previewDiv = document.createElement('div');
                    previewDiv.id = 'paymentProofPreview';
                    previewDiv.className = 'payment-proof-preview';
                    previewDiv.innerHTML = `
                        <p class="preview-label">Preview Bukti Pembayaran:</p>
                        <img src="${event.target.result}" alt="Bukti Pembayaran">
                        <p class="file-name">${file.name}</p>
                    `;
                    detailsBox.appendChild(previewDiv);
                } else {
                    // Update preview yang ada
                    previewContainer.innerHTML = `
                        <p class="preview-label">Preview Bukti Pembayaran:</p>
                        <img src="${event.target.result}" alt="Bukti Pembayaran">
                        <p class="file-name">${file.name}</p>
                    `;
                }
                showNotification(`Bukti pembayaran "${file.name}" berhasil diupload!`, 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    
    fileInput.click();
}

function checkOrder(event) {
    event.preventDefault();
    const transactionId = document.getElementById('transactionId').value;
    
    // Cek demo - ganti dengan panggilan API
    if (transactionId && transactionId.length > 0) {
        showNotification(`Mencari pesanan dengan ID: ${transactionId}... (Demo)`, 'info');
        closeOrdersModal();
    } else {
        showNotification('Silakan masukkan Id Transaksi!', 'error');
    }
}

// Tutup modal pesanan saat klik di luar
const ordersModal = document.getElementById('ordersModal');
if (ordersModal) {
    ordersModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeOrdersModal();
        }
    });
}

// Toggle visibilitas password
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Tutup keranjang saat klik di luar
document.addEventListener('click', function(e) {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartBtn = document.querySelector('.cart-btn');
    
    // Cek klik pada tombol jumlah
    const isQuantityBtn = e.target.closest('.quantity-btn');
    
    if (!cartSidebar.contains(e.target) && !cartBtn.contains(e.target) && !isQuantityBtn) {
        cartSidebar.classList.remove('active');
    }
});

// Tutup modal saat klik di luar
document.getElementById('orderModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeOrderModal();
    }
});

// Tutup modal menu saat klik di luar
document.getElementById('menuModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeMenuModal();
    }
});

// Fungsionalitas Fitur
let currentSlide = 0;
const totalSlides = 3;
const slideInterval = 5000; // 5 detik
const backgroundImages = [
    'pesan online.jpg',
    'cepat praktis.jpg',
    'kualitas premium.jpg'
];

const featureContent = [
    {
        icon: 'fa-mobile-alt',
        title: 'Pesan Online',
        description: 'Pesan mudah melalui smartphone Anda'
    },
    {
        icon: 'fa-clock',
        title: 'Cepat & Praktis',
        description: 'Tidak perlu antri, pesanan siap diambil'
    },
    {
        icon: 'fa-star',
        title: 'Kualitas Premium',
        description: 'Biji kopi pilihan dengan rasa terbaik'
    }
];

function updateFeatureText() {
    const featuresSection = document.querySelector('.features');
    const featureText = document.getElementById('featureText');
    
    // Update gambar latar fitur
    featuresSection.style.backgroundImage = `url('${backgroundImages[currentSlide]}')`;
    
    // Update teks dengan efek fade
    if (featureText) {
        featureText.style.opacity = '0';
        setTimeout(() => {
            featureText.innerHTML = `
                <i class="fas ${featureContent[currentSlide].icon}"></i>
                <h3>${featureContent[currentSlide].title}</h3>
                <p>${featureContent[currentSlide].description}</p>
            `;
            featureText.style.opacity = '1';
        }, 250);
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateFeatureText();
}

function goToSlide(index) {
    currentSlide = index;
    updateFeatureText();
}

// Auto-slide setiap 5 detik
let autoSlide = setInterval(nextSlide, slideInterval);

// Pause auto-slide saat hover fitur
const featuresSection = document.querySelector('.features');
if (featuresSection) {
    featuresSection.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });
    
    featuresSection.addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextSlide, slideInterval);
    });
}
