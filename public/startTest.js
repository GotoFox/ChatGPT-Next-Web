(function noDebuger() {
  var isDebugEnabled =
    new URL(window.location.href).searchParams.get("debug") === "false";
  if (isDebugEnabled) {
    return;
  }

  function testDebuger() {
    var d = new Date();
    debugger;
    if (new Date() - d > 10) {
      document.body.innerHTML = "";
      return true;
    }
    return false;
  }

  function start() {
    while (testDebuger()) {
      testDebuger();
    }
  }

  if (!testDebuger()) {
    window.onblur = function () {
      setTimeout(function () {
        start();
      }, 500);
    };
  } else {
    start();
  }
})();
