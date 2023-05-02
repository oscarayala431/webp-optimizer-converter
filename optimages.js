const d = document;
const $main = d.querySelector('main');
const $files = d.getElementById('files');
const $innerprogress = d.querySelector('div.progress-file');
const $fldcompress = d.querySelector("input.fld-compress");

const uploader = (file, isCompress, numberFile, totalFiles) => {
    //console.log(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("iscompress", isCompress);

    fetch('./uploader.php', {
        method: "POST",
        body: formData,
    })
    .then(resp => resp.json())
    .then(data => {
        getImagesOptimization(data.target, data.namefile, numberFile, totalFiles);
    })
    .catch(err => {
        console.log(`Error: ${err}`);
    });
}

//Get images data after optimization
let imgUrls = [];
const getImagesOptimization = async (destinationFile, nameFile, numberFile, totalFiles) => {
    imgUrls.push({destinationFile, nameFile});

    //Verify is the last file to process
    if(numberFile == totalFiles){
        //Get images data after optimization
        const promisesImg = imgUrls.map(async (url) => {
            const res = await fetch(url.destinationFile);
            const blob = await res.blob();
            return {blob, nameFile: url.nameFile}
        });

        const res = await Promise.all(promisesImg);

        //create zip of images
        imgsCompressFiles(res);
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
}

const progressUpload = (file, isCompress, numberFile, totalFiles) => {
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
        uploader(file, isCompress, numberFile, totalFiles);

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

$files.addEventListener("drop", e => {
    e.preventDefault();
    e.stopPropagation();

    //Verify that compression is necessary
    let isCompress = $fldcompress.checked;
    console.log($fldcompress.checked);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((el, index) => progressUpload(el, isCompress, index+1, e.dataTransfer.files.length));

    $files.classList.remove("active");
});

/*d.addEventListener("change", (e) => {
    if(e.target === $files){
        //onsole.log(e.target.files);

        const files = Array.from(e.target.files);
        files.forEach(el => progressUpload(el));
    }
})*/