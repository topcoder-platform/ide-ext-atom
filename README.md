# Atom package for topcoder

This package is meant to closely integrate the Topcoder platform with [Atom](https://atom.io/), the text editor, to allow the user to perform actions related to the Topcoder platform from within the editor, without having to open a browser.

## Prerequisites for local development

-   Nodejs v10.15
-   Npm v6.9

## Local Development

1.  Create a folder named `topcoder-workflow` in your `~/.atom/packages` folder
2.  Copy the source code of this package to the newly created folder. (Alternatively, if you have cloned this repository, you can create a symbolic link.)
3.  Now, open the newly created folder in atom. If you already had it opened, reload atom
4.  Ignore any errors about missing modules. Run `npm install` in the folder and then reload to verify that the errors no longer occur
5.  You should now be able to use the package by opening the command palette and typing `Topcoder` to view the list of avaialble commands

## Package Settings

Press "cmd/ctrl + ," to show Settings tab, Choose `Packages` on the left bars, you will find `topcoder-workflow` under `Community Packages`. You can configure username and password in package settings. Also you can enable the Keybindings to use the default shortcuts.
For other configurations, they are not exposed to package settings, you can only modify them in `~/.atom/packages/topcoder-workflow/config/index.js`.

## Usage

### Shortcuts

| Action                     	| Command      	|
|----------------------------	|--------------	|
| Login                      	| Ctrl+Shift+T 	|
| Logout                     	| Ctrl+Shift+I 	|
| View Open Challenges      	| Ctrl+Shift+H 	|

### Menus

| Action                     	| Found at                                    	|
|----------------------------	|---------------------------------------------	|
| Login                      	| Packages -> Topcoder -> Login               	|
| Logout                    	| Packages -> Topcoder -> Logout              	|
| View Open Challenges      	| Packages -> Topcoder -> View Open Challenges 	|

### commands

Press "shift-cmd/ctrl-p" to show Command Palette

-   "Topcoder: Login": to login in Topcoder using your username and password.
-   "Topcoder: Logout": to logout, clear the token of current user.
-   "Topcoder: View Open Challenges": Show open challenges in Mark Down format

## Run unit tests

1.  Run `npm install` in `topcoder-workflow` folder.
2.  Configure all required configuration in `config/test.js`, you need to provide a valid TC account credential. You can also setup the configuration using process environment.

    ```bash
    export TEST_USERNAME='<YOUR_TC_USERNAME>'
    export TEST_PASSWORD='<YOUR_TC_PASSWORD>'
    ```

3.  Run `npm run test` in `topcoder-workflow` folder.
