import { PeriodicRemindersSettings } from "./settings.js";
import { turnRemindersHook, registerHandlebarsHelpers, updateRemindersTriggers } from "./helpers.js";


Hooks.on("init", () => {
	PeriodicRemindersSettings();
});


Hooks.on("ready", () => {
	registerHandlebarsHelpers();
});


Hooks.on("setup", async () => {
	await game.settings.set("periodic-reminders", "intervalIds", []);
	await updateRemindersTriggers();

	turnRemindersHook();
});