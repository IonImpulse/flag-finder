import {parse} from 'PapaParse';

const header_defs: string[] = [ "name",
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
    var flag_data;

    parse("http://example.com/file.csv", {
        download: true,
        dynamicTyping: true,

        complete: function(results) {
            flag_data = results;
        }
    });

    return flag_data
}


async function main() {
    const flag_data: any = load_data();

    console.log(flag_data)
}