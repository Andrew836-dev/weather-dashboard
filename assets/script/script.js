$("document").ready(function () {
    var lastCity = localStorage.getItem("lastCity") || " ";
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

    function callAPI(type, searchCity) {
        if (!type) {
            callAPI("weather", searchCity);
            callAPI("forecast", searchCity);
        }
        else {
            var queryUrl = `https://api.openweathermap.org/data/2.5/${type}?appid=fc2d1f9e61e29d3aff30681d900d7f1b&`
            switch (type) {
                case "weather":
                case "forecast":
                    queryUrl += "q=" + searchCity + "&units=" + displayUnits;
                    break;
                case "uvi":
                    // var coords = searchCity.split(" ");
                    queryUrl += searchCity;
                    break;
            }
            $.ajax({
                url: queryUrl,
                method: "GET"
            }).then(function (response) {
                if (type == "weather") {
                    displayWeather(response);
                }
                else if (type == "forecast") {
                    displayForecast(response);
                }
                else {
                    setUV(response.value);
                }
            });
        }
    }

    function displayWeather(weatherData) {
        $("#current-weather").empty();
        $("#current-weather").append(
            $("<h1>").html(`${weatherData.name} (${moment(weatherData.dt, "X").format(units[displayUnits].dateFormat)})`).append(
                $("<img>").attr("src", `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`)
                    .attr("alt", weatherData.weather[0].description)
            ),
            $("<p>").html(`Temperature: ${weatherData.main.temp}${units[displayUnits].temp}`),
            $("<p>").text(`Humidity: ${weatherData.main.humidity}%`),
            $("<p>").text(`Wind speed: ${weatherData.wind.speed}${units[displayUnits].wind}`),
            uvTag
        );
        callAPI("uvi", `lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}`)
        // callAPI("uvi", `${weatherData.coord.lat} ${weatherData.coord.lon}`);
        addCity(weatherData.name);
    }

    function displayForecast(forecastData) {
        $("#forecast-weather").empty();
        for (var i = 7; i < 40; i += 8) {
            var forecast = forecastData.list[i];
            $("#forecast-weather").append($("<div>").addClass("col bg-primary text-white").append(
                $("<h4>").text(moment(forecast.dt, "X").format(units[displayUnits].dateFormatShort)),
                $("<img>").attr("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`)
                    .attr("alt", forecast.weather[0].description),
                $("<p>").html(`Temp: ${forecast.main.temp}${units[displayUnits].temp}`),
                $("<p>").text(`Humidity: ${forecast.main.humidity}%`)
            ));
        }
    }

    // removes duplicates and keeps most recent successful search at the top and in localStorage
    function addCity(cityName) {
        $("#search-history").children().each(function () {
            if ($(this).text().toUpperCase() == cityName.toUpperCase()) {
                $(this).remove();
            }
        });
        $("#search-history").prepend($("<li>").text(cityName).addClass("list-group-item"));
        localStorage.setItem("lastCity", cityName);
        lastCity = cityName;
    }

    function init() {
        if (lastCity.trim()) {
            callAPI("", lastCity);
        }
    }

    function submit() {
        event.preventDefault();
        var searchCity = $("#search-text").val().trim()
        if (searchCity && searchCity.toUpperCase() !== lastCity.toUpperCase()) {
            callAPI("", searchCity);
        }
    }
    init();
    $("#search-text").on("keydown", function (event) {
        // event.preventDefault();
        if (event.keyCode == 13) {
            submit();
        }
    })
    $("#search-btn").on("click", submit);
    $("#search-history").on("click", function (event) {
        var searchCity = event.target.textContent.trim();
        if (searchCity && searchCity !== lastCity) {
            callAPI("", searchCity);
        }
    });
    $("#imperialCheck").on("click", function () {
        if (displayUnits == "metric") {
            displayUnits = "imperial";
        }
        else {
            displayUnits = "metric";
        }
        if (lastCity.trim()) {
            callAPI("", lastCity);
        }
    });
});