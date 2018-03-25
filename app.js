const _ = require("lodash");

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
	const reply = onMessage(d.toString().trim());
	
	if (reply) {
		console.log();
		if (_.isArray(reply)) {
			console.log(reply.join("\n"));
		}
		else {
			console.log(reply);
		}
	}
	
	console.log("-------");
});

class Regel {
	constructor() {
		
	}
	
	applyModification(num) { return num };
}

class NummerRegel extends Regel {
	constructor(rule, type, num) {
		super();
		
		this.rule = rule;
		this.type = type;
		this.number = num;
	}
	
	applyModification(num) {
		switch (this.type) {
			case "mult":
				return num * this.number;
			case "add":
				return num + this.number;
		}	
	}
	
	toString() {
		return this.rule.name + " " + this.type + " : " + this.number;
	}
}

class TextRegel extends Regel {
	constructor(text) {
		super();
		
		this.text = text;
	}
	
	toString() {
		return this.text;
	}
}

class Spelare {
	constructor(name) {
		this.name = name;
	}
	
	toString() {
		return this.name;
	}
}

class SpelRegel {
	constructor(name) {
		this.name = name;
		this.rules = [];
	}
	
	applyModifications(num) {
		_.each(this.rules, mod => {
			num = mod.applyModification(num);
		});
		
		return num;
	}
}

const spelRegler = {
	allmän: new SpelRegel("Allmän skål"),
	dubbel: new SpelRegel("Dubbel tärning"),
	dödsman: new SpelRegel("Dödsman"),
	dubbeldödsman: new SpelRegel("Dubbel Dödsman"),
	näsa: new SpelRegel("Näsregeln"),
	
};

const regler = [];
const spelare = [];
let spelStartat = true;

spelare.push(new Spelare("phax"));
spelare.push(new Spelare("najs"));

const MSG_REDAN_STARTAT = "Måste kröka doods!";

function onMessage(text) {
	const args = text.split(" ");
	
	const command = args[0];
	switch (command) {
		case "!regel":
			if (!spelStartat) return MSG_REDAN_STARTAT;
			
			const type = args[1].toLowerCase();
			let regel;
			
			if (type == "regel") {
				const copy = args;
				copy.shift();
				copy.shift();
				
				const text = copy.join(" ");
				
				regel = new TextRegel(text);
			}
			else {
				const spelRegel = spelRegler[type];
				const vad = args[2].toLowerCase();
				
				if (vad == "klunk") {
					const change = args[3];
					let mod = "add";
					if (_.first(change) == "*")
						mod = "mult";
					const num = parseInt(change.substr(1));
			
					regel = new NummerRegel(spelRegel, mod, num);
					spelRegel.rules.push(regel);
				}
			}
			
			if (regel != null) {
				regler.push(regel);
				console.log("added rule");
				console.log(regler);
			}
			
			break;
		
		case "!regler":
			var text = _.map(regler, elem => "* " + elem.toString()).join("\n");
			
			return "REGLER:\n---------\n" + text;
			
		case "!start":
		case "!starta":
			if (spelStartat)
				return "wtf du krökar redan ju??";
		
			spelStartat = true;
			return "let de dödskrök began";
			
		case "!avsluta":
			if (!spelStartat) return MSG_REDAN_STARTAT;
			
			spelStartat = false;
			return "noobs, är ni redan utsupna?";
			
		case "!+":
			if (!spelStartat) return MSG_REDAN_STARTAT;
			
			const copy = args;
			copy.shift();
			
			const name = copy.join(" ");
			
			let s = new Spelare(name);
			
			spelare.push(s);
			
			return "Lade till spelare " + s.toString();
		
		case "!spelare":
			var text = _.map(spelare, elem => "* " + elem.toString()).join("\n");
			
			return "SPELARE:\n---------\n" + text;
			
		case "!roll":
		case "!slå":
			let d1 = Math.floor(Math.random() * 6);
			let d2 = Math.floor(Math.random() * 6);
			
			d1 = 4;
			d2 = 4;
			
			const outcomes = [];
			
			if (d1 + d2 == 5) { // Näsa
				outcomes.push("Touch yo nose! Sista som tar sig i röven dricker " +
					(spelRegler.näsa.applyModifications(1)));
			}
			if (d1 + d2 == 10) { // Allmän skål
				outcomes.push("Allmän skål! Alla dricker " +
					(spelRegler.allmän.applyModifications(1)));
			}
			if (d1 == 1 && d2 == 1) { // Gentleman
			}
			
			if (d1 == 6 && d2 == 6) { // Regel
			}
			else if (d1 == 3 && d2 == 3) { // Dubbel dödsman
				outcomes.push("Dubbel Dödsman! Alla dricker " +
					(spelRegler.dödsman.applyModifications(3)));
			}
			else if (d1 == 3 || d2 == 3) { // Dödsman
				outcomes.push("Dödsman! Alla dricker " +
					(spelRegler.dödsman.applyModifications(1)));
			}
			else if (d1 == d2) { // Dela ut
				const num = spelRegler.dubbel.applyModifications(d1)
				outcomes.push("Dela ut " + num + "+" + num + " eller " + num * 2);
			}
			
			return outcomes;
	}
	
	return;
}


