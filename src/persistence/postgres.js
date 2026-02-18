const { Pool } = require('pg');

let pool;

async function init() {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    return new Promise((acc, rej) => {
        pool.query(
            `CREATE TABLE IF NOT EXISTS todo_items (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                completed BOOLEAN DEFAULT FALSE
            )`,
            err => {
                if (err) return rej(err);

                if (process.env.NODE_ENV !== 'test')
                    console.log(`Connected to PostgreSQL database via DATABASE_URL`);

                acc();
            },
        );
    });
}

async function teardown() {
    return new Promise((acc, rej) => {
        pool.end(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function getItems() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items', (err, result) => {
            if (err) return rej(err);
            acc(
                result.rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === true,
                    }),
                ),
            );
        });
    });
}

async function getItem(id) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items WHERE id = $1', [id], (err, result) => {
            if (err) return rej(err);
            const item = result.rows[0];
            acc(
                item
                    ? Object.assign({}, item, {
                          completed: item.completed === true,
                      })
                    : undefined,
            );
        });
    });
}

async function storeItem(item) {
    return new Promise((acc, rej) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES ($1, $2, $3)',
            [item.id, item.name, item.completed],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateItem(id, item) {
    return new Promise((acc, rej) => {
        pool.query(
            'UPDATE todo_items SET name = $1, completed = $2 WHERE id = $3',
            [item.name, item.completed, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function removeItem(id) {
    return new Promise((acc, rej) => {
        pool.query('DELETE FROM todo_items WHERE id = $1', [id], err => {
            if (err) return rej(err);
            acc();
        });
    });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};
