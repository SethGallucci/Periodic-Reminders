class Reminder {

    constructor(options = {}) {
        if (this.constructor === Reminder) {
            throw new Error("'Reminder' is an abstract class. It cannot be instantiated.");
        }

        this.__type = this.constructor.name;

        this._id = options?._id ?? randomID();

        this.title = options?.title ?? "";
        this.isActive = options?.isActive ?? true;
        this.appLinks = options?.appLinks ?? [];
    }

    get type() {
        return this.__type;
    }

    get id() {
        return this._id;
    }

}


class TimerReminder extends Reminder {
    constructor(options = {}) {
        super(options);

        this.timing = {
            period: options?.timing?.period ?? null,
            isCombatOnly: options?.timing?.isCombatOnly ?? false,
            onCombatStart: options?.timing?.onCombatStart ?? false
        };
    }
}


class TurnReminder extends Reminder {
    constructor(options = {}) {
        super(options);

        this.timing = {
            turns: options?.timing?.turns ?? 0,
            onCombatStart: options?.timing?.onCombatStart ?? true
        };
    }
}


class RoundReminder extends Reminder {
    constructor(options = {}) {
        super(options);
    }
}


class LoginReminder extends Reminder {
    constructor(options = {}) {
        super(options);
    }
}


export function createReminder(options = {}) {
    switch (options.__type) {

        case "TimerReminder":
            return new TimerReminder(options);
        case "TurnReminder":
            return new TurnReminder(options);
        case "RoundReminder":
            return new RoundReminder(options);
        case "LoginReminder":
            return new LoginReminder(options);

        default:
            return new TimerReminder(options);
    }
}