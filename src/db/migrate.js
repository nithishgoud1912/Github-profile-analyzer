import pool from './index.js';

const createTable = `
CREATE TABLE IF NOT EXISTS github_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200),
    bio TEXT,
    avatar_url VARCHAR(500),
    github_url VARCHAR(500),
    company VARCHAR(200),
    location VARCHAR(200),
    blog VARCHAR(500),
    email VARCHAR(200),
    twitter_handle VARCHAR(100),
    public_repos INT DEFAULT 0,
    public_gists INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    account_age_days INT DEFAULT 0,
    avg_followers_per_repo DECIMAL(10,2) DEFAULT 0.00,
    is_hireable TINYINT(1) DEFAULT 0,
    top_languages TEXT,
    github_created_at DATETIME,
    github_updated_at DATETIME,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

async function migrate() {
    try {
        const conn = await pool.getConnection();
        await conn.query(createTable);
        conn.release();
        console.log('Table github_profiles is ready.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
