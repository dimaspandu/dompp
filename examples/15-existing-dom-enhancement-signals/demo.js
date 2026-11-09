const [count, setCount] = document.createSignal(0);

document.getElementById("enhance-target")
  .setEnhancement(({ childNodes }) => {
    childNodes[0].setFineGrained().setText(() => "Count: " + count());
    childNodes[1].setEvents({ click() { setCount(count() + 1); } });
  });

// Server HTML:
// <section id="enhance-target">
//   <h2>0</h2>
//   <button>Increment</button>
// </section>