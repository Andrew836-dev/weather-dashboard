$("document").ready(function () {
    var lastWeather = localStorage.getItem("lastWeather");
    var lastForecast = localStorage.getItem("lastForecast");
    var lastCity = localStorage.getItem("lastCity");
    var uvTag = $("#uv-tag");
    var displayUnits = "metric";
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

    function getUV(lat, lon) {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            beforeSend: function (request) {
                setUV("Getting UV...");
                request.setRequestHeader('x-access-token', '9cc70a7bbb61df3f008fa358b3bb0489');
            },
            url: 'https://api.openuv.io/api/v1/uv?lat=' + lat + '&lng=' + lon,
            success: function (response) {
                setUV(response.result.uv);
                // 
            },
            error: function () {
                setUV("Error retriving UV");
            }
        });
    }

    function callAPI(type, searchCity) {
        var queryUrl = "https://api.openweathermap.org/data/2.5/" + type + "?appid=fc2d1f9e61e29d3aff30681d900d7f1b&q=" + searchCity + "&units=" + displayUnits;
        if (!type) {
            callAPI("weather", searchCity);
            callAPI("forecast", searchCity);
        }
        else {
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
            });
        }
    }

    function displayWeather(weatherData) {
        console.log("Latest Data");
        console.log(weatherData);
        $("#current-weather").empty();
        $("#current-weather").append(
            $("<h1>").html(weatherData.name + " (" + moment(weatherData.dt, "X").format("M/D/YYYY") + ")").append(
                $("<img>")
                    .attr("src", `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`)
                    .attr("alt", weatherData.weather[0].description)
            ),
            $("<p>").html("Temperature: " + weatherData.main.temp + "&deg;C"),
            $("<p>").text("Humidity: " + weatherData.main.humidity + "%"),
            $("<p>").text("Wind speed: " + weatherData.wind.speed + "m/s"),
            uvTag
        );
        getUV(weatherData.coord.lat, weatherData.coord.lon);
        addCity(weatherData.name);
    }

    function displayForecast(forecastData) {
        $("#forecast-weather").empty();
        for (var i = 7; i < 40; i += 7) {
            var forecast = forecastData.list[i];
            $("#forecast-weather").append($("<div>").addClass("col bg-primary text-white").append(
                $("<h4>").text(moment(forecast.dt, "X").format("M/D/YYYY")),
                $("<img>").attr("src", `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`)
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
        if (lastCity) {
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