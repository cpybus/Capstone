Base directory for the server Django project.

Overview
	This directory contains a Django application which fetches live data from Virtual Radar, stores it in a database, analyzes for threats, and publishes all the data to the front end webserver. This Django project should never actually be run using the 'python manage.py runserver' command. 

Directory Listing
	- data: Contains the application which fetches, analyzes, stores, and publishes the data
	- server: Contains the django project files

Listing of Important Files
	- manage.py: This is a Django generated file which is used for database migrations.