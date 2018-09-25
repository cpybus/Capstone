Base directory for the data Django Application

Overview
	This application requests live data from Virtual Radar and stores it in a MySQL database. It also analyzes the data for threats and publishes the data to the front end webserver.

Directory Listing
	- seed-data: Contains data which must be used to populate the database with airports before the system will run successfully.

Listing of Important Files:
	- broker.py: This file is the broker for the publish-subscribe data distribution model. It must be run (independently of Django) in order for any data to move between the back-end and front-end.
	- dbApi.py: Contains SQL queries used by the Celery tasks.
	- models.py: Defines the database schema.
	- publisher.py: This is a singleton class which is used by the celery worker processes in order to publish the data to the broker. This script must be running in order for anything Django related to work, including migrations.
	- threatMonitoring.py: Outlier threat detection algorithms used in identifying threats are located in this file.
