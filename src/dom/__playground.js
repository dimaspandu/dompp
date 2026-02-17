document
  .createElementNS("http://www.w3.org/2000/svg", "svg")
  .setAttributes({ width: 100, height: 100 });

const circle = document
  .createElementNS("http://www.w3.org/2000/svg", "circle")
  .setAttributes({
    cx: 50,
    cy: 50,
    r: 40
  });

svg.setChildren(circle);