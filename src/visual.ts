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
            let api_url = "https://api.nfz.gov.pl/app-itl-api/queues?page=1&limit=25&format=json&api-version=1.3";
            let benefit = _.get<string>(options, 'dataViews.0.categorical.values.0.values.0');
            let province = _.get<string>(options, 'dataViews.0.categorical.values.1.values.0');
            let provider = _.get<string>(options, 'dataViews.0.categorical.values.2.values.0');
            let locality = _.get<string>(options, 'dataViews.0.categorical.values.3.values.0');
            if (benefit) {
                api_url = api_url + "&benefit=" + benefit;
            };
            if (province) {
                api_url = api_url + "&province=" + province;
            };
            if (provider) {
                api_url = api_url + "&provider=" + provider;
            };
            if (locality) {
                api_url = api_url + "&locality=" + locality;
            };
            //let queuesAPI = _.get<string>(options, 'dataViews.0.single.value');

            
            function render_results(i, data) {
                $("#queues").empty();
                let data_part = data.data.slice((i - 1) * 5, 5 * i)
                for (let ii = 0; ii < data_part.length; ii++) {
                    let result = data_part[ii]
                    $("<div>").attr('id', ii).addClass("item").appendTo("#queues");
                    $("<h2>").html(" <small data-toggle='tooltip' data-placement='right' title='Dostępny termin'>" + result.attributes.dates.date + "</small></br>" + result.attributes.provider.toLowerCase()).appendTo($("#" + ii + ".item"));
                    $("<h4>").html("<strong>" + result.attributes.benefit.toLowerCase() + "</strong>").appendTo($("#" + ii + ".item"));
                    $(" <hr>").appendTo($("#" + ii + ".item"));
                    $("<div>").addClass("address").css("display", "none").appendTo($("#" + ii + ".item"));
                    $("<address>").html(result.attributes.provider.toLowerCase()
                        + "</br>" + result.attributes.place.toLowerCase()
                        + "</br>" + result.attributes.locality.toLowerCase()
                        + "</br>" + result.attributes.address.toLowerCase()
                        + "</br>" + "<span class='glyphicon glyphicon-earphone' aria-hidden='true'></span> "
                        + result.attributes.phone
                    ).appendTo($("#" + ii + ".item > .address"));

                    $("#" + ii + ".item").click(
                        function () {
                            if ($("#" + ii + ".item > .address > iframe").length == 0) {
                                $("#" + ii + ".item > .address").append('<iframe width="95%" height="200" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBOfPQXsMnvYrjdANQkUIXxiRZ6MQPbcQs&zoom=13&q=' + result.attributes.latitude + ',' + result.attributes.longitude + '" allowfullscreen></iframe>');
                            };
                            $("#" + ii + ".item > .address").slideToggle("slow");
                        }
                    )
                };
                $("#queues").append('<div style="height:60px"></div>')
                $("<footer>").css("background-image", "linear-gradient(#cccccceb 1%, 10%, #ffffffeb 90%)").addClass("footer navbar-fixed-bottom").appendTo("#queues");
                $("footer").append("<nav aria-label='...'>  <ul class='pager'>    <li class='disabled' id ='prev'><a href='#'>Previous</a></li>    <li id='next'><a href='#'>Next</a></li>  </ul></nav>")
                if (i > 1) {
                    $("#prev").click(function () {
                        i = i - 1;
                        render_results(i, data);
                    })
                    $("#prev").removeClass('disabled')
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
            if (benefit || province) {
                $("<h4>").text("Ładowanie...").appendTo("#queues");
                $.getJSON(api_url)
                    .done(function (data_) {
                        data = data_
                        $("#queues").empty()
                        if ($("#queues").html() == "") {
                            render_results(i, data)
                        }
                    });
            }
            else {
                $("<div id='welcome-msg' class='my-auto text-center'>").appendTo("#queues");
                $("<img src='https://cloudsonmars.com/wp-content/uploads/2019/09/Component@2x.png'>").appendTo("#welcome-msg");
                $("<p class='my-auto'>").text("Wyszukiwarka terminów leczenia w ramach NFZ").appendTo("#welcome-msg");
                $("<p class='my-auto small'>").text("Wybierz województwo lub typ świadczenia").appendTo("#welcome-msg");
                
            };



        }
    }
}