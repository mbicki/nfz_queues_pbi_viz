/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */


module powerbi.extensibility.visual {
    export class Visual implements IVisual {
        private updateCountContainer: JQuery;
        private categoryList: JQuery;
        private updateCount: number = 0;

        constructor(options: VisualConstructorOptions) {
            options.element.style.overflow = 'auto';
            this.updateCountContainer = $('<div id="queues">');
            this.categoryList = $('<ul>');
            let categoryListContainer = $('<div>').append('<h3>Categories</h3>').append(this.categoryList);

            $(options.element)
                .append(this.updateCountContainer);
        }

        public update(options: VisualUpdateOptions) {
            //Display update count
            //this.updateCountContainer.html(`<p>Update count: <em>${(this.updateCount++)}</em></p>`)
            let api_url = _.get<string>(options, 'dataViews.0.single.value'); //|| [];
            let queuesAPI = _.get<string>(options, 'dataViews.0.single.value');
            //"https://api.nfz.gov.pl/app-itl-api/queues?page=1&limit=5&format=json&case=1&province=07&benefit=okul&benefitForChildren=false&api-version=1.3";

            //this.updateCountContainer.html("")
            //this.updateCountContainer.html('<h1></h1>')

            function render_results(i, data) {
                $("#queues").empty();
                let data_part = data.data.slice((i - 1) * 5, 5 * i)
                for (let ii = 0; ii < data_part.length; ii++) {
                    let result = data_part[ii]
                    $("<div>").attr('id', ii).addClass("item").appendTo("#queues");
                    $("<h2>").html(" <small data-toggle='tooltip' data-placement='right' title='Dostępny termin'>" + result.attributes.dates.date + "</small></br>" + result.attributes.provider.toLowerCase()).appendTo($("#" + ii + ".item"));
                    $("<h4>").html("<strong>" + result.attributes.benefit.toLowerCase() + "</strong>").appendTo($("#" + ii + ".item"));
                    $(" <hr>").appendTo($("#" + ii + ".item"));
                    $("<address>").css("display", "none").html(result.attributes.provider.toLowerCase()
                        + "</br>" + result.attributes.place.toLowerCase()
                        + "</br>" + result.attributes.locality.toLowerCase()
                        + "</br>" + result.attributes.address.toLowerCase()
                        + "</br>" + "<span class='glyphicon glyphicon-earphone' aria-hidden='true'></span> "
                        + result.attributes.phone +"<hr>"
                    ).appendTo($("#" + ii + ".item"));
                    $("#" + ii + ".item").click(
                        function () {
                            $("#" + ii + ".item address").slideToggle("slow");
                        }
                    )
                };

                $("<footer>").css("background-image", "linear-gradient(#cccccceb 1%, 10%, #ffffffeb 90%)").addClass("footer navbar-fixed-bottom").appendTo( "#queues");
                $("footer").append("<nav aria-label='...'>  <ul class='pager'>    <li class='disabled' id ='prev'><a href='#'>Previous</a></li>    <li id='next'><a href='#'>Next</a></li>  </ul></nav>")
                if (i > 1) {
                    $("#prev").click(function () {
                        i = i - 1;
                        render_results(i, data);
                    })
                }
                else {
                    $("#prev").addClass('disabled');
                };

                if (i < 4 && i * 5 < data.meta.count) {

                    $("#next").mousedown(function () {
                        i = i + 1;
                        render_results(i, data);
                    })
                }
                else {
                    $("#next").addClass('disabled')
                };


            };
            let i = 1;
            let data;
            $("#queues").empty();
            $("<h4>").text("Loading...").appendTo("#queues");
            $.getJSON(queuesAPI)
                .done(function (data_) {
                    data = data_
                    $("#queues").empty()
                    if ($("#queues").html() == "") {




                        render_results(i, data)
                        // $( "<h3>" ).html( " <small>"+data.data[0].attributes.dates.date+"</small></br>" +data.data[0].attributes.provider.toLowerCase()).appendTo( "#queues" );
                        // $( "<h4>" ).html("<strong>"+ data.data[0].attributes.benefit.toLowerCase() + "</strong>").appendTo( "#queues" );
                        // $(" <hr>").appendTo( "#queues" );
                        // $( "<address>" ).html(
                        //      "<strong>Dane adresowe:</strong>"
                        //     + "</br>" +data.data[0].attributes.provider.toLowerCase()
                        //     + "</br>" + data.data[0].attributes.place.toLowerCase()
                        //     + "</br>" + data.data[0].attributes.locality.toLowerCase() 
                        //     + "</br>" + data.data[0].attributes.address.toLowerCase()
                        //     + "</br>" + "<span class='glyphicon glyphicon-earphone' aria-hidden='true'></span> "
                        //     + data.data[0].attributes.phone
                        //     ).appendTo( "#queues" );
                        // $( "#queues" ).append("<nav aria-label='...'>  <ul class='pager'>    <li><a href='#'>Previous</a></li>    <li><a href='#'>Next</a></li>  </ul></nav>")
                    }
                });
            //console.log(test)

        }
    }
}