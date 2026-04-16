# optimiser-cli

Search, install, and manage AI agents and skills from Optimiser.World directly from your terminal.

## Installation

```bash
npm install -g optimiser-cli
```

Or from this monorepo:

```bash
npm install -w packages/cli
npm link -w packages/cli
```

## Quick Start

### Search for agents and skills

```bash
optimiser search "sentiment analysis"
optimiser search "email formatter" --type skill
optimiser search "summarizer" --category nlp
```

### Install an agent or skill

```bash
optimiser install my-agent
optimiser install my-skill
```

This creates `.claude/agents/<name>/` or `.claude/skills/<name>/` in your current directory.

### Get usage instructions

```bash
optimiser use my-agent
```

### Authenticate with Optimiser.World

```bash
optimiser login
```

This saves your API key to `~/.optimiser/config.json`.

### Report usage outcomes

```bash
optimiser report --outcome success --duration 1234
optimiser report --outcome failure --error "missing credentials"
```

### Manage configuration

```bash
optimiser config list
optimiser config get apiKey
optimiser config set apiKey ok_prod_xxxxx
optimiser config delete apiKey
```

## Commands

| Command | Description |
|---------|-------------|
| `search <query>` | Search for agents and skills |
| `install <slug>` | Install an agent or skill |
| `use <slug>` | Get usage instructions |
| `report` | Report usage outcome |
| `login` | Authenticate with your API key |
| `config` | Manage configuration |
| `help` | Show help text |
| `version` | Show version |

## Configuration

Configuration is stored in `~/.optimiser/config.json`:

```json
{
  "apiKey": "ok_prod_xxxxx"
}
```

## Features

- Zero dependencies (uses native Node.js fetch, fs, etc.)
- Brand-themed ANSI colors (mint, blue, violet, amber)
- Simple, extensible command architecture
- Full support for searching, installing, and managing agents and skills
- Local configuration management
- Usage reporting and analytics

## Development

```bash
# Install dependencies
npm install -w packages/cli

# Run commands
node packages/cli/bin/optimiser.js help
node packages/cli/bin/optimiser.js search "example"

# Link globally for testing
npm link -w packages/cli
optimiser help
```

## API Integration

The CLI communicates with the Optimiser.World API at `https://api.optimiser.world`:

- `POST /api/search` - Search for agents and skills
- `GET /api/items/{slug}` - Get item details
- `GET /api/user/profile` - Get user profile (requires auth)
- `POST /api/report` - Report usage outcomes

Authentication is handled via `X-API-Key` header.

## License

MIT
