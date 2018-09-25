Holds the html templates for rendering the webpages.

Overview
	These Django templates use template inheritance to prevent redefining common elements. This would hypothetically allow future teams to create entirely new user interface designs without having to start from the ground up. 

Listing of Important Files:
	- aircraftInfo.html: HTML markdown for the expandable aircraft information page
	- analyze.html: HTML markdown for the analyze page
	- base.html: The base HTML template which other templates extend
	- index1.html: The main HTML file for the completed UI
	- index2.html: The beginnings of a second UI, left almost entirely incomplete