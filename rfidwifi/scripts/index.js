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
var snack = (text) => {
  // var x = document.getElementById("snackbar");
  let x = document.getElementById('snackbar');
  x.className = 'show';
  x.innerHTML = text;
  setTimeout(() => {
      x.className = x.className.replace('show', '');
  }, 3000);
};


dbPromise
    .then(db => {
      const tx = db.transaction("account");
      const acctStore = tx.objectStore("account");
      const nameIndex = acctStore.index("name");
      return nameIndex.getAll();
    })
    .then(account => {
      if(account.length>0){}
      else{
        dbPromise
        .then(db => {
          const tx = db.transaction("account", "readwrite");
          const roomStore = tx.objectStore("account");
          roomStore.put({ name: "admin", id: "admin" });
          return tx.complete;
        })
        .then(() => {
          console.log("Added  account to db");
        }); 
      }
     
    });


var userLogin = () => {
  const userName = document.getElementById("inputEmail").value;
  const userPass = document.getElementById("inputPassword").value;
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
        if (act.name === userName && act.id === userPass) {
          window.location.href = "/rfidwifi/dashboard.html";
          snack('Login successfully');
        } else {
          console.log("login fail");
          snack('Login fail, Try Again!!!');
        }
        //
      }
    });
};

toggleInfo = function(visible) {
  var x = document.getElementById("info");
  if (visible) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
};

document.getElementById("login").addEventListener("click", function() {
  userLogin();
});

document.getElementById("refresh").addEventListener("click", function() {
  // Close the add new city dialog
  console.log("refreshed");
  serviceWorker.postMessage({ action: "skipWaiting" });
});

document.getElementById("dismiss").addEventListener("click", function() {
  toast.setAttribute("class", "");
});
