var state = {
    flags: null,
    page: "home",
}

const FLAG_FILES = {
    "Countries": "countries.csv",
    "Pride": "pride.csv",
    "Organizations": "organizations.csv",
    "US States & Territories": "us_state_territory_flags.csv",
    "Coporations": "corporations.csv",
    "Ideologies": "ideologies.csv",
    "World Cities": "cities_of_the_world.csv"
};

async function load_data(name, csv_path) {
    return new Promise((resolve, reject) => {
        Papa.parse(`https://raw.githubusercontent.com/IonImpulse/flag-finder/main/data/${csv_path}`, {
            download: true,
            dynamicTyping: true,
            worker: true,
            header: true,
            complete(results, csv_path) {
                resolve(results.data.map((flag) => {
                    flag.collection = name;

                    return flag;
                }))
            },
            error(err, csv_path) {
                reject(err)
            }
        });
    });
}

async function loadAllFlags() {
    console.log("Loading data...");

    let flag_data_promises = [];

    for (key of Object.keys(FLAG_FILES)) {
        flag_data_promises.push(load_data(key, FLAG_FILES[key]));
    }

    flag_data_promises = await Promise.all(flag_data_promises);

    for (flag_group of flag_data_promises) {
        for (flag of flag_group) {
            if (flag.Name == null) {
                flag_group.splice(flag_group.indexOf(flag), 1);
            }
        }
    }

    let flag_data = flag_data_promises.flat();

    state.flags = flag_data;

    console.log("Data loaded.");
    console.log(state);
}

function createFlagDiv(flag, hover = false, clickable = false, extra_classes = []) {
    let div = document.createElement("div");
    
    div.classList.add("flag");

    for (let class_name of extra_classes) {
        div.classList.add(class_name);
    }

    let img = document.createElement("img");
    img.src = flag.URL;
    img.alt = flag.Name;

    div.appendChild(img);

    if (hover) {
        let info_div = document.createElement("div");
        info_div.classList.add("flag-info");
        info_div.innerHTML = `<h1>${flag.Name}</h1>`;
        div.appendChild(info_div);
    }

    return div;
}

function setPage(page) {
    state.page = page;

    document.getElementById("header").classList.remove("load");
    document.getElementById("header").classList.add("load");
    setTimeout(() => {
        document.getElementById("header").classList.remove("load");
    }, 500);

    const els = document.querySelectorAll(".page");

    for (let el of els) {
        el.classList.add("hidden");
    }

    document.querySelector(`.page#${page}`).classList.remove("hidden");
}