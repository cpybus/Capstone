Javascript resource directory for the UI.

Overview
	This directory is the heart of the user interface. All of the logic is contained in the files located here, which are intentionally created in an object oriented manner. Each feature or capability of the UI has its own file which is loaded by the page. 

Listing of Important Files:
	- main.js: The main javascript file which coordinates all the other features and contains the application instance.
	- aircraftInfo.js: File for managing behaviors on the expandable aircraft information page.
	- aircraftInfoPanel.js: Responsible for updating the aircraft information panel with new information.
	- areaOfInterest.js: Responsible for creating and managing areas of interest as well as their corresponing alerts.
	- comparisonTable.js: Adds and removes aircraft from the comparison table on right-click
	- filter.js: Holds all of the logic for filtering aircraft markers from the map
	- liveData.js: Contains the websocket functionality which receives the live data updates from the webserver and adds them to the map
	- map.js: Holds all of the data and markers for the UI as well as managing dark mode
	- mapNightMode.js: Contains a JSON object for defining dark mode for the actual GoogleMap instance
	- settings.js: Manages the behavior of the settings panel
	- threatQueue.js: Updates the threat queue whenever new live data is received and allows the operator to select threats
	- utils.js: Contatins miscellaneous utility functions
	- weather.js: Fetches and updates the live weather overlay on the map