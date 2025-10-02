# Rudder CLI Project Manager Action

This GitHub Action allows you to validate and manage Rudder CLI projects directly through your GitHub workflows.

## Features

- Validate project files
- Perform dry-run of project file changes
- Apply project file changes
- Secure handling of Rudderstack access tokens

## Usage

### Prerequisites

- A Rudderstack account and access token
- Rudder CLI project files in your repository

### Basic Usage

```yaml
name: Manage Rudder CLI projects

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Project Files
        uses: rudderlabs/rudder-cli-action@v1.0.1
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          mode: "validate"

  apply:
    runs-on: ubuntu-latest
    needs: validate
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Apply Project Files
        uses: rudderlabs/rudder-cli-action@v1.0.1
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          mode: "apply"
```

### Inputs

| Input         | Description                                            | Required | Default |
| ------------- | ------------------------------------------------------ | -------- | ------- |
| `location`    | Path to the folder containing Rudder CLI project files | Yes      | N/A     |
| `mode`        | Operation mode (`validate`, `dry-run`, or `apply`)     | Yes      | N/A     |
| `cli_version` | Version of rudder-cli to use                           | No       | v0.10.0 |

### Environment Variables

| Variable                   | Description              | Required |
| -------------------------- | ------------------------ | -------- |
| `RUDDERSTACK_ACCESS_TOKEN` | Rudderstack access token | Yes      |

### Modes

1. **validate**:

   - Validates project files syntax and structure
   - No changes are applied to your configuration

2. **dry-run**:

   - Simulates the application of changes
   - Shows what would be modified without making actual changes

3. **apply**:
   - Applies the project file changes to your Rudderstack workspace

## Security

The action requires your Rudderstack access token to be provided via the `RUDDERSTACK_ACCESS_TOKEN` environment variable. Always store this token in GitHub Secrets and reference it in your workflow using `${{ secrets.YOUR_SECRET_NAME }}`. Never expose the token directly in your workflow files.

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.
