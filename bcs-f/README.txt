Base directory for the BCS-F publish-subscribe prototype

Overview
	This directory contains two Django projects, one which acts as the back-end server for the project and emulates a single sector, and one which acts as the webserver producing the UI.  

Directory Listing
	- server: Contains the Django server project which emulates a single sector
	- gui: Contains the Django client project which displays data served from the sectors

Listing of Important Files
	- .svnignore: Tells SVN which files (compiled, etc) do not need to be included in the repo
	- setup.sh: A one time setup script which installs all dependencies and configuration, SEE INSTRUCTIONS ON REDMINE
	- run.sh: Runs the entire system once setup has been performed, SEE INSTRUCTIONS ON REDMINE

Instructions
	Full setup and run instructions can be found in the Redmine Wiki under the Spring 17 heading. 
