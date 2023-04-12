const d = document;
const $main = d.querySelector('main');
const $files = d.getElementById('files');
const $innerprogress = d.querySelector('div.progress-file');
const $fldcompress = d.querySelector("input.fld-compress");

const uploader = (file, isCompress) => {
    //console.log(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("iscompress", isCompress);

    fetch('./uploader.php', {
        method: "POST",
        body: formData,
    })
    .then(resp => resp.text())
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.log(`Error: ${err}`);
    });
}

const progressUpload = (file, isCompress) => {
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
        uploader(file, isCompress);

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
    files.forEach(el => progressUpload(el, isCompress));

    $files.classList.remove("active");
});

/*d.addEventListener("change", (e) => {
    if(e.target === $files){
        //onsole.log(e.target.files);

        const files = Array.from(e.target.files);
        files.forEach(el => progressUpload(el));
    }
})*/