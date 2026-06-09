// backend/export.js
const { all, get } = require('./db');

async function exportSalesCSV(startDate, endDate) {
    try {
        const sales = await all(
            `SELECT * FROM sales 
             WHERE date BETWEEN ? AND ? 
             ORDER BY date DESC`,
            [startDate, endDate]
        );

        if (sales.length === 0) {
            return { success: false, message: 'Tidak ada data transaksi' };
        }

        let csv = 'No Struk,Tanggal,Pelanggan,Motor,Plat,Paket,Addon,Total (Rp),Bayar (Rp),Kembalian (Rp)\n';
        
        sales.forEach(sale => {
            const addons = sale.addons ? JSON.parse(sale.addons).join('; ') : '-';
            const row = [
                sale.receipt_no,
                sale.date,
                `"${sale.customer}"`,
                `"${sale.motor}"`,
                sale.plate || '-',
                `"${sale.package}"`,
                `"${addons}"`,
                sale.total,
                sale.cash,
                sale.change_amount
            ].join(',');
            csv += row + '\n';
        });

        // Tambah summary
        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const totalCash = sales.reduce((sum, s) => sum + s.cash, 0);
        const totalChange = sales.reduce((sum, s) => sum + s.change_amount, 0);
        
        csv += '\n';
        csv += `SUMMARY ${startDate} to ${endDate}`;
        csv += '\n';
        csv += `Total Transaksi,${sales.length}\n`;
        csv += `Total Omzet,${totalRevenue}\n`;
        csv += `Total Bayar,${totalCash}\n`;
        csv += `Total Kembalian,${totalChange}\n`;

        return { success: true, csv, filename: `sales-${startDate}-to-${endDate}.csv` };
    } catch (error) {
        console.error('Export CSV error:', error);
        return { success: false, message: error.message };
    }
}

async function exportBookingsCSV(startDate, endDate) {
    try {
        const bookings = await all(
            `SELECT * FROM bookings 
             WHERE date LIKE ? OR date LIKE ?
             ORDER BY date DESC`,
            [`${startDate}%`, `${endDate}%`]
        );

        if (bookings.length === 0) {
            return { success: false, message: 'Tidak ada data booking' };
        }

        let csv = 'Waktu,Pelanggan,Motor,Paket,WhatsApp,Status,Pesan\n';
        
        bookings.forEach(booking => {
            const row = [
                booking.date,
                `"${booking.name}"`,
                `"${booking.motor}"`,
                `"${booking.package}"`,
                booking.wa,
                booking.status,
                `"${booking.message || '-'}"`
            ].join(',');
            csv += row + '\n';
        });

        // Tambah summary
        const pending = bookings.filter(b => b.status === 'Pending').length;
        const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
        const done = bookings.filter(b => b.status === 'Done').length;

        csv += '\n';
        csv += `SUMMARY\n`;
        csv += `Total Booking,${bookings.length}\n`;
        csv += `Pending,${pending}\n`;
        csv += `Confirmed,${confirmed}\n`;
        csv += `Done,${done}\n`;

        return { success: true, csv, filename: `bookings-${startDate}-to-${endDate}.csv` };
    } catch (error) {
        console.error('Export bookings error:', error);
        return { success: false, message: error.message };
    }
}

async function getDailySummary(date) {
    try {
        const sales = await all(
            `SELECT * FROM sales WHERE date = ?`,
            [date]
        );

        const bookings = await all(
            `SELECT * FROM bookings WHERE date LIKE ?`,
            [`${date}%`]
        );

        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const totalCash = sales.reduce((sum, s) => sum + s.cash, 0);
        const pendingBookings = bookings.filter(b => b.status === 'Pending').length;

        return {
            date,
            totalSales: sales.length,
            totalRevenue,
            totalCash,
            totalBookings: bookings.length,
            pendingBookings,
            sales,
            bookings
        };
    } catch (error) {
        console.error('Get daily summary error:', error);
        throw error;
    }
}

module.exports = {
    exportSalesCSV,
    exportBookingsCSV,
    getDailySummary
};
