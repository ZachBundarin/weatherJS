// Wait until DOM is ready to register callbacks
$(function() {
   $("#compareBtn").click(compareBtnClick);
   $("#city1").on("input", cityInput);
   $("#city2").on("input", cityInput);
    document.getElementById("results-city1").style.textAlign = "center";
    document.getElementById("results-city2").style.textAlign = "center";
    
});

// Called when city input values change
function cityInput(e) {
   // Extract the text from city input that triggered the callback
   const cityId = e.target.id;
   const city = $(`#${cityId}`).val().trim();
   
   // Only show error message if no city 
   if (city.length === 0) {
      showElement("error-value-" + cityId);      
   }
   else {
      hideElement("error-value-" + cityId);
   }
}

// Compare button is clicked
function compareBtnClick() {
   // Get user input
   const city1 = $("#city1").val().trim();
   const city2 = $("#city2").val().trim();

   // Show error messages if city fields left blank
   if (city1.length === 0) {
      showElement("error-value-city1");
   }
   if (city2.length === 0) {
      showElement("error-value-city2");
   }

   // Ensure both city names provided
   if (city1.length > 0 && city2.length > 0) {
      showElement("forecast");
      hideElement("error-loading-city1");
      hideElement("error-loading-city2");
      showElement("loading-city1");
      showText("loading-city1", `Loading ${city1}...`);
      showElement("loading-city2");
      showText("loading-city2", `Loading ${city2}...`);
      hideElement("results-city1");
      hideElement("results-city2");
      showElement("info");

      // Fetch forecasts
      getWeatherForecast(city1, "city1");
      getWeatherForecast(city2, "city2");
   }
}

// Request this city's forecast
function getWeatherForecast(city, cityId) {
   // Web API URL and API key
   const endpoint = "https://api.openweathermap.org/data/2.5/forecast";
   const apiKey = "470d0fc500600355ea6311c66f837490";

   // Make GET request to API for the given city's forecast   
   $.ajax({
      url: endpoint, 
      method: "GET",
      data: {q: city, units: "imperial", appid : apiKey},
      dataType: "json"      
   })
   .done(function(data) {
         displayForecast(data, cityId, city);
         //displayInfo(data, cityId, city);
   })
   .fail(function() {
         displayError(cityId, city);
   });
}

// Display forecast recevied from JSON  
function displayForecast(data, cityId, city) {
   // No longer loading
   hideElement("loading-" + cityId);

   // Display results table
   showElement("results-" + cityId);

   const cityName = data.city.name;
   showText(cityId + "-name", cityName);

   // Get 5 day forecast
   const forecast = getSummaryForecast(data.list);

   // Put forecast into the city's table
   let day = 1;
   for (const date in forecast) {
      // Only process the first 5 days
      if (day <= 5) {
         showText(`${cityId}-day${day}-name`, getDayName(date));
         showText(`${cityId}-day${day}-high`, Math.round(forecast[date].high) + "&deg;");
         showText(`${cityId}-day${day}-low`, Math.round(forecast[date].low) + "&deg;");
         showImage(`${cityId}-day${day}-image`, forecast[date].weather);
      }
      day++;
   }   
}

function displayError(cityId, city) {
   // Display appropriate error message
   hideElement("loading-" + cityId);
   const errorId = "error-loading-" + cityId;
   showElement(errorId);
   showText(errorId, "Unable to load city \"" + city + "\".");
}

// Return a map of objects that contain the high temp, low temp, and weather for the next 5 days
function getSummaryForecast(forecastList) {  
   // Map for storing high, low, weather
   const forecast = [];
   
   // Determine high and low for each day
   forecastList.forEach(function (item) {
      // Extract just the yyyy-mm-dd 
      const date = item.dt_txt.substr(0, 10);
      
      // Extract temperature
      const temp = item.main.temp;

      // Have this date been seen before?
      if (date in forecast) {         
         // Determine if the temperature is a new low or high
         if (temp < forecast[date].low) {
            forecast[date].low = temp;
         }
         if (temp > forecast[date].high) {
            forecast[date].high = temp;
         }
      }
      else {
         // Initialize new forecast
         const temps = {
            high: temp,
            low: temp,
            weather: item.weather[0].main
         }   
         
         // Add entry to map 
         forecast[date] = temps;
      }
   });
   
   return forecast;
}

// Convert date string into Mon, Tue, etc.
function getDayName(dateStr) {
   const date = new Date(dateStr);
   return date.toLocaleDateString("en-US", { weekday: 'short', timeZone: 'UTC' });
}

// Show the element
function showElement(elementId) {
   $(`#${elementId}`).show();
}

// Hide the element
function hideElement(elementId) {
   $(`#${elementId}`).hide();
}

// Display the text in the element
function showText(elementId, text) {
   $(`#${elementId}`).html(text);
}

// Show the weather image that matches the weatherType
function showImage(elementId, weatherType) {   
   // Images for various weather types
   const weatherImages = {
      Clear: "clear.png",
      Clouds: "clouds.png",
      Drizzle: "drizzle.png",
      Mist: "mist.png",
      Rain: "rain.png",
      Snow: "snow.png"
   };

   const imgUrl = "https://s3-us-west-2.amazonaws.com/static-resources.zybooks.com/";
   $(`#${elementId}`).attr({
      src: imgUrl + weatherImages[weatherType],
      alt: weatherType
   });
}

/*function displayInfo(data, cityId, city) {
    
   // Map for storing high, low, weather
   const forecast2 = [];
   
   // Determine high and low for each day
   data.list.forEach(function (item) {
      // Extract just the yyyy-mm-dd 
      const date = item.dt_txt.substr(0, 10);
      
      // Extract temperature
      const temp = item.main.temp;

      // Have this date been seen before?
      if (date in forecast2) {         
         // Determine if the temperature is a new low or high
         if (temp < forecast2[date].low) {
            forecast2[date].low = temp;
         }
         if (temp > forecast2[date].high) {
            forecast2[date].high = temp;
         }
      }
      else {
         // Initialize new forecast
         const temps = {
            high: temp,
            low: temp,
            weather: item.weather[0].main
         }   
         
         // Add entry to map 
         forecast2[date] = temps;
      }
        });
       var highs = 0;
       var lows = 0;
    for(var i=0;i<forecast2.length;i++) {
        highs += Math.round(forecast2[i].high);
        lows += Math.round(forecast2[i].low);
    }
    var avgHighs = highs/forecast2.length;
    var avgLows = lows/forecast2.length;
       
   // No longer loading
   hideElement("loading-info-" + cityId);

   // Display results table
   showElement("avg-results-" + cityId);

   const cityName = data.city.name;
   showText("avg-"+cityId + "-name", cityName);
    
    showText(`avg-${cityId}`, avgHighs + "&deg;");
       
}

<!––      
       <section id="info" class="hidden">
       <h2>Info:</h2>  
         <p id="loading-info">Loading Info...</p>
         <p id="error-loading-info" class="error-msg"></p>
           <table id="avg-results-city1">
           <caption id="avg-city1-name"></caption>
           <tr>
               <td id="avg-city1"></td>
           </tr>
               </table>
           <table id="avg-results-city2">
               <caption id="avg-city2-name"></caption>
            <tr>
               <td id="avg-city2"></td>
            </tr>
               </table>
       </section>
    -->
*/