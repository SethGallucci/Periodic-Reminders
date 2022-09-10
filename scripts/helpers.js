export async function updateReminderIntervals(){

	for(let intervalId of game.settings.get("periodic-reminders", "intervalIds")){
		clearInterval(intervalId);
	}

	let intervals = {};

	for(let reminder of game.settings.get("periodic-reminders", "reminders")){
		
		if( !reminder.isActive ){
			continue;
		}

		if( intervals.hasOwnProperty(reminder.period) ){
			intervals[reminder.period].push(reminder.text);
		}
		else{
			intervals[reminder.period] = [reminder.text];
		}
	}

	let intervalIds = [];

	for(let [period, texts] of Object.entries(intervals)){
		intervalIds.push(setInterval(
			() => {
				(new Dialog({
					title: "Periodic Reminders",
					buttons:{},
					content: texts.join("<hr>")
				})).render(true);
			},
			period * 1000
		));
	}

	await game.settings.set("periodic-reminders", "intervalIds", intervalIds);
}