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

Currently, the Settings page for the package does not expose the avaialble Settings.
You can configure username and password in `~/.atom/packages/topcoder-workflow/config/index.js`.

## Usage

### Shortcuts

| Action                     	| Command      	|
|----------------------------	|--------------	|
| Login                      	| Ctrl+Shift+T 	|
| View Challenges            	| Ctrl+Shift+I 	|
| View / Hide Topcoder Panel 	| Ctrl+Shift+H 	|

### Menus

| Action                     	| Found at                            	|
|----------------------------	|-------------------------------------	|
| Login                      	| Packages -> Topcoder -> Login       	|
| View Challenges            	| Packages -> Topcoder -> Load        	|
| View / Hide Topcoder Panel 	| Packages -> Topcoder -> Show / Hide 	|

### commands

Press "shift-cmd/ctrl-p" to show Command Palette

-   "Topcoder: Login": to login in Topcoder using your username and password.
-   "Topcoder: Load": to list active challenges in a tabular view.
-   "Topcoder: Toggle": Show / Hide the Topcoder panel

## Run unit tests

1.  Run `npm install` in `topcoder-workflow` folder.
2.  Open the `topcoder-workflow` package source code in your Atom editor.
3.  View > Developer > Run Package Specs
