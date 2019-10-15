const DEBUG_ENABLED = true;

function debug(text) {
  if (DEBUG_ENABLED) {
    document.getElementById('debugWindow').innerText = text;
  }
}

if (!DEBUG_ENABLED) {
  document.getElementById('debugWindow').style.display = "none";
}