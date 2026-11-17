/* Login — password visibility */
(function () {
  'use strict';

  var toggle = document.querySelector('[data-password-toggle]');
  var input = document.querySelector('#login-password');
  var show = document.querySelector('[data-password-show]');
  var hide = document.querySelector('[data-password-hide]');

  if (!toggle || !input) return;

  toggle.addEventListener('click', function () {
    var visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    toggle.setAttribute('aria-pressed', visible ? 'false' : 'true');
    toggle.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
    if (show) show.hidden = !visible;
    if (hide) hide.hidden = visible;
    input.focus();
  });
})();
