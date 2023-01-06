export function registerHandlebarsHelpers() {

	Handlebars.registerHelper({
		"periodicReminders_appLink":
			(appLink) => {

				const { img, thumb, name } = fromUuidSync(appLink.uuid);
				return `
					<li class="app-link" appLinkId="${appLink.id}">
						<div class="image" ${img ?? thumb ? ` style="background-image: url('${img ?? thumb}')"` : ``}></div>
						<a name="appLinkTitleContainer">
							<div class="name">${name}</div>
						</a>
						<a name="unlinkAppLink" title="Unlink ${name}">
							<i class="fas fa-unlink"></i>
						</a>
					</li>
				`;
			}
	});
}