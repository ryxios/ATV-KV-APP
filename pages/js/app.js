// Dom7
var $$ = Dom7;
//Step 1: initialize communication with the platform
var platform = new H.service.Platform({
	app_id: 'KrtjwpiCigj7HfHVbWUV',
	app_code: 'VmU0RxvNLsqa5cgubz7rXA',
	useCIT: true,
	useHTTPS: true
});
wochentag = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
monat = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

function addZero(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

myteam = localStorage.getItem("myteam")

// Theme
var theme = 'ios';
if (document.location.search.indexOf('theme=') >= 0) {
	theme = document.location.search.split('theme=')[1].split('&')[0];
}
// Init App
var app = new Framework7({
	id: 'io.framework7.testapp',
	root: '#app',
	theme: theme,
	statusbar: {
		overlay: true,
	},
	on: {
		init: function() {
			if (localStorage.getItem("firstrun") === null) {
				var dbwhere = "Teams";
				var listtyp = "Firstrun";
				var typ = "Teams";
				getdata(dbwhere, listtyp, typ);
			} else {
				if(myteam == "alle"){
					var dbwhere = "Spiele";
					var typ = "Spiele";
				}else{
					var dbwhere = "Spiele-" + myteam;
					var typ = "SpieleTeams"
				}
				var listtyp = "Homespiel";
				getdata(dbwhere, listtyp,typ);
				settingsteam();
        		getposts();
			}
		}
	},
	routes: routes,
});

spieldetailpopup = app.popup.create({
	content: '<div class="popup spieldetailslink">' +
		'<div class="navbar">' +
		'<div class="navbar-inner">' +
		'<div class="title popuptitle">Spieldetails</div>' +
		'<div class="right">' +
		'<!-- Link to close popup -->' +
    '<a href="#" onclick="spieldetailpopup.close()" class="link popup-close">'+
    '<i class="icon f7-icons ios-only">close</i>'+
    '<i class="icon material-icons md-only">close</i>'+
    '</a>'+
		'</div>' +
		'</div>' +
		'</div>' +
		'<div id="basicMap"></div>' +
		'<div class="card">' +
		'<div class="card-header popupheim">' +
		'</div>' +
		'<div class="card-header popupgast">' +
		'</div>' +
		'<div class="card-content card-content-padding details">' +
		'</div>' +
		'<div class="card-footer"><span class="badge popupleague"></span><a href="#" target="_blank" class="link float-right post-link-more ext-spieldetails external"><i class="icon f7-icons">exit</i> Spieldetails</a></div>' +
		'</div>' +
		'</div>',
	on: {
		opened: function() {
			spieldetailspopup();
		},
	},
}, )

function settingsteam() {
	if ($$(".settingsteamlist").length > 0) {
		$$(".settingsteamlist").remove()
	}
	Framework7.request.get('serv.php?f=getdata&dbwhere=Teams&typ=Teams', function(data) {
		result = JSON.parse(data)
		//console.log(result)
		if(myteam == "alle"){
			var output = '<div class="list inset settingsteamlist"><ul>' +
				'<li class="item-divider">Mein Team</li>' +
				'<li><a href="#" class="item-link chooseteam panel-close" data-teamid="alle">' +
				'<div class="item-content"><div class="item-inner"><div class="item-title">Ganzer Verein</div></div></div></a></li>' +
				'<li class="item-divider">Anderes Team wählen</li>';
		}else{
		var obj = $.grep(result, function(n, index) {
			return n.teamId == myteam;
		});
		var league1 = obj[0].groupText.split("-")
		var output = '<div class="list inset settingsteamlist"><ul>' +
			'<li class="item-divider">Mein Team</li>' +
			'<li><a href="#" class="item-link chooseteam panel-close" data-teamid="' + obj[0].teamId + '">' +
			'<div class="item-content"><div class="item-inner"><div class="item-title"><div class="item-header">' + league1[0] + '</div>' + obj[0].teamName + '</div></div></div></a></li>' +
			'<li class="item-divider">Anderes Team wählen</li>';
			if (myteam != "alle"){
				output+= '<li><a href="#" class="item-link chooseteam panel-close" data-teamid="alle">' +
				'<div class="item-content"><div class="item-inner"><div class="item-title">Ganzer Verein</div></div></div></a></li>';
			}
		}
		for (var i in result) {
			var league = result[i].groupText.split("-")
			output += '<li><a href="#" class="item-link chooseteam panel-close" data-teamid="' + result[i].teamId + '">' +
				'<div class="item-content"><div class="item-inner"><div class="item-title"><div class="item-header">' + league[0] + '</div>' + result[i].teamName + '</div></div></div></a></li>'
		}
		output += '</ul></div>'
		//console.log(output)
		$('.settingsteam').append(output)
    $('.chooseteam').click(function() {
  		myteam = $$(this).attr("data-teamid");
  		localStorage.setItem("myteam", myteam)
			if(myteam == "alle"){
				var dbwhere = "Spiele";
				typ = "Spiele"
			}else{
  		var dbwhere = "Spiele-" + myteam;
  		typ = "SpieleTeams"
		}
  		var listtyp = "Homespiel";
  		getdata(dbwhere, listtyp, typ);
  		settingsteam()
  	});
	});
}

function spieldetailspopup() {
	data = JSON.parse(spieldetailpopup.linkelement)
  typ = spieldetailpopup.typ;
  //console.log(typ)
	var d = new Date(data.gameDateTime);
	var tag = d.getDate();
	var tagZahl = d.getDay();
	var monatZahl = d.getMonth();
	var stunde = d.getHours();
	var minute = addZero(d.getMinutes());
	var league = data.leagueShort.split(" ")
  var mapslink = "https://www.google.com/maps?q="+data.venueAddress+","+data.venueCity+","+data.venueZip
	$('.popupheim').text('Heim: ' + data.teamAName);
	$('.popupgast').text('Gast: ' + data.teamBName);
	$('.popupleague').text(league[0]);
	$('.ext-spieldetails').attr('href','https://www.handball.ch/de/matchcenter/spiele/'+ data.gameId)
  if (typ === "Spiele") {
		$('.details').html('<a href="'+mapslink+'" target="_blank" class="link external">' + stunde + ':' + minute + ' Uhr @' + data.venue + '</a>');
      $('.popuptitle').text('Spieldetails');
  }else if (typ === "Resultate") {
    	$('.details').html('<div>' + data.teamAScoreFT + ':' + data.teamBScoreFT + ' (' + data.teamAScoreHT + ':' + data.teamBScoreHT + ')</div>');
      $('.popuptitle').text('Resultatdetails');
  }else if (typ === "Homespiel") {
    	$('.details').html('<a href="'+mapslink+'" target="_blank" class="link external">' + stunde + ':' + minute + ' Uhr @' + data.venue + '</a>');
      $('.popuptitle').text('Spieldetails');
  }

	var adresse = data.venueAddress;
	var stadt = data.venueCity;
	var plz = data.venueZip;
	$('#basicMap').empty();
	//Step 2: initialize a map - this map is centered over California
	map = new H.Map(document.getElementById('basicMap'),
		defaultLayers.normal.map, {
			center: {
				lat: 46.8095948,
				lng: 7.1031397,
			},
			zoomlevel: 15,
			pixelRatio: pixelRatio
		});
	var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

	// Create the default UI components
	var ui = H.ui.UI.createDefault(map, defaultLayers);

	// Hold a reference to any infobubble opened
	var bubble;

	// Obtain the default map types from the platform object:
	geocode(platform, adresse, stadt, plz)
}

function createteamslist(data, listtyp) {
	if ($$(".teamslist").length > 0) {
		$$(".teamslist").remove()
	}
	var output = '<div class="list teamslist"><ul>';
	output += '<li><a href="#" class="item-link smart-select smart-select-init" data-open-in="sheet" data-close-on-select="true">';
	output += '<select id="' + listtyp + '-select">';
	output += '<option value="' + listtyp + '">Ganzer Verein</option>';
	for (var i in data) {
		output += '<option value="' + listtyp + '-' + data[i].teamId + '">' + data[i].groupText + ' - ' + data[i].teamName + '</option>';
	}
	output += '</select>';
	output += '<div class="item-content">';
	output += '<div class="item-inner">';
	output += '<div class="item-title">Team:</div>';
	output += '<div class="item-after teams">Ganzer Verein</div>';
	output += '</div>';
	output += '</div></a></li>';
	output += '</ul></div>';
	var firstteam = listtyp;
	if (listtyp === "Firstrun") {
		firstrun(output)
	} else {
		$$('.teamscontainer' + listtyp).append(output);
		if(myteam == "alle"){
			var firstteam = listtyp;
			typ = listtyp
		}else if (myteam != undefined) {
			firstteam = listtyp + "-" + myteam;
			console.log(data);
			var obj = $.grep(data, function(n, index) {
				return n.teamId == myteam;
			});
			console.log(obj)
			$$('.teams').text(obj[0].groupText + ' - ' + obj[0].teamName)
			$("#"+listtyp + "-select").val(myteam);
			typ = listtyp+"Teams"
		}
		if (listtyp === "Ranglisten") {
			firstteam = listtyp;
			typ = "Rangliste";
		}
		getdata(firstteam, listtyp, typ, myteam);
		smartSelect = app.smartSelect.create({ /* parameters */ });
	}

}

function getdata(dbwhere, listtyp, typ, teamid) {
	console.log(typ);
	Framework7.request.get('serv.php?f=getdata&dbwhere=' + dbwhere +'&typ='+ typ, function(data) {
		result = JSON.parse(data)
		//console.log(result);
		if (dbwhere === "Teams") {
			//console.log(listtyp);
			createteamslist(result, listtyp)
		} else if (listtyp === "Spiele") {
			//console.log("Spiele");
			createspielelist(result, listtyp)
		} else if (listtyp === "Resultate") {
			//console.log("Resultate");
			createspielelist(result, listtyp)
		} else if (listtyp === "Ranglisten") {
			//console.log("Rangliste");
			createranglist(result, listtyp, teamid)
		} else if (listtyp === "Homespiel") {
			//console.log("Home");
			homespiel(result, listtyp)
		} else if (listtyp === "Homeresultat") {
			//console.log("Home");
			homeresultat(result, listtyp)
		}
	});
}

function firstrun(output) {
	var dynamicPopup = app.popup.create({
		content: '<div class="popup view view-firstrun"><div class="ios-style-title">Wähle dein Team</div>' + output +'<button class="button button-big button-fill saveteam">Speichern</button></div>',
		// Events
		on: {
			open: function(popup) {
				//console.log('Popup open');
			},
			opened: function(popup) {
				//console.log('Popup opened');
			},
		}
	});
	dynamicPopup.open();
	var firstrunview = app.views.create('.view-firstrun');
	smartSelect = app.smartSelect.create({ /* parameters */ });
	$('.saveteam').click(function() {
		var res = $('#Firstrun-select').val().split("-")
		if (res[1] != undefined){
		myteam = res[1];
		var dbwhere = "Spiele-" + myteam;
		var typ = "SpieleTeams";
	}else{
		myteam = "alle";
		var dbwhere = "Spiele";}
		var typ = "Spiele";
		localStorage.setItem("myteam", myteam)
		localStorage.setItem("firstrun", "1")
		var listtyp = "Homespiel";
		smartSelect.close();
		dynamicPopup.close();
		getdata(dbwhere, listtyp, typ);
    settingsteam();
    getposts()
	});
}

function createranglist(result, listtyp, team) {
	console.log(result, listtyp, team)
	if (myteam == "alle"){
		var teamids = Object.keys(result)
		//console.log(teamids);
		if ($$(".ranglist").length > 0) {
			$$(".ranglist").remove()
		}
		var output = '<div class="list accordion-list ranglist"><ul class="rangliste-ul">';
		output += '</ul></div>';
		$$('.ranglistencontainer').append(output);
		for (var i in teamids) {
			var teamid = teamids[i];
			var ranking = result[teamid].ranking;
			var output1 = '<li class="accordion-item"><a href="#" class="item-content item-link">';
			output1 += '<div class="item-inner">';
			output1 += '<div class="item-title">' + result[teamid].leagueShort + '</div>';
			output1 += '</div></a>';
			output1 += '<div class="accordion-item-content">';
			output1 += '<div class="block block-strong data-table data-table-collapsible data-table-init ranglist-' + i + '">';
			output1 += '<table><thead><tr>';
			output1 += '<th class="label-cell">Team</th>';
			output1 += '<th class="label-numeric">S/U/N</th>';
			output1 += '<th class="label-numeric">T+/TD/T-</th>';
			output1 += '<th class="label-numeric">Sp.</th>';
			output1 += '<th class="label-numeric">P.</th>';
			output1 += '</tr></thead>';
			output1 += '<tbody class="rangliste-ul-tbody-' + i + '">';
			output1 += '</tbody></table></div>';
			output1 += '</div>';
			output += '</li>';
			$$('.rangliste-ul').append(output1);
			promcan = result[teamid].promotionCandidate;
			relcan = result[teamid].relegationCandidate;
			direl = result[teamid].directRelegation;
			dirprom = result[teamid].directPromotion;
			totalTeams = result[teamid].totalTeams;
			var output2 = " ";
			for (var a in ranking) {
				rank = ranking[a].rank;
				if (rank <= dirprom) {
					if (dirprom < 1) {
						promstyle = "nothing";
					} else {
						promstyle = "dirprom";
					}
				} else if (dirprom < rank && rank <= dirprom + promcan) {
					promstyle = "promcan";
				} else if (totalTeams - relcan <= rank && rank <= totalTeams - direl) {
					if (relcan < 1) {
						//nothing
					} else {
						promstyle = "relcan";
					}
				} else if (totalTeams - direl < rank) {
					if (direl < 1) {
						//nothing
					} else {
						promstyle = "dirrel";
					}
				} else {
					promstyle = "nothing";
				}
				//console.log(promstyle)
				output2 += '<tr class="' + promstyle + ' rangliste-row"><td class="label-cell">' + ranking[a].rank + '. ' + ranking[a].teamName + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalWins + '/' + ranking[a].totalDraws + '/' + ranking[a].totalLoss + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalScoresPlus + '/' + ranking[a].totalScoresDiff + '/' + ranking[a].totalScoresMinus + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalGames + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalPoints + '</td></tr>';
				//console.log(output2)
			}
			$$('.rangliste-ul-tbody-' + i).html(output2);
			app.dataTable.create({
				el: '.ranglist-' + i
			});
		}

	}else if (team != undefined) {
		//console.log(typeof team)
		if ($$(".ranglist").length > 0) {
			$$(".ranglist").remove()
		}
		var ranking = result[team].ranking;
		//console.log(ranking)
		var output = '<div class="ranglist"><div class="block block-strong data-table data-table-collapsible data-table-init">';
		output += '<table><thead><tr>';
		output += '<th class="label-cell">Team</th>';
		output += '<th class="label-numeric">S/U/N</th>';
		output += '<th class="label-numeric">T+/TD/T-</th>';
		output += '<th class="label-numeric">Sp.</th>';
		output += '<th class="label-numeric">P.</th>';
		output += '</tr></thead>';
		output += '<tbody>';
		promcan = result[team].promotionCandidate;
		relcan = result[team].relegationCandidate;
		direl = result[team].directRelegation;
		dirprom = result[team].directPromotion;
		totalTeams = result[team].totalTeams;
		for (var a in ranking) {
			rank = ranking[a].rank;
			if (rank <= dirprom) {
				if (dirprom < 1) {
					promstyle = "nothing";
				} else {
					promstyle = "dirprom";
				}
			} else if (dirprom < rank && rank <= dirprom + promcan) {
				promstyle = "promcan";
			} else if (totalTeams - relcan <= rank && rank <= totalTeams - direl) {
				if (relcan < 1) {
					//nothing
				} else {
					promstyle = "relcan";
				}
			} else if (totalTeams - direl < rank) {
				if (direl < 1) {
					//nothing
				} else {
					promstyle = "dirrel";
				}
			} else {
				promstyle = "nothing";
			}
			//console.log(promstyle)
			output += '<tr class="' + promstyle + '"><td class="label-cell">' + ranking[a].rank + '. ' + ranking[a].teamName + '</td>';
			output += '<td class="label-numeric">' + ranking[a].totalWins + '/' + ranking[a].totalDraws + '/' + ranking[a].totalLoss + '</td>';
			output += '<td class="label-numeric">' + ranking[a].totalScoresPlus + '/' + ranking[a].totalScoresDiff + '/' + ranking[a].totalScoresMinus + '</td>';
			output += '<td class="label-numeric">' + ranking[a].totalGames + '</td>';
			output += '<td class="label-numeric">' + ranking[a].totalPoints + '</td></tr>';
		}
		output += '</tbody></table></div>';
		output+= '<div class="block block-strong"><p>'+ result[team].modus +'</p><p>'+ result[team].modusHtml +'</p></div></div>'
		//console.log(output);
		$$('.ranglistencontainer').append(output);
		app.dataTable.create({
			el: '.ranglist'
		});

	} else {
		var teamids = Object.keys(result)
		//console.log(teamids);
		if ($$(".ranglist").length > 0) {
			$$(".ranglist").remove()
		}
		var output = '<div class="list accordion-list ranglist"><ul class="rangliste-ul">';
		output += '</ul></div>';
		$$('.ranglistencontainer').append(output);
		for (var i in teamids) {
			var teamid = teamids[i];
			var ranking = result[teamid].ranking;
			var output1 = '<li class="accordion-item"><a href="#" class="item-content item-link">';
			output1 += '<div class="item-inner">';
			output1 += '<div class="item-title">' + result[teamid].leagueShort + '</div>';
			output1 += '</div></a>';
			output1 += '<div class="accordion-item-content">';
			output1 += '<div class="block block-strong data-table data-table-collapsible data-table-init ranglist-' + i + '">';
			output1 += '<table><thead><tr>';
			output1 += '<th class="label-cell">Team</th>';
			output1 += '<th class="label-numeric">S/U/N</th>';
			output1 += '<th class="label-numeric">T+/TD/T-</th>';
			output1 += '<th class="label-numeric">Sp.</th>';
			output1 += '<th class="label-numeric">P.</th>';
			output1 += '</tr></thead>';
			output1 += '<tbody class="rangliste-ul-tbody-' + i + '">';
			output1 += '</tbody></table></div>';
			output1 += '</div>';
			output += '</li>';
			$$('.rangliste-ul').append(output1);
			promcan = result[teamid].promotionCandidate;
			relcan = result[teamid].relegationCandidate;
			direl = result[teamid].directRelegation;
			dirprom = result[teamid].directPromotion;
			totalTeams = result[teamid].totalTeams;
			var output2 = " ";
			for (var a in ranking) {
				rank = ranking[a].rank;
				if (rank <= dirprom) {
					if (dirprom < 1) {
						promstyle = "nothing";
					} else {
						promstyle = "dirprom";
					}
				} else if (dirprom < rank && rank <= dirprom + promcan) {
					promstyle = "promcan";
				} else if (totalTeams - relcan <= rank && rank <= totalTeams - direl) {
					if (relcan < 1) {
						//nothing
					} else {
						promstyle = "relcan";
					}
				} else if (totalTeams - direl < rank) {
					if (direl < 1) {
						//nothing
					} else {
						promstyle = "dirrel";
					}
				} else {
					promstyle = "nothing";
				}
				//console.log(promstyle)
				output2 += '<tr class="' + promstyle + ' rangliste-row"><td class="label-cell">' + ranking[a].rank + '. ' + ranking[a].teamName + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalWins + '/' + ranking[a].totalDraws + '/' + ranking[a].totalLoss + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalScoresPlus + '/' + ranking[a].totalScoresDiff + '/' + ranking[a].totalScoresMinus + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalGames + '</td>';
				output2 += '<td class="label-numeric">' + ranking[a].totalPoints + '</td></tr>';
				//console.log(output2)
			}
			$$('.rangliste-ul-tbody-' + i).html(output2);
			app.dataTable.create({
				el: '.ranglist-' + i
			});
		}

	}


}

function createspielelist(data, listtyp) {
	olddate = "x";
	//console.log(data);
	if ($$(".spielelist").length > 0) {
		$$(".spielelist").remove()
	}
	var output = '<div class="list media-list chevron-center spielelist"><ul>';
	if (data.length > 0){
	for (var i in data) {
		var d = new Date(data[i].gameDateTime);
		//console.log("olddate "+olddate)
    //console.log("gamedate "+d)
		var tag = d.getDate();
		var tagZahl = d.getDay();
		var monatZahl = d.getMonth();
		var stunde = d.getHours();
		var minute = addZero(d.getMinutes());
		var league = data[i].leagueShort.split(" ")
		if (olddate == "x"){
			output += '<li class="item-divider">' + wochentag[tagZahl] + ' ' + tag + '. ' + monat[monatZahl] + '</li>';
		}else if (olddate.getDate() != d.getDate()) {
			output += '<li class="item-divider">' + wochentag[tagZahl] + ' ' + tag + '. ' + monat[monatZahl] + '</li>';
		} else {
			//
		}
		output += "<li><a href='#' class='item-link item-content spieldetailslink' data-typ='"+ listtyp +"' data-game='" + JSON.stringify(data[i]) + "'>";
		output += '<div class="item-media"><span class="badge">' + league[0] + '</span></div>'
		output += '<div class="item-inner">';
		output += '<div class="item-title-row">';
		output += '<div class="item-title">' + data[i].teamAName + ' vs. ' + data[i].teamBName + '</div>';
		output += '</div>';
		if (listtyp == "Spiele") {
			output += '<div class="item-subtitle">' + stunde + ':' + minute + ' Uhr @' + data[i].venue + '</div>';
		} else if (listtyp == "Resultate") {
			output += '<div class="item-subtitle">' + data[i].teamAScoreFT + ':' + data[i].teamBScoreFT + ' (' + data[i].teamAScoreHT + ':' + data[i].teamBScoreHT + ')</div>';
			output += '<div class="item-text">' + stunde + ':' + minute + ' Uhr @' + data[i].venue + '</div>';
		}
		output += '</div></a></li>';
		olddate = d;
	}
}else{
	output+="<div class='card'><blockquote>Keine "+ listtyp +" vorhanden</blockquote></div>"
}
	output += '</ul></div>';

	if (listtyp == "Spiele") {
		$$('.spielecontainer').append(output);
	} else if (listtyp == "Resultate") {
		$$('.resultatecontainer').append(output);
	}

}

function homespiel(data, listtyp) {
	console.log();
	if ($$(".homespiel").length > 0) {
		$$(".homespiel").remove()
	}
	console.log(myteam);
	if(myteam == "alle"){
		var dbwhere = "Resultate";
		var typ = "Resultate";
		var anzahl = 3
		var output = "<div class='homespiel'><div class='ios-style-title'>Nächste Spiele</div>";
	}else{
	var dbwhere = "Resultate-"+myteam;
	var typ = "ResultateTeams";
	var anzahl = 1
	var output = "<div class='homespiel'><div class='ios-style-title'>Nächstes Spiel</div>";
}
	if (data.length > 0){
	var i;

	for (i = 0; i < anzahl; i++) {
		var d = new Date(data[i].gameDateTime);
		var tag = d.getDate();
		var tagZahl = d.getDay();
		var monatZahl = d.getMonth();
		var stunde = d.getHours();
		var minute = addZero(d.getMinutes());
		var league = data[i].leagueShort.split(" ");
	 	output+= "<div class='card homeSpiel spieldetailslink' data-typ='"+ listtyp +"' data-game='" + JSON.stringify(data[i]) + "'>" +
			'<div class="card-header">' + wochentag[tagZahl] + ' ' + tag + '. ' + monat[monatZahl] +
			'</div>' +
			'<div class="card-header">Heim: ' + data[i].teamAName +
			'</div>' +
			'<div class="card-header">Gast: ' + data[i].teamBName +
			'</div>' +
			'<div class="card-content card-content-padding details"><div>' + stunde + ':' + minute + ' Uhr @' + data[i].venue + '</div>' +
			'</div>' +
			'<div class="card-footer"><span class="badge popupleague">' + league[0] + '</span></div>' +
			'</div>';
}
	}else{
		output+="<div class='card'><blockquote>Keine Spiele vorhanden</blockquote></div>"
	}
 	output+= "</div"

	$$('.homespielcontainer').append(output);
	console.log((myteam == "alle"))
	var listtyp = "Homeresultat";

	getdata(dbwhere, listtyp, typ);

}

function homeresultat(data, listtyp) {
	if ($$(".homeresultat").length > 0) {
		$$(".homeresultat").remove()
	}
	console.log(myteam);
	console.log((myteam == "alle"));
	if(myteam == "alle"){
		var anzahl2 = 3
	var output = "<div class='homeresultat'><div class='ios-style-title'>Letzte Resultate</div>";
	}else{
	var anzahl2 = 1
	var output = "<div class='homeresultat'><div class='ios-style-title'>Letztes Resultat</div>";
}
	if (data.length > 0){
	var c;

	for (c = 0; c < anzahl2; c++) {
		console.log(c);
		var d = new Date(data[c].gameDateTime);
		var tag = d.getDate();
		var tagZahl = d.getDay();
		var monatZahl = d.getMonth();
		var stunde = d.getHours();
		var minute = addZero(d.getMinutes());
		var league = data[c].leagueShort.split(" ");
	 output+= "<div class='card homeSpiel' data-game='" + JSON.stringify(data[c]) + "'>" +
		'<div class="card-header">' + wochentag[tagZahl] + ' ' + tag + '. ' + monat[monatZahl] +
		'</div>' +
		'<div class="card-header">Heim: ' + data[c].teamAName +
		'</div>' +
		'<div class="card-header">Gast: ' + data[c].teamBName +
		'</div>' +
		'<div class="card-content card-content-padding details"><div>' + data[c].teamAScoreFT + ':' + data[c].teamBScoreFT + ' (' + data[c].teamAScoreHT + ':' + data[c].teamBScoreHT + ')</div>' +
		'</div>' +
		'<div class="card-footer"><span class="badge popupleague">' + league[0] + '</span></div>' +
		'</div>';
	}
}else{
		output+="<div class='card'><blockquote>Keine Resultate vorhanden</blockquote></div>"
	}
	output+='</div>'
	$$('.homeresultatcontainer').append(output);
}

$(document).ready(function() {

	$('#Spiele-select').change(function() {
		var res = $(this).val().split("-")
		var teamid = $(this).val();
		listtyp = res[0]
		//console.log(res);
		teamselected(teamid, listtyp)

	});
});
$(document).on('change', '#Resultate-select,#Ranglisten-select,#Spiele-select', function() {
	var res = $(this).val().split("-")
	var teamid = $(this).val();
	listtyp = res[0]
	//console.log(res);
	teamselected(teamid, listtyp)

});
$(document).on('click', '.spieldetailslink, .spieldetails-close', function() {
	//console.log($$(this))
	if ($$(this).attr("data-game") != undefined) {
		spieldetailpopup.linkelement = $$(this).attr("data-game");
    spieldetailpopup.typ = $$(this).attr("data-typ");
		spieldetailpopup.open();
	}

});

function teamselected(teamid, listtyp) {
	//console.log(teamid, listtyp);
	if (listtyp == "Ranglisten") {
		var res = teamid.split("-")
		//console.log(teamid, listtyp)
		getdata(listtyp, listtyp, typ, res[1])
	} else {
		if (listtyp == "Spiele"){
			typ = "SpieleTeam"
		}else if (listtyp == "Resultate"){
			typ = "ResultateTeam";
		}
		getdata(teamid, listtyp, typ)
	}
}
