import { PeriodicRemindersSettings } from "./settings.js";
import { updateReminderIntervals } from "./helpers.js";


Hooks.on("init", () => {
	PeriodicRemindersSettings();
});


Hooks.on("setup", async () => {
	await updateReminderIntervals();
});