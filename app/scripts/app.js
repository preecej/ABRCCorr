/*jshint camelcase: false*/
(function(window, $, undefined) {
  'use strict';

  console.log('Hello, workshop tutorial!');

  var appContext = $('[data-app-name="workshop-tutorial"]');

  /* Wait for Agave to Bootstrap before executing our code. */
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    /*
     * ADAMA - Araport Data API Mediator API
     * getStatus()
     * getNamespaces()
     * getServices()
     * search()
     *
     * Data APIs
     * {"namespace": "aip", "service": "atted_coexpressed_by_locus_v0.1"}
     * {"namepsace": "aip", "service": "locus_gene_report_v0.1"}
     */
    var form = $('form[name=workshop-tutorial-query]', appContext);
    form.on('submit', function(e) {
      e.preventDefault();

      // clear error messages
      $('.messages', this).empty();
      $('.has-error', this).removeClass('has-error');

      var query = {
        locus: this.locus.value,
        relationship_type: this.relationship_type.value,
        threshold: this.threshold.value
      };

      // basic validate
      var hasError = false;
      if (! query.locus) {
        $(this.locus).parent().addClass('has-error');
        $('.messages', this).append('<div class="alert alert-danger">Locus is required</div>');
        hasError = true;
      }

      if (! query.threshold) {
        $(this.threshold).parent().addClass('has-error');
        $('.messages', this).append('<div class="alert alert-danger">Threshold is required</div>');
        hasError = true;
      } else if (! /(\d+\.)?\d+/.test(query.threshold)) {
        $(this.threshold).parent().addClass('has-error');
        $('.messages', this).append('<div class="alert alert-danger">Threshold must be numeric</div>');
        hasError = true;
      }

      if (! hasError) {
        $('.results').html('<pre><code>' + JSON.stringify(query, null, 2) + '</code></pre>');
      }

      // Agave.api.adama.getStatus({}, function(resp) {
      //   if (resp.obj.status === 'success') {
      //     Agave.api.adama.search({'namespace': 'aip', 'service': 'atted_coexpressed_by_locus_v0.1', 'queryParams': query}, function(result) {
      //       $('.results').html('<pre><code>' + JSON.stringify(result, null, 2) + '</code></pre>');
      //     });
      //   } else {
      //     // ADAMA is not available, show a message
      //     $('.messages', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
      //   }
      // });

    });

  });

})(window, jQuery);
