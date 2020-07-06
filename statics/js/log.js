
// TODO 发布时把if里的内容注释掉
function log (message) {
    if (DEBUG.log_to_page) {
        let p = document.createElement("p");
        p.innerHTML = new Date().toLocaleString() + " -- " + message;
        document.getElementById("debugInfo").append(p);
    }
    console.log(message);
}