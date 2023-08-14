const core = require("@actions/core");
const exec = require("@actions/exec");
const axios = require('axios');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');

async function downloadAndInstallDoppler() {
    try {
        const response = await axios.get('https://cli.doppler.com/install.sh', {
            responseType: 'text'
        });

        const scriptPath = path.join(os.tmpdir(), 'install-doppler.sh');
        await fs.writeFile(scriptPath, response.data, { mode: 0o755 });  // Make it executable

        await exec.exec(`bash ${scriptPath}`);
    } catch (error) {
        core.setFailed(`Failed to download and install Doppler CLI: ${error.message}`);
    }
}



async function run() {
  try {
    // Get inputs
    const dopplerToken = core.getInput("doppler-token");
    const dopplerProject = core.getInput("doppler-project");
    const dopplerConfig = core.getInput("doppler-config");
    const secrets = core.getInput("secrets").split("\n");

    await downloadAndInstallDoppler();


    // Authenticate with Doppler
    await exec.exec(
      `echo ${dopplerToken} | doppler configure set token --scope /`
    );

    let allSecrets = "";
    await exec.exec(
      "doppler secrets download",
      [
        `-p ${dopplerProject}`,
        `-c ${dopplerConfig}`,
        "--no-file",
        "--format env",
      ],
      {
        listeners: {
          stdout: (data) => {
            allSecrets += data.toString();
          },
        },
      }
    );

    let output = "";
    for (const secret of secrets) {
      const trimmedSecret = secret.trim();

      if (!/^[A-Za-z0-9_-]+$/.test(trimmedSecret)) {
        core.setFailed(`Error: Invalid secret name ${trimmedSecret}.`);
        return;
      }

      const matchedSecret = allSecrets.match(
        new RegExp(`^${trimmedSecret}=(.*)$`, "m")
      );
      if (matchedSecret && matchedSecret[1]) {
        const value = matchedSecret[1];
        core.setSecret(value);
        output += `${trimmedSecret}=${value}\n`;
      } else {
        core.setFailed(`Error: Secret ${trimmedSecret} not found.`);
        return;
      }
    }

    core.setOutput("secrets", output);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
