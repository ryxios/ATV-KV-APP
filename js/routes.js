var routes = [
  // Index page
  {
    path: '/',
    url: './index.html',
    name: 'home',
    on:{
      pageBeforeIn: function (){
        if(myteam == "alle"){
					var dbwhere = "Spiele";
          typ = "Spiele";
				}else{
        var dbwhere = "Spiele-"+myteam;
        typ = "SpieleTeam";
      }
        var listtyp = "Homespiel";
        getdata(dbwhere,listtyp,typ);
        getposts();
      }
    },
  },
  {
    path: '/spielplan/',
    url: './pages/spielplan.html',
    name: 'spielplan',
    on:{
      pageBeforeIn: function (){
        var dbwhere = "Teams";
        var listtyp = "Spiele";
        typ = "Teams";
        getdata(dbwhere,listtyp,typ);
      }
    },
  },
  // About page
  {
    path: '/resultate/',
    url: './pages/resultate.html',
    name: 'Resultate',
    on:{
      pageBeforeIn: function (){
        var dbwhere = "Teams";
        var listtyp = "Resultate";
        typ = "Teams";
        getdata(dbwhere,listtyp,typ);
      }
    },
  },
  {
    path: '/ranglisten/',
    url: './pages/ranglisten.html',
    name: 'Resultate',
    on:{
      pageBeforeIn: function (){
        var dbwhere = "Teams";
        var listtyp = "Ranglisten";
        typ = "Teams";
        getdata(dbwhere,listtyp,typ);
      }
    },
  },
];
