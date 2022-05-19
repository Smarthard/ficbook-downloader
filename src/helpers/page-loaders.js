import { parseFicList } from './dom-parsers';
import { getEntityIdFromUrl } from './index';

export function getFicsListPageByAuthorId(authorId, page) {
    const url = new URL(`https://ficbook.net/authors/${authorId}/profile/works`);

    if (page && page > 1) {
        url.searchParams.append('p', page);
    }

    return fetch(url.toString())
        .then((res) => res.text())
        .catch((e) => {
            console.warn(e);

            return null;
        });
}

export function getFicDownloadPageBydId(ficId) {
    return fetch(`https://ficbook.net/readfic/${ficId}/download`)
        .then((res) => res.text())
        .catch((e) => {
            console.warn(e);

            return null;
        });
}

export async function getFicDataById(ficId, ficName, fileExt) {
    const ficDownloadPage = await getFicDownloadPageBydId(ficId);
    const dom = new DOMParser();
    const body = new FormData();
    const html = dom.parseFromString(ficDownloadPage, 'text/html');
    const [ txt, epub, pdf, fb2 ] = html.querySelectorAll('.fanfic-download-option');
    let selectedExt;

    switch (fileExt) {
        case 'txt':
            selectedExt = txt;
            break;
        case 'epub':
            selectedExt = epub;
            break;
        case 'pdf':
            selectedExt = pdf;
            break;
        default:
            selectedExt = fb2;
            break;
    }

    const csrfTokenInput = selectedExt.querySelector('input[name="tokenn"]');
    ficId = Number(ficId);

    if (!csrfTokenInput) {
        throw new Error(`Cannot find CSRF token for fic #${ficId} ${ficName}`);
    }

    // the hashing algorithm is reverse-engineered from ficbook sources
    const hash = [ ...csrfTokenInput.value ]
        .map((tokenChar) => parseInt(tokenChar, 8))
        .filter((tokenCharAsOct) => !isNaN(tokenCharAsOct))
        .reduce((octalDigit, acc) => octalDigit + acc);
    const hashedFieldName = hash + ficId;
    const hashedFieldValue = ficId ^ hash + 1;

    body.append('fanfic_id', ficId);
    body.append('tokenn', csrfTokenInput.value);
    body.append(hashedFieldName, hashedFieldValue);

    return fetch(`https://ficbook.net/fanfic_download/${fileExt}`, { method: 'POST', body })
        .then((res) => res.arrayBuffer())
        .catch((err) => err);
}

export async function getFicIdsAndNamesByAuthorId(authorId, totalFics = 0) {
    const ficIdsAndNames = [];
    const ficPages = Math.floor(totalFics / 20) + 1;
    const domParser = new DOMParser();

    for (let page = 1; page <= ficPages; page++) {
        const fics = await getFicsListPageByAuthorId(authorId, page);
        const ficDomList = fics ? parseFicList(fics, domParser) : [];

        for (const fic of ficDomList) {
            const link = fic.querySelector('.fanfic-inline-title a');

            ficIdsAndNames.push([ getEntityIdFromUrl(link.href), link.textContent ]);
        }
    }

    return ficIdsAndNames;
}
