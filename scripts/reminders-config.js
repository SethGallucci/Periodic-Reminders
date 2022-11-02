import { createReminder } from "./reminder.js"
import { getAppLinkEntity, renderAppLink } from "./utils.js"


export class RemindersConfig extends FormApplication {

    constructor() {
        super();
        this._restoreReminders();
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "Reminders Configuration Menu",
            id: "PeriodicRemindersConfig",
            template: "./modules/periodic-reminders/templates/reminders-config.html",
            dragDrop: [{ dropSelector: ".app-link-list" }],
            width: 420,
            height: "auto",
            resizable: false
        });
    }

    getData(options = {}) {
        let data = super.getData(options);
        data.reminders = this._reminders;
        data.formAppStateRecord = this._formAppStateRecord;
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("input[type!='checkbox']").change((event) => this._updateOnCharacterFieldChange(event));
        html.find("input[type='checkbox']").change((event) => this._updateOnCheckboxChange(event));
        html.find("select").change((event) => this._updateOnSelectChange(event));
        html.find("[name='expand']").click((event) => this._toggleReminderExpansion(event));
        html.find("[name='test']").click((event) => this._testReminder(event));
        html.find("[name='toggle']").click((event) => this._toggleReminder(event));
        html.find("[name='arrange']").click((event) => this._arrangeAppLinkSheets(event));
        html.find("[name='appLinkTitleContainer']").click((event) => this._renderAppLink(event));
        html.find("[name='unlink']").click((event) => this._unlinkAppLink(event));
        html.find("[name='add']").click((event) => this._addReminder(event));
        html.find("[name='revert']").click((event) => this._revertChanges(event));
        html.find("[name='delete']").click((event) => this._deleteReminder(event));
    }

    _restoreReminders(event) {
        if (event) {
            event.preventDefault();
        }
        this._reminders = game.settings.get("periodic-reminders", "reminders").map(r => createReminder(r));
        this._formAppStateRecord = {};
        this._reminders
            .forEach(reminder => {
                this._formAppStateRecord[reminder.id] = { hasFormSettingsHidden: true }
            });
    }

    _getReminderIdFromEvent(event) {
        return $(event.currentTarget).closest("[reminderId]").attr("reminderId");
    }

    _getReminderFromEvent(event) {
        return this._reminders.find(reminder => reminder.id === this._getReminderIdFromEvent(event));
    }

    _getAppLinkIdFromEvent(event) {
        return $(event.currentTarget).closest("[appLinkId]").attr("appLinkId");
    }

    static _appLinkFromAppLinkDropData(data) {

        if (data.pack) {
            return null;
        }

        let appLink = { _id: randomID() };

        if (data.actorId) {
            appLink.actorId = data.actorId;
            appLink.entityId = data.data._id;
        }
        else {
            appLink.entityId = data.id;
        }

        appLink.type = data.type;

        appLink.position = {
            left: null,
            top: null,
            width: null,
            height: null
        };

        return appLink
    }

    static _isAppLinkValid(appLink) {

        try {
            getAppLinkEntity(appLink).sheet.render(false);
        }
        catch (error) {
            ui.notifications.error(error);
            return false;
        }
        return true;
    }

    _onDrop(event) {
        super._onDrop(event);

        let appLinkDropData;
        try {
            appLinkDropData = JSON.parse(event.dataTransfer.getData("text/plain"));
        }
        catch (error) {
            ui.notifications.error(error);
            return;
        }

        let appLink = RemindersConfig._appLinkFromAppLinkDropData(appLinkDropData);

        if (!RemindersConfig._isAppLinkValid(appLink)) {
            ui.notifications.error("Invalid application-link")
            return;
        }

        let reminder = this._getReminderFromEvent(event);
        reminder.appLinks.push(appLink);

        this.render(true);
    }

    _updateOnCharacterFieldChange(event) {
        event.preventDefault();

        let targetElement = $(event.currentTarget);
        let reminder = this._getReminderFromEvent(event);
        let targetElementValue = targetElement.attr("type") === "number" ? Number(targetElement.val()) : targetElement.val();
        mergeObject(reminder, expandObject({ [targetElement.attr("name")]: targetElementValue }));

        this.render(true);
    }

    _updateOnCheckboxChange(event) {
        event.preventDefault();

        let targetElement = $(event.currentTarget);
        let reminder = this._getReminderFromEvent(event);
        mergeObject(reminder, expandObject({ [targetElement.attr("name")]: targetElement.is(":checked") }));

        this.render(true);
    }

    _updateOnSelectChange(event) {
        event.preventDefault();

        let targetElement = $(event.currentTarget);
        let reminder = this._getReminderFromEvent(event);
        let newReminderData = mergeObject(reminder, { __type: targetElement.val() }, { inplace: false });
        let newReminder = createReminder(newReminderData);
        reminder = newReminder;

        this.render(true);
    }

    _toggleReminderExpansion(event) {
        event.preventDefault();
        let self = this;

        let targetElement = $(event.currentTarget);
        targetElement.closest("[reminderId]").find("[name='hideable-settings']").slideToggle(250, function () {
            let reminderId = self._getReminderIdFromEvent(event);
            self._formAppStateRecord[reminderId].hasFormSettingsHidden = $(this).css("display") === "none";
            self.render(true);
        });
    }

    _testReminder(event) {
        event.preventDefault();

        this._getReminderFromEvent(event).appLinks
            .forEach(appLink => renderAppLink(appLink));
    }

    _toggleReminder(event) {
        event.preventDefault();

        let reminder = this._getReminderFromEvent(event)
        reminder.isActive = !reminder.isActive;
        this.render(true);
    }

    _deleteReminder(event) {
        event.preventDefault();

        let reminderId = this._getReminderIdFromEvent(event);
        this._reminders = this._reminders.filter(reminder => reminder.id !== reminderId);
        delete this._formAppStateRecord[reminderId];
        this.render(true);
    }

    async _arrangeAppLinkSheets(event) {
        event.preventDefault();

        super.minimize();

        let appLinks = this._getReminderFromEvent(event).appLinks;

        appLinks
            .forEach(appLink => renderAppLink(appLink));

        await Dialog.prompt({
            title: "Arrange Applications",
            content: `<p>Position and resize the applications as you would like them to appear when this reminder triggers and then click save.</p>`,
            label: "Save",
            callback: () => {
                appLinks
                    .forEach(appLink => {
                        appLink.position = getAppLinkEntity(appLink).sheet.position;
                    });
            },
            rejectClose: false,
            options: { left: 0, top: 0, width: 200 }
        });

        appLinks
            .map(appLink => getAppLinkEntity(appLink).sheet)
            .forEach((appLinkSheet) => appLinkSheet.close());

        super.render(false, { focus: true });
    }

    _renderAppLink(event) {
        event.preventDefault();

        let reminder = this._getReminderFromEvent(event)
        let appLinkId = this._getAppLinkIdFromEvent(event);
        renderAppLink(reminder.appLinks.find(appLink => appLink._id === appLinkId));
    }

    _unlinkAppLink(event) {
        event.preventDefault();

        let reminder = this._getReminderFromEvent(event)
        let appLinkId = this._getAppLinkIdFromEvent(event);
        reminder.appLinks = reminder.appLinks.filter(appLink => appLink._id !== appLinkId);
        this.render(true);
    }

    _addReminder(event) {
        event.preventDefault();

        let reminder = createReminder();
        this._reminders.push(reminder);
        this._formAppStateRecord[reminder.id] = {
            hasFormSettingsHidden: false
        };
        this.render(true);
    }

    _revertChanges(event) {
        event.preventDefault();

        this._restoreReminders();
        this.render(true);
    }

    async _updateObject(event, formData) {
        event.preventDefault();

        await game.settings.set("periodic-reminders", "reminders", this._reminders);
    }

}