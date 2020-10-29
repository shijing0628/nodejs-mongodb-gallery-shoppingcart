$(function () {
 ClassicEditor
  .create(document.querySelector('#ta'))
  .catch(error => {
   console.error(error);
  });
})