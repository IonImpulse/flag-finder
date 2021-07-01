async function load_data(csv_name) {
    return new Promise((resolve, reject) => {
        Papa.parse(`https://raw.githubusercontent.com/IonImpulse/smart-flag-finder/main/data/${csv_name}`, {
            download: true,
            dynamicTyping: true,
            worker: true,
            header: true,
            complete(results, file) {
                resolve(results.data)
            },
            error(err, file) {
                reject(err)
            }
        });
    });
}

async function start() {
    const FLAG_FILES = [
        "countries.csv",
        "pride.csv",
        "misc.csv",
    ];

    console.log("Loading data...");

    let flag_data_promises = [];

    for (file of FLAG_FILES) {
        flag_data_promises.push(load_data(file));
    }
    
    flag_data_promises = await Promise.all(flag_data_promises);

    let flag_data = flag_data_promises.flat();

    console.log("Loaded data!");

    document.getElementById("subtext").innerHTML = `[ With a database of <number-flag>${flag_data.length}</number-flag> flags and counting ]`;
    return flag_data;
}

async function button_click() {
    document.getElementById("start-button").setAttribute('onclick', "");
    document.getElementById("start-button").style.opacity = "0";
    
    if (sessionStorage.getItem("flag_data") == false) {
        console.log("Redoing flag data request!");
        let flag_data = await start();
        sessionStorage.setItem("flag_data", JSON.stringify(await start()));
    }
    

    setTimeout(setup, 700);
}

function delete_button() {
    document.getElementById("start-button").outerHTML = "";
}

function empty_attributes(attributes) {
    return Object.values(attributes).every(x => (x === false));
}

function sum(array) {
    let to_return = 0;
    for (i in array) {
        to_return += array[i];
    }
    return to_return;
}

function standardDeviation(arr, usePopulation = false) {
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(
      arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
        (arr.length - (usePopulation ? 0 : 1))
    );
};

function go_home() {
    document.location = document.location.href;
}
function get_score(list) {
    let temp_list = [];

    for (let attribute in list) {
        temp_list.push(list[attribute]);
    }

    const standard_deviation = standardDeviation(temp_list);

    if (standard_deviation == 0) {
        return 0;
    }
    
    return standard_deviation + ((sum(list)/temp_list.length));

}

function find_most_divisive(flags_left, attributes_available) {
    let percentage_list = {};

    for (let part in attributes_available) {
        if (attributes_available[part] === true && part != "url" && part != "name") {
            let temp_list = {};
            let return_score = Infinity;
            
            if (typeof flags_left[0][part] === "boolean") {
                temp_list = {
                    contains: 0,
                    n_contains: 0,
                };
                
                for (var flag of flags_left) {
                    if (flag[part] === true) {
                        temp_list.contains += 1;
                    } else {
                        temp_list.n_contains += 1;
                    }
                }

                return_score = Math.abs(temp_list.contains-temp_list.n_contains);

            } else {
                for (var flag of flags_left) {
                    if (flag[part] != undefined) {
                        if (temp_list[flag[part]] == undefined) {
                            temp_list[flag[part]] = 1;
                        } else {
                            temp_list[flag[part]] += 1;
                        }
                    }
                }

                return_score = get_score(temp_list);
            }

            percentage_list[part] = return_score;
            
        }
    }

    let min_score = Infinity;
    let min_name;

    for (let part in percentage_list) {
        if (percentage_list[part] < min_score) {
            min_score = percentage_list[part];    
            min_name = part;
        }
    }
    return min_name;
}


function setup_stepper() {
    var inc = document.getElementsByClassName("stepper");
    for (i = 0; i < inc.length; i++) {
    var incI = inc[i].querySelector("input"),
        id = incI.getAttribute("id"),
        min = incI.getAttribute("min"),
        max = incI.getAttribute("max"),
        step = incI.getAttribute("step");
    document
        .getElementById(id)
        .previousElementSibling.setAttribute(
        "onclick",
        "stepperInput('" + id + "', -" + step + ", " + min + ")"
        ); 
    document
        .getElementById(id)
        .nextElementSibling.setAttribute(
        "onclick",
        "stepperInput('" + id + "', " + step + ", " + max + ")"
        ); 
    }
}

function stepperInput(id, s, m) {
  var el = document.getElementById(id);
  if (s > 0) {
    if (parseInt(el.value) < m) {
      el.value = parseInt(el.value) + s;
    }
  } else {
    if (parseInt(el.value) > m) {
      el.value = parseInt(el.value) + s;
    }
  }
}

function return_question(attribute) {
    let question = "";
    let type = "";

    if (["bars", "stripes", "bars", "colours", "circles", "crosses", "saltires", "stars", "crescents", "triangles", "quarters"].includes(attribute)) {
        if (attribute == "bars") {
            question = `How many vertical <attribute-flag>${attribute}</attribute-flag> are present?`;
        } else if (attribute == "stripes") {
            question = `How many horizontal <attribute-flag>${attribute}</attribute-flag> are present?`;
        } else {
            question = `How many <attribute-flag>${attribute}</attribute-flag> are present?`;
        }

        type = "number";

    } else if (["red", "green", "blue", "yellow", "white", "black", "orange"].includes(attribute)){
        question = `Does it contain the colour <attribute-flag><span style="background-color: ${attribute}">${attribute}?</span></attribute-flag>`;
        type = "bool";

    } else if (attribute == "contains_image") {
        question = `Does it contain an image or coat of arms?`;
        type = "bool";

    } else if (attribute == "contains_text") {
        question = `Does it contain text?`;
        type = "bool";

    } else {
        console.error(`Attribute does not have an associated question type: ${attribute}`);
        return {
            question:`Error with ${attribute} flag attribute`,
            type:"none",
        };
    }

    return {
        question,
        type,
    };
}

function return_true() {
    sessionStorage.setItem("last_answer", true);
    main();
}

function return_false() {
    sessionStorage.setItem("last_answer", false);
    main();
}

function return_number() {
    sessionStorage.setItem("last_answer", document.getElementById("stepper").value);
    main();
}

function setup() {
    let flags_left = JSON.parse(sessionStorage.getItem("flag_data"));
    let attributes_available = {
        name: true,
        url: true,
        bars: true,
        stripes: true,
        colours: true,
        red: true,
        green: true,
        blue: true,
        yellow: true,
        white: true,
        black: true,
        orange: true,
        circles: true,
        crosses: true,
        saltires: true,
        quarters: true,
        stars: true,
        crescents: true,
        triangles: true,
        contains_image: true,
        contains_text: true,
    };
    let iterations = 0;

    sessionStorage.setItem("flags_left", JSON.stringify(flags_left));
    sessionStorage.setItem("attributes_available", JSON.stringify(attributes_available));
    sessionStorage.setItem("iterations", iterations);
    sessionStorage.setItem("last_question", "");
    sessionStorage.setItem("last_question_type", "");
    sessionStorage.setItem("last_answer", "");

    main();
}
async function main() {
    const yes_no_buttons = `
    <div>
        <div class="good-button" id="false-button" onclick="return_false()">NO</div>
        <div class="good-button" id="true-button" onclick="return_true()">YES</div>
    </div>
    `;

    const number_select = `
    <div>
        <span class="stepper good-button">
        <button>–</button>
        <input type="number" id="stepper" value="0" min="0" max="100" step="1">
        <button>+</button>
        </span>
    </div>
    <div class="good-button" id="true-button" onclick="return_number()">SUBMIT</div>
    `;

    let flags_left = JSON.parse(sessionStorage.getItem("flags_left"));
    let attributes_available = JSON.parse(sessionStorage.getItem("attributes_available"));
    let iterations = parseInt(sessionStorage.getItem("iterations"));
    let last_question = sessionStorage.getItem("last_question");
    let last_question_type = sessionStorage.getItem("last_question_type");
    let last_answer = sessionStorage.getItem("last_answer");
    
    console.log(flags_left, attributes_available, iterations, last_question, last_question_type, last_answer);

    if (last_question !== "") {
        if (last_question_type == "bool") {
            if (last_answer == "true") {
                last_answer = true;
            } else {
                last_answer = false;
            }
        } else if (last_question_type == "number") {
            last_answer = parseInt(last_answer);
        }


        attributes_available[last_question] = false;

        let to_delete = [];

        for (let flag in flags_left) {
            if (flags_left[flag][last_question] !== last_answer) {
                to_delete.push(flag);
            }
        }

        let deleted = 0;

        for (let del of to_delete) {
            flags_left.splice(del - deleted, 1);
            deleted += 1;
        }
    }

    let button_placeholder = document.getElementById("choices-holder");

    if (flags_left.length < 5) {
        let question_element = document.getElementById("question-holder");
        question_element.innerHTML = `<div id="question" class="good-button" onclick="setup()">RESULTS (Click to reset)</div>`;

        let output = ``;
        
        for (flag of flags_left) {
            output += `
            <img src="${flag.URL}" width=320px>
            <div class="sub">${flag.Name}</div>
            `;
        }

        button_placeholder.innerHTML = output;

    } else if (!empty_attributes(attributes_available) && flags_left.length > 1 && iterations < 30) {
        
        let attribute = find_most_divisive(flags_left, attributes_available);

        const question_response = return_question(attribute);

        let question_to_set = `<div id="question">${question_response.question}</div>`;

        let question_element = document.getElementById("question-holder");

        question_element.innerHTML = question_to_set;
    
        question_element.style.opacity = 100;
        
        if (question_response.type == "bool") {
            button_placeholder.innerHTML = yes_no_buttons;
        } else {
            button_placeholder.innerHTML = number_select;
            setup_stepper();
        }

        iterations += 1;

        sessionStorage.setItem("flags_left", JSON.stringify(flags_left));
        sessionStorage.setItem("attributes_available", JSON.stringify(attributes_available));
        sessionStorage.setItem("iterations", iterations);
        sessionStorage.setItem("last_question", attribute);
        sessionStorage.setItem("last_question_type", question_response.type);
    }

    
}


async function onLoad() {
    sessionStorage.setItem("flag_data", JSON.stringify(await start()));
}

onLoad();