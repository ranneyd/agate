error = (message, line, col) => {
    error.count++;
    console.log(message);
    if(line){
        console.log("at line " + line + " and column " + col);
    }
    return {
        status: "error",
        line: line,
        column: col,
        message: message
    };
};

error.count = 0;

module.exports = error;