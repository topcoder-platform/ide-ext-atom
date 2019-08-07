# Atom package for topcoder

This package is meant to closely integrate the Topcoder platform with [Atom](https://atom.io/), the text editor, to allow the user to perform actions related to the Topcoder platform from within the editor, without having to open a browser.

## Prerequisites for local development

-   Nodejs v10.15
-   Npm v6.9

## Local Development

1.  Create a folder named `topcoder-workflow` in your `~/.atom/packages` folder
2.  Copy the source code of this package to the newly created folder. (Alternatively, if you have cloned this repository, you can create a symbolic link.)
3.  Now, open the newly created folder in atom with Development mode. If you already had it opened, reload atom
4.  Ignore any errors about missing modules. Run `npm install` in the folder and then reload to verify that the errors no longer occur
5.  You should now be able to use the package by opening the command palette and typing `Topcoder` to view the list of avaialble commands
6.  The field "useDevEndpoints" in "config/index.js" can be used to switch between topcoder develop endpoint or production endpoint.

## Development Mode

You can run the package in dev mode by

1.  going to the `View -> Developer -> Open In Dev Mode...`,
2.  or, running `atom -d .` in the package directory

## Package Settings

Press "cmd/ctrl + ," to show Settings tab, Choose `Packages` on the left bars, you will find `topcoder-workflow` under `Community Packages`. You can configure username and password in package settings. Also you can enable the Keybindings to use the default shortcuts.
For other configurations, they are not exposed to package settings, you can only modify them in `~/.atom/packages/topcoder-workflow/config/index.js`.

## Usage

### Configuration

In order to use the `Upload Submission` command, you need to configure a `.topcoderrc` file in your workspace. This file must be in the JSON format and must include the `challengeId` field. Below is a sample content

```JSON
{
  "challengeId": "30055217"
}
```

The `Upload Submission` command uploads your workspace for the challenge that is specified in `.topcoderrc` / `challengeId`. You can find the ID of a challenge from its URL.

[https://www.topcoder.com/challenges/{{CHALLENGE_ID}}](https://www.topcoder.com/challenges/{{CHALLENGE_ID}})

### Shortcuts

| Action                     	| Command      	|
|----------------------------	|--------------	|
| Login                      	| Ctrl+Shift+T 	|
| Logout                     	| Ctrl+Shift+I 	|
| View Open Challenges      	| Ctrl+Shift+H 	|
| Upload Submission           | Ctrl+Shift+X  |

### Menus

| Action                     	| Found at                                    	|
|----------------------------	|---------------------------------------------	|
| Login                      	| Packages -> Topcoder -> Login               	|
| Logout                    	| Packages -> Topcoder -> Logout              	|
| View Open Challenges      	| Packages -> Topcoder -> View Open Challenges 	|
| Upload Submission         	| Packages -> Topcoder -> Upload Submission   	|

### commands

Press "shift-cmd/ctrl-p" to show Command Palette

-   "Topcoder: Login": to login in Topcoder using your username and password.
-   "Topcoder: Logout": to logout, clear the token of current user.
-   "Topcoder: View Open Challenges": Show open challenges in in HTML format. Clicking on a link of the challenge will open a new tab containing details of the challenge(If user hasn't registered such challenge, it will contain a registration button).
-   "Topcoder: Upload Submission": Uploads the open workspace as challenge submission. You need to specify the `challengeId` in `.topcoderrc` file. (refer to the [configuration](#configuration))

## Run lint

Run `npm run lint` to find lint errors.

## Run unit tests

1.  Run `npm install` in `topcoder-workflow` folder.
2.  Configure `config/test.js`, if you need. (you should be good to go with existing config)
3.  You have 3 alternatives to run tests, choose one below.
    -   Run `apm test` in `topcoder-workflow` folder.
    -   Run `npm test` in `topcoder-workflow` folder.
    -   Run `View -> Developer -> Run Package Specs`, within Atom window.
