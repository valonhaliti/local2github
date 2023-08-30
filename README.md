# local2github

Create remote repositories and sync your local repos into these newly created remote repositories.

## How to run it

First install the packages required by this app: `npm i`.
Create a personal token for your GithHub account with full permissions. And then run the script:
`node index.js "path" <username> <token> `
This will go throug the repositories inside "path" directory and sync them all into your GitHub account.
