function wkomForStrava(){

  'use strict';

  let scrapeTargets = [
      [ '#segments tr.selected div.leaderboard table tbody tr td:nth-child(3n+1) a', 10 ],
      [ '#segments tr.selected div.leaderboard table tbody tr.current-athlete td:nth-child(3n+1) a', 1 ]
    ],
    scrapeModel = {
      path: 'pathname',
      time: 'innerText'
      // ,watts: null,
      // measuredWatts: null,
      // kilos: null,
      // wkg: null
    },
    scrapedData = [],
    extensionName = 'W/kom for Strava',
    consoleStyle = 'background-color: #FC4C02; color: #FFF;';

  for ( let i = 0, j = scrapeTargets.length; i < j; i++ ){
    let scrapeTarget = scrapeTargets[i];
    jQuery( scrapeTarget[0] /* selector */ )
      .slice( 0, scrapeTarget[1] /* limit */ )
      .each( function(){
        let item = jQuery(this),
          scrapedItem = {};
        jQuery.each( scrapeModel, function( key, prop ){
          scrapedItem[key] = item[0][prop];
        });
        scrapedData.push( scrapedItem );
      }
    );
  }

  var isLongSeg = function(){
    let segTime = scrapedData[0].time,
      hasSecs = ( segTime.indexOf( 's' ) !== -1 ),
      lessThanThreeMin = Number( segTime.split( ':' )[0] ) < 3;
    if ( hasSecs || lessThanThreeMin ){
      console.error( `%c${extensionName} will not work on this segment because the leader completed it in less than 3 minutes.`, consoleStyle );
      return false;
    } else {
      return true;
    }
  };

  if ( isLongSeg() ){
    getPower( scrapedData );
  }

  function getPower( scrapedData ){
  	for ( let i = 0, j = scrapedData.length; i < j; i++ ){
  		let segPath = scrapedData[i].path,
  			segWatts,
  			segDownhill;
  		jQuery.ajax({
  	    type: 'GET',
  	    url: segPath,
  	    crossDomain: false,
  	    complete: function( data ){
  		    segDownhill = data.responseJSON.downhill_ride_segment;
  		    if ( segDownhill == true ){
            console.error( `%c_${extensionName}_ will not work on this segment as it is marked as downhill.`, consoleStyle )
    				return; // TODO: swap this for a labeled break to defeat the for loop
    	    }
    			segWatts = data.responseJSON.avg_watts_raw;
  				//this needs a check
  				scrapedData[i].watts = segWatts;
  				getWeight( scrapedData, i );
  	  	}
  		});
  	};
  }

  function getWeight( scrapedData, i ){
  	let segPath = scrapedData[i].path,
  		segKilos;
  	jQuery.ajax({
      type: 'GET',
      url: segPath,
      crossDomain: true,
      complete: function( data ){
  			let segKilosRaw = data.responseText.match( /(activityAthleteWeight)\(\d{2,}\.\d{1,}\)/ ),
    			segRealWatts = data.responseText.indexOf( 'pageView.power({"visible":true' ) !== -1;
  			scrapedData[i].measuredWatts = false;
  			if ( segKilosRaw ){
  				segKilos = segKilosRaw[0] /* (.match() returns an array) */
  					.replace( 'activityAthleteWeight(', '' )
  					.replace( ')', '' );
  				scrapedData[i].kilos = segKilos;
  			}
  			if ( segRealWatts ){
  				scrapedData[i].measuredWatts = true;
  			}
  			displayWkg( scrapedData, i );
    	}
  	});
  }

  function displayWkg( scrapedData, i ){
  	let segPath = scrapedData[i].path,
  		segWatts = scrapedData[i].watts,
  		segKilos = scrapedData[i].kilos,
  		elem = jQuery( `#segments tr.selected div.leaderboard table tbody tr td:nth-child(3n+1) a[href="${segPath}"]` );
  		if ( segWatts && segKilos && elem ) {
  			let wkg = Number( Math.round( ( segWatts / segKilos ) + 'e2' ) + 'e-2' ).toFixed( 2 ),
          measuredWatts = scrapedData[i].measuredWatts;;
        //console.log(scrapedData[i]);
  			scrapedData[i].wkg = wkg;
  			elem.parent()
  				.next()
  				.fadeOut()
  				.addClass( 'stravawkom' )
  				.html( ( measuredWatts ? '&#9889; ' : '' ) + `${wkg} <abbr class="unit" title="watts per kilogram">W/kg</abbr>` )
  				.css({'filter' : 'grayscale(1)'});
  		}
  	jQuery( 'td.stravawkom' ).fadeIn();
  }
};

// TODO: attach wkomForStrava() to listener
