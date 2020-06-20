$("document").ready(function () {
    var lastWeather;
    var lastCity = localStorage.getItem("lastCity");
    var units = "metric";

    function getWeather(searchCity) {
        if (searchCity) {
            var queryUrl = "https://api.openweathermap.org/data/2.5/weather?appid=fc2d1f9e61e29d3aff30681d900d7f1b&q=" + searchCity + "&units=" + units;
            $.ajax({
                url: queryUrl,
                method: "GET"
            }).then(function (response) {
                displayWeather(response);
            });
        }
    }

    function getForecast(searchCity) {
        var queryUrl = "https://api.openweathermap.org/data/2.5/weather?appid=fc2d1f9e61e29d3aff30681d900d7f1b&q=" + searchCity;
        $.ajax({
            url: queryUrl,
            method: "GET"
        }).then(function (response) {
            displayForecast(response);
        });
    }

    function displayWeather(weatherData) {
        var name = weatherData.name;
        var date
        var weathericon
        var temperature = weatherData.main.temp;
        var humidity
        var windSpeed
        var uvIndex
        $("#current-weather").empty();
        $("#current-weather").append($("<div>").text(name + " " + temperature))
    }

    function displayForecast(forecastData) {
        var date
        var weathericon
        var temperature
        var humidity
        console.log(forecastData);
    }

    // removes duplicates and keeps most recent search at the top and in localStorage
    function addCity(cityName) {
        $("#search-history").children().each(function () {
            if ($(this).text().toUpperCase() == cityName.toUpperCase()) {
                $(this).remove();
            }
        });
        $("#search-history").prepend($("<div>").text(cityName));
        localStorage.setItem("lastCity", cityName);
    }

    getWeather(lastCity);
    $("#search-btn").on("click", function (event) {
        event.preventDefault();
        var searchCity = $("#search-text").val().trim();
        if (searchCity) {
            getWeather(searchCity);
            // getForecast(searchCity);
            addCity(searchCity);
        }
    })
});