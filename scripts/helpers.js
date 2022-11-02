import { getAppLinkEntity } from "./utils.js";


export function registerHandlebarsHelpers() {
	Handlebars.registerHelper({
		"periodicReminders_appLink":
			(appLink, index) => {
				let appLinkEntity = getAppLinkEntity(appLink);
				return `
					<li class="reminder-row app-link" appLinkId=${appLink._id}>
						<div class="item-image image"${appLinkEntity.data.img ? ` style="background-image: url('${appLinkEntity.data.img}')"` : ``}></div>
						<a class="flexrow title-container" name="appLinkTitleContainer">
							<span>${appLinkEntity.name}</span>
						</a>
						<a class="flexrow icon-container" name="unlink" title="Unlink ${appLinkEntity.name}">
							<i class="fas fa-unlink"></i>
						</a>
					</li>
				`;
			}
	})
}