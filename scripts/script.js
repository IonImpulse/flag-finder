const header_defs = ["name",
                    "url",
                    "bars",
                    "stripes",
                    "colours",
                    "red",
                    "green",
                    "blue",
                    "gold",
                    "white",
                    "black",
                    "orange",
                    "circles",
                    "crosses",
                    "saltires",
                    "quarters",
                    "sunstars",
                    "crescent",
                    "triangle",
                    "contains_image",
                    "contains_text",
];


async function load_data() {
    return new Promise((resolve, reject) => {
        Papa.parse("https://raw.githubusercontent.com/IonImpulse/smart-flag-finder/main/data/flag.database.csv", {
            download: true,
            dynamicTyping: true,
            worker: true,
            complete (results, file) {
                resolve(results.data)
            },
            error (err, file) {
                reject(err)
            }
        });
    });
}

async function start() {
    console.log("Loading data...");

    const flag_data = await load_data();

    console.log("Loaded data!");

    return flag_data;
}

var flag_data;


async function button_click() {
    document.getElementById("start-button-holder").setAttribute('onclick', "");
    document.getElementById("start-button-holder").style.opacity = "0";
    
    if (!flag_data) {
        flag_data = await start();
    }
    
    setTimeout(main, 700)
}

async function main() {
    console.log(flag_data);

}

async function pose_question()