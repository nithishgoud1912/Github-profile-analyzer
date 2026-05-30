# GitHub Profile Analyzer API

A backend service built with **Node.js + Express + MySQL** that analyzes GitHub user profiles using the GitHub Public API and stores enriched insights in a relational database.

---

## 🚀 Live API

**Base URL:** `https://YOUR_DEPLOYED_URL`

---

## 🧱 Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Runtime      | Node.js (ESM)           |
| Framework    | Express.js              |
| Database     | MySQL (TiDB Cloud)      |
| Third-party  | GitHub REST API v3      |
| HTTP Client  | Axios                   |

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/github-profile-analyzer.git
cd github-profile-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DBHOST=your-mysql-host
DBPORT=3306
DBUSERNAME=your-db-user
DBPASSWORD=your-db-password
DATABASE=your-database-name

# Optional — raises GitHub rate limit from 60 → 5000 req/hr
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

PORT=3000
```

### 4. Run the database migration

```bash
node src/db/migrate.js
```

This creates the `github_profiles` table automatically.

### 5. Start the server

```bash
npm start
# Server runs at http://localhost:3000
```

---

## 📡 API Endpoints

### `GET /`
Health check — returns service info and available endpoints.

---

### `POST /api/analyze/:username`
Fetch a GitHub user's profile, compute insights, and store in the database.  
Re-analyzing an existing username **updates** the record.

**Example:**
```
POST /api/analyze/torvalds
```

**Response:**
```json
{
  "success": true,
  "message": "Profile for \"torvalds\" analyzed and stored successfully.",
  "data": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "public_repos": 8,
    "followers": 250000,
    "account_age_days": 5200,
    "avg_followers_per_repo": 31250.00,
    "top_languages": ["C", "Perl", "Shell"],
    ...
  }
}
```

---

### `GET /api/profiles`
Return all stored profiles (newest first). Supports pagination.

**Query params:**
| Param    | Default | Description               |
|----------|---------|---------------------------|
| `limit`  | 20      | Number of results         |
| `offset` | 0       | Number of results to skip |

**Example:**
```
GET /api/profiles?limit=10&offset=0
```

---

### `GET /api/profiles/:username`
Return a single stored profile by GitHub username.

**Example:**
```
GET /api/profiles/torvalds
```

---

### `DELETE /api/profiles/:username`
Remove a stored profile from the database.

**Example:**
```
DELETE /api/profiles/torvalds
```

---

## 🗃️ Database Schema

```sql
CREATE TABLE github_profiles (
    id                    INT AUTO_INCREMENT PRIMARY KEY,
    username              VARCHAR(100) NOT NULL UNIQUE,
    name                  VARCHAR(200),
    bio                   TEXT,
    avatar_url            VARCHAR(500),
    github_url            VARCHAR(500),
    company               VARCHAR(200),
    location              VARCHAR(200),
    blog                  VARCHAR(500),
    email                 VARCHAR(200),
    twitter_handle        VARCHAR(100),
    public_repos          INT           DEFAULT 0,
    public_gists          INT           DEFAULT 0,
    followers             INT           DEFAULT 0,
    following             INT           DEFAULT 0,
    account_age_days      INT           DEFAULT 0,
    avg_followers_per_repo DECIMAL(10,2) DEFAULT 0.00,
    is_hireable           TINYINT(1)    DEFAULT 0,
    top_languages         TEXT,          -- JSON array e.g. ["JavaScript","Python"]
    github_created_at     DATETIME,
    github_updated_at     DATETIME,
    analyzed_at           DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📊 Stored Insights

| Field                   | Description                                           |
|-------------------------|-------------------------------------------------------|
| `public_repos`          | Number of public repositories                         |
| `public_gists`          | Number of public gists                                |
| `followers`             | Follower count                                        |
| `following`             | Following count                                       |
| `account_age_days`      | Days since GitHub account was created                 |
| `avg_followers_per_repo`| `followers / public_repos` — proxy for influence/repo |
| `is_hireable`           | Whether the user marked themselves as hireable        |
| `top_languages`         | Top 5 languages across all public repos               |
| `twitter_handle`        | Linked Twitter/X username                             |

---

## 🔑 GitHub Token (Recommended)

Without a token, the GitHub API allows **60 requests/hour**.  
Generate a token at [github.com/settings/tokens](https://github.com/settings/tokens) and add it to `.env` as `GITHUB_TOKEN` to increase the limit to **5,000 req/hr**.

---

## 👨‍💻 Author

**Nithish Kumar Goud**  
Node.js Intern Assignment — GitHub Profile Analyzer
