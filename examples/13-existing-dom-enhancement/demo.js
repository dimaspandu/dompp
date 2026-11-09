const enhanced = document.getElementById("enhance-target")
  .setEnhancement(({ childNodes }) => {
    childNodes[1].setEvents({ click() { childNodes[0].setText("Enhanced!"); } });
  });

// Server-rendered HTML structure:
// <section id="enhance-target">
//   <h2>Original</h2>
//   <button>Enhance</button>
// </section>

app.setChildren(enhanced);