function clamp(value, min, max){
	return Math.max(min, Math.min(value, max));
}


function modEquivalent(a, b, m){
	return a-m*Math.floor(a/m) === b-m*Math.floor(b/m);
}


export function registerHandlebarsHelpers(){
	Handlebars.registerHelper({
		"periodicReminders_reminderParametersColumn":
			function(reminder){ return `
				<input type="number" name="timing"${reminder.type === "timer" ? " min=1" : ""} value=${reminder.timing}>
				<select name="reminder-type">
					<option${reminder.type === "timer" ? " selected": ""} value="timer">Timer</option>
					<option${reminder.type === "turn" ? " selected": ""} value="turn">Turn</option>
				</select>
			`;}
	})
}

export function turnRemindersHook(){
	Hooks.on("updateCombat", (combat, update, options, updaterUserId) => {

		// if
		// the combat hasn't yet been started
		// the update is the result of adding a new combatant
		// the update is the result of marking defeated the combatant of the current turn
		if( !combat.started || update.hasOwnProperty("initiative") || (update?.defeated && update?._id === combat.combatant.id) ){
			return;
		}

		let activeTurnReminders = game.settings.get("periodic-reminders", "reminders").filter(r => r.type === "turn" && r.isActive);

		if( activeTurnReminders.length === 0 ){
			return;
		}

		let undefeatedTurns = combat.turns.filter(c => !c.data.defeated);

		if( !undefeatedTurns.map(c => c.actor).includes(game.user.character) ){
			return;
		}

		let currentUndefeatedTurn = undefeatedTurns.indexOf(combat.combatant);
		let userCharacterTurn = undefeatedTurns.map(c => c.actor).indexOf(game.user.character);
		let relativeTiming = currentUndefeatedTurn - userCharacterTurn;

		let UTL = undefeatedTurns.length;

		let texts = activeTurnReminders
			.filter(r => modEquivalent(clamp(r.timing, -UTL+1, UTL-1), relativeTiming, UTL))
			.map(r => r.text);
		
		if( texts.length === 0 ){
			return;
		}

		(new Dialog({
			title: "Periodic Reminders",
			buttons:{},
			content: texts.join("<hr>")
		})).render(true);

	});
}

export async function updateRemindersTriggers(){

	for(let intervalId of game.settings.get("periodic-reminders", "intervalIds")){
		clearInterval(intervalId);
	}

	let intervals = {};

	let activeTimerReminders = game.settings.get("periodic-reminders", "reminders")
		.filter(r => r.isActive && r.type === "timer");

	for(let reminder of activeTimerReminders){

		if( intervals.hasOwnProperty(reminder.timing) ){
			intervals[reminder.timing].push(reminder.text);
		}
		else{
			intervals[reminder.timing] = [reminder.text];
		}
	}

	let intervalIds = [];

	for(let [timing, texts] of Object.entries(intervals)){
		intervalIds.push(setInterval(
			() => {
				(new Dialog({
					title: "Periodic Reminders",
					buttons:{},
					content: texts.join("<hr>")
				})).render(true);
			},
			timing * 1000
		));
	}

	await game.settings.set("periodic-reminders", "intervalIds", intervalIds);
}