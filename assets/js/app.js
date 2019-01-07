// Initialize Firebase
const config = {
    apiKey: "AIzaSyBnIayw_umZkBFOKKfQLlHzq8QVjwFa5Cc",
    authDomain: "projectseven-249db.firebaseapp.com",
    databaseURL: "https://projectseven-249db.firebaseio.com",
    projectId: "projectseven-249db",
    storageBucket: "projectseven-249db.appspot.com",
    messagingSenderId: "585201311831"
    };

firebase.initializeApp(config);
dataRef = firebase.database();

const train = new Object();
let trainsRef = dataRef.ref("/trains");


$(document).ready(() => {
    $("#add-train").on("click", (e) => {
        e.preventDefault();
        train["name"] = $("#train-name").val().trim();
        train["destination"] = $("#train-destination").val().trim();
        train["first"] = $("#first-train").val().trim();
        train["frequency"] = $("#train-frequency").val().trim();
        train["dateAdded"] = firebase.database.ServerValue.TIMESTAMP;
        
        
        trainsRef.push(train, (error) => {
            (error ? console.log("Errors handled " + error) : console.log("Train successfully added to the database. "));
        });

        
        
    });
    trainsRef.orderByChild("name").on("child_added", function(snapshot) {
        // Log everything that's coming out of snapshot
        /* console.log(snapshot.val());
        console.log(snapshot.val().name);
        console.log(snapshot.val().destination);
        console.log(snapshot.val().first);
        console.log(snapshot.val().frequency);
        console.log(snapshot.val().dateAdded); */
        let sv = snapshot.val();

        // Calculate some times
        let nextArrival = 0;
        let minutesAway = 0;

        let first = sv.first;
        let freq = sv.frequency;
        let mFirst = moment(first,"HH:mm");
        let mInterval = moment().diff(mFirst,"minutes");

        if (mInterval < 0) {
            nextArrival = moment(first,"HH:mm").format("h:mm a");
            minutesAway = mFirst.diff(moment(),"minutes");
        } else {
            // Figure out when the next train is coming
            mp = Math.ceil(mInterval / freq) * freq;
            
            nextArrival = mFirst.add(mp, "minutes");
            minutesAway = nextArrival.diff(moment(),"minutes"); 
            nextArrival = nextArrival.format("h:mm a");
        }
        //console.log(minutesAway);
        //console.log(nextArrival);
        // When is the next train arriving?
        // How many minutes away is it?

        let newRow = `<tr><th scope=\"row\">${sv.name}</th><td>${sv.destination}</td><td>${freq}</td><td>${nextArrival}</td><td>${minutesAway}</td></tr>`;
        $("#trains").append(newRow);
        // Handle the errors
      }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      });
});