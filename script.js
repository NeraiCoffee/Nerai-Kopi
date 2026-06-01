// Data menu
let menuItems = [];
let products = [];
 
// Load products from Supabase
async function loadProductsFromSupabase() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('produk')
            .select('*');
 
        if (error) {
            console.error('Load products error:', error);
            return;
        }
 
        if (data) {
            products = data;
            // Convert to menuItems format
            menuItems = data.map(product => ({
                id: product.id,
                name: product.nama_produk,
                category: product.kategori,
                price: parseFloat(product.harga),
                description: product.deskripsi || '',
                image: product.photo || 'https://via.placeholder.com/300x200?text=No+Image'
            }));
            renderMenu(currentCategory);
        }
    } catch(e) {
        console.error('Load products error:', e);
    }
}
 
// Keranjang
let cart = [];
let currentCategory = 'all';
 
// Update Date Time
function updateDateTime() {
    const now = new Date();
    
    // Array nama hari dalam Bahasa Indonesia
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    // Get day name
    const dayName = days[now.getDay()];
    
    // Get date in format: DD Bulan YYYY
    const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    
    // Get time in format: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    
    // Update DOM elements
    const dayElement = document.getElementById('currentDay');
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    if (dayElement) dayElement.textContent = dayName;
    if (dateElement) dateElement.textContent = date;
    if (timeElement) timeElement.textContent = time;
}
 
// Check Operating Hours from Supabase
async function checkOperatingHours() {
    if (!supabaseClient) return true; // If no Supabase, allow by default
    
    try {
        const { data, error } = await supabaseClient
            .from('jamoperasional')
            .select('*')
            .limit(1);
 
        if (error) {
            console.error('Check operating hours error:', error);
            return true; // Allow if error
        }
 
        if (data && data.length > 0) {
            const jamOperasional = data[0];
            const buka = jamOperasional.buka;
            const tutup = jamOperasional.tutup;
            
            if (!buka || !tutup) return true; // Allow if no time set
            
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            // Check if current time is within operating hours
            if (currentTime >= buka && currentTime <= tutup) {
                return true;
            } else {
                return false;
            }
        }
        
        return true; // Allow if no data
    } catch(e) {
        console.error('Check operating hours error:', e);
        return true; // Allow if error
    }
}
 
// Show Outside Hours Modal
async function showOutsideHoursModal() {
    // Fetch operating hours data
    let jamBuka = '-';
    let jamTutup = '-';
    
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('jamoperasional')
                .select('*')
                .limit(1);
 
            if (!error && data && data.length > 0) {
                jamBuka = data[0].buka || '-';
                jamTutup = data[0].tutup || '-';
            }
        } catch(e) {
            console.error('Fetch operating hours error:', e);
        }
    }
 
    const modal = document.createElement('div');
    modal.className = 'outside-hours-modal';
    modal.innerHTML = `
        <div class="outside-hours-modal-content">
            <div class="outside-hours-icon">
                <i class="fas fa-clock"></i>
            </div>
            <h3>Maaf</h3>
            <p>Anda memesan di luar jam operasional. Silahkan pesan kembali saat Nerai sudah buka</p>
            <p class="jam-operasional-info">Jam Operasional: ${jamBuka} - ${jamTutup}</p>
            <button class="outside-hours-btn" onclick="this.closest('.outside-hours-modal').remove()">Tutup</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add styles
    if (!document.getElementById('outside-hours-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'outside-hours-modal-styles';
        style.textContent = `
            .outside-hours-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .outside-hours-modal-content {
                background: white;
                border-radius: 20px;
                padding: 2.5rem;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .outside-hours-icon {
                width: 80px;
                height: 80px;
                background: #ffebee;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 2.5rem;
                color: #e57373;
            }
            .outside-hours-modal-content h3 {
                color: #333;
                margin-bottom: 0.8rem;
                font-size: 1.5rem;
            }
            .outside-hours-modal-content p {
                color: #666;
                margin-bottom: 1.5rem;
                font-size: 1rem;
                line-height: 1.5;
            }
            .jam-operasional-info {
                color: #6f4e37;
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 1.5rem;
            }
            .outside-hours-btn {
                background: #6f4e37;
                color: white;
                border: none;
                padding: 0.8rem 2rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: background 0.3s ease;
            }
            .outside-hours-btn:hover {
                background: #5a3e2b;
            }
        `;
        document.head.appendChild(style);
    }
}
 
// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromSupabase();
    updateCartUI();
    
    // Update date time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
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
        <div class="menu-item" data-category="${item.category}" onclick="showMenuModal('${item.id}')">
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
    // Isi tanggal Checkout otomatis sesuai hari ini
    const now = new Date();
    const checkoutDateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const checkoutDateEl = document.getElementById('checkoutDate');
    if (checkoutDateEl) checkoutDateEl.value = checkoutDateStr;
    
    // Isi tabel ringkasan pesanan
    const tableBody = document.getElementById('checkoutOrderTableBody');
    const orderTotal = document.getElementById('checkoutOrderTotal');
    
    let tableHTML = '';
    let total = 0;
    let sequenceNumber = 1;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        const orderId = `${transactionId}.${sequenceNumber}`;
        
        tableHTML += `
            <tr>
                <td>${orderId}</td>
                <td>${transactionId}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
            </tr>
        `;
        
        sequenceNumber++;
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
 
async function processCheckout(event) {
    event.preventDefault();
 
    const transactionId = document.getElementById('transactionIdCheckout').value;
    const customerName = document.getElementById('customerNameCheckout').value;
    const customerAddress = document.getElementById('customerAddressCheckout').value;
    const customerPhone = document.getElementById('customerPhoneCheckout').value;
 
    const totalValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
 
    // Ambil metode pembayaran (teks) dan bukti bayar jika ada
    const paymentSelect = document.getElementById('paymentMethod');
    const jenisBayar = paymentSelect?.options[paymentSelect?.selectedIndex]?.text || '';
    const buktiEl = document.querySelector('#paymentProofPreview .payment-url a');
    const buktiBayar = buktiEl ? buktiEl.href : '';
 
    // Persiapkan payload untuk Supabase
    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const payload = {
        id: transactionId,
        nama: customerName,
        alamat: customerAddress,
        tlp: customerPhone,
        tanggal: todayDate,
        total: String(totalValue),
        jenis_bayar: jenisBayar,
        bukti_bayar: buktiBayar,
        status: 'On Proses'
    };
 
    // Simpan identitas transaksi ke tabel `customer_sementara` di Supabase
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('customer_sementara')
                .insert([payload]);
 
            if (error) {
                console.error('Supabase insert error:', error);
                showNotification('Gagal menyimpan identitas transaksi. Coba lagi.', 'error');
                return; // hentikan proses jika gagal menyimpan
            } else {
                console.log('Identitas transaksi disimpan:', data);
                showNotification('Identitas transaksi tersimpan.', 'success');
            }
        } catch (e) {
            console.error('Exception saat insert Supabase:', e);
            showNotification('Terjadi kesalahan saat menyimpan data.', 'error');
            return;
        }
    } else {
        console.warn('Supabase client tidak tersedia, melewatkan penyimpanan.');
    }
 
    // Show invoice & confirmation
    showOrderConfirmationNotification();
    generateInvoice(transactionId, customerName, customerAddress, customerPhone);
 
    // Kosongkan keranjang dan tutup modal
    cart = [];
    updateCartUI();
    closeCheckoutModal();
 
    // Reset form (checkout fields)
    const checkoutFormEl = document.getElementById('checkoutModal');
    if (checkoutFormEl) {
        const nameEl = document.getElementById('customerNameCheckout');
        const addrEl = document.getElementById('customerAddressCheckout');
        const phoneEl = document.getElementById('customerPhoneCheckout');
        if (nameEl) nameEl.value = '';
        if (addrEl) addrEl.value = '';
        if (phoneEl) phoneEl.value = '';
    }
}
 
// Show Order Confirmation Notification
function showOrderConfirmationNotification() {
    const modal = document.createElement('div');
    modal.className = 'order-confirmation-modal';
    modal.innerHTML = `
        <div class="order-confirmation-content">
            <div class="order-confirmation-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Pesanan Terkirim</h3>
            <p>Pesanan anda sudah terkirim, mohon bersabar kami akan menghubungi anda jika pesanan sudah siap di ambil</p>
            <button class="order-confirmation-btn" onclick="this.closest('.order-confirmation-modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add styles
    if (!document.getElementById('order-confirmation-styles')) {
        const style = document.createElement('style');
        style.id = 'order-confirmation-styles';
        style.textContent = `
            .order-confirmation-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                animation: fadeIn 0.3s ease;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .order-confirmation-content {
                background: white;
                border-radius: 20px;
                padding: 2.5rem;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                animation: slideUp 0.3s ease;
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .order-confirmation-icon {
                width: 80px;
                height: 80px;
                background: #e8f5e9;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
                font-size: 2.5rem;
                color: #4caf50;
            }
            .order-confirmation-content h3 {
                color: #333;
                margin-bottom: 0.8rem;
                font-size: 1.5rem;
            }
            .order-confirmation-content p {
                color: #666;
                margin-bottom: 1.5rem;
                font-size: 1rem;
                line-height: 1.5;
            }
            .order-confirmation-btn {
                background: #6f4e37;
                color: white;
                border: none;
                padding: 0.8rem 2rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: background 0.3s ease;
            }
            .order-confirmation-btn:hover {
                background: #5a3e2b;
            }
        `;
        document.head.appendChild(style);
    }
}
 
// Generate and Download Invoice
async function generateInvoice(transactionId, customerName, customerAddress, customerPhone) {
    console.log('Generating invoice for transaction:', transactionId);
    console.log('Cart items:', cart);
    
    // Fetch logo from Supabase
    let logoUrl = '';
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('identitas')
                .select('logo_usaha')
                .limit(1);
            
            if (!error && data && data.length > 0 && data[0].logo_usaha) {
                logoUrl = data[0].logo_usaha;
                console.log('Logo URL from Supabase:', logoUrl);
            }
        } catch(e) {
            console.error('Error fetching logo:', e);
        }
    }
    
    // Create invoice HTML
    const invoiceHTML = `
        <div class="invoice-container" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white; color: #333;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 3px solid #6f4e37; padding-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: 80px; height: 80px; object-fit: contain;">` : ''}
                    <div>
                        <h1 style="color: #6f4e37; margin: 0; font-size: 28px;">Nerai Coffee</h1>
                        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Kopi Premium untuk Hari Anda</p>
                    </div>
                </div>
                <div style="text-align: right;">
                    <h2 style="color: #333; margin: 0; font-size: 24px;">INVOICE</h2>
                    <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">ID: ${transactionId}</p>
                    <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
 
            <!-- Business Info -->
            <div style="margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                <h3 style="color: #6f4e37; margin: 0 0 10px 0; font-size: 16px;">Informasi Usaha</h3>
                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Nama:</strong> Nerai Coffee</p>
                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Alamat:</strong> Jl. Contoh No. 123, Kota</p>
                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Telepon:</strong> +62 812-3456-7890</p>
            </div>
 
            <!-- Customer Info -->
            <div style="margin-bottom: 30px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
                <h3 style="color: #6f4e37; margin: 0 0 10px 0; font-size: 16px;">Informasi Pelanggan</h3>
                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Nama:</strong> ${customerName}</p>
                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Alamat:</strong> ${customerAddress}</p>
                <p style="color: #333; margin: 5px 0; font-size: 14px;"><strong>Telepon:</strong> ${customerPhone}</p>
            </div>
 
            <!-- Order Items -->
            <div style="margin-bottom: 30px;">
                <h3 style="color: #6f4e37; margin: 0 0 15px 0; font-size: 16px;">Detail Pesanan</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #6f4e37; color: white;">
                            <th style="padding: 12px; text-align: left; border: 1px solid #6f4e37;">Id Pesanan</th>
                            <th style="padding: 12px; text-align: left; border: 1px solid #6f4e37;">Id Transaksi</th>
                            <th style="padding: 12px; text-align: left; border: 1px solid #6f4e37;">Produk</th>
                            <th style="padding: 12px; text-align: center; border: 1px solid #6f4e37;">Qty</th>
                            <th style="padding: 12px; text-align: right; border: 1px solid #6f4e37;">Harga</th>
                            <th style="padding: 12px; text-align: right; border: 1px solid #6f4e37;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map((item, index) => {
                            const orderId = `${transactionId}.${index + 1}`;
                            const subtotal = item.price * item.quantity;
                            return `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 13px;">${orderId}</td>
                                    <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 13px;">${transactionId}</td>
                                    <td style="padding: 10px; border: 1px solid #e0e0e0; font-size: 13px;">${item.name}</td>
                                    <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center; font-size: 13px;">${item.quantity}</td>
                                    <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-size: 13px;">Rp ${item.price.toLocaleString('id-ID')}</td>
                                    <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right; font-size: 13px;">Rp ${subtotal.toLocaleString('id-ID')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f9f9f9; font-weight: bold;">
                            <td colspan="5" style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-size: 14px;">Total:</td>
                            <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-size: 14px; color: #6f4e37;">Rp ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('id-ID')}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
 
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
                <p style="color: #666; margin: 0; font-size: 12px;">Terima kasih telah berbelanja di Nerai Coffee!</p>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 12px;">Simpan invoice ini sebagai bukti pesanan Anda.</p>
            </div>
        </div>
    `;
 
    // Create a temporary div to hold the invoice HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = invoiceHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.background = 'white';
    document.body.appendChild(tempDiv);
 
    // Check if html2pdf is available
    if (typeof html2pdf === 'undefined') {
        console.error('html2pdf library is not loaded');
        alert('Library PDF tidak tersedia. Mohon refresh halaman dan coba lagi.');
        document.body.removeChild(tempDiv);
        return;
    }
 
    // Wait for images to load
    const images = tempDiv.querySelectorAll('img');
    const imageLoadPromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve;
            }
        });
    });
 
    try {
        // Wait for all images to load
        await Promise.all(imageLoadPromises);
        console.log('All images loaded');
 
        // Generate PDF
        const element = tempDiv.querySelector('.invoice-container');
        console.log('Element for PDF:', element);
        
        const opt = {
            margin: 10,
            filename: `Invoice_${transactionId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                allowTaint: true,
                logging: true,
                windowWidth: 800
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
 
        await html2pdf().set(opt).from(element).save();
        console.log('PDF generated successfully');
        document.body.removeChild(tempDiv);
    } catch(err) {
        console.error('Error generating PDF:', err);
        alert('Gagal mengenerate PDF. Silakan coba lagi.');
        document.body.removeChild(tempDiv);
    }
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
async function showMenuModal(itemId) {
    // Check operating hours first
    const isWithinHours = await checkOperatingHours();
    if (!isWithinHours) {
        showOutsideHoursModal();
        return;
    }
 
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
    
    // Save values before closeMenuModal sets currentMenuItem to null
    const itemName = currentMenuItem.name;
    const itemId = currentMenuItem.id;
    const quantity = modalQuantity;
    
    for (let i = 0; i < quantity; i++) {
        await addToCart(itemId);
    }
    
    closeMenuModal();
    showNotification(`${itemName} x${quantity} ditambahkan ke keranjang`, 'success');
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
    // Konfigurasi Cloudinary: ganti dengan nilai Anda
    // NOTE: Jangan masukkan API Secret di kode sisi-klien.
    // Saya mengisi `cloud name` sesuai yang Anda berikan.
    const CLOUDINARY_CLOUD_NAME = 'dg6mogmoq'; // dari akun Cloudinary Anda
    // Buat unsigned upload preset bernama 'aset_unsigned_preset' di dashboard Cloudinary
    // dan atur folder target ke 'aset', atau ganti nama preset di bawah jika Anda membuat yang lain.
    const CLOUDINARY_UPLOAD_PRESET = 'photopembayaran'; // ganti jika berbeda
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
 
    // Buat input file tersembunyi
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
 
    fileInput.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
 
        // Tampilkan preview segera menggunakan FileReader (dari file asli)
        const reader = new FileReader();
        reader.onload = function(event) {
            const previewContainer = document.getElementById('paymentProofPreview');
            const detailsBox = document.getElementById('paymentDetailsBox');
            const imgHtml = `
                <p class="preview-label">Preview Bukti Pembayaran:</p>
                <img src="${event.target.result}" alt="Bukti Pembayaran">
                <p class="file-name">${file.name}</p>
            `;
 
            if (!previewContainer) {
                const previewDiv = document.createElement('div');
                previewDiv.id = 'paymentProofPreview';
                previewDiv.className = 'payment-proof-preview';
                previewDiv.innerHTML = imgHtml;
                detailsBox.appendChild(previewDiv);
            } else {
                previewContainer.innerHTML = imgHtml;
            }
        };
        reader.readAsDataURL(file);
 
        // Upload ke Cloudinary (dengan kompresi WebP terlebih dahulu)
        try {
            showNotification('Mengompresi gambar ke WebP...', 'info');
 
            // Kompresi & konversi ke WebP sebelum upload
            // Fungsi compressToWebP didefinisikan di index.html (sebelum script.js dimuat)
            const webpFile = await compressToWebP(file);
 
            showNotification('Mengunggah bukti pembayaran...', 'info');
 
            const formData = new FormData();
            formData.append('file', webpFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            // Simpan ke folder khusus di Cloudinary
            formData.append('folder', 'aset');
 
            const resp = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData
            });
 
            let data;
            try {
                data = await resp.json();
            } catch (e) {
                data = null;
            }
 
            if (!resp.ok) {
                console.error('Cloudinary response error:', resp.status, data);
                const serverMsg = data && data.error && data.error.message ? data.error.message : `HTTP ${resp.status}`;
                throw new Error(serverMsg);
            }
 
            console.log('Cloudinary upload response:', data);
            const url = data.secure_url || data.url;
 
            // Tampilkan URL di bawah preview
            const previewContainer = document.getElementById('paymentProofPreview');
            if (previewContainer) {
                // Buat atau update elemen url
                let urlEl = previewContainer.querySelector('.payment-url');
                if (!urlEl) {
                    urlEl = document.createElement('p');
                    urlEl.className = 'payment-url';
                    urlEl.style.wordBreak = 'break-all';
                    previewContainer.appendChild(urlEl);
                }
                urlEl.innerHTML = `URL: <a href="${url}" target="_blank">${url}</a>`;
            }
 
            showNotification('Bukti pembayaran terunggah ke Cloudinary (WebP)', 'success');
        } catch (err) {
            console.error('Cloudinary upload error:', err);
            showNotification('Gagal mengunggah ke Cloudinary', 'error');
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