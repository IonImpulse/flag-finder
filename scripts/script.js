const header_defs = [ "name",
                                "bars", 
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
        Papa.parse("https://raw.githubusercontent.com/IonImpulse/smart-flag-finder/main/data/flag.data.csv", {
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

async function main() {
    console.log("Loading data...");

    const flag_data = await load_data();
    
    console.log("Loaded data!");


}

main();