<?php
$config = parse_ini_file("config.ini");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode( file_get_contents( 'php://input' ), true );
     if ($data['name'] === 'rain') {
       // echo json_encode(array('data' => 'yes'));
       $newVal = $data['value'];
       $db = new mysqli('localhost', $config['user'], $config['pw']);
       $sql = "UPDATE sprinklers.rain SET rain = $newVal";
       $res = $db->query($sql);
       echo json_encode(array('code' => 'ok'));

     } elseif ($data['name'] === 'start_time') {
       $start_time = $data['start_time'];
       $days = "'" .implode("','", $data['days'])."'";
       $program = $data['program'];

       $db = new mysqli('localhost', $config['user'], $config['pw']);
       $sql = "UPDATE sprinklers.start_times SET program = '$program', start_time = '$start_time'";
       $res = $db->query($sql);

       $sql1 = "UPDATE
                  sprinklers.run_days
              SET run = 1
              WHERE
                program = '$program'
                AND day IN ($days)";
      $sql2 = "UPDATE
                 sprinklers.run_days
             SET run = 0
             WHERE
               program = '$program'
               AND day NOT IN ($days)";
       $res = $db->query($sql1);
       $res = $db->query($sql2);

       echo json_encode(array('code' => 'ok'));

     }
}
else {
  if ($_GET['name'] === 'schedule'){
    $db = new mysqli('localhost', $config['user'], $config['pw']);
    $sql = "SELECT
              s.program,
              sprinkler_group,
              duration,
              start_time
          FROM
              sprinklers.programs s
          LEFT JOIN sprinklers.start_times t
              ON s.program = t.program
          WHERE
              s.program = 'A'
          ORDER BY position";
    $res = $db->query($sql);
    $data = [];
    while($row = $res->fetch_assoc()) {
      $data['program'] = $row['program'];
      $data['sprinkler'][$row['sprinkler_group']] = $row['duration'];
      $data['start_time'] = $row['start_time'];
    }

    $sql = "SELECT
        day
      FROM
        sprinklers.run_days
      WHERE
        program = 'A'
        AND run = 1";

    $res = $db->query($sql);
    while($row = $res->fetch_assoc()) {
      $data['days'][] = $row['day'];
    }
    echo json_encode($data);

  } elseif ($_GET['name'] === 'logs') {
    $db = new mysqli('localhost', $config['user'], $config['pw']);
    $sql = "SELECT
              run_time,
              func,
              meta
          FROM
              sprinklers.logger
          ORDER BY run_time DESC
          LIMIT 10 ";
    $res = $db->query($sql);
    $data = [];
    while($row = $res->fetch_assoc()) {
      $data[] = array(
        'time' => $row['run_time'],
        'func' => $row['func'],
        'meta' => $row['meta']
      );
    }
    echo json_encode($data);
  } elseif ($_GET['name'] == 'rain') {
    $db = new mysqli('localhost', $config['user'], $config['pw']);
    $sql = "SELECT
            rain
          FROM
            sprinklers.rain ";
    $res = $db->query($sql);
    $data = [];
    while($row = $res->fetch_assoc()) {
      $data[] = $row['rain'];
    }
    echo json_encode($data);
  }
}
