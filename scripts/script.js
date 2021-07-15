const FLAG_FILES = [
    "countries.csv",
    "pride.csv",
    "organizations.csv",
    "us_state_territory_flags.csv",
    "corporations.csv",
    "ideologies.csv",
    "cities_of_the_world.csv"
];



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
    console.log("Loading data...");

    let flag_data_promises = [];

    for (file of FLAG_FILES) {
        flag_data_promises.push(load_data(file));
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

    console.log("Loaded data!");

    document.getElementById("subtext").innerHTML = `[ With a database of <number-flag>${insert_commas(flag_data.length)}</number-flag> flags and counting ]`;
    return flag_data;
}

// function to take a number and insert commas where needed
function insert_commas(n) {
    var a = n.toString().split(".");
    a[0] = a[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return a.join(".");
}

async function start_click() {
    document.getElementById("start-button").setAttribute('onclick', "");
    document.getElementById("start-button").style.opacity = "0";
    
    if (sessionStorage.getItem("flag_data") == false) {
        console.log("Redoing flag data request!");
        sessionStorage.setItem("flag_data", JSON.stringify(await start()));
    }

    setTimeout(setup, 700);
}

async function view_click() {
    if (sessionStorage.getItem("flag_data") == false) {
        console.log("Redoing flag data request!");
        sessionStorage.setItem("flag_data", JSON.stringify(await start()));
    }
    
    let flags_left = JSON.parse(sessionStorage.getItem("flag_data"));
    show_remaining_flags(flags_left, false);
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

    } else if (["red","greenteal","blue","white","black","orangeyellow","purple"].includes(attribute)){
        if (attribute == "greenteal") {
            question = `Does it contain either colour <attribute-flag class="flag-green">green</attribute-flag> or <attribute-flag class="flag-teal">teal?</attribute-flag>`;
        } else if (attribute == "orangeyellow") {
            question = `Does it contain either colour <attribute-flag class="flag-orange">orange</attribute-flag> or <attribute-flag class="flag-yellow">yellow?</attribute-flag>`;
        } else {
            question = `Does it contain the colour <attribute-flag class="flag-${attribute}">${attribute}?</attribute-flag>`;
        }

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
    document.getElementById("answers-holder").style.opacity = 0;
    let flags_left = JSON.parse(sessionStorage.getItem("flag_data"));
    let attributes_available = {
        red: true,
        greenteal: true,
        blue: true,
        white: true,
        black: true,
        orangeyellow: true,
        purple: true,
        bars: true,
        stripes: true,
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

    document.getElementById("answers-holder").innerHTML = "";

    sessionStorage.setItem("flags_left", JSON.stringify(flags_left));
    sessionStorage.setItem("attributes_available", JSON.stringify(attributes_available));
    sessionStorage.setItem("iterations", iterations);
    sessionStorage.setItem("last_question", "");
    sessionStorage.setItem("last_question_type", "");
    sessionStorage.setItem("last_answer", "");

    main();
}

function show_remaining_flags(flags_left, show_stats) {
    let iterations = parseInt(sessionStorage.getItem("iterations"));
    let attributes_available = JSON.parse(sessionStorage.getItem("attributes_available"));

    if (show_stats == true) {
        animate_stats(flags_left.length, flags_left.length, iterations + 1, Object.keys(attributes_available).length);
    }
    let question_element = document.getElementById("question-holder");
    question_element.innerHTML = `<div id="question" class="good-button" onclick="setup()">RESULTS (Click to reset)</div>`;

    let output = ``;
    
    if (flags_left.length == 0) {
        output = `<div class="flag-frame"><div class="sub">No flags left!</div></div>`;
    } else {
        let flag_id = 0;
        for (flag of flags_left) {
            let flag_info = `Colors: `;

            // Add flag colors to flag_info string
            if (flag.red == true) {
                flag_info += `<attribute-flag class="flag-red">red</attribute-flag>, `;
            }
            if (flag.greenteal == true) {
                flag_info += `<attribute-flag class="flag-green">green</attribute-flag>/<attribute-flag class="flag-teal">teal</attribute-flag>, `;
            }
            if (flag.blue == true) {
                flag_info += `<attribute-flag class="flag-blue">blue</attribute-flag>, `;
            }
            if (flag.white == true) {
                flag_info += `<attribute-flag class="flag-white">white</attribute-flag>, `;
            }
            if (flag.black == true) {
                flag_info += `<attribute-flag class="flag-black">black</attribute-flag>, `;
            }
            if (flag.orangeyellow == true) {
                flag_info += `<attribute-flag class="flag-orange">orange</attribute-flag>/<attribute-flag class="flag-yellow">yellow</attribute-flag>, `;
            }
            if (flag.purple == true) {
                flag_info += `<attribute-flag class="flag-purple">purple</attribute-flag, `;
            }

            // Remove trailing comma
            flag_info = flag_info.slice(0, -2);

            flag_info += "<br>Attributes: ";

            for (attribute of Object.keys(flag)) {
                if (["red", "greenteal", "blue", "white", "black", "orangeyellow", "purple", "URL", "Name"].includes(attribute) == false) {

                    if (typeof(flag[attribute]) == 'boolean') {
                        flag_info += `${attribute}, `;
                    } else {
                        if (flag[attribute] > 0) {
                            flag_info += `${attribute}=${flag[attribute]}, `;
                        }
                    }
                }
            }

            // Remove trailing comma
            flag_info = flag_info.slice(0, -2);
            
            output += `<div class="flag-frame">
        <div class="flag-frame-inner">
            <img class="lazyload flag" id="flag-${flag_id}" data-src="${flag.URL}" onclick="show_information_about_flag('${flag_id}')" width=320px>
            <div class="flag-info-text" id="flag-info-${flag_id}" style="opacity: 0%">${flag_info}</div>
        </div>
        <div class="sub">${flag.Name}</div></div>
        `;
            flag_id++;
        }
    }

    document.getElementById("choices-holder").innerHTML = "";
    document.getElementById("answers-holder").innerHTML = output;
    document.getElementById("answers-holder").style.opacity = 100;
}

// function called when user clicks on a flag to show information about it
function show_information_about_flag(flag_id) {
    let flag_element = document.getElementById(`flag-${flag_id}`);
    let flag_info_element = document.getElementById(`flag-info-${flag_id}`)
    if (flag_element.style.filter != 'blur(10px)') {
        flag_element.style.filter = 'blur(10px)';
        flag_info_element.style.opacity = 100;
    } else {
        flag_element.style.filter = 'blur(0px)';
        flag_info_element.style.opacity = 0;
    }

    
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to animate the number of flags remaining counting down
async function animate_stats(num_flags_left, num_previous_flags_left, round_num, total_rounds) {
    
    let stats_element = document.getElementById("stats-holder");
    let stats_to_set = `<div id="stats">Round: ${round_num}/${total_rounds} | Flags Remaining: ${insert_commas(num_previous_flags_left)}</div>`;

    stats_element.innerHTML = stats_to_set;
    stats_element.opacity = 100;

    let total_time_to_wait = 1000;
    let individual_time_to_wait = total_time_to_wait/(num_previous_flags_left-num_flags_left);

    console.log(`Counting down from ${num_previous_flags_left} to ${num_flags_left}`);

    for (let num = num_previous_flags_left; num >= num_flags_left; num--) {
        let stats_to_set = `<div id="stats">Round: ${round_num}/${total_rounds} | Flags Remaining: ${insert_commas(num)}</div>`;
        stats_element.innerHTML = stats_to_set;
        await sleep(individual_time_to_wait);
        let iterations = JSON.parse(sessionStorage.getItem("iterations"));
        if (iterations != round_num) {
            return
        }
    }
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
    
    //console.log(flags_left, attributes_available, iterations, last_question, last_question_type, last_answer);
    let flags_left_previous = flags_left.length;
    
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

    animate_stats(flags_left.length, flags_left_previous, iterations + 1, Object.keys(attributes_available).length);

    if (flags_left.length <= 6 || empty_attributes(attributes_available)) {
        show_remaining_flags(flags_left, true);

    } else if (!empty_attributes(attributes_available) && flags_left.length > 1) {
        
        let attribute = find_most_divisive(flags_left, attributes_available);

        const question_response = return_question(attribute);

        let question_element = document.getElementById("question-holder");
        let question_to_set = `<div id="question">${question_response.question}</div>`;
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