/*jshint camelcase: false*/
(function(window, $, undefined) {
  'use strict';

  console.log('Hello, workshop tutorial!');

  var appContext = $('[data-app-name="workshop-tutorial"]');

  /* Wait for Agave to Bootstrap before executing our code. */
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    Agave.api.profiles.me({}, function(resp) {
      /*
       * The parsed JSON response from Agave is in `resp.obj`.
       * Other data available in resp include headers, request
       * metadata, and the raw response data string. The Agave
       * Profile object is the `result` attribute of the Agave
       * response object.
       */
      var profile = resp.obj.result;
      console.log(JSON.stringify(profile, null, 2));

      $('.profile-name', appContext).text(profile.username);

      var vcard = $('.vcard', appContext);
      vcard.find('.fn').text(profile.full_name);
      vcard.find('.email').text(profile.email);
      vcard.find('.tel-primary').text(profile.phone || 'not specified');
      vcard.find('.tel-secondary').text(profile.mobile_phone || 'not specified');

      /* do some date parsing */
      var parsedDate = profile.create_time.replace(
        /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
        '$1-$2-$3T$4:$5:$6'
      );
      vcard.find('.note').text(new Date(parsedDate).toLocaleString());

      vcard.removeClass('hide');
    });
  });

})(window, jQuery);
