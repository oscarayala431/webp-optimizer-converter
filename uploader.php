<?php
use Intervention\Image\ImageManager;

//Require composer autoload
require 'vendor/autoload.php';

if(isset($_FILES["files"])){
    //Check if compression is enabled
    $is_compress = $_POST['iscompress'];
    $quality = ($is_compress == "true") ? 60 : null;
    $passFiles = [];
    $errorFiles = [];
    $counter = 0;
    $image = new ImageManager();

    foreach($_FILES['files']['name'] as $namefile){
        //Validation force image files only
        if(getimagesize($_FILES["files"]["tmp_name"][$counter])){
            $destination = $_SERVER["DOCUMENT_ROOT"] . "/content/uploads/" . pathinfo($namefile, PATHINFO_FILENAME) . ".webp";
            $image->make($_FILES['files']['tmp_name'][$counter])->encode('webp')->save($destination, $quality);
            array_push($passFiles, pathinfo($namefile, PATHINFO_FILENAME));
            $counter++;
        }else{
            $upload = false;
            array_push($errorFiles, $namefile);
            $counter++;
        }
    }

    if(count($passFiles) > 0){
        $upload = true;
    }else{
        $upload = false;
    }

    if($upload){
        $res = array(
            "err" => false,
            "status" => http_response_code(200),
            "statusText" => "Archivos optimizados con éxito.",
            "files" => $_FILES["files"],
            "compress" => $_POST['iscompress'],
            "target" => "http://" . $_SERVER['SERVER_NAME'] . "/content/uploads/example.webp",
            "passfiles" => $passFiles,
            "errorfiles" => $errorFiles,
        );
    }else{
        header("HTTP/1.1 400 Bad Request");
        $res = array(
            "err" => true,
            "status" => http_response_code(200),
            "statusText" => "Error al optimizar archivos",
            "files" => $_FILES["files"],
            "compress" => $_POST['iscompress'],
            "passfiles" => $passFiles,
            "errorfiles" => $errorFiles,
        );
    }

    echo json_encode($res);
}