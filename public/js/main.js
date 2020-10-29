$(function () {
  ClassicEditor
    .create(document.querySelector('textarea#ta'))
    .catch(error => {
      console.error(error);
    });

  $('a.confirm-deletion').on('click', function () {
    if (!confirm('Are you sure want to delete this page?')) return false;
  });
});