document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector('#toggle');
    const $currentLogo = document.querySelector('div.wrap-logo > img');

    //Change colors dark theme elements website
    toggle.addEventListener('change', () => {
        document.body.classList.toggle('dark');

        if(document.body.classList.contains('dark')){
            $currentLogo.src = "./assets/img/optpackages2.svg";
            localStorage.setItem('themeapp', 'dark');
        }else{
            $currentLogo.src = "./assets/img/optpackages.svg";
            localStorage.setItem('themeapp', 'light');
        }
    });

    //Verify preference theme user
    if(localStorage.getItem('themeapp') == 'dark'){
        document.body.classList.add('dark');
        $currentLogo.src = "./assets/img/optpackages2.svg";
    }
    
    if(localStorage.getItem('themeapp') == 'light'){
        document.body.classList.add('light');
        $currentLogo.src = "./assets/img/optpackages.svg";
    }
});