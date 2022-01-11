export function parseFicList(html, parser = new DOMParser()) {
    const ficListDom = parser.parseFromString(html, 'text/html');

    return ficListDom.querySelectorAll('article.fanfic-inline');
}

export function getAuthorName() {
    return document.querySelector('#main h1').textContent;
}

export function getTotalFics() {
    const totalFicsCounterSpan = document.querySelector('#profile-tabs .active .counter');

    return totalFicsCounterSpan ? totalFicsCounterSpan.textContent : 0;
}

export function getFicFiltersContainer() {
    return document.querySelector('#fanficFilter form');
}

export function getAdvancedSearchLink() {
    return getFicFiltersContainer().querySelector('div.small');
}
