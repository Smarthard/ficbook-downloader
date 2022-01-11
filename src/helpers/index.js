export function getEntityIdFromUrl(url) {
    const [ entityId ] = `${url}`.match(/\d+/);

    return entityId;
}

export function trimDots(str) {
    return str.trim().replace(/^[.]+|[.]+$/g, '');
}
