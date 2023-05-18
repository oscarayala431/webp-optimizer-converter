const d = document;
const $main = d.querySelector('main');
const $files = d.getElementById('files');
const $innerprogress = d.querySelector('div.progress-file');
const $fldcompress = d.querySelector("input.fld-compress");

//Process Files with Image Intervetion PHP library
const uploader = (file, isCompress, numberFile, totalFiles, files) => {

    document.body.insertAdjacentHTML("afterbegin", `<div class="spinnerFiles">
        <img src="./assets/img/spinning.gif" alt="spinning">
        <p class="text">Preparing files, wait a few minutes...</p>
    </div>`);

    const formData = new FormData();
    for(let file of files){
        formData.append("files[]", file);
    }
    formData.append("iscompress", isCompress);

    fetch('./uploader.php', {
        method: "POST",
        body: formData,
    })
    .then(resp => resp.json())
    .then(data => {
        getImagesOptimization(data.passfiles, data.errorfiles, numberFile, totalFiles);
    })
    .catch(err => {
        console.log(`Error: ${err}`);
    });
}

//Get images data after optimization
let imgUrls = [];
const getImagesOptimization = (passfiles, errorfiles, numberFile, totalFiles) => {
    //Verify is the last file to process
    if(numberFile == totalFiles){
        //Remove previous loader spinner preparing files
        document.querySelector("div.spinnerFiles").remove();

        document.body.insertAdjacentHTML("afterbegin", `<div class="spinnerFiles">
        <img src="./assets/img/spinning.gif" alt="spinning">
        <p class="text">Compressing files, wait a few minutes...</p>
    </div>`);

        if(passfiles.length > 0){
            //Get images data after optimization
            const promisesImg = passfiles.map(url => {
                return fetch(`http://localhost/content/uploads/${url}.webp`)
                    .then(resp => resp.blob())
                    .then(data => {
                    return { blob: data, nameFile: url };
                    });
            });
            
            Promise.all(promisesImg)
                .then(results => {
                    //create zip of images
                    imgsCompressFiles(results);
            });

            //Display user error files with unsupported format
            if(errorfiles.length > 0){
                const listErrorFiles = errorfiles.map(item => `<li>${item}</li>`).join('');
                Swal.fire({
                    icon: 'warning',
                    title: 'Rejected files!',
                    html: `<p class="alert-text">Files rejected for incompatible format:</p> <ul class="alert-list">${listErrorFiles}</ul>`,
                });
            }
        }else{
            //clean previous urls images
            imgUrls = [];

            //Remove loader spinner compress files
            document.querySelector("div.spinnerFiles").remove();

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Files with unsupported format, try again!',
            });
        }
    }
}

//Create compressed files JSZip
const imgsCompressFiles = async (imgFiles) => {
    const zip = new JSZip();

    imgFiles.forEach(ele => {
        zip.file(`${ele.nameFile}.webp`, ele.blob);
    });

    const zipFile = await zip.generateAsync({type: 'blob'});
    //download zip
    downloadZip(zipFile);
}

//download zip files
const downloadZip = (file) => {
    const a = document.createElement('a');
    a.download = 'optimages.zip';
    const url = URL.createObjectURL(file);
    a.href = url;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    //clean previous urls images
    imgUrls = [];

    //Remove loader spinner
    setTimeout(() => {
        document.querySelector("div.spinnerFiles").remove();
    }, 3000);
}

//View progress individual upload to server
const progressUpload = (file, isCompress, numberFile, totalFiles, files) => {
    const $progress = d.createElement("progress");
    const $span = d.createElement("span");

    $progress.value = 0;
    $progress.max = 100;

    $innerprogress.appendChild($progress);
    $innerprogress.appendChild($span);

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.addEventListener("progress", e => {
        let progress = parseInt((e.loaded*100)/ e.total);
        $progress.value = progress;
        $span.innerHTML = `<b>${file.name} - ${progress}%</b>`;
    });

    fileReader.addEventListener("loadend", e => {
        if(files.length == numberFile){
            uploader(file, isCompress, numberFile, totalFiles, files);
        }

        setTimeout(() => {
            $innerprogress.removeChild($progress);
            $innerprogress.removeChild($span);
            //$files.value = "";
        }, 3000)
    });
}

$files.addEventListener("dragover", e => {
    e.preventDefault();
    e.stopPropagation();

    $files.classList.add("active");
});

$files.addEventListener("dragleave", e => {
    e.preventDefault();
    e.stopPropagation();

    $files.classList.remove("active");
});

//Validate extension files upload
let allowedExtension = ['image/jpeg', 'image/jpg', 'image/png','image/gif','image/bmp'];
const validateFormatFiles = (files) => {
    let valid = true;

    for(let item of files){
        if(!allowedExtension.includes(item.type)){
            valid = false;
            break;
        }
    }

    return valid;
}

$files.addEventListener("drop", e => {
    e.preventDefault();
    e.stopPropagation();

    //Verify that compression is necessary
    let isCompress = $fldcompress.checked;

    const files = Array.from(e.dataTransfer.files).sort();

    if(validateFormatFiles(files)){
        files.forEach((el, index) => {
            imgUrls.push(el.name.slice(0, el.name.lastIndexOf('.')));
            progressUpload(el, isCompress, index+1, e.dataTransfer.files.length, files);
        });
        $files.classList.remove("active");
    }else{
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Files with invalid formats',
        });

        $files.classList.remove("active");
    }
});