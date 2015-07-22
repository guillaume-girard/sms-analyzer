function Contact(pName) {
    this.name = pName;
    this.messages = new MessageCollection();

    this.getNbTotal = function () {
        return this.messages.getNbTotal();
    };

    this.addMessage = function (pMess) {
        pMess.setContact(this);
        this.messages.addMessage(pMess);
    };

    this.getName = function () {
        return this.name;
    };

    this.getFrequence = function () {
        return this.messages.getFrequence();
    };

    this.toHTML = function () {
        return "<div>" +
                this.name +
                " (" + this.getNbTotal() + "), " +
                this.getFrequence() +
                "</div>";
    };

    this.toTitle = function () {
        return this.name + " (" + this.getNbTotal() + ")";
    };

    this.parseHours = function () {
        return this.messages.parseHours();
    };
    
    this.parseDays = function () {
        return this.messages.parseDays();
    };
    
    this.drawLine = function () {
        this.messages.drawLine();
    };
    
    this.drawBar = function () {
        this.messages.drawBar();
    };
    
    this.longestVoid = function () {
        return this.messages.longestVoid();
    };
    
    this.longestMess = function () {
        return this.messages.longestMess();
    };
    
    this.longestDisc = function () {
        return this.messages.longestDisc();
    };
}
