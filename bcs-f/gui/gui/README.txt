Project directory for the gui Django project

Overview
	This directory contains configuration files which define the gui as a package and configure the system. It contains important files which run at system startup.

Listing of Important Files
	- routing.py: Routes websocket traffic to the channels library. The handlers for these messages can be found in consumers.py within the rtap folder.
	- settings.py: Contains configuration for the gui project including the location of templates needed for rendering the webpage.
	- urls.py: This file is executed once as the system starts and registers the webserver as a subscriber with the broker layer. It defines the code for relaying the data from the publish-subscribe model to the websocket layer.