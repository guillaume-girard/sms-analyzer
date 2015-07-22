function Message(pText, pType, pDateMs, pDateStr) {
    this.text = pText;
    this.type = pType;
    this.dateMs = parseInt(pDateMs);
    this.dateStr = pDateStr;
    this.contact;

    this.getText = function () {
        return this.text;
    };

    this.getType = function () {
        return this.type;
    };

    this.getDateMs = function () {
        return this.dateMs;
    };

    this.getDateStr = function () {
        return this.dateStr;
    };

    this.getNbChar = function () {
        return this.text.length;
    };

    this.getHour = function () {
        var hour = this.dateStr.split(" ")[3];
        return parseInt(hour.split(":")[0]);
    };
    
    this.setContact = function (pContact) {
        this.contact = pContact;
    };
    
    this.toHTML = function (pInner) {
        var str = "<div class='message " + (this.type === "2" ? "env" : "rec") + "'>";
        str += "<p class='contact'>" + (this.type === "2" ? "A " : "De ") + this.contact.getName() + "<p>";
        str += "<p class='body'>" + this.text + "<p>";
        str += "<p class='date'>" + this.dateStr + "<p>";
        str += "</div>";
        
        if(typeof pInner != "undefined") {
            pInner.append(str);
            return;
        } else {
            return str;
        }
    };
}
