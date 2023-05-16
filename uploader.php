<?php
use Intervention\Image\ImageManager;

//Require composer autoload
require 'vendor/autoload.php';

if(isset($_FILES["files"])){
    //Check if compression is enabled
    $is_compress = $_POST['iscompress'];
    $quality = ($is_compress == "true") ? 60 : null;
    $counter = 0;
    $image = new ImageManager();

    foreach($_FILES['files']['name'] as $namefile){
        $destination = $_SERVER["DOCUMENT_ROOT"] . "/content/uploads/" . pathinfo($namefile, PATHINFO_FILENAME) . ".webp";
        $upload = $image->make($_FILES['files']['tmp_name'][$counter])->encode('webp')->save($destination, $quality);
        $counter++;
    }

    if($upload){
        $res = array(
            "err" => false,
            "status" => http_response_code(200),
            "statusText" => "Archivos optimizados con éxito.",
            "files" => $_FILES["files"],
            "compress" => $_POST['iscompress'],
            "target" => "http://" . $_SERVER['SERVER_NAME'] . "/content/uploads/example.webp",
        );
    }else{
        $res = array(
            "err" => true,
            "status" => http_response_code(400),
            "statusText" => "Error al optimizar archivo {$name_file}.",
            "files" => $_FILES["files"],
            "compress" => $_POST['iscompress'],
        );
    }

    echo json_encode($res);
}