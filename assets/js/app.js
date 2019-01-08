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
let trains = [];
let trainsRef = dataRef.ref("/trains");

const trainSchedules = {
    addTrain: () => {
        train["name"] = $("#train-name").val().trim();
        train["destination"] = $("#train-destination").val().trim();
        train["first"] = $("#first-train").val().trim();
        train["frequency"] = $("#train-frequency").val().trim();
        train["dateAdded"] = firebase.database.ServerValue.TIMESTAMP;
        
        // Handle errors 
        trainsRef.push(train, (error) => {
            (error ? console.log("Errors handled " + error) : console.log("Train successfully added to the database. "));
        });
    },
    
    updateTimes: (first, freq) => {
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

        return {nextArrival: nextArrival, minutesAway: minutesAway};
    },

    displaySchedule: () => {
        trainsRef.orderByChild("name").on("child_added", function(snapshot) {

            let sv = snapshot.val();
            let sk = snapshot.ref.key;
    
            let nextArrival = 0;
            let minutesAway = 0;
    
            let first = sv.first;
            let freq = sv.frequency;
    
            let times = trainSchedules.updateTimes(first, freq);
            
            let newRow = `<tr id=\"${sk}\" data-first=\"${first}\" data-frequency=\"${freq}\"><th scope=\"row\">${sv.name}</th><td>${sv.destination}</td><td>${freq}</td><td class=\"next-arrival\">${times.nextArrival}</td><td class=\"minutes-away\">${times.minutesAway}</td></tr>`;
            $("#trains").append(newRow);
            
            // Store train keys for the updates
            trains.push(sk);
            
            // Handle the errors
          }, (errorObject) => {
            console.log("Errors handled: " + errorObject.code);
          });
    },

    currentDate: () => {
        $("#current-date").text(moment().format("dddd, MMMM Do, YYYY"));
    },

    updateSchedule: () => {
        setInterval(() => {
            trains.forEach((v) => {
                let first = $(`#${v}`).attr("data-first");
                let freq = $(`#${v}`).attr("data-frequency");
                let times = trainSchedules.updateTimes(first, freq);
                $(`#${v} .next-arrival`).text(times.nextArrival);
                $(`#${v} .minutes-away`).text(times.minutesAway);
            })
            
        },60000); 
    } 
}

$(document).ready(() => {
    $("#add-train").on("click", (e) => {
        e.preventDefault();
        trainSchedules.addTrain();
    });

    trainSchedules.displaySchedule();
    trainSchedules.currentDate();
    trainSchedules.updateSchedule();
});