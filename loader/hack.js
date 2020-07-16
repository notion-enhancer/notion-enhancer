module.exports = function () {
  document.addEventListener('readystatechange', (ev) => {
    console.log(ev);
  });
};
