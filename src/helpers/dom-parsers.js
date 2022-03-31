export function parseFicList(html, parser = new DOMParser()) {
    const ficListDom = parser.parseFromString(html, 'text/html');

    return ficListDom.querySelectorAll('article.fanfic-inline');
}

export function getAuthorName() {
    return document.querySelector('.user-name').textContent;
}

export function getTotalFics() {
    const totalFicsCounterSpan = document.querySelector('.sidebar-nav .active .counter');

    return totalFicsCounterSpan ? totalFicsCounterSpan.textContent : 0;
}

export function getFicFiltersContainer() {
    return document.querySelector('#fanficFilter form');
}

export function getAdvancedSearchLink() {
    return getFicFiltersContainer().querySelector('div.small');
}

export function isUserLoggedIn() {
    return !document.querySelector('#jsLogin');
}
