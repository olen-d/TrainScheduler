
const train = new Object();



$(document).ready(() => {
    $("#add-train").on("click", (e) => {
        e.preventDefault();
        let name = $("#train-name").val().trim();
        train[name] = {};
        train[name]["name"] = $("#train-name").val().trim();
        train[name]["destination"] = $("#train-destination").val().trim();
        train[name]["first"] = $("#first-train").val().trim();
        train[name]["frequency"] = $("#train-frequency").val().trim();
 
        console.log(train);
        console.log(train[name]["name"]);
        console.log(train[name]["destination"]);
        console.log(train[name]["first"]);
        console.log(train[name]["frequency"]);
    });
});