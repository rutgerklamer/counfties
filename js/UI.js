function zoomInOnDiv() {
    $("#worldGlobe").css("zoom", 2);
}


function zoomInOutDiv() {
    $("#worldGlobe").css("zoom", 1);
}


function enterSite() {
    $("#preInfo").animate({
        left: '-=110%',
        opacity: '-=1.5'
    }, 500);
}

$(window).resize(function() {
    console.log(document.getElementById("worldGlobe").getBoundingClientRect().width)
    projection.scale(document.getElementById("worldGlobe").getBoundingClientRect().width / 2).translate([document.getElementById("worldGlobe").getBoundingClientRect().width / 2, document.getElementById("worldGlobe").getBoundingClientRect().width / 2]);
    refresh();
});

function hideAll() {
    document.getElementsByClassName("loader")[0].style.opacity = "0";
    document.getElementsByClassName("loader")[1].style.opacity = "0";
}


function showAll() {
    document.getElementsByClassName("loader")[0].style.opacity = "1";
    document.getElementsByClassName("loader")[1].style.opacity = "1";
}
