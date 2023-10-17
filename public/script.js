var socket = io();
var captionsContainer = document.getElementById("captions");

const PARTIAL = "partial";
const FINAL = "final";
const CAPTION_DATA_ATTR = "data-caption-ts";
const CAPTION_DATA_ATTR_TYPE = "data-caption-type";
let partialTS = "";
const finalTS = [];
const MAX_LENGTH = 50;

socket.on("caption", function (data) {
  // create element per partial caption
  var captionElement = document.createElement("div");
  captionElement.setAttribute(CAPTION_DATA_ATTR, data.ts);

  // save timestamps to keep track of caption elements
  if (data.type === PARTIAL) {
    partialTS = data.ts;
    captionElement.setAttribute(CAPTION_DATA_ATTR_TYPE, PARTIAL);
  } else {
    // remove all old partials if it's a final
    var oldPartials = document.querySelectorAll(
      `[${CAPTION_DATA_ATTR_TYPE}='${PARTIAL}']`
    );
    oldPartials.forEach((partial) => captionsContainer.removeChild(partial));
    finalTS.push(data.ts);
  }

  // set the inner text with each partial.
  // add a space to the end if it's a final.
  captionElement.innerText =
    data.elements
      .map((element) => element.value)
      .join(data.type === PARTIAL ? " " : "") + " ";

  // find any old partials and remove them
  document
    .querySelectorAll(`[${CAPTION_DATA_ATTR}='${partialTS}']`)
    .forEach((partial) => captionsContainer.removeChild(partial));

  // append fresh captions
  captionsContainer.appendChild(captionElement);

  // scroll caption into view
  captionElement.scrollIntoView({ block: "end", behavior: "smooth" });

  // remove any old captions after they're past the scroll
  if (finalTS.length > MAX_LENGTH) {
    const remove = finalTS.shift();
    document
      .querySelectorAll(`[${CAPTION_DATA_ATTR}='${remove}']`)
      .forEach((final) => captionsContainer.removeChild(final));
  }
});
