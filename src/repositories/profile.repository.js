import pool from '../db/index.js';

export async function upsertProfile(data) {
    const sql = `
        INSERT INTO github_profiles
            (username, name, bio, avatar_url, github_url, company, location, blog,
             email, twitter_handle, public_repos, public_gists, followers, following,
             account_age_days, avg_followers_per_repo, is_hireable, top_languages,
             github_created_at, github_updated_at, analyzed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            bio = VALUES(bio),
            avatar_url = VALUES(avatar_url),
            github_url = VALUES(github_url),
            company = VALUES(company),
            location = VALUES(location),
            blog = VALUES(blog),
            email = VALUES(email),
            twitter_handle = VALUES(twitter_handle),
            public_repos = VALUES(public_repos),
            public_gists = VALUES(public_gists),
            followers = VALUES(followers),
            following = VALUES(following),
            account_age_days = VALUES(account_age_days),
            avg_followers_per_repo = VALUES(avg_followers_per_repo),
            is_hireable = VALUES(is_hireable),
            top_languages = VALUES(top_languages),
            github_created_at = VALUES(github_created_at),
            github_updated_at = VALUES(github_updated_at),
            analyzed_at = NOW()
    `;

    const values = [
        data.username, data.name, data.bio, data.avatar_url, data.github_url,
        data.company, data.location, data.blog, data.email, data.twitter_handle,
        data.public_repos, data.public_gists, data.followers, data.following,
        data.account_age_days, data.avg_followers_per_repo, data.is_hireable,
        data.top_languages, data.github_created_at, data.github_updated_at
    ];

    await pool.execute(sql, values);
    return getProfileByUsername(data.username);
}

export async function getAllProfiles({ limit = 20, offset = 0 } = {}) {
    const safeLimit = parseInt(limit) || 20;
    const safeOffset = parseInt(offset) || 0;

    const [rows] = await pool.query(
        `SELECT * FROM github_profiles ORDER BY analyzed_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
    );
    const [[{ total }]] = await pool.query(
        'SELECT COUNT(*) AS total FROM github_profiles'
    );
    return { profiles: rows.map(deserialize), total, limit: safeLimit, offset: safeOffset };
}

export async function getProfileByUsername(username) {
    const [rows] = await pool.execute(
        'SELECT * FROM github_profiles WHERE LOWER(username) = LOWER(?)',
        [username]
    );
    return rows.length ? deserialize(rows[0]) : null;
}

export async function deleteProfile(username) {
    const [result] = await pool.execute(
        'DELETE FROM github_profiles WHERE LOWER(username) = LOWER(?)',
        [username]
    );
    return result.affectedRows > 0;
}

function deserialize(row) {
    return {
        ...row,
        top_languages: safeParseJSON(row.top_languages, []),
        is_hireable: Boolean(row.is_hireable)
    };
}

function safeParseJSON(str, fallback) {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}
