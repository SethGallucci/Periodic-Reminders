export class TimersConfig extends FormApplication{
    
    constructor(){
        super();
        this._reminders = duplicate(game.settings.get("periodic-reminders", "reminders"));
    }

    static get defaultOptions(){
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "TITLE FROM DEFAULT OPTIONS",
            template: "./modules/periodic-reminders/scripts/timers-config-template.html",
            width: 600,
            height: "auto",
            resizable: false
        });
    }
    
    getData(options={}){
        let data = super.getData(options);
        data.reminders = this._reminders;
        return data;
    }

    activateListeners(html){
        super.activateListeners(html);

        for( let button of html.find("button[name='revert']")){
            button.onclick = () => {
                this._reminders = duplicate(game.settings.get("periodic-reminders", "reminders"));
                this.render(true);
            };
        }

        html.find("button[name='add']").click(() => {
            this._reminders = this._getCurrentFormData();
            this._reminders.push({
                text: "",
                period: 300
            });
            this.render(true);
        });

        for( let button of html.find("button[name='delete']")){
            button.onclick = () => {
                this._reminders = this._getCurrentFormData();
                this._reminders.splice(Number($(button).parent().attr("data-reminder-index")), 1);
                this.render(true);
            };
        }
    }

    _getCurrentFormData(){
        const formRows = [];
        this.element.find(".periodic-reminders-row").each(function(index){
            formRows[index] = {
                text: $(this).find("textarea").val(),
                period: Number($(this).find("input").val())
            };
        });
        return formRows;
    }

    _revert(){
        this._reminders = game.settings.get("periodic-reminders", "reminders");
        this.render(true);
    }

    async _updateObject(event, formData){
        await game.settings.set("periodic-reminders", "reminders", this._getCurrentFormData());
    }

}
