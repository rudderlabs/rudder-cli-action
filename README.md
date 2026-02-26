# Rudder CLI Project Manager Action

This GitHub Action allows you to validate and manage Rudder CLI projects directly through your GitHub workflows.

## Features

- Validate project files
- Perform dry-run of project file changes
- Apply project file changes
- Test transformations (via separate test action)
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
        uses: rudderlabs/rudder-cli-action@<version>
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
        uses: rudderlabs/rudder-cli-action@<version>
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
| `cli_version` | Version of rudder-cli to use                           | No       | v0.12.1 |

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

## Testing Transformations

A separate test action is available for testing transformation code. This action executes transformation code against test events and reports pass/fail results.

> **Note:** The test action is located at `/test` in this repository. Use `rudderlabs/rudder-cli-action/test@<version>` to reference it.

### Test Action Usage

```yaml
name: Test Transformations

on:
  pull_request:
    branches: [main]
    paths:
      - 'project/transformations/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test All Transformations
        uses: rudderlabs/rudder-cli-action/test@<version>
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          scope: "all"
          verbose: "true"
```

### Test Action Inputs

| Input         | Description                                                                     | Required | Default |
| ------------- | ------------------------------------------------------------------------------- | -------- | ------- |
| `location`    | Path to the folder containing Rudder CLI project files                          | Yes      | N/A     |
| `scope`       | Test scope: `all`, `modified`, or transformation/library ID                     | Yes      | N/A     |
| `verbose`     | Show detailed test output with diffs for failures                               | No       | false   |
| `cli_version` | Version of rudder-cli to use                                                    | No       | v0.12.1 |

### Test Scope Options

1. **all**: Test all transformations in the project
   ```yaml
   with:
     scope: "all"
   ```

2. **modified**: Test only new or modified transformations
   ```yaml
   with:
     scope: "modified"
   ```

3. **Specific ID**: Test a single transformation or library by ID
   ```yaml
   with:
     scope: "my-transformation-id"
   ```

### Complete Test Workflow Example

```yaml
name: Validate and Test

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate Project
        uses: rudderlabs/rudder-cli-action@<version>
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          mode: "validate"

  test-all:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - name: Test All Transformations
        uses: rudderlabs/rudder-cli-action/test@<version>
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          scope: "all"
          verbose: "true"

  test-modified:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - name: Test Modified Transformations
        uses: rudderlabs/rudder-cli-action/test@<version>
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          scope: "modified"
          verbose: "false"

  apply:
    runs-on: ubuntu-latest
    needs: [validate, test-all]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Apply Changes
        uses: rudderlabs/rudder-cli-action@<version>
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          mode: "apply"
```

### Testing a Specific Transformation

```yaml
- name: Test Specific Transformation
  uses: rudderlabs/rudder-cli-action/test@<version>
  env:
    RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
  with:
    location: "project/"
    scope: "my-transformation-id"
    verbose: "true"
```

### Test Action Requirements

The transformation test action requires:
- **CLI Version:** v0.8.0 or higher (default: v0.12.1)
- **Experimental Features:** The transformations test command is an experimental feature in rudder-cli
- **Environment:** Same `RUDDERSTACK_ACCESS_TOKEN` required as the main action

### Common Test Workflow Patterns

**PR Validation (Test Modified Only):**
```yaml
name: PR Checks

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Modified Transformations
        uses: rudderlabs/rudder-cli-action/test@<version>
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          scope: "modified"
          verbose: "true"
```

**Manual Test Trigger (specific transformation):**
```yaml
name: Manual Test

on:
  workflow_dispatch:
    inputs:
      transformation_id:
        description: 'Transformation ID to test'
        required: true
        type: string
      verbose:
        description: 'Verbose output'
        required: false
        type: boolean
        default: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Transformation
        uses: rudderlabs/rudder-cli-action/test@<version>
        env:
          RUDDERSTACK_ACCESS_TOKEN: ${{ secrets.RUDDER_ACCESS_TOKEN }}
        with:
          location: "project/"
          scope: ${{ inputs.transformation_id }}
          verbose: ${{ inputs.verbose }}
```

## Actions Reference

This repository contains two GitHub Actions:

### Main Action (`rudderlabs/rudder-cli-action`)
Manages Rudder CLI projects (validate, dry-run, apply).

**Location:** Root `action.yml`

**Usage:** `uses: rudderlabs/rudder-cli-action@<version>`

### Test Action (`rudderlabs/rudder-cli-action/test`)
Tests transformation code against test events.

**Location:** `test/action.yml`

**Usage:** `uses: rudderlabs/rudder-cli-action/test@<version>`

## Security

The action requires your Rudderstack access token to be provided via the `RUDDERSTACK_ACCESS_TOKEN` environment variable. Always store this token in GitHub Secrets and reference it in your workflow using `${{ secrets.YOUR_SECRET_NAME }}`. Never expose the token directly in your workflow files.

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.
