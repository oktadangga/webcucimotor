const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Unable to open database:', err.message);
        process.exit(1);
    }
});

function run(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function get(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function all(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

async function initialize() {
    await run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )`);

    await run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        motor TEXT,
        wa TEXT,
        package TEXT,
        message TEXT,
        date TEXT,
        status TEXT
    )`);

    await run(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        receipt_no TEXT,
        customer TEXT,
        motor TEXT,
        plate TEXT,
        package TEXT,
        addons TEXT,
        total INTEGER,
        cash INTEGER,
        change_amount INTEGER,
        date TEXT,
        timestamp INTEGER
    )`);

    const defaultAdminUsername = 'admin';
    const defaultAdminPassword = 'JWash@2024Secure';

    const existingAdmin = await get('SELECT id FROM users WHERE role = ?', ['admin']);
    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
        await run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [defaultAdminUsername, passwordHash, 'admin']);
        console.log(`Admin user created: username=${defaultAdminUsername} password=${defaultAdminPassword}`);
    } else {
        const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
        await run('UPDATE users SET username = ?, password = ? WHERE id = ?', [defaultAdminUsername, passwordHash, existingAdmin.id]);
        console.log(`Admin user updated: username=${defaultAdminUsername}`);
    }
}

module.exports = {
    db,
    run,
    get,
    all,
    initialize
};
