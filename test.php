<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "https://www.handball.ch/Umbraco/Api/MatchCenter/Query",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{\"operationName\":\"getGamePlayerStats\",\"variables\":{\"gameId\":\"375272\",\"isLive\":false},\"query\":\"query getGamePlayerStats(\$gameId: Int, \$isLive: Boolean) {\\n  gamePlayerStats(gameId: \$gameId, isLive: \$isLive) {\\n    gameId\\n    teamId\\n    playerId\\n    teamName\\n    dressNr\\n    dressString\\n    playerName\\n    scoreAndShot\\n    scoreAndShot7m\\n    scorePercentage\\n    technicalErrors\\n    total2Minutes\\n    totalSuspension\\n    totalShots\\n    totalShots7m\\n    totalScore\\n    totalScore7m\\n    totalWarnings\\n    isHome\\n    function\\n    saveAndShot\\n    saveAndShot7m\\n    savePercentage\\n    totalShotsGK\\n    totalSaves\\n    totalShots7mGK\\n    totalSaves7m\\n    dataSource\\n    language\\n    __typename\\n  }\\n}\\n\"}",
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
  echo $response;
}
