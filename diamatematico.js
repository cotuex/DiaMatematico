/**
 * 
 * @param {string[]} args An array with the elements to put in the place of "{}".
 */
String.prototype.format = function (args) {
    var a = this;

    for (var arg of args) {
        a = a.replace("{}", arg);
    }

    return a;
}

/**
 * Convert a number from base-10 into any base
 * @param {Number} number 
 * @param {Number} base 
 * @param {Number} paddingLength 
 * @returns {Number[]} An array with each of the digits in decimal.
 * The array will be filled with ceros to get to the size of the paddingLenght.
 */
var base10toN = function (number, base, paddingLength = 0) {
    var answer = [];
    var division, rest;
    [division, rest] = [number, 0];
    while (true) {
        [division, rest] = [Math.floor(division / base), division % base];
        answer.push(rest);
        if (division == 0)
            break;
    }
    return answer.reverse().join("").padStart(paddingLength, "0").split("").map(Number);
};

/**
 * 
 * @param {String} day 
 * @param {String} month 
 * @param {String} year 
 */
var computeVariationsOfTime = function* (day, month, year) {
    day = day.toString().padStart(2, "0");
    month = month.toString().padStart(2, "0");
    year = year.toString();

    var dayShort = day[0] === "0";
    var monthShort = month[0] === "0";

    var variations = [
        [0, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 0, 1],
        [1, 1, 0],
        [1, 1, 1]
    ];

    if (!dayShort) {
        variations = variations.filter((x) => {
            return !x[0] === false;
        });
    }

    if (!monthShort) {
        variations = variations.filter((x) => {
            return !x[1] === false;
        });
    }

    var output = []

    for (var v of variations) {
        var vDay = v[0] === 1 ? day : day.slice(1, day.length);
        var vMonth = v[1] === 1 ? month : month.slice(1, month.length);
        var vYear = v[2] === 1 ? year : year.slice(2, year.length);

        var displayDate = vDay.concat(vMonth).concat(vYear);
        yield displayDate.split("");
    };
}

/**
 * 
 * @param {Array} array An array containing string elements to be agrouped in all the possible cases
 * @returns {string[]} An 1D array containing a couple of elements agrouped
 */
var computeSubGroups = function* (array) {
    for (var binaryCounter = 2 ** (array.length - 1) - 1; binaryCounter > 0; binaryCounter--) {
        var divider = base10toN(binaryCounter, 2, array.length - 1);
        divider.push(1);

        var localSubGroups = [];
        var tempVar = [];

        for (var d = 0; d < divider.length; d++) {
            tempVar.push(array[d]);
            if (divider[d] === 1) {
                localSubGroups.push(tempVar);
                tempVar=[];
            }
        }


        localSubGroups = localSubGroups.map((x) => { return x.join(""); });

        yield localSubGroups;
    }
}

/**
 * 
 * @param {Array} array 
 */
var computeOperators = function* (array) {
    const operators = ["+", "-", "/", "*"];

    var solution = array.pop();

    var counter = 4 ** (array.length - 1) - 1;

    var lTrimZeros = function (string) {
        return string.replace(/0+(?=\d)/g, "");
    }

    var stringToFormat = array.map((x) => {return lTrimZeros(x);}).join("{}");

    for (var c = 0; c < counter + 1; c++) {
        var operations = [];
        
        for (var o = 0; o < array.length - 1; o++) {
            var baseNOperations = base10toN(c, operators.length, array.length - 1);
            operations.push(operators[baseNOperations[o]]);
        }

        var stringToEval = stringToFormat.format(operations) + "===" + lTrimZeros(solution);
        
        var evaluation = eval(stringToEval);

        if(evaluation) {
            yield array.join("{}").format(operations) + "=" + solution;
        }
    
    }
}

var computeMathematicDay = function (day, month, year) {
    var dates = computeVariationsOfTime(day.toString(), month.toString(), year.toString());
    var set = new Set();
    for (var d of dates) {
        var subgroups = computeSubGroups(d);
        for (var s of subgroups) {
            var operators = computeOperators(s);

            for (var o of operators) {
                set.add(o);
            }

        }
    }

    return set;
}

var d = new Date();
var date = d.getDate();
var month = d.getMonth() + 1; //Offset the month to be computed correctly
var year = d.getFullYear();

computeMathematicDay(date, month, year).forEach(element => {
    document.getElementById("content").innerHTML += element + '\n';
});

