const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { run, get, all, initialize } = require('./db');
const { backupDatabase } = require('./backup');
const { exportSalesCSV, exportBookingsCSV, getDailySummary } = require('./export');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'jwash-secret-key';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Validasi helper
function validateUsername(username) {
    return username && typeof username === 'string' && username.length >= 3 && username.length <= 50 && /^[a-zA-Z0-9_]*$/.test(username);
}

function validatePassword(password) {
    return password && typeof password === 'string' && password.length >= 6 && password.length <= 100;
}

function validateEmail(email) {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateWA(wa) {
    return wa && /^62\d{9,12}$|^\d{10,13}$/.test(wa.replace(/[^\d]/g, ''));
}

function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.trim().substring(0, 255);
}

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authorization token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
}

app.post('/api/auth/login', async (req, res) => {
    try {
        let { username, password } = req.body;
        username = sanitizeInput(username);
        password = password ? String(password) : '';

        if (!validateUsername(username)) {
            return res.status(400).json({ error: 'Username tidak valid (3-50 karakter, alfanumerik saja)' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Password tidak valid (minimal 6 karakter)' });
        }

        const user = await get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Username atau password salah' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { username: user.username, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan server saat login' });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        let { name, motor, wa, packageChoice, message } = req.body;
        
        // Sanitasi dan validasi input
        name = sanitizeInput(name);
        motor = sanitizeInput(motor);
        wa = sanitizeInput(wa);
        packageChoice = sanitizeInput(packageChoice);
        message = sanitizeInput(message);

        if (!name || name.length < 3) {
            return res.status(400).json({ error: 'Nama minimal 3 karakter' });
        }
        if (!motor || motor.length < 2) {
            return res.status(400).json({ error: 'Tipe motor minimal 2 karakter' });
        }
        if (!validateWA(wa)) {
            return res.status(400).json({ error: 'Nomor WhatsApp tidak valid (format: 62xxxxx)' });
        }
        if (!packageChoice || !['Cuci Standar (20rb)', 'Cuci Premium (25rb)', 'Cuci Lengkap (30rb)'].includes(packageChoice)) {
            return res.status(400).json({ error: 'Paket cuci tidak valid' });
        }

        const date = new Date().toLocaleString('id-ID');
        const status = 'Pending';

        const result = await run(
            'INSERT INTO bookings (name, motor, wa, package, message, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, motor, wa, packageChoice, message, date, status]
        );

        const booking = await get('SELECT * FROM bookings WHERE id = ?', [result.lastID]);
        res.status(201).json({ booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menyimpan booking ke server' });
    }
});

app.get('/api/bookings', authenticate, async (req, res) => {
    try {
        const bookings = await all('SELECT * FROM bookings ORDER BY id DESC');
        res.json({ bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal mengambil booking' });
    }
});

app.delete('/api/bookings/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM bookings WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menghapus booking' });
    }
});

app.post('/api/sales', async (req, res) => {
    try {
        let { receiptNo, customer, motor, plate, packageName, addons, total, cash, change } = req.body;
        
        // Sanitasi dan validasi input
        receiptNo = sanitizeInput(receiptNo);
        customer = sanitizeInput(customer);
        motor = sanitizeInput(motor);
        plate = sanitizeInput(plate);
        packageName = sanitizeInput(packageName);
        total = parseInt(total) || 0;
        cash = parseInt(cash) || 0;
        change = parseInt(change) || 0;

        if (!receiptNo || receiptNo.length < 3) {
            return res.status(400).json({ error: 'No struk tidak valid' });
        }
        if (!customer || customer.length < 2) {
            return res.status(400).json({ error: 'Nama pelanggan minimal 2 karakter' });
        }
        if (!motor || motor.length < 2) {
            return res.status(400).json({ error: 'Tipe motor minimal 2 karakter' });
        }
        if (!packageName || packageName.length < 3) {
            return res.status(400).json({ error: 'Paket tidak valid' });
        }
        if (total < 0 || total > 1000000) {
            return res.status(400).json({ error: 'Total transaksi tidak valid' });
        }
        if (cash < 0 || cash > 10000000) {
            return res.status(400).json({ error: 'Nominal pembayaran tidak valid' });
        }

        const date = new Date().toLocaleDateString('id-ID');
        const timestamp = Date.now();

        const result = await run(
            'INSERT INTO sales (receipt_no, customer, motor, plate, package, addons, total, cash, change_amount, date, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [receiptNo, customer, motor, plate, packageName, JSON.stringify(addons || []), total, cash || 0, change || 0, date, timestamp]
        );

        const sale = await get('SELECT * FROM sales WHERE id = ?', [result.lastID]);
        res.status(201).json({ sale });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menyimpan transaksi penjualan' });
    }
});

app.get('/api/sales', authenticate, async (req, res) => {
    try {
        const sales = await all('SELECT * FROM sales ORDER BY id DESC');
        const mapped = sales.map((sale) => ({
            ...sale,
            addons: sale.addons ? JSON.parse(sale.addons) : []
        }));
        res.json({ sales: mapped });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal mengambil data penjualan' });
    }
});

app.delete('/api/sales/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        await run('DELETE FROM sales WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menghapus transaksi' });
    }
});

app.delete('/api/sales', authenticate, async (req, res) => {
    try {
        await run('DELETE FROM sales');
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menghapus semua transaksi' });
    }
});

app.get('/api/summary', authenticate, async (req, res) => {
    try {
        const bookings = await all('SELECT * FROM bookings');
        const sales = await all('SELECT * FROM sales WHERE date = ?', [new Date().toLocaleDateString('id-ID')]);
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        res.json({
            totalBookings: bookings.length,
            pendingBookings: bookings.filter((b) => b.status === 'Pending').length,
            todayRevenue: totalRevenue,
            todaySalesCount: sales.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal mengambil summary' });
    }
});

// Export endpoints
app.get('/api/export/sales', authenticate, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Query params startDate dan endDate diperlukan (format: YYYY-MM-DD)' });
        }
        
        const result = await exportSalesCSV(startDate, endDate);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal export sales' });
    }
});

app.get('/api/export/bookings', authenticate, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Query params startDate dan endDate diperlukan (format: YYYY-MM-DD)' });
        }
        
        const result = await exportBookingsCSV(startDate, endDate);
        if (!result.success) {
            return res.status(400).json({ error: result.message });
        }
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal export bookings' });
    }
});

app.get('/api/export/daily-summary', authenticate, async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Query param date diperlukan (format: YYYY-MM-DD)' });
        }
        
        const summary = await getDailySummary(date);
        res.json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal ambil daily summary' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

initialize().then(() => {
    // Jalankan backup setiap 24 jam
    backupDatabase();
    setInterval(() => {
        backupDatabase();
    }, 24 * 60 * 60 * 1000);
    
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('Gagal inisialisasi database:', error);
});
