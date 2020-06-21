$("document").ready(function () {
    var lastWeather = localStorage.getItem("lastWeather");
    var lastForecast = localStorage.getItem("lastForecast");
    var lastCity = localStorage.getItem("lastCity");
    var uvTag = $("#uv-tag");
    var displayUnits = "metric";
    var today = moment().format("X");
    console.log(today);
    // var units = {
    //     "metric": {
    //         temp = "C",
    //         wind = "m/s"
    //     }
    // }

    function getUV(lat, lon) {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            beforeSend: function (request) {
                $("#uv-tag").html("retrieving UV-index");
                request.setRequestHeader('x-access-token', '9cc70a7bbb61df3f008fa358b3bb0489');
            },
            url: 'https://api.openuv.io/api/v1/uv?lat=' + lat + '&lng=' + lon
        }).then(function (response) {
            $("#uv-tag").html(response.result.uv);
        });
    }

    function callAPI(type, searchCity) {
        var queryUrl = "https://api.openweathermap.org/data/2.5/" + type + "?appid=fc2d1f9e61e29d3aff30681d900d7f1b&q=" + searchCity + "&units=" + displayUnits;
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

    function displayWeather(weatherData) {
        console.log("Latest Data");
        console.log(weatherData);
        $("#current-weather").empty();
        $("#current-weather").append(
            $("<h1>").text(weatherData.name + "(" + moment().format("M/D/YYYY") + ") Icon: " + weatherData.weather[0].icon),
            $("<p>").text("Temperature: " + weatherData.main.temp),
            $("<p>").text("Humidity: " + weatherData.main.humidity),
            $("<p>").text("Wind speed: " + weatherData.wind.speed),
            uvTag
        );
        getUV(weatherData.coord.lat, weatherData.coord.lon);
        addCity(weatherData.name);
    }

    function displayForecast(forecastData) {
        $("#forecast-weather").empty();
        for (var i = 7; i < 40; i += 7){
            $("#forecast-weather").append($("<div>").append(
                $("<h3>").text(moment(forecastData.list[i].dt, "X").format("M/D/YYYY")),
                $("<p>").text("Icon: " + forecastData.list[i].weather[0].icon + forecastData.list[i].weather[0].description + forecastData.list[i].weather[0].main),
                $("<p>").text("Temp: " + forecastData.list[i].main.temp),
                $("<p>").text("Humidity: " + forecastData.list[i].main.humidity)
            ));
        }
        console.log("Forecast Data");
        console.log(forecastData);
    }

    // removes duplicates and keeps most recent successful search at the top and in localStorage
    function addCity(cityName) {
        $("#search-history").children().each(function () {
            if ($(this).text().toUpperCase() == cityName.toUpperCase()) {
                $(this).remove();
            }
        });
        $("#search-history").prepend($("<div>").text(cityName));
        localStorage.setItem("lastCity", cityName);
    }

    function init() {
        if (lastCity) {
            callAPI("weather", lastCity);
            callAPI("forecast", lastCity);
        }
    }

    init();
    $("#search-btn").on("click", function (event) {
        event.preventDefault();
        var searchCity = $("#search-text").val().trim();
        if (searchCity) {
            callAPI("weather", searchCity);
            callAPI("forecast", searchCity);
            // getForecast(searchCity);
        }
    })
});