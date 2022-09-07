import { TimersConfig } from "./timers-config.js";
import { updateReminderIntervals } from "./helpers.js";


export const PeriodicRemindersSettings = function () {

    game.settings.register("periodic-reminders", "reminders", {
		name: "Test Setting Object",
		hint: "An array of objects each containing the reminder's text and period of how many seconds it takes for the user to be reminded of the specific reminder.",
		scope: "client",
		config: false,
		default: [],
		type: Array,
		onChange: updateReminderIntervals
	});

    game.settings.register("periodic-reminders", "intervalIds", {
		name: "Reminder Interval Ids",
		hint: "An array of ids of the Intervals set to trigger reminders.",
		scope: "client",
		config: false,
		default: [],
		type: Array
	});
	
	game.settings.registerMenu("periodic-reminders", "timersConfig", {
	    name: "Timers Config",
	    label: "Confgure Reminders",
	    hint: "Config menu for setting reminders.",
	    icon: "fa-solid fa-bell",
	    type: TimersConfig,
	    restricted: false
	});

}