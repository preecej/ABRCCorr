/*global _*/
/*jshint camelcase: false*/
(function(window, $, _, undefined) {
  'use strict';

  console.log('Hello, workshop tutorial!');

  var appContext = $('[data-app-name="workshop-tutorial"]');

  var templates = {
    resultTable: _.template('<table class="table"><thead><th>Related Locus</th><th>Direction</th><th>Score</th></thead><tbody><% _.each(result, function(r) { %><%= resultRow(r) %><% }); %></tbody></table>'),
    resultRow: _.template('<% for (var i = 0; i < relationships.length; i++) { %><tr><% if (i === 0) { %><td rowspan="<%= relationships.length %>"><%= related_entity %> <button type="button" class="btn btn-info" name="gene-report" data-locus="<%= related_entity %>"><i class="fa fa-book"></i><span class="sr-only">Get Gene Report</button></td><% } %><td><%= relationships[i].direction %></td><td><% _.each(relationships[i].scores, function(score){ %><%= _.values(score)[0] %><% }); %></td></tr><% } %>'),
    geneReport: _.template('<div class="gene-report"><button type="button" class="close">&times;</button><h1><%= locus %></h1><% _.each(properties, function(prop) { %><h2><%= prop.type.replace("_"," ") %></h2><p><%= prop.value %></p><% }) %></div>')
  };

  /*
   * ADAMA - Araport Data API Mediator API
   * getStatus()
   * getNamespaces()
   * getServices()
   * search()
   *
   * Data APIs
   * {'namespace': 'aip', 'service': 'atted_coexpressed_by_locus_v0.1'}
   * {'namespace': 'aip', 'service': 'locus_gene_report_v0.1'}
   */
  var form = $('form[name=workshop-tutorial-query]', appContext);
  form.on('submit', function(e) {
    e.preventDefault();

    var Agave = window.Agave;

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

    Agave.api.adama.getStatus({}, function(resp) {
      if (resp.obj.status === 'success') {
        Agave.api.adama.search(
          {'namespace': 'aip', 'service': 'atted_coexpressed_by_locus_v0.1', 'queryParams': query},
          function(search) {
            $('.results', appContext).empty().html(templates.resultTable({
              result: search.obj.result,
              resultRow: templates.resultRow
            }));

            $('button[name=gene-report]', appContext).on('click', function(e) {
              e.preventDefault();
              var btn, locus;
              btn = $(this);
              locus = btn.attr('data-locus');

              Agave.api.adama.search(
                {'namespace': 'aip', 'service': 'locus_gene_report_v0.1', 'queryParams': {'locus': locus}},
                function(search) {
                  var el, td, tr;
                  el = $(templates.geneReport(search.obj.result[0]));
                  el.hide();

                  td = $('<td colspan="3">');
                  tr = $('<tr>');

                  tr.append(td.append(el));
                  tr.insertAfter(btn.parent().parent());

                  el.slideDown();
                  $('button.close', el).on('click', function() {
                    el.slideUp().promise().done(function() { tr.remove(); });
                  });
                }
              );
            });
          });
      } else {
        // ADAMA is not available, show a message
        $('.messages', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
      }
    });

  });

})(window, jQuery, _);
