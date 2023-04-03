import { registerHandlebarsHelpers } from "./helpers.js";
import { clamp, modEquivalent } from "./utils.js";
import { RemindersConfig } from "./reminders-config.js"


export function activateHooks() {

    Hooks.on("ready", async () => {

        // Make sure the flag is defined.
        if (!game.user.getFlag("periodic-reminders", "reminders")) {
            await game.user.update({ "flags.periodic-reminders.reminders": {} });
        }

        registerHandlebarsHelpers();
        loginReminders();
        await timerReminders();
    });

    Hooks.on("updateCombat", (combat, change, options, userId) => {

        if (combat.previous.round === 0 && combat.current.round === 1) {
            combatStartReminders(combat);
        }

        if (combat.previous.round < combat.current.round) {
            combatRoundReminders(combat);
        }

        if (combat.previous.round < combat.current.round || options?.direction > 0) {
            combatTurnReminders(combat);
        }

    });

    Hooks.on("getSceneControlButtons", (layerControls) => {

        layerControls
            .find(c => c.name === "notes")
            .tools
            .push({
                name: "Reminders Config",
                title: "Configure Reminders",
                icon: "fa-solid fa-bell",
                toggle: false,
                button: true,
                onClick: () => (new RemindersConfig()).render(true)
            });

    });

}


function loginReminders() {

    Object.values(game.user.getFlag("periodic-reminders", "reminders"))
        .filter(r => r.isActive)
        .filter(r => Object.values(r.triggers)
            .map(t => t.type)
            .includes("login")
        )
        .forEach(r =>
            Object.values(game.user.getFlag("periodic-reminders", "reminders")[r.id].appLinks)
                .forEach(a => RemindersConfig._renderAppLink(a))
        );
}

async function timerReminders() {

    const reminders = duplicate(game.user.getFlag("periodic-reminders", "reminders"));

    Object.values(reminders)
        .filter(r => r.isActive)
        .forEach(r => {
            Object.values(r.triggers)
                .filter(t => t.hasOwnProperty("period"))
                .forEach(t => {
                    t.intervalId = setInterval(
                        () => Object.values(game.user.getFlag("periodic-reminders", "reminders")[r.id].appLinks)
                            .forEach(a => RemindersConfig._renderAppLink(a)),
                        60 * 1000 * t.period
                    );
                });
        });

    await game.user.update(
        { "flags.periodic-reminders.reminders": reminders },
        { diff: false, recursive: false }
    );
}

function combatStartReminders(combat) {
    if (game.user.isGM || combat.combatants.find(c => c.actor.id === game.user?.character?.id)) {
        Object.values(game.user.getFlag("periodic-reminders", "reminders"))
            .filter(r => r.isActive)
            .forEach(r => {
                if (Object.values(r.triggers).some(t => t.type === "combatStart")) {
                    Object.values(r.appLinks).forEach(a => RemindersConfig._renderAppLink(a));
                }
            });
    }
}

function combatRoundReminders(combat) {
    if (game.user.isGM || combat.combatants.find(c => c.actor.id === game.user?.character?.id)) {
        Object.values(game.user.getFlag("periodic-reminders", "reminders"))
            .filter(r => r.isActive)
            .forEach(r => {
                if (Object.values(r.triggers).some(t => t.type === "round")) {
                    Object.values(r.appLinks).forEach(a => RemindersConfig._renderAppLink(a));
                }
            });
    }
}

function combatTurnReminders(combat) {

    const userCombatants = combat.combatants.filter(c => c.actor.id === game.user?.character?.id);

    if (userCombatants.some(c => !c.defeated)) {

        const undefeatedTurns = combat.turns.filter(combatant => !combatant.defeated);
        const userTurns = undefeatedTurns
            .map((c, i) => userCombatants.includes(c) ? i : null)
            .filter(t => t !== null);

        const currentUndefeatedTurn = undefeatedTurns.indexOf(combat.combatant);
        const relativeTimings = userTurns.map(t => currentUndefeatedTurn - t);
        const UTL = undefeatedTurns.length;

        Object.values(game.user.getFlag("periodic-reminders", "reminders"))
            .filter(r => r.isActive)
            .forEach(r => {
                const shouldTrigger = Object.values(r.triggers)
                    .filter(t => t.type === "turn")
                    .some(tr =>
                        relativeTimings.some(ti => modEquivalent(clamp(tr.turns, -UTL + 1, UTL - 1), ti, UTL))
                    );

                if (shouldTrigger) {
                    Object.values(r.appLinks).forEach(a => RemindersConfig._renderAppLink(a));
                }
            });
    }
}