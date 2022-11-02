export function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}


export function modEquivalent(a, b, m) {
    return (a - b) - m * Math.floor((a - b) / m) === 0;
}

export function getAppLinkEntity(appLink){
    if (appLink.actorId) {
        return game.actors.get(appLink.actorId).items.get(appLink.entityId);
    }
    else {
        return game.collections.get(appLink.type).get(appLink.entityId);
    }
}

export function renderAppLink(appLink) {

    let options = { focus: true };
    if (appLink.position.left !== null) options.left = appLink.position.left;
    if (appLink.position.top !== null) options.top = appLink.position.top;
    if (appLink.position.width !== null) options.width = appLink.position.width;
    if (appLink.position.height !== null) options.height = appLink.position.height;

    getAppLinkEntity(appLink).sheet.render(true, options);
}