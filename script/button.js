function init(){
    var selectMap = document.querySelector('.select-map');
    selectMap.onchange = (event) => {
        var inputText = event.target.value;
        drawMap("2021",inputText)
    }
    initializeMap();
}
window.onload = init();