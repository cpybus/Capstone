Project directory for the 'server' Django project

Overview
	This directory contains configuration files which define the server project as a package. It contains the information necessary to integrate any installed apps into a single project.

Listing of Important Files
	- celery.py: Contains the celery tasks which are executed periodically in order to fetch, analyze, and publish the live data. These tasks employ different modules from the 'data' application.
	- settings.py: Contains all the project settings, including those which specify the database credentials and configuration.
