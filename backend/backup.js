const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Buat folder backups jika belum ada
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(BACKUP_DIR, `database-${timestamp}.db`);

    try {
        if (fs.existsSync(DB_PATH)) {
            fs.copyFileSync(DB_PATH, backupFile);
            console.log(`✓ Backup berhasil: ${backupFile}`);
            
            // Hapus backup lama (lebih dari 30 hari)
            const files = fs.readdirSync(BACKUP_DIR);
            const now = Date.now();
            const thirtyDaysAgo = 30 * 24 * 60 * 60 * 1000;
            
            files.forEach(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const fileTime = fs.statSync(filePath).mtime.getTime();
                if (now - fileTime > thirtyDaysAgo) {
                    fs.unlinkSync(filePath);
                    console.log(`✓ Backup lama dihapus: ${file}`);
                }
            });
        } else {
            console.log('✗ Database tidak ditemukan');
        }
    } catch (error) {
        console.error('✗ Backup gagal:', error.message);
    }
}

function restoreDatabase(backupFileName) {
    const backupFile = path.join(BACKUP_DIR, backupFileName);
    
    try {
        if (!fs.existsSync(backupFile)) {
            console.log(`✗ Backup file tidak ditemukan: ${backupFileName}`);
            return false;
        }
        
        // Buat backup dari database sekarang (untuk safety)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const safetyBackup = path.join(BACKUP_DIR, `database-safety-${timestamp}.db`);
        if (fs.existsSync(DB_PATH)) {
            fs.copyFileSync(DB_PATH, safetyBackup);
            console.log(`✓ Safety backup dibuat: ${safetyBackup}`);
        }
        
        // Restore dari backup
        fs.copyFileSync(backupFile, DB_PATH);
        console.log(`✓ Database restored dari: ${backupFileName}`);
        return true;
    } catch (error) {
        console.error('✗ Restore gagal:', error.message);
        return false;
    }
}

function listBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.db')).sort().reverse();
        if (files.length === 0) {
            console.log('✗ Tidak ada backup ditemukan');
            return;
        }
        console.log('Daftar backup:');
        files.forEach((file, index) => {
            const filePath = path.join(BACKUP_DIR, file);
            const size = (fs.statSync(filePath).size / 1024).toFixed(2);
            const mtime = fs.statSync(filePath).mtime.toLocaleString('id-ID');
            console.log(`  ${index + 1}. ${file} (${size} KB) - ${mtime}`);
        });
    } catch (error) {
        console.error('✗ Gagal list backup:', error.message);
    }
}

// CLI untuk backup, restore, dan list
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'backup') {
        backupDatabase();
    } else if (command === 'restore') {
        const fileName = process.argv[3];
        if (!fileName) {
            console.log('Penggunaan: node backup.js restore <filename>');
            console.log('Contoh: node backup.js restore database-2024-01-15T10-30-45.db');
            listBackups();
        } else {
            restoreDatabase(fileName);
        }
    } else if (command === 'list') {
        listBackups();
    } else {
        console.log('Penggunaan:');
        console.log('  node backup.js backup         - Buat backup database');
        console.log('  node backup.js list           - Lihat daftar backup');
        console.log('  node backup.js restore <file> - Restore database dari backup');
    }
}

module.exports = { backupDatabase, restoreDatabase, listBackups };
