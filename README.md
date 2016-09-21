# W/kom for Strava
![W/Kom for Strava screenshot][screenshot]
### Functionality
This userscript displays measured or estimated watts per kilogram (:zap:/:crown:) for activity segment leaderboards (e.g. <https://www.strava.com/activities/643122549/segments/15718362409>). To respect [Strava](https://www.strava.com), it works only on…
* Top 10 plus the currently authenticated user
* Segments longer than three minutes
* Segments [not flagged as downhill](#caveats-todo)

### Requirements
* ECMAScript 2015-compatible browser
* Interwebs
* Watts

### Caveats (TODO)
* Not triggered by a listener — requires manual invocation of wkomForStrava()
* Logs an error for all 11 GETs if the segment is flagged as downhill
* Displays results as they are fetched rather than all at once
* Works only on activity pages

[screenshot]: wkomforstrava.png
