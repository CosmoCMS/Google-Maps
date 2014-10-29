<?php

require_once '../../../core/app/autoload.php';
require_once '../../../core/app/Cosmo.class.php';
$Cosmo = new Cosmo($pdo, $prefix, $salt);

if($_GET['settings'])
    echo $Cosmo->miscRead('googleMapsSettings');
else if($_SERVER['HTTP_USERSID'] && $_SERVER['HTTP_TOKEN']) // Check permissions for autorized requests
{
    if($Cosmo->tokensRead($_SERVER['HTTP_USERSID'], $_SERVER['HTTP_TOKEN'])){
        $usersID = $_SERVER['HTTP_USERSID'];
        $role = $Cosmo->usersRead($usersID)['role'];
        
        if($role === 'admin'){
            $_POST = json_decode(file_get_contents("php://input"), TRUE);
            
            // Update record if it exists already
            if($Cosmo->miscRead('googleMapsSettings'))
                $Cosmo->miscUpdate('googleMapsSettings', json_encode(array("marker"=>$_POST['marker'], "style" => $_POST['style'])));
            else
                $Cosmo->miscCreate('googleMapsSettings', json_encode(array("marker"=>$_POST['marker'], "style" => $_POST['style'])));
            $output = array("success"=>true);
        } else
            $output = array("success"=>false);
    }
} else 
    $output = array("success"=>false);

if($output)
    echo json_encode($output);

?>