var serviceWorker = {};
const registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register("/rfidwifi/sw.js").then(reg => {
    if (!navigator.serviceWorker.controller) {
      return;
    }

    if (reg.waiting) {
      serviceWorker = reg.waiting;
      updateReady(reg.waiting);
      return;
    }

    if (reg.installing) {
      serviceWorker = reg.installing;
      trackInstalling(reg.installing);
      return;
    }

    reg.addEventListener("updatefound", () => {
      serviceWorker = reg.installing;
      trackInstalling(reg.installing);
    });
  });

  // Ensure refresh is only called once.
  // This works around a bug in "force update on reload".
  let refreshing;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });
};

const trackInstalling = worker => {
  worker.addEventListener("statechange", () => {
    if (worker.state == "installed") {
      updateReady(worker);
    }
  });
};

const updateReady = worker => {
  const toast = document.getElementById("simple-toast");
  toast.setAttribute("class", "visible");
};

const dbPromise = idb.open("hotel-db", 1, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      const acctStore = upgradeDb.createObjectStore("account", {
        keyPath: "name"
      });
      acctStore.createIndex("name", "name");
    case 1:
      const roomStore = upgradeDb.createObjectStore("rooms", {
        keyPath: "name"
      });
      roomStore.createIndex("name", "name");
  }
});

registerServiceWorker();

var addDialog = document.querySelector(".dialog-container");
var addChgDialog = document.querySelector(".dialog-containerchgcode");
var toDoUl = document.querySelector(".room-list ul");
//CEATE FUNCTIONS
var snack = text => {
  // var x = document.getElementById("snackbar");
  let x = document.getElementById("snackbar");
  x.className = "show";
  x.innerHTML = text;
  setTimeout(() => {
    x.className = x.className.replace("show", "");
  }, 3000);
};
snack("Login successfully");

//CREATING THE ACTUAL TASK LIST ITEM
var createNewRoom = function(room) {
  console.log("Creating room...");

  //SET UP THE NEW LIST ITEM
  var listItem = document.createElement("li"); //<li>
  var label = document.createElement("label"); // <label>
  var deleteBtn = document.createElement("button"); // <button>
  var addTagBtn = document.createElement("button");
  var getTagBtn = document.createElement("button");
  var removeTagBtn = document.createElement("button");
  var brk = document.createElement("br");
  brk.className = "br";
  deleteBtn.innerText = "Delete Door";
  deleteBtn.className = "delete";
  addTagBtn.innerText = "Add Key";
  addTagBtn.className = "addTag";
  getTagBtn.innerText = "Get Key";
  getTagBtn.className = "getTag";
  removeTagBtn.innerText = "Remove Key";
  removeTagBtn.className = "removeTag";

  //PULL THE INPUTED TEXT INTO LABEL
  label.innerText = room;

  listItem.appendChild(label);
  listItem.appendChild(brk);
  listItem.appendChild(deleteBtn);
  listItem.appendChild(brk);
  listItem.appendChild(addTagBtn);
  listItem.appendChild(getTagBtn);
  listItem.appendChild(removeTagBtn);
  //EVERYTHING PUT TOGETHER
  return listItem;
};

//ADD THE NEW TASK INTO ACTUAL INCOMPLETE LIST
var addRoom = function() {
  console.log("Adding room...");
  //FOR CLARITY, GRAB THE INPUTTED TEXT AND STORE IT IN A VAR
  let roomNum = document.getElementById("inputRoom").value;
  let ipAddress = document.getElementById("inputIP").value;
  var label = `Room: ${roomNum} \nIP: ${ipAddress}`;
  if (roomNum === "" || ipAddress === "") {
  } else {
    var listItem = createNewRoom(label);
    //ADD THE NEW LIST ITEM TO LIST
    toDoUl.appendChild(listItem);
    bindIncompleteItems(listItem, removeRoomList, addKeyRoom, getKeyRoom, removeKeyRoom);
    dbPromise
      .then(db => {
        const tx = db.transaction("rooms", "readwrite");
        const roomStore = tx.objectStore("rooms");
        roomStore.put({
          name: roomNum,
          id: ipAddress,
          created: new Date().getTime()
        });
        return tx.complete;
      })
      .then(() => {
        console.log("Added to db");
      });
    //regRoom(roomNum, ipAddress);
    toggleAddDialog(false);
    toggleInfo(false);
  }
};



var addTagEx = function(room, ip) {
  const url = `http://${ip}/addTagEx/${room}`.trim();
 // const url = `http://${ip}/gpio/1`.trim();
  window.location.href = url;
  // fetch(url)
  //   .then(response => {
  //     return response;
  //   })
  //   .then(json => {
  //     console.log("parsed json", json);
  //     // if success add to list
  //     snack("Room added successfully");
  //   })
  //   .catch(ex => {
  //     console.log("parsing erro", ex);
  //     snack("Error occur while adding room,Try again!!!");
  //     // show toast not succesfful
  //   });
};
var addTag = function(ip, room) {
  const url = `http://${ip}/addTag/${room}`.trim();
 // const url = `http://${ip}/gpio/1`.trim();
  console.log("parsed json", url);
  window.location.href = url;

  // fetch(url)
  //   .then(response => {
  //     return response;
  //   })
  //   .then(json => {
  //     console.log("parsed json", json);
  //     // if success add to list
  //     snack("Room added successfully");
  //   })
  //   .catch(ex => {
  //     console.log("parsing erro", ex);
  //     snack("Error occur while adding room,Try again!!!");
  //     // show toast not succesfful
  //   });
};
var getTag = function(ip, room) {
  const url = `http://${ip}/getTag/${room}`.trim();
  window.location.href = url;
  // fetch(url)
  //   .then(response => {
  //     return response;
  //   })
  //   .then(json => {
  //     console.log("parsed json", json);
  //     // if success add to list
  //     snack("Room added successfully");
  //   })
  //   .catch(ex => {
  //     console.log("parsing erro", ex);
  //     snack("Error occur while adding room,Try again!!!");
  //     // show toast not succesfful
  //   });
};
var removeTag = function(ip, room) {
  const url = `http://${ip}/removeTag/${room}`.trim();
  //const url = `http://${ip}/gpio/0`.trim();
  window.location.href = url;
  // fetch(url)
  //   .then(response => {
  //     return response;
  //   })
  //   .then(json => {
  //     console.log("parsed json", json);
  //     // if success remove
  //   })
  //   .catch(ex => {
  //     console.log("parsing erro", ex);
  //   });
};


//DELETE ROOM FUNCTIONS
var removeRoomList = function() {
  console.log("remove room...");
  var listItem = this.parentNode;
  var ul = listItem.parentNode;
  var inText = listItem.innerText;
  var rm = inText
    .substring(inText.indexOf(":") + 1, inText.indexOf("IP:"))
    .trim();
  dbPromise
    .then(db => {
      const tx = db.transaction("rooms", "readwrite");
      const roomStore = tx.objectStore("rooms");
      roomStore.delete(rm);
      return tx.complete;
    })
    .then(() => {
      console.log("remove from db");
    });
  ul.removeChild(listItem);
  if (toDoUl.children.length === 0) {
    toggleInfo(true);
  }
};

var addKeyRoom = function() {
  console.log("add key to room...");
  var listItem = this.parentNode;
  var inText = listItem.innerText;
  console.log(inText);
  var rm = inText
    .substring(inText.indexOf(":") + 1, inText.indexOf("IP:"))
    .trim();
  var ip = inText
    .substring(inText.lastIndexOf(":") + 1, inText.indexOf("Delete"))
    .trim();
  addTag(ip, rm);
};
var getKeyRoom = function() {
  console.log("get key to room...");
  var listItem = this.parentNode;
  var inText = listItem.innerText;
  console.log(inText);
  var rm = inText
    .substring(inText.indexOf(":") + 1, inText.indexOf("IP:"))
    .trim();
  var ip = inText
    .substring(inText.lastIndexOf(":") + 1, inText.indexOf("Delete"))
    .trim();
  getTag(ip, rm);
};

var removeKeyRoom = function() {
  console.log("remove key to room...");
  var listItem = this.parentNode;
  var inText = listItem.innerText;
  console.log(inText);
  var rm = inText
    .substring(inText.indexOf(":") + 1, inText.indexOf("IP:"))
    .trim();
  var ip = inText
    .substring(inText.lastIndexOf(":") + 1, inText.indexOf("Delete"))
    .trim();
  removeTag(ip, rm);
};

//A FUNCTION THAT BINDS EACH OF THE ELEMENTS THE INCOMPLETE LIST

var bindIncompleteItems = function(roomItem, deleteButClick, addTagClick, getTagClick, removeTagClick) {
  console.log("Binding the incomplete list...");

  var deleteBut = roomItem.querySelector(".delete");
  deleteBut.onclick = deleteButClick;

  var addTagBut = roomItem.querySelector(".addTag");
  addTagBut.onclick = addTagClick;

  var getTagBut = roomItem.querySelector(".getTag");
  getTagBut.onclick = getTagClick;

  var removeTagBut = roomItem.querySelector(".removeTag");
  removeTagBut.onclick = removeTagClick;
};

if (toDoUl !== null) {
  for (var i = 0; i < toDoUl.children.length; i++) {
    bindIncompleteItems(toDoUl.children[i], removeRoomList, addKeyRoom, getKeyRoom, removeKeyRoom);
  }
}

var toggleAddDialog = function(visible) {
  if (visible) {
    addDialog.classList.add("dialog-container--visible");
  } else {
    addDialog.classList.remove("dialog-container--visible");
  }
};

var toggleChgDialog = function(visible) {
  if (visible) {
    addChgDialog.classList.add("dialog-containerchgcode--visible");
  } else {
    addChgDialog.classList.remove("dialog-containerchgcode--visible");
  }
};

toggleInfo = function(visible) {
  var x = document.getElementById("info");
  if (visible) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};
var changeCode = (oldCode, newCode) => {
  dbPromise
    .then(db => {
      const tx = db.transaction("account");
      const acctStore = tx.objectStore("account");
      const nameIndex = acctStore.index("name");
      return nameIndex.getAll();
    })
    .then(account => {
      for (act of account) {
        console.log(act);
        if (act.id === oldCode) {
          dbPromise
            .then(db => {
              const tx = db.transaction("account", "readwrite");
              const roomStore = tx.objectStore("account");
              roomStore.put({
                name: "admin",
                id: newCode,
                created: new Date().getTime()
              });
              return tx.complete;
            })
            .then(() => {
              console.log("passcode change");
            });
        } else {
          console.log("invalid code");
        }
        //
      }
    });
};
document.getElementById("butChgpwd").addEventListener("click", function() {
  // Add the newly selected city
  toggleChgDialog(true);
});
document.getElementById("butAddRoom").addEventListener("click", function() {
  // Add the newly selected city
  console.log("add room");
  addRoom();
});
document.getElementById("butAdd").addEventListener("click", function() {
  // Open/show the add new city dialog
  toggleAddDialog(true);
});

document.getElementById("butAddCancel").addEventListener("click", function() {
  // Close the add new city dialog
  toggleAddDialog(false);
});
document.getElementById("butchgCode").addEventListener("click", function() {
  // Open/show the add new city dialog
  let oldCode = document.getElementById("inputOldcode").value;
  let newCode = document.getElementById("inputNewcode").value;
  changeCode(oldCode, newCode);
  toggleChgDialog(false);
});

document.getElementById("butCancel").addEventListener("click", function() {
  // Close the add new city dialog
  toggleChgDialog(false);
});

document.getElementById("butLogout").addEventListener("click", function() {
  // Close the add new city dialog
  window.location.href = "/rfidwifi/index.html";
});
document.getElementById("refresh").addEventListener("click", function() {
  // Close the add new city dialog
  console.log("refreshed");
  serviceWorker.postMessage({ action: "skipWaiting" });
});

document.getElementById("dismiss").addEventListener("click", function() {
  toast.setAttribute("class", "");
});

dbPromise
  .then(db => {
    const tx = db.transaction("rooms");
    const roomStore = tx.objectStore("rooms");
    const nameIndex = roomStore.index("name");

    return nameIndex.getAll();
  })
  .then(rooms => {
    if (rooms.length > 0) {
      console.log(rooms);
      toggleInfo(false);
      for (room of rooms) {
        console.log(room);
        var label = `Room: ${room.name} \nIP: ${room.id}`;
        var listItem = createNewRoom(label);
        //ADD THE NEW LIST ITEM TO LIST
        toDoUl.appendChild(listItem);
        bindIncompleteItems(listItem, removeRoomList, addKeyRoom, getKeyRoom, removeKeyRoom);
      }
    } else {
      toggleInfo(true);
    }
  });
