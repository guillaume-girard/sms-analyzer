/**
 * La classe MessageCollection héritant de Collection permettant de faire des
 * calculs sur des collection de message
 * @returns {MessageCollection} La collection de message
 */
function MessageCollection() {
    // Appel de la classe mère (héritage des propriétés et méthodes)
    Collection.call(this);

    this.nbEnvoyes = 0;
    this.nbRecus = 0;
    this.firstMessageMs = 0;
    this.lastMessageMs = 0;
    this.firstMessageStr;
    this.lastMessageStr;

    /**
     * Retourne le nombre total de messages (envoyés et reçus)
     * @returns {Number} Le nombre total de messages
     */
    this.getNbTotal = function () {
        return this.nbEnvoyes + this.nbRecus;
    };

    /**
     * Methode qui ajoute un message a la collection et fait les calculs utiles
     * @param {Message} pMess Le message à ajouter
     */
    this.addMessage = function (pMess) {
        pMess.getType() === "2" ? this.nbEnvoyes++ : this.nbRecus++;
        if (pMess.getDateMs() < this.firstMessageMs ||
                this.firstMessageMs === 0) {
            this.firstMessageMs = pMess.getDateMs();
            this.firstMessageStr = pMess.getDateStr();
        }
        if (pMess.getDateMs() > this.lastMessageMs) {
            this.lastMessageMs = pMess.getDateMs();
            this.lastMessageStr = pMess.getDateStr();
        }
        this.add(pMess);
    };

    /**
     * Methode qui calcule et affiche la fréquence des messages de la collection
     * @returns {String} La fréquence des message en human readable
     */
    this.getFrequence = function () {
        var lapsMs = (new Date()).getTime() - this.firstMessageMs;
        var lapsJour = lapsMs / 1000 / 60 / 60 / 24;
        var str = "";
        if (this.getNbTotal() / lapsJour >= 1) {
            str += Math.round(this.getNbTotal() / lapsJour) + " messages par jour";
        } else {
            str = "1 message tous les " + Math.round(lapsJour / this.getNbTotal()) + " jours";
        }
        return str;
    };

    /**
     * Methode qui renvoie un tableau des heures des messages
     * @returns {Array} Le tableau des heures des messages
     */
    this.parseHours = function () {
        return this.objects.map(function(e) {
            return e.getHour();
        });
    };

    /**
     * Parse la collection de message pour compter le nombre de message par jour
     * et renvoie un tableau d'objets sous la forme 
     * [{"date" : date1, "nbMess" : nb1},
     * {"date" : date2, "nbMess" : nb2}]
     * @return {Array} Le tableau des données
     */
    this.parseDays = function () {
        var tmpDayMs = 0;
        var tmpNextMs = 0;
        var array = [];
        var index = 0;

        function entry(pDateMs) {
            var d = new Date(pDateMs);
            tmpDayMs = (new Date(d.getFullYear(), d.getMonth(), d.getDate())).getTime();
            tmpNextMs = tmpDayMs + (1000 * 60 * 60 * 24);

            index = array.push({"date": tmpDayMs, "nbMess": 1}) - 1;
        }

        entry(this.firstMessageMs);
        // parcours de tous les messages
        for (var i = 1; i < this.size; i++) {
            var current = this.getObj(i).getDateMs();
            // incrémentation compteur si on est toujours dans le meme jour
            if (current < tmpNextMs) {
                array[index].nbMess++;
            } else {
                while (current > tmpNextMs + (1000 * 60 * 60 * 24)) {
                    index = array.push({"date": tmpNextMs, "nbMess": 0}) - 1;
                    tmpNextMs += (1000 * 60 * 60 * 24);
                }
                entry(current);
            }
        }
        return array;
    };

    /**
     * Filtre une collection pour en ressortir uniquement les messages d'une certaines heures
     * 
     * @param {String} hour L'heure selon laquelle filtrer les messages
     * @returns {MessageCollection} La MessageCollection filtrée
     */
    this.filter = function (hour) {
        var filterCollection = new MessageCollection();
        for (var i = 0; i < this.size; i++) {
            if (this.getObj(i).getHour() == hour) {
                filterCollection.addMessage(this.getObj(i));
            }
        }

        return filterCollection;
    };

    /**
     * Fonction qui dessine un graphique du nombre de message par jour de la collection
     */
    this.drawLine = function () {
        // récupération du tableau d'objet {date, nbMess};
        var tab = this.parseDays();

        // initialisation des dimension du svg
        var margin = {top: 20, right: 20, bottom: 40, left: 50},
        width = 600 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

        // initialisation des échelles
        var x = d3.time.scale()
                .range([0, width]);

        var y = d3.scale.linear()
                .range([height, 0]);

        // initialisation des axes du graph avec la mise à l'échelle
        var xAxis = d3.svg.axis()
                .scale(x)
                .ticks(20)
                .tickFormat(d3.time.format("%d/%m"))
                .orient("bottom");
        var yAxis = d3.svg.axis()
                .scale(y)
                .ticks(10)
                .orient("left");

        // fonction d'instanciation des points du graphique (mise à l'échelle)
        var line = d3.svg.line()
                .x(function (d) {
                    return x(d.date);
                })
                .y(function (d) {
                    return y(d.nbMess);
                })
                .interpolate("basis");

        // instanciation du svg dans le body en fonction des widths et height
        // définis plus haut. Instanciation de l'élément <g> pour transformer
        // les coordonnées des points en ne comptant par les marges
        var svg = d3.select("#innergraph").html("").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // formatage du tableau pour le parser correctement après
        tab.forEach(function (d) {
            d.date = new Date(+d.date);
            d.nbMess = +d.nbMess;
        });

        // instanciation des domaines pour la mise à l'échelle en fonction des données
        // du tableau de la collection
        x.domain(d3.extent(tab, function (d) {
            return d.date;
        }));
        y.domain(d3.extent(tab, function (d) {
            return d.nbMess;
        }));

        // instanciation des axes dans des éléments <g> pour l'affichage
        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Nombre de message");
        // dessin du path
        svg.append("path")
                .data(tab)
                .attr("d", line(tab))
                .attr("stroke", "blue")
                .attr("stroke-width", 1)
                .attr("fill", "none");
    };

    /**
     * Fonction qui dessine un graphique du nombre de message par heure
     */
    this.drawBar = function () {
        var margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = 600 - margin.left - margin.right,
                height = 300 - margin.top - margin.bottom;

        var x = d3.scale.linear()
                .domain([0, 24])
                .range([0, width]);

// Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
                .bins(x.ticks(24))
                (this.parseHours());

        var y = d3.scale.linear()
                .domain([0, d3.max(data, function (d) {
                        return d.y;
                    })])
                .range([height, 0]);

        var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(24);
        var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

        var svg = d3.select("#innergraph").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var bar = svg.selectAll(".bar")
                .data(data)
                .enter().append("g")
                .attr("class", "bar")
                .attr("transform", function (d) {
                    return "translate(" + x(d.x) + "," + y(d.y) + ")";
                });

        bar.append("rect")
                .attr("x", 1)
                .attr("width", x(data[0].dx) - 1)
                .attr("height", function (d) {
                    return height - y(d.y);
                });

        bar.append("text")
                .attr("dy", ".75em")
                .attr("y", 6)
                .attr("x", x(data[0].dx) / 2)
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.y;
                });

        var that = this;
        bar.on("click", function (d) {
            $("#innerhour").html(that.filter(d[0]).toHTML());
            $("#wrapperhour").show();
        });

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Nombre de message");
    };
    /**
     * Fonction qui affiche les messages les uns a la suite des autres
     * @param {Object} pInner Le inner jquery pour ajouter le html de chaque message
     */
    this.toHTML = function (pInner) {
        var str = "";
        for (var i = 0; i < this.size; i++) {
            if (typeof pInner != "undefined") {
                this.getObj(i).toHTML(pInner);
            } else {
                str += this.getObj(i).toHTML();
            }
        }
        if (typeof pInner != "undefined") {
            return;
        }
        return str;
    };

    /**
     * Renvoie la plus longue période sans message
     * @return {String} Le nombre d'heure sans message
     */
    this.longestVoid = function () {
        var prevDate = this.firstMessageMs;
        var dateOne = prevDate;
        var dateTwo = prevDate;
        var longest = 0;
        for (var i = 1; i < this.size; i++) {
            var newDate = this.getObj(i).getDateMs();
            var diff = newDate - prevDate;
            if (diff > longest) {
                longest = diff;
                dateOne = new Date(prevDate);
                dateTwo = new Date(newDate);
            }
            prevDate = newDate;
        }

        var d = Math.floor(longest / 1000 / 60 / 60 / 24);
        var h = Math.floor((longest - (d * 1000 * 60 * 60 * 24)) / 1000 / 60 / 60);
        var m = Math.floor((longest - (d * 1000 * 60 * 60 * 24 + h * 1000 * 60 * 60)) / 1000 / 60);
        var s = Math.round((longest - (d * 1000 * 60 * 60 * 24 + h * 1000 * 60 * 60 + m * 1000 * 60)) / 1000);

        var ret = "Plus longue période sans message : ";

        ret += d > 0 ? d + "j. " : "";
        ret += h + "h";
        ret += (m < 10 ? "0" + m : m) + "min";
        ret += s + "sec";

        ret += "(du " + dateOne.toLocaleDateString() + ", " + dateOne.toLocaleTimeString() +
                " au " + dateTwo.toLocaleDateString() + ", " + dateTwo.toLocaleTimeString() + ")";
        return ret;
    };

    this.longestMess = function () {
        var longestMess;
        var nbChar = 0;

        for (var i = 0; i < this.size; i++) {
            var mess = this.getObj(i);
            if (mess.getNbChar() > nbChar) {
                longestMess = mess;
                nbChar = mess.getNbChar();
            }
        }

        var ret = "Plus long message (" + nbChar + " caratères) : ";
        ret += longestMess.toHTML();

        return ret;
    };

    this.longestDisc = function () {
        var prevDate, dateOne, dateTwo, tmpDateOne, compteur = 1, longest = 1;
        prevDate = dateOne = dateTwo = tmpDateOne = this.firstMessageMs;

        for (var i = 1; i < this.size; i++) {
            var mess = this.getObj(i).getDateMs();
            if (mess - prevDate < (1000 * 60 * 30)) {
                compteur++;
                prevDate = mess;
            } else {
                if (compteur > longest) {
                    longest = compteur;
                    dateOne = tmpDateOne;
                    dateTwo = prevDate;
                }
                prevDate = tmpDateOne = mess;
                compteur = 1;
            }
        }

        return "Plus longue discussion : " + longest + " messages (du " + (new Date(dateOne)).toLocaleDateString() + ", " + (new Date(dateOne)).toLocaleTimeString() +
                " au " + (new Date(dateTwo)).toLocaleDateString() + ", " + (new Date(dateTwo)).toLocaleTimeString() + ")";
    };
}

// instanciation de la main collection
var collMessages = new MessageCollection();
// déclaration explicite de l'héritage 
// MessageCollection.prototype = Object.create(Collection.prototype);
