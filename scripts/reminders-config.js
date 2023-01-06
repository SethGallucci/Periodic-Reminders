export class RemindersConfig extends FormApplication {

    constructor() {
        super();
        this._restoreReminders();
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: "Reminders Configuration Menu",
            id: "PeriodicRemindersConfig",
            template: "./modules/periodic-reminders/templates/reminders-config.html",
            dragDrop: [{ dropSelector: ".linkdrop" }],
            width: 420,
            height: "auto",
            resizable: false,
            closeOnSubmit: false
        });
    }

    getData(options = {}) {
        const data = super.getData(options);
        data.reminders = Object.values(this._reminders);
        data.formAppStateRecord = this._formAppStateRecord;
        data.triggerSelect = {
            combatStart: "Combat Start",
            login: "Login",
            round: "Round",
            timer: "Timer",
            turn: "Turn"
        };
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("[name='reminderTitle']").change((event) => this._updateOnReminderTitleChange(event));
        html.find("[name='expandReminder']").click((event) => this._toggleReminderExpansion(event));
        html.find("[name='testReminder']").click((event) => this._testReminder(event));
        html.find("[name='toggleReminder']").click((event) => this._toggleReminder(event));
        html.find("[name='addTrigger']").click((event) => this._addTrigger(event));
        html.find("[name='triggerType']").change((event) => this._updateOnTriggerTypeChange(event));
        html.find("[name='triggerPeriod']").change((event) => this._updateOnTriggerPeriodChange(event));
        html.find("[name='triggerTurns']").change((event) => this._updateOnTriggerTurnsChange(event));
        html.find("[name='removeTrigger']").click((event) => this._removeTrigger(event));
        html.find("[name='arrangeAppLinkSheets']").click((event) => this._arrangeAppLinkSheets(event));
        html.find("[name='appLinkTitleContainer']").click((event) => this.renderAppLink(event));
        html.find("[name='unlinkAppLink']").click((event) => this._unlinkAppLink(event));
        html.find("[name='addReminder']").click((event) => this._addReminder(event));
        html.find("[name='revertChanges']").click((event) => this._revertChanges(event));
        html.find("[name='deleteReminder']").click((event) => this._deleteReminder(event));
    }

    _restoreReminders() {
        this._reminders = duplicate(game.user.getFlag("periodic-reminders", "reminders"));
        this._formAppStateRecord = {};
        Object.keys(this._reminders)
            .forEach(id => {
                this._formAppStateRecord[id] = { hasFormSettingsHidden: true }
            });
    }

    _getReminderIdFromEvent(event) {
        return $(event.currentTarget).closest("[reminderId]").attr("reminderId");
    }

    _getReminderFromEvent(event) {
        return this._reminders[this._getReminderIdFromEvent(event)];
    }

    _getAppLinkIdFromEvent(event) {
        return $(event.currentTarget).closest("[appLinkId]").attr("appLinkId");
    }

    _getTriggerIdFromEvent(event) {
        return $(event.currentTarget).closest("[triggerId]").attr("triggerId");
    }

    static async _getAppLinkDocument(appLink) {
        return await fromUuid(appLink.uuid);
    }

    static async _renderAppLink(appLink) {

        const options = {
            focus: true,
            left: appLink?.position?.left ?? null,
            top: appLink?.position?.top ?? null,
            width: appLink?.position?.width ?? 0,
            height: appLink?.position?.height ?? 0
        };

        (await RemindersConfig._getAppLinkDocument(appLink)).sheet.render(true, options);
    }

    async _onDrop(event) {
        super._onDrop(event);

        let uuid;
        try {
            uuid = JSON.parse(event.dataTransfer.getData("text/plain")).uuid;
            fromUuidSync(uuid);
        }
        catch (error) {
            ui.notifications.error(error);
            return;
        }

        const reminder = this._getReminderFromEvent(event);
        const id = randomID();
        reminder.appLinks[id] = {
            id: id,
            uuid: uuid,
            position: {
                left: null,
                top: null,
                width: 0,
                height: 0
            }
        };

        this.render(true);
    }

    _updateOnReminderTitleChange(event) {
        event.preventDefault();

        const targetElement = $(event.currentTarget);
        const reminder = this._getReminderFromEvent(event);
        reminder.title = targetElement.val();

        this.render(true);
    }

    _toggleReminderExpansion(event) {
        event.preventDefault();

        const self = this;
        const targetElement = $(event.currentTarget);
        targetElement.closest("[reminderId]").find("[name='hideable-settings']").slideToggle(250, function () {
            const reminderId = self._getReminderIdFromEvent(event);
            self._formAppStateRecord[reminderId].hasFormSettingsHidden = $(this).css("display") === "none";
            self.render(true);
        });
    }

    _testReminder(event) {
        event.preventDefault();

        const reminder = this._getReminderFromEvent(event);
        Object.values(reminder.appLinks)
            .forEach(a => RemindersConfig._renderAppLink(a));
    }

    _toggleReminder(event) {
        event.preventDefault();

        const reminder = this._getReminderFromEvent(event);
        reminder.isActive = !reminder.isActive;

        this.render(true);
    }

    _deleteReminder(event) {
        event.preventDefault();

        const reminderId = this._getReminderIdFromEvent(event);
        delete this._reminders[reminderId];
        delete this._formAppStateRecord[reminderId];

        this.render(true);
    }

    _addTrigger(event) {
        event.preventDefault();

        const reminder = this._getReminderFromEvent(event);

        const id = randomID();
        reminder.triggers[id] = {
            id: id,
            type: "timer",
            period: 5,
            intervalId: null
        };

        this.render(true);
    }

    _updateOnTriggerTypeChange(event) {
        event.preventDefault();

        const targetElement = $(event.currentTarget);
        const reminder = this._getReminderFromEvent(event);
        const triggerId = this._getTriggerIdFromEvent(event);

        const updatedTrigger = {
            id: triggerId,
            type: targetElement.val()
        };

        switch (updatedTrigger.type) {
            case "combatStart":
                break;
            case "login":
                break;
            case "round":
                break;
            case "timer":
                updatedTrigger.period = 5;
                updatedTrigger.intervalId = null;
            case "turn":
                updatedTrigger.turns = 0;
        }

        reminder.triggers[triggerId] = updatedTrigger;

        this.render(true);
    }

    _updateOnTriggerPeriodChange(event) {
        event.preventDefault();

        const targetElement = $(event.currentTarget);
        const reminder = this._getReminderFromEvent(event);
        const triggerId = this._getTriggerIdFromEvent(event);

        reminder.triggers[triggerId].period = Number(targetElement.val());

        this.render(true);
    }

    _updateOnTriggerTurnsChange(event) {
        event.preventDefault();

        const targetElement = $(event.currentTarget);
        const reminder = this._getReminderFromEvent(event);
        const triggerId = this._getTriggerIdFromEvent(event);

        reminder.triggers[triggerId].turns = Number(targetElement.val());

        this.render(true);
    }

    _removeTrigger(event) {
        event.preventDefault();

        const reminder = this._getReminderFromEvent(event);
        const triggerId = this._getTriggerIdFromEvent(event);
        delete reminder.triggers[triggerId];

        this.render(true);
    }

    async _arrangeAppLinkSheets(event) {
        event.preventDefault();

        super.minimize();

        const reminder = this._getReminderFromEvent(event);
        const appLinks = Object.values(reminder.appLinks);
        Object.values(reminder.appLinks)
            .forEach(a => RemindersConfig._renderAppLink(a));

        const linkDocPairs = await Promise.all(appLinks.map(async a => Object({
            appLink: a,
            document: await RemindersConfig._getAppLinkDocument(a)
        })));

        await Dialog.prompt({
            title: "Arrange Applications",
            content: `<p>Position and resize the applications as you would like them to appear when this reminder triggers and then click save.</p>`,
            label: "Save",
            callback: () => {
                linkDocPairs
                    .forEach(p => {
                        p.appLink.position = Object.fromEntries(Object.entries(p.document.sheet.position)
                            .filter(([key, value]) => ["left", "top", "width", "height"].includes(key))
                        );
                    });
            },
            rejectClose: false,
            options: { left: 0, top: 0, width: 200 }
        });

        linkDocPairs.forEach(p => p.document.sheet.close());

        super.render(false, { focus: true });
    }

    async renderAppLink(event) {
        event.preventDefault();

        const reminder = this._getReminderFromEvent(event);
        const appLinkId = this._getAppLinkIdFromEvent(event);
        await RemindersConfig._renderAppLink(reminder.appLinks[appLinkId]);
    }

    _unlinkAppLink(event) {
        event.preventDefault();

        const reminder = this._getReminderFromEvent(event);
        const appLinkId = this._getAppLinkIdFromEvent(event);
        delete reminder.appLinks[appLinkId];

        this.render(true);
    }

    _addReminder(event) {
        event.preventDefault();

        const id = randomID();
        this._reminders[id] = {
            id: id,
            title: "",
            isActive: true,
            triggers: {},
            appLinks: {}
        };
        this._formAppStateRecord[id] = {
            hasFormSettingsHidden: false
        };

        this.render(true);
    }

    _revertChanges(event) {
        event.preventDefault();

        this._restoreReminders();

        this.render(true);
    }

    async _updateObject(event) {
        event.preventDefault();

        const oldReminders = game.user.getFlag("periodic-reminders", "reminders");
        const newReminders = this._reminders;

        // OLD REMINDERS - INTERVAL CLEARING
        Object.values(oldReminders).forEach(r => {

            // Reminder was deleted
            if (!newReminders[r.id]) {
                Object.values(r.triggers)
                    .filter(t => t.type === "timer")
                    .forEach(t => {
                        clearInterval(t.intervalId);
                    });
            }

            // Reminder was deactivated
            else if (r.isActive && !newReminders[r.id].isActive) {
                Object.values(r.triggers)
                    .filter(t => t.type === "timer")
                    .forEach(t => {
                        clearInterval(t.intervalId);
                    });
                Object.values(newReminders[r.id].triggers)
                    .filter(t => t.type === "timer")
                    .forEach(t => {
                        t.intervalId = null;
                    });
            }

            // Reminder remained active
            else if (r.isActive && newReminders[r.id].isActive) {
                Object.values(r.triggers)
                    .filter(t => t.type === "timer")
                    .forEach(t => {

                        // Trigger was removed
                        if (!newReminders[r.id].triggers[t.id]) {
                            clearInterval(t.intervalId);
                        }

                        // Trigger period was modified
                        else if (t.period !== newReminders[r.id].triggers[t.id].period) {
                            clearInterval(t.intervalId);
                            newReminders[r.id].triggers[t.id].intervalId = null;
                        }
                    });
            }
        });

        // NEW REMINDERS - INTERVAL SETTING
        Object.values(newReminders).forEach(r => {

            // Reminder was added
            if (!oldReminders[r.id]) {
                Object.values(r.triggers)
                    .filter(t => t.type === "timer")
                    .forEach(t => {
                        t.intervalId = setInterval(
                            () => Object.values(game.user.getFlag("periodic-reminders", "reminders")[r.id].appLinks)
                                .forEach(a => RemindersConfig._renderAppLink(a)),
                            60 * 1000 * t.period
                        )
                    });
            }

            // Reminder was activated
            else if (!oldReminders[r.id].isActive && r.isActive) {
                Object.values(r.triggers)
                    .filter(t => t.type === "timer")
                    .forEach(t => {
                        t.intervalId = setInterval(
                            () => Object.values(game.user.getFlag("periodic-reminders", "reminders")[r.id].appLinks)
                                .forEach(a => RemindersConfig._renderAppLink(a)),
                            60 * 1000 * t.period
                        )
                    });
            }

            // Reminder remained active
            else if (r.isActive && newReminders[r.id].isActive) {
                Object.values(r.triggers)
                    .filter(t => t.type === "timer")
                    .forEach(t => {

                        // Trigger was added
                        if (!oldReminders[r.id].triggers[t.id]) {
                            t.intervalId = setInterval(
                                () => Object.values(game.user.getFlag("periodic-reminders", "reminders")[r.id].appLinks)
                                    .forEach(a => RemindersConfig._renderAppLink(a)),
                                60 * 1000 * t.period
                            )
                        }

                        // Trigger period was modified
                        else if (t.period !== oldReminders[r.id].triggers[t.id].period) {
                            t.intervalId = setInterval(
                                () => Object.values(game.user.getFlag("periodic-reminders", "reminders")[r.id].appLinks)
                                    .forEach(a => RemindersConfig._renderAppLink(a)),
                                60 * 1000 * t.period
                            )
                        }
                    });
            }

        });

        await game.user.update(
            { "flags.periodic-reminders.reminders": this._reminders },
            { diff: false, recursive: false }
        );

        ui.notifications.info("Reminders updated.");
    }

}