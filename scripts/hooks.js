import { periodicRemindersSettings } from "./settings.js";
import { registerHandlebarsHelpers } from "./helpers.js";
import { clamp, modEquivalent, renderAppLink } from "./utils.js";


export function activateHooks() {

    Hooks.on("init", () => {
        periodicRemindersSettings();
    });

    Hooks.on("ready", () => {
        registerHandlebarsHelpers();
        timerReminders();
        loginReminders();
    });

    Hooks.on("updateCombat", (combat, update, options, updaterUserId) => {
        turnReminders(combat, update, options);
        roundReminders(combat, update, options);
    });

}


function loginReminders() {
    game.settings.get("periodic-reminders", "reminders")
        .filter(reminder => reminder.__type === "LoginReminder" && reminder.isActive)
        .forEach(reminder => reminder.appLinks
            .forEach(appLink => renderAppLink(appLink))
        );
}

function turnReminders(combat, update, options) {

    if (earlyExitUpdateCombat(combat, update, options)) {
        return;
    }

    let activeTurnReminders = game.settings.get("periodic-reminders", "reminders")
        .filter(reminder => reminder.__type === "TurnReminder" && reminder.isActive);

    if (activeTurnReminders.length === 0) {
        return;
    }

    let undefeatedTurns = combat.turns.filter(combatant => !combatant.data.defeated);

    if (!undefeatedTurns.map(combatant => combatant.actor).includes(game.user.character)) {
        return;
    }

    let userCharacterTurn = undefeatedTurns.map(c => c.actor).indexOf(game.user.character);

    if (userCharacterTurn === -1) {
        return;
    }

    if (startOfCombat(combat)) {
        activeTurnReminders
            .filter(reminder => reminder.timing.onCombatStart)
            .forEach(reminder => reminder.appLinks
                .forEach(appLink => renderAppLink(appLink))
            );
    }

    let currentUndefeatedTurn = undefeatedTurns.indexOf(combat.combatant);
    let relativeTiming = currentUndefeatedTurn - userCharacterTurn;

    let UTL = undefeatedTurns.length;

    activeTurnReminders
        .filter(reminder => modEquivalent(clamp(reminder.timing.turns, -UTL + 1, UTL - 1), relativeTiming, UTL))
        .forEach(reminder => reminder.appLinks
            .forEach(appLink => renderAppLink(appLink))
        );

}

function roundReminders(combat, update, options) {

    if (earlyExitUpdateCombat(combat, update, options)) {
        return;
    }

    let activeTurnReminders = game.settings.get("periodic-reminders", "reminders")
        .filter(reminder => reminder.__type === "RoundReminder" && reminder.isActive);

    if (activeTurnReminders.length === 0) {
        return;
    }

    if (roundAdvanced(combat)) {
        activeTurnReminders
            .forEach(reminder => reminder.appLinks
                .forEach(appLink =>
                    renderAppLink(appLink)
                )
            );
    }

}

export function timerReminders() {

    if (timerReminders.intervalIds) {
        timerReminders.intervalIds.forEach(id => clearInterval(id));
    }

    timerReminders.intervalIds = new Set();

    game.settings.get("periodic-reminders", "reminders")
        .filter(reminder => reminder.__type === "TimerReminder" && reminder.isActive)
        .forEach(reminder =>
            timerReminders.intervalIds.add(
                setInterval(
                    () => reminder.appLinks.forEach(appLink => renderAppLink(appLink)),
                    reminder.timing.period * 1000
                )
            )
        );

}

function earlyExitUpdateCombat(combat, update, options) {
    return [
        // the combat hasn't yet been started
        !combat.started,

        // the update is the result of adding a new combatant
        update.hasOwnProperty("initiative"),

        // the update is the result of marking defeated the combatant of the current turn
        update?.defeated && update?._id === combat.combatant.id,

        // the combat has been retreated to a previous turn (previous round or same round but prior turn)
        combat.current.round < combat.previous.round || (combat.current.round === combat.previous.round && combat.current.turn < combat.previous.turn),

        // the update overwrites the combatant data fully
        options.diff && update.combatants
    ].some(Boolean);
}

function startOfCombat(combat) {
    return combat.previous.round == 0 && combat.current.round == 1 && combat.current.turn == 0;
}

function roundAdvanced(combat) {
    return combat.current.round - combat.previous.round === 1;
}