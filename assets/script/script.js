$("document").ready(function () {
    // var lastWeather = localStorage.getItem("lastWeather");
    // var lastForecast = localStorage.getItem("lastForecast");
    var lastCity = localStorage.getItem("lastCity") || " ";
    var uvTag = $("#uv-tag");
    var displayUnits = "metric";
    var dateFormat = "M/D/YYYY";
    // var units = {
    //     "metric": {
    //         temp = "C",
    //         wind = "m/s"
    //     }
    // }

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
                    var coords = searchCity.split(" ");
                    queryUrl += `lat=${coords[0]}&lon=${coords[1]}`;
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
            $("<h1>").html(`${weatherData.name} (${moment(weatherData.dt, "X").format(dateFormat)})`).append(
                $("<img>").attr("src", `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`)
                    .attr("alt", weatherData.weather[0].description)
            ),
            $("<p>").html(`Temperature: ${weatherData.main.temp}&deg;C`),
            $("<p>").text(`Humidity: ${weatherData.main.humidity}%`),
            $("<p>").text(`Wind speed: ${weatherData.wind.speed}m/s`),
            uvTag
        );
        callAPI("uvi", `${weatherData.coord.lat} ${weatherData.coord.lon}`);
        addCity(weatherData.name);
    }

    function displayForecast(forecastData) {
        $("#forecast-weather").empty();
        for (var i = 7; i < 40; i += 8) {
            var forecast = forecastData.list[i];
            $("#forecast-weather").append($("<div>").addClass("col bg-primary text-white").append(
                $("<h4>").text(moment(forecast.dt, "X").format(dateFormat)),
                $("<img>").attr("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`)
                    .attr("alt", forecast.weather[0].description),
                $("<p>").html(`Temp: ${forecast.main.temp}&deg;C`),
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
        $("#search-history").prepend($("<li>").text(cityName));
        localStorage.setItem("lastCity", cityName);
        lastCity = cityName;
    }

    function init() {
        if (lastCity.trim()) {
            callAPI("", lastCity);
        }
    }

    init();
    $("#search-btn").on("click", function (event) {
        event.preventDefault();
        var searchCity = $("#search-text").val().trim()
        if (searchCity && searchCity.toUpperCase() !== lastCity.toUpperCase()) {
            callAPI("", searchCity);
        }
    });
    $("#search-history").on("click", function (event) {
        var searchCity = event.target.textContent.trim();
        if (searchCity && searchCity !== lastCity) {
            callAPI("", searchCity);
        }
    });
});