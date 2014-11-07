/*global _*/
/*jshint camelcase: false*/
/*global cytoscape*/
(function(window, $, _,cytoscape, undefined) {
  'use strict';

  console.log('Hello, workshop tutorial!');

  var appContext = $('[data-app-name="workshop-tutorial"]');

  var templates = {
    resultTable: _.template('<table class="table"><thead><th>Related Locus</th><th>Direction</th><th>Score</th></thead><tbody><% _.each(result, function(r) { %><%= resultRow(r) %><% }); %></tbody></table>'),
    resultRow: _.template('<% for (var i = 0; i < relationships.length; i++) { %><tr><% if (i === 0) { %><td rowspan="<%= relationships.length %>"><%= related_entity %> <button type="button" class="btn btn-info" name="gene-report" data-locus="<%= related_entity %>"><i class="fa fa-book"></i><span class="sr-only">Get Gene Report</button></td><% } %><td><%= relationships[i].direction %></td><td><% _.each(relationships[i].scores, function(score){ %><%= _.values(score)[0] %><% }); %></td></tr><% } %>'),
    geneReport: _.template('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4>Gene Report: <%= locus %></h4></div><div class="modal-body"><% _.each(properties, function(prop) { %><h3><%= prop.type.replace("_"," ") %></h3><p><%= prop.value %></p><% }) %></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>')
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
                  $(templates.geneReport(search.obj.result[0])).appendTo('body').modal();
                }
              );
            });

            $('.results table', appContext).dataTable({
              'order': [[ 2, 'desc' ]]
            });
          });
      } else {
        // ADAMA is not available, show a message
        $('.messages', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
      }
    });

  });

    /**
     * @param1 Network 1
     * {
     *  name : string
     *  source : string
     *  edges : {
     *      color : string[hex-code]
     *      edge : [
     *              {
     *                   target : "agi"
     *                  source : "agi"
     *                  weight : int
     *              },
     *              {...}
     *          ]
     *      }
     * }
     * @param2 Network 2
     * ...
     * @paramN network N
     */


    var addNodes = function(cyto, network){
        var color = network.edges.color;
        var maxEdge = 0;
        $.each(network.edges.edge,function(index,obj) {

            if(obj.weight > maxEdge){
                maxEdge = obj.weight;
            }

            var $source;
            if ((cyto.nodes('#' + obj.source)).length > 0) {
                $source = cyto.nodes('#' + obj.source);
            } else {
                $source = cyto.add({
                    group: 'nodes',
                    name : 'bob',
                    data: {id: obj.source},
                    position : {
                        x : 100,
                        y : 100
                    },
                    css : {
                        'height': '10px',
                        'width':'10px',
                        'background-color' : 'black'
                    }
                });//.css({'height': '10px','width':'10px','background-color' : 'black'});
            }

            var $target;
            if ((cyto.nodes('#' + obj.target)).length > 0) {
                $target = cyto.nodes('#' + obj.target);
            } else {
                $target = cyto.add({
                    group: 'nodes',
                    name: 'bob',
                    data: {id: obj.target},
                    position : {
                        x : 100,
                        y : 100
                    },
                    css : {
                        'height': '10px',
                        'width':'10px',
                        'background-color' : 'black'
                    }
                });//.css();
            }
        });

        $.each(network.edges.edge,function(index,obj){
            var edgeWeight = (obj.weight / maxEdge) * 10;
            if( edgeWeight < 1 ){
                edgeWeight = 1;
            }
            cyto.add({
                group: 'edges',
                data: {
                    id: network.name+'-'+obj.source+'-'+obj.target,
                    source: obj.source,
                    target: obj.target,
                    weight: obj.weight
                },
                'curve-style': 'bezier'
            }).css({'line-color' : color, 'width' : edgeWeight});

        });
    };

    var init = function(){
        var numNetworks = arguments.length;
        var args = arguments;
        var cyto = cytoscape({

            container: document.getElementById('cytoscape_div'),

            layout: {
                name: 'grid',
                padding: 10
            },
            style: cytoscape.stylesheet(),
            ready: function(){




                for (var i = 0 ; i < numNetworks; i++){
                    addNodes(cyto,args[i]);
                }

                cyto.layout({
                    name:'circle',
                    minNodeSpacing: 10,
                    avoidOverlap:true,
                    height: 1000,
                    width: 1000,
                    startAngle : 3/2 * Math.PI
                });

                cyto.zoom(1,{x:0,y:0});
                cyto.fit(cyto.nodes(),100);
                cyto.nodes().css({'width':'20px','height':'20px'});
                console.log('Finished & Resized');
            }

        });

    };




    init({
        name : 'networktest',
        source : 'data sorce',
        edges : {
            color : '#0000FF',
            edge : [
                {
                    target : 'node2',
                    source : 'node1',
                    weight : 10000
                },
                {
                    target : 'node3',
                    source : 'node1',
                    weight : 25000
                },
                {
                    target : 'node4',
                    source : 'node1',
                    weight : 99000
                },
                {
                    target : 'node6',
                    source : 'node1',
                    weight : 20
                }
            ]
        }
    },{
        name : 'networktest2',
        source : 'data sorce',
        edges : {
            color : '#000000',
            edge : [
                {
                    target : 'node2',
                    source : 'node1',
                    weight : 1
                },
                {
                    target : 'node3',
                    source : 'node1',
                    weight : 2
                },
                {
                    target : 'node4',
                    source : 'node1',
                    weight : 10
                },
                {
                    target : 'node6',
                    source : 'node1',
                    weight : 20
                }
            ]
        }
    });


})(window, jQuery, _,cytoscape);