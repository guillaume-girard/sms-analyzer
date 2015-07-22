/**
 * Classe technique "Collection" qui permet de gérer une collection d'objet
 * générique. 
 * @returns {Collection} L'objet Collection ainsi créé
 */
function Collection() {
    /**
     * Le tableau d'objet géré par la collection
     */
    this.objects = [];
    /**
     * La taille de la collection
     */
    this.size = 0;
    /**
     * Ajoute un objet à la fin de la collection
     * @param {Object} pObject L'objet à ajouter
     */
    this.add = function (pObject) {
        // ajout de l'objet et mise à jour de la taille de la collection
        this.size = this.objects.push(pObject);
    };
    /**
     * Vérifie que l'objet passé en paramètre est présent dans le tableau
     * @param {Object} pObject L'objet à vérifier
     * @returns {Boolean} Renvoie true si l'objet existe dans le tableau
     */
    this.exist = function (pObject) {
        return (this.objects.indexOf(pObject) >= 0);
    };
    
    this.getObj = function (pIndex) {
        return this.objects[pIndex];
    };
    
    this.getIndex = function (pObj) {
        return this.objects.indexOf(pObj);
    };
    
    /**
     * Supprime l'objet, ou l'objet à l'index, passé en paramètre
     * @param {Object|Number} pIndexOrObj L'objet ou l'index de l'objet à supprimer
     */
    this.remove = function (pIndexOrObj) {
        // Si ce n'est pas un nombre, on récupère l'index de l'objet
        if (typeof pIndexOrObj !== Number) {
            pIndexOrObj = this.get(pIndexOrObj);
        }
        // suppresion de l'objet dans la collection
        this.objects.splice(pIndexOrObj, 1);
        // mise à jour de la taille de la collection
        this.size = this.objects.length;
    };
    /**
     * Methode de tri de la collection en fonction d'une des 
     * propriétés des objets gérés par la collection
     * @param {String} pProp le nom de la propriété sur laquelle se base le tri
     * @param {Boolean} pDesc (Optionnal) true si on veut trier en mode decroissant
     */
    this.sort = function (pProp, pDesc) {
        // Si on a définit pDesc alors on va trier en mode decroissant (pDesc à true)
        pDesc = typeof pDesc !== "undefined";
        // si on demande un tri par rapport au return d'une fonction
        var isFunc = /\(\)$/.test(pProp);
        pProp = isFunc ? pProp.slice(0, -2) : pProp;
        // Instanciation de la nouvelle collection (qui sera triée)
        var newColl = [];
        // tant qu'il reste des objets dans l'ancienne collection
        while (this.objects.length > 0) {
            // Stockage des infos du premier objet qui servira de référence pour les calculs
            var ref = isFunc ? this.objects[0][pProp]() : this.objects[0][pProp];
            var tempObj = this.objects[0];
            var index = 0;
            // pour chaque objet de la collection, ormis le premier
            for (var i = 1; i < this.objects.length; i++) {
                // Si la propriété de l'objet testé est inférieur/supérieur (en fonction
                // de pDesc) à la propriété de référence alors l'objet en question
                // sera notre nouvel objet de référence
                if (pDesc ?
                        (isFunc ? this.objects[i][pProp]() : this.objects[i][pProp]) > ref :
                        (isFunc ? this.objects[i][pProp]() : this.objects[i][pProp]) < ref) {
                    tempObj = this.objects[i];
                    ref = isFunc ? this.objects[i][pProp]() : this.objects[i][pProp];
                    index = i;
                }
            }
            // Ajout du nouvel objet référence dans la nouvelle collection
            newColl.push(tempObj);
            // Suppression de l'objet référence dans l'ancienne collection
            this.objects.splice(index, 1);
        }

        // Stockage de la nouvelle collection triée
        this.objects = newColl;
    };
}