function timelinePlay(){
    playButton = document.querySelector(".play")
    if (playButton.classList.contains("bi-play-fill")) {
        playButton.classList.remove("bi-play-fill");
        playButton.classList.add("bi-pause-fill");

        year = document.querySelector("#year");
        if (year.value == 2021) {
            year.value = 2004;
            document.querySelector("#yearLabel").innerText = year.value;
        }
        let loopTimeout = function(i, max, interval, func) {
            if (i > max) { // End Of Timeline
              playButton.classList.remove("bi-pause-fill");
              playButton.classList.add("bi-play-fill");
              return;
            }
      
            func(i); // Call Update Function
            i++; // Increment Control Variable
            setTimeout(function() { loopTimeout(i, max, interval, func) }, interval);
        };

        loopTimeout(parseInt(year.value), 2021, 1200, (yearVal) => {
            year.value = yearVal;
            firstChartUpdate();
          });
    } 
    else{
        playButton.classList.remove("bi-pause-fill");
        playButton.classList.add("bi-play-fill");
        let timeoutIDs = setTimeout(function() {}, 0);
        while (timeoutIDs--) clearTimeout(timeoutIDs);
    }
}
function timelineUpdate(){
    yearLabel = document.querySelector("#yearLabel");
    yearLabel.innerText = document.querySelector("#year").value;
}
function firstChartUpdate(){
    timelineUpdate();
    method = document.querySelector('.select-map').value
    year = document.querySelector("#year");
    mapTitle = document.querySelector(".title-map");
    mapTitle.innerText = `${year.value} ${method} in Australia`;
    drawMap( year.value,method);
}
function sankeyUpdate(choice){
    button = document.querySelector(`.sankey-${choice}`);
    if(!button.classList.contains("active")){
        buttons = document.querySelectorAll(".sankey-btn");
        buttons.forEach(function(d){
            d.classList.remove("active");
        })
        updateSankey(choice);
    }
    else{
        button.classList.add("active");
    }
    title = document.querySelector(".title-sankey");
    year = "2016 to 2021";
    if(choice==1)
    {
        year = "2004 to 2009";
    }
    else if(choice == 2)
    {
        year = "2010 to 2015"
    }
    title.innerText = `Top 10 countries migration to Australia from ${year}`;
}
function init(){
    var selectMap = document.querySelector('.select-map');
    selectMap.onchange = (event) => {
        var inputText = event.target.value;
        var title = document.querySelector('.title-map');
        title.innerText = `2021 ${inputText} in Australia`;
        drawMap("2021",inputText);
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
    // initiliazeLine();
    initialiseBar();
    initialiseSankey();
}
window.onload = init();