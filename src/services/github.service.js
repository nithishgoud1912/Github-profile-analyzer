import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

function buildHeaders() {
    const headers = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
}

async function fetchTopLanguages(username, headers) {
    try {
        const { data: repos } = await axios.get(
            `${GITHUB_API}/users/${username}/repos`,
            { headers, params: { per_page: 100, sort: 'updated' } }
        );

        const langCount = {};
        for (const repo of repos) {
            if (repo.language) {
                langCount[repo.language] = (langCount[repo.language] || 0) + 1;
            }
        }

        return Object.entries(langCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang]) => lang);
    } catch {
        return [];
    }
}

export async function analyzeGithubUser(username) {
    const headers = buildHeaders();
    let userData;

    try {
        const { data } = await axios.get(`${GITHUB_API}/users/${username}`, { headers });
        userData = data;
    } catch (err) {
        if (err.response?.status === 404) {
            throw new Error(`GitHub user "${username}" not found.`);
        }
        if (err.response?.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Add a GITHUB_TOKEN to your .env file.');
        }
        throw new Error(`GitHub API error: ${err.message}`);
    }

    const topLanguages = await fetchTopLanguages(username, headers);

    const createdAt = new Date(userData.created_at);
    const now = new Date();
    const accountAgeDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    const avgFollowersPerRepo = userData.public_repos > 0
        ? parseFloat((userData.followers / userData.public_repos).toFixed(2))
        : 0;

    return {
        username: userData.login,
        name: userData.name || null,
        bio: userData.bio || null,
        avatar_url: userData.avatar_url || null,
        github_url: userData.html_url || null,
        company: userData.company || null,
        location: userData.location || null,
        blog: userData.blog || null,
        email: userData.email || null,
        twitter_handle: userData.twitter_username || null,
        public_repos: userData.public_repos || 0,
        public_gists: userData.public_gists || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        account_age_days: accountAgeDays,
        avg_followers_per_repo: avgFollowersPerRepo,
        is_hireable: userData.hireable ? 1 : 0,
        top_languages: JSON.stringify(topLanguages),
        github_created_at: userData.created_at ? new Date(userData.created_at) : null,
        github_updated_at: userData.updated_at ? new Date(userData.updated_at) : null
    };
}
