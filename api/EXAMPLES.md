# API Examples — Optimiser.World

Complete working examples for all major API endpoints.

## Table of Contents

1. [Health & Status](#health--status)
2. [Search](#search)
3. [Items](#items)
4. [Voting & Ratings](#voting--ratings)
5. [User Management](#user-management)
6. [Item Submission](#item-submission)
7. [Usage Reports](#usage-reports)
8. [Feed & Discovery](#feed--discovery)

---

## Health & Status

### Check API Health

```bash
curl http://localhost:8787/api/health
```

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2024-03-15T10:30:00Z",
  "environment": "development"
}
```

---

## Search

### Basic Search

Find agents related to "data analysis":

```bash
curl -X POST http://localhost:8787/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "data analysis python agent",
    "limit": 10,
    "offset": 0
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "data analysis python agent",
  "results": [
    {
      "id": "item_1234567890",
      "slug": "pandas-analyzer",
      "title": "Pandas Data Analyzer",
      "short_description": "AI agent that analyzes CSV files using pandas",
      "type": "agent",
      "category": "data-analysis",
      "tags": ["python", "data", "analysis", "pandas"],
      "author": {
        "id": "user_abc123",
        "username": "datamaster",
        "karma": 450
      },
      "stats": {
        "upvotes": 128,
        "downvotes": 5,
        "downloads": 1250,
        "rating": 4.7,
        "rating_count": 42
      },
      "featured": true,
      "version": "2.1.0",
      "icon_url": "https://cdn.example.com/icons/pandas.png",
      "is_favorited": false,
      "created_at": "2023-11-20T09:15:00Z",
      "updated_at": "2024-03-10T14:22:00Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 47,
    "has_more": true
  },
  "filters_applied": {
    "category": null,
    "type": null,
    "sort": "relevance"
  }
}
```

### Filtered Search

Search for skills in the "automation" category:

```bash
curl -X POST http://localhost:8787/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "email automation",
    "category": "automation",
    "type": "skill",
    "limit": 20,
    "offset": 0
  }'
```

### Search with Custom Sort

Get trending items (by rising score):

```bash
curl -X POST http://localhost:8787/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "workflow",
    "sort": "rising",
    "limit": 10
  }'
```

### Search with Pagination

Get next page of results (assuming limit=20):

```bash
curl -X POST http://localhost:8787/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "python",
    "limit": 20,
    "offset": 20
  }'
```

### Search Suggestions (Autocomplete)

```bash
curl "http://localhost:8787/api/search/suggestions?q=python"
```

**Response:**
```json
{
  "suggestions": [
    "Python Data Processor",
    "Python Web Scraper",
    "Python API Client",
    "Python PDF Reader"
  ]
}
```

---

## Items

### Get Item Details

Fetch full item with reviews and comments:

```bash
curl http://localhost:8787/api/items/pandas-analyzer
```

**Response:**
```json
{
  "item": {
    "id": "item_1234567890",
    "slug": "pandas-analyzer",
    "title": "Pandas Data Analyzer",
    "short_description": "AI agent that analyzes CSV files using pandas",
    "description": "Full markdown description...",
    "readme": "Installation and usage instructions...",
    "type": "agent",
    "category": "data-analysis",
    "tags": ["python", "data", "analysis"],
    "author": {
      "id": "user_abc123",
      "username": "datamaster",
      "display_name": "Data Master",
      "avatar_url": "https://cdn.example.com/avatars/datamaster.jpg",
      "karma": 450
    },
    "stats": {
      "upvotes": 128,
      "downvotes": 5,
      "downloads": 1250,
      "rating": 4.7,
      "rating_count": 42
    },
    "version": "2.1.0",
    "install_command": "pip install pandas-analyzer",
    "compatibility": {
      "python": ">=3.8",
      "os": ["linux", "macos", "windows"]
    },
    "featured": true,
    "icon_url": "https://cdn.example.com/icons/pandas.png",
    "repo_url": "https://github.com/user/pandas-analyzer",
    "demo_url": "https://demo.pandas-analyzer.com",
    "created_at": "2023-11-20T09:15:00Z",
    "updated_at": "2024-03-10T14:22:00Z",
    "user_interaction": {
      "is_favorited": false,
      "vote_direction": "up"
    }
  },
  "reviews": [
    {
      "id": "review_001",
      "content": "Excellent tool! Saved me hours on data analysis tasks.",
      "upvotes": 23,
      "helpful_count": 45,
      "created_at": "2024-02-15T10:30:00Z",
      "username": "analyst_joe",
      "avatar_url": "https://cdn.example.com/avatars/analyst_joe.jpg",
      "karma": 220
    }
  ],
  "comments": [
    {
      "id": "comment_001",
      "user_id": "user_xyz",
      "content": "Great work! Any plans for support for Excel files?",
      "upvotes": 12,
      "created_at": "2024-03-01T14:22:00Z",
      "parent_id": null,
      "username": "excel_user",
      "avatar_url": "https://cdn.example.com/avatars/excel_user.jpg"
    }
  ]
}
```

---

## Voting & Ratings

### Upvote an Item

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/vote \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{"direction": "up"}'
```

**Response:**
```json
{
  "success": true,
  "action": "created",
  "vote": {
    "direction": "up"
  },
  "stats": {
    "upvotes": 129,
    "downvotes": 5
  }
}
```

### Remove Vote (Toggle)

Voting the same direction again removes the vote:

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/vote \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{"direction": "up"}'
```

**Response:**
```json
{
  "success": true,
  "action": "removed",
  "vote": null,
  "stats": {
    "upvotes": 128,
    "downvotes": 5
  }
}
```

### Switch Vote

Voting opposite direction switches the vote:

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/vote \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{"direction": "down"}'
```

**Response:**
```json
{
  "success": true,
  "action": "switched",
  "vote": {
    "direction": "down"
  },
  "stats": {
    "upvotes": 128,
    "downvotes": 6
  }
}
```

### Rate an Item

Rate on scale of 0-10:

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/rate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{"score": 9}'
```

**Response:**
```json
{
  "success": true,
  "action": "created",
  "rating": {
    "score": 9
  },
  "stats": {
    "average_rating": 4.72,
    "rating_count": 43
  }
}
```

### Update Rating

Rating the same item again updates the score:

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/rate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{"score": 8}'
```

**Response:**
```json
{
  "success": true,
  "action": "updated",
  "rating": {
    "score": 8
  },
  "stats": {
    "average_rating": 4.65,
    "rating_count": 43
  }
}
```

### Write a Review

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/review \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "content": "This tool is incredible! It saved me hours on data processing. Highly recommended for anyone working with CSV files. The pandas integration is seamless and the error handling is robust."
  }'
```

**Response:**
```json
{
  "success": true,
  "review": {
    "id": "review_123",
    "content": "This tool is incredible! It saved me hours...",
    "upvotes": 0,
    "created_at": "2024-03-15T10:30:00Z"
  }
}
```

### Add to Favorites

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/favorite \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "success": true,
  "action": "added"
}
```

### Remove from Favorites

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/favorite \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "success": true,
  "action": "removed"
}
```

### Add Comment

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/comment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "content": "Does this support Excel files?"
  }'
```

**Response:**
```json
{
  "success": true,
  "comment": {
    "id": "comment_456",
    "user": {
      "id": "user_xyz",
      "username": "excel_user"
    },
    "content": "Does this support Excel files?",
    "upvotes": 0,
    "created_at": "2024-03-15T10:30:00Z"
  }
}
```

### Reply to Comment

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/comment \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "content": "Excel support is coming in v3.0!",
    "parent_id": "comment_456"
  }'
```

---

## User Management

### Get User Profile

Requires authentication:

```bash
curl http://localhost:8787/api/user/profile \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "user": {
    "id": "user_abc123",
    "username": "datamaster",
    "display_name": "Data Master",
    "avatar_url": "https://cdn.example.com/avatars/datamaster.jpg",
    "bio": "AI enthusiast, data lover, coffee addict ☕",
    "karma": 450,
    "email": "user@example.com",
    "email_verified": true,
    "github_id": "datamaster-github",
    "twitter_id": "datamaster-twitter",
    "created_at": "2023-06-15T08:00:00Z",
    "stats": {
      "items_published": 5,
      "votes_cast": 234,
      "ratings_given": 89,
      "favorites": 42
    }
  }
}
```

### Update Profile

```bash
curl -X PATCH http://localhost:8787/api/user/profile \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "display_name": "Data Master Pro",
    "bio": "Expert in AI and data analysis",
    "avatar_url": "https://cdn.example.com/avatars/new-avatar.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "updated_fields": ["display_name", "bio", "avatar_url"]
}
```

### Generate API Key

```bash
curl -X POST http://localhost:8787/api/user/api-keys \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_existingKeyOrSession" \
  -d '{"name": "Development Key"}'
```

**Response:**
```json
{
  "api_key": {
    "id": "key_1234567890",
    "key": "opt_abcdefghijklmnopqrstuvwxyz123456",
    "prefix": "opt_abcd...3456",
    "name": "Development Key",
    "created_at": "2024-03-15T10:30:00Z",
    "warning": "This key will not be shown again. Save it securely."
  }
}
```

### List API Keys

```bash
curl http://localhost:8787/api/user/api-keys \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "api_keys": [
    {
      "id": "key_1234567890",
      "name": "Development Key",
      "prefix": "opt_abcd...3456",
      "created_at": "2024-03-15T10:30:00Z",
      "last_used_at": "2024-03-15T11:22:00Z",
      "revoked": false
    },
    {
      "id": "key_old",
      "name": "Old Key",
      "prefix": "opt_old1...old2",
      "created_at": "2023-12-01T08:00:00Z",
      "last_used_at": "2024-01-15T09:00:00Z",
      "revoked": true
    }
  ]
}
```

### Revoke API Key

```bash
curl -X DELETE http://localhost:8787/api/user/api-keys/key_1234567890 \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "success": true,
  "revoked": true
}
```

### Get User's Favorites

```bash
curl "http://localhost:8787/api/user/favorites?limit=10&offset=0" \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "items": [
    {
      "id": "item_123",
      "slug": "pandas-analyzer",
      "title": "Pandas Data Analyzer",
      "short_description": "...",
      "type": "agent",
      "category": "data-analysis",
      "tags": ["python", "data"],
      "author": { "id": "...", "username": "...", "karma": 450 },
      "stats": { "upvotes": 128, "downloads": 1250, ... },
      "featured": true,
      "icon_url": "...",
      "favorited_at": "2024-03-10T14:22:00Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 42,
    "has_more": true
  }
}
```

### Get User's Items

```bash
curl "http://localhost:8787/api/user/items?status=published&limit=10" \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "items": [
    {
      "id": "item_abc123",
      "slug": "my-cool-agent",
      "title": "My Cool Agent",
      "type": "agent",
      "category": "data-analysis",
      "status": "published",
      "stats": { "upvotes": 45, "downloads": 234, ... },
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-03-10T14:22:00Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 10,
    "total": 5,
    "has_more": false
  }
}
```

---

## Item Submission

### Submit New Item

```bash
curl -X POST http://localhost:8787/api/submit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "title": "Advanced Data Processor",
    "short_description": "Intelligent CSV processor with ML capabilities",
    "description": "A comprehensive Python package for processing and analyzing CSV files with machine learning integrations.\n\n## Features\n- Automatic data type detection\n- Missing value imputation\n- Feature engineering\n- Statistical analysis",
    "readme": "# Advanced Data Processor\n\n## Installation\n\n```bash\npip install advanced-data-processor\n```\n\n## Usage\n\n```python\nfrom adp import Processor\nprocessor = Processor()\nresults = processor.analyze(\"data.csv\")\n```",
    "type": "agent",
    "category": "data-analysis",
    "tags": ["python", "data", "ml", "csv", "automation"],
    "version": "1.0.0",
    "install_command": "pip install advanced-data-processor",
    "compatibility": {
      "python": ">=3.8",
      "os": ["linux", "macos", "windows"],
      "packages": ["pandas", "scikit-learn"]
    },
    "repo_url": "https://github.com/user/advanced-data-processor",
    "demo_url": "https://demo.advanceddataprocessor.com",
    "icon_url": "https://cdn.example.com/icons/adp.png"
  }'
```

**Response (auto-published if author karma > 100):**
```json
{
  "success": true,
  "item": {
    "id": "item_new123",
    "slug": "advanced-data-processor",
    "title": "Advanced Data Processor",
    "short_description": "Intelligent CSV processor with ML capabilities",
    "type": "agent",
    "category": "data-analysis",
    "tags": ["python", "data", "ml", "csv", "automation"],
    "version": "1.0.0",
    "status": "published",
    "created_at": "2024-03-15T10:30:00Z"
  },
  "message": "Item published successfully"
}
```

**Response (pending review if author karma <= 100):**
```json
{
  "success": true,
  "item": {
    "id": "item_new123",
    "slug": "advanced-data-processor",
    "title": "Advanced Data Processor",
    "type": "agent",
    "status": "pending",
    "created_at": "2024-03-15T10:30:00Z"
  },
  "message": "Item submitted for review (pending approval)"
}
```

### Update Item

```bash
curl -X PATCH http://localhost:8787/api/items/advanced-data-processor \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "version": "1.1.0",
    "description": "Updated description...",
    "tags": ["python", "data", "ml", "csv", "automation", "new-tag"]
  }'
```

**Response:**
```json
{
  "success": true,
  "updated_fields": ["version", "description", "tags"]
}
```

### Delete/Archive Item

```bash
curl -X DELETE http://localhost:8787/api/items/advanced-data-processor \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "success": true,
  "archived": true
}
```

---

## Usage Reports

### Record Execution Report

```bash
curl -X POST http://localhost:8787/api/report \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "item_slug": "pandas-analyzer",
    "outcome": "success",
    "duration_ms": 1250
  }'
```

**Response:**
```json
{
  "success": true,
  "report_id": "report_1234567890",
  "message": "Usage report recorded"
}
```

### Report Failure

```bash
curl -X POST http://localhost:8787/api/report \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_yourApiKeyHere" \
  -d '{
    "item_slug": "pandas-analyzer",
    "outcome": "failure",
    "duration_ms": 500,
    "error_message": "CSV file format not recognized"
  }'
```

**Response:**
```json
{
  "success": true,
  "report_id": "report_9876543210",
  "message": "Usage report recorded"
}
```

### Get Item Statistics

```bash
curl http://localhost:8787/api/stats/pandas-analyzer
```

**Response:**
```json
{
  "item_slug": "pandas-analyzer",
  "stats": {
    "total_reports": 342,
    "success_count": 315,
    "failure_count": 27,
    "success_rate": 92,
    "avg_duration_ms": 1142,
    "last_report_at": "2024-03-15T11:22:00Z"
  },
  "recent_reports": [
    {
      "id": "report_001",
      "outcome": "success",
      "duration_ms": 1250,
      "error_message": null,
      "created_at": "2024-03-15T11:22:00Z"
    }
  ]
}
```

### Get User's Reports

```bash
curl "http://localhost:8787/api/user/reports?limit=20" \
  -H "X-API-Key: opt_yourApiKeyHere"
```

**Response:**
```json
{
  "reports": [
    {
      "id": "report_001",
      "item": {
        "id": "item_123",
        "slug": "pandas-analyzer",
        "title": "Pandas Data Analyzer"
      },
      "outcome": "success",
      "duration_ms": 1250,
      "error_message": null,
      "created_at": "2024-03-15T11:22:00Z"
    }
  ],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 42,
    "has_more": true
  }
}
```

---

## Feed & Discovery

### Get Leaderboard (Hot)

```bash
curl "http://localhost:8787/api/leaderboard?sort=hot&limit=10"
```

### Get Leaderboard (New)

```bash
curl "http://localhost:8787/api/leaderboard?sort=new&timeframe=week&limit=10"
```

### Get Leaderboard (Top)

```bash
curl "http://localhost:8787/api/leaderboard?sort=top&timeframe=month&limit=10"
```

### Get Leaderboard (By Category)

```bash
curl "http://localhost:8787/api/leaderboard?category=data-analysis&sort=hot"
```

### Get Categories

```bash
curl http://localhost:8787/api/categories
```

**Response:**
```json
{
  "categories": [
    {
      "category": "data-analysis",
      "total": 47,
      "published": 41,
      "icon_url": "/icons/data-analysis.svg"
    },
    {
      "category": "automation",
      "total": 89,
      "published": 75,
      "icon_url": "/icons/automation.svg"
    }
  ]
}
```

### Get Trending

```bash
curl "http://localhost:8787/api/trending?timeframe=day&limit=10"
```

### Get Featured

```bash
curl http://localhost:8787/api/featured
```

---

## Error Handling Examples

### Invalid Query

```bash
curl -X POST http://localhost:8787/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": ""}'
```

**Response:**
```json
{
  "error": "Query is required and must be a non-empty string"
}
```

### Missing Authentication

```bash
curl http://localhost:8787/api/user/profile
```

**Response:**
```json
{
  "error": "Authentication required"
}
```

### Invalid Rating

```bash
curl -X POST http://localhost:8787/api/items/pandas-analyzer/rate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: opt_key" \
  -d '{"score": 15}'
```

**Response:**
```json
{
  "error": "Score must be a number between 0 and 10"
}
```

### Item Not Found

```bash
curl http://localhost:8787/api/items/nonexistent-slug
```

**Response:**
```json
{
  "error": "Item not found"
}
```

---

All examples use `localhost:8787` for development. Replace with your production URL for live requests.
