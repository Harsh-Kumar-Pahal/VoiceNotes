import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js';

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyDB_ylrW7hartjCjSAqjjZjUoNSrSX7Et4",
            authDomain: "blogs-a7325.firebaseapp.com",
            databaseURL: "https://blogs-a7325-default-rtdb.firebaseio.com",
            projectId: "blogs-a7325",
            storageBucket: "blogs-a7325.appspot.com",
            messagingSenderId: "868013133674",
            appId: "1:868013133674:web:8ceaa7dfa63ee0d2a0df13",
            measurementId: "G-RJX09FKMMY"
          };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);


        // delete all notes
        function deleteAllNote() {
            getDocs(collection(db, "notes")).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    deleteDoc(doc.ref).then(() => {
                        alert("All Notes Removed from Cloud ✅");
                        console.log("Note successfully deleted!");
                    }).catch((error) => {
                        console.error("Error removing note: ", error);
                    });
                });
            });
        
            document.getElementById("output-container").innerHTML = "";
        }
        // Function to delete a note by its ID
        function deleteNoteById(noteId) {
            deleteDoc(doc(db, "notes", noteId))
                .then(() => {
                    console.log("Note successfully deleted!");
                })
                .catch((error) => {
                    console.error("Error removing note: ", error);
                });
        }

        // Function to display a note element with a delete button
        function displayNoteElement(noteId, noteText) {
            const noteElement = document.createElement("div");
            noteElement.classList.add("note");
            noteElement.innerHTML = noteText;

            // Create a delete button
            const deleteButton = document.createElement("span");
            deleteButton.textContent = "Delete";
            deleteButton.style.color = "white";
            deleteButton.style.alignItems = "right";
            deleteButton.style.backgroundColor = "red";
            deleteButton.style.padding = "4px";
            deleteButton.style.borderRadius = "6px";
            deleteButton.style.translateY = "300%";
            deleteButton.style.cursor = "pointer";
            deleteButton.style.display = "inline-block";
            deleteButton.style.transform = "translateY(10%)";
            deleteButton.style.marginLeft = "20px";
            deleteButton.classList.add("delete-btn");
            deleteButton.addEventListener("click", function () {
                deleteNoteById(noteId);
                noteElement.remove(); // Remove the note element from the DOM
                deleteButton.remove(); // Remove the delete button from the DOM
            });
            noteElement.appendChild(deleteButton);

            document.getElementById("output-container").appendChild(noteElement);
        }

        // Initialize SpeechRecognition
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        let noteCounter = 1;

        recognition.onstart = function() {
            createNewNoteElement();
        };

        recognition.onresult = function(event) {
            let finalTranscript = "";

            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + " ";
                }
            }

            if (finalTranscript.trim() !== "") {
                appendToCurrentNoteElement(`<p> ${finalTranscript}</p>`);
                saveTextToFirestore(finalTranscript.trim());
            }
        };

        function createNewNoteElement() {
            const noteElement = document.createElement("div");
            noteElement.id = `note-${noteCounter}`;
            noteElement.classList.add("note");

            // Create a delete button
            const deleteButton = document.createElement("span");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-btn");
            deleteButton.addEventListener("click", function () {
                deleteNoteById(`note-${noteCounter}`);
                noteElement.remove(); // Remove the note element from the DOM
                deleteButton.remove(); // Remove the delete button from the DOM
            });
            noteElement.appendChild(deleteButton);

            document.getElementById("output-container").appendChild(noteElement);
            noteCounter++;
        }

        function appendToCurrentNoteElement(content) {
            const currentNoteElement = document.querySelector(".note:last-child");
            if (currentNoteElement) {
                currentNoteElement.innerHTML += content;
            }
        }

        function saveTextToFirestore(text) {    
            addDoc(collection(db, "notes"), {
                text: text
            })
            .then((docRef) => {
                console.log("Note added with ID: ", docRef.id);
            })
            .catch((error) => {
                console.error("Error adding note: ", error);
            });
        }

        // Call function to display notes when the page is loaded
        getDocs(collection(db, "notes")).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                displayNoteElement(doc.id, doc.data().text);
            });
        });

        window.addEventListener("beforeunload", function() {
            recognition.stop();
        });

        document.getElementById("start-btn").addEventListener("click", function() {
            recognition.start();
        });

        document.getElementById("stop-btn").addEventListener("click", function() {
            recognition.stop();
            // window.location.reload();
        });

        document.getElementById("del").addEventListener("click", function(){
            deleteAllNote();
        });