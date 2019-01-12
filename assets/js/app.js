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
    addTrain() {
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
    
    updateTimes(first, freq) {
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

    displaySchedule() {
        trainsRef.orderByChild("name").on("child_added", function(snapshot) {

            let sv = snapshot.val();
            let sk = snapshot.ref.key;
    
            let nextArrival = 0;
            let minutesAway = 0;
    
            let first = sv.first;
            let freq = sv.frequency;
    
            let times = trainSchedules.updateTimes(first, freq);
            
            let newRow = `<tr id=\"${sk}\" data-first=\"${first}\" data-frequency=\"${freq}\"><th scope=\"row\" class=\"name\" >${sv.name}</th><td class=\"dest\">${sv.destination}</td><td class=\"freq\">${freq}</td><td class=\"next-arrival\">${times.nextArrival}</td><td class=\"minutes-away\">${times.minutesAway}</td><td><a href=\"#edit-train\"><i class=\"fas fa-edit edit\" data-id=\"${sk}\"></i></a></td><td><i class=\"fas fa-times delete\" data-id=\"${sk}\" ></i></td></tr>`;
            $("#trains").append(newRow);

            //  Event listener to delete train
            $(`#${sk} .delete`).on("click", function () {
                trainSchedules.deleteTrain(this);
            });

            // Event listener to edit train
            $(`#${sk} .edit`).on("click", function () {
                trainSchedules.editTrain(this);
            });
            
            // Store train keys for the updates
            trains.push(sk);
            
            // Handle the errors
          }, (errorObject) => {
            console.log("Errors handled: " + errorObject.code);
          });
    },

    currentDate() {
        $("#current-date").text(moment().format("dddd, MMMM Do, YYYY"));
    },

    currentTime() {
        let currTime = moment().format("h:mm a");
        $("#current-time").text(currTime);
    },

    updateSchedule() {
        setInterval(() => {
            trains.forEach((v) => {
                let first = $(`#${v}`).attr("data-first");
                let freq = $(`#${v}`).attr("data-frequency");
                let times = trainSchedules.updateTimes(first, freq);
                $(`#${v} .next-arrival`).text(times.nextArrival);
                $(`#${v} .minutes-away`).text(times.minutesAway);
            })
            trainSchedules.currentTime();
        },60000); 
    },
    
    deleteTrain(thisTrain) {
        let trainKey = ($(thisTrain).attr("data-id"));
        td = document.getElementById("delete-dialog");
        td.showModal();
        $("#delete-submit").on("click", () => {
            trainsRef.child(trainKey).remove();
            td.close();
            });
        $("#delete-cancel").on("click", () => {
            td.close();
            return;
        });
    },

    deleteRow() {
        trainsRef.on("child_removed", function(oldChildSnapshot) {
            let trainKey = oldChildSnapshot.ref.key;
            $(`#${trainKey}`).remove();
        });   
    },

    editTrain(thisTrain) {
        let trainKey = ($(thisTrain).attr("data-id"));
        let trainRef = dataRef.ref(`/trains/${trainKey}`)
        
        trainRef.once("value", function(snapshot) {
            let sv = snapshot.val();
            $("#train-id").val(trainKey);
            $("#train-name").val(sv.name);
            $("#train-destination").val(sv.destination);
            $("#first-train").val(sv.first);
            $("#train-frequency").val(sv.frequency);
            $("#train-added").val(sv.dateAdded);

            // Change Add Train and switch the submit buttons
            $("#train-form-header").text("Edit a Train");
            $("#add-train").css("display","none");
            $("#edit-train").css("display","block");

            
        // Handle any errors
        }, (errorObject) => {
            console.log("Errors handled: " + errorObject.code);
        });        
    },

    updateTrain() {
        // Update the Database
        let trainKey = $("#train-id").val().trim();
        let trainRef = dataRef.ref(`/trains/${trainKey}`)
      
        train["name"] = $("#train-name").val().trim();
        train["destination"] = $("#train-destination").val().trim();
        train["first"] = $("#first-train").val().trim();
        train["frequency"] = $("#train-frequency").val().trim();
        train["dateAdded"] = $("#train-added").val().trim();
        train["dateUpdated"] = firebase.database.ServerValue.TIMESTAMP;

        trainRef.set(train, (error) => {
            (error ? console.log("Errors handled " + error) : console.log("Train successfully updated in the database. "));
        });

        // Change Edit Train and switch the submit buttons
        $("#train-form-header").text("Add a Train");
        $("#edit-train").css("display","none");
        $("#add-train").css("display","block");

        // Clean up
        trainSchedules.clearTrainFields();
    },

    clearTrainFields() {
        $("#train-id").val("");
        $("#train-name").val("");
        $("#train-destination").val("");
        $("#first-train").val("");
        $("#train-frequency").val("");
    },

    updateRow() {
        trainsRef.on("child_changed", function(snapshot) {
            let trainKey = snapshot.ref.key;
            let sv = snapshot.val();
            let nextArrival = 0;
            let minutesAway = 0;
    
            let first = sv.first;
            let freq = sv.frequency;
    
            let times = trainSchedules.updateTimes(first, freq);

            $(`#${trainKey}`).attr("data-first", first);
            $(`#${trainKey}`).attr("data-frequency", freq);

            $(`#${trainKey} .name`).text(sv.name);
            $(`#${trainKey} .dest`).text(sv.destination);
            $(`#${trainKey} .freq`).text(sv.frequency);
            $(`#${trainKey} .next-arrival`).text(times.nextArrival);
            $(`#${trainKey} .minutes-away`).text(times.minutesAway);
        });   
    }
}

$(document).ready(() => {
    $("#add-train").on("click", (e) => {
        e.preventDefault();
        trainSchedules.addTrain();
    });

    $("#edit-train").on("click", (e) => {
        e.preventDefault();
        trainSchedules.updateTrain();
    });

    trainSchedules.deleteRow();
    trainSchedules.updateRow();
    trainSchedules.displaySchedule();
    trainSchedules.currentDate();
    trainSchedules.currentTime();
    trainSchedules.updateSchedule();
});