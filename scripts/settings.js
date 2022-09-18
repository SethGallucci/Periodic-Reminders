import { RemindersConfig } from "./reminders-config.js";
import { updateRemindersTriggers } from "./helpers.js";


export const PeriodicRemindersSettings = function () {

    game.settings.register("periodic-reminders", "reminders", {
		name: "Test Setting Object",
		hint: "An array of objects that each contains the necessary data of the reminder it represents.",
		scope: "client",
		config: false,
		default: [],
		type: Array,
		onChange: updateRemindersTriggers
	});

    game.settings.register("periodic-reminders", "intervalIds", {
		name: "Reminder Interval Ids",
		hint: "An array of ids of the Intervals set to trigger reminders.",
		scope: "client",
		config: false,
		default: [],
		type: Array
	});
	
	game.settings.registerMenu("periodic-reminders", "remindersConfig", {
	    name: "Timers Config",
	    label: "Confgure Reminders",
	    hint: "Config menu for setting reminders.",
	    icon: "fa-solid fa-bell",
	    type: RemindersConfig,
	    restricted: false
	});

}