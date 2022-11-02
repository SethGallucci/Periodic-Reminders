import { RemindersConfig } from "./reminders-config.js";
import { timerReminders } from "./hooks.js"


export function periodicRemindersSettings() {

	game.settings.register("periodic-reminders", "reminders", {
		name: "Reminders",
		hint: "An array of objects which each contains the data of a reminder.",
		scope: "client",
		config: false,
		default: [],
		type: Array,
		onChange: timerReminders
	});

	game.settings.registerMenu("periodic-reminders", "remindersConfig", {
		name: "Timers Config",
		label: "Confgure Reminders",
		hint: "Menu for configuring reminders.",
		icon: "fa-solid fa-bell",
		type: RemindersConfig,
		restricted: false
	});

}