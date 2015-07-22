/**
 * Classe ContactCollection extend Collection qui gère la collection de contact
 */
function ContactCollection() {
    Collection.call(this);

    /**
     * Recherche un contact dans la collection en fonction de son nom.
     * Si le contact n'existe pas il en créé un nouveau avant de le retourner
     * @param {String} pName Le nom du contact recherché
     * @return {Contact} Le contact trouvé ou instancié
     */
    this.getContact = function (pName) {
        for (var i = 0; i < this.size; i++) {
            if (this.getObj(i).getName() === pName) {
                return this.getObj(i);
                break;
            }
        }
        var newContact = new Contact(pName);
        this.add(newContact);
        return newContact;
    };

    /**
     * Ajout d'un message à un contact
     * @param {String} pName Le nom du contact auquel appartient le message
     * @param {Message} pMess Le nouveau message
     */
    this.addMessage = function (pName, pMess) {
        this.getContact(pName).addMessage(pMess);
    };

    /**
     * Parse le tableau de contact et créé un tableau contact => nbMess sous la forme
     * {
     *  children :[
     *      {contactName: name1, value: val1}, 
     *      {contactName: name2, value: val2}
     *  ]
     * }
     * (nécessite "children:" pour le parsage automatique de la fonction d3js bubble.nodes())
     * @returns {Object} Un objet contenant le tableau des données
     */
    this.parseNbTotal = function () {
        var array = [];

        for (var index in this.objects) {
            array.push({"contactName": this.objects[index].getName(), "value": this.objects[index].getNbTotal()});
        }

        return {children: array};
    };

    /**
     * Affichage de bulles proportionnellement grandes en fonction du nombre
     * total de message par contact
     */
    this.drawCircle = function (collMessages) {
        /**
         * @var {Number} diameter Définit la taille du svg
         * @var {Object} color Plage de couleur d3.js ; permet de 
         * retourner des nuances d'une seule couleur en fonction du 
         * paramètre qui lui est passé (une couleur mère pour une même
         * valeur)
         */
        var diameter = 700,
                color = d3.scale.category20c();

        /**
         * @var {Object} bubble Object d3 qui gère l'affichage
         * sous forme de bulles proportionnelles d'une plage de données
         * 
         * sort : type de tri (par défaut ascendant)
         * size : taille d'affichage
         * padding : espace entre les bulles en pixel
         */
        var bubble = d3.layout.pack()
                .sort(null)
                .size([diameter, diameter])
                .padding(3);

        // définition du svg
        var svg = d3.select("#innerresult").append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");

        // définition des "noeuds" (un noeud = une bulle)
        var node = svg.selectAll(".node")
                .data(bubble.nodes(this.parseNbTotal())
                        .filter(function (d) {
                            return !d.children;
                        }))
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

        // affichage de "[contact] ([nbMessage])" au survol
        node.append("title")
                .text(function (d) {
                    return d.contactName + " (" + d.value + ")";
                });

        // affichage des bulles en fonction des data attachées par la fonction bubble.nodes() (r, x, y)
        node.append("circle")
                // taille du cercle
                .attr("r", function (d) {
                    return d.r;
                })
                // couleur d'intérieur
                .style("fill", function (d) {
                    return color(d.contactName);
                })
                // couleur de bordure
                .style("stroke", function (d) {
                    // récupération de la couleur format "#abcdef"
                    var c = color(d.contactName);
                    // récupération des valeurs r, g et b en base 10
                    var r = parseInt(c.substring(1, 3), 16);
                    var g = parseInt(c.substring(3, 5), 16);
                    var b = parseInt(c.substring(5), 16);
                    // fonction qui assombri les couleur de 20 points (limite à 0)
                    function chc(c) {
                        return c - 20 < 0 ? 0 : c - 20;
                    }
                    // nouvelle couleur avec l'assombrissement
                    return "rgb(" + chc(r) + "," + chc(g) + "," + chc(b) + ")";
                })
                .style("stroke-width", 2);

        // ajout du text intérieur (nom du contact, stroké en fonction de la taille du cercle)
        node.append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.contactName.substring(0, d.r / 3);
                });

        // append des events onmouseover et onmouseout pour modification 
        // de la couleur au survol cursor (inversement des value stroke et fill)
        node.on("mouseover", function () {
            var circ = d3.select(this).select("circle");
            c1 = circ.style("fill");
            c2 = circ.style("stroke");
            circ.style("fill", c2);
            circ.style("stroke", c1);
        })
                .on("mouseout", function (d) {
                    var circ = d3.select(this).select("circle");
                    c1 = circ.style("fill");
                    c2 = circ.style("stroke");
                    circ.style("fill", c2);
                    circ.style("stroke", c1);
                });
        // append du onclick pour afficher les infos d'un contact
        node.on("click", function (d) {
            var cont = collContacts.getContact(d.contactName);
            cont.drawLine();
            cont.drawBar();
            var divtxt = d3.select("#innertxt").html("");
            divtxt.append("p")
                    .text(cont.longestVoid());
            divtxt.append("p")
                    .text(cont.getFrequence());
            divtxt.append("div")
                    .html(cont.longestMess());
            divtxt.append("p")
                    .text(cont.longestDisc());
            divtxt.append("div")
                    .html(cont.messages.toHTML());

        });

        // ajout a la mano d'un cercle pour tous les messages
        var allMessages = svg.append("g")
                .attr("class", "node")
                .attr("transform", "translate(22, 22)");

        allMessages.append("circle")
                .attr("r", 20)
                .style("fill", "black")
                .style("stroke", "white")
                .style("stroke-width", 2);
        allMessages.append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .style("fill", "white")
                .text("Tous");

        allMessages.on("mouseover", function () {
            d3.select(this).select("circle")
                    .style("fill", "white")
                    .style("stroke", "black");
            d3.select(this).select("text")
                    .style("fill", "black");

        })
                .on("mouseout", function () {
                    d3.select(this).select("circle")
                            .style("fill", "black")
                            .style("stroke", "white");
                    d3.select(this).select("text")
                            .style("fill", "white");
                });
        // append du onclick pour afficher les infos d'un contact
        allMessages.on("click", function () {
            collMessages.drawLine();
            collMessages.drawBar();
            var divtxt = d3.select("#innertxt").html("");
            divtxt.append("p")
                    .text(collMessages.longestVoid());
            divtxt.append("p")
                    .text(collMessages.getFrequence());
            divtxt.append("div")
                    .html(collMessages.longestMess());
            divtxt.append("p")
                    .text(collMessages.longestDisc());
            divtxt.append("div")
                    .html(collMessages.toHTML());

        });
    };
}

// instanciation de la collection
var collContacts = new ContactCollection();