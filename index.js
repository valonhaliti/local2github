const fs = require("fs");
const path = process.argv[2];
const githubUsername = process.argv[3];
const githubToken = process.argv[4];

const simpleGit = require("simple-git");
const { Octokit } = require("@octokit/core");

const files = fs.readdirSync(path);
console.log("files", files);

const githubRepos = files.filter((x) => isGithubRepo(`${path}/${x}`));
console.log(githubRepos);
createRepos(githubRepos);

async function createRepos(githubRepos) {
  for (const repoName of githubRepos) {
    console.log("creating repo", repoName);
    const repoUrl = await createRepo(repoName);

    console.log("adding remote", repoName);
    await addRemote(repoName, repoUrl);

    console.log("pushing to remote", repoName);
    await pushToRemote(repoName);
  }
}

function isGithubRepo(dir) {
  return fs.existsSync(`${dir}/.git`);
}

async function createRepo(repoName) {
  const octokit = new Octokit({
    auth: githubToken,
  });

  try {
    await octokit.request("POST /user/repos", {
      name: `l2g-${repoName}`,
      description: 'Automatically created repository by "local2github" tool',
      homepage: "https://github.com",
      private: true,
      is_template: true,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  } catch (e) {
    if (e.status === 422) {
      console.error("repo already exists", repoName);
    }
  }

  return `https://${githubUsername}:${githubToken}@github.com/${githubUsername}/l2g-${repoName}.git`;
}

async function addRemote(repoName, repoUrl) {
  const git = simpleGit({
    baseDir: `${path}/${repoName}`,
  });

  let remotes = await git.getRemotes();
  remotes = remotes.map((x) => x.name);
  if (remotes.includes("l2g_backup")) {
    await git.removeRemote("l2g_backup");
  }
  await git.addRemote("l2g_backup", repoUrl);
}

async function pushToRemote(repoName) {
  const git = simpleGit({
    baseDir: `${path}/${repoName}`,
  });
  const branches = await git.branchLocal();
  for (const branch of branches.all) {
    await git.push("l2g_backup", branch);
  }
}
