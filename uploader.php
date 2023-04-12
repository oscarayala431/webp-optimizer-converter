<?php
use Intervention\Image\ImageManager;

//Require composer autoload
require 'vendor/autoload.php';


if(isset($_FILES["file"])){
    $name_file = $_FILES['file']['name'];
    $error = $_FILES['file']['error'];
    $file = $_FILES['file']['tmp_name'];

    //Save image with extension Webp
    $filename = pathinfo($name_file, PATHINFO_FILENAME);
    $destination = $_SERVER["DOCUMENT_ROOT"] . "/content/uploads/{$filename}.webp";
    
    

    //Check if compression is enabled
    $is_compress = $_POST['iscompress'];
    $quality = ($is_compress == "true") ? 60 : null;

    $image = new ImageManager();
    $upload = $image->make($file)->encode('webp')->save($destination, $quality);

    if($upload){
        $res = array(
            "err" => false,
            "status" => http_response_code(200),
            "statusText" => "Archivo {$name_file} optimizado con éxito.",
            "files" => $_FILES["file"],
            "compress" => $_POST['iscompress'],
        );
    }else{
        $res = array(
            "err" => true,
            "status" => http_response_code(400),
            "statusText" => "Error al optimizar archivo {$name_file}.",
            "files" => $_FILES["file"],
            "compress" => $_POST['iscompress'],
        );
    }

    echo json_encode($res);
}