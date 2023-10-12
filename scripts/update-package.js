const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const { exec } = require("child_process");
const baseDirectory = "./apps";

const packagesToUpdate = [
  { name: "@queueoverflow/shared", value: "@queueoverflow/shared" },
];

const fetchPackageVersion = (packageName) =>
  new Promise((resolve, reject) => {
    exec(`npm show ${packageName} version`, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      const latestVersion = stdout.trim();
      console.log(`Latest version of ${packageName}: ${latestVersion}`);
      resolve(latestVersion);
    });
  });

const updatePackageVersion = (packagePath, packageName, newVersion) => {
  const packageFilePath = path.join(packagePath, "package.json");
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageFilePath, "utf8"));
    if (packageJson.dependencies[packageName]) {
      packageJson.dependencies[packageName] = newVersion;
    }
    if (packageJson.devDependencies[packageName]) {
      packageJson.devDependencies[packageName] = newVersion;
    }
    fs.writeFileSync(packageFilePath, JSON.stringify(packageJson, null, 2));
    console.log(
      `Updated version of ${packageName} in ${packageFilePath} to ${newVersion}`
    );
  } catch (err) {
    console.error(
      `Error updating ${packageName} in ${packageFilePath}: ${err}`
    );
  }
};

inquirer
  .prompt([
    {
      type: "list",
      name: "package",
      message: "Select package to update:",
      choices: packagesToUpdate,
    },
  ])
  .then(async (answers) => {
    const package = answers.package;
    console.log(`You selected: ${package}`);
    console.log("Start fetching package lastest version...");
    const version = await fetchPackageVersion(package);

    fs.readdir(baseDirectory, (err, directories) => {
      if (err) {
        console.error(`Error reading directory: ${err}`);
        return;
      }

      // Iterate through the directories and update the package.json file in each app
      directories.forEach((directory) => {
        const appPath = path.join(baseDirectory, directory);
        updatePackageVersion(appPath, package, version);
      });
    });
  });
