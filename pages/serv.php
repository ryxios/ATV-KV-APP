<?php
error_reporting(E_ALL);
function getdata(){
$jetzt     = date('Y-m-d H:i:s');
$dbwhere = $_GET['dbwhere'];
$typ = $_GET['typ'];
$servername = "localhost:3306";
$username = "bn_wordpress";
$password = "9d15d3754f";
$dbname = "bitnami_wordpress";
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql1 = "SELECT * FROM wp_shv_plugin WHERE name = '" . $dbwhere . "'";
$sql2 = "SELECT * FROM wp_options WHERE option_name = 'update'";
$sql3 = "SELECT * FROM wp_options WHERE option_name = 'vereinsId'";
$sql4 = "SELECT * FROM wp_options WHERE option_name = 'auth'";
$data = $conn->query($sql1)->fetch_assoc();
$update = $conn->query($sql2)->fetch_assoc();
$id = $conn->query($sql3)->fetch_assoc();
$auth = $conn->query($sql4)->fetch_assoc();
//print("<pre>".//print_r($update['option_value'],true)."</pre>");
$datetime1 = new DateTime($data['time']);
$datetime2 = new DateTime($jetzt);
$interval  = $datetime1->diff($datetime2);
if ($interval->format('%i') > $update['option_value']) {
  if ($typ == "Spiele") {
          //echo $typ;
          $link = "http://api.handball.ch/rest/v1/clubs/" . $id['option_value'] . "/games?status=planned";
          //echo $link;
          update_database($link,$typ,$dbwhere,$auth['option_value'],$conn);
  } //$dbwhere == "Spiele"
  elseif ($typ == "Resultate") {
          //echo $typ;
          $link = "http://api.handball.ch/rest/v1/clubs/" . $id['option_value'] . "/games?status=played&order=desc";
          //echo $link;
          update_database($link,$typ,$dbwhere,$auth['option_value'],$conn);
  } //$dbwhere == "Resultate"
          elseif ($typ == "SpieleTeams") {
          //echo $typ;
          $teamid =  explode("-", $dbwhere);
          $link = "http://api.handball.ch/rest/v1/teams/". $teamid[1] ."/games?status=planned";
          //echo $link;
          update_database($link,$typ,$dbwhere,$auth['option_value'],$conn);
  } //$dbwhere == "SpieleTeams"
          elseif ($typ == "ResultateTeams") {
          //echo $typ;
          $teamid =  explode("-", $dbwhere);
          $link = "http://api.handball.ch/rest/v1/teams/". $teamid[1] ."/games?status=played&order=desc";
          update_database($link,$typ,$dbwhere,$auth['option_value'],$conn);
  } elseif ($typ == "Teams") {
    //echo "Where=".$dbwhere;
    print_r($data['data']);
  } elseif ($typ == "Rangliste") {
      //echo "Where=".$dbwhere;
      updaterangliste($typ,$dbwhere,$auth['option_value'],$conn);
      //print_r($data['data']);
      }
  //$
////print("<pre>".//print_r($interval,true)."</pre>");
}else{
  print_r($data['data']);
}

//$sql = "SELECT * FROM wp_shv_plugin WHERE name = '" . $dbwhere . "'";
//$dbdata = $pdo->get_row("SELECT * FROM wp_shv_plugin WHERE name = '" . $dbwhere . "'");
//$datadb = $pdo->get_row("SELECT * FROM wp_shv_plugin WHERE name = 'Spiele'");
////print_r($dbdata['data']);
}
function update_database($link,$typ,$dbwhere,$auth,$conn){
  $curl = curl_init();
  curl_setopt_array($curl, array(
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
  ));
  $response = curl_exec($curl);
  $err      = curl_error($curl);
  //echo $err;
  curl_close($curl);
  if ($err) {
          //echo "cURL Error #:" . $err;
  } //$err
  else {
    $jetzt = date('Y-m-d H:i:s');
    $sql = "UPDATE wp_shv_plugin SET time='" . $jetzt . "', data='" . $response . "' WHERE name='" . $dbwhere . "'";

if ($conn->query($sql) === TRUE) {
    //echo "Record updated successfully";
    echo $response;
} else {
    //echo "Error updating record: " . $conn->error;
}


  }
}

function updaterangliste($typ,$dbwhere,$auth,$conn){
  $teamsjson  = $conn->query("SELECT * FROM wp_shv_plugin WHERE name = 'Teams'")->fetch_assoc();
  $teamsphp   = json_decode(json_encode($teamsjson), True);
  $teams      = json_decode($teamsphp['data'], true);
  $ranglisten = array( );
  $jetzt      = date('Y-m-d H:i:s');
  foreach ($teams as $team) {
          $teamId = $team['teamId'];
          $gruppe = $team['groupText'];
          $curl   = curl_init();
          curl_setopt_array($curl, array(
                  CURLOPT_URL => "http://api.handball.ch/rest/v1/teams/" . $teamId . "/group",
                  CURLOPT_RETURNTRANSFER => true,
                  CURLOPT_ENCODING => "",
                  CURLOPT_MAXREDIRS => 10,
                  CURLOPT_TIMEOUT => 30,
                  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                  CURLOPT_CUSTOMREQUEST => "GET",
                  CURLOPT_HTTPHEADER => array(
                          "authorization: Basic " . $auth,
                          "cache-control: no-cache",
                          "postman-token: dc803738-1a57-3107-9da8-7994854f71be"
                  )
          ));
          $response = curl_exec($curl);
          $err      = curl_error($curl);
          curl_close($curl);
          if ($err) {
                  echo "cURL Error #:" . $err;
          } //$err
          else {
                  $assoc               = true;
                  $result              = json_decode($response, $assoc);
                  $ranglisten[$teamId] = $result;
          }
  } //$teams as $team
  $data    = json_encode($ranglisten);
  print_r($data);
}
call_user_func($_GET['f']);
