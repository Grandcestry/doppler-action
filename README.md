# Doppler Secrets Retrieval Action

This GitHub Action allows you to fetch secrets from Doppler and make them available as outputs for subsequent steps in your workflows.

## Prerequisites

Ensure you have the required permissions and a valid token from Doppler before utilizing this action.

## Usage

Here's how to use the `doppler-secrets-action` in your workflows:

```yaml
name: Example Workflow

on: [push]

jobs:
  example_job:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Retrieve Secrets from Doppler
      id: doppler
      uses: Grandcestry/doppler-secrets-action@main
      with:
        doppler-token: ${{ secrets.DOPPLER_TOKEN }}
        doppler-project: 'your-doppler-project'
        doppler-config: 'your-doppler-config'
        secrets: |
          SECRET_ONE
          SECRET_TWO

    - name: Use the secrets
      run: |
        echo "Using SECRET_ONE: ${{ steps.doppler.outputs.SECRET_ONE }}"
        echo "Using SECRET_TWO: ${{ steps.doppler.outputs.SECRET_TWO }}"
```

## Inputs

| Name             | Description                                        | Required |
|------------------|----------------------------------------------------|----------|
| `doppler-token`  | The Doppler token to authenticate.                 | Yes      |
| `doppler-project`| The Doppler project name.                          | Yes      |
| `doppler-config` | The Doppler configuration name.                    | Yes      |
| `secrets`        | List of secrets to fetch, separated by newlines.   | Yes      |

## Outputs

For each secret specified in the `secrets` input, an output will be available with the same name containing the secret's value.

For instance, if you specify:

```yaml
secrets: |
  PAT_GHA_FORMATTER
  ANOTHER_SECRET
```

You can later reference the secrets using:

```yaml
${{ steps.doppler.outputs.PAT_GHA_FORMATTER }}
${{ steps.doppler.outputs.ANOTHER_SECRET }}
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
