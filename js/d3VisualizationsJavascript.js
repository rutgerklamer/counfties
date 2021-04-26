let maxElem, countryName;
let countryAbbrevDictionary = countryAbbreviationDict(worldData);
let projection, circle, feature, svg, path, origin;


dropDownMenuCreator();
display3DGlobe(worldData);

function dropDownMenuCreator() {
    let divDropdown = d3.select("#globe")
        .append("div")
        .attr("id", "body")

    let continentOptions =
        divDropdown.append("div")
        .attr("id", "continents")
        .selectAll("option")
        .data(continents)
        .enter()
        .append("option")
        .text(function(d) {
            return d;
        });

    d3.select("#continents")
        .append("p")
        .text("(Note: To navigate, drag the globe or use the above menu. Click to view.)")


}
//abbreviations as values
function countryAbbreviationDict(worldMapData) {
    let objArrWorldCountries = worldMapData.features;
    let abbreviationDict = {};
    objArrWorldCountries.forEach(function(d) {
        abbreviationDict[d.properties.name] = d.id
    });
    return abbreviationDict;
}

function maxi(objArr) {
    return (objArr.reduce(function(p, c) {
        if (p.value > c.value)
            return p;
        else
            return c;
    }));
}

function display3DGlobe(worldDisplayData) {

    let modal = document.getElementById('myModal');

    projection =
        d3.geo.azimuthal()
        .scale(window.innerWidth / 2)
        .origin([0, 50])
        .mode("orthographic")
        .translate([window.innerWidth / 2, window.innerWidth / 2]);

    circle = d3.geo.greatCircle()
        .origin(projection.origin());



    path = d3.geo.path()
        .projection(projection);

    svg = d3.select("#body").append("svg:svg")
        .attr("id", "worldGlobe").attr("stroke-width", "0.1vw")
        .on("mousedown", mousedown).on("touchstart", touchdown);
    console.log(worldDisplayData.features)
    feature = svg.selectAll("path")
        .data(worldDisplayData.features)
        .enter().append("svg:path").attr("id", function(d, i) {
            return worldDisplayData.features[i].id;
        }).attr("d", clip)
        .on("mousedown", displayCountry).on("touchstart", displayCountry);


    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    })

    feature.append("svg:title").text(function(d) {
        return d.properties.name;
    });

    d3.select(window)
        .on("mousemove", mousemove)
        .on("touchmove", touchmove)
        .on("mouseup", mouseup)
        .on("touchend", touchup)

    d3.select("select").on("change", function() {
        if (this.value == "HON") {
            alert("I couldn't find a map that supports Hong Kong but I wanted to support Hong Kong in particular #fightForJustice. I'll do my sincere best to find a map that supports Hong Kong.")
        }
        moveToCountry(this.value);
        highlightCountry(this.value, countryListAlpha3[this.value]);
        console.log(this.value)
    });



    let m0,
        o0;


    function touchdown() {
        m0 = [d3.event.touches[0].clientX, d3.event.touches[0].pageY];
        o0 = projection.origin();
        d3.event.preventDefault();
    }

    function touchmove() {
        if (m0 && d3.event.touches[0] != null) {
            let m1 = [d3.event.touches[0].clientX, d3.event.touches[0].pageY];
            o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
            projection.origin(o1);
            circle.origin(o1)
            refresh();
        }
    }

    function touchup() {
        if (m0) {
            touchmove();
            m0 = null;
        }
    }


    function mousedown() {

        m0 = [d3.event.pageX, d3.event.pageY];
        o0 = projection.origin();
        d3.event.preventDefault();
    }


    function mousemove() {
        if (m0) {
            let m1 = [d3.event.pageX, d3.event.pageY],
                o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
            projection.origin(o1);
            circle.origin(o1)
            refresh();
        }
    }

    function mouseup() {
        if (m0) {
            mousemove();
            m0 = null;
        }
    }
}

function displayCountry(p) {
    highlightCountry(p.id, p.properties.name);
    let script = document.createElement('script');
}

function refresh(duration) {
    feature.attr("d", clip);
}

function clip(d) {
    return path(circle.clip(d));
}
