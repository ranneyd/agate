module.exports = (message, line, col) => {
    return {
        status: "error",
        line: line,
        column: col,
        message: message
    };
}