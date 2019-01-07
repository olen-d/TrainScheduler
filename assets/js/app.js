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
        let newRow = `<tr><th scope=\"row\">${sv.name}</th><td>${sv.destination}</td><td>${sv.frequency}</td><td>-99</td><td>-99</td></tr>`;
        $("#trains").append(newRow);
        // Handle the errors
      }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
      });
});