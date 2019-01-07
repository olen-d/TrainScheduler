const train = new Object();



$(document).ready(() => {
    $("#add-train").on("click", (e) => {
        e.preventDefault();
        train["name"] = $("#train-name").val().trim();
        train["destination"] = $("#train-destination").val().trim();
        train["first"] = $("#first-train").val().trim();
        train["frequency"] = $("#train-frequency").val().trim();
        train["date-added"] = firebase.database.ServerValue.TIMESTAMP;
        
        let trainsRef = dataRef.ref("/trains");
        trainsRef.push(train);
    });
});