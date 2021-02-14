const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

// DB variable
let db;

//Open a budget tracker DB
const request = indexedDB.open("budget", 1);

//Update / modify db
request.onupgradeneeded = ({
    target
}) => {
    let db = target.result;
    db.createObjectStore("pending", {
        autoIncrement: true
    });
};

//Error Handler
request.onerror = function (event) {
    console.log("Error: db.js " + event.target.errorCode);
};


//Saved later to db
request.onsuccess = ({
    target
}) => {
    db = target.result;
    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

//Sends once online
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => {
                    return response.json();
                })
                .then(() => {
                    // delete records if successful
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

// listen for app coming back online
window.addEventListener("online", checkDatabase);