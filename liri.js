// npm install dotenv package and require it
require("dotenv").config();

// require the keys.js file that holds the twitter and spotify keys
var keys = require("./keys.js");

// Load the fs package to read and write
var fs = require("fs");

// require twitter, spotify, and request NPM libraries
// npm install twitter, npm install request, npm install node-spotify-api
// I tried using npm install spotify, but I received the error that 'items' was
// undefined when running through my iteration for spotify-this-song.  So, node-spotify-api is what I used here
var twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");


var spotify = new Spotify(keys.spotify)
var client = new twitter(keys.twitter);

// firstCommand includes --> my-tweets, spotify-this-song, movie-this, do-what-it-says
// save the command to a variable so it can be used to switch
var firstCommand = process.argv[2];

// The secondCommand is what you're telling the first command to run for 'spotify-this-song' and 'movie-this'
var secondCommand = process.argv[3];

// switch based on the command received.  case by case basis
switch (firstCommand) {

    // my-tweets firstCommand
    case "my-tweets":
        myTweets();
        break;

    // spotify-this-song firstCommand, then input whichever song in the secondCommmand
    case "spotify-this-song":
        spotifyThisSong(secondCommand);
        break;

    // movie-this firstCommand, then input whichever movie in the secondCommand
    case "movie-this":
        movieThis(secondCommand);
        break;

    // do-what-it-says firstCommand will run what is in the random.txt file.  In this case, it
    // is the Backstreet Boy's song 'I Want It That Way'.  You can change it to 
    // whatever you want it to run.
    case "do-what-it-says":
        doWhatItSays();
        break;
}
//----------------------------------------------------END SWITCH/CASE STATEMENTS----------------------------------------------------

// myTweets function
function myTweets() {

    // 'get' the 20 most recent tweets, excluding replies and retweets
    client.get("statuses/user_timeline",
        { count: 20, trim_user: false, exclude_replies: true, include_rts: false },
        function (error, tweets, response) {

            // if an error is caught, display that and exit out of the function
            if (error) return console.log("Twitter error: " + error);

            // log the command entered to the log.txt file
            logCommand();

            // iteration to pull the text of the tweet and the creation data/time for the specified number of tweets 
            // above.  In this case, the count is 20
            for (var i = 0; i < tweets.length; i++) {
                console.log(tweets[i].text);
                console.log(tweets[i].created_at);
            }
        });

}
//----------------------------------------------------END MYTWEETS FUNCTION----------------------------------------------------


// spotifyThisSong function.  
function spotifyThisSong(receivedSong) {
    // so what I'm doing here is having the input to receive whichever song the person puts in an save it to the song variable.
    // IF you don't put in a song, I'm having it default to 'The Sign' using the ?.  It's like an if else statement without the if else.
    var song = receivedSong ? receivedSong : "The Sign , Ace Of Base";

    // run a search on the Spotify API by track name for the query: song
    spotify.search({ type: 'track', query: song }, function (error, data) {

        // FIRST-IF an error is entered in, this will catch it and log it to the prompt
        if (error) return console.log('Spotify Error: ' + error);

        // SECOND-IF the song is not found in the Spotify database, console log 'NO SONG FOUND!'
        if (data.tracks.items.length === 0) return (console.log('NO SONG FOUND!'));

        // ELSE-log the command issued to the log.txt file selecting the best match item [0] in the index
        else {
            logCommand();

            //Display data
            //ARTIST NAME, SONG NAME, PREVIEW URL, AND ALBUM NAME
            console.log('Artist Name: ' + data.tracks.items[0].artists[0].name);
            console.log('Song Name: ' + data.tracks.items[0].name);
            console.log('Preview Link: ' + data.tracks.items[0].preview_url);
            console.log('Album Title: ' + data.tracks.items[0].album.name);
        }
    });

}
//----------------------------------------------------END SPOTIFYTHISSONG FUNCTION----------------------------------------------------




// Exactly the same idea here as with the spotify-this-song function.  If nothing it entered, display "Mr. Nobody" as the movie
function movieThis(receivedMovie) {


    var movie = receivedMovie ? receivedMovie : "Mr. Nobody";

    // request to omdbapi using movie entered and trilogy api key
    request("http://www.omdbapi.com/?t=" + movie + "&y=&plot=full&tomatoes=true&r=json&y=&plot=short&apikey=trilogy", function (error, response, data) {

        // IF the request is successful.  The status code is 200 if the status returned is OK
        if (!error && response.statusCode === 200) {

            // log the command issued to the log.txt file
            logCommand();

            // Display Data
            // TITLE, YEAR, IMDB RATING, COUNTRY, LANGUAGE(S), PLOT, ACTORS, ROTTEN TOMATO RATING, ROTTEN TOMATO URL
            console.log("Movie Title: " + JSON.parse(data).Title);
            console.log("Release Year: " + JSON.parse(data).Year);
            console.log("IMDB Rating: " + JSON.parse(data).imdbRating);
            console.log("TOMATOMETER: " + JSON.parse(data).Ratings[1].Value);
            console.log("Production Country: " + JSON.parse(data).Country);
            console.log("Language: " + JSON.parse(data).Language);
            console.log("Plot: " + JSON.parse(data).Plot);
            console.log("Actors/Actresses: " + JSON.parse(data).Actors);
        }

    });
}
//----------------------------------------------------END MOVIETHIS FUNCTION----------------------------------------------------


// if the do-what-it-says command is received
function doWhatItSays() {

    // read in the random.txt file
    fs.readFile("random.txt", "utf8", function (error, data) {

        // if an error is caught in the read, display that and exit the function
        if (error) return console.log("Error: " + error);

        // split data into an array of function name and argument
        var dataObject = data.split(",");

        // define the function name and argument name
        var functionName = dataObject[0];
        var myArgument = dataObject[1];

        // modify the functionName received into the function names used in this app
        switch (functionName) {
            case "my-tweets":
                functionName = "myTweets";
                break;
            case "spotify-this-song":
                functionName = "spotifyThisSong";
                break;
            case "movie-this":
                functionName = "movieThis";
                break;
        }

        // now that we have functionName correctly formatted, use eval to evaluate it
        // and send it the argument too
        eval(functionName)(myArgument);

    });

}
//----------------------------------------------------END DOWHATITSAYS FUNCTION----------------------------------------------------


// logging command to log.txt file function
function logCommand() {

    // structure the string that equates to the command that was issued
    if (secondCommand) {
        var temp = "COMMAND: node liri.js " + firstCommand + " " + secondCommand + "";
    } else {
        var temp = "COMMAND: node liri.js " + firstCommand;
    }

    // append the command to log.txt followed by new line escape
    fs.appendFile("log.txt", temp + "\n", function (error) {

        // if there is an error log that then end function
        if (error) return console.log("Error logging command to file: " + error);

    });

}
//----------------------------------------------------END LOGCOMMAND FUNCTION----------------------------------------------------
