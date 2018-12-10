<?php
error_reporting( E_ALL );
header( "Cache-Control: no-store, no-cache, must-revalidate, max-age=0" );
header( "Cache-Control: post-check=0, pre-check=0", false );
header( "Pragma: no-cache" );
header( 'Content-Type: application/json; charset=utf-8' );
function getdata()
{
    $jetzt      = date( 'Y-m-d H:i:s' );
    $dbwhere    = $_GET[ 'dbwhere' ];
    $typ        = $_GET[ 'typ' ];
    $servername = "localhost:3306";
    $username   = "bn_wordpress";
    $password   = "9d15d3754f";
    $dbname     = "bitnami_wordpress";
    $conn       = new mysqli( $servername, $username, $password, $dbname );
    if ( $conn->connect_error ) {
        die( "Connection failed: " . $conn->connect_error );
    } else {
        $conn->set_charset( "utf8" );
    }
    $sql1      = "SELECT * FROM wp_shv_plugin WHERE name = '" . $dbwhere . "'";
    $sql2      = "SELECT * FROM wp_options WHERE option_name = 'update'";
    $sql3      = "SELECT * FROM wp_options WHERE option_name = 'vereinsId'";
    $sql4      = "SELECT * FROM wp_options WHERE option_name = 'auth'";
    $data      = $conn->query( $sql1 )->fetch_assoc();
    $update    = $conn->query( $sql2 )->fetch_assoc();
    $id        = $conn->query( $sql3 )->fetch_assoc();
    $auth      = $conn->query( $sql4 )->fetch_assoc();
    $datetime1 = new DateTime( $data[ 'time' ] );
    $datetime2 = new DateTime( $jetzt );
    $interval  = $datetime1->diff( $datetime2 );
    if ( $interval->format( '%i' ) > $update[ 'option_value' ] ) {
        if ( $typ == "Spiele" ) {
            $link = "http://api.handball.ch/rest/v1/clubs/" . $id[ 'option_value' ] . "/games?status=planned";
            update_database( $link, $typ, $dbwhere, $auth[ 'option_value' ], $conn );
        } elseif ( $typ == "Resultate" ) {
            $link = "http://api.handball.ch/rest/v1/clubs/" . $id[ 'option_value' ] . "/games?status=played&order=desc";
            update_database( $link, $typ, $dbwhere, $auth[ 'option_value' ], $conn );
        } elseif ( $typ == "SpieleTeams" ) {
            $teamid = explode( "-", $dbwhere );
            $link   = "http://api.handball.ch/rest/v1/teams/" . $teamid[ 1 ] . "/games?status=planned";
            update_database( $link, $typ, $dbwhere, $auth[ 'option_value' ], $conn );
        } elseif ( $typ == "ResultateTeams" ) {
            $teamid = explode( "-", $dbwhere );
            $link   = "http://api.handball.ch/rest/v1/teams/" . $teamid[ 1 ] . "/games?status=played&order=desc";
            update_database( $link, $typ, $dbwhere, $auth[ 'option_value' ], $conn );
        } elseif ( $typ == "Teams" ) {
            print_r( $data[ 'data' ] );
        } elseif ( $typ == "Rangliste" ) {
            updaterangliste( $typ, $dbwhere, $auth[ 'option_value' ], $conn );
        }
    } else {
        print_r( $data[ 'data' ] );
    }
}
function update_database( $link, $typ, $dbwhere, $auth, $conn )
{
    $curl = curl_init();
    curl_setopt_array( $curl, array(
         CURLOPT_URL => $link,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => array(
             "authorization: Basic " . $auth,
            "cache-control: no-cache",
            "postman-token: f6a3a98b-c89e-ae91-02ef-3b40b2eea428"
        )
    ) );
    $response = curl_exec( $curl );
    $err      = curl_error( $curl );
    curl_close( $curl );
    if ( $err ) {
    } else {
        $jetzt = date( 'Y-m-d H:i:s' );
        $sql   = "UPDATE wp_shv_plugin SET time='" . $jetzt . "', data='" . $response . "' WHERE name='" . $dbwhere . "'";
        if ( $conn->query( $sql ) === TRUE ) {
            echo $response;
        } else {
        }
    }
}
function updaterangliste( $typ, $dbwhere, $auth, $conn )
{
    $teamsjson  = $conn->query( "SELECT * FROM wp_shv_plugin WHERE name = 'Teams'" )->fetch_assoc();
    $teamsphp   = json_decode( json_encode( $teamsjson ), True );
    $teams      = json_decode( $teamsphp[ 'data' ], true );
    $ranglisten = array();
    $jetzt      = date( 'Y-m-d H:i:s' );
    foreach ( $teams as $team ) {
        $teamId = $team[ 'teamId' ];
        $gruppe = $team[ 'groupText' ];
        $curl   = curl_init();
        curl_setopt_array( $curl, array(
             CURLOPT_URL => "http://api.handball.ch/rest/v1/teams/" . $teamId . "/group",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "UTF-8",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                 "authorization: Basic " . $auth,
                "cache-control: no-cache",
                "postman-token: dc803738-1a57-3107-9da8-7994854f71be"
            )
        ) );
        $response = curl_exec( $curl );
        $err      = curl_error( $curl );
        curl_close( $curl );
        if ( $err ) {
            echo "cURL Error #:" . $err;
        } else {
            $assoc                 = true;
            $result                = json_decode( $response,$assoc);
            $result[ 'modusHtml' ] = str_replace("'","''",$result[ 'modusHtml' ]);
            $ranglisten[ $teamId ] = $result;
        }
    }
    $assoc = true;
    $data  = json_encode( $ranglisten, $assoc );
    $sql5  = "UPDATE wp_shv_plugin SET time='$jetzt',data='$data' WHERE name='$dbwhere'";
    if ( $conn->query( $sql5 ) === TRUE ) {
            print_r( $data );
    } else {
        echo "Error updating Time: " . $conn->error;
    }
}
function getplayerstats()
{
  $gameid = $_GET[ 'gameid' ];
    $teamid = $_GET[ 'teamid' ];
    $jetzt      = date( 'Y-m-d H:i:s' );
  $servername = "localhost:3306";
    $username   = "bn_wordpress";
    $password   = "9d15d3754f";
    $dbname     = "bitnami_wordpress";
    $conn       = new mysqli( $servername, $username, $password, $dbname );
    if ( $conn->connect_error ) {
        die( "Connection failed: " . $conn->connect_error );
    } else {
        //mysqli_set_charset($conn,"utf8");
    }
    a:
    $query = mysqli_query($conn, "SELECT * FROM wp_shv_plugin WHERE name ='gamestats-$teamid'");
    //print_r($query);

    if (!$query)
    {
        die('Error: ' . mysqli_error($conn));
    }

if(mysqli_num_rows($query) > 0){
    $data = $query->fetch_assoc();
    $dataarr = json_decode($data['data'],true);
    //print_r($data);
    if (array_key_exists($gameid, $dataarr)) {
    print_r(json_encode($dataarr[$gameid],true));
    }else{
    $curl = curl_init();
  curl_setopt_array($curl, array(
    CURLOPT_URL => "https://www.handball.ch/Umbraco/Api/MatchCenter/Query",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => "{\"operationName\":\"getGamePlayerStats\",\"variables\":{\"gameId\":\"".$gameid."\",\"isLive\":false},\"query\":\"query getGamePlayerStats(\$gameId: Int, \$isLive: Boolean) {\\n  gamePlayerStats(gameId: \$gameId, isLive: \$isLive) {\\n    gameId\\n    teamId\\n    playerId\\n    teamName\\n    dressNr\\n    dressString\\n    playerName\\n    scoreAndShot\\n    scoreAndShot7m\\n    scorePercentage\\n    technicalErrors\\n    total2Minutes\\n    totalSuspension\\n    totalShots\\n    totalShots7m\\n    totalScore\\n    totalScore7m\\n    totalWarnings\\n    isHome\\n    function\\n    saveAndShot\\n    saveAndShot7m\\n    savePercentage\\n    totalShotsGK\\n    totalSaves\\n    totalShots7mGK\\n    totalSaves7m\\n    dataSource\\n    language\\n    __typename\\n  }\\n}\\n\"}",
    CURLOPT_HTTPHEADER => array(
      "Content-Type: application/json",
      "Postman-Token: 55a26658-9df7-4a29-91cb-06f662aa80bb",
      "cache-control: no-cache"
    ),
  ));

  $response = curl_exec($curl);
  $err = curl_error($curl);

  curl_close($curl);

  if ($err) {
    echo "cURL Error #:" . $err;
  } else {
  	//echo $response;
    $responsearr = json_decode($response,true);
    $dataarr[$gameid] = $responsearr['data']['gamePlayerStats'];
    //print_r(count($dataarr[$gameid]));
    if(count($dataarr[$gameid])> 0){
    $datajson =json_encode($dataarr);
    $datajson2 = $conn->real_escape_string($datajson);
    //print_r(json_encode($dataarr[$gameid]));
    $sql8  = "UPDATE wp_shv_plugin SET time='$jetzt',data='$datajson2' WHERE name='gamestats-$teamid'";
    if ( $conn->query( $sql8 ) === TRUE ) {
            print_r(json_encode($dataarr[$gameid]));
    } else {
        echo "Error updating Time: " . $conn->error;
    }
    }else{
        print_r(json_encode($dataarr[$gameid]));
    }
  }
    }

}else{
$sql9 = "INSERT INTO `wp_shv_plugin` (`id`, `time`, `name`, `data`) VALUES (NULL, '$jetzt', 'gamestats-$teamid', '{}')";
if ($conn->query($sql9) === TRUE) {
    goto a;
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}
}

}
call_user_func( $_GET[ 'f' ] );