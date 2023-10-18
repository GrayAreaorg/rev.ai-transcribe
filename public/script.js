var socket = io();
var captionsContainer = document.getElementById("captions");

const PARTIAL = "partial";
const FINAL = "final";
const ATTR_TS = "data-caption-ts";
const ATTR_TYPE = "data-caption-type";
let partialTS = "";
const finalTS = [];
const MAX_LENGTH = 200;

socket.on("caption", function (data) {
  var captionElement = document.createElement("div");
  captionElement.setAttribute(ATTR_TS, data.ts);

  if (data.type === PARTIAL) {
    // keep track of the partials timestamps to remove them later
    partialTS = data.ts;
    captionElement.setAttribute(ATTR_TYPE, PARTIAL);
  } else {
    // if final caption, remove all old partials
    var oldPartials = document.querySelectorAll(`[${ATTR_TYPE}='${PARTIAL}']`);
    oldPartials.forEach((partial) => partial.remove());
    finalTS.push(data.ts);
  }

  // remove all previous partials with the current timestamp
  var oldPartials = document.querySelectorAll(`[${ATTR_TS}='${partialTS}']`);
  oldPartials.forEach((partial) => partial.remove());

  // join all partials
  captionElement.innerText =
    data.elements
      .map((element) => element.value)
      .join(data.type === PARTIAL ? " " : "") + " ";
  
  // append caption elements
  captionsContainer.appendChild(captionElement);

  // scroll into view
  captionElement.scrollIntoView({ block: "end", behavior: "smooth" });

  // remove older captions
  if (finalTS.length > MAX_LENGTH) {
    const remove = finalTS.shift();
    var oldFinals = document.querySelectorAll(`[${ATTR_TS}='${remove}']`);
    oldFinals.forEach((final) => final.remove());
  }
});
