$("document").ready(function () {
    var searchHistory = JSON.parse(localStorage.getItem("lastCity")) || [];
    var uvTag = $("#uv-tag");
    var displayUnits = "metric";
    var units = {
        "metric": {
            temp: "&deg;C",
            wind: "m/s",
            dateFormat: "Do MMM YYYY",
            dateFormatShort: "D/M/YY"
        },
        "imperial": {
            temp: "&deg;F",
            wind: "MPH",
            dateFormat: "MMM Do YYYY",
            dateFormatShort: "M/D/YY"
        }
    }
    var lastQuery = {};
    var graphData = [];

    function setUV(input) {
        uvTag.removeClass();
        uvTag.addClass("badge")
        switch (Math.floor(input)) {
            case 0:
            case 1:
            case 2:
                uvTag.addClass("uv-low");
                break;
            case 3:
            case 4:
            case 5:
                uvTag.addClass("uv-mod");
                break;
            case 6:
            case 7:
                uvTag.addClass("uv-high");
                break;
            case 8:
            case 9:
            case 10:
                uvTag.addClass("uv-v-high");
                break;
            default:
                uvTag.addClass("uv-extr");
        }
        uvTag.html(input);
    }

    // removes duplicates and keeps most recent successful search at the top
    function removeDuplicateCity(cityName) {
        $("#search-history").children().each(function (index) {
            if (index > 0 && $(this).text().toUpperCase() == cityName.toUpperCase()) {
                $(this).remove();
            }
            if (index > 5) {
                $(this).remove();
            }
        });
        for (var i = 1; i < searchHistory.length; i++) {
            if (searchHistory[i] == cityName) {
                searchHistory.splice(i, 1);
            }
        }
        if (searchHistory.length > 5) {
            searchHistory.splice(5);
        }
    }

    function addCityToHistory(cityName) {
        $("#search-history").prepend($("<li>").text(cityName).addClass("list-group-item"));
    }

    function callAPI(type, queryAdd, successFunc) {
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/${type}?appid=fc2d1f9e61e29d3aff30681d900d7f1b&${queryAdd}`,
            method: "GET",
            success: function (response) {
                successFunc(response);
            }
        });
    }

    var processUV = function (response) {
        setUV(response.value);
    };

    function parseTime(time) {
        if (time > 0) {
            return `+${time}`
        }
        else {
            return time;
        }
    }

    var processTimes = function (report, sunrise, sunset, timezone) {
        $("#timeZone").html(`${parseTime(timezone / 60)} UTC`)
        $("#currentTime").html(`${moment().utcOffset(timezone).format("hh:mm a")}`)
        $("#reportTime").html(`${moment(report, "X").utcOffset(timezone).format("hh:mm a")}`);
        $("#sunriseTime").html(`${moment(sunrise, "X").utcOffset(timezone).format("hh:mm a")}`);
        $("#sunsetTime").html(`${moment(sunset, "X").utcOffset(timezone).format("hh:mm a")}`);
    };

    // process the current weather results
    var processWeather = function (weatherData) {
        lastQuery = weatherData;
        var processedName = `${weatherData.name},${weatherData.sys.country}`;
        $("#currentCity").html(`${weatherData.name} (${moment(weatherData.dt, "X").utcOffset(weatherData.timezone / 60).format(units[displayUnits].dateFormat)})<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="${weatherData.weather[0].description}">`);
        $("#currentTemp").html(`${weatherData.main.temp.toFixed(1)}${units[displayUnits].temp}`);
        $("#currentHumidity").html(`${weatherData.main.humidity}%`);
        $("#currentWindSpeed").html(`${weatherData.wind.speed}${units[displayUnits].wind}`);
        processTimes(weatherData.dt, weatherData.sys.sunrise, weatherData.sys.sunset, weatherData.timezone / 60)
        callAPI("uvi", `lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}`, processUV)
        callAPI("forecast", `id=${weatherData.id}&units=${displayUnits}`, processForecast);
        addCityToHistory(processedName);
        searchHistory.unshift(processedName);
        removeDuplicateCity(processedName);
        localStorage.setItem("lastCity", JSON.stringify(searchHistory));
    }

    // proccess the forecast results
    var processForecast = function (forecastData) {
        graphData = [];
        $("#forecast-weather").empty();
        forecastData.list.forEach(element => {
            graphData.push(element);
        });
        // console.log(graphData);
        for (var i = 7; i < 40; i += 8) {
            var forecast = forecastData.list[i];
            $("#forecast-weather").append($("<div>").addClass("col bg-primary text-white").append(
                $("<h4>").text(moment(forecast.dt, "X").utcOffset(forecastData.city.timezone / 60).format(units[displayUnits].dateFormatShort)),
                $("<img>").attr("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`)
                    .attr("alt", forecast.weather[0].description),
                $("<p>").html(`Temp: ${forecast.main.temp.toFixed(1)}${units[displayUnits].temp}`),
                $("<p>").text(`Humidity: ${forecast.main.humidity}%`)
            ));
        }
    }

    function submit() {
        event.preventDefault();
        var searchCity = $("#search-text").val().trim();
        var searchCountry = $("#country-code").val().trim();
        if (searchCountry && searchCity) {
            searchCity += `,${searchCountry}`;
        }
        if (searchCity) {
            callAPI("weather", `q=${searchCity}&units=${displayUnits}`, processWeather);
        }
        else {
            console.log("make a warning about missing search terms");
        }
    }

    // initialize data, loads last city if there is one in localStorage
    function init() {
        if (searchHistory[0]) {
            for (var i = 0, last = searchHistory.length - 1; i < searchHistory.length; i++) {
                if (searchHistory[last - i].trim()) {
                    addCityToHistory(searchHistory[last - i].trim());
                }
            }
            callAPI("weather", `q=${searchHistory[0]}&units=${displayUnits}`, processWeather);
        }
        else {
            setUV("Search for a City to see the current weather!");
        }
    }

    init();

    // event listeners
    $("form").on("submit", submit)
    $("#search-btn").on("click", submit);
    $("#search-history").on("click", function (event) {
        var searchCity = event.target.textContent.trim();
        if (searchCity) {
            callAPI("weather", `q=${searchCity}&units=${displayUnits}`, processWeather);
        }
    });
    $("#searchCollapse").on("hidden.bs.collapse", function () {
        $("#searchToggle").html("&plus;");
    });
    $("#searchCollapse").on("shown.bs.collapse", function () {
        $("#searchToggle").html("&minus;");
    })
    $("#advanceSearch").on("hidden.bs.collapse", function () {
        $("#advanceToggle").html("&plus;");
    });
    $("#advanceSearch").on("shown.bs.collapse", function () {
        $("#advanceToggle").html("&minus;");
    })
    $("#imperialCheck").on("click", function () {
        if (displayUnits == "metric") {
            displayUnits = "imperial";
        }
        else {
            displayUnits = "metric";
        }
        if (searchHistory[0]) {
            init();
        }
    });
});