function init(){
    var selectMap = document.querySelector('.select-map');
    selectMap.onchange = (event) => {
        var inputText = event.target.value;
        var title = document.querySelector('.title-map');
        title.innerText = `2021 ${inputText} in Australia`;
        drawMap("2021",inputText);
        title = document.querySelector(".title-line").innerText.split(" ");
        var flag = true;
        if(title[3] == "New")
        {
            flag = false;
            drawLine( "New South Wales", inputText);
        }
        else if(title[3] == "Western")
        {
            flag = false;
            drawLine( "Western Australia", inputText);
        }
        else if(title[3] == "Northern")
        {
            flag = false;
            drawLine("Northern Territory", inputText);
        }
        else if(title[3] == "Australian")
        {
            flag = false;
            drawLine( "Australian Capital Territory", inputText);
        }
        if(flag){
            drawLine( title[3], inputText);
        }
       
    }
    initializeMap();
    initiliazeLine();
}
window.onload = init();